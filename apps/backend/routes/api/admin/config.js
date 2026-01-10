const express = require('express');
const router = express.Router();
const { prisma } = require('../../../services/prisma-database');

// GET /api/admin/config - Get all system configs
router.get('/', async (req, res) => {
    // In future: fetch from SystemConfig table
    // For now return hardcoded with structure
    res.json({
        success: true,
        data: [
            { key: 'pricing.fee.doc_review', value: '5000', type: 'NUMBER' },
            { key: 'pricing.fee.inspection', value: '25000', type: 'NUMBER' },
        ],
    });
});

// PATCH /api/admin/config/:key - Update config
router.patch('/:key', async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    // Todo: Implement DB update
    res.json({ success: true, message: `Updated ${key} to ${value}` });
});

module.exports = router;
