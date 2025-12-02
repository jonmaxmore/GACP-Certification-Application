/**
 * Notification Controller - RESTful API Endpoints
 *
 * HTTP request handlers for notification operations in the GACP platform.
 * Provides comprehensive notification management endpoints with proper
 * validation, authorization, and error handling.
 *
 * Endpoints:
 * GET    /                             - Get user notifications
 * POST   /send                         - Send individual notification
 * POST   /bulk                         - Send bulk notifications
 * PUT    /:notificationId/read         - Mark notification as read
 * PUT    /:notificationId/dismiss      - Dismiss notification
 * DELETE /:notificationId              - Delete notification
 * GET    /templates                    - Get notification templates
 * GET    /stats                        - Get notification statistics
 * POST   /test                         - Test notification delivery
 *
 * Business Logic Integration:
 * - User notification preferences
 * - Template-based content generation
 * - Multi-channel delivery (email, SMS, in-app)
 * - Delivery tracking and analytics
 * - Rate limiting and spam prevention
 * - Comprehensive audit logging
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const { validationResult, body, param, query } = require('express-validator');
const NotificationService = require('../services/NotificationService');

class NotificationController {
  constructor(dependencies = {}) {
    this.notificationService = new NotificationService(dependencies);
    this.auditService = dependencies.auditService;
    this.rateLimiter = dependencies.rateLimiter;

    logger.info('[NotificationController] Initialized successfully');
  }

  /**
   * Get user notifications
   * GET /notifications
   *
   * Business Logic:
   * - Returns paginated notifications for authenticated user
   * - Supports filtering by type, read status
   * - Optionally marks notifications as read
   * - Provides unread count for UI badges
   */
  async getUserNotifications(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: errors.array(),
        });
      }

      const userId = req.userId;
      const {
        unreadOnly = false,
        notificationType,
        limit = 20,
        page = 1,
        markAsRead = false,
      } = req.query;

      console.log(`[NotificationController] Getting notifications for user ${userId}`, {
        unreadOnly,
        notificationType,
        limit,
        page,
      });

      const result = await this.notificationService.getUserNotifications(userId, {
        unreadOnly: unreadOnly === 'true',
        notificationType,
        limit: parseInt(limit),
        page: parseInt(page),
        markAsRead: markAsRead === 'true',
      });

      res.status(200).json({
        success: true,
        data: {
          notifications: result.notifications,
          pagination: result.pagination,
          unreadCount: result.unreadCount,
        },
      });
    } catch (error) {
      logger.error('[NotificationController] Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'NOTIFICATIONS_ERROR',
        message: 'Error retrieving notifications',
      });
    }
  }

  /**
   * Send individual notification
   * POST /notifications/send
   *
   * Business Logic:
   * - Creates and sends notification to specified recipient
   * - Validates recipient and content
   * - Applies rate limiting to prevent spam
   * - Logs notification creation for audit
   */
  async sendNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid notification data',
          details: errors.array(),
        });
      }

      const {
        recipientId,
        notificationType,
        title,
        message,
        priority = 'NORMAL',
        channels = { email: false, sms: false, inApp: true },
        scheduledFor,
        templateId,
        templateVariables = {},
        relatedEntities = {},
      } = req.body;

      const senderId = req.userId;
      const senderRole = req.userRole;

      console.log('[NotificationController] Sending notification', {
        recipientId,
        notificationType,
        senderId,
        priority,
      });

      // Check if sender has permission to send notifications
      if (!this._canSendNotification(senderRole, notificationType)) {
        return res.status(403).json({
          success: false,
          error: 'SEND_PERMISSION_DENIED',
          message: 'You do not have permission to send this type of notification',
        });
      }

      // Create notification through service
      const notification = await this.notificationService._createNotification({
        recipientId,
        recipientRole: req.recipientRole, // Would need to be resolved
        recipientEmail: req.recipientEmail,
        recipientPhone: req.recipientPhone,
        notificationType,
        priority,
        title,
        message,
        templateId,
        templateVariables,
        channels,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        relatedEntities,
      });

      // Queue for delivery
      await this.notificationService._queueNotificationDelivery(notification);

      // Log notification creation
      if (this.auditService) {
        await this.auditService.log({
          type: 'NOTIFICATION_SENT',
          notificationId: notification.notificationId,
          senderId,
          recipientId,
          notificationType,
          timestamp: new Date(),
        });
      }

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: {
          notificationId: notification.notificationId,
          status: notification.status,
          scheduledFor: notification.scheduledFor,
          channels: Object.keys(channels).filter(c => channels[c]),
        },
      });
    } catch (error) {
      logger.error('[NotificationController] Send notification error:', error);

      if (error.message.includes('User not found')) {
        return res.status(404).json({
          success: false,
          error: 'RECIPIENT_NOT_FOUND',
          message: 'Recipient user not found',
        });
      }

      res.status(500).json({
        success: false,
        error: 'SEND_NOTIFICATION_ERROR',
        message: 'Error sending notification',
      });
    }
  }

  /**
   * Send bulk notifications
   * POST /notifications/bulk
   *
   * Business Logic:
   * - Sends notifications to multiple recipients based on filters
   * - Applies rate limiting for bulk operations
   * - Supports scheduling for future delivery
   * - Tracks batch progress and statistics
   */
  async sendBulkNotification(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid bulk notification data',
          details: errors.array(),
        });
      }

      const {
        title,
        message,
        notificationType,
        priority = 'NORMAL',
        recipientFilters,
        channels = { email: true, sms: false, inApp: true },
        scheduledFor,
        templateId,
        templateVariables = {},
      } = req.body;

      const senderId = req.userId;
      const senderRole = req.userRole;

      console.log('[NotificationController] Sending bulk notification', {
        notificationType,
        senderId,
        recipientFilters,
      });

      // Check bulk notification permissions (admin only)
      if (!['DTAM_ADMIN'].includes(senderRole)) {
        return res.status(403).json({
          success: false,
          error: 'BULK_PERMISSION_DENIED',
          message: 'Only administrators can send bulk notifications',
        });
      }

      // Send bulk notification
      const result = await this.notificationService.sendBulkNotification({
        title,
        message,
        notificationType,
        priority,
        recipientFilters,
        channels,
        scheduledFor,
        templateId,
        templateVariables,
      });

      // Log bulk notification
      if (this.auditService) {
        await this.auditService.log({
          type: 'BULK_NOTIFICATION_SENT',
          batchId: result.batchId,
          senderId,
          recipientCount: result.recipientCount,
          notificationType,
          timestamp: new Date(),
        });
      }

      res.status(201).json({
        success: true,
        message: 'Bulk notification sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('[NotificationController] Bulk notification error:', error);

      if (error.message.includes('No recipients found')) {
        return res.status(400).json({
          success: false,
          error: 'NO_RECIPIENTS',
          message: error.message,
        });
      }

      if (error.message.includes('Rate limit exceeded')) {
        return res.status(429).json({
          success: false,
          error: 'BULK_RATE_LIMIT',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'BULK_NOTIFICATION_ERROR',
        message: 'Error sending bulk notification',
      });
    }
  }

  /**
   * Mark notification as read
   * PUT /notifications/:notificationId/read
   *
   * Business Logic:
   * - Updates notification read status
   * - Records read timestamp
   * - Updates user's unread count
   * - Tracks reading analytics
   */
  async markAsRead(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array(),
        });
      }

      const { notificationId } = req.params;
      const userId = req.userId;

      // Find notification and verify ownership
      const notification = await this.notificationService.notificationRepository.findOne({
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

      // Mark as read
      await notification.markAsRead('inApp');

      // Record analytics
      await notification.recordAnalytics('opened');

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: {
          notificationId: notification.notificationId,
          readAt: notification.channels.inApp.readAt,
        },
      });
    } catch (error) {
      logger.error('[NotificationController] Mark as read error:', error);
      res.status(500).json({
        success: false,
        error: 'MARK_READ_ERROR',
        message: 'Error marking notification as read',
      });
    }
  }

  /**
   * Dismiss notification
   * PUT /notifications/:notificationId/dismiss
   *
   * Business Logic:
   * - Removes notification from user's active list
   * - Maintains read status for analytics
   * - Updates UI state
   */
  async dismissNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.userId;

      // Find notification and verify ownership
      const notification = await this.notificationService.notificationRepository.findOne({
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

      // Mark as dismissed
      await notification.markAsDismissed();

      res.status(200).json({
        success: true,
        message: 'Notification dismissed',
        data: {
          notificationId: notification.notificationId,
          dismissedAt: notification.channels.inApp.dismissedAt,
        },
      });
    } catch (error) {
      logger.error('[NotificationController] Dismiss notification error:', error);
      res.status(500).json({
        success: false,
        error: 'DISMISS_ERROR',
        message: 'Error dismissing notification',
      });
    }
  }

  /**
   * Delete notification
   * DELETE /notifications/:notificationId
   *
   * Business Logic:
   * - Permanently removes notification (admin only)
   * - Maintains audit trail
   * - Cannot delete sent notifications with analytics
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const { reason } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      // Only admins can delete notifications
      if (!['DTAM_ADMIN'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'DELETE_PERMISSION_DENIED',
          message: 'Only administrators can delete notifications',
        });
      }

      const notification = await this.notificationService.notificationRepository.findOne({
        notificationId,
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'NOTIFICATION_NOT_FOUND',
          message: 'Notification not found',
        });
      }

      // Check if notification can be deleted
      if (notification.status === 'SENT' && notification.analytics.opened.count > 0) {
        return res.status(400).json({
          success: false,
          error: 'CANNOT_DELETE_OPENED',
          message: 'Cannot delete notifications that have been opened',
        });
      }

      // Delete notification
      await notification.deleteOne();

      // Log deletion
      if (this.auditService) {
        await this.auditService.log({
          type: 'NOTIFICATION_DELETED',
          notificationId,
          deletedBy: userId,
          reason,
          timestamp: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      logger.error('[NotificationController] Delete notification error:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_ERROR',
        message: 'Error deleting notification',
      });
    }
  }

  /**
   * Get notification templates
   * GET /notifications/templates
   *
   * Business Logic:
   * - Returns available notification templates
   * - Filters based on user role permissions
   * - Includes template variables and examples
   */
  async getTemplates(req, res) {
    try {
      const userRole = req.userRole;

      // Get templates based on role
      const templates = this._getAvailableTemplates(userRole);

      res.status(200).json({
        success: true,
        data: {
          templates,
          totalCount: Object.keys(templates).length,
        },
      });
    } catch (error) {
      logger.error('[NotificationController] Get templates error:', error);
      res.status(500).json({
        success: false,
        error: 'TEMPLATES_ERROR',
        message: 'Error retrieving templates',
      });
    }
  }

  /**
   * Get notification statistics
   * GET /notifications/stats
   *
   * Business Logic:
   * - Returns delivery and engagement statistics
   * - Filters by date range and notification type
   * - Provides analytics for optimization
   */
  async getStatistics(req, res) {
    try {
      const {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate = new Date(),
        notificationType,
        groupBy = 'day',
      } = req.query;

      const userRole = req.userRole;

      // Only admins and reviewers can view statistics
      if (!['DTAM_ADMIN', 'DTAM_REVIEWER'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'STATS_PERMISSION_DENIED',
          message: 'Insufficient permissions to view statistics',
        });
      }

      // Get statistics through service
      const stats = await this.notificationService.getStatistics({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notificationType,
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
      logger.error('[NotificationController] Statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'STATISTICS_ERROR',
        message: 'Error retrieving statistics',
      });
    }
  }

  /**
   * Test notification delivery
   * POST /notifications/test
   *
   * Business Logic:
   * - Sends test notification to verify delivery channels
   * - Admin only feature for system testing
   * - Provides delivery confirmation
   */
  async testNotification(req, res) {
    try {
      const {
        recipientEmail,
        recipientPhone,
        channels = { email: true, sms: false, inApp: true },
      } = req.body;

      const userRole = req.userRole;

      // Only admins can send test notifications
      if (!['DTAM_ADMIN'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'TEST_PERMISSION_DENIED',
          message: 'Only administrators can send test notifications',
        });
      }

      // Create test notification
      const testNotification = {
        recipientEmail,
        recipientPhone,
        notificationType: 'SYSTEM_NOTIFICATION',
        priority: 'LOW',
        title: 'Test Notification',
        message: 'This is a test notification from the GACP platform.',
        templateId: 'test-notification',
        templateVariables: {
          testTime: new Date(),
          testerRole: userRole,
        },
        channels,
      };

      // Send test notification
      const result = await this.notificationService.sendTestNotification(testNotification);

      res.status(200).json({
        success: true,
        message: 'Test notification sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('[NotificationController] Test notification error:', error);
      res.status(500).json({
        success: false,
        error: 'TEST_ERROR',
        message: 'Error sending test notification',
      });
    }
  }

  // Private helper methods

  /**
   * Check if user can send specific notification type
   * @private
   */
  _canSendNotification(userRole, notificationType) {
    const permissions = {
      DTAM_ADMIN: ['*'], // Can send all types
      DTAM_REVIEWER: [
        'APPLICATION_APPROVED',
        'APPLICATION_REJECTED',
        'APPLICATION_NEEDS_REVISION',
        'DOCUMENT_APPROVED',
        'DOCUMENT_REJECTED',
      ],
      DTAM_INSPECTOR: ['INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED'],
      FARMER: [], // Cannot send notifications
    };

    const allowedTypes = permissions[userRole] || [];
    return allowedTypes.includes('*') || allowedTypes.includes(notificationType);
  }

  /**
   * Get available templates based on user role
   * @private
   */
  _getAvailableTemplates(userRole) {
    const allTemplates = {
      'application-submitted': {
        name: 'Application Submitted',
        description: 'Confirmation when farmer submits application',
        variables: ['user.firstName', 'application.farmName', 'application.applicationNumber'],
      },
      'application-approved': {
        name: 'Application Approved',
        description: 'Notification when application is approved',
        variables: ['user.firstName', 'application.farmName', 'certificate.url'],
      },
      'payment-required': {
        name: 'Payment Required',
        description: 'Payment reminder with QR code',
        variables: ['user.firstName', 'payment.amount', 'qrCode.image'],
      },
      'inspection-scheduled': {
        name: 'Inspection Scheduled',
        description: 'Inspection appointment notification',
        variables: ['user.firstName', 'inspection.date', 'inspector.name'],
      },
    };

    // Filter templates based on role permissions
    if (userRole === 'DTAM_ADMIN') {
      return allTemplates;
    }

    // Return subset for other roles
    return Object.fromEntries(
      Object.entries(allTemplates).filter(
        ([key]) => !key.includes('admin') && !key.includes('bulk'),
      ),
    );
  }

  /**
   * Validation rules for different endpoints
   */
  static getValidationRules() {
    return {
      getUserNotifications: [
        query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be boolean'),
        query('notificationType')
          .optional()
          .isString()
          .withMessage('notificationType must be string'),
        query('limit')
          .optional()
          .isInt({ min: 1, max: 100 })
          .withMessage('limit must be between 1 and 100'),
        query('page').optional().isInt({ min: 1 }).withMessage('page must be positive integer'),
        query('markAsRead').optional().isBoolean().withMessage('markAsRead must be boolean'),
      ],

      sendNotification: [
        body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
        body('notificationType')
          .isString()
          .isLength({ min: 1, max: 50 })
          .withMessage('Valid notification type is required'),
        body('title')
          .isString()
          .isLength({ min: 1, max: 200 })
          .withMessage('Title must be between 1 and 200 characters'),
        body('message')
          .isString()
          .isLength({ min: 1, max: 2000 })
          .withMessage('Message must be between 1 and 2000 characters'),
        body('priority')
          .optional()
          .isIn(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'])
          .withMessage('Invalid priority level'),
        body('scheduledFor').optional().isISO8601().withMessage('Invalid scheduled date format'),
      ],

      sendBulkNotification: [
        body('title').isString().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
        body('message')
          .isString()
          .isLength({ min: 1, max: 2000 })
          .withMessage('Message is required'),
        body('notificationType').isString().withMessage('Notification type is required'),
        body('recipientFilters').isObject().withMessage('Recipient filters are required'),
        body('scheduledFor').optional().isISO8601().withMessage('Invalid scheduled date format'),
      ],

      notificationId: [
        param('notificationId')
          .isString()
          .isLength({ min: 10, max: 50 })
          .withMessage('Valid notification ID is required'),
      ],
    };
  }
}

module.exports = NotificationController;
