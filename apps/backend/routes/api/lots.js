/**
 * V2 Lots API Route
 * Manages lots (บรรจุภัณฑ์) with QR code generation
 * 
 * POST /api/v2/lots - Create lot from batch
 * GET /api/v2/lots/:id - Get lot details
 * GET /api/v2/lots/:id/qr - Get QR code image
 * GET /api/v2/lots/:id/qr/print - Get printable QR label (PDF-like)
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');
const qrcodeService = require('../../services/qrcode/qrcode-service');

/**
 * POST /api/v2/lots
 * Create a new lot from a harvest batch
 */
router.post('/', async (req, res) => {
    try {
        const {
            batchId,
            packageType,
            quantity,
            unitWeight,
            processedAt,
            packagedAt,
            expiryDate,
            thcContent,
            cbdContent,
            moistureContent,
            labTestReportUrl,
            destinationType,
            destination,
            notes
        } = req.body;

        // Validation
        if (!batchId || !packageType || !quantity || !unitWeight) {
            return res.status(400).json({
                success: false,
                message: 'batchId, packageType, quantity, and unitWeight are required'
            });
        }

        // Check batch exists
        const batch = await prisma.harvestBatch.findUnique({
            where: { id: batchId }
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Harvest batch not found'
            });
        }

        // Generate lot number
        const lotCount = await prisma.lot.count({ where: { batchId } });
        const lotSuffix = String.fromCharCode(65 + lotCount); // A, B, C...
        const lotNumber = `${batch.batchNumber.replace('BATCH', 'LOT')}-${lotSuffix}`;

        // Generate QR code
        const qrData = await qrcodeService.generateForRecord('LOT', batchId);

        // Calculate total weight
        const totalWeight = parseFloat(quantity) * parseFloat(unitWeight);

        // Create lot
        const lot = await prisma.lot.create({
            data: {
                lotNumber,
                batchId,
                packageType,
                quantity: parseInt(quantity),
                unitWeight: parseFloat(unitWeight),
                totalWeight,
                processedAt: processedAt ? new Date(processedAt) : null,
                packagedAt: packagedAt ? new Date(packagedAt) : new Date(),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                thcContent: thcContent ? parseFloat(thcContent) : null,
                cbdContent: cbdContent ? parseFloat(cbdContent) : null,
                moistureContent: moistureContent ? parseFloat(moistureContent) : null,
                labTestReportUrl,
                testStatus: labTestReportUrl ? 'PASSED' : 'PENDING',
                destinationType,
                destination,
                qrCode: qrData.qrCode,
                trackingUrl: qrData.trackingUrl,
                status: 'PACKAGED'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Lot created successfully',
            data: {
                lot,
                qrCode: qrData
            }
        });
    } catch (error) {
        console.error('Error creating lot:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create lot',
            error: error.message
        });
    }
});

/**
 * GET /api/v2/lots/:id
 * Get lot details with batch and farm info
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const lot = await prisma.lot.findUnique({
            where: { id },
            include: {
                batch: {
                    include: {
                        farm: {
                            select: {
                                id: true,
                                farmName: true,
                                farmNameTH: true,
                                province: true,
                                district: true
                            }
                        },
                        species: {
                            select: { code: true, nameTH: true, nameEN: true }
                        },
                        cycle: {
                            select: {
                                cycleName: true,
                                startDate: true,
                                certificateId: true
                            }
                        }
                    }
                }
            }
        });

        if (!lot) {
            return res.status(404).json({
                success: false,
                message: 'Lot not found'
            });
        }

        res.json({
            success: true,
            data: lot
        });
    } catch (error) {
        console.error('Error fetching lot:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lot',
            error: error.message
        });
    }
});

/**
 * GET /api/v2/lots/:id/qr
 * Get QR code as PNG image
 */
router.get('/:id/qr', async (req, res) => {
    try {
        const { id } = req.params;

        const lot = await prisma.lot.findUnique({
            where: { id },
            select: { qrCode: true }
        });

        if (!lot || !lot.qrCode) {
            return res.status(404).json({
                success: false,
                message: 'QR code not found'
            });
        }

        // Generate QR code image
        const qrBuffer = await qrcodeService.generateBuffer(lot.qrCode, {
            width: 300
        });

        res.set('Content-Type', 'image/png');
        res.send(qrBuffer);
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: error.message
        });
    }
});

/**
 * GET /api/v2/lots/:id/qr/print
 * Get printable QR label with product info (JSON for frontend to render)
 */
router.get('/:id/qr/print', async (req, res) => {
    try {
        const { id } = req.params;

        const lot = await prisma.lot.findUnique({
            where: { id },
            include: {
                batch: {
                    include: {
                        farm: {
                            select: {
                                farmName: true,
                                farmNameTH: true,
                                province: true
                            }
                        },
                        species: {
                            select: { nameTH: true, nameEN: true }
                        }
                    }
                }
            }
        });

        if (!lot) {
            return res.status(404).json({
                success: false,
                message: 'Lot not found'
            });
        }

        // Generate QR code as data URL for embedding
        const qrDataUrl = await qrcodeService.generateDataUrl(lot.qrCode, {
            width: 200
        });

        // Return label data for frontend to render
        res.json({
            success: true,
            data: {
                label: {
                    qrCodeDataUrl: qrDataUrl,
                    lotNumber: lot.lotNumber,
                    plant: lot.batch.species.nameTH,
                    farmName: lot.batch.farm.farmNameTH || lot.batch.farm.farmName,
                    province: lot.batch.farm.province,
                    packageType: lot.packageType,
                    weight: `${lot.unitWeight} กก.`,
                    harvestDate: lot.batch.harvestDate,
                    packagedAt: lot.packagedAt,
                    expiryDate: lot.expiryDate,
                    trackingUrl: lot.trackingUrl
                }
            }
        });
    } catch (error) {
        console.error('Error generating print label:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate print label',
            error: error.message
        });
    }
});

/**
 * GET /api/v2/batches/:batchId/lots
 * Get all lots for a batch
 */
router.get('/batch/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;

        const lots = await prisma.lot.findMany({
            where: { batchId, isDeleted: false },
            orderBy: { createdAt: 'asc' }
        });

        res.json({
            success: true,
            count: lots.length,
            data: lots
        });
    } catch (error) {
        console.error('Error fetching lots:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lots',
            error: error.message
        });
    }
});

module.exports = router;
