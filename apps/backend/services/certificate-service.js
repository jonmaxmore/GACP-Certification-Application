const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

/**
 * Certificate Service
 * Handles generation and management of GACP Certificates.
 */
class CertificateService {

    /**
     * Generate a new Certificate for an approved Application
     * @param {string} applicationId 
     * @param {string} staffId 
     */
    async generateCertificate(applicationId, staffId) {
        console.log(`[Certificate] Generating for App: ${applicationId}`);

        // 1. Fetch Application with Farmer details
        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { farmer: true },
        });

        if (!app) { throw new Error('Application not found'); }
        if (app.status !== 'APPROVED') { throw new Error('Application must be APPROVED first'); }

        // 2. Check overlap? (Skip for now, assume valid)

        // --- NEW: Auto-Create Farm if not exists (Certificate unlocks Farm) ---
        // Verify if a Farm is already linked or found by similar data
        // For simplicity in this logic: Always create a NEW Farm record for this certificate 
        // OR find an existing one if the user already has one at this address?
        // User Policy: "Farm is asset unlocked by license". 
        // So we create the asset now.

        // Extract Location Data
        const locData = app.formData?.locationData || {};
        const prodData = app.formData?.productionData || {};

        const farm = await prisma.farm.create({
            data: {
                ownerId: app.farmerId,
                farmName: app.formData?.plantName ? `${app.formData.plantName} Farm` : 'Certified Farm',
                farmType: 'CULTIVATION', // Default
                address: locData.address || 'Unknown',
                province: locData.province || 'Unknown',
                district: locData.district || 'Unknown',
                subDistrict: locData.subDistrict || 'Unknown',
                postalCode: locData.zipCode || '00000',
                totalArea: parseFloat(prodData.growingArea) || 0,
                cultivationArea: parseFloat(prodData.growingArea) || 0,
                cultivationMethod: 'INDOOR', // Default or from form
                status: 'VERIFIED', // It is verified by this certificate
                verifiedAt: new Date(),
                verifiedBy: staffId,
            },
        });

        console.log(`[Certificate] Auto-Created Farm: ${farm.id}`);

        // 3. Generate Certificate Number
        // Format: GACP-TH-{YEAR}-{RUNNING_NO} (e.g. GACP-TH-2569-00001)
        const year = new Date().getFullYear() + 543; // Buddhist Year
        const count = await prisma.certificate.count() + 1;
        const certNumber = `GACP-TH-${year}-${String(count).padStart(5, '0')}`;

        // 4. Calculate Dates
        const issuedDate = new Date();
        const validYears = 3; // Standard GACP
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + validYears);

        // 5. Generate Verification Code (8 chars alphanumeric)
        const verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        // 6. Create Certificate Record
        const certificate = await prisma.certificate.create({
            data: {
                certificateNumber: certNumber,
                verificationCode: verificationCode,
                qrData: `https://dtam.moph.go.th/verify/${certNumber}`, // Mock Verification URL

                applicationId: app.id,
                userId: app.farmerId,

                // Farm Info (Linked to the new Farm)
                farmId: farm.id,
                farmName: farm.farmName,
                farmerName: `${app.farmer.firstName} ${app.farmer.lastName}`,
                cropType: app.formData?.plantName || 'Herb',
                farmSize: farm.cultivationArea,

                // Location
                province: app.formData?.locationData?.province || 'Unknown',
                district: app.formData?.locationData?.district || '-',
                subDistrict: app.formData?.locationData?.subDistrict || '-',
                address: app.formData?.locationData?.address || '-',

                // Standard
                standardName: 'GACP Thailand',
                standardId: 'GACP-TH', // Legacy
                score: 100, // Perfect pass or from audit result?

                // Dates
                validityYears: validYears,
                issuedDate: issuedDate,
                expiryDate: expiryDate,
                issuedBy: staffId || 'SYSTEM',
                status: 'active',
            },
        });


        console.log(`[Certificate] Created: ${certNumber}`);

        // --- NEW: Auto-Create Initial Planting Cycle & Batch & QR ---
        // This ensures the farmer has "Ready-to-Use" assets immediately.
        try {
            await this.createInitialAssets(app, farm, certificate, issuedDate);
        } catch (err) {
            console.error('[Certificate] Failed to create initial assets:', err);
            // Don't fail the whole certificate generation, just log error
        }

        return certificate;
    }

    /**
     * Create Initial Planting Cycle and Batch for a new Farm
     */
    async createInitialAssets(app, farm, certificate, issuedDate) {
        const QRCodeService = require('./qrcode/qrcode-service');

        // 1. Find Plant Species (Try name match or default)
        const plantName = app.formData?.plantName || 'Unknown';
        let species = await prisma.plantSpecies.findFirst({
            where: { nameTH: plantName },
        });

        if (!species) {
            // Fallback: Find ANY species or create a placeholder if empty
            species = await prisma.plantSpecies.findFirst();
        }

        if (!species) {
            console.error('[Certificate] CRITICAL: No Plant Species found for initial asset creation. Aborting.');
            return;
        }
        console.log(`[Certificate] Found Species: ${species.nameTH} (ID: ${species.id})`);

        // 2. Create Planting Cycle
        const year = new Date().getFullYear() + 543;
        console.log('[Certificate] Creating PlantingCycle...');
        let cycle;
        try {
            cycle = await prisma.plantingCycle.create({
                data: {
                    cycleName: `Featured Cycle 1/${year}`,
                    cycleNumber: 1,
                    farmId: farm.id,
                    certificateId: certificate.id,
                    plantSpeciesId: species.id,
                    startDate: issuedDate, // Started today
                    status: 'PLANTED', // Active immediately
                    cultivationType: farm.cultivationMethod || 'SELF_GROWN',
                    notes: 'Auto-generated upon Certification',
                },
            });
            console.log(`[Certificate] Auto-Created Cycle: ${cycle.id}`);
        } catch (cycleErr) {
            console.error('[Certificate] Failed to create PlantingCycle:', cycleErr);
            throw cycleErr; // Re-throw to catch in main try/catch covering createInitialAssets
        }

        // 3. Create Harvest Batch (The "Lot")
        const batchNumber = `LOT-${year}-${farm.id.substring(0, 4).toUpperCase()}-001`; // Simple unique logic
        const batch = await prisma.harvestBatch.create({
            data: {
                batchNumber: batchNumber,
                farmId: farm.id,
                speciesId: species.id,
                cycleId: cycle.id,
                plantingDate: issuedDate,
                cultivationType: farm.cultivationMethod || 'SELF_GROWN',
                status: 'GROWING', // Ready for tracking
                notes: 'Initial Batch from Certification',
            },
        });

        // 4. Generate QR Code for this Batch
        const qrResult = await QRCodeService.generateForRecord('BATCH', batch.id);

        // Update Batch with QR Data
        await prisma.harvestBatch.update({
            where: { id: batch.id },
            data: {
                qrCode: qrResult.qrCode,
                trackingUrl: qrResult.trackingUrl,
            },
        });

        console.log(`[Certificate] Auto-Created Batch: ${batchNumber} with QR`);
    }

    /**
     * Generate PDF Buffer for a Certificate
     * @param {string} certificateId 
     * @returns {Promise<Buffer>}
     */
    async getCertificatePdf(certificateId) {
        const cert = await prisma.certificate.findUnique({ where: { id: certificateId } });
        if (!cert) { throw new Error('Certificate not found'); }

        const pdfService = require('./pdf-service');
        return await pdfService.generateCertificatePdf(cert);
    }
}

module.exports = new CertificateService();
