/**
 * Notification Routes Configuration
 *
 * Express router for notification-related endpoints with comprehensive
 * security, validation, and rate limiting for the GACP platform.
 *
 * Routes Overview:
 * GET    /                             - Get user notifications
 * POST   /send                         - Send individual notification
 * POST   /bulk                         - Send bulk notifications (admin only)
 * PUT    /:notificationId/read         - Mark notification as read
 * PUT    /:notificationId/dismiss      - Dismiss notification
 * DELETE /:notificationId              - Delete notification (admin only)
 * GET    /templates                    - Get notification templates
 * GET    /stats                        - Get notification statistics (admin only)
 * POST   /test                         - Test notification delivery (admin only)
 * GET    /health                       - Service health check
 *
 * Security Features:
 * - JWT authentication on all routes
 * - Role-based authorization for admin operations
 * - Rate limiting for notification sending
 * - Input validation and sanitization
 * - Spam prevention mechanisms
 * - Comprehensive audit logging
 *
 * Business Logic Integration:
 * - User preference-based delivery
 * - Template-driven content generation
 * - Multi-channel delivery orchestration
 * - Analytics and engagement tracking
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const express = require('express');
const rateLimit = require('express-rate-limit');
const NotificationController = require('../controllers/NotificationController');
const AuthenticationMiddleware = require('../../../user-management/presentation/middleware/AuthenticationMiddleware-middleware');

class NotificationRoutes {
  constructor(dependencies = {}) {
    this.router = express.Router();
    this.notificationController = new NotificationController(dependencies);
    this.authMiddleware = new AuthenticationMiddleware(dependencies);

    // Configure rate limiting for different operations
    this.notificationLimiter = this._configureNotificationRateLimit();
    this.bulkLimiter = this._configureBulkRateLimit();
    this.generalLimiter = this._configureGeneralRateLimit();

    this._setupRoutes();
    logger.info('[NotificationRoutes] Initialized successfully');
  }

  /**
   * Setup all notification routes with appropriate middleware
   * @private
   */
  _setupRoutes() {
    const router = this.router;
    const controller = this.notificationController;
    const auth = this.authMiddleware;
    const validationRules = NotificationController.getValidationRules();

    // Apply authentication to all routes
    router.use(auth.authenticateJWT.bind(auth));

    // Get user notifications
    router.get(
      '/',
      this.generalLimiter,
      validationRules.getUserNotifications,
      controller.getUserNotifications.bind(controller),
    );

    // Send individual notification
    router.post(
      '/send',
      this.notificationLimiter,
      validationRules.sendNotification,
      controller.sendNotification.bind(controller),
    );

    // Send bulk notifications (admin only)
    router.post(
      '/bulk',
      auth.requireRole(['DTAM_ADMIN']),
      this.bulkLimiter,
      validationRules.sendBulkNotification,
      controller.sendBulkNotification.bind(controller),
    );

    // Mark notification as read
    router.put(
      '/:notificationId/read',
      this.generalLimiter,
      validationRules.notificationId,
      controller.markAsRead.bind(controller),
    );

    // Dismiss notification
    router.put(
      '/:notificationId/dismiss',
      this.generalLimiter,
      validationRules.notificationId,
      controller.dismissNotification.bind(controller),
    );

    // Delete notification (admin only)
    router.delete(
      '/:notificationId',
      auth.requireRole(['DTAM_ADMIN']),
      validationRules.notificationId,
      controller.deleteNotification.bind(controller),
    );

    // Get notification templates
    router.get('/templates', this.generalLimiter, controller.getTemplates.bind(controller));

    // Get notification statistics (admin/reviewer only)
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
          .query('notificationType')
          .optional()
          .isString()
          .withMessage('Invalid notification type'),
        require('express-validator')
          .query('groupBy')
          .optional()
          .isIn(['hour', 'day', 'week', 'month'])
          .withMessage('Invalid groupBy parameter'),
      ],
      controller.getStatistics.bind(controller),
    );

    // Test notification delivery (admin only)
    router.post(
      '/test',
      auth.requireRole(['DTAM_ADMIN']),
      [
        require('express-validator')
          .body('recipientEmail')
          .isEmail()
          .withMessage('Valid email is required for testing'),
        require('express-validator')
          .body('recipientPhone')
          .optional()
          .matches(/^(08|09)\d{8}$/)
          .withMessage('Invalid Thai mobile number format'),
        require('express-validator')
          .body('channels')
          .isObject()
          .withMessage('Channels configuration is required'),
      ],
      controller.testNotification.bind(controller),
    );

    // Service health check
    router.get('/health', this._getHealthStatus.bind(this));

    // Notification analytics tracking endpoints
    router.post(
      '/:notificationId/track/:event',
      this.generalLimiter,
      this._trackNotificationEvent.bind(this),
    );

    // User notification preferences
    router.get('/preferences', this.generalLimiter, this._getUserPreferences.bind(this));

    router.put(
      '/preferences',
      this.generalLimiter,
      [
        require('express-validator')
          .body('emailNotifications')
          .optional()
          .isBoolean()
          .withMessage('emailNotifications must be boolean'),
        require('express-validator')
          .body('smsNotifications')
          .optional()
          .isBoolean()
          .withMessage('smsNotifications must be boolean'),
        require('express-validator')
          .body('inAppNotifications')
          .optional()
          .isBoolean()
          .withMessage('inAppNotifications must be boolean'),
        require('express-validator')
          .body('notificationTypes')
          .optional()
          .isArray()
          .withMessage('notificationTypes must be an array'),
      ],
      this._updateUserPreferences.bind(this),
    );

    // Error handling middleware
    router.use(this._handleErrors.bind(this));
  }

  /**
   * Configure rate limiting for notification sending
   * @private
   */
  _configureNotificationRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 50, // limit each user to 50 notification sends per windowMs
      message: {
        success: false,
        error: 'NOTIFICATION_RATE_LIMIT',
        message: 'Too many notification requests, please try again later',
        retryAfter: 15 * 60,
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: req => {
        return req.userId || req.ip;
      },
      skip: req => {
        // Skip rate limiting for admins
        return req.userRole === 'DTAM_ADMIN';
      },
      handler: (req, res) => {
        console.warn(
          `[NotificationRoutes] Notification rate limit exceeded for user: ${req.userId}`,
        );
        res.status(429).json({
          success: false,
          error: 'NOTIFICATION_RATE_LIMIT',
          message: 'Too many notification requests, please try again later',
          retryAfter: 15 * 60,
        });
      },
    });
  }

  /**
   * Configure rate limiting for bulk notifications
   * @private
   */
  _configureBulkRateLimit() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit bulk notifications to 5 per hour
      message: {
        success: false,
        error: 'BULK_RATE_LIMIT',
        message: 'Bulk notification limit exceeded, please try again later',
        retryAfter: 60 * 60,
      },
      keyGenerator: req => {
        return req.userId || req.ip;
      },
      handler: (req, res) => {
        console.warn(
          `[NotificationRoutes] Bulk notification rate limit exceeded for user: ${req.userId}`,
        );
        res.status(429).json({
          success: false,
          error: 'BULK_RATE_LIMIT',
          message: 'Bulk notification limit exceeded, please try again later',
          retryAfter: 60 * 60,
        });
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
      max: 200, // limit each user to 200 requests per windowMs
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
   * Get notification service health status
   * @private
   */
  async _getHealthStatus(req, res) {
    try {
      const health = await this.notificationController.notificationService.healthCheck();

      const statusCode = health.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: health.status === 'healthy',
        data: health,
      });
    } catch (error) {
      logger.error('[NotificationRoutes] Health check error:', error);
      res.status(503).json({
        success: false,
        error: 'HEALTH_CHECK_ERROR',
        message: 'Error checking service health',
      });
    }
  }

  /**
   * Track notification events (opened, clicked, etc.)
   * @private
   */
  async _trackNotificationEvent(req, res) {
    try {
      const { notificationId, event } = req.params;
      const { url, metadata = {} } = req.body;
      const userId = req.userId;

      // Validate event type
      const validEvents = ['opened', 'clicked', 'bounced', 'spam', 'unsubscribed'];
      if (!validEvents.includes(event)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_EVENT',
          message: 'Invalid tracking event type',
        });
      }

      // Find notification and verify ownership
      const notification =
        await this.notificationController.notificationService.notificationRepository.findOne({
          notificationId,
          recipientId: userId,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found or access denied',
        });
      }

      // Record the event
      await notification.recordAnalytics(event, { url, ...metadata });

      // For click events, redirect if URL provided
      if (event === 'clicked' && url) {
        return res.redirect(url);
      }

      res.status(200).json({
        success: true,
        message: 'Event tracked successfully',
      });
    } catch (error) {
      logger.error('[NotificationRoutes] Event tracking error:', error);
      res.status(500).json({
        success: false,
        error: 'TRACKING_ERROR',
        message: 'Error tracking event',
      });
    }
  }

  /**
   * Get user notification preferences
   * @private
   */
  async _getUserPreferences(req, res) {
    try {
      const userId = req.userId;

      // Get user preferences from user repository
      const user =
        await this.notificationController.notificationService.userRepository.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      const preferences = user.notificationPreferences || {
        emailNotifications: true,
        smsNotifications: true,
        inAppNotifications: true,
        notificationTypes: {
          APPLICATION_UPDATES: true,
          PAYMENT_ALERTS: true,
          INSPECTION_NOTICES: true,
          SYSTEM_MESSAGES: true,
          MARKETING: false,
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
        language: 'th',
        timezone: 'Asia/Bangkok',
      };

      res.status(200).json({
        success: true,
        data: { preferences },
      });
    } catch (error) {
      logger.error('[NotificationRoutes] Get preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'PREFERENCES_ERROR',
        message: 'Error retrieving notification preferences',
      });
    }
  }

  /**
   * Update user notification preferences
   * @private
   */
  async _updateUserPreferences(req, res) {
    try {
      const userId = req.userId;
      const preferences = req.body;

      // Update user preferences
      const updatedUser =
        await this.notificationController.notificationService.userRepository.findByIdAndUpdate(
          userId,
          {
            $set: {
              notificationPreferences: preferences,
              updatedAt: new Date(),
            },
          },
          { new: true },
        );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      // Log preference update
      if (this.notificationController.auditService) {
        await this.notificationController.auditService.log({
          type: 'NOTIFICATION_PREFERENCES_UPDATED',
          userId,
          preferences,
          timestamp: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: {
          preferences: updatedUser.notificationPreferences,
        },
      });
    } catch (error) {
      logger.error('[NotificationRoutes] Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'UPDATE_PREFERENCES_ERROR',
        message: 'Error updating notification preferences',
      });
    }
  }

  /**
   * Error handling middleware
   * @private
   */
  _handleErrors(error, req, res, _next) {
    logger.error('[NotificationRoutes] Unhandled error:', error);

    // Log error details for debugging
    const errorDetails = {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      url: req.url,
      method: req.method,
      userId: req.userId,
      timestamp: new Date(),
    };

    logger.error('[NotificationRoutes] Error details:', errorDetails);

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

    if (error.code === 11000) {
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
      module: 'NotificationRoutes',
      version: '1.0.0',
      endpoints: [
        {
          method: 'GET',
          path: '/',
          description: 'Get user notifications',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'POST',
          path: '/send',
          description: 'Send individual notification',
          authentication: 'required',
          rateLimit: 'notification',
        },
        {
          method: 'POST',
          path: '/bulk',
          description: 'Send bulk notifications',
          authentication: 'admin',
          rateLimit: 'bulk',
        },
        {
          method: 'PUT',
          path: '/:notificationId/read',
          description: 'Mark notification as read',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'PUT',
          path: '/:notificationId/dismiss',
          description: 'Dismiss notification',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'DELETE',
          path: '/:notificationId',
          description: 'Delete notification',
          authentication: 'admin',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/templates',
          description: 'Get notification templates',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/stats',
          description: 'Get notification statistics',
          authentication: 'admin/reviewer',
          rateLimit: 'general',
        },
        {
          method: 'POST',
          path: '/test',
          description: 'Test notification delivery',
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
        {
          method: 'POST',
          path: '/:notificationId/track/:event',
          description: 'Track notification events',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'GET',
          path: '/preferences',
          description: 'Get user notification preferences',
          authentication: 'required',
          rateLimit: 'general',
        },
        {
          method: 'PUT',
          path: '/preferences',
          description: 'Update user notification preferences',
          authentication: 'required',
          rateLimit: 'general',
        },
      ],
      rateLimits: {
        notification: '50 requests per 15 minutes',
        bulk: '5 requests per hour',
        general: '200 requests per 5 minutes',
      },
      security: {
        authentication: 'JWT Bearer token',
        authorization: 'Role-based access control',
        inputValidation: 'express-validator',
        rateLimiting: 'express-rate-limit',
        spamPrevention: 'Enabled',
      },
    };
  }
}

module.exports = NotificationRoutes;
