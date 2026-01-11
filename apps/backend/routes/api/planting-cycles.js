/**
 * Planting Cycles API Route
 * Manages planting cycles (รอบการปลูก) for farms
 * 
 * GET /api/planting-cycles - List cycles for a farm
 * POST /api/planting-cycles - Create new cycle
 * GET /api/planting-cycles/:id - Get cycle details
 * PATCH /api/planting-cycles/:id - Update cycle
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');
const qrcodeService = require('../../services/qrcode/qrcode-service');

/**
 * GET /api/planting-cycles
 * List planting cycles for a farm
 * @query farmId - Required farm ID
 * @query status - Optional filter by status
 */
router.get('/', async (req, res) => {
    try {
        const { farmId, status } = req.query;

        if (!farmId) {
            return res.status(400).json({
                success: false,
                message: 'farmId is required',
            });
        }

        const whereClause = { farmId, isDeleted: false };
        if (status) {
            whereClause.status = status.toUpperCase();
        }

        const cycles = await prisma.plantingCycle.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                plantSpecies: {
                    select: { code: true, nameTH: true, nameEN: true },
                },
                certificate: {
                    select: { certificateNumber: true, expiryDate: true },
                },
                _count: { select: { batches: true } },
            },
        });

        res.json({
            success: true,
            count: cycles.length,
            data: cycles,
        });
    } catch (error) {
        console.error('Error fetching planting cycles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch planting cycles',
            error: error.message,
        });
    }
});

/**
 * POST /api/planting-cycles
 * Create a new planting cycle
 */
router.post('/', async (req, res) => {
    try {
        console.log('DEBUG PLANTING CYCLE BODY:', req.body);
        const {
            farmId,
            certificateId,
            plantSpeciesId,
            cycleName,
            startDate,
            expectedHarvestDate,
            plotId, // [NEW] Added plotId extraction
            plotName,
            plotArea,
            areaUnit,
            seedSource,
            seedQuantity,
            cultivationType,
            soilType,
            irrigationType,
            estimatedYield,
            varietyName,
            notes,
        } = req.body;

        // Validation
        if (!farmId || !plantSpeciesId || !cycleName || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'farmId, plantSpeciesId, cycleName, and startDate are required',
            });
        }

        // [NEW] Verify Active Certificate Requirement

        // 2. Validate Certificate (Optional but Good)
        // If certificateId is provided, ensure it's ACTIVE
        if (certificateId) {
            const cert = await prisma.certificate.findUnique({ where: { id: certificateId } });
            if (!cert || cert.status !== 'active') {
                return res.status(400).json({ success: false, message: 'ใบรับรองไม่ถูกต้องหรือหมดอายุ' });
            }
        }

        // Get next cycle number for this farm (This logic is removed as cycleNumber is not in the new data payload)
        // const cycleCount = await prisma.plantingCycle.count({
        //     where: { farmId },
        // });

        // 3. Create Cycle
        const cycle = await prisma.plantingCycle.create({
            data: {
                farmId,
                certificateId, // Can be null if starting before cert? (Usually blocked by frontend)
                plantSpeciesId,
                cycleName,
                // cycleNumber: cycleCount + 1, // Removed
                startDate: new Date(startDate),
                expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
                plotId, // Link to Real Plot
                plotName,
                plotArea: plotArea ? parseFloat(plotArea) : null,
                // areaUnit: areaUnit || 'rai', // Removed
                seedSource,
                seedQuantity: seedQuantity ? parseFloat(seedQuantity) : null,
                cultivationType: cultivationType || 'SELF_GROWN',
                // soilType, // Removed
                // irrigationType, // Removed
                // estimatedYield: estimatedYield ? parseFloat(estimatedYield) : null, // Removed
                // varietyName, // Removed
                notes,
                status: 'PLANTED',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Planting cycle created successfully',
            data: cycle,
        });
    } catch (error) {
        console.error('Error creating planting cycle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create planting cycle',
            error: error.message,
        });
    }
});

