/**
 * Audit Routes for Scheduling and Management (Migrated to V2)
 * Uses Prisma
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const authModule = require('../../middleware/auth-middleware');

const authenticateDTAM = authModule.authenticateDTAM;

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
            where.scheduledDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const audits = await prisma.application.findMany({
            where,
            orderBy: { scheduledDate: 'asc' },
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

        // Find application by UUID or applicationNumber (handle both formats)
        const application = await prisma.application.findFirst({
            where: {
                OR: [
                    { id: applicationId },
                    { applicationNumber: applicationId }
                ],
                isDeleted: false
            }
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        // Get existing formData
        const existingFormData = (typeof application.formData === 'object' && application.formData) ? application.formData : {};

        const updated = await prisma.application.update({
            where: { id: application.id },
            data: {
                status: 'AUDIT_SCHEDULED',
                scheduledDate: scheduledDateTime,
                auditorId: auditorId || null,
                formData: {
                    ...existingFormData,
                    auditMode: auditMode || 'ONSITE',
                    meetingUrl: meetingUrl || undefined
                },
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
            updateData.scheduledDate = scheduledDateTime;
        }
        if (auditorId) updateData.auditorId = auditorId;

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
