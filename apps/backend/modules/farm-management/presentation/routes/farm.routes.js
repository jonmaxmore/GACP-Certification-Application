/**
 * Farm Routes (Presentation Layer)
 *
 * Defines HTTP routes for farm management
 * - Farmer routes: /api/farms/* (requires farmer authentication)
 * - DTAM routes: /api/dtam/farms/* (requires DTAM staff authentication + permissions)
 */

const express = require('express');

function createFarmRoutes(farmController, authMiddleware, validators) {
  const farmerRouter = express.Router();
  const dtamRouter = express.Router();

  // ===================================================================
  // FARMER ROUTES (Public - Authenticated Farmers)
  // ===================================================================

  /**
   * Register new farm
   * POST /api/farms
   */
  farmerRouter.post(
    '/',
    authMiddleware.authenticateFarmer,
    validators.validateRegisterFarm,
    (req, res) => farmController.registerFarm(req, res),
  );

  /**
   * Get farmer's farms list
   * GET /api/farms
   */
  farmerRouter.get('/', authMiddleware.authenticateFarmer, (req, res) =>
    farmController.listFarms(req, res),
  );

  /**
   * Get farm details
   * GET /api/farms/:id
   */
  farmerRouter.get('/:id', authMiddleware.authenticateFarmer, (req, res) =>
    farmController.getFarmDetails(req, res),
  );

  /**
   * Update farm details
   * PUT /api/farms/:id
   */
  farmerRouter.put(
    '/:id',
    authMiddleware.authenticateFarmer,
    validators.validateUpdateFarm,
    (req, res) => farmController.updateFarm(req, res),
  );

  /**
   * Submit farm for DTAM review
   * POST /api/farms/:id/submit
   */
  farmerRouter.post('/:id/submit', authMiddleware.authenticateFarmer, (req, res) =>
    farmController.submitFarmForReview(req, res),
  );

  // ===================================================================
  // DTAM ROUTES (Internal - DTAM Staff with Permissions)
  // ===================================================================

  /**
   * Get all farms with filters (DTAM staff only)
   * GET /api/dtam/farms
   */
  dtamRouter.get(
    '/',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_applications', 'review_applications']),
    (req, res) => farmController.listFarms(req, res),
  );

  /**
   * Get farm details (DTAM staff only)
   * GET /api/dtam/farms/:id
   */
  dtamRouter.get(
    '/:id',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_applications', 'review_applications']),
    (req, res) => farmController.getFarmDetails(req, res),
  );

  /**
   * Start farm review (DTAM staff only)
   * POST /api/dtam/farms/:id/start-review
   */
  dtamRouter.post(
    '/:id/start-review',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('review_applications'),
    (req, res) => farmController.startFarmReview(req, res),
  );

  /**
   * Approve farm (DTAM staff only)
   * POST /api/dtam/farms/:id/approve
   */
  dtamRouter.post(
    '/:id/approve',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('approve_applications'),
    validators.validateApproveFarm,
    (req, res) => farmController.approveFarm(req, res),
  );

  /**
   * Reject farm (DTAM staff only)
   * POST /api/dtam/farms/:id/reject
   */
  dtamRouter.post(
    '/:id/reject',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('reject_applications'),
    validators.validateRejectFarm,
    (req, res) => farmController.rejectFarm(req, res),
  );

  return {
    farmerRouter,
    dtamRouter,
  };
}

module.exports = createFarmRoutes;
