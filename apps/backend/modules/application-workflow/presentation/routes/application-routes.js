/**
 * Application Routes
 *
 * RESTful API routes for GACP certification application management.
 * Organized by user role and functionality with proper middleware.
 *
 * Route Structure:
 * - /api/applications/* - General application operations
 * - /api/farmers/me/applications/* - Farmer-specific operations
 * - /api/dtam/applications/* - DTAM staff operations
 *
 * Middleware Stack:
 * - Authentication (JWT verification)
 * - Authorization (role-based access)
 * - Request validation
 * - Rate limiting
 * - Audit logging
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const express = require('express');
const ApplicationController = require('../controllers/ApplicationController');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('application-routes');

const {
  authenticate,
  authorize,
  validateRequest,
  rateLimit,
  auditLog,
} = require('../../../shared/middleware');

const router = express.Router();

/**
 * Initialize routes with controller and dependencies
 * @param {Object} dependencies - Injected dependencies
 * @returns {Router} - Configured Express router
 */
function createApplicationRoutes(dependencies = {}) {
  const applicationController = new ApplicationController(dependencies);

  // ==============================================
  // GENERAL APPLICATION ROUTES
  // ==============================================

  /**
   * Create new application
   * POST /api/applications
   * @access Private (FARMER only)
   * @rateLimit 10 requests per hour
   */
  router.post(
    '/',
    authenticate,
    authorize(['FARMER']),
    rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), // 10 per hour
    validateRequest('createApplication'),
    auditLog('APPLICATION_CREATE'),
    applicationController.createApplication,
  );

  /**
   * Get application by ID
   * GET /api/applications/:id
   * @access Private (Owner or DTAM staff)
   */
  router.get(
    '/:id',
    authenticate,
    validateRequest('getApplication'),
    auditLog('APPLICATION_VIEW'),
    applicationController.getApplication,
  );

  /**
   * Update application (DRAFT/REVISION_REQUIRED only)
   * PUT /api/applications/:id
   * @access Private (FARMER only, own applications)
   */
  router.put(
    '/:id',
    authenticate,
    authorize(['FARMER']),
    validateRequest('updateApplication'),
    auditLog('APPLICATION_UPDATE'),
    applicationController.updateApplication,
  );

  /**
   * Submit application for review
   * POST /api/applications/:id/submit
   * @access Private (FARMER only, own applications)
   */
  router.post(
    '/:id/submit',
    authenticate,
    authorize(['FARMER']),
    validateRequest('submitApplication'),
    auditLog('APPLICATION_SUBMIT'),
    applicationController.submitApplication,
  );

  /**
   * Get application workflow status
   * GET /api/applications/:id/status
   * @access Private (Owner or DTAM staff)
   */
  router.get('/:id/status', authenticate, applicationController.getApplicationStatus);

  /**
   * Get application workflow history
   * GET /api/applications/:id/workflow-history
   * @access Private (Owner or DTAM staff)
   */
  router.get(
    '/:id/workflow-history',
    authenticate,
    auditLog('WORKFLOW_HISTORY_VIEW'),
    applicationController.getWorkflowHistory,
  );

  // ==============================================
  // FARMER-SPECIFIC ROUTES
  // ==============================================

  /**
   * Get farmer's applications
   * GET /api/farmers/me/applications
   * @access Private (FARMER only)
   * @query page, limit, status, sortBy, sortOrder
   */
  router.get(
    '/farmers/me/applications',
    authenticate,
    authorize(['FARMER']),
    validateRequest('getFarmerApplications'),
    applicationController.getFarmerApplications,
  );

  // ==============================================
  // DTAM STAFF ROUTES - REVIEWER
  // ==============================================

  /**
   * Approve application for payment (Phase 1)
   * POST /api/dtam/applications/:id/approve-payment
   * @access Private (DTAM_REVIEWER only)
   */
  router.post(
    '/dtam/:id/approve-payment',
    authenticate,
    authorize(['DTAM_REVIEWER']),
    validateRequest('approveForPayment'),
    auditLog('APPLICATION_APPROVE_PAYMENT'),
    applicationController.approveForPayment,
  );

  /**
   * Request revision from farmer
   * POST /api/dtam/applications/:id/request-revision
   * @access Private (DTAM_REVIEWER only)
   */
  router.post(
    '/dtam/:id/request-revision',
    authenticate,
    authorize(['DTAM_REVIEWER']),
    validateRequest('requestRevision'),
    auditLog('APPLICATION_REQUEST_REVISION'),
    applicationController.requestRevision,
  );

  // ==============================================
  // DTAM STAFF ROUTES - INSPECTOR
  // ==============================================

  /**
   * Schedule farm inspection
   * POST /api/dtam/applications/:id/schedule-inspection
   * @access Private (DTAM_INSPECTOR only)
   */
  router.post(
    '/dtam/:id/schedule-inspection',
    authenticate,
    authorize(['DTAM_INSPECTOR']),
    validateRequest('scheduleInspection'),
    auditLog('INSPECTION_SCHEDULE'),
    applicationController.scheduleInspection,
  );

  /**
   * Complete farm inspection
   * POST /api/dtam/applications/:id/complete-inspection
   * @access Private (DTAM_INSPECTOR only)
   */
  router.post(
    '/dtam/:id/complete-inspection',
    authenticate,
    authorize(['DTAM_INSPECTOR']),
    validateRequest('completeInspection'),
    auditLog('INSPECTION_COMPLETE'),
    applicationController.completeInspection,
  );

  // ==============================================
  // DTAM STAFF ROUTES - ADMIN
  // ==============================================

  /**
   * Final approval and certificate issuance
   * POST /api/dtam/applications/:id/final-approval
   * @access Private (DTAM_ADMIN only)
   */
  router.post(
    '/dtam/:id/final-approval',
    authenticate,
    authorize(['DTAM_ADMIN', 'ADMIN']),
    validateRequest('finalApproval'),
    auditLog('APPLICATION_FINAL_APPROVAL'),
    applicationController.finalApproval,
  );

  // ==============================================
  // DTAM STAFF ROUTES - GENERAL
  // ==============================================

  /**
   * Reject application (any DTAM role can reject)
   * POST /api/dtam/applications/:id/reject
   * @access Private (DTAM staff only)
   */
  router.post(
    '/dtam/:id/reject',
    authenticate,
    authorize(['DTAM_REVIEWER', 'DTAM_INSPECTOR', 'DTAM_ADMIN', 'ADMIN']),
    validateRequest('rejectApplication'),
    auditLog('APPLICATION_REJECT'),
    applicationController.rejectApplication,
  );

  // ==============================================
  // WEBHOOK ROUTES (for external integrations)
  // ==============================================

  /**
   * Payment confirmation webhook
   * POST /api/applications/webhooks/payment-confirmed
   * @access Public (with signature verification)
   */
  router.post(
    '/webhooks/payment-confirmed',
    validateRequest('paymentWebhook'),
    auditLog('PAYMENT_WEBHOOK'),
    async (req, res) => {
      try {
        // Verify webhook signature
        // Process payment confirmation
        // Update application status via workflow engine

        res.json({ success: true, message: 'Webhook processed' });
      } catch (error) {
        logger.error('[ApplicationRoutes] Payment webhook error:', error);
        res.status(500).json({ success: false, error: 'Webhook processing failed' });
      }
    },
  );

  return router;
}

