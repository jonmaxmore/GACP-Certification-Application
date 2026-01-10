/**
 * Dashboard API Routes
 * GET /api/dashboard/stats - Get farmer dashboard statistics
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authModule = require('../../middleware/auth-middleware');

// Safely get authenticateFarmer
const authenticateFarmer = (req, res, next) => {
    if (typeof authModule.authenticateFarmer === 'function') {
        return authModule.authenticateFarmer(req, res, next);
    }
    // Fallback or error if middleware is missing
    return res.status(500).json({ success: false, message: 'Auth middleware error' });
};

/**
 * GET /api/dashboard/stats
 * Returns: { success: true, data: { applications: number, farms: number, notices: number } }
 */
router.get('/stats', authenticateFarmer, async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // 1. Count Applications
        const applicationsCount = await prisma.application.count({
            where: {
                farmerId: userId,
                isDeleted: false,
            },
        });

        // 2. Count Farms (Establishments)
        const farmsCount = await prisma.farm.count({
            where: {
                ownerId: userId,
                isDeleted: false,
            },
        });

        // 3. Count Unread Notifications (Notices)
        // Check if Notification model exists and has correct fields
        let noticesCount = 0;
        try {
            noticesCount = await prisma.notification.count({
                where: {
                    userId: userId,
                    isRead: false,
                },
            });
        } catch (e) {
            // Notification model might be different or not exist yet
            console.warn('Notification count failed, returning 0', e.message);
        }

        res.json({
            success: true,
            data: {
                applications: applicationsCount,
                farms: farmsCount,
                notices: noticesCount,
            },
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message,
        });
    }
});

module.exports = router;
