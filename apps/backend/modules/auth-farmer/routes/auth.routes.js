/**
 * Auth Routes
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Define Express routes for farmer authentication
 */

const express = require('express');
const authValidator = require('../validators/auth.validator');
const authMiddleware = require('../../../../middleware/auth-middleware');
const upload = require('../../../../middleware/upload');

/**
 * Create auth router
 * @param {AuthController} authController - Auth controller instance
 * @returns {express.Router}
 */
function createAuthRouter(authController) {
  const router = express.Router();

  /**
   * @route POST /api/auth/farmer/register
   * @desc Register new farmer account
   * @access Public
   */
  router.post('/register',
    upload.single('idCardImage'),
    authValidator.validateRegister,
    (req, res) => authController.register(req, res),
  );

  /**
   * @route POST /api/auth/farmer/login
   * @desc Login farmer
   * @access Public
   */
  router.post('/login', authValidator.validateLogin, (req, res) => authController.login(req, res));

  /**
   * @route GET /api/auth/farmer/verify-email/:token
   * @desc Verify farmer email
   * @access Public
   */
  router.get('/verify-email/:token', (req, res) => authController.verifyEmail(req, res));

  /**
   * @route POST /api/auth/farmer/request-password-reset
   * @desc Request password reset link
   * @access Public
   */
  router.post('/request-password-reset', authValidator.validateRequestPasswordReset, (req, res) =>
    authController.requestPasswordReset(req, res),
  );

  /**
   * @route POST /api/auth/farmer/reset-password
   * @desc Reset password with token
   * @access Public
   */
  router.post('/reset-password', authValidator.validateResetPassword, (req, res) =>
    authController.resetPassword(req, res),
  );

  /**
   * @route GET /api/auth/farmer/profile
   * @desc Get current user profile
   * @access Private (requires authentication)
   */
  router.get('/profile', authMiddleware.authenticateFarmer, (req, res) =>
    authController.getProfile(req, res),
  );

  /**
   * @route PUT /api/auth/farmer/profile
   * @desc Update current user profile
   * @access Private (requires authentication)
   */
  router.put(
    '/profile',
    authMiddleware.authenticateFarmer,
    authValidator.validateUpdateProfile,
    (req, res) => authController.updateProfile(req, res),
  );

  return router;
}

module.exports = createAuthRouter;
