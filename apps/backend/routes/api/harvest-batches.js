/**
 * @swagger
 * tags:
 *   name: HarvestBatches
 *   description: Harvest batch tracking and traceability
 */

const express = require('express');
const router = express.Router();
const harvestService = require('../../services/harvest-service');

/**
 * @swagger
 * /api/harvest-batches:
 *   get:
 *     summary: List harvest batches
 *     tags: [HarvestBatches]
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
 *         description: List of batches
 */
router.get('/', async (req, res) => {
    try {
        const batches = await harvestService.list(req.query);
        res.json({
            success: true,
            count: batches.length,
            data: batches,
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch batches' });
    }
});

/**
 * @swagger
 * /api/harvest-batches/{id}:
 *   get:
 *     summary: Get harvest batch details
 *     tags: [HarvestBatches]
 */
router.get('/:id', async (req, res) => {
    try {
        const batch = await harvestService.getById(req.params.id);

        if (!batch) {
            return res.status(404).json({ success: false, error: 'Harvest batch not found' });
        }

        res.json({ success: true, data: batch });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch batch' });
    }
});

/**
 * @swagger
 * /api/harvest-batches/lot/{batchNumber}:
 *   get:
 *     summary: Traceability lookup by Lot Number (Public)
 *     tags: [HarvestBatches]
 *     parameters:
 *       - in: path
 *         name: batchNumber
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/lot/:batchNumber', async (req, res) => {
    try {
        const batch = await harvestService.getByBatchNumber(req.params.batchNumber);

        if (!batch) {
            return res.status(404).json({ success: false, error: 'Lot number not found' });
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
        res.status(500).json({ success: false, error: 'Traceability lookup failed' });
    }
});

/**
 * @swagger
 * /api/harvest-batches:
 *   post:
 *     summary: Create new harvest batch (Growing Phase)
 *     tags: [HarvestBatches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [farmId, speciesId, plantingDate]
 *             properties:
 *               farmId:
 *                 type: string
 *               speciesId:
 *                 type: integer
 *               plantingDate:
 *                 type: string
 *                 format: date
 */
router.post('/', async (req, res) => {
    try {
        const { farmId, speciesId, plantingDate } = req.body;

        if (!farmId || !speciesId || !plantingDate) {
            return res.status(400).json({
                success: false,
                error: 'farmId, speciesId, and plantingDate are required',
            });
        }

        const batch = await harvestService.createBatch(req.body);

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
 * @swagger
 * /api/harvest-batches/{id}:
 *   put:
 *     summary: Update harvest batch
 *     tags: [HarvestBatches]
 */
router.put('/:id', async (req, res) => {
    try {
        const batch = await harvestService.updateBatch(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Harvest batch updated successfully',
            data: batch,
        });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update batch' });
    }
});

/**
 * @swagger
 * /api/harvest-batches/{id}/harvest:
 *   post:
 *     summary: Record harvest (Complete Batch)
 *     tags: [HarvestBatches]
 */
router.post('/:id/harvest', async (req, res) => {
    try {
        const batch = await harvestService.recordHarvest(req.params.id, req.body);
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
 * @swagger
 * /api/harvest-batches/stats/{farmId}:
 *   get:
 *     summary: Get harvest statistics
 *     tags: [HarvestBatches]
 */
router.get('/stats/:farmId', async (req, res) => {
    try {
        const stats = await harvestService.getStats(req.params.farmId);
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('[HarvestBatch API] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

module.exports = router;
