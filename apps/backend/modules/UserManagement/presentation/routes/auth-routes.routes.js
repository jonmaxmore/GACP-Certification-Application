/**
 * Authentication Routes
 *
 * Express routes for user authentication and management endpoints.
 * Integrates controller with middleware stack for complete security.
 *
 * Route Structure:
 * POST   /auth/login           - User authentication (5/15min per IP)
 * POST   /auth/refresh         - Token refresh (10/min per IP)
 * POST   /auth/logout          - User logout (protected)
 * POST   /auth/change-password - Password change (10/15min per IP)
 * GET    /auth/profile         - Get user profile (protected)
 * PUT    /auth/profile         - Update user profile (20/15min per IP)
 * POST   /auth/forgot-password - Password reset request (3/hour per IP)
 * POST   /auth/reset-password  - Password reset confirmation (5/15min per IP)
 * GET    /auth/verify          - Token verification (protected)
 *
 * Security Features:
 * - Tiered rate limiting per endpoint (Phase 3.1)
 * - Redis-backed rate limit store
 * - Input validation
 * - Authentication middleware
 * - Authorization checks
 * - Request logging
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-26
 */

const express = require('express');
const { createAuthRateLimiters } = require('../../../../middleware/auth-rate-limiters-middleware');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('user-management-authRoutes');

const {
  checkTokenBlacklist,
  checkTokenVersion,
} = require('../../../../middleware/jwt-token-manager-middleware');
const router = express.Router();

function createAuthRoutes(dependencies = {}) {
  const { userAuthenticationController, authenticationMiddleware, redisClient, tokenManager } =
    dependencies;

  // Validation rules
  const validationRules = userAuthenticationController.constructor.getValidationRules();

  // Specialized rate limiters for auth endpoints (Phase 3.1)
  const rateLimiters = createAuthRateLimiters(redisClient);

  // Security headers for all routes
  router.use(authenticationMiddleware.securityHeaders());

  /**
   * Public Routes (No authentication required)
   */

  // User login - Very strict (5 attempts per 15min, skip successful)
  router.post('/login', rateLimiters.loginLimiter, validationRules.login, (req, res) =>
    userAuthenticationController.login(req, res),
  );

  // Token refresh - Moderate (10 per minute)
  router.post('/refresh', rateLimiters.refreshLimiter, validationRules.refreshToken, (req, res) =>
    userAuthenticationController.refreshToken(req, res),
  );

  // Forgot password - Very strict (3 per hour)
  router.post(
    '/forgot-password',
    rateLimiters.passwordResetRequestLimiter,
    validationRules.forgotPassword,
    (req, res) => userAuthenticationController.forgotPassword(req, res),
  );

  // Reset password - Strict (5 per 15min, skip successful)
  router.post(
    '/reset-password',
    rateLimiters.passwordResetConfirmLimiter,
    validationRules.resetPassword,
    (req, res) => userAuthenticationController.resetPassword(req, res),
  );

  /**
   * Protected Routes (Authentication required)
   */

  // User logout - Normal rate
  router.post(
    '/logout',
    rateLimiters.generalAuthLimiter,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    (req, res) => userAuthenticationController.logout(req, res),
  );

  // Change password - Moderate (10 per 15min)
  router.post(
    '/change-password',
    rateLimiters.passwordChangeLimiter,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    validationRules.changePassword,
    (req, res) => userAuthenticationController.changePassword(req, res),
  );

  // Get user profile - Normal rate (with token validation)
  router.get(
    '/profile',
    rateLimiters.generalAuthLimiter,
    authenticationMiddleware.extractToken(),
    checkTokenBlacklist(tokenManager),
    checkTokenVersion(tokenManager),
    authenticationMiddleware.authenticate(),
    (req, res) => userAuthenticationController.getProfile(req, res),
  );

  // Update user profile - Moderate (20 per 15min, with token validation)
  router.put(
    '/profile',
    rateLimiters.profileUpdateLimiter,
    authenticationMiddleware.extractToken(),
    checkTokenBlacklist(tokenManager),
    checkTokenVersion(tokenManager),
    authenticationMiddleware.authenticate(),
    validationRules.updateProfile,
    (req, res) => userAuthenticationController.updateProfile(req, res),
  );

  // Token verification endpoint - Normal rate (with token validation)
  router.get(
    '/verify',
    rateLimiters.generalAuthLimiter,
    authenticationMiddleware.extractToken(),
    checkTokenBlacklist(tokenManager),
    checkTokenVersion(tokenManager),
    authenticationMiddleware.authenticate(),
    (req, res) => {
      // If we reach here, token is valid
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: req.user.userId,
            email: req.user.email,
            role: req.user.role,
            permissions: req.user.permissions,
          },
        },
      });
    },
  );

  /**
   * Admin Routes (Admin role required)
   */

  // Get all users (Admin only) - Normal rate
  router.get(
    '/users',
    rateLimiters.generalAuthLimiter,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    authenticationMiddleware.requireRole('DTAM_ADMIN'),
    authenticationMiddleware.authorize('user:read:all'),
    async (req, res) => {
      try {
        // This would be implemented in a separate UserManagementController
        // For now, return placeholder
        res.status(200).json({
          success: true,
          message: 'User list endpoint (Admin only)',
          data: {
            users: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 10,
            },
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Error retrieving users',
        });
      }
    },
  );

  // Update user status (Admin only) - Moderate rate
  router.patch(
    '/users/:userId/status',
    rateLimiters.profileUpdateLimiter,
    authenticationMiddleware.extractToken(),
    authenticationMiddleware.authenticate(),
    authenticationMiddleware.requireRole('DTAM_ADMIN'),
    authenticationMiddleware.authorize('user:manage:all'),
    async (req, res) => {
      try {
        // This would be implemented in a separate UserManagementController
        // For now, return placeholder
        res.status(200).json({
          success: true,
          message: 'User status update endpoint (Admin only)',
          data: {
            userId: req.params.userId,
            status: req.body.isActive,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Error updating user status',
        });
      }
    },
  );

  /**
   * Health check and info endpoints
   */

  // Authentication service health check
  router.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      service: 'User Authentication Service',
      status: 'healthy',
      timestamp: new Date(),
      version: '1.0.0',
    });
  });

  // Get authentication configuration (public info only)
  router.get('/config', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
        },
        tokenPolicy: {
          accessTokenExpiry: '24h',
          refreshTokenExpiry: '7d',
        },
        securityPolicy: {
          maxLoginAttempts: 5,
          lockoutDuration: 30, // minutes
        },
      },
    });
  });

  /**
   * Error handling middleware
   */
  router.use((error, req, res, _next) => {
    logger.error('[AuthRoutes] Unhandled error:', error);

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(isDevelopment && { debug: error.message }),
    });
  });

  /**
   * 404 handler for unknown auth routes
   */
  router.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'ROUTE_NOT_FOUND',
      message: `Authentication route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  return router;
}

module.exports = createAuthRoutes;
