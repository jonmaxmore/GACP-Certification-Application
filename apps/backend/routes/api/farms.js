/**
 * @swagger
 * tags:
 *   name: Farms
 *   description: Farm establishment management
 */

const express = require('express');
const router = express.Router();
const farmService = require('../../services/farm-service');
const { authenticateFarmer } = require('../../middleware/auth-middleware');
const upload = require('../../middleware/upload-middleware');

/**
 * @swagger
 * /api/farms/my:
 *   get:
 *     summary: Get all my farms
 *     tags: [Farms]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of farms
 */
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const farms = await farmService.getByOwner(req.user.id);
        res.json({
            success: true,
            count: farms.length,
            data: farms,
        });
    } catch (error) {
        console.error('[Farms] Error fetching farms:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch farms' });
    }
});

/**
 * @swagger
 * /api/farms/{id}:
 *   get:
 *     summary: Get farm details
 *     tags: [Farms]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', authenticateFarmer, async (req, res) => {
    try {
        const farm = await farmService.getById(req.params.id, req.user.id);

        if (!farm) {
            return res.status(404).json({ success: false, message: 'Farm not found' });
        }

        res.json({ success: true, data: farm });
    } catch (error) {
        console.error('[Farms] Error fetching farm:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch farm' });
    }
});

/**
 * @swagger
 * /api/farms:
 *   post:
 *     summary: Create new farm
 *     tags: [Farms]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               farmName:
 *                 type: string
 *               address:
 *                 type: string
 *               evidence_photo:
 *                 type: string
 *                 format: binary
 */
router.post('/', authenticateFarmer, upload.single('evidence_photo'), async (req, res) => {
    try {
        const { farmName, address, province, district, subDistrict } = req.body;

        if (!farmName || !address || !province || !district || !subDistrict) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        const farm = await farmService.createFarm(req.user.id, req.body, req.file);

        console.log(`[Farms] Farm created: ${farm.id} by user ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Farm created successfully',
            data: farm,
        });
    } catch (error) {
        console.error('[Farms] Error creating farm:', error);
        res.status(500).json({ success: false, error: 'Failed to create farm' });
    }
});

/**
 * @swagger
 * /api/farms/{id}:
 *   patch:
 *     summary: Update farm
 *     tags: [Farms]
 *     security:
 *       - BearerAuth: []
 */
router.patch('/:id', authenticateFarmer, async (req, res) => {
    try {
        const updated = await farmService.updateFarm(req.params.id, req.user.id, req.body);

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Farm not found or access denied' });
        }

        res.json({
            success: true,
            message: 'Farm updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error('[Farms] Error updating farm:', error);
        res.status(500).json({ success: false, error: 'Failed to update farm' });
    }
});

/**
 * @swagger
 * /api/farms/{id}:
 *   delete:
 *     summary: Delete farm
 *     tags: [Farms]
 *     security:
 *       - BearerAuth: []
 */
router.delete('/:id', authenticateFarmer, async (req, res) => {
    try {
        const deleted = await farmService.deleteFarm(req.params.id, req.user.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Farm not found or access denied' });
        }

        res.json({ success: true, message: 'Farm deleted successfully' });
    } catch (error) {
        console.error('[Farms] Error deleting farm:', error);
        res.status(500).json({ success: false, error: 'Failed to delete farm' });
    }
});

/**
 * @swagger
 * /api/farms/{id}/qrcode:
 *   get:
 *     summary: Get Farm QR Code Sticker
 *     tags: [Farms]
 *     security:
 *       - BearerAuth: []
 */
router.get('/:id/qrcode', authenticateFarmer, async (req, res) => {
    try {
        const html = await farmService.generateQRCode(req.params.id, req.user.id);

        if (!html) {
            return res.status(404).send('Farm not found');
        }

        res.send(html);
    } catch (error) {
        console.error('[Farms] QR error:', error);
        res.status(500).send('Error generating QR Code');
    }
});

module.exports = router;
