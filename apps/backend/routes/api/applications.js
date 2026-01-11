/**
 * Applications Routes
 * Handles application draft and submission for GACP certification
 */

const express = require('express');
const feeService = require('../../services/fee-service');
const router = express.Router();
const { authenticateFarmer, authenticateDTAM } = require('../../middleware/auth-middleware');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * POST /api/applications/draft
 * Save application as draft or submit for review
 */
router.post('/draft', authenticateFarmer, async (req, res) => {
    try {
        const farmerId = req.user.id;
        const {
            plantId, plantName,
            purpose, areaType, serviceType,
            applicantData, locationData, productionData,
            documents, youtubeUrl,
            submissionDate, requestedInspectionDate,
            estimatedProcessingDays, estimatedFee,
        } = req.body;

        // Validate required fields
        if (!plantId || !serviceType) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกข้อมูลพืชและประเภทบริการ',
            });
        }

        // Check for existing draft
        const existingDraft = await prisma.application.findFirst({
            where: {
                farmerId,
                status: 'DRAFT',
            },
        });

        // Generate application number (unique globally)
        const year = new Date().getFullYear() + 543; // Buddhist year
        const globalCount = await prisma.application.count();
        const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
        const applicationNumber = `GACP-${year}-${String(globalCount + 1).padStart(5, '0')}-${timestamp}`;

        const applicationData = {
            farmerId,
            applicationNumber,
            // Core fields present in schema
            serviceType, // exists in schema
            areaType,    // exists in schema
            status: 'SUBMITTED', // Set status to SUBMITTED directly
            phase1Amount: feeService.calculatePhase1Fee().total, // Set Column

            // All other complex data goes into formData JSON column
            formData: {
                plantId,
                plantName: plantName || plantId,
                purpose,
                applicantData,
                locationData,
                productionData,
                documents,
                youtubeUrl, // Added
                estimatedFee,
                estimatedProcessingDays,
                requestedInspectionDate,
                submissionDate: new Date(),
                fees: {
                    phase1: feeService.calculatePhase1Fee(),
                    phase2: null,
                },
            },
        };

        let application;

        if (existingDraft) {
            // Update existing draft
            application = await prisma.application.update({
                where: { id: existingDraft.id },
                data: applicationData,
            });
        } else {
            // Create new application
            application = await prisma.application.create({
                data: applicationData,
            });
        }

        // --- Auto-Generate Invoice for Phase 1 (Application Fee) ---
        if (applicationData.status === 'SUBMITTED') {
            const existingInvoice = await prisma.invoice.findFirst({
                where: {
                    applicationId: application.id,
                    serviceType: 'APPLICATION_FEE',
                    isDeleted: false,
                },
            });

            if (!existingInvoice) {
                const year = new Date().getFullYear() + 543;
                const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                const invoiceNumber = `INV-P1-${year}-${random}`;
                const phase1Fee = feeService.calculatePhase1Fee();

                await prisma.invoice.create({
                    data: {
                        invoiceNumber: invoiceNumber,
                        applicationId: application.id,
                        farmerId: farmerId,
                        serviceType: 'APPLICATION_FEE',
                        totalAmount: phase1Fee.total,
                        subtotal: phase1Fee.total,
                        status: 'pending',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        items: phase1Fee.items,
                        notes: 'Auto-generated Phase 1 Invoice (Application Fee)',
                    },
                });
                console.log(`[Applications] Generated Invoice ${invoiceNumber} for App ${application.id}`);
            }
        }
        // -----------------------------------------------------------

        console.log(`[Applications] Draft saved for user ${farmerId}: ${application.id}`);

        res.json({
            success: true,
            data: {
                _id: application.id,
                applicationNumber: application.applicationNumber,
                status: application.status,
            },
        });

    } catch (error) {
        console.error('[Applications Draft] Error:', error.message);
        console.error('[Applications Draft] Code:', error.code);
        console.error('[Applications Draft] Meta:', JSON.stringify(error.meta));
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถบันทึกคำขอได้',
            debug: process.env.NODE_ENV !== 'production' ? {
                message: error.message,
                code: error.code,
                meta: error.meta,
            } : undefined,
        });
    }
});

/**
 * GET /api/applications/draft
 * Get current draft for user
 */
