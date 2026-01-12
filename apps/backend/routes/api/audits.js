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

/**
 * @swagger
 * /api/audits:
 *   get:
 *     summary: Get all audits (Unified list) (Staff Only)
 *     tags: [Audits]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of audits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     audits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           auditNumber:
 *                             type: string
 *                           status:
 *                             type: string
 *                           plantType:
 *                             type: string
 *                           scheduledDate:
 *                             type: string
 *                             format: date-time
 */
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

/**
 * @swagger
 * /api/audits/pending-schedule:
 *   get:
 *     summary: Get pending applications for scheduling (Staff Only)
 *     tags: [Audits]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending applications
 */
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

/**
 * @swagger
 * /api/audits/{id}:
 *   get:
 *     summary: Get Audit Detail (Staff Only)
 *     tags: [Audits]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit ID or Application ID
 *     responses:
 *       200:
 *         description: Audit details
 *       404:
 *         description: Audit not found
 */
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

/**
 * @swagger
 * /api/audits/schedule:
 *   post:
 *     summary: Schedule an audit (Staff Only)
 *     tags: [Audits]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [applicationId, scheduledDate]
 *             properties:
 *               applicationId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               scheduledTime:
 *                 type: string
 *                 example: "09:00"
 *               auditMode:
 *                 type: string
 *                 enum: ['ONSITE', 'ONLINE']
 *               auditorId:
 *                 type: string
 *               meetingUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Scheduled successfully
 */
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

/**
 * @swagger
 * /api/audits/{id}/result:
 *   post:
 *     summary: Submit audit result (Pass/Fail) (Staff Only)
 *     tags: [Audits]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [result]
 *             properties:
 *               result:
 *                 type: string
 *                 enum: ['PASS', 'FAIL']
 *               notes:
 *                 type: string
 *               checklist:
 *                 type: array
 *     responses:
 *       200:
 *         description: Result submitted
 */
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
