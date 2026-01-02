/**
 * Simple Application Routes for Staff Dashboard
 * Uses Prisma instead of legacy Mongoose models
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const { authenticateDTAM } = require('../../middleware/auth-middleware');

// Get pending reviews (applications with status PENDING_REVIEW or SUBMITTED)
router.get('/pending-reviews', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                status: {
                    in: ['SUBMITTED', 'PENDING_REVIEW', 'DRAFT']
                },
                isDeleted: false
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('[Applications] getPendingReviews error:', error);
        res.json({ success: true, data: [] }); // Return empty array on error
    }
});

// Get dashboard stats
router.get('/stats', authenticateDTAM, async (req, res) => {
    try {
        // Calculate today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [total, pending, approved, revenue, todayChecked] = await Promise.all([
            prisma.application.count({ where: { isDeleted: false } }),
            prisma.application.count({ where: { status: { in: ['SUBMITTED', 'PENDING_REVIEW'] }, isDeleted: false } }),
            prisma.application.count({ where: { status: 'APPROVED', isDeleted: false } }),
            prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { status: 'paid' } }),
            prisma.application.count({
                where: {
                    updatedAt: { gte: today, lt: tomorrow },
                    status: { notIn: ['DRAFT', 'SUBMITTED'] },
                    isDeleted: false
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                total: total || 0,
                pending: pending || 0,
                approved: approved || 0,
                revenue: revenue._sum?.totalAmount || 0,
                todayChecked: todayChecked || 0
            }
        });
    } catch (error) {
        console.error('[Applications] getStats error:', error);
        res.json({
            success: true,
            data: { total: 0, pending: 0, approved: 0, revenue: 0, todayChecked: 0 }
        });
    }
});

// Get auditor assignments
router.get('/auditor/assignments', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                status: { in: ['AUDIT_PENDING', 'AUDIT_SCHEDULED'] },
                isDeleted: false
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('[Applications] getAuditorAssignments error:', error);
        res.json({ success: true, data: [] });
    }
});

// Get single application (by ID or applicationNumber)
router.get('/:id', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;

        // Try to find by applicationNumber first (APP-xxx format)
        let application = await prisma.application.findFirst({
            where: {
                OR: [
                    { id: id },
                    { applicationNumber: id }
                ],
                isDeleted: false
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                        province: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: `Application ${id} not found`
            });
        }

        res.json({ success: true, data: application });
    } catch (error) {
        console.error('[Applications] getById error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Review document (approve/reject)
router.post('/:id/review', authenticateDTAM, async (req, res) => {
    try {
        const { action, comment } = req.body;
        const { id } = req.params;

        const newStatus = action === 'APPROVE' ? 'DOCUMENT_APPROVED' : 'REVISION_REQUIRED';

        const updated = await prisma.application.update({
            where: { id },
            data: {
                status: newStatus,
                updatedBy: req.user?.id
            }
        });

        res.json({ success: true, data: updated, message: `Application ${newStatus}` });
    } catch (error) {
        console.error('[Applications] review error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
