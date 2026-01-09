/**
 * V2 Trace API Route (Public + Auth)
 * Public traceability endpoint for QR code scanning
 * 
 * GET /api/trace/:qrCode - Get batch/lot/cycle info by QR code (Public)
 * GET /api/trace/:qrCode/qr - Generate QR code image (Public)
 * POST /api/trace/generate - Generate new QR code for a cycle/batch (Auth)
 */

const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { prisma } = require('../../services/prisma-database');
const authModule = require('../../middleware/auth-middleware');
const crypto = require('crypto');

// Safely get authenticateFarmer
const authenticateFarmer = (req, res, next) => {
    if (typeof authModule.authenticateFarmer === 'function') {
        return authModule.authenticateFarmer(req, res, next);
    }
    return res.status(500).json({ success: false, message: 'Auth middleware error' });
};

// Base URL for trace pages
const TRACE_BASE_URL = process.env.TRACE_BASE_URL || 'http://47.129.167.71';

/**
 * Helper: Format cultivation type for display
 */
function formatCultivationType(type) {
    const types = {
        'SELF_GROWN': 'ปลูกเอง',
        'CONTRACT_FARMING': 'เกษตรพันธสัญญา',
        'PURCHASED': 'รับซื้อจากแหล่งอื่น',
        'OUTDOOR': 'กลางแจ้ง',
        'INDOOR': 'โรงเรือน',
        'GREENHOUSE': 'เรือนกระจก'
    };
    return types[type] || type;
}

/**
 * Helper: Format date for Thai display
 */
