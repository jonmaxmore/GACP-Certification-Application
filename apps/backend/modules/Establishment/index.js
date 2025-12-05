/**
 * Establishment Module
 * Handles farm establishment management
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const logger = require('../../shared/logger');
const mongoose = require('mongoose');

// Service Logic
class EstablishmentService {
    constructor() {
        this.collectionName = 'establishments';
    }

    get collection() {
        return mongoose.connection.collection(this.collectionName);
    }

    async create(data) {
        const establishment = {
            id: uuidv4(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active'
        };

        await this.collection.insertOne(establishment);
        return establishment;
    }

    async getById(id) {
        return await this.collection.findOne({ id });
    }
}

const service = new EstablishmentService();

// Routes
/**
 * @swagger
 * components:
 *   schemas:
 *     Establishment:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - address
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Name of the establishment
 *         type:
 *           type: string
 *           enum: [farm, shop, processing, extraction]
 *           description: Type of establishment
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             zipCode:
 *               type: string
 *         coordinates:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *             lng:
 *               type: number
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: List of image URLs
 */

// Routes

/**
 * @swagger
 * /api/v2/establishments:
 *   post:
 *     summary: Create a new establishment
 *     tags: [Establishments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Establishment'
 *     responses:
 *       201:
 *         description: Establishment created successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
    try {
        const establishment = await service.create(req.body);
        res.status(201).json({
            success: true,
            data: establishment
        });
    } catch (error) {
        logger.error('Create establishment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/v2/establishments:
 *   get:
 *     summary: Get list of my establishments
 *     tags: [Establishments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of establishments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Establishment'
 */
router.get('/', async (req, res) => {
    // Stub implementation for list
    try {
        // In real app: service.findAll({ owner: req.user.id })
        const establishments = await service.collection.find().toArray();
        res.json({
            success: true,
            data: establishments
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/v2/establishments/{id}:
 *   get:
 *     summary: Get establishment details
 *     tags: [Establishments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Establishment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Establishment'
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req, res) => {
    try {
        const establishment = await service.getById(req.params.id);
        if (!establishment) {
            return res.status(404).json({
                success: false,
                error: 'Establishment not found'
            });
        }
        res.json({
            success: true,
            data: establishment
        });
    } catch (error) {
        logger.error('Get establishment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/v2/establishments/{id}:
 *   put:
 *     summary: Update establishment details
 *     tags: [Establishments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Establishment'
 *     responses:
 *       200:
 *         description: Establishment updated
 */
router.put('/:id', async (req, res) => {
    try {
        await service.collection.updateOne({ id: req.params.id }, { $set: { ...req.body, updatedAt: new Date() } });
        res.json({ success: true, message: 'Establishment updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/v2/establishments/{id}:
 *   delete:
 *     summary: Delete establishment
 *     tags: [Establishments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Establishment deleted
 */
router.delete('/:id', async (req, res) => {
    try {
        await service.collection.deleteOne({ id: req.params.id });
        res.json({ success: true, message: 'Establishment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
