/**
 * Plants API Routes
 * CRUD operations for PlantSpecies table
 * 
 * @version 1.0.0
 * @testable Postman
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');

// ============================================================================
// PLANT SPECIES API
// ============================================================================

/**
 * @route   GET /api/v2/plants
 * @desc    Get all plant species
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/plants
 */
router.get('/', async (req, res) => {
    try {
        const { category, isActive } = req.query;

        const where = {};
        if (category) where.gacpCategory = category;
        if (isActive !== undefined) where.isActive = isActive === 'true';

        const plants = await prisma.plantSpecies.findMany({
            where,
            orderBy: { thaiName: 'asc' }
        });

        res.json({
            success: true,
            count: plants.length,
            data: plants
        });
    } catch (error) {
        console.error('[Plants API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/plants/:id
 * @desc    Get plant by ID
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/plants/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const plant = await prisma.plantSpecies.findUnique({
            where: { id }
        });

        if (!plant) {
            return res.status(404).json({
                success: false,
                error: 'Plant not found'
            });
        }

        res.json({
            success: true,
            data: plant
        });
    } catch (error) {
        console.error('[Plants API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/v2/plants
 * @desc    Create new plant species
 * @access  Admin
 * @test    POST http://localhost:3000/api/v2/plants
 */
router.post('/', async (req, res) => {
    try {
        const {
            thaiName,
            englishName,
            scientificName,
            familyName,
            gacpCategory,
            dtamPlantCode,
            cultivationType = 'SELF_GROWN',
            propagationMethod,
            growingDurationDays,
            harvestCycle,
            usableParts,
            processingType,
            imageUrl,
            description
        } = req.body;

        // Validate required fields
        if (!thaiName || !scientificName || !gacpCategory) {
            return res.status(400).json({
                success: false,
                error: 'thaiName, scientificName, and gacpCategory are required'
            });
        }

        const plant = await prisma.plantSpecies.create({
            data: {
                thaiName,
                scientificName,
                englishName,
                familyName,
                gacpCategory,
                dtamPlantCode,
                cultivationType,
                propagationMethod,
                growingDurationDays,
                harvestCycle,
                usableParts,
                processingType,
                imageUrl,
                description
            }
        });

        res.status(201).json({
            success: true,
            message: 'Plant created successfully',
            data: plant
        });
    } catch (error) {
        console.error('[Plants API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   PUT /api/v2/plants/:id
 * @desc    Update plant species
 * @access  Admin
 * @test    PUT http://localhost:3000/api/v2/plants/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if plant exists
        const existing = await prisma.plantSpecies.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Plant not found'
            });
        }

        const plant = await prisma.plantSpecies.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Plant updated successfully',
            data: plant
        });
    } catch (error) {
        console.error('[Plants API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   DELETE /api/v2/plants/:id
 * @desc    Soft delete plant species
 * @access  Admin
 * @test    DELETE http://localhost:3000/api/v2/plants/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if plant exists
        const existing = await prisma.plantSpecies.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Plant not found'
            });
        }

        // Soft delete
        await prisma.plantSpecies.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({
            success: true,
            message: 'Plant deleted successfully'
        });
    } catch (error) {
        console.error('[Plants API] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/v2/plants/categories/list
 * @desc    Get list of GACP categories
 * @access  Public
 * @test    GET http://localhost:3000/api/v2/plants/categories/list
 */
router.get('/categories/list', async (req, res) => {
    try {
        const categories = [
            { code: 'CONTROLLED', name: 'พืชควบคุม', englishName: 'Controlled Plants', examples: ['กัญชา', 'กระท่อม'] },
            { code: 'MEDICINAL', name: 'พืชสมุนไพร', englishName: 'Medicinal Plants', examples: ['ขมิ้นชัน', 'ขิง', 'ไพล'] },
            { code: 'AROMATIC', name: 'พืชหอมระเหย', englishName: 'Aromatic Plants', examples: ['ตะไคร้', 'มะกรูด'] },
            { code: 'COSMETIC', name: 'พืชเครื่องสำอาง', englishName: 'Cosmetic Plants', examples: ['ว่านหางจระเข้', 'มะขาม'] }
        ];

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
