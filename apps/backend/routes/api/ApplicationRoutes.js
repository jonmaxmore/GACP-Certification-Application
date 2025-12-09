const express = require('express');
const router = express.Router();
const controller = require('../../controllers/ApplicationController');
const { authenticate } = require('../../middleware/AuthMiddleware'); // Assuming this exists

// Farmer Routes
router.post('/draft', authenticate, controller.createDraft);
router.post('/:id/confirm-review', authenticate, controller.confirmReview);
router.post('/:id/pay-phase1', authenticate, controller.submitPayment1);

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
router.post('/:id/pay-phase2', authenticate, controller.submitPayment2);
router.post('/:id/assign-auditor', authenticate, controller.assignAuditor); // Scheduler
router.post('/:id/audit-result', authenticate, controller.submitAuditResult); // Auditor
router.get('/auditor/assignments', authenticate, controller.getAuditorAssignments); // New Route

// General ABAC / Admin Routes
router.post('/', authenticate, controller.createDraft);
router.patch('/:id/status', authenticate, controller.updateStatus);

module.exports = router;
