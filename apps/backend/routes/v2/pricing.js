/**
 * Pricing Service - API for fetching platform fees
 * "One Brain, Many Faces" Architecture
 * 
 * This endpoint provides pricing information to all faces (web, mobile)
 * instead of hardcoding prices in frontend code.
 */

const express = require('express');
const router = express.Router();

/**
 * @route GET /api/v2/pricing/fees
 * @description Get all platform fees (application, inspection, etc.)
 * @access Public
 */
router.get('/fees', (req, res) => {
    // Fees should be stored in database or config in production
    const fees = {
        applicationFee: 5000,           // ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น
        inspectionFee: 25000,           // ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน
        renewalFee: 15000,              // ค่าต่ออายุใบรับรอง
        expediteFee: 10000,             // ค่าเร่งด่วน
        currency: 'THB',
        vatRate: 0,                     // ยกเว้นภาษีมูลค่าเพิ่ม (รัฐบาล)
        lastUpdated: '2025-01-01',
        validUntil: '2025-12-31'
    };

    res.json({
        success: true,
        data: fees
    });
});

/**
 * @route GET /api/v2/pricing/quotation/:applicationId
 * @description Get quotation for specific application
 * @access Private (requires auth)
 */
router.get('/quotation/:applicationId', async (req, res) => {
    try {
        const { applicationId } = req.params;

        // In production, fetch from database
        const quotation = {
            applicationId,
            items: [
                {
                    description: 'ค่าตรวจสอบและประเมินคำขอการรับรองมาตรฐานเบื้องต้น',
                    quantity: 1,
                    unitPrice: 5000,
                    total: 5000
                }
            ],
            subtotal: 5000,
            vat: 0,
            total: 5000,
            currency: 'THB',
            validDays: 30,
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถสร้างใบเสนอราคาได้'
        });
    }
});

/**
 * @route GET /api/v2/pricing/invoice/:phase
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
            currency: 'THB'
        },
        'phase2': {
            phase: 2,
            description: 'ค่ารับรองผลการประเมินและจัดทำหนังสือรับรองมาตรฐาน',
            amount: 25000,
            currency: 'THB'
        }
    };

    const invoice = invoices[phase.toLowerCase()];

    if (!invoice) {
        return res.status(404).json({
            success: false,
            error: 'ไม่พบข้อมูล Phase ที่ระบุ'
        });
    }

    res.json({
        success: true,
        data: invoice
    });
});

module.exports = router;
