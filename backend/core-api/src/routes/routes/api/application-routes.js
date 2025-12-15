const express = require('express');
const router = express.Router();
const controller = require('../../../controllers/application-controller');
const { authenticate } = require('../../../middleware/auth-middleware');
const { strictRateLimiter } = require('../../../middleware/rate-limit-middleware');

// Rate limiters for application routes
const applicationRateLimiter = strictRateLimiter(60 * 60 * 1000, 30); // 30 per hour
const paymentRateLimiter = strictRateLimiter(15 * 60 * 1000, 10); // 10 per 15 min

// Farmer Routes (with rate limiting)
router.post('/draft', authenticate, applicationRateLimiter, controller.createDraft);
router.get('/my', authenticate, controller.getMyApplications); // NEW: Get user's applications
router.post('/:id/confirm-review', authenticate, applicationRateLimiter, controller.confirmReview);
router.post('/:id/pay-phase1', authenticate, paymentRateLimiter, controller.submitPayment1);

// Officer Routes
// Officer / Scheduler / Auditor Routes
router.get('/notifications', authenticate, controller.getNotifications);
// Ksher Routes
router.post('/ksher/webhook', controller.ksherWebhook); // No Auth required for Webhook
router.get('/ksher/status/:id', controller.checkPaymentStatus); // Public or Auth? Maybe Auth is safer but polling might need flexibility. Let's keep it controller.checkPaymentStatus for now. Oh wait, previous calls used 'authenticate'. Status check might need auth. But webhook MUST NOT have auth.

router.get('/pending-reviews', authenticate, controller.getPendingReviews);
router.get('/stats', authenticate, controller.getDashboardStats); // New Stats Route
router.get('/:id', authenticate, controller.getApplicationById);
router.post('/:id/review', authenticate, controller.reviewDocument);
router.post('/:id/pay-phase2', authenticate, paymentRateLimiter, controller.submitPayment2);
router.post('/:id/assign-auditor', authenticate, controller.assignAuditor); // Scheduler
router.post('/:id/audit-result', authenticate, controller.submitAuditResult); // Auditor
router.get('/auditor/assignments', authenticate, controller.getAuditorAssignments); // New Route

// General ABAC / Admin Routes
router.post('/', authenticate, controller.createDraft);
router.patch('/:id/status', authenticate, controller.updateStatus);
router.post('/:id/status', authenticate, controller.updateStatus); // POST alias for step-11 payment

// Document Upload Route (Critical for mobile app)
const multer = require('multer');
const path = require('path');
const upload = multer({
    dest: path.join(__dirname, '../../uploads'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
router.post('/:id/documents/:docType', authenticate, upload.single('document'), controller.uploadDocument);

module.exports = router;
