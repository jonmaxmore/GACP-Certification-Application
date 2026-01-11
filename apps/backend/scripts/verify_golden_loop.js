
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

// --- Configuration ---
const API_URL = 'http://localhost:5000/api';
const MOCK_EMAIL = `golden_${Date.now()}@example.com`;
const MOCK_PASS = 'password123';

async function main() {
    console.log(`🚀 STARTING GOLDEN LOOP VERIFICATION (${MOCK_EMAIL})`);

    // DEBUG PRISMA
    console.log('--- PRISMA CLIENT DEBUG ---');
    try {
        const keys = Object.keys(prisma);
        const filtered = keys.filter(k => !k.startsWith('_') && !k.startsWith('$'));
        console.log('Available Models:', filtered);
        console.log('Has PlantingCycle?', keys.includes('plantingCycle') || keys.includes('PlantingCycle'));
    } catch (e) { console.error('Prisma Debug Error:', e); }
    console.log('---------------------------');

    try {
        // ==========================================
        // 1. REGISTER NEW FARMER
        // ==========================================
        console.log('\n--- 1. Registering Farmer ---');

        // Register
        await axios.post(`${API_URL}/auth-farmer/register`, {
            email: MOCK_EMAIL,
            password: MOCK_PASS,
            firstName: 'Golden',
            lastName: 'Farmer',
            idCard: '11000' + crypto.randomInt(10000000, 99999999),
            phoneNumber: '08' + crypto.randomInt(10000000, 99999999),
        });

        // Login
        const loginRes = await axios.post(`${API_URL}/auth-farmer/login`, {
            email: MOCK_EMAIL,
            password: MOCK_PASS,
        });

        // Handle Nested Response from AuthController
        const body = loginRes.data;
        const data = body.data || body; // Unwrap if exists
        const tokens = data.tokens || data;

        const farmerToken = tokens.accessToken || data.token;
        const user = data.user || data;
        const farmerId = user.id;

        if (!farmerToken || !farmerId) {
            console.error('Login Data:', JSON.stringify(body, null, 2));
            throw new Error('Failed to extract Token or User ID');
        }

        console.log('✅ Registered and Logged in');

        // Verify Identity (Simulate OCR)
        await prisma.user.update({
            where: { id: farmerId },
            data: { verificationStatus: 'APPROVED' },
        });
        console.log('✅ Identity Verified (Mocked)');

        // ==========================================
        // 1.5 REMOVED: Register Farm (Phase 0)
        // ==========================================
        console.log('\n--- 1.5 Skipped Manual Farm Creation (Refactored Flow) ---');

        // ==========================================
        // 2. SUBMIT APPLICATION
        // ==========================================
        console.log('\n--- 2. Submitting Application ---');
        let appRes;
        try {
            appRes = await axios.post(`${API_URL}/applications/draft`, {
                plantId: 'P001',
                plantName: 'Cannabis',
                serviceType: 'CERTIFICATION',
                areaType: 'INDOOR',
                estimatedFee: 5000,
                locationData: {
                    address: '123 Verified Road (Auto-Create)',
                    province: 'Chiang Mai',
                    zipCode: '50000',
                    district: 'Muang',
                    subDistrict: 'Suthep',
                },
                productionData: { growingArea: '100', plantCount: '50' },
                securityData: {},
                documentData: {},
                applicantData: { name: 'Golden Farmer' },
            }, { headers: { Authorization: `Bearer ${farmerToken}` } });

        } catch (e) {
            console.error('Submission Error:', e.response?.data || e.message);
            throw e;
        }

        if (!appRes.data || !appRes.data.data) {
            throw new Error('Application Response missing data');
        }

        const appId = appRes.data.data._id;
        console.log(`✅ Application Submitted: ${appId}`);

        // ==========================================
        // 3. PHASE 1 PAYMENT (Application Fee)
        // ==========================================
        console.log('\n--- 3. Phase 1 Payment ---');
        const inv1 = await prisma.invoice.findFirst({
            where: { applicationId: appId, serviceType: 'APPLICATION_FEE' },
        });
        if (!inv1) { throw new Error('Phase 1 Invoice not created'); }
        console.log(`Invoice 1 Found: ${inv1.invoiceNumber} (${inv1.amount} THB)`);

        await axios.post(`${API_URL}/webhooks/ksher`, {
            mch_order_no: inv1.invoiceNumber,
            result: 'SUCCESS',
            sign: 'mock_signature',
        });
        console.log('✅ Phase 1 Mock Payment Sent');

        const appAfterPay1 = await prisma.application.findUnique({ where: { id: appId } });
        if (appAfterPay1.status === 'PENDING_REVIEW') {
            console.log('✅ Status transitioned to PENDING_REVIEW');
        } else {
            throw new Error(`Expected PENDING_REVIEW, got ${appAfterPay1.status}`);
        }

        // ==========================================
        // 4. STAFF APPROVE DOCS (Trigger Phase 2)
        // ==========================================
        console.log('\n--- 4. Staff Document Review ---');

        await prisma.application.update({
            where: { id: appId },
            data: { status: 'PAYMENT_2_PENDING', phase2Status: 'PENDING' },
        });

        await prisma.invoice.create({
            data: {
                invoiceNumber: `INV-P2-${Date.now()}`,
                subtotal: 25000,
                totalAmount: 25000,
                serviceType: 'AUDIT_FEE',
                status: 'pending',
                farmer: { connect: { id: farmerId } }, // Use connect
                application: { connect: { id: appId } }, // Use connect
                dueDate: new Date(),
            },
        });
        console.log('✅ Staff Approved (Simulated) & Phase 2 Invoice Created');

        // ==========================================
        // 5. PHASE 2 PAYMENT (Audit Fee)
        // ==========================================
        console.log('\n--- 5. Phase 2 Payment ---');
        const inv2 = await prisma.invoice.findFirst({
            where: { applicationId: appId, serviceType: 'AUDIT_FEE' },
        });
        if (!inv2) { throw new Error('Phase 2 Invoice not found'); }
        console.log(`Invoice 2 Found: ${inv2.invoiceNumber}`);

        await axios.post(`${API_URL}/webhooks/ksher`, {
            mch_order_no: inv2.invoiceNumber,
            result: 'SUCCESS',
            sign: 'mock_signature',
        });
        console.log('✅ Phase 2 Mock Payment Sent');

        const appAfterPay2 = await prisma.application.findUnique({ where: { id: appId } });
        if (appAfterPay2.status === 'PENDING_AUDIT') {
            console.log('✅ Status transitioned to PENDING_AUDIT');
        } else {
            throw new Error(`Expected PENDING_AUDIT, got ${appAfterPay2.status}`);
        }

        // ==========================================
        // 6. SCHEDULE AUDIT
        // ==========================================
        console.log('\n--- 6. Staff Schedule Audit ---');
        await prisma.application.update({
            where: { id: appId },
            data: {
                status: 'AUDIT_SCHEDULED',
                scheduledDate: new Date(),
            },
        });
        console.log('✅ Audit Scheduled (Simulated)');

        // ==========================================
        // 7. AUDIT PASS (Status -> APPROVED)
        // ==========================================
        console.log('\n--- 7. Audit Pass (Status -> APPROVED) ---');
        await prisma.application.update({
            where: { id: appId },
            data: {
                status: 'APPROVED',
                auditResult: 'PASSED',
                auditNotes: 'Verified by Golden Loop Script',
            },
        });
        console.log('✅ Application Approved');

        // ==========================================
        // 8. GENERATE CERTIFICATE
        // ==========================================
        console.log('\n--- 8. Generate Certificate & Assets ---');
        const certificateService = require('../services/certificate-service');
        const adminUser = await prisma.dTAMStaff.findFirst() || await prisma.user.findFirst(); // Fallback if staff not found
        console.log('Generating Certificate... this should trigger Farm Creation.');

        let cert;
        try {
            cert = await certificateService.generateCertificate(appId, adminUser?.id || 'SYSTEM');
        } catch (genError) {
            console.error('❌ Certificate Generation Failed:', genError);
            console.error(genError.stack);
            throw genError;
        }

        console.log(`✅ Certificate Generated: ${cert.certificateNumber}`);

        // ==========================================
        // 8. VERIFY CERTIFICATE & AUTO-CREATED FARM
        // ==========================================
        const dbCert = await prisma.certificate.findUnique({ where: { id: cert.id } });
        if (!dbCert) { throw new Error('Certificate not in DB'); }
        console.log('✅ Certificate persisted in DB');

        if (!dbCert.farmId) { throw new Error('Certificate does not have a Farm ID'); }

        // Check if Farm was created
        const autoFarm = await prisma.farm.findUnique({ where: { id: dbCert.farmId } });
        if (!autoFarm) { throw new Error(`Farm ID ${dbCert.farmId} in certificate does not exist in Farm table`); }

        console.log(`✅ Auto-Created Farm Verified: ${autoFarm.farmName} (${autoFarm.id})`);
        console.log(`   Address: ${autoFarm.address}, ${autoFarm.province}`);

        // Verify QR Code Generation for this new Farm
        console.log('\n--- Verifying POST-CERTIFICATION QR Code ---');
        const qrRes = await axios.get(`${API_URL}/farms/${autoFarm.id}/qrcode`, {
            headers: { Authorization: `Bearer ${farmerToken}` },
        });
        if (qrRes.data.includes('QR Code') && qrRes.data.includes('public-verification-link')) {
            console.log('✅ QR Code HTML Generated for Auto-Farm');
        } else {
            console.warn('⚠️ QR Code generated but content might be missing specific keywords.');
        }

        // ==========================================
        // 9. VERIFY AUTO-CREATED ASSETS (CYCLE & BATCH)
        // ==========================================
        console.log('\n--- 9. Verifying Automated Initial Assets ---');

        // DEBUG: Check available models
        // console.log('Prisma Models:', Object.keys(prisma)); // Internal prop might be different
        // Check if plantingCycle exists
        if (!prisma.plantingCycle) {
            console.error('❌ prisma.plantingCycle is UNDEFINED. Available keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
            // Fallback for debugging: maybe it's plantingCycles?
        }

        const autoCycle = await prisma.plantingCycle.findFirst({ where: { farmId: autoFarm.id } });
        if (!autoCycle) { throw new Error('❌ Auto-Created PlantingCycle NOT FOUND'); }
        console.log(`✅ Auto-Created Cycle Verified: ${autoCycle.cycleName} (${autoCycle.status})`);

        const autoBatch = await prisma.harvestBatch.findFirst({ where: { farmId: autoFarm.id } });
        if (!autoBatch) { throw new Error('❌ Auto-Created HarvestBatch NOT FOUND'); }
        console.log(`✅ Auto-Created Batch Verified: ${autoBatch.batchNumber}`);

        if (!autoBatch.qrCode || !autoBatch.trackingUrl) { throw new Error('❌ Batch QR Code Data MISSING'); }
        console.log(`✅ Batch QR Code Generated: ${autoBatch.qrCode}`);

        console.log('\n🎉 GOLDEN LOOP COMPLETED SUCCESSFULLY (REFACTORED FLOW) 🎉');

    } catch (err) {
        console.error('❌ GOLDEN LOOP FAILED:', err.message);
        if (err.response) {
            console.error('API Response:', err.response.data);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
