/**
 * V2 Trace API Route (Public)
 * Public traceability endpoint for QR code scanning
 * 
 * GET /api/v2/trace/:qrCode - Get batch/lot info by QR code
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');

/**
 * GET /api/v2/trace/:qrCode
 * Public endpoint - no auth required
 * Returns traceability information for a batch or lot
 */
router.get('/:qrCode', async (req, res) => {
    try {
        const { qrCode } = req.params;

        // Try to find as a Lot first
        let lot = await prisma.lot.findUnique({
            where: { qrCode },
            include: {
                batch: {
                    include: {
                        farm: {
                            select: {
                                id: true,
                                farmName: true,
                                farmNameTH: true,
                                province: true,
                                district: true,
                                status: true
                            }
                        },
                        species: {
                            select: {
                                code: true,
                                nameTH: true,
                                nameEN: true
                            }
                        },
                        cycle: {
                            include: {
                                certificate: {
                                    select: {
                                        id: true,
                                        certificateNumber: true,
                                        expiryDate: true,
                                        issuedAt: true,
                                        status: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (lot) {
            const certificate = lot.batch?.cycle?.certificate;
            return res.json({
                success: true,
                type: 'LOT',
                data: {
                    lot: {
                        lotNumber: lot.lotNumber,
                        packageType: lot.packageType,
                        quantity: lot.quantity,
                        unitWeight: lot.unitWeight,
                        status: lot.status,
                        packagedAt: lot.packagedAt,
                        expiryDate: lot.expiryDate,
                        labTest: {
                            status: lot.testStatus,
                            thcContent: lot.thcContent,
                            cbdContent: lot.cbdContent,
                            moistureContent: lot.moistureContent,
                            reportUrl: lot.labTestReportUrl
                        }
                    },
                    batch: {
                        batchNumber: lot.batch.batchNumber,
                        harvestDate: lot.batch.harvestDate,
                        plantingDate: lot.batch.plantingDate,
                        qualityGrade: lot.batch.qualityGrade,
                        status: lot.batch.status
                    },
                    farm: lot.batch.farm,
                    plant: lot.batch.species,
                    certificate: certificate ? {
                        number: certificate.certificateNumber,
                        expiryDate: certificate.expiryDate,
                        issuedAt: certificate.issuedAt,
                        status: certificate.status,
                        isValid: certificate.status === 'ACTIVE' && new Date(certificate.expiryDate) > new Date()
                    } : null,
                    verification: {
                        valid: true,
                        scannedAt: new Date().toISOString()
                    }
                }
            });
        }

        // Try to find as a Batch
        let batch = await prisma.harvestBatch.findUnique({
            where: { qrCode },
            include: {
                farm: {
                    select: {
                        id: true,
                        farmName: true,
                        farmNameTH: true,
                        province: true,
                        district: true,
                        status: true
                    }
                },
                species: {
                    select: {
                        code: true,
                        nameTH: true,
                        nameEN: true
                    }
                },
                lots: {
                    select: {
                        lotNumber: true,
                        packageType: true,
                        quantity: true,
                        status: true
                    }
                }
            }
        });

        if (batch) {
            return res.json({
                success: true,
                type: 'BATCH',
                data: {
                    batch: {
                        batchNumber: batch.batchNumber,
                        harvestDate: batch.harvestDate,
                        plantingDate: batch.plantingDate,
                        cultivationType: batch.cultivationType,
                        seedSource: batch.seedSource,
                        plotName: batch.plotName,
                        plotArea: batch.plotArea,
                        areaUnit: batch.areaUnit,
                        estimatedYield: batch.estimatedYield,
                        actualYield: batch.actualYield,
                        yieldUnit: batch.yieldUnit,
                        qualityGrade: batch.qualityGrade,
                        status: batch.status
                    },
                    farm: batch.farm,
                    plant: batch.species,
                    lots: batch.lots,
                    verification: {
                        valid: true,
                        scannedAt: new Date().toISOString()
                    }
                }
            });
        }

        // Not found
        return res.status(404).json({
            success: false,
            message: 'QR code not found. This product may not be registered in our system.',
            verification: {
                valid: false,
                scannedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error tracing QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to trace product',
            error: error.message
        });
    }
});

module.exports = router;
