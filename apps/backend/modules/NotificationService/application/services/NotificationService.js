/**
 * Notification Service - Core Business Logic
 *
 * Comprehensive notification management service for the GACP platform.
 * Handles email, SMS, and in-app notifications with template management,
 * delivery tracking, and analytics.
 *
 * Business Process Flow:
 * 1. Event Trigger → Template Selection → Content Generation
 * 2. Recipient Validation → Channel Selection → Delivery Queue
 * 3. Delivery Attempt → Status Tracking → Retry Logic (if needed)
 * 4. Analytics Recording → User Interaction → Cleanup
 *
 * Key Business Rules:
 * - Email notifications use SES for delivery
 * - SMS notifications use Thai SMS Gateway
 * - In-app notifications expire after 30 days
 * - Critical notifications have 3 retry attempts
 * - Normal notifications have 2 retry attempts
 * - Bulk notifications are rate-limited
 * - All notifications are logged for audit
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const Notification = require('../domain/entities/Notification');
const Handlebars = require('handlebars');
const fs = require('fs').promises;

class NotificationService {
  constructor(dependencies = {}) {
    this.notificationRepository = dependencies.notificationRepository;
    this.userRepository = dependencies.userRepository;
    this.applicationRepository = dependencies.applicationRepository;
    this.emailService = dependencies.emailService;
    this.smsService = dependencies.smsService;
    this.auditService = dependencies.auditService;
    this.queueService = dependencies.queueService;

    // Template cache for performance
    this.templateCache = new Map();

    // Notification configuration
    this.config = {
      channels: {
        email: {
          enabled: true,
          provider: 'SES',
          fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@gacp.go.th',
          fromName: process.env.EMAIL_FROM_NAME || 'GACP Platform',
        },
        sms: {
          enabled: true,
          provider: 'THAI_SMS_GATEWAY',
          sender: process.env.SMS_SENDER || 'GACP',
        },
        inApp: {
          enabled: true,
          defaultExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
      },
      retry: {
        maxAttempts: {
          CRITICAL: 3,
          HIGH: 2,
          NORMAL: 2,
          LOW: 1,
        },
        backoffMultiplier: 2,
        baseDelayMs: 60000, // 1 minute
      },
      rateLimits: {
        emailPerHour: 1000,
        smsPerHour: 500,
        bulkEmailPerHour: 5000,
      },
    };

    // Initialize template system
    this._initializeTemplates();

    logger.info('[NotificationService] Initialized successfully');
  }

  /**
   * Send notification based on application workflow events
   * Business Logic: Determines notification type and channels based on event
   *
   * @param {string} eventType - Type of workflow event
   * @param {Object} eventData - Event context data
   * @returns {Object} Notification creation result
   */
  async sendWorkflowNotification(eventType, eventData) {
    try {
      const {
        applicationId,
        userId,
        currentStatus,
        previousStatus,
        reviewerNotes,
        inspectionDate,
        certificateUrl,
      } = eventData;

      console.log(`[NotificationService] Processing workflow notification: ${eventType}`, {
        applicationId,
        userId,
        currentStatus,
      });

      // Get user details for notification
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found for notification');
      }

      // Get application details
      const application = await this.applicationRepository.findById(applicationId);
      if (!application) {
        throw new Error('Application not found for notification');
      }

      // Determine notification type and template
      const notificationConfig = this._getWorkflowNotificationConfig(eventType, currentStatus);

      // Prepare template variables
      const templateVariables = {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        application: {
          id: application.id,
          farmName: application.farmDetails?.farmName || 'ไม่ระบุ',
          applicationNumber: application.applicationNumber,
          submittedAt: application.submittedAt,
          currentStatus,
          previousStatus,
        },
        eventData: {
          reviewerNotes,
          inspectionDate,
          certificateUrl,
          statusChangeDate: new Date(),
        },
        system: {
          platformName: 'GACP Platform',
          supportEmail: 'support@gacp.go.th',
          baseUrl: process.env.FRONTEND_BASE_URL || 'https://gacp.go.th',
        },
      };

      // Create notification
      const notification = await this._createNotification({
        recipientId: userId,
        recipientRole: user.role,
        recipientEmail: user.email,
        recipientPhone: user.phoneNumber,
        notificationType: notificationConfig.type,
        priority: notificationConfig.priority,
        templateId: notificationConfig.templateId,
        templateVariables,
        channels: notificationConfig.channels,
        relatedEntities: {
          applicationId,
          userId,
        },
      });

      // Queue for delivery
      await this._queueNotificationDelivery(notification);

      // Log notification creation
      if (this.auditService) {
        await this.auditService.log({
          type: 'NOTIFICATION_CREATED',
          notificationId: notification.notificationId,
          eventType,
          userId,
          applicationId,
          timestamp: new Date(),
        });
      }

      return {
        success: true,
        notificationId: notification.notificationId,
        channels: Object.keys(notificationConfig.channels).filter(
          c => notificationConfig.channels[c],
        ),
        message: 'Workflow notification created successfully',
      };
    } catch (error) {
      logger.error('[NotificationService] Workflow notification error:', error);
      throw new Error(`Failed to send workflow notification: ${error.message}`);
    }
  }

  /**
   * Send payment-related notifications
   * Business Logic: Handles payment status changes and reminders
   *
   * @param {string} paymentEvent - Payment event type
   * @param {Object} paymentData - Payment context data
   * @returns {Object} Notification result
   */
  async sendPaymentNotification(paymentEvent, paymentData) {
    try {
      const {
        paymentId,
        userId,
        applicationId,
        amount,
        currency,
        paymentStatus,
        failureReason,
        receiptUrl,
        qrCodeData,
      } = paymentData;

      console.log(`[NotificationService] Processing payment notification: ${paymentEvent}`, {
        paymentId,
        userId,
        amount,
      });

      // Get user and application details
      const [user, application] = await Promise.all([
        this.userRepository.findById(userId),
        this.applicationRepository.findById(applicationId),
      ]);

      if (!user || !application) {
        throw new Error('User or application not found for payment notification');
      }

      // Determine notification configuration
      const notificationConfig = this._getPaymentNotificationConfig(paymentEvent);

      // Prepare template variables
      const templateVariables = {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        payment: {
          id: paymentId,
          amount: this._formatCurrency(amount, currency),
          status: paymentStatus,
          failureReason,
          receiptUrl,
        },
        application: {
          id: application.id,
          farmName: application.farmDetails?.farmName || 'ไม่ระบุ',
          applicationNumber: application.applicationNumber,
        },
        qrCode: qrCodeData,
        system: {
          platformName: 'GACP Platform',
          supportEmail: 'support@gacp.go.th',
          baseUrl: process.env.FRONTEND_BASE_URL || 'https://gacp.go.th',
        },
      };

      // Create notification
      const notification = await this._createNotification({
        recipientId: userId,
        recipientRole: user.role,
        recipientEmail: user.email,
        recipientPhone: user.phoneNumber,
        notificationType: notificationConfig.type,
        priority: notificationConfig.priority,
        templateId: notificationConfig.templateId,
        templateVariables,
        channels: notificationConfig.channels,
        relatedEntities: {
          applicationId,
          userId,
          paymentId,
        },
      });

      // Queue for delivery
      await this._queueNotificationDelivery(notification);

      return {
        success: true,
        notificationId: notification.notificationId,
        message: 'Payment notification created successfully',
      };
    } catch (error) {
      logger.error('[NotificationService] Payment notification error:', error);
      throw new Error(`Failed to send payment notification: ${error.message}`);
    }
  }

  /**
   * Send bulk notifications to multiple recipients
   * Business Logic: Handles mass notifications with rate limiting
   *
   * @param {Object} bulkNotificationData - Bulk notification configuration
   * @returns {Object} Bulk notification result
   */
  async sendBulkNotification(bulkNotificationData) {
    try {
      const {
        title,
        message,
        notificationType,
        priority = 'NORMAL',
        recipientFilters,
        channels,
        scheduledFor,
        templateId,
        templateVariables = {},
      } = bulkNotificationData;

      console.log('[NotificationService] Processing bulk notification', {
        notificationType,
        recipientFilters,
        scheduledFor,
      });

      // Get recipients based on filters
      const recipients = await this._getRecipientsByFilters(recipientFilters);

      if (recipients.length === 0) {
        throw new Error('No recipients found matching the specified filters');
      }

      // Check rate limits for bulk notifications
      await this._checkBulkRateLimit(recipients.length, channels);

      // Generate batch ID for tracking
      const batchId = `BULK_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const notifications = [];

      // Create individual notifications for each recipient
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        const personalizedVariables = {
          ...templateVariables,
          user: {
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            email: recipient.email,
          },
          batchInfo: {
            batchId,
            totalRecipients: recipients.length,
            position: i + 1,
          },
        };

        const notification = await this._createNotification({
          recipientId: recipient._id,
          recipientRole: recipient.role,
          recipientEmail: recipient.email,
          recipientPhone: recipient.phoneNumber,
          notificationType,
          priority,
          title,
          message,
          templateId,
          templateVariables: personalizedVariables,
          channels,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          batchId,
          batchSize: recipients.length,
          batchPosition: i + 1,
        });

        notifications.push(notification);
      }

      // Queue all notifications for delivery
      if (!scheduledFor || new Date(scheduledFor) <= new Date()) {
        // Immediate delivery with staggered timing to avoid overwhelming
        await this._queueBulkNotifications(notifications);
      }

      // Log bulk notification creation
      if (this.auditService) {
        await this.auditService.log({
          type: 'BULK_NOTIFICATION_CREATED',
          batchId,
          notificationType,
          recipientCount: recipients.length,
          scheduledFor,
          timestamp: new Date(),
        });
      }

      return {
        success: true,
        batchId,
        recipientCount: recipients.length,
        notificationIds: notifications.map(n => n.notificationId),
        scheduledFor,
        message: 'Bulk notification created successfully',
      };
    } catch (error) {
      logger.error('[NotificationService] Bulk notification error:', error);
      throw new Error(`Failed to send bulk notification: ${error.message}`);
    }
  }

  /**
   * Process notification delivery queue
   * Business Logic: Handles actual delivery to email, SMS, and in-app channels
   *
   * @param {string} notificationId - Notification to deliver
   * @returns {Object} Delivery result
   */
  async processNotificationDelivery(notificationId) {
    try {
      const notification = await Notification.findOne({ notificationId });
      if (!notification) {
        throw new Error('Notification not found');
      }

      logger.info(`[NotificationService] Processing delivery for: ${notificationId}`);

      notification.status = 'PROCESSING';
      await notification.save();

      const deliveryResults = {};

      // Process email delivery
      if (notification.channels.email.enabled) {
        try {
          const emailResult = await this._deliverEmail(notification);
          deliveryResults.email = emailResult;
        } catch (error) {
          logger.error('[NotificationService] Email delivery failed:', error);
          await notification.addDeliveryAttempt('email', 'FAILED', {
            errorCode: 'EMAIL_DELIVERY_FAILED',
            errorMessage: error.message,
          });
        }
      }

      // Process SMS delivery
      if (notification.channels.sms.enabled) {
        try {
          const smsResult = await this._deliverSMS(notification);
          deliveryResults.sms = smsResult;
        } catch (error) {
          logger.error('[NotificationService] SMS delivery failed:', error);
          await notification.addDeliveryAttempt('sms', 'FAILED', {
            errorCode: 'SMS_DELIVERY_FAILED',
            errorMessage: error.message,
          });
        }
      }

      // Process in-app delivery
      if (notification.channels.inApp.enabled) {
        try {
          const inAppResult = await this._deliverInApp(notification);
          deliveryResults.inApp = inAppResult;
        } catch (error) {
          logger.error('[NotificationService] In-app delivery failed:', error);
          await notification.addDeliveryAttempt('inApp', 'FAILED', {
            errorCode: 'INAPP_DELIVERY_FAILED',
            errorMessage: error.message,
          });
        }
      }

      // Update overall status
      notification._updateOverallStatus();
      await notification.save();

      // Schedule retry if needed
      if (notification.canRetry && notification.status === 'FAILED') {
        await this._scheduleRetry(notification);
      }

      return {
        success: true,
        notificationId,
        status: notification.status,
        deliveryResults,
        canRetry: notification.canRetry,
      };
    } catch (error) {
      logger.error('[NotificationService] Delivery processing error:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * Business Logic: Returns user notifications with filtering and pagination
   *
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Object} User notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        unreadOnly = false,
        notificationType,
        limit = 50,
        page = 1,
        markAsRead = false,
      } = options;

      const query = { recipientId: userId };

      if (unreadOnly) {
        query['channels.inApp.status'] = { $in: ['PENDING', 'DELIVERED'] };
      }

      if (notificationType) {
        query.notificationType = notificationType;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();

      // Mark as read if requested
      if (markAsRead && notifications.length > 0) {
        const notificationIds = notifications.map(n => n._id);
        await Notification.updateMany(
          {
            _id: { $in: notificationIds },
            'channels.inApp.status': { $in: ['PENDING', 'DELIVERED'] },
          },
          {
            'channels.inApp.status': 'READ',
            'channels.inApp.readAt': new Date(),
          },
        );
      }

      // Get unread count
      const unreadCount = await Notification.countDocuments({
        recipientId: userId,
        'channels.inApp.status': { $in: ['PENDING', 'DELIVERED'] },
      });

      return {
        success: true,
        notifications: notifications.map(n => this._formatNotificationForUser(n)),
        pagination: {
          page,
          limit,
          total: await Notification.countDocuments(query),
        },
        unreadCount,
      };
    } catch (error) {
      logger.error('[NotificationService] Get user notifications error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Initialize notification templates
   * @private
   */
  async _initializeTemplates() {
    try {
      // const templatesPath = path.join(__dirname, '../templates');

      // Register common Handlebars helpers
      Handlebars.registerHelper('formatDate', date => {
        return new Date(date).toLocaleDateString('th-TH');
      });

      Handlebars.registerHelper('formatCurrency', (amount, currency = 'THB') => {
        return this._formatCurrency(amount, currency);
      });

      logger.info('[NotificationService] Templates initialized');
    } catch (error) {
      logger.warn('[NotificationService] Template initialization warning:', error.message);
    }
  }

  /**
   * Get workflow notification configuration
   * @private
   */
  _getWorkflowNotificationConfig(eventType, _status) {
    const configs = {
      APPLICATION_SUBMITTED: {
        type: 'APPLICATION_SUBMITTED',
        priority: 'NORMAL',
        templateId: 'application-submitted',
        channels: { email: true, inApp: true, sms: false },
      },
      APPLICATION_APPROVED: {
        type: 'APPLICATION_APPROVED',
        priority: 'HIGH',
        templateId: 'application-approved',
        channels: { email: true, inApp: true, sms: true },
      },
      APPLICATION_REJECTED: {
        type: 'APPLICATION_REJECTED',
        priority: 'HIGH',
        templateId: 'application-rejected',
        channels: { email: true, inApp: true, sms: true },
      },
      PAYMENT_REQUIRED: {
        type: 'PAYMENT_REQUIRED',
        priority: 'HIGH',
        templateId: 'payment-required',
        channels: { email: true, inApp: true, sms: true },
      },
      INSPECTION_SCHEDULED: {
        type: 'INSPECTION_SCHEDULED',
        priority: 'HIGH',
        templateId: 'inspection-scheduled',
        channels: { email: true, inApp: true, sms: true },
      },
      CERTIFICATE_ISSUED: {
        type: 'CERTIFICATE_ISSUED',
        priority: 'HIGH',
        templateId: 'certificate-issued',
        channels: { email: true, inApp: true, sms: true },
      },
    };

    return (
      configs[eventType] || {
        type: 'SYSTEM_NOTIFICATION',
        priority: 'NORMAL',
        templateId: 'default',
        channels: { email: false, inApp: true, sms: false },
      }
    );
  }

  /**
   * Get payment notification configuration
   * @private
   */
  _getPaymentNotificationConfig(paymentEvent) {
    const configs = {
      PAYMENT_INITIATED: {
        type: 'PAYMENT_REQUIRED',
        priority: 'HIGH',
        templateId: 'payment-initiated',
        channels: { email: true, inApp: true, sms: true },
      },
      PAYMENT_SUCCESS: {
        type: 'PAYMENT_RECEIVED',
        priority: 'HIGH',
        templateId: 'payment-success',
        channels: { email: true, inApp: true, sms: true },
      },
      PAYMENT_FAILED: {
        type: 'PAYMENT_FAILED',
        priority: 'HIGH',
        templateId: 'payment-failed',
        channels: { email: true, inApp: true, sms: true },
      },
      PAYMENT_EXPIRED: {
        type: 'PAYMENT_EXPIRED',
        priority: 'NORMAL',
        templateId: 'payment-expired',
        channels: { email: true, inApp: true, sms: false },
      },
      REFUND_PROCESSED: {
        type: 'REFUND_PROCESSED',
        priority: 'HIGH',
        templateId: 'refund-processed',
        channels: { email: true, inApp: true, sms: true },
      },
    };

    return (
      configs[paymentEvent] || {
        type: 'PAYMENT_NOTIFICATION',
        priority: 'NORMAL',
        templateId: 'payment-default',
        channels: { email: true, inApp: true, sms: false },
      }
    );
  }

  /**
   * Create notification record
   * @private
   */
  async _createNotification(notificationData) {
    const notification = new Notification({
      recipientId: notificationData.recipientId,
      recipientRole: notificationData.recipientRole,
      recipientEmail: notificationData.recipientEmail,
      recipientPhone: notificationData.recipientPhone,
      notificationType: notificationData.notificationType,
      priority: notificationData.priority,
      title: notificationData.title,
      message: notificationData.message,
      templateId: notificationData.templateId,
      templateVariables: notificationData.templateVariables,
      channels: {
        email: {
          enabled: notificationData.channels.email || false,
          status: 'PENDING',
        },
        sms: {
          enabled: notificationData.channels.sms || false,
          status: 'PENDING',
        },
        inApp: {
          enabled: notificationData.channels.inApp !== false,
          status: 'PENDING',
        },
      },
      relatedEntities: notificationData.relatedEntities,
      scheduledFor: notificationData.scheduledFor,
      batchId: notificationData.batchId,
      batchSize: notificationData.batchSize,
      batchPosition: notificationData.batchPosition,
      status: 'SCHEDULED',
    });

    await notification.save();
    return notification;
  }

  /**
   * Queue notification for delivery
   * @private
   */
  async _queueNotificationDelivery(notification) {
    if (this.queueService) {
      await this.queueService.add(
        'notification-delivery',
        {
          notificationId: notification.notificationId,
        },
        {
          delay: notification.scheduledFor
            ? Math.max(0, new Date(notification.scheduledFor).getTime() - Date.now())
            : 0,
          attempts: this.config.retry.maxAttempts[notification.priority],
          backoff: {
            type: 'exponential',
            delay: this.config.retry.baseDelayMs,
          },
        },
      );
    } else {
      // Immediate processing if no queue service
      await this.processNotificationDelivery(notification.notificationId);
    }
  }

  /**
   * Format currency amount
   * @private
   */
  _formatCurrency(amount, currency = 'THB') {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format notification for user response
   * @private
   */
  _formatNotificationForUser(notification) {
    return {
      id: notification.notificationId,
      type: notification.notificationType,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      status: notification.channels.inApp.status,
      createdAt: notification.createdAt,
      readAt: notification.channels.inApp.readAt,
      actionUrl: notification.channels.inApp.actionUrl,
      actionText: notification.channels.inApp.actionText,
      relatedEntities: notification.relatedEntities,
    };
  }

  /**
   * Health check for notification service
   */
  async healthCheck() {
    try {
      const pendingCount = await Notification.countDocuments({
        status: { $in: ['SCHEDULED', 'PROCESSING'] },
      });

      return {
        status: 'healthy',
        pendingNotifications: pendingCount,
        channels: {
          email: this.config.channels.email.enabled,
          sms: this.config.channels.sms.enabled,
          inApp: this.config.channels.inApp.enabled,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = NotificationService;
