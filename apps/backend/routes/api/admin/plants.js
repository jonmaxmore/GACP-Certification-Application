const express = require('express');
const router = express.Router();
const { prisma } = require('../../../services/prisma-database');

// GET /api/admin/plants - List all (including inactive)
router.get('/', async (req, res) => {
    const plants = await prisma.plantSpecies.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: plants });
});

// POST /api/admin/plants - Create new plant
router.post('/', async (req, res) => {
    // Todo: Implement create logic
    res.status(201).json({ success: true, message: 'Plant created (Mock)' });
});

// PATCH /api/admin/plants/:id - Update
router.patch('/:id', async (req, res) => {
    res.json({ success: true, message: 'Plant updated (Mock)' });
});

module.exports = router;
