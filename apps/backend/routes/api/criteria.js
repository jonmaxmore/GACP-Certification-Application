/**
 * Supplementary Criteria API
 * Manages dynamic criteria for application form (step-12)
 * 
 * GET    /api/criteria - List active criteria (public)
 * GET    /api/criteria/all - List all criteria (admin)
 * POST   /api/criteria - Create criterion (admin)
 * PATCH  /api/criteria/:id - Update criterion (admin)
 * DELETE /api/criteria/:id - Delete criterion (admin)
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');
const authModule = require('../../middleware/auth-middleware');

const authenticateDTAM = authModule.authenticateDTAM;

/**
 * GET /api/criteria
 * Get all active supplementary criteria (public - for form)
 */
router.get('/', async (req, res) => {
    try {
        const criteria = await prisma.supplementaryCriterion.findMany({
            where: { isActive: true },
            orderBy: [
                { category: 'asc' },
                { sortOrder: 'asc' },
            ],
            select: {
                id: true,
                code: true,
                category: true,
                categoryTH: true,
                label: true,
                description: true,
                icon: true,
                isRequired: true,
                inputType: true,
                sortOrder: true,
            },
        });

        // Group by category
        const grouped = criteria.reduce((acc, item) => {
            const cat = item.category;
            if (!acc[cat]) {
                acc[cat] = {
                    category: cat,
                    categoryTH: item.categoryTH || cat,
                    icon: item.icon,
                    items: [],
                };
            }
            acc[cat].items.push({
                id: item.id,
                code: item.code,
                label: item.label,
                description: item.description,
                isRequired: item.isRequired,
                inputType: item.inputType,
            });
            return acc;
        }, {});

        res.json({
            success: true,
            count: criteria.length,
            data: Object.values(grouped),
        });
    } catch (error) {
        console.error('Error fetching criteria:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch criteria',
            error: error.message,
        });
    }
});

/**
 * GET /api/criteria/all
 * Get all criteria including inactive (admin only)
 */
router.get('/all', authenticateDTAM, async (req, res) => {
    try {
        const criteria = await prisma.supplementaryCriterion.findMany({
            orderBy: [
                { category: 'asc' },
                { sortOrder: 'asc' },
            ],
        });

        res.json({
            success: true,
            count: criteria.length,
            data: criteria,
        });
    } catch (error) {
        console.error('Error fetching all criteria:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch criteria',
            error: error.message,
        });
    }
});

/**
 * POST /api/criteria
 * Create new criterion (admin only)
 */
router.post('/', authenticateDTAM, async (req, res) => {
    try {
        const {
            code,
            category,
            categoryTH,
            label,
            description,
            icon,
            sortOrder,
            isRequired,
            inputType,
        } = req.body;

        // Validation
        if (!code || !category || !label) {
            return res.status(400).json({
                success: false,
                message: 'code, category, and label are required',
            });
        }

        // Check unique code
        const existing = await prisma.supplementaryCriterion.findUnique({
            where: { code },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: `Criterion with code '${code}' already exists`,
            });
        }

        const criterion = await prisma.supplementaryCriterion.create({
            data: {
                code: code.toUpperCase(),
                category,
                categoryTH,
                label,
                description,
                icon,
                sortOrder: sortOrder || 0,
                isRequired: isRequired || false,
                inputType: inputType || 'checkbox',
                createdBy: req.user?.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Criterion created successfully',
            data: criterion,
        });
    } catch (error) {
        console.error('Error creating criterion:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create criterion',
            error: error.message,
        });
    }
});

/**
 * PATCH /api/criteria/:id
 * Update criterion (admin only)
 */
router.patch('/:id', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body, updatedBy: req.user?.id };

        // Remove fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.createdAt;

        const criterion = await prisma.supplementaryCriterion.update({
            where: { id },
            data: updateData,
        });

        res.json({
            success: true,
            message: 'Criterion updated successfully',
            data: criterion,
        });
    } catch (error) {
        console.error('Error updating criterion:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Criterion not found',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update criterion',
            error: error.message,
        });
    }
});

/**
 * DELETE /api/criteria/:id
 * Delete criterion (admin only)
 */
router.delete('/:id', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.supplementaryCriterion.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Criterion deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting criterion:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Criterion not found',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete criterion',
            error: error.message,
        });
    }
});

module.exports = router;
