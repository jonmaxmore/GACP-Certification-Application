/**
 * V2 Farms/Establishments API
 * Manages farmer's cultivation plots and farm data
 * 
 * GET    /api/farms/my - List current farmer's farms
 * GET    /api/farms/:id - Get farm details
 * POST   /api/farms - Create new farm
 * PATCH  /api/farms/:id - Update farm
 * DELETE /api/farms/:id - Delete farm (soft delete)
 */

const express = require('express');
const router = express.Router();
const { prisma } = require('../../services/prisma-database');
const authModule = require('../../middleware/auth-middleware');

// Safely get authenticateFarmer
const authenticateFarmer = (req, res, next) => {
    if (typeof authModule.authenticateFarmer === 'function') {
        return authModule.authenticateFarmer(req, res, next);
    }
    console.error('CRITICAL: authenticateFarmer is not a function');
    return res.status(500).json({ success: false, message: 'Auth middleware error' });
};

// Configure Upload Middleware (using shared middleware or custom if needed)
// Legacy module used 'uploads/establishments'
const upload = require('../../middleware/upload-middleware');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/farms/my
 * Get all farms for the current authenticated farmer
 */
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const farms = await prisma.farm.findMany({
            where: {
                ownerId: req.user.id,
                isDeleted: false
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                uuid: true,
                farmName: true,
                farmType: true,
                address: true,
                province: true,
                district: true,
                subDistrict: true,
                postalCode: true,
                latitude: true,
                longitude: true,
                totalArea: true,
                cultivationArea: true,
                areaUnit: true,
                cultivationMethod: true,
                irrigationType: true,
                soilType: true,
                waterSource: true,
                status: true,
                verifiedAt: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({
            success: true,
            count: farms.length,
            data: farms
        });
    } catch (error) {
        console.error('[Farms] Error fetching farms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch farms',
            error: error.message
        });
    }
});

/**
 * GET /api/farms/:id
 * Get a specific farm by ID
 */
router.get('/:id', authenticateFarmer, async (req, res) => {
    try {
        const { id } = req.params;

        const farm = await prisma.farm.findFirst({
            where: {
                id,
                ownerId: req.user.id,
                isDeleted: false
            },
            include: {
                plantingCycles: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                harvestBatches: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!farm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found'
            });
        }

        res.json({
            success: true,
            data: farm
        });
    } catch (error) {
        console.error('[Farms] Error fetching farm:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch farm',
            error: error.message
        });
    }
});

/**
 * POST /api/farms
 * Create a new farm
 * Supports 'evidence_photo' file upload
 */
router.post('/', authenticateFarmer, upload.single('evidence_photo'), async (req, res) => {
    try {
        const {
            farmName,
            farmType,
            address,
            province,
            district,
            subDistrict,
            postalCode,
            latitude,
            longitude,
            totalArea,
            cultivationArea,
            areaUnit,
            cultivationMethod,
            irrigationType,
            soilType,
            waterSource,
            landDocuments
        } = req.body;

        // Validation
        if (!farmName || !address || !province || !district || !subDistrict) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: farmName, address, province, district, subDistrict'
            });
        }

        const farm = await prisma.farm.create({
            data: {
                ownerId: req.user.id,
                farmName,
                farmType: farmType || 'CULTIVATION',
                address,
                province,
                district,
                subDistrict,
                postalCode: postalCode || '',
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                totalArea: totalArea ? parseFloat(totalArea) : 0,
                cultivationArea: cultivationArea ? parseFloat(cultivationArea) : 0,
                areaUnit: areaUnit || 'rai',
                cultivationMethod: cultivationMethod || 'OUTDOOR',
                irrigationType,
                soilType,
                waterSource,
                // Handle file upload or JSON body
                landDocuments: req.file ? {
                    images: [`/uploads/${req.file.filename}`]
                } : (landDocuments || null),
                status: 'DRAFT'
            }
        });

        console.log(`[Farms] Farm created: ${farm.id} by user ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Farm created successfully',
            data: farm
        });
    } catch (error) {
        console.error('[Farms] Error creating farm:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create farm',
            error: error.message
        });
    }
});

/**
 * PATCH /api/farms/:id
 * Update a farm
 */
router.patch('/:id', authenticateFarmer, async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existingFarm = await prisma.farm.findFirst({
            where: { id, ownerId: req.user.id, isDeleted: false }
        });

        if (!existingFarm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found or access denied'
            });
        }

        // Prepare update data (only include provided fields)
        const updateData = {};
        const allowedFields = [
            'farmName', 'farmType', 'address', 'province', 'district',
            'subDistrict', 'postalCode', 'latitude', 'longitude',
            'totalArea', 'cultivationArea', 'areaUnit', 'cultivationMethod',
            'irrigationType', 'soilType', 'waterSource', 'landDocuments'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        // Parse numeric fields
        if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
        if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
        if (updateData.totalArea) updateData.totalArea = parseFloat(updateData.totalArea);
        if (updateData.cultivationArea) updateData.cultivationArea = parseFloat(updateData.cultivationArea);

        const farm = await prisma.farm.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Farm updated successfully',
            data: farm
        });
    } catch (error) {
        console.error('[Farms] Error updating farm:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update farm',
            error: error.message
        });
    }
});

/**
 * DELETE /api/farms/:id
 * Soft delete a farm
 */
router.delete('/:id', authenticateFarmer, async (req, res) => {
    try {
        const { id } = req.params;

        // Check ownership
        const existingFarm = await prisma.farm.findFirst({
            where: { id, ownerId: req.user.id, isDeleted: false }
        });

        if (!existingFarm) {
            return res.status(404).json({
                success: false,
                message: 'Farm not found or access denied'
            });
        }

        // Soft delete
        await prisma.farm.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: req.user.id
            }
        });

        res.json({
            success: true,
            message: 'Farm deleted successfully'
        });
    } catch (error) {
        console.error('[Farms] Error deleting farm:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete farm',
            error: error.message
        });
    }
});

module.exports = router;
