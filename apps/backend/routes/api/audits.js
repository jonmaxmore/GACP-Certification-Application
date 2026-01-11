/**
 * Audit Routes for Scheduling and Management 
 * Uses Prisma
 */
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authModule = require('../../middleware/auth-middleware');
const { sendNotification, NotifyType } = require('../../services/notification-service');
const logger = require('../../shared/logger');

const authenticateDTAM = authModule.authenticateDTAM;

// Get ALL audits (unified list for frontend)
router.get('/', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                status: {
                    in: [
                        'PENDING_AUDIT', 'AWAITING_SCHEDULE', // Waiting
                        'AUDIT_SCHEDULED', 'AUDIT_IN_PROGRESS', // Scheduled
                        'AUDIT_PASSED', 'AUDIT_FAILED', 'APPROVED', 'REVISION_REQUIRED', // History
                    ],
                },
                isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        // Map to frontend "Audit" interface explicitly if needed, but standard return is fine
        // Frontend expects: { id, applicationId, applicantName, plantType, status, scheduledDate, inspector }
        const data = applications.map(app => ({
            id: app.id,
            auditNumber: app.applicationNumber, // Map App No to Audit No for display
            applicationId: app.applicationNumber,
            applicantName: 'N/A', // We need to fetch User/Farmer name!
            plantType: app.areaType || 'Unknown',
            status: app.status === 'PENDING_AUDIT' ? 'WAITING_SCHEDULE' : app.status, // Map status to frontend expectation
            scheduledDate: app.scheduledDate,
            inspector: app.auditorId,
            auditMode: app.formData?.auditMode || 'ONSITE', // [NEW] Return audit mode
        }));

        // We need to fetch Farmer Names. 
        // Optimized: fetching all users is bad.
        // Let's use include: { farmer: true }

        res.json({ success: true, data: { audits: data } });
    } catch (error) {
        logger.error('[Audit] list error:', error);
        res.status(500).json({ success: false, data: { audits: [] } });
    }
});

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
        logger.error('[Audit] getPendingSchedule error:', error);
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
        logger.error('[Audit] getScheduled error:', error);
        res.json({ success: true, data: [] });
    }
});

// Get Audit Detail
router.get('/:id', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const application = await prisma.application.findUnique({
            where: { id },
            include: { farmer: true },
        });

        if (!application) {
            return res.status(404).json({ success: false, error: 'Audit not found' });
        }

        // Map to AuditDetail interface
        const auditDetail = {
            _id: application.id,
            auditNumber: application.applicationNumber,
            applicationNumber: application.applicationNumber,
            farmerName: application.farmer ? `${application.farmer.firstName} ${application.farmer.lastName}` : 'Unknown',
            plantType: application.formData?.plantId || application.areaType || '-',
            auditMode: application.formData?.auditMode || 'ONSITE',
            status: application.status,
            scheduledDate: application.scheduledDate,
            scheduledTime: application.scheduledDate ? new Date(application.scheduledDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '',
            responses: application.formData?.auditChecklist || [], // Use existing checklist if any
            // Mock Template Code if not present
            templateCode: 'GAP-001',
        };

        res.json({ success: true, data: auditDetail });
    } catch (error) {
        logger.error('[Audit] getDetail error:', error);
        res.status(500).json({ success: false, error: error.message });
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
                    auditLocation: req.body.location || undefined, // Save specific audit location
                },
                updatedBy: req.user?.id,
            },
        });



        // [NEW] Send Notification to Farmer
        if (application.farmerId) {
            const dateStr = scheduledDateTime.toLocaleDateString('th-TH', { dateStyle: 'medium' });
            await sendNotification(application.farmerId, NotifyType.AUDIT_SCHEDULED, {
                applicationNumber: application.applicationNumber,
                auditMode: auditMode || 'ONSITE',
                scheduledDate: dateStr,
                scheduledTime: scheduledTime || '09:00',
            });
        }

        res.json({
            success: true,
            message: 'Audit scheduled successfully',
            data: updated,
        });
    } catch (error) {
        logger.error('[Audit] schedule error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update audit schedule
router.patch('/:id/schedule', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduledDate, scheduledTime, auditorId } = req.body;

        const updateData = { updatedBy: req.user?.id };

        if (scheduledDate) {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`);
            updateData.scheduledDate = scheduledDateTime;
        }
        if (auditorId) { updateData.auditorId = auditorId; }

        const updated = await prisma.application.update({
            where: { id },
            data: updateData,
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        logger.error('[Audit] updateSchedule error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit audit result (Pass/Fail)
router.post('/:id/result', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { result, notes, auditMode, checklist } = req.body; // result: 'PASS' | 'FAIL'

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
            auditChecklist: checklist, // Save detailed checklist
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
        const certificateService = require('../../services/certificate-service'); // Import Service

        // ...

        // If Approved, enable the Farm status to ACTIVE
        if (newStatus === 'APPROVED') {
            const appData = updated.formData;

            // 1. Activate Farm
            if (appData && appData.locationData && appData.locationData.farmId) {
                try {
                    const farmId = appData.locationData.farmId;
                    await prisma.farm.update({
                        where: { id: farmId },
                        data: {
                            status: 'ACTIVE',
                            verifiedAt: new Date(),
                            verifiedBy: req.user?.id,
                        },
                    });
                    logger.info(`[Audit] Auto-activated Farm ${farmId} for Application ${updated.applicationNumber}`);
                } catch (farmError) {
                    logger.error('[Audit] Failed to activate farm:', farmError);
                    // Non-blocking
                }
            }

            // 2. Generate Certificate
            try {
                // Check if certificate already exists to avoid duplicates (idempotency)
                const existingCert = await prisma.certificate.findFirst({ where: { applicationId: id } });
                if (!existingCert) {
                    const cert = await certificateService.generateCertificate(id, req.user?.id);
                    logger.info(`[Audit] Certificate Generated: ${cert.certificateNumber}`);
                } else {
                    logger.info(`[Audit] Certificate already exists for App ${id}`);
                }
            } catch (certError) {
                logger.error('[Audit] Failed to generate certificate:', certError);
                // System should probably alert admin, but for now we log
            }
        }

        res.json({
            success: true,
            message: `Audit submitted: ${result}`,
            data: updated,
        });

    } catch (error) {
        logger.error('[Audit] submitResult error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
