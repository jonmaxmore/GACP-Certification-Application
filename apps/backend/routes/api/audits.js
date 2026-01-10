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
                isDeleted: false,
            },
            orderBy: { createdAt: 'asc' },
            take: 50,
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
            isDeleted: false,
        };

        // Date filter for calendar view
        if (startDate && endDate) {
            where.scheduledDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        const audits = await prisma.application.findMany({
            where,
            orderBy: { scheduledDate: 'asc' },
            take: 100,
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
                error: 'applicationId and scheduledDate are required',
            });
        }

        // Combine date and time
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`);

        // Find application by UUID or applicationNumber (handle both formats)
        const application = await prisma.application.findFirst({
            where: {
                OR: [
                    { id: applicationId },
                    { applicationNumber: applicationId },
                ],
                isDeleted: false,
            },
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
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
                    meetingUrl: meetingUrl || undefined,
                },
                updatedBy: req.user?.id,
            },
        });

        res.json({
            success: true,
            message: 'Audit scheduled successfully',
            data: updated,
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
        if (auditorId) {updateData.auditorId = auditorId;}

        const updated = await prisma.application.update({
            where: { id },
            data: updateData,
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('[Audit] updateSchedule error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit audit result (Pass/Fail)
router.post('/:id/result', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { result, notes, auditMode } = req.body; // result: 'PASS' | 'FAIL'

        if (!result) {
            return res.status(400).json({ success: false, error: 'Result is required (PASS/FAIL)' });
        }

        const newStatus = result === 'PASS' ? 'APPROVED' : 'REVISION_REQUIRED';

        // Fetch existing application to preserve formData
        const application = await prisma.application.findUnique({ where: { id } });
        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        const existingFormData = (typeof application.formData === 'object' && application.formData) ? application.formData : {};
        const updatedFormData = {
            ...existingFormData,
            auditResult: result,
            auditNotes: notes,
            auditedAt: new Date(),
            auditMode: auditMode,
        };

        const updated = await prisma.application.update({
            where: { id },
            data: {
                status: newStatus,
                updatedBy: req.user?.id,
                formData: updatedFormData,
            },
        });

        // If Approved, we technically should enable the Farm status to ACTIVE here or via a hook.
        // For E2E, we'll handle Farm Status update separately or rely on frontend to trigger it?
        // Actually, let's update Farm status to 'ACTIVE' directly if approved.
        // If Approved, enable the Farm status to ACTIVE
        if (newStatus === 'APPROVED') {
            const appData = updated.formData;
            if (appData && appData.locationData && appData.locationData.farmId) {
                const farmId = appData.locationData.farmId;
                await prisma.farm.update({
                    where: { id: farmId },
                    data: {
                        status: 'ACTIVE',
                        verifiedAt: new Date(),
                        verifiedBy: req.user?.id,
                    },
                });
                console.log(`[Audit] Auto-activated Farm ${farmId} for Application ${updated.applicationNumber}`);
            }
        }

        res.json({
            success: true,
            message: `Audit submitted: ${result}`,
            data: updated,
        });

    } catch (error) {
        console.error('[Audit] submitResult error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