function formatThaiDate(date) {
    if (!date) return null;
    const d = new Date(date);
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const thaiYear = d.getFullYear() + 543;
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${thaiYear}`;
}

/**
 * Helper: Generate a unique QR code string
 */
function generateQRCodeString(prefix = 'TR') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * GET /api/trace/:qrCode
 * Public endpoint - no auth required
 * Returns traceability information for a PlantingCycle, Batch or Lot
 */
router.get('/:qrCode', async (req, res) => {
    try {
        const { qrCode } = req.params;

        // 1. Try to find as PlantingCycle first (new primary lookup)
        let cycle = null;
        try {
            cycle = await prisma.plantingCycle.findFirst({
                where: {
                    OR: [
                        { id: qrCode },
                        { uuid: qrCode }
                    ],
                    isDeleted: false
                },
                include: {
                    farm: {
                        select: {
                            id: true,
                            farmName: true,
                            farmType: true,
                            province: true,
                            district: true,
                            subDistrict: true,
                            address: true,
                            status: true
                        }
                    },
                    plantSpecies: {
                        select: {
                            code: true,
                            nameTH: true,
                            nameEN: true,
                            scientificName: true
                        }
                    },
                    certificate: {
                        select: {
                            id: true,
                            certificateNumber: true,
                            expiryDate: true,
                            issuedDate: true,
                            status: true,
                            standardName: true
                        }
                    },
                    batches: {
                        where: { isDeleted: false },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                        select: {
                            batchNumber: true,
                            harvestDate: true,
                            actualYield: true,
                            yieldUnit: true,
                            qualityGrade: true,
                            status: true
                        }
                    }
                }
            });
        } catch (e) {
            cycle = null;
        }

        if (cycle) {
            const cert = cycle.certificate;
            const isValidCert = cert && cert.status === 'ACTIVE' && new Date(cert.expiryDate) > new Date();

            return res.json({
                success: true,
                type: 'PLANTING_CYCLE',
                data: {
                    // ข้อมูลฟาร์ม
                    farm: {
                        name: cycle.farm.farmName,
                        type: cycle.farm.farmType,
                        location: `${cycle.farm.district}, ${cycle.farm.province}`,
                        address: cycle.farm.address,
                        status: cycle.farm.status
                    },
                    // ข้อมูลแปลง/โรงปลูก
                    plot: {
                        name: cycle.plotName || 'แปลงหลัก',
                        area: cycle.plotArea,
                        unit: cycle.areaUnit === 'rai' ? 'ไร่' : cycle.areaUnit
                    },
                    // ข้อมูลพืช
                    plant: {
                        code: cycle.plantSpecies.code,
                        nameTH: cycle.plantSpecies.nameTH,
                        nameEN: cycle.plantSpecies.nameEN,
                        scientificName: cycle.plantSpecies.scientificName,
                        variety: cycle.varietyName || 'ไม่ระบุพันธุ์'
                    },
                    // วิธีการปลูก
                    cultivation: {
                        method: formatCultivationType(cycle.cultivationType),
                        methodCode: cycle.cultivationType,
                        seedSource: cycle.seedSource || 'ไม่ระบุ',
                        soilType: cycle.soilType || 'ไม่ระบุ',
                        irrigationType: cycle.irrigationType || 'ไม่ระบุ',
                        cycleName: cycle.cycleName,
                        cycleNumber: cycle.cycleNumber
                    },
                    // วันที่
                    dates: {
                        planted: cycle.startDate,
                        plantedTH: formatThaiDate(cycle.startDate),
                        expectedHarvest: cycle.expectedHarvestDate,
                        expectedHarvestTH: formatThaiDate(cycle.expectedHarvestDate),
                        actualHarvest: cycle.actualHarvestDate,
                        actualHarvestTH: formatThaiDate(cycle.actualHarvestDate)
                    },
                    // ผลผลิต
                    yield: {
                        estimated: cycle.estimatedYield,
                        actual: cycle.actualYield,
                        unit: 'กก.'
                    },
                    // สถานะ
                    status: cycle.status,
                    // ใบรับรอง
                    certificate: cert ? {
                        number: cert.certificateNumber,
                        standard: cert.standardName || 'GACP',
                        issuedDate: cert.issuedDate,
                        issuedDateTH: formatThaiDate(cert.issuedDate),
                        expiryDate: cert.expiryDate,
                        expiryDateTH: formatThaiDate(cert.expiryDate),
                        status: cert.status,
                        isValid: isValidCert
                    } : null,
                    // Harvest batches
                    harvests: cycle.batches.map(b => ({
                        batchNumber: b.batchNumber,
                        harvestDate: b.harvestDate,
                        harvestDateTH: formatThaiDate(b.harvestDate),
                        yield: b.actualYield,
                        yieldUnit: b.yieldUnit === 'kg' ? 'กก.' : b.yieldUnit,
                        grade: b.qualityGrade,
                        status: b.status
                    })),
                    // Verification
                    verification: {
                        valid: true,
                        certified: isValidCert,
                        scannedAt: new Date().toISOString(),
                        verifiedBy: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก'
                    }
                }
            });
        }

        // 2. Try to find as a HarvestBatch (by qrCode field)
        let batch = null;
        try {
            batch = await prisma.harvestBatch.findFirst({
                where: {
                    OR: [
                        { qrCode },
                        { batchNumber: qrCode },
                        { id: qrCode }
                    ],
                    isDeleted: false
                },
                include: {
                    farm: {
                        select: {
                            id: true,
                            farmName: true,
                            farmType: true,
                            province: true,
                            district: true,
                            address: true,
                            status: true
                        }
                    },
                    species: {
                        select: {
                            code: true,
                            nameTH: true,
                            nameEN: true,
                            scientificName: true
                        }
                    },
                    cycle: {
                        include: {
                            certificate: {
                                select: {
                                    certificateNumber: true,
                                    expiryDate: true,
                                    issuedDate: true,
                                    status: true,
                                    standardName: true
                                }
                            }
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
        } catch (e) {
            batch = null;
        }

        if (batch) {
            const cert = batch.cycle?.certificate;
            const isValidCert = cert && cert.status === 'ACTIVE' && new Date(cert.expiryDate) > new Date();

            return res.json({
                success: true,
                type: 'HARVEST_BATCH',
                data: {
                    // ข้อมูลฟาร์ม
                    farm: {
                        name: batch.farm.farmName,
                        type: batch.farm.farmType,
                        location: `${batch.farm.district}, ${batch.farm.province}`,
                        address: batch.farm.address
                    },
                    // ข้อมูลแปลง
                    plot: {
                        name: batch.plotName || 'แปลงหลัก',
                        area: batch.plotArea,
                        unit: batch.areaUnit === 'rai' ? 'ไร่' : batch.areaUnit
                    },
                    // ข้อมูลพืช
                    plant: {
                        code: batch.species.code,
                        nameTH: batch.species.nameTH,
                        nameEN: batch.species.nameEN,
                        scientificName: batch.species.scientificName
                    },
                    // วิธีการปลูก
                    cultivation: {
                        method: formatCultivationType(batch.cultivationType),
                        seedSource: batch.seedSource || 'ไม่ระบุ'
                    },
                    // ข้อมูล Batch
                    batch: {
                        number: batch.batchNumber,
                        plantingDate: batch.plantingDate,
                        plantingDateTH: formatThaiDate(batch.plantingDate),
                        harvestDate: batch.harvestDate,
                        harvestDateTH: formatThaiDate(batch.harvestDate),
                        yield: batch.actualYield || batch.estimatedYield,
                        yieldUnit: batch.yieldUnit === 'kg' ? 'กก.' : batch.yieldUnit,
                        qualityGrade: batch.qualityGrade,
                        status: batch.status
                    },
                    // ใบรับรอง
                    certificate: cert ? {
                        number: cert.certificateNumber,
                        standard: cert.standardName || 'GACP',
                        expiryDate: cert.expiryDate,
                        expiryDateTH: formatThaiDate(cert.expiryDate),
                        isValid: isValidCert
                    } : null,
                    // Lots
                    lots: batch.lots,
                    // Verification
                    verification: {
                        valid: true,
                        certified: isValidCert,
                        scannedAt: new Date().toISOString()
                    }
                }
            });
        }

        // 3. Try to find as a Lot
        let lot = null;
        try {
            lot = await prisma.lot.findFirst({
                where: {
                    OR: [
                        { qrCode },
                        { lotNumber: qrCode }
                    ]
                },
                include: {
                    batch: {
                        include: {
                            farm: true,
                            species: true,
                            cycle: {
                                include: {
                                    certificate: true
                                }
                            }
                        }
                    }
                }
            });
        } catch (e) {
            lot = null;
        }

        if (lot) {
            const cert = lot.batch?.cycle?.certificate;
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
                            moistureContent: lot.moistureContent
                        }
                    },
                    batch: lot.batch ? {
                        batchNumber: lot.batch.batchNumber,
                        harvestDate: lot.batch.harvestDate,
                        harvestDateTH: formatThaiDate(lot.batch.harvestDate),
                        plantingDate: lot.batch.plantingDate
                    } : null,
                    farm: lot.batch?.farm ? {
                        name: lot.batch.farm.farmName,
                        location: `${lot.batch.farm.district}, ${lot.batch.farm.province}`
                    } : null,
                    plant: lot.batch?.species,
                    certificate: cert ? {
                        number: cert.certificateNumber,
                        expiryDate: cert.expiryDate,
                        expiryDateTH: formatThaiDate(cert.expiryDate),
                        isValid: cert.status === 'ACTIVE' && new Date(cert.expiryDate) > new Date()
                    } : null,
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
            message: 'ไม่พบข้อมูลสำหรับ QR Code นี้ อาจไม่ได้ลงทะเบียนในระบบ',
            messageEN: 'QR code not found. This product may not be registered in our system.',
            verification: {
                valid: false,
                scannedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error tracing QR code:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบ',
            error: error.message
        });
    }
});

/**
 * GET /api/trace/:qrCode/qr
 * Generate QR code image as data URL
 */
router.get('/:qrCode/qr', async (req, res) => {
    try {
        const { qrCode } = req.params;
        const { size = 300, format = 'png' } = req.query;

        const traceUrl = `${TRACE_BASE_URL}/trace/${qrCode}`;

        const qrOptions = {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: parseInt(size),
            margin: 2,
            color: {
                dark: '#10b981',  // Emerald color
                light: '#ffffff'
            }
        };

        if (format === 'svg') {
            const svg = await QRCode.toString(traceUrl, { type: 'svg', ...qrOptions });
            res.setHeader('Content-Type', 'image/svg+xml');
            return res.send(svg);
        } else if (format === 'dataurl') {
            const dataUrl = await QRCode.toDataURL(traceUrl, qrOptions);
            return res.json({
                success: true,
                qrCode,
                traceUrl,
                dataUrl
            });
        } else {
            const buffer = await QRCode.toBuffer(traceUrl, qrOptions);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `inline; filename="qr-${qrCode}.png"`);
            return res.send(buffer);
        }

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
 * POST /api/trace/generate
 * Generate and assign a new QR code to a PlantingCycle or HarvestBatch
 * Requires authentication
 */
router.post('/generate', authenticateFarmer, async (req, res) => {
    try {
        const { type, id } = req.body;

        if (!type || !id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: type, id'
            });
        }

        const qrCodeString = generateQRCodeString(type === 'CYCLE' ? 'CY' : 'BT');
        const trackingUrl = `${TRACE_BASE_URL}/trace/${qrCodeString}`;

        if (type === 'CYCLE') {
            // Verify ownership
            const cycle = await prisma.plantingCycle.findFirst({
                where: { id },
                include: { farm: true }
            });

            if (!cycle || cycle.farm.ownerId !== req.user.id) {
                return res.status(404).json({
                    success: false,
                    message: 'PlantingCycle not found or access denied'
                });
            }

            // Note: PlantingCycle doesn't have qrCode field in schema
            // Store in notes or create a separate TraceCode table
            // For now, return the cycle's UUID as the trace code
            return res.json({
                success: true,
                message: 'QR code generated',
                data: {
                    qrCode: cycle.uuid,
                    trackingUrl: `${TRACE_BASE_URL}/trace/${cycle.uuid}`,
                    type: 'CYCLE'
                }
            });

        } else if (type === 'BATCH') {
            // Verify ownership
            const batch = await prisma.harvestBatch.findFirst({
                where: { id },
                include: { farm: true }
            });

            if (!batch || batch.farm.ownerId !== req.user.id) {
                return res.status(404).json({
                    success: false,
                    message: 'HarvestBatch not found or access denied'
                });
            }

            // Update batch with new QR code
            const updated = await prisma.harvestBatch.update({
                where: { id },
                data: {
                    qrCode: qrCodeString,
                    trackingUrl
                }
            });

            return res.json({
                success: true,
                message: 'QR code generated and assigned',
                data: {
                    qrCode: qrCodeString,
                    trackingUrl,
                    batchNumber: updated.batchNumber,
                    type: 'BATCH'
                }
            });

        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Must be CYCLE or BATCH'
            });
        }

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: error.message
        });
    }
});

module.exports = router;
