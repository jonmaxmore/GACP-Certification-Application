/**
 * @swagger
 * tags:
 *   name: PlantingCycles
 *   description: Planting cycle management
 */

const express = require('express');
const router = express.Router();
const plantingService = require('../../services/planting-service');
const { prisma } = require('../../services/prisma-database');
const qrcodeService = require('../../services/qrcode/qrcode-service'); // Kept for Harvest Action

/**
 * @swagger
 * /api/planting-cycles:
 *   get:
 *     summary: List planting cycles
 *     tags: [PlantingCycles]
 *     parameters:
 *       - in: query
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of cycles
 */
router.get('/', async (req, res) => {
    try {
        const { farmId, status } = req.query;

        if (!farmId) {
            return res.status(400).json({ success: false, message: 'farmId is required' });
        }

        const cycles = await plantingService.listByFarm(farmId, status);

        res.json({
            success: true,
            count: cycles.length,
            data: cycles,
        });
    } catch (error) {
        console.error('Error fetching planting cycles:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch planting cycles' });
    }
});

/**
 * @swagger
 * /api/planting-cycles:
 *   post:
 *     summary: Create new planting cycle
 *     tags: [PlantingCycles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [farmId, plantSpeciesId, cycleName, startDate]
 *             properties:
 *               farmId:
 *                 type: string
 *               plantSpeciesId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Cycle created
 */
router.post('/', async (req, res) => {
    try {
        console.log('DEBUG PLANTING CYCLE BODY:', req.body);
        const { farmId, plantSpeciesId, cycleName, startDate } = req.body;

        if (!farmId || !plantSpeciesId || !cycleName || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'farmId, plantSpeciesId, cycleName, and startDate are required',
            });
        }

        const cycle = await plantingService.createCycle(req.body);

        res.status(201).json({
            success: true,
            message: 'Planting cycle created successfully',
            data: cycle,
        });
    } catch (error) {
        console.error('Error creating planting cycle:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/planting-cycles/{id}:
 *   get:
 *     summary: Get planting cycle details
 *     tags: [PlantingCycles]
 */
router.get('/:id', async (req, res) => {
    try {
        const cycle = await plantingService.getById(req.params.id);

        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Planting cycle not found' });
        }

        res.json({ success: true, data: cycle });
    } catch (error) {
        console.error('Error fetching planting cycle:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch planting cycle' });
    }
});

/**
 * @swagger
 * /api/planting-cycles/{id}:
 *   patch:
 *     summary: Update planting cycle
 *     tags: [PlantingCycles]
 */
router.patch('/:id', async (req, res) => {
    try {
        const cycle = await plantingService.updateCycle(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Planting cycle updated successfully',
            data: cycle,
        });
    } catch (error) {
        console.error('Error updating planting cycle:', error);
        res.status(500).json({ success: false, error: 'Failed to update planting cycle' });
    }
});

/**
 * @swagger
 * /api/planting-cycles/{id}/generate-units:
 *   post:
 *     summary: Generate PlantUnit records (Ethical Tracking)
 *     tags: [PlantingCycles]
 */
router.post('/:id/generate-units', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await plantingService.generatePlantUnits(id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json({
            success: true,
            message: result.message,
            data: { count: result.count },
        });
    } catch (error) {
        console.error('Error generating plant units:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});


/**
 * @swagger
 * /api/planting-cycles/{id}/harvest:
 *   post:
 *     summary: Harvest a planting cycle (Convert to Batch)
 *     tags: [PlantingCycles]
 */
router.post('/:id/harvest', async (req, res) => {
    // TODO: Move this logic to HarvestService eventually
    try {
        const { id } = req.params;
        const { harvestDate, actualYield, qualityGrade, notes } = req.body;

        const cycle = await prisma.plantingCycle.findUnique({ where: { id } });
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Cycle not found' });
        }

        // Generate Batch
        const batchCount = await prisma.harvestBatch.count();
        const batchNumber = `BATCH-${new Date().getFullYear()}-${String(batchCount + 1).padStart(4, '0')}`;
        const qrData = await qrcodeService.generateForRecord('BATCH', id);

        // Transaction: Create Batch + Update Cycle
        const [batch] = await prisma.$transaction([
            prisma.harvestBatch.create({
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
            }),
            prisma.plantingCycle.update({
                where: { id },
                data: {
                    status: 'HARVESTED',
                    actualHarvestDate: harvestDate ? new Date(harvestDate) : new Date(),
                    actualYield: actualYield ? parseFloat(actualYield) : null,
                },
            }),
        ]);

        res.status(201).json({
            success: true,
            message: 'Harvest batch created successfully',
            data: { batch, qrCode: qrData },
        });
    } catch (error) {
        console.error('Error harvesting cycle:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
