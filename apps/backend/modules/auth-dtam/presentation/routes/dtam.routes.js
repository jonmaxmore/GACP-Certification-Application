/**
 * DTAM Staff Auth Routes
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Define Express routes for DTAM staff authentication
 */

const express = require('express');
const dtamValidator = require('../validators/dtam.validator');
const authMiddleware = require('../../../../middleware/auth-middleware');

/**
 * Create DTAM auth router
 * @param {DTAMStaffAuthController} authController - Auth controller instance
 * @returns {express.Router}
 */
function createDTAMAuthRouter(authController) {
  const router = express.Router();

  /**
   * @route POST /api/auth/dtam/login
   * @desc Login DTAM staff
   * @access Public
   */
  router.post('/login', dtamValidator.validateLogin, (req, res) => authController.login(req, res));

  /**
   * @route POST /api/auth/dtam/request-password-reset
   * @desc Request password reset link
   * @access Public
   */
  router.post('/request-password-reset', dtamValidator.validateRequestPasswordReset, (req, res) =>
    authController.requestPasswordReset(req, res),
  );

  /**
   * @route POST /api/auth/dtam/reset-password
   * @desc Reset password with token
   * @access Public
   */
  router.post('/reset-password', dtamValidator.validateResetPassword, (req, res) =>
    authController.resetPassword(req, res),
  );

  /**
   * @route GET /api/auth/dtam/profile
   * @desc Get current staff profile
   * @access Private (requires DTAM authentication)
   */
  router.get('/profile', authMiddleware.authenticateDTAMStaff, (req, res) =>
    authController.getProfile(req, res),
  );

  /**
   * @route PUT /api/auth/dtam/profile
   * @desc Update current staff profile
   * @access Private (requires DTAM authentication)
   */
  router.put(
    '/profile',
    authMiddleware.authenticateDTAMStaff,
    dtamValidator.validateUpdateProfile,
    (req, res) => authController.updateProfile(req, res),
  );

  /**
   * @route GET /api/auth/dtam/staff
   * @desc List all staff (with filters)
   * @access Private (requires DTAM authentication + view_staff permission)
   */
  router.get(
    '/staff',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('view_staff'),
    (req, res) => authController.listStaff(req, res),
  );

  /**
   * @route POST /api/auth/dtam/staff
   * @desc Create new DTAM staff
   * @access Private (requires DTAM authentication + create_staff permission)
   */
  router.post(
    '/staff',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('create_staff'),
    dtamValidator.validateCreateStaff,
    (req, res) => authController.createStaff(req, res),
  );

  /**
   * @route PUT /api/auth/dtam/staff/:id/role
   * @desc Update staff role and permissions
   * @access Private (requires DTAM authentication + update_staff permission)
   */
  router.put(
    '/staff/:id/role',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requirePermission('update_staff'),
    dtamValidator.validateUpdateRole,
    (req, res) => authController.updateStaffRole(req, res),
  );

  return router;
}

module.exports = createDTAMAuthRouter;
