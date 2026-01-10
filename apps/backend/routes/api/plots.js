const express = require('express');
const { logger } = require('../../shared');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @route POST /api/farms/:farmId/plots
 * @desc Create a new plot for a farm
 */
router.post('/farms/:farmId/plots', async (req, res) => {
    try {
        const { farmId } = req.params;
        const { name, area, areaUnit, solarSystem } = req.body;

        // Validation
        if (!name || !area) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const plot = await prisma.plot.create({
            data: {
                farmId,
                name,
                area: parseFloat(area),
                areaUnit: areaUnit || 'rai',
                solarSystem: solarSystem || 'OUTDOOR', // OUTDOOR, INDOOR, GREENHOUSE
            },
        });

        logger.info(`Created plot ${plot.id} for farm ${farmId}`);
        res.status(201).json({ success: true, data: plot });
    } catch (error) {
        logger.error(`Error creating plot: ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

/**
 * @route GET /api/farms/:farmId/plots
 * @desc Get all plots for a farm
 */
router.get('/farms/:farmId/plots', async (req, res) => {
    try {
        const { farmId } = req.params;
        const plots = await prisma.plot.findMany({
            where: { farmId },
        });
        res.json({ success: true, data: plots });
    } catch (error) {
        logger.error(`Error fetching plots: ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

/**
 * @route DELETE /api/plots/:id
 * @desc Delete a plot
 */
router.delete('/plots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.plot.delete({
            where: { id },
        });
        res.json({ success: true, message: 'Plot deleted' });
    } catch (error) {
        logger.error(`Error deleting plot: ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
