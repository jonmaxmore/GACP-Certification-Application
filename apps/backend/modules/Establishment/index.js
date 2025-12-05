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

module.exports = router;
