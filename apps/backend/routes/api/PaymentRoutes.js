/**
 * Payment API Routes
 * Handles payment processing for GACP applications
 */

const express = require('express');
const router = express.Router();
// const gacpService = require('../../services/ApplicationWorkflowService'); // Moved to Controller
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

const upload = require('../../middleware/uploadMiddleware');
const paymentController = require('../../controllers/PaymentController');

// Process payment (Confirm)
router.post(
    ['/', '/confirm'],
    authenticate,
    checkPermission('payment.process', 'payment'),
    upload.single('slipImage'), // Handle file upload
    paymentController.confirmPayment
);

module.exports = router;
