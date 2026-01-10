/**
 * HarvestBatch API Routes
 * CRUD operations for HarvestBatch table (Lot tracking)
 * 
 * @version 1.0.0
 * @testable Postman
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');

// ============================================================================
// HARVEST BATCH (LOT) API
// ============================================================================

/**
 * @route   GET /api/v2/harvest-batches
 * @desc    Get all harvest batches for a farm
 * @query   farmId, status, speciesId
 * @access  Auth required
 * @test    GET http://localhost:3000/api/v2/harvest-batches?farmId=xxx
 */
router.get('/', async (req, res) => {
    try {
        const { farmId, status, speciesId } = req.query;

        const where = {};
        if (farmId) {where.farmId = farmId;}
        if (status) {where.status = status;}
        if (speciesId) {where.speciesId = speciesId;}

        const batches = await prisma.harvestBatch.findMany({
            where,
            include: {
                species: {
                    select: { id: true, thaiName: true, englishName: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            count: batches.length,
            data: batches,
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/harvest-batches/:id
 * @desc    Get harvest batch by ID
 * @access  Auth required
 * @test    GET http://localhost:3000/api/v2/harvest-batches/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await prisma.harvestBatch.findUnique({
            where: { id },
            include: {
                species: true,
            },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Harvest batch not found',
            });
        }

        res.json({
            success: true,
            data: batch,
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/harvest-batches/lot/:batchNumber
 * @desc    Get harvest batch by Lot Number (for QR/traceability)
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/harvest-batches/lot/LOT-2024-001
 */
router.get('/lot/:batchNumber', async (req, res) => {
    try {
        const { batchNumber } = req.params;

        const batch = await prisma.harvestBatch.findUnique({
            where: { batchNumber },
            include: {
                species: {
                    select: {
                        id: true,
                        thaiName: true,
                        englishName: true,
                        scientificName: true,
                    },
                },
            },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Lot number not found',
            });
        }

        // Public traceability info
        res.json({
            success: true,
            data: {
                batchNumber: batch.batchNumber,
                plantingDate: batch.plantingDate,
                harvestDate: batch.harvestDate,
                cultivationType: batch.cultivationType,
                status: batch.status,
                plant: batch.species,
            },
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/v2/harvest-batches
 * @desc    Create new harvest batch
 * @access  Farmer
 * @test    POST http://localhost:3000/api/v2/harvest-batches
 */
router.post('/', async (req, res) => {
    try {
        const {
            farmId,
            speciesId,
            plantingDate,
            cultivationType = 'SELF_GROWN',
            seedSource,
            plotName,
            plotArea,
            areaUnit = 'rai',
            notes,
        } = req.body;

        // Validate required fields
        if (!farmId || !speciesId || !plantingDate) {
            return res.status(400).json({
                success: false,
                error: 'farmId, speciesId, and plantingDate are required',
            });
        }

        // Generate lot number
        const year = new Date().getFullYear();
        const count = await prisma.harvestBatch.count({
            where: { farmId },
        });
        const batchNumber = `LOT-${farmId.substring(0, 8).toUpperCase()}-${year}-${String(count + 1).padStart(3, '0')}`;

        const batch = await prisma.harvestBatch.create({
            data: {
                batchNumber,
                farmId,
                speciesId,
                plantingDate: new Date(plantingDate),
                cultivationType,
                seedSource,
                plotName,
                plotArea: plotArea ? parseFloat(plotArea) : null,
                areaUnit,
                notes,
                status: 'GROWING',
            },
            include: {
                species: { select: { thaiName: true } },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Harvest batch created successfully',
            data: batch,
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   PUT /api/v2/harvest-batches/:id
 * @desc    Update harvest batch
 * @access  Farmer
 * @test    PUT http://localhost:3000/api/v2/harvest-batches/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if batch exists
        const existing = await prisma.harvestBatch.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Harvest batch not found',
            });
        }

        // Convert dates if provided
        if (updateData.plantingDate) {
            updateData.plantingDate = new Date(updateData.plantingDate);
        }
        if (updateData.harvestDate) {
            updateData.harvestDate = new Date(updateData.harvestDate);
        }
        if (updateData.expectedHarvestDate) {
            updateData.expectedHarvestDate = new Date(updateData.expectedHarvestDate);
        }

        const batch = await prisma.harvestBatch.update({
            where: { id },
            data: updateData,
        });

        res.json({
            success: true,
            message: 'Harvest batch updated successfully',
            data: batch,
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/v2/harvest-batches/:id/harvest
 * @desc    Record harvest for a batch
 * @access  Farmer
 * @test    POST http://localhost:3000/api/v2/harvest-batches/:id/harvest
 */
router.post('/:id/harvest', async (req, res) => {
    try {
        const { id } = req.params;
        const { harvestDate, actualYield, yieldUnit = 'kg', qualityGrade, notes } = req.body;

        // Check if batch exists
        const existing = await prisma.harvestBatch.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Harvest batch not found',
            });
        }

        if (existing.status === 'HARVESTED') {
            return res.status(400).json({
                success: false,
                error: 'This batch has already been harvested',
            });
        }

        const batch = await prisma.harvestBatch.update({
            where: { id },
            data: {
                harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
                actualYield: actualYield ? parseFloat(actualYield) : null,
                yieldUnit,
                qualityGrade,
                status: 'HARVESTED',
                notes: notes || existing.notes,
            },
        });

        res.json({
            success: true,
            message: 'Harvest recorded successfully',
            data: batch,
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/harvest-batches/stats/:farmId
 * @desc    Get harvest statistics for a farm
 * @access  Farmer
 * @test    GET http://localhost:3000/api/v2/harvest-batches/stats/:farmId
 */
router.get('/stats/:farmId', async (req, res) => {
    try {
        const { farmId } = req.params;

        const [total, growing, harvested] = await Promise.all([
            prisma.harvestBatch.count({ where: { farmId } }),
            prisma.harvestBatch.count({ where: { farmId, status: 'GROWING' } }),
            prisma.harvestBatch.count({ where: { farmId, status: 'HARVESTED' } }),
        ]);

        res.json({
            success: true,
            data: {
                farmId,
                totalBatches: total,
                growing,
                harvested,
                pending: total - growing - harvested,
            },
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
