const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/standards
 * List all active certification standards with their requirements
 */
router.get('/', async (req, res) => {
    try {
        const standards = await prisma.certificationStandard.findMany({
            where: { isActive: true },
            include: {
                requirements: {
                    orderBy: { sortOrder: 'asc' },
                },
            },
            orderBy: { sortOrder: 'asc' },
        });

        res.json({
            success: true,
            count: standards.length,
            data: standards,
        });
    } catch (error) {
        console.error('Error fetching standards:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch standards',
            error: error.message,
        });
    }
});

module.exports = router;
