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
        // 1. Total Applications
        const total = await prisma.application.count({
            where: { isDeleted: false },
        });

        // 2. By Status Group
        const statusGroups = await prisma.application.groupBy({
            by: ['status'],
            _count: { status: true },
            where: { isDeleted: false },
        });

        // Map typical status to categories
        let pendingReview = 0; // Document Check
        let pendingAudit = 0;  // Audit / Payment 2
        let approved = 0;
        let rejected = 0;

        statusGroups.forEach(group => {
            const s = group.status;
            const count = group._count.status;

            if (['DOCUMENT_CHECKING', 'SUBMITTED', 'REVISION_REQUIRED'].includes(s)) {
                pendingReview += count;
            } else if (['PAYMENT_2_PENDING', 'AUDIT_PENDING', 'AUDIT_SCHEDULED', 'AUDIT_IN_PROGRESS', 'AWAITING_SCHEDULE', 'PENDING_AUDIT'].includes(s)) {
                pendingAudit += count;
            } else if (s === 'APPROVED') {
                approved += count;
            } else if (s === 'REJECTED') {
                rejected += count;
            }
        });

        res.json({
            success: true,
            data: {
                total,
                pendingReview,
                pendingAudit,
                approved,
                rejected,
                // Optional: Monthly trend mock
                monthlyStats: [
                    { name: 'ม.ค.', value: 10 },
                    { name: 'ก.พ.', value: 15 },
                    { name: 'มี.ค.', value: total },
                ],
            },
        });

    } catch (error) {
        console.error('[Reports] Dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate report' });
    }
});

module.exports = router;
