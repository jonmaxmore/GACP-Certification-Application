/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Application submission and management
 */

const express = require('express');
const router = express.Router();
const applicationService = require('../../services/application-service');
const { authenticateFarmer, authenticateDTAM } = require('../../middleware/auth-middleware');
const { prisma } = require('../../services/prisma-database'); // Still needed for some direct queries if not yet moved
const feeService = require('../../services/fee-service'); // Still needed for legacy staff endpoints

/**
 * @swagger
 * /api/applications/draft:
 *   post:
 *     summary: Create or Update Application Draft
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plantId, serviceType]
 *             properties:
 *               plantId:
 *                 type: integer
 *               serviceType:
 *                 type: string
 *               harvestData:
 *                 type: object
 *                 properties:
 *                   harvestMethod:
 *                     type: string
 *                     enum: [MANUAL, MACHINE]
 *                   dryingMethod:
 *                     type: string
 *                     enum: [SUN, OVEN, DEHYDRATOR, OTHER]
 *                   dryingDetail:
 *                     type: string
 *                   storageSystem:
 *                     type: string
 *                     enum: [CONTROLLED, AMBIENT]
 *                   packaging:
 *                     type: string
 *     responses:
 *       200:
 *         description: Application saved successfully
 */
router.post('/draft', authenticateFarmer, async (req, res) => {
    try {
        const application = await applicationService.saveDraft(req.user.id, req.body);
        res.json({
            success: true,
            data: {
                _id: application.id,
                applicationNumber: application.applicationNumber,
                status: application.status,
            },
        });
    } catch (error) {
        console.error('[Applications Draft] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to save application', details: error.message });
    }
});

/**
 * @swagger
 * /api/applications/draft:
 *   get:
 *     summary: Get current draft
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current draft details
 */
router.get('/draft', authenticateFarmer, async (req, res) => {
    try {
        const draft = await applicationService.getDraft(req.user.id);

        if (!draft) return res.json({ success: true, data: null });

        // Transform backend model to frontend expectation
        res.json({
            success: true,
            data: {
                _id: draft.id,
                applicationNumber: draft.applicationNumber,
                plantId: draft.plantId,
                plantName: draft.plantName,
                purpose: draft.purpose,
                areaType: draft.areaType,
                serviceType: draft.serviceType, // Important for Step 1
                applicantData: typeof draft.applicantData === 'string' ? JSON.parse(draft.applicantData) : (draft.applicantData || {}),
                locationData: typeof draft.locationData === 'string' ? JSON.parse(draft.locationData) : (draft.locationData || {}),
                productionData: typeof draft.productionData === 'string' ? JSON.parse(draft.productionData) : (draft.productionData || {}),
                formData: typeof draft.formData === 'string' ? JSON.parse(draft.formData) : (draft.formData || {}), // Generic fallback
                harvestData: (typeof draft.formData === 'string' ? JSON.parse(draft.formData) : (draft.formData || {})).harvestData || {}, // Extract from formData
                documents: typeof draft.documents === 'string' ? JSON.parse(draft.documents) : (draft.documents || []),
                estimatedFee: draft.estimatedFee,
                status: draft.status,
                createdAt: draft.createdAt,
            },
        });
    } catch (error) {
        console.error('[Applications Draft GET] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch draft' });
    }
});

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: List my applications
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get('/', authenticateFarmer, async (req, res) => {
    try {
        const applications = await applicationService.getFarmerApplications(req.user.id);
        res.json({
            success: true,
            data: applications.map(app => ({
                _id: app.id,
                applicationNumber: app.applicationNumber,
                plantName: app.plantName || (app.formData?.plantName),
                serviceType: app.serviceType,
                status: app.status,
                estimatedFee: app.estimatedFee,
                createdAt: app.createdAt,
                submittedAt: app.submittedAt,
            })),
        });
    } catch (error) {
        console.error('[Applications List] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch list' });
    }
});

