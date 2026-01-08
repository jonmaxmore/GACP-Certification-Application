/**
 * Batch Routes - API สำหรับ multi-area submission
 * Auto-split: 1 area type = 1 application = 1 certificate
 */

const express = require('express');
const router = express.Router();
const BatchService = require('../../services/BatchSubmissionService');

/**
 * @route POST /api/v2/batch/submit
 * @description Submit multi-area application (auto-split)
 */
router.post('/submit', async (req, res) => {
    try {
        const userId = req.body.userId || req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'กรุณาเข้าสู่ระบบ'
            });
        }

        const { sharedData, siteData, areaTypes, documents } = req.body;

        // Validate required fields
        if (!sharedData?.plantType) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาเลือกประเภทพืช'
            });
        }

        if (!areaTypes || areaTypes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาเลือกลักษณะพื้นที่อย่างน้อย 1 ประเภท'
            });
        }

        // Check if user has verified license for this plant
        const canSubmit = await BatchService.canSubmitForPlant(userId, sharedData.plantType);
        if (!canSubmit.canSubmit) {
            return res.status(403).json({
                success: false,
                error: canSubmit.reason
            });
        }

        // Add license ID to shared data
        sharedData.licenseId = canSubmit.licenseId;

        // Submit batch (auto-split)
        const result = await BatchService.submitBatchApplication(userId, {
            sharedData,
            siteData,
            areaTypes,
            documents
        });

        res.status(201).json(result);

    } catch (error) {
        console.error('Batch submit error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'ไม่สามารถส่งคำขอได้'
        });
    }
});

/**
 * @route GET /api/v2/batch/:batchId
 * @description Get all applications in a batch
 */
router.get('/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;

        const result = await BatchService.getBatchApplications(batchId);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบ batch นี้'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
});

/**
 * @route POST /api/v2/batch/:batchId/payment
 * @description Update payment status for entire batch
 */
router.post('/:batchId/payment', async (req, res) => {
    try {
        const { batchId } = req.params;
        const { transactionId, status, paidAt } = req.body;

        const result = await BatchService.updateBatchPaymentStatus(batchId, {
            transactionId,
            status: status || 'paid',
            paidAt: paidAt || new Date()
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถอัปเดตสถานะการชำระเงินได้'
        });
    }
});

/**
 * @route GET /api/v2/batch/preview-fee
 * @description Preview fee for multiple area types
 */
router.get('/preview-fee', async (req, res) => {
    try {
        const areaTypes = req.query.areaTypes?.split(',') || [];

        const feePerArea = 30000;
        const totalFee = feePerArea * areaTypes.length;

        const breakdown = areaTypes.map(areaType => ({
            areaType,
            docReview: 5000,
            inspection: 25000,
            total: 30000
        }));

        res.json({
            success: true,
            data: {
                areaTypes,
                count: areaTypes.length,
                feePerArea,
                totalFee,
                totalFeeText: `${totalFee.toLocaleString()} บาท`,
                breakdown
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
});

module.exports = router;

