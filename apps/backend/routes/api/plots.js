const express = require('express');
const { logger } = require('../../shared');
const { prisma } = require('../../services/prisma-database');

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

        // 1. Fetch Farm to Check Authorization
        const farm = await prisma.farm.findUnique({ where: { id: farmId } });
        if (!farm) {
            return res.status(404).json({ success: false, message: 'Farm not found' });
        }

        // 2. Validate Cultivation Method (The License Lock)
        // If farm is authorized for OUTDOOR, they cannot create INDOOR plots
        const requestedSystem = solarSystem || 'OUTDOOR';
        if (farm.cultivationMethod !== 'BOTH' && farm.cultivationMethod !== requestedSystem) {
            return res.status(400).json({
                success: false,
                message: `ไม่อนุญาต: ฟาร์มของคุณได้รับรองแบบ ${farm.cultivationMethod} ไม่สามารถสร้างแปลงแบบ ${requestedSystem} ได้`,
            });
        }

        // 3. Validate Area (Optional: Check against total limit)
        // const existingPlots = await prisma.plot.aggregate({ where: { farmId }, _sum: { area: true } });
        // const currentTotal = existingPlots._sum.area || 0;
        // if (currentTotal + parseFloat(area) > farm.cultivationArea) {
        //      return res.status(400).json({ success: false, message: 'พื้นที่แปลงรวมเกินพื้นที่ขออนุญาต' });
        // }

        const plot = await prisma.plot.create({
            data: {
                farmId,
                name,
                area: parseFloat(area),
                areaUnit: areaUnit || 'rai',
                solarSystem: requestedSystem,
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
