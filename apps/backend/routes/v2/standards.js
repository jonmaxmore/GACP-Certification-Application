/**
 * V2 Standards API Route
 * Provides endpoints for certification standards management
 * 
 * GET /api/v2/standards - List all standards
 * GET /api/v2/standards/:code - Get standard details with requirements
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');

/**
 * GET /api/v2/standards
 * Get all active certification standards
 */
router.get('/', async (req, res) => {
    try {
        const standards = await prisma.certificationStandard.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
                code: true,
                name: true,
                nameTH: true,
                description: true,
                version: true,
                targetMarket: true,
                logoUrl: true
            }
        });

        res.json({
            success: true,
            count: standards.length,
            data: standards
        });
    } catch (error) {
        console.error('Error fetching standards:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch standards',
            error: error.message
        });
    }
});

/**
 * GET /api/v2/standards/:code
 * Get standard details with requirements
 */
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const standard = await prisma.certificationStandard.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                requirements: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        if (!standard) {
            return res.status(404).json({
                success: false,
                message: `Standard '${code}' not found`
            });
        }

        res.json({
            success: true,
            data: standard
        });
    } catch (error) {
        console.error('Error fetching standard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch standard',
            error: error.message
        });
    }
});

/**
 * GET /api/v2/standards/:code/requirements
 * Get requirements for a specific standard
 */
router.get('/:code/requirements', async (req, res) => {
    try {
        const { code } = req.params;
        const { category } = req.query;

        const standard = await prisma.certificationStandard.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!standard) {
            return res.status(404).json({
                success: false,
                message: `Standard '${code}' not found`
            });
        }

        const whereClause = { standardId: standard.id };
        if (category) {
            whereClause.category = category.toUpperCase();
        }

        const requirements = await prisma.standardRequirement.findMany({
            where: whereClause,
            orderBy: { sortOrder: 'asc' }
        });

        res.json({
            success: true,
            standardCode: code.toUpperCase(),
            count: requirements.length,
            data: requirements
        });
    } catch (error) {
        console.error('Error fetching requirements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requirements',
            error: error.message
        });
    }
});

module.exports = router;
