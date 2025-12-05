/**
 * 🌱 Farm Management Routes
 * API endpoints for cultivation cycle management
 */

const logger = require('../../../shared/logger/logger');
const express = require('express');
const router = express.Router();
const FarmManagementController = require('../controllers/farm-management.controller');

module.exports = (dependencies = {}) => {
  const { farmService, auth } = dependencies;

  if (!farmService) {
    logger.error('[FarmRoutes] Farm service not provided');
    return router;
  }

  if (!auth) {
    logger.error('[FarmRoutes] Auth middleware not provided');
    return router;
  }

  // Create controller instance
  const controller = new FarmManagementController(farmService);

  // ============================================================================
  // CULTIVATION CYCLE ROUTES
  // ============================================================================

  /**
   * POST /api/farm/cycles
   * Create new cultivation cycle
   */
  router.post('/cycles', auth, controller.createCycle);

  /**
   * GET /api/farm/cycles
   * List all cultivation cycles (with filters)
   */
  router.get('/cycles', auth, controller.listCycles);

  /**
   * GET /api/farm/cycles/:id
   * Get cultivation cycle by ID
   */
  router.get('/cycles/:id', auth, controller.getCycleById);

  /**
   * POST /api/farm/cycles/:id/complete
   * Complete cultivation cycle
   */
  router.post('/cycles/:id/complete', auth, controller.completeCycle);

  // ============================================================================
  // ACTIVITY ROUTES
  // ============================================================================

  /**
   * POST /api/farm/cycles/:id/activities
   * Record SOP activity
   */
  router.post('/cycles/:id/activities', auth, controller.recordActivity);

  /**
   * GET /api/farm/cycles/:id/activities
   * Get all activities for cycle
   */
  router.get('/cycles/:id/activities', auth, controller.getActivities);

  // ============================================================================
  // COMPLIANCE ROUTES
  // ============================================================================

  /**
   * POST /api/farm/cycles/:id/compliance
   * Record compliance check (inspector)
   */
  router.post('/cycles/:id/compliance', auth, controller.recordComplianceCheck);

  /**
   * GET /api/farm/cycles/:id/compliance
   * Get compliance checks for cycle
   */
  router.get('/cycles/:id/compliance', auth, controller.getComplianceChecks);

  // ============================================================================
  // HARVEST ROUTES
  // ============================================================================

  /**
   * POST /api/farm/cycles/:id/harvest
   * Record harvest data
   */
  router.post('/cycles/:id/harvest', auth, controller.recordHarvest);

  /**
   * GET /api/farm/cycles/:id/harvest
   * Get harvest data for cycle
   */
  router.get('/cycles/:id/harvest', auth, controller.getHarvest);

  // ============================================================================
  // QUALITY TEST ROUTES
  // ============================================================================

  /**
   * POST /api/farm/cycles/:id/quality-test
   * Record quality test (laboratorian)
   */
  router.post('/cycles/:id/quality-test', auth, controller.recordQualityTest);

  /**
   * GET /api/farm/cycles/:id/quality-tests
   * Get quality tests for cycle
   */
  router.get('/cycles/:id/quality-tests', auth, controller.getQualityTests);

  // ============================================================================
  // DASHBOARD ROUTES
  // ============================================================================

  /**
   * GET /api/farm/dashboard
   * Get farmer dashboard data
   */
  router.get('/dashboard', auth, controller.getDashboard);

  logger.info('[FarmRoutes] Routes loaded successfully - 13 endpoints');

  return router;
};
