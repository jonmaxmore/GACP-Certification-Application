/**
 * Payment API Routes
 * Handles payment processing for GACP applications
 */

const express = require('express');
const router = express.Router();
const gacpService = require('../../services/ApplicationWorkflowService');
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

// Process payment
router.post('/', authenticate, checkPermission('payment.process', 'payment'), async (req, res) => {
    try {
        const { applicationId, phase, paymentDetails } = req.body;

        if (!applicationId || !phase) {
            return res.status(400).json({
                success: false,
                error: 'Application ID and phase are required'
            });
        }

        const application = await gacpService.processPayment(applicationId, phase, paymentDetails || {});

        res.json({
            success: true,
            data: {
                applicationId: application.id,
                payment: application.payment[phase]
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
