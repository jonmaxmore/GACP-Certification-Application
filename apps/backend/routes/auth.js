/**
 * Authentication Routes for GACP Platform
 * Handles user registration, login, and account management
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

const GACPUserService = require('../services/gacp-user');
const userService = new GACPUserService();

const { authenticate, authorize, rateLimitSensitive } = require('../middleware/auth-middleware');
const {
  validateRequest,
  validateUserRegistration,
} = require('../middleware/validation-middleware');
const { handleAsync, sendError } = require('../middleware/error-handler-middleware');
const { createLogger } = require('../shared/logger');
const logger = createLogger('auth');

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  rememberMe: Joi.boolean().optional(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Rate limiting
const isDevelopment = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 10,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
    retryAfter: 15 * 60,
  },
});

/**
 * POST /api/auth/register
 * Register new user
 */
router.post(
  '/register',
  authLimiter,
  validateUserRegistration,
  handleAsync(async (req, res) => {
    try {
      const result = await userService.registerUser(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          ...result,
          nextSteps: [
            'Verify your email address',
            'Complete your profile',
            'Read platform guidelines',
          ],
        },
      });
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(400).json({
          success: false,
          message: 'การลงทะเบียนไม่สำเร็จ กรุณาตรวจสอบข้อมูล',
          code: 'REGISTRATION_FAILED',
        });
      }
      throw error;
    }
  }),
);

/**
 * POST /api/auth/login
 * Authenticate user login
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  handleAsync(async (req, res) => {
    const { email, password, rememberMe = false } = req.body;
    const requestInfo = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      location: req.get('X-Forwarded-For') || req.connection.remoteAddress,
    };

    try {
      const result = await userService.login(email, password, rememberMe, requestInfo);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Account locked') {
        return sendError(res, 'ACCOUNT_LOCKED', 'Account is temporarily locked', null, 403);
      }
      return sendError(res, 'LOGIN_FAILED', 'Invalid email or password', null, 401);
    }
  }),
);

/**
 * POST /api/auth/dtam/login
 * DTAM Staff Login
 */
router.post(
  '/dtam/login',
  loginLimiter,
  handleAsync(async (req, res) => {
    const { username, email, password, userType } = req.body;
    const loginIdentifier = username || email;
    const requestInfo = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      location: req.get('X-Forwarded-For') || req.connection.remoteAddress,
    };

    if (!loginIdentifier || !password) {
      return sendError(res, 'VALIDATION_ERROR', 'Username/email and password are required', null, 400);
    }

    try {
      const result = await userService.loginDtam(loginIdentifier, password, requestInfo);

      res.json({
        success: true,
        message: 'DTAM login successful',
        data: {
          ...result,
          userType: 'DTAM_STAFF',
        },
      });
    } catch (error) {
      if (error.message === 'Account locked') {
        return sendError(res, 'ACCOUNT_LOCKED', 'Account is locked', null, 423);
      }
      return sendError(res, 'LOGIN_FAILED', 'Invalid credentials or unauthorized access', null, 401);
    }
  }),
);

/**
 * POST /api/auth/refresh-token
 * Refresh access token
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  handleAsync(async (req, res) => {
    try {
      const result = await userService.refreshToken(req.body.refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      return sendError(res, 'INVALID_TOKEN', 'Invalid refresh token', null, 401);
    }
  }),
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  authenticate,
  handleAsync(async (req, res) => {
    logger.info('User logged out', {
      userId: req.user.id,
      email: req.user.email,
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }),
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  handleAsync(async (req, res) => {
    const result = await userService.getProfile(req.user.id);

    res.json({
      success: true,
      data: result,
    });
  }),
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  validateRequest({
    fullName: 'string|min:2|max:100',
    phone: 'string|regex:/^[+]?[0-9()\\s-]+$/',
    notifications: 'object',
  }),
  handleAsync(async (req, res) => {
    const result = await userService.updateProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  }),
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  '/change-password',
  authenticate,
  rateLimitSensitive(),
  validateRequest({
    currentPassword: 'required|string',
    newPassword: 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/',
  }),
  handleAsync(async (req, res) => {
    try {
      await userService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error.message === 'Invalid current password') {
        return sendError(res, 'LOGIN_FAILED', 'Current password is incorrect', null, 401);
      }
      throw error;
    }
  }),
);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({
    email: 'required|email',
  }),
  handleAsync(async (req, res) => {
    await userService.requestPasswordReset(req.body.email);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }),
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  authLimiter,
  validateRequest({
    token: 'required|string',
    newPassword: 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/',
  }),
  handleAsync(async (req, res) => {
    try {
      await userService.resetPassword(req.body.token, req.body.newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid or expired reset token', null, 400);
    }
  }),
);

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post(
  '/verify-email',
  validateRequest({
    token: 'required|string',
  }),
  handleAsync(async (req, res) => {
    try {
      await userService.verifyEmail(req.body.token);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid or expired verification token', null, 400);
    }
  }),
);

/**
 * POST /api/auth/resend-verification
 * Resend email verification
 */
router.post(
  '/resend-verification',
  authenticate,
  authLimiter,
  handleAsync(async (req, res) => {
    try {
      await userService.resendVerification(req.user.id);

      res.json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      if (error.message === 'Email is already verified') {
        return sendError(res, 'VALIDATION_ERROR', 'Email is already verified', null, 400);
      }
      if (error.message === 'User not found') {
        return sendError(res, 'NOT_FOUND', 'User not found', null, 404);
      }
      throw error;
    }
  }),
);

/**
 * GET /api/auth/login-history
 * Get user login history
 */
router.get(
  '/login-history',
  authenticate,
  handleAsync(async (req, res) => {
    // Get user with login history and 5s query timeout (Task 1.3)
    const user = await userService.repository.model.findById(req.user.id).select('loginHistory lastLogin').maxTimeMS(5000);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    res.json({
      success: true,
      data: {
        loginHistory: user.loginHistory,
        lastLogin: user.lastLogin,
      },
    });
  }),
);

/**
 * POST /api/auth/generate-api-key
 * Generate API key for external integrations
 */
router.post(
  '/generate-api-key',
  authenticate,
  authorize(['admin', 'officer']),
  rateLimitSensitive(24 * 60 * 60 * 1000, 3), // 3 per day
  handleAsync(async (req, res) => {
    // Get user with 5s query timeout (Task 1.3)
    const user = await userService.repository.findById(req.user.id);

    if (!user) {
      return sendError.notFound(res, 'User');
    }

    // Generate new API key
    const apiKey = user.generateApiKey();
    await userService.repository.save(user);

    logger.info('API key generated', {
      userId: user._id,
      keyExpiry: user.apiKeyExpiry,
    });

    res.json({
      success: true,
      message: 'API key generated successfully',
      data: {
        apiKey,
        expiresAt: user.apiKeyExpiry,
      },
    });
  }),
);

module.exports = router;
