/**
 * V2 Applications Routes
 * Handles application draft and submission for GACP certification
 */

const express = require('express');
const router = express.Router();
const authModule = require('../../middleware/auth-middleware');
console.log('DEBUG: Auth Module Path:', require.resolve('../../middleware/auth-middleware'));
console.log('DEBUG: Auth Module Exports:', Object.keys(authModule));
const { authenticateFarmer } = authModule;
console.log('DEBUG: authenticateFarmer type:', typeof authenticateFarmer);
if (typeof authenticateFarmer !== 'function') console.error('CRITICAL: authenticateFarmer is NOT a function');
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

module.exports = router;
