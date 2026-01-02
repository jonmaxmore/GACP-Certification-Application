/**
 * Audit Routes for Scheduling and Management
 * Uses Prisma
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const { authenticateDTAM } = require('../../middleware/auth-middleware');

// Get pending applications for scheduling
router.get('/pending-schedule', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                status: { in: ['DOCUMENT_APPROVED', 'PENDING_AUDIT', 'AWAITING_SCHEDULE'] },
                isDeleted: false
            },
            orderBy: { createdAt: 'asc' },
            take: 50
        });

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('[Audit] getPendingSchedule error:', error);
        res.json({ success: true, data: [] });
    }
});

// Get scheduled audits
router.get('/scheduled', authenticateDTAM, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {
            status: { in: ['AUDIT_SCHEDULED', 'AUDIT_IN_PROGRESS'] },
            isDeleted: false
        };

        // Date filter for calendar view
        if (startDate && endDate) {
            where.auditScheduledAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const audits = await prisma.application.findMany({
            where,
            orderBy: { auditScheduledAt: 'asc' },
            take: 100
        });

        res.json({ success: true, data: audits });
    } catch (error) {
        console.error('[Audit] getScheduled error:', error);
        res.json({ success: true, data: [] });
    }
});

// Schedule an audit
router.post('/schedule', authenticateDTAM, async (req, res) => {
    try {
        const { applicationId, scheduledDate, scheduledTime, auditorId, auditMode, meetingUrl } = req.body;

        if (!applicationId || !scheduledDate) {
            return res.status(400).json({
                success: false,
                error: 'applicationId and scheduledDate are required'
            });
        }

        // Combine date and time
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`);

        const updated = await prisma.application.update({
            where: { id: applicationId },
            data: {
                status: 'AUDIT_SCHEDULED',
                auditScheduledAt: scheduledDateTime,
                auditMode: auditMode || 'ONSITE',
                assignedAuditorId: auditorId || null,
                updatedBy: req.user?.id
            }
        });

        res.json({
            success: true,
            message: 'Audit scheduled successfully',
            data: updated
        });
    } catch (error) {
        console.error('[Audit] schedule error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update audit schedule
router.patch('/:id/schedule', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledDate, scheduledTime, auditorId, auditMode } = req.body;

        const updateData = { updatedBy: req.user?.id };

        if (scheduledDate) {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`);
            updateData.auditScheduledAt = scheduledDateTime;
        }
        if (auditorId) updateData.assignedAuditorId = auditorId;
        if (auditMode) updateData.auditMode = auditMode;

        const updated = await prisma.application.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('[Audit] updateSchedule error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