/**
 * @swagger
 * /api/applications/my:
 *   get:
 *     summary: Get detailed list for my applications (Legacy support)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 */
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const applications = await applicationService.getFarmerApplications(req.user.id);
        res.json({
            success: true,
            data: applications.map(app => ({
                _id: app.id,
                applicationNumber: app.applicationNumber,
                plantName: app.plantName || (app.formData?.plantName),
                serviceType: app.serviceType,
                status: app.status,
                estimatedFee: app.estimatedFee,
                createdAt: app.createdAt,
                submittedAt: app.submittedAt,
                // Additional details for 'My' endpoint
                scheduledDate: app.scheduledDate,
                audit: {
                    mode: app.formData?.auditMode,
                    meetingUrl: app.formData?.meetingUrl,
                    location: app.formData?.auditLocation,
                    auditorId: app.auditorId,
                },
                fees: app.formData?.fees,
            })),
        });
    } catch (error) {
        console.error('[Applications My] Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch applications' });
    }
});

// ==========================================
// STAFF / DTAM ENDPOINTS (To be refactored next)
// For now, keeping logic here to minimize risk while migrating Farmer Flow
// ==========================================

// List ALL applications for Staff
router.get('/staff/list', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                farmer: { select: { firstName: true, lastName: true } },
            },
        });

        const formatted = applications.map(app => {
            const formData = (typeof app.formData === 'object' && app.formData) ? app.formData : {};
            const plantName = formData.plantName || formData.plantId || app.plantName || 'ไม่ระบุ';

            let applicantName = 'ไม่ระบุ';
            if (app.farmer) {
                applicantName = `${app.farmer.firstName} ${app.farmer.lastName}`;
            } else if (formData.applicantData?.name) {
                applicantName = formData.applicantData.name;
            }

            return {
                id: app.id,
                applicationNumber: app.applicationNumber,
                applicantName,
                plantType: plantName,
                status: app.status,
                submittedAt: app.submittedAt || app.createdAt,
                submissionCount: 1,
            };
        });

        res.json({ success: true, data: { applications: formatted } });
    } catch (error) {
        console.error('[Staff List] Error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// Get single application
router.get('/:id', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const app = await applicationService.getById(id); // Use new service

        if (!app) return res.status(404).json({ success: false, error: 'Not Found' });

        res.json({ success: true, data: app });
    } catch (error) {
        console.error('[Get By Id] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Review document (approve/reject) - Logic retained temporarily
router.post('/:id/review', authenticateDTAM, async (req, res) => {
    try {
        const { action } = req.body;
        const { id } = req.params;

        const app = await prisma.application.findFirst({
            where: { OR: [{ id }, { applicationNumber: id }] },
        });

        if (!app) return res.status(404).json({ success: false, error: 'Application not found' });

        const newStatus = action === 'APPROVE' ? 'PAYMENT_2_PENDING' : 'REVISION_REQUIRED';
        const updateData = { status: newStatus, updatedBy: req.user?.id };

        if (action === 'APPROVE') {
            const currentFormData = (typeof app.formData === 'object' && app.formData) ? app.formData : {};
            const phase2Fee = feeService.calculatePhase2Fee(currentFormData);

            updateData.phase2Amount = phase2Fee.total;
            updateData.formData = {
                ...currentFormData,
                fees: { ...(currentFormData.fees || {}), phase2: phase2Fee },
            };

            // Generate Invoice
            const year = new Date().getFullYear() + 543;
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            await prisma.invoice.create({
                data: {
                    invoiceNumber: `INV-P2-${year}-${random}`,
                    applicationId: app.id,
                    farmerId: app.farmerId,
                    serviceType: 'AUDIT_FEE',
                    totalAmount: phase2Fee.total,
                    subtotal: phase2Fee.total,
                    status: 'pending',
                    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    items: phase2Fee.items,
                    notes: 'Auto-generated Phase 2 Invoice',
                },
            });
        }

        const updated = await prisma.application.update({
            where: { id: app.id },
            data: updateData,
        });

        res.json({ success: true, data: updated, message: `Application ${newStatus}` });
    } catch (error) {
        console.error('[Review] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
