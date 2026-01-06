/**
 * V2 Applications Routes
 * Handles application draft and submission for GACP certification
 */

const express = require('express');
const router = express.Router();
const authModule = require('../../middleware/auth-middleware');
// Extract authentication functions safely
const authenticateDTAM = authModule.authenticateDTAM;

// Safe middleware wrapper to prevent startup crashes if module isn't fully loaded
const authenticateFarmer = (req, res, next) => {
    if (typeof authModule.authenticateFarmer === 'function') {
        return authModule.authenticateFarmer(req, res, next);
    }
    console.error('CRITICAL: authenticateFarmer is not a function');
    return res.status(500).json({
        success: false,
        error: 'Authentication system error'
    });
};

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * POST /api/v2/applications/draft
 * Save application as draft or submit for review
 */
router.post('/draft', authenticateFarmer, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            plantId, plantName,
            purpose, areaType, serviceType,
            applicantData, locationData, productionData,
            documents,
            submissionDate, requestedInspectionDate,
            estimatedProcessingDays, estimatedFee
        } = req.body;

        // Validate required fields
        if (!plantId || !serviceType) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกข้อมูลพืชและประเภทบริการ'
            });
        }

        // Check for existing draft
        const existingDraft = await prisma.application.findFirst({
            where: {
                userId,
                status: 'DRAFT'
            }
        });

        // Generate application number
        const year = new Date().getFullYear() + 543; // Buddhist year
        const count = await prisma.application.count({ where: { userId } });
        const applicationNumber = `GACP-${year}-${String(count + 1).padStart(6, '0')}`;

        const applicationData = {
            userId,
            applicationNumber,
            plantId,
            plantName: plantName || plantId,
            purpose,
            areaType,
            serviceType,
            applicantData: JSON.stringify(applicantData || {}),
            locationData: JSON.stringify(locationData || {}),
            productionData: JSON.stringify(productionData || {}),
            documents: JSON.stringify(documents || []),
            estimatedFee: estimatedFee || 0,
            estimatedProcessingDays: estimatedProcessingDays || 30,
            requestedInspectionDate: requestedInspectionDate ? new Date(requestedInspectionDate) : null,
            submittedAt: new Date(),
            status: 'PENDING_REVIEW',
        };

        let application;

        if (existingDraft) {
            // Update existing draft
            application = await prisma.application.update({
                where: { id: existingDraft.id },
                data: applicationData
            });
        } else {
            // Create new application
            application = await prisma.application.create({
                data: applicationData
            });
        }

        console.log(`[Applications] Draft saved for user ${userId}: ${application.id}`);

        res.json({
            success: true,
            data: {
                _id: application.id,
                applicationNumber: application.applicationNumber,
                status: application.status
            }
        });

    } catch (error) {
        console.error('[Applications Draft] Error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถบันทึกคำขอได้'
        });
    }
});

/**
 * GET /api/v2/applications/draft
 * Get current draft for user
 */
router.get('/draft', authenticateFarmer, async (req, res) => {
    try {
        const userId = req.user.id;

        const draft = await prisma.application.findFirst({
            where: {
                userId,
                status: 'DRAFT'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!draft) {
            return res.json({
                success: true,
                data: null
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
                createdAt: draft.createdAt
            }
        });

    } catch (error) {
        console.error('[Applications Draft GET] Error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถดึงข้อมูลคำขอได้'
        });
    }
});

/**
 * GET /api/v2/applications
 * List all applications for user
 */
router.get('/', authenticateFarmer, async (req, res) => {
    try {
        const userId = req.user.id;

        const applications = await prisma.application.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
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
                submittedAt: app.submittedAt
            }))
        });

    } catch (error) {
        console.error('[Applications List] Error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถดึงรายการคำขอได้'
        });
    }
});


/**
 * ==========================================
 * STAFF / DTAM ENDPOINTS (Migrated from v1)
 * ==========================================
 */

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
