/**
 * Payment API Routes
 * Handles payment document operations for GACP applications
 */

const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../../middleware/auth-middleware');
const upload = require('../../middleware/uploadMiddleware');
const paymentController = require('../../controllers/PaymentController');

// Get user's payment documents (Quotation, Invoice, Receipt)
router.get(
    '/my',
    authenticate,
    paymentController.getMyPayments.bind(paymentController)
);

// Get single payment document by ID
router.get(
    '/:id',
    authenticate,
    paymentController.getPaymentById.bind(paymentController)
);

// Process payment (Confirm with slip upload)
router.post(
    ['/', '/confirm'],
    authenticate,
    checkPermission('payment.process', 'payment'),
    upload.single('slipImage'),
    paymentController.confirmPayment.bind(paymentController)
);

module.exports = router;

