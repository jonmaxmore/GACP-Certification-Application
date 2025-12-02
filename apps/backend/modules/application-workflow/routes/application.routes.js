/**
 * 📋 Application Workflow Routes
 * API endpoints for GACP certification application workflow
 */

const logger = require('../../../shared/logger/logger');
const express = require('express');
const router = express.Router();
const ApplicationWorkflowController = require('../controllers/application-workflow.controller');

module.exports = (dependencies = {}) => {
  const { workflowService, auth } = dependencies;

  if (!workflowService) {
    logger.error('[WorkflowRoutes] Workflow service not provided');
    return router;
  }

  if (!auth) {
    logger.error('[WorkflowRoutes] Auth middleware not provided');
    return router;
  }

  // Create controller instance
  const controller = new ApplicationWorkflowController(workflowService);

  // ============================================================================
  // APPLICATION CRUD ROUTES
  // ============================================================================

  /**
   * POST /api/applications
   * Create new application
   */
  router.post('/applications', auth, controller.createApplication);

  /**
   * GET /api/applications
   * List applications (with filters)
   */
  router.get('/applications', auth, controller.listApplications);

  /**
   * GET /api/applications/:id
   * Get application by ID
   */
  router.get('/applications/:id', auth, controller.getApplicationById);

  /**
   * PUT /api/applications/:id/step/:stepId
   * Update application step data
   */
  router.put('/applications/:id/step/:stepId', auth, controller.updateStepData);

  // ============================================================================
  // WORKFLOW STATE ROUTES
  // ============================================================================

  /**
   * POST /api/applications/:id/submit
   * Submit application for review
   */
  router.post('/applications/:id/submit', auth, controller.submitApplication);

  /**
   * POST /api/applications/:id/review
   * Start document review (admin/reviewer)
   */
  router.post('/applications/:id/review', auth, controller.startReview);

  /**
   * POST /api/applications/:id/review/complete
   * Complete document review
   */
  router.post('/applications/:id/review/complete', auth, controller.completeReview);

  /**
   * POST /api/applications/:id/inspection/start
   * Start field inspection (admin/inspector)
   */
  router.post('/applications/:id/inspection/start', auth, controller.startInspection);

  /**
   * POST /api/applications/:id/inspection/complete
   * Complete field inspection
   */
  router.post('/applications/:id/inspection/complete', auth, controller.completeInspection);

  /**
   * POST /api/applications/:id/approve
   * Approve application (admin only)
   */
  router.post('/applications/:id/approve', auth, controller.approveApplication);

  /**
   * POST /api/applications/:id/reject
   * Reject application (admin only)
   */
  router.post('/applications/:id/reject', auth, controller.rejectApplication);

  // ============================================================================
  // STATISTICS ROUTES
  // ============================================================================

  /**
   * GET /api/applications/statistics
   * Get workflow statistics (admin only)
   */
  router.get('/statistics', auth, controller.getStatistics);

  logger.info('[WorkflowRoutes] Routes loaded successfully - 13 endpoints');

  return router;
};