/**
 * GET /api/planting-cycles/:id
 * Get planting cycle details with batches
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cycle = await prisma.plantingCycle.findUnique({
            where: { id },
            include: {
                farm: {
                    select: {
                        id: true,
                        farmName: true,
                        farmNameTH: true,
                        province: true,
                        district: true,
                    },
                },
                plantSpecies: {
                    select: { code: true, nameTH: true, nameEN: true },
                },
                certificate: {
                    select: {
                        certificateNumber: true,
                        expiryDate: true,
                        status: true,
                    },
                },
                batches: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: { select: { lots: true } },
                    },
                },
            },
        });

        if (!cycle) {
            return res.status(404).json({
                success: false,
                message: 'Planting cycle not found',
            });
        }

        res.json({
            success: true,
            data: cycle,
        });
    } catch (error) {
        console.error('Error fetching planting cycle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch planting cycle',
            error: error.message,
        });
    }
});

/**
 * PATCH /api/planting-cycles/:id
 * Update planting cycle (status, harvest data, etc.)
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be directly updated
        delete updateData.id;
        delete updateData.uuid;
        delete updateData.createdAt;
        delete updateData.farmId;

        // Handle date fields
        if (updateData.actualHarvestDate) {
            updateData.actualHarvestDate = new Date(updateData.actualHarvestDate);
        }
        if (updateData.expectedHarvestDate) {
            updateData.expectedHarvestDate = new Date(updateData.expectedHarvestDate);
        }

        // Handle numeric fields
        if (updateData.actualYield) {
            updateData.actualYield = parseFloat(updateData.actualYield);
        }

        const cycle = await prisma.plantingCycle.update({
            where: { id },
            data: updateData,
        });

        res.json({
            success: true,
            message: 'Planting cycle updated successfully',
            data: cycle,
        });
    } catch (error) {
        console.error('Error updating planting cycle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update planting cycle',
            error: error.message,
        });
    }
});

/**
 * POST /api/planting-cycles/:id/harvest
 * Create harvest batch from planting cycle with QR code
 */
router.post('/:id/harvest', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            harvestDate,
            actualYield,
            qualityGrade,
            notes,
        } = req.body;

        // Get the planting cycle
        const cycle = await prisma.plantingCycle.findUnique({
            where: { id },
            include: { farm: true },
        });

        if (!cycle) {
            return res.status(404).json({
                success: false,
                message: 'Planting cycle not found',
            });
        }

        // Generate batch number
        const batchCount = await prisma.harvestBatch.count();
        const batchNumber = `BATCH-${new Date().getFullYear()}-${String(batchCount + 1).padStart(4, '0')}`;

        // Generate QR code
        const qrData = await qrcodeService.generateForRecord('BATCH', id);

        // Create harvest batch
        const batch = await prisma.harvestBatch.create({
            data: {
                batchNumber,
                farmId: cycle.farmId,
                speciesId: cycle.plantSpeciesId,
                cycleId: id,
                plantingDate: cycle.startDate,
                harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
                cultivationType: cycle.cultivationType,
                seedSource: cycle.seedSource,
                plotName: cycle.plotName,
                plotArea: cycle.plotArea,
                areaUnit: cycle.areaUnit,
                estimatedYield: cycle.estimatedYield,
                actualYield: actualYield ? parseFloat(actualYield) : null,
                yieldUnit: 'kg',
                qualityGrade: qualityGrade || null,
                notes,
                status: 'HARVESTED',
                qrCode: qrData.qrCode,
                trackingUrl: qrData.trackingUrl,
            },
        });

        // Update cycle status
        await prisma.plantingCycle.update({
            where: { id },
            data: {
                status: 'HARVESTED',
                actualHarvestDate: harvestDate ? new Date(harvestDate) : new Date(),
                actualYield: actualYield ? parseFloat(actualYield) : null,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Harvest batch created successfully',
            data: {
                batch,
                qrCode: qrData,
            },
        });
    } catch (error) {
        console.error('Error creating harvest batch:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create harvest batch',
            error: error.message,
        });
    }
});

module.exports = router;
