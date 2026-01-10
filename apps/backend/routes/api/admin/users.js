const express = require('express');
const router = express.Router();
const { prisma } = require('../../../services/prisma-database');

// GET /api/admin/users - Search users
router.get('/', async (req, res) => {
    // Mock user list
    res.json({ success: true, data: [] });
});

module.exports = router;
