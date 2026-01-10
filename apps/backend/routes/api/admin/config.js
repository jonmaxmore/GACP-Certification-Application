const express = require('express');
const router = express.Router();
const { prisma } = require('../../../services/prisma-database');
const logger = require('../../../shared/logger');

// GET /api/admin/config - Get all system configs
router.get('/', async (req, res) => {
    try {
        const configs = await prisma.systemConfig.findMany({
            orderBy: { key: 'asc' }
        });

        // Transform array to object for easier frontend consumption, OR return array
        // Let's return array as it preserves metadata like type/description
        res.json({ success: true, data: configs });
    } catch (error) {
        logger.error('Failed to fetch configs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch configurations' });
    }
});

// PATCH /api/admin/config/:key - Update config
router.patch('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value, type, description } = req.body;

        // Upsert allows creating new configs on the fly
        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: {
                value: String(value),
                updatedBy: 'ADMIN', // Fixed syntax
            },
            create: {
                key,
                value: String(value),
                type: type || 'STRING',
                description: description || '',
                updatedBy: 'ADMIN'
            }
        });

        logger.info(`Config updated: ${key} = ${value}`);
        res.json({ success: true, data: config });
    } catch (error) {
        logger.error('Failed to update config:', error);
        res.status(500).json({ success: false, error: 'Failed to update configuration' });
    }
});

module.exports = router;
