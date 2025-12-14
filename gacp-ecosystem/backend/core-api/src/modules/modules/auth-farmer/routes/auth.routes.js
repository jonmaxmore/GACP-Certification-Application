/**
 * Auth Routes
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Define Express routes for farmer authentication
 */

const express = require('express');
const authValidator = require('../validators/auth.validator');
const auth-middleware = require('../../../middleware/auth-middleware');
const upload = require('../../../middleware/upload');

/**
 * Create auth router
 * @param {auth-controller} auth-controller - Auth controller instance
 * @returns {express.Router}
 */
function createAuthRouter(auth-controller) {
  const router = express.Router();

  /**
   * @route POST /api/auth/farmer/register
   * @desc Register new farmer account
   * @access Public
   */
  router.post('/register',
    upload.single('idCardImage'),
    authValidator.validateRegister,
    (req, res) => auth-controller.register(req, res),
  );

  /**
   * @route POST /api/auth/farmer/login
   * @desc Login farmer
   * @access Public
   */
  router.post('/login', authValidator.validateLogin, (req, res) => auth-controller.login(req, res));

  /**
   * @route GET /api/auth/farmer/verify-email/:token
   * @desc Verify farmer email
   * @access Public
   */
  router.get('/verify-email/:token', (req, res) => auth-controller.verifyEmail(req, res));

  /**
   * @route POST /api/auth/farmer/request-password-reset
   * @desc Request password reset link
   * @access Public
   */
  router.post('/request-password-reset', authValidator.validateRequestPasswordReset, (req, res) =>
    auth-controller.requestPasswordReset(req, res),
  );

  /**
   * @route POST /api/auth/farmer/reset-password
   * @desc Reset password with token
   * @access Public
   */
  router.post('/reset-password', authValidator.validateResetPassword, (req, res) =>
    auth-controller.resetPassword(req, res),
  );

  /**
   * @route GET /api/auth/farmer/profile
   * @desc Get current user profile
   * @access Private (requires authentication)
   */
  router.get('/profile', auth-middleware.authenticateFarmer, (req, res) =>
    auth-controller.getProfile(req, res),
  );

  /**
   * @route PUT /api/auth/farmer/profile
   * @desc Update current user profile
   * @access Private (requires authentication)
   */
  router.put(
    '/profile',
    auth-middleware.authenticateFarmer,
    authValidator.validateUpdateProfile,
    (req, res) => auth-controller.updateProfile(req, res),
  );

  return router;
}

module.exports = createAuthRouter;
