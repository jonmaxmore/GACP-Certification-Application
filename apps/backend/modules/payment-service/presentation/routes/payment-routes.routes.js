/**
 * Payment Routes Configuration
 *
 * Express router for payment-related endpoints with comprehensive
 * security, validation, and rate limiting for the GACP platform.
 *
 * Routes Overview:
 * POST   /calculate-fees               - Calculate application fees
 * POST   /initiate                     - Initiate new payment
 * GET    /:paymentId                   - Get payment status
 * POST   /webhook                      - Process payment webhooks
 * POST   /:paymentId/retry             - Retry failed payment
 * POST   /:paymentId/cancel            - Cancel pending payment
 * POST   /:paymentId/refund            - Process refund (admin only)
 * GET    /application/:applicationId   - Get application payments
 * GET    /user/history                 - Get user payment history
 * GET    /receipt/:paymentId           - Download payment receipt
 * GET    /stats                        - Payment statistics (admin only)
 *
 * Security Features:
 * - JWT authentication on all routes
 * - Role-based authorization for admin operations
 * - Rate limiting for payment operations
 * - Webhook signature verification
 * - Input validation and sanitization
 * - CORS protection for sensitive endpoints
 *
 * Business Logic Integration:
 * - Fee calculation with promotional codes
 * - PromptPay QR code generation
 * - Real-time payment status updates
 * - Comprehensive audit logging
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const express = require('express');
const rateLimit = require('express-rate-limit');
const PaymentController = require('../controllers/PaymentController');
const AuthenticationMiddleware = require('../../../user-management/presentation/middleware/AuthenticationMiddleware-middleware');

class PaymentRoutes {
  constructor(dependencies = {}) {
    this.router = express.Router();
    this.paymentController = new PaymentController(dependencies);
    this.authMiddleware = new AuthenticationMiddleware(dependencies);

    // Configure rate limiting for different operations
    this.paymentLimiter = this._configurePaymentRateLimit();
    this.webhookLimiter = this._configureWebhookRateLimit();
    this.generalLimiter = this._configureGeneralRateLimit();

    this._setupRoutes();
    logger.info('[PaymentRoutes] Initialized successfully');
  }

  /**
   * Setup all payment routes with appropriate middleware
   * @private
   */
  _setupRoutes() {
    const router = this.router;
    const controller = this.paymentController;
    const auth = this.authMiddleware;
    const validationRules = PaymentController.getValidationRules();

    // Public webhook endpoint (no authentication required)
    router.post(
      '/webhook',
      this.webhookLimiter,
      this._validateWebhookSource.bind(this),
      controller.processWebhook.bind(controller),
    );

    // Apply authentication to all other routes
    router.use(auth.authenticateJWT.bind(auth));

    // Fee calculation endpoint
    router.post(
      '/calculate-fees',
      this.generalLimiter,
      validationRules.calculateFees,
      controller.calculateFees.bind(controller),
    );

    // Payment initiation endpoint with enhanced rate limiting
    router.post(
      '/initiate',
      this.paymentLimiter,
      validationRules.initiatePayment,
      controller.initiatePayment.bind(controller),
    );

    // Get payment status
    router.get(
      '/:paymentId',
      this.generalLimiter,
      validationRules.getPayment,
      controller.getPaymentStatus.bind(controller),
    );

    // Retry failed payment
    router.post(
      '/:paymentId/retry',
      this.paymentLimiter,
      validationRules.getPayment,
      controller.retryPayment.bind(controller),
    );

    // Cancel pending payment
    router.post(
      '/:paymentId/cancel',
      this.generalLimiter,
      validationRules.getPayment,
      controller.cancelPayment.bind(controller),
    );

    // Process refund (admin only)
    router.post(
      '/:paymentId/refund',
      auth.requireRole(['DTAM_ADMIN']),
      validationRules.processRefund,
      controller.processRefund.bind(controller),
    );

    // Get payments for specific application
    router.get(
      '/application/:applicationId',
      this.generalLimiter,
      [
        require('express-validator')
          .param('applicationId')
          .isMongoId()
          .withMessage('Valid application ID is required'),
      ],
      controller.getApplicationPayments.bind(controller),
    );

    // Get user payment history
    router.get(
      '/user/history',
      this.generalLimiter,
      [
        require('express-validator')
          .query('page')
          .optional()
          .isInt({ min: 1 })
          .withMessage('Page must be a positive integer'),
        require('express-validator')
          .query('limit')
          .optional()
          .isInt({ min: 1, max: 100 })
          .withMessage('Limit must be between 1 and 100'),
        require('express-validator')
          .query('status')
          .optional()
          .isIn(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'])
          .withMessage('Invalid status filter'),
      ],
      controller.getUserPaymentHistory.bind(controller),
    );

    // Download payment receipt
    router.get(
      '/receipt/:paymentId',
      this.generalLimiter,
      validationRules.getPayment,
      controller.downloadReceipt.bind(controller),
    );

    // Payment statistics (admin only)
    router.get(
      '/stats',
      auth.requireRole(['DTAM_ADMIN', 'DTAM_REVIEWER']),
      [
        require('express-validator')
          .query('startDate')
          .optional()
          .isISO8601()
          .withMessage('Invalid start date format'),
        require('express-validator')
          .query('endDate')
          .optional()
          .isISO8601()
          .withMessage('Invalid end date format'),
        require('express-validator')
          .query('groupBy')
          .optional()
          .isIn(['day', 'week', 'month'])
          .withMessage('Invalid groupBy parameter'),
      ],
      this._getPaymentStatistics.bind(this),
    );

    // Health check endpoint
    router.get('/health', this._getHealthStatus.bind(this));

    // Error handling middleware
    router.use(this._handleErrors.bind(this));
  }

  /**
   * Configure rate limiting for payment operations
   * @private
   */
  _configurePaymentRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each user to 10 payment operations per windowMs
      message: {
        success: false,
        error: 'PAYMENT_RATE_LIMIT',
        message: 'Too many payment requests, please try again later',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: req => {
        // Rate limit per user
        return req.userId || req.ip;
      },
      handler: (req, res) => {
        logger.warn(`[PaymentRoutes] Payment rate limit exceeded for user: ${req.userId}`);
        res.status(429).json({
          success: false,
          error: 'PAYMENT_RATE_LIMIT',
          message: 'Too many payment requests, please try again later',
          retryAfter: 15 * 60,
        });
      },
    });
  }

  /**
   * Configure rate limiting for webhook endpoints
   * @private
   */
  _configureWebhookRateLimit() {
    return rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // Allow many webhook requests from payment gateway
      message: {
        success: false,
        error: 'WEBHOOK_RATE_LIMIT',
        message: 'Too many webhook requests',
      },
      keyGenerator: req => {
        // Rate limit by IP for webhooks
        return req.ip;
      },
      skip: req => {
        // Skip rate limiting for trusted webhook sources
        const trustedIPs = process.env.TRUSTED_WEBHOOK_IPS?.split(',') || [];
        return trustedIPs.includes(req.ip);
      },
    });
  }

  /**
   * Configure general rate limiting
   * @private
   */
  _configureGeneralRateLimit() {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100, // limit each user to 100 requests per windowMs
      message: {
        success: false,
        error: 'GENERAL_RATE_LIMIT',
        message: 'Too many requests, please try again later',
      },
      keyGenerator: req => {
        return req.userId || req.ip;
      },
    });
  }

  /**
   * Validate webhook source for security
   * @private
   */
  _validateWebhookSource(req, res, next) {
    const webhookSecret = req.get('X-Webhook-Secret');
    const expectedSecret = process.env.PROMPTPAY_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      logger.warn('[PaymentRoutes] Invalid webhook secret from IP:', req.ip);
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED_WEBHOOK',
        message: 'Invalid webhook credentials',
      });
    }

    // Log webhook attempt for security monitoring
    console.log('[PaymentRoutes] Webhook request from:', req.ip, {
      userAgent: req.get('User-Agent'),
      paymentId: req.body?.paymentId,
    });

    next();
  }

  /**
   * Get payment statistics
   * @private
   */
  async _getPaymentStatistics(req, res) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
        endDate = new Date(),
        groupBy = 'day',
      } = req.query;

      // This would be implemented in PaymentService
      const stats = await this.paymentController.paymentService.getPaymentStatistics({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        groupBy,
      });

      res.status(200).json({
        success: true,
        data: {
          statistics: stats,
          period: {
            startDate,
            endDate,
            groupBy,
          },
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('[PaymentRoutes] Statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'STATISTICS_ERROR',
        message: 'Error retrieving payment statistics',
      });
    }
  }

  /**
   * Get payment service health status
   * @private
   */
  async _getHealthStatus(req, res) {
    try {
      const health = await this.paymentController.paymentService.healthCheck();

      const statusCode = health.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: health.status === 'healthy',
        data: health,
      });
    } catch (error) {
      logger.error('[PaymentRoutes] Health check error:', error);
      res.status(503).json({
        success: false,
        error: 'HEALTH_CHECK_ERROR',
        message: 'Error checking service health',
      });
    }
  }

  /**
   * Error handling middleware
   * @private
   */
  _handleErrors(error, req, res, _next) {
    logger.error('[PaymentRoutes] Unhandled error:', error);

    // Log error details for debugging
    const errorDetails = {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      url: req.url,
      method: req.method,
      userId: req.userId,
      timestamp: new Date(),
    };

    logger.error('[PaymentRoutes] Error details:', errorDetails);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: error.errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ID',
        message: 'Invalid ID format',
      });
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Duplicate entry detected',
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId: req.id || 'unknown',
    });
  }

  /**
   * Get the configured router
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get route information for documentation
   */
  getRouteInfo() {
    return {
      module: 'PaymentRoutes',
      version: '1.0.0',
      endpoints: [
        {
          method: 'POST',
          path: '/calculate-fees',
          description: 'Calculate application fees',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'POST',
          path: '/initiate',
          description: 'Initiate payment process',
          authentication: 'required',
          rateLimit: 'payment',
        },
        {
          method: 'GET',
          path: '/:paymentId',
          description: 'Get payment status',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'POST',
          path: '/webhook',
          description: 'Process payment webhooks',
          authentication: 'webhook-secret',
          rateLimit: 'webhook',
        },
        {
          method: 'POST',
          path: '/:paymentId/retry',
          description: 'Retry failed payment',
          authentication: 'required',
          rateLimit: 'payment',
        },
        {
          method: 'POST',
          path: '/:paymentId/cancel',
          description: 'Cancel pending payment',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'POST',
          path: '/:paymentId/refund',
          description: 'Process refund (admin only)',
          authentication: 'admin',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/application/:applicationId',
          description: 'Get application payments',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/user/history',
          description: 'Get user payment history',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/receipt/:paymentId',
          description: 'Download payment receipt',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/stats',
          description: 'Payment statistics (admin only)',
          authentication: 'admin',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/health',
          description: 'Service health check',
          authentication: 'none',
          rateLimit: 'none',
        },
      ],
      rateLimits: {
        payment: '10 requests per 15 minutes',
        webhook: '100 requests per minute',
        general: '100 requests per 5 minutes',
      },
      security: {
        authentication: 'JWT Bearer token',
        authorization: 'Role-based access control',
        webhookSecurity: 'Secret-based authentication',
        inputValidation: 'express-validator',
        rateLimiting: 'express-rate-limit',
      },
    };
  }
}

module.exports = PaymentRoutes;
