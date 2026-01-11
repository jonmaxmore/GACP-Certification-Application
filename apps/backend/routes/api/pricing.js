/**
 * Pricing Service - API for fetching platform fees
 * "One Brain, Many Faces" Architecture
 * 
 * This endpoint provides pricing information to all faces (web, mobile)
 * instead of hardcoding prices in frontend code.
 */

const express = require('express');
const router = express.Router();
const {
    FEE_CONFIG,
    AREA_TYPES,
    OBJECTIVES,
    calculateFee,
    getFeeSummary,
} = require('../../constants/pricing-service'); // Fixed path
const { SERVICE_TYPES, SERVICE_TYPE_LABELS } = require('../../constants/service-type-enum'); // Fixed path
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ... existing code ...

/**
 * @route GET /api/pricing/fees
 * @description Get all platform fees and configuration
 * @access Public
 */
router.get('/fees', (req, res) => {
    res.json({
        success: true,
        data: {
            config: FEE_CONFIG,
            areaTypes: Object.values(AREA_TYPES),
            objectives: Object.values(OBJECTIVES),
            serviceTypes: Object.entries(SERVICE_TYPES).map(([key, value]) => ({
                id: value,
                label: SERVICE_TYPE_LABELS[value],
            })),
            lastUpdated: '2025-12-13',
            validUntil: '2025-12-31',
        },
    });
});

/**
 * @route POST /api/pricing/calculate
 * @description Calculate fee based on service type and area selection
 * @access Public
 */
router.post('/calculate', (req, res) => {
    try {
        const { serviceType, areaTypes = [], plantType, objective } = req.body;

        if (!serviceType) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุประเภทบริการ (serviceType)',
            });
        }

        const feeBreakdown = calculateFee(serviceType, areaTypes);

        res.json({
            success: true,
            data: {
                serviceType,
                serviceLabel: SERVICE_TYPE_LABELS[serviceType],
                areaTypes,
                areaCount: areaTypes.length,
                plantType,
                objective,
                ...feeBreakdown,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถคำนวณค่าธรรมเนียมได้',
        });
    }
});

/**
 * @route GET /api/pricing/quotation/:applicationId
 * @description Get quotation for specific application
 * @access Private (requires auth)
 */
router.get('/quotation/:applicationId', async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Fetch actual application to get area count via Prisma
        const app = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { farm: true }, // If needed
        });

        let areaCount = 1;

        if (app) {
            // Logic to determine area count from app data
            // Assuming simple logic for now or mapped from legacy
            if (app.farm && app.farm.totalArea) {
                areaCount = Math.ceil(app.farm.totalArea);
            }
        }

        const docReviewPerArea = 5000;
        const inspectionPerArea = 25000;
        const docReviewTotal = docReviewPerArea * areaCount;
        const inspectionTotal = inspectionPerArea * areaCount;
        const total = docReviewTotal + inspectionTotal;

        const quotation = {
            applicationId,
            items: [
                {
                    description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น',
                    quantity: areaCount,
                    unitPrice: docReviewPerArea,
                    total: docReviewTotal,
                },
                {
                    description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน',
                    quantity: areaCount,
                    unitPrice: inspectionPerArea,
                    total: inspectionTotal,
                },
            ],
            subtotal: total,
            vat: 0,
            total: total,
            currency: 'THB',
            validDays: 30,
            areaCount,
            createdAt: new Date().toISOString(),
        };

        res.json({
            success: true,
            data: quotation,
        });
    } catch (error) {
        console.error('Quotation error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถสร้างใบเสนอราคาได้',
        });
    }
});

/**
 * @route GET /api/pricing/invoice/:phase
 * @description Get invoice amounts for payment phases
 * @access Private (requires auth)
 */
router.get('/invoice/:phase', (req, res) => {
    const { phase } = req.params;

    const invoices = {
        'phase1': {
            phase: 1,
            description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น',
            amount: 5000,
            currency: 'THB',
        },
        'phase2': {
            phase: 2,
            description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน',
            amount: 25000,
            currency: 'THB',
        },
    };

    const invoice = invoices[phase.toLowerCase()];

    if (!invoice) {
        return res.status(404).json({
            success: false,
            error: 'ไม่พบข้อมูล Phase ที่ระบุ',
        });
    }

    res.json({
        success: true,
        data: invoice,
    });
});

module.exports = router;