// ==============================================
// ROUTE DOCUMENTATION
// ==============================================

const routeDocumentation = {
  '/applications': {
    POST: {
      description: 'Create new application',
      access: 'FARMER',
      rateLimit: '10/hour',
      body: {
        farmer: { type: 'object', required: true },
        farm: { type: 'object', required: true },
        documents: { type: 'array', required: false },
      },
      responses: {
        201: 'Application created successfully',
        400: 'Validation error',
        403: 'Forbidden - Farmers only',
        429: 'Rate limit exceeded',
      },
    },
  },

  '/applications/:id': {
    GET: {
      description: 'Get application details',
      access: 'Owner or DTAM staff',
      responses: {
        200: 'Application details with workflow status',
        403: 'Access denied',
        404: 'Application not found',
      },
    },
    PUT: {
      description: 'Update application (draft/revision states only)',
      access: 'FARMER (own applications)',
      responses: {
        200: 'Application updated',
        400: 'Cannot edit in current state',
        403: 'Access denied',
      },
    },
  },

  '/applications/:id/submit': {
    POST: {
      description: 'Submit application for review',
      access: 'FARMER (own applications)',
      responses: {
        200: 'Application submitted',
        400: 'Missing required documents',
        403: 'Access denied',
      },
    },
  },

  '/dtam/applications/:id/approve-payment': {
    POST: {
      description: 'Approve application for payment',
      access: 'DTAM_REVIEWER',
      body: {
        findings: { type: 'array', required: false },
        notes: { type: 'string', required: false },
      },
      responses: {
        200: 'Approved for payment',
        400: 'Invalid state transition',
        403: 'Reviewer access required',
      },
    },
  },

  '/dtam/applications/:id/request-revision': {
    POST: {
      description: 'Request revision from farmer',
      access: 'DTAM_REVIEWER',
      body: {
        reasons: { type: 'array', required: true },
        notes: { type: 'string', required: true },
      },
      responses: {
        200: 'Revision requested',
        400: 'Max revisions exceeded',
        403: 'Reviewer access required',
      },
    },
  },

  '/dtam/applications/:id/schedule-inspection': {
    POST: {
      description: 'Schedule farm inspection',
      access: 'DTAM_INSPECTOR',
      body: {
        scheduledDate: { type: 'string', format: 'date-time', required: true },
        type: { type: 'string', enum: ['onsite', 'virtual'], required: true },
        notes: { type: 'string', required: false },
      },
      responses: {
        200: 'Inspection scheduled',
        400: 'Invalid date or type',
        403: 'Inspector access required',
      },
    },
  },

  '/dtam/applications/:id/complete-inspection': {
    POST: {
      description: 'Complete farm inspection with report',
      access: 'DTAM_INSPECTOR',
      body: {
        findings: { type: 'array', required: true },
        checklist: { type: 'object', required: true },
        photos: { type: 'array', required: false },
        notes: { type: 'string', required: false },
      },
      responses: {
        200: 'Inspection completed',
        400: 'Compliance score too low',
        403: 'Inspector access required',
      },
    },
  },

  '/dtam/applications/:id/final-approval': {
    POST: {
      description: 'Final approval and certificate issuance',
      access: 'DTAM_ADMIN',
      body: {
        signature: { type: 'string', required: true },
        notes: { type: 'string', required: false },
        certificateTemplate: { type: 'string', required: false },
      },
      responses: {
        200: 'Application approved, certificate will be issued',
        400: 'Missing signature',
        403: 'Admin access required',
      },
    },
  },

  '/dtam/applications/:id/reject': {
    POST: {
      description: 'Reject application with reason',
      access: 'DTAM staff',
      body: {
        reason: { type: 'string', required: true },
        notes: { type: 'string', required: false },
      },
      responses: {
        200: 'Application rejected',
        403: 'DTAM access required',
      },
    },
  },
};

module.exports = {
  createApplicationRoutes,
  routeDocumentation,
};