router.get('/draft', authenticateFarmer, async (req, res) => {
    try {
        const farmerId = req.user.id;

        const draft = await prisma.application.findFirst({
            where: {
                farmerId,
                status: 'DRAFT',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!draft) {
            return res.json({
                success: true,
                data: null,
            });
        }

        res.json({
            success: true,
            data: {
                _id: draft.id,
                applicationNumber: draft.applicationNumber,
                plantId: draft.plantId,
                plantName: draft.plantName,
                purpose: draft.purpose,
                areaType: draft.areaType,
                serviceType: draft.serviceType,
                applicantData: draft.applicantData ? JSON.parse(draft.applicantData) : {},
                locationData: draft.locationData ? JSON.parse(draft.locationData) : {},
                productionData: draft.productionData ? JSON.parse(draft.productionData) : {},
                documents: draft.documents ? JSON.parse(draft.documents) : [],
                estimatedFee: draft.estimatedFee,
                status: draft.status,
                createdAt: draft.createdAt,
            },
        });

    } catch (error) {
        console.error('[Applications Draft GET] Error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถดึงข้อมูลคำขอได้',
        });
    }
});

/**
 * GET /api/applications
 * List all applications for user
 */
router.get('/', authenticateFarmer, async (req, res) => {
    try {
        const farmerId = req.user.id;

        const applications = await prisma.application.findMany({
            where: { farmerId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        res.json({
            success: true,
            data: applications.map(app => ({
                _id: app.id,
                applicationNumber: app.applicationNumber,
                plantName: app.plantName,
                serviceType: app.serviceType,
                status: app.status,
                estimatedFee: app.estimatedFee,
                createdAt: app.createdAt,
                submittedAt: app.submittedAt,
            })),
        });

    } catch (error) {
        console.error('[Applications List] Error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถดึงรายการคำขอได้',
        });
    }
});


/**
 * GET /api/applications/my
 * Get current user's applications (for farmers)
 * This MUST be defined before /:id route to avoid "my" being interpreted as an ID
 */
router.get('/my', authenticateFarmer, async (req, res) => {
    try {
        const farmerId = req.user.id;

        const applications = await prisma.application.findMany({
            where: {
                farmerId,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        res.json({
            success: true,
            data: applications.map(app => ({
                _id: app.id,
                applicationNumber: app.applicationNumber,
                plantName: app.plantName,
                serviceType: app.serviceType,
                status: app.status,
                estimatedFee: app.estimatedFee,
                createdAt: app.createdAt,
                submittedAt: app.submittedAt,
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
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถดึงรายการคำขอได้',
        });
    }
});


/**
 * ==========================================
 * STAFF / DTAM ENDPOINTS (Migrated from v1)
 * ==========================================
 */
// List ALL applications for Staff (with optional filtering later)
router.get('/staff/list', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit to 100 for performance
            include: {
                farmer: {
                    select: { firstName: true, lastName: true },
                },
            },
        });

        const formatted = applications.map(app => {
            // Extract plant name from formData since it's not in schema columns
            const formData = (typeof app.formData === 'object' && app.formData) ? app.formData : {};
            const plantName = formData.plantName || formData.plantId || app.plantName || 'ไม่ระบุ';

            // Applicant Name
            let applicantName = 'ไม่ระบุ';
            if (app.farmer) {
                applicantName = `${app.farmer.firstName} ${app.farmer.lastName}`;
            } else if (formData.applicantData && formData.applicantData.name) {
                applicantName = formData.applicantData.name;
            }

            return {
                id: app.id,
                applicationNumber: app.applicationNumber,
                applicantName: applicantName,
                plantType: plantName,
                status: app.status,
                submittedAt: app.submittedAt || app.createdAt,
                submissionCount: 1, // Default for now
            };
        });

        res.json({ success: true, data: { applications: formatted } });
    } catch (error) {
        console.error('[Applications] staff/list error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});
router.get('/pending-reviews', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                status: {
                    in: ['SUBMITTED', 'PENDING_REVIEW', 'DRAFT'],
                },
                isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('[Applications] getPendingReviews error:', error);
        res.json({ success: true, data: [] });
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
                    isDeleted: false,
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                total: total || 0,
                pending: pending || 0,
                approved: approved || 0,
                revenue: revenue._sum?.totalAmount || 0,
                todayChecked: todayChecked || 0,
            },
        });
    } catch (error) {
        console.error('[Applications] getStats error:', error);
        res.json({
            success: true,
            data: { total: 0, pending: 0, approved: 0, revenue: 0, todayChecked: 0 },
        });
    }
});

// Get auditor assignments
router.get('/auditor/assignments', authenticateDTAM, async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: {
                status: { in: ['AUDIT_PENDING', 'AUDIT_SCHEDULED'] },
                isDeleted: false,
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
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
        const application = await prisma.application.findFirst({
            where: {
                OR: [
                    { id: id },
                    { applicationNumber: id },
                ],
                isDeleted: false,
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                        province: true,
                    },
                },
            },
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: `Application ${id} not found`,
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

        // Find application first to get correct PK
        const app = await prisma.application.findFirst({
            where: {
                OR: [
                    { id: id },
                    { applicationNumber: id },
                ],
            },
        });

        if (!app) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Determine new status
        // If Approved -> Go to PAYMENT_2_PENDING (Strict GACP Flow: Pay Audit Fee first)
        // If Reject -> REVISION_REQUIRED
        const newStatus = action === 'APPROVE' ? 'PAYMENT_2_PENDING' : 'REVISION_REQUIRED';

        const updateData = {
            status: newStatus,
            updatedBy: req.user?.id,
        };

        // If Approved, Calculate Phase 2 Fee and Update FormData
        if (action === 'APPROVE') {
            const currentFormData = (typeof app.formData === 'object' && app.formData) ? app.formData : {};
            const phase2Fee = feeService.calculatePhase2Fee(currentFormData);

            updateData.phase2Amount = phase2Fee.total;
            updateData.formData = {
                ...currentFormData,
                fees: {
                    ...(currentFormData.fees || {}),
                    phase2: phase2Fee,
                },
            };

            // Generate Phase 2 Invoice (Audit Fee)
            const year = new Date().getFullYear() + 543;
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const invoiceNumber = `INV-P2-${year}-${random}`;

            await prisma.invoice.create({
                data: {
                    invoiceNumber: invoiceNumber,
                    applicationId: app.id,
                    farmerId: app.farmerId,
                    serviceType: 'AUDIT_FEE',
                    totalAmount: phase2Fee.total,
                    subtotal: phase2Fee.total,
                    status: 'pending',
                    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                    items: phase2Fee.items,
                    notes: 'Auto-generated Phase 2 Invoice (Audit Fee)',
                },
            });
        }

        const updated = await prisma.application.update({
            where: { id: app.id }, // Use UUID
            data: updateData,
        });

        // If Rejected, we might want to Add Note (omitted for brevity, assumes separated note endpoint or handled elsewhere)

        res.json({ success: true, data: updated, message: `Application ${newStatus}` });
    } catch (error) {
        console.error('[Applications] review error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PATCH /api/applications/:id/criteria
 * Save supplementary criteria to application
 */
router.patch('/:id/criteria', authenticateFarmer, async (req, res) => {
    try {
        const { id } = req.params;
        const { supplementaryCriteria, supplementarySkipped } = req.body;

        const updated = await prisma.application.update({
            where: { id },
            data: {
                supplementaryCriteria: supplementaryCriteria || undefined,
                supplementarySkipped: supplementarySkipped || false,
            },
        });

        res.json({
            success: true,
            message: 'Supplementary criteria saved',
            data: {
                id: updated.id,
                supplementarySkipped: updated.supplementarySkipped,
            },
        });
    } catch (error) {
        console.error('[Applications] criteria save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Confirm Payment (Phase 1 or 2)
router.post('/:id/payment', authenticateDTAM, async (req, res) => {
    try {
        const { id } = req.params;
        const { phase, amount, method } = req.body;

        const application = await prisma.application.findUnique({ where: { id } });
        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Determine next status based on current status or phase
        let newStatus = application.status;
        if (phase === 1) {
            newStatus = 'PAID_PHASE_1';
        } else if (phase === 2) {
            newStatus = 'PENDING_AUDIT'; // Ready for Scheduling
        }

        const updated = await prisma.application.update({
            where: { id },
            data: {
                status: newStatus,
                updatedBy: req.user?.id,
                // Ideally create a Payment record here, but updating status is sufficient for UAT
            },
        });

        res.json({
            success: true,
            message: `Payment Phase ${phase} confirmed`,
            data: updated,
        });

    } catch (error) {
        console.error('[App] payment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

