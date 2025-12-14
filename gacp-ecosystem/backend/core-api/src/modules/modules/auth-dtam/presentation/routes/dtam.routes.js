/**
 * DTAM Staff Auth Routes
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Define Express routes for DTAM staff authentication
 */

const express = require('express');
const dtamValidator = require('../validators/dtam.validator');
const auth-middleware = require('../../../../middleware/auth-middleware');

/**
 * Create DTAM auth router
 * @param {DTAMStaffauth-controller} auth-controller - Auth controller instance
 * @returns {express.Router}
 */
function createDTAMAuthRouter(auth-controller) {
  const router = express.Router();

  /**
   * @route POST /api/auth/dtam/login
   * @desc Login DTAM staff
   * @access Public
   */
  router.post('/login', dtamValidator.validateLogin, (req, res) => auth-controller.login(req, res));

  /**
   * @route POST /api/auth/dtam/request-password-reset
   * @desc Request password reset link
   * @access Public
   */
  router.post('/request-password-reset', dtamValidator.validateRequestPasswordReset, (req, res) =>
    auth-controller.requestPasswordReset(req, res),
  );

  /**
   * @route POST /api/auth/dtam/reset-password
   * @desc Reset password with token
   * @access Public
   */
  router.post('/reset-password', dtamValidator.validateResetPassword, (req, res) =>
    auth-controller.resetPassword(req, res),
  );

  /**
   * @route GET /api/auth/dtam/profile
   * @desc Get current staff profile
   * @access Private (requires DTAM authentication)
   */
  router.get('/profile', auth-middleware.authenticateDTAMStaff, (req, res) =>
    auth-controller.getProfile(req, res),
  );

  /**
   * @route PUT /api/auth/dtam/profile
   * @desc Update current staff profile
   * @access Private (requires DTAM authentication)
   */
  router.put(
    '/profile',
    auth-middleware.authenticateDTAMStaff,
    dtamValidator.validateUpdateProfile,
    (req, res) => auth-controller.updateProfile(req, res),
  );

  /**
   * @route GET /api/auth/dtam/staff
   * @desc List all staff (with filters)
   * @access Private (requires DTAM authentication + view_staff permission)
   */
  router.get(
    '/staff',
    auth-middleware.authenticateDTAMStaff,
    auth-middleware.requirePermission('view_staff'),
    (req, res) => auth-controller.listStaff(req, res),
  );

  /**
   * @route POST /api/auth/dtam/staff
   * @desc Create new DTAM staff
   * @access Private (requires DTAM authentication + create_staff permission)
   */
  router.post(
    '/staff',
    auth-middleware.authenticateDTAMStaff,
    auth-middleware.requirePermission('create_staff'),
    dtamValidator.validateCreateStaff,
    (req, res) => auth-controller.createStaff(req, res),
  );

  /**
   * @route PUT /api/auth/dtam/staff/:id/role
   * @desc Update staff role and permissions
   * @access Private (requires DTAM authentication + update_staff permission)
   */
  router.put(
    '/staff/:id/role',
    auth-middleware.authenticateDTAMStaff,
    auth-middleware.requirePermission('update_staff'),
    dtamValidator.validateUpdateRole,
    (req, res) => auth-controller.updateStaffRole(req, res),
  );

  return router;
}

module.exports = createDTAMAuthRouter;
