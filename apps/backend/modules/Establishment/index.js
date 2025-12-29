/**
 * Establishment Module - Prisma Version
 * Handles farm establishment management using PostgreSQL
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../../shared/logger');
const prismaDatabase = require('../../services/prisma-database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../../middleware/auth-middleware');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/establishments';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Prisma-based Establishment Service
class EstablishmentService {
    constructor() {
        this.prisma = null;
    }

    get client() {
        if (!this.prisma) {
            this.prisma = prismaDatabase.getClient();
        }
        return this.prisma;
    }

    async create(data) {
        const establishment = await this.client.farm.create({
            data: {
                id: uuidv4(),
                farmName: data.name || data.farmName || 'Unnamed',
                farmType: data.type || 'CULTIVATION',
                address: data.address?.street || data.address || '',
                province: data.address?.city || data.province || '',
                district: data.district || '',
                subDistrict: data.subDistrict || '',
                postalCode: data.address?.zipCode || data.postalCode || '',
                latitude: data.location?.coordinates?.[1] || data.latitude || null,
                longitude: data.location?.coordinates?.[0] || data.longitude || null,
                totalArea: parseFloat(data.totalArea) || 0,
                cultivationArea: parseFloat(data.cultivationArea) || 0,
                cultivationMethod: data.cultivationMethod || 'CONVENTIONAL',
                status: 'DRAFT',
                ownerId: data.owner,
                landDocuments: data.images ? { images: data.images } : {}
            }
        });
        return establishment;
    }

    async getById(id) {
        return await this.client.farm.findFirst({
            where: { id }
        });
    }

    async getByOwner(ownerId) {
        return await this.client.farm.findMany({
            where: {
                ownerId,
                isDeleted: false
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getAll() {
        return await this.client.farm.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' }
        });
    }

    async update(id, data) {
        return await this.client.farm.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }

    async delete(id) {
        return await this.client.farm.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            }
        });
    }
}

const service = new EstablishmentService();

// Apply Authentication to all routes
router.use(authenticate);

// GET /my-establishments - Get user's establishments
router.get('/my-establishments', async (req, res) => {
    try {
        const establishments = await service.getByOwner(req.user.userId);
        res.json({
            success: true,
            data: establishments
        });
    } catch (error) {
        logger.error('Get my establishments error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST / - Create establishment
router.post('/', upload.single('evidence_photo'), async (req, res) => {
    try {
        const establishmentData = {
            ...req.body,
            owner: req.user.userId
        };

        if (req.file) {
            const imageUrl = `/uploads/establishments/${req.file.filename}`;
            establishmentData.images = [imageUrl];
        }

        if (establishmentData.latitude && establishmentData.longitude) {
            establishmentData.location = {
                type: 'Point',
                coordinates: [
                    parseFloat(establishmentData.longitude),
                    parseFloat(establishmentData.latitude)
                ]
            };
        }

        const establishment = await service.create(establishmentData);
        res.status(201).json({
            success: true,
            data: establishment
        });
    } catch (error) {
        logger.error('Create establishment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET / - List all establishments (Admin only, or own for farmers)
router.get('/', async (req, res) => {
    try {
        if (!['admin', 'officer', 'dtam_staff', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            const establishments = await service.getByOwner(req.user.userId);
            return res.json({ success: true, data: establishments });
        }

        const establishments = await service.getAll();
        res.json({ success: true, data: establishments });
    } catch (error) {
        logger.error('List establishments error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /:id - Get establishment by ID
router.get('/:id', async (req, res) => {
    try {
        const establishment = await service.getById(req.params.id);
        if (!establishment) {
            return res.status(404).json({ success: false, error: 'Establishment not found' });
        }
        res.json({ success: true, data: establishment });
    } catch (error) {
        logger.error('Get establishment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /:id - Update establishment
router.put('/:id', async (req, res) => {
    try {
        const establishment = await service.update(req.params.id, req.body);
        res.json({ success: true, data: establishment });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Establishment not found' });
        }
        logger.error('Update establishment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /:id - Soft delete establishment
router.delete('/:id', async (req, res) => {
    try {
        await service.delete(req.params.id);
        res.json({ success: true, message: 'Establishment deleted' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Establishment not found' });
        }
        logger.error('Delete establishment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
