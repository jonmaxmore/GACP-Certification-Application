/**
 * Reports & Analytics Routes
 * Provides statistical data for Staff Dashboard
 */
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authModule = require('../../middleware/auth-middleware');

// Extract authentication functions safely
const authenticateDTAM = authModule.authenticateDTAM;

/**
 * GET /api/reports/dashboard
 * Summary stats for Dashboard Charts
 */
router.get('/dashboard', authenticateDTAM, async (req, res) => {
    try {
        const metricsService = require('../../services/metrics-service');
        const stats = await metricsService.getDashboardStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('[Reports] Dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate report' });
    }
});

module.exports = router;
