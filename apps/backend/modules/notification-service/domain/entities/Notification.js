/**
 * Notification Entity - Domain Model
 *
 * Core notification entity for the GACP platform handling all types of
 * notifications including email, SMS, and in-app notifications.
 *
 * Business Rules:
 * - Notifications must have a recipient and type
 * - Email notifications require valid email format
 * - SMS notifications require valid Thai mobile number format
 * - In-app notifications expire after 30 days if unread
 * - Critical notifications have maximum 3 retry attempts
 * - Bulk notifications are rate-limited to prevent spam
 *
 * Notification Flow:
 * 1. Event Trigger → Template Selection → Content Generation
 * 2. Recipient Validation → Channel Selection → Delivery Attempt
 * 3. Delivery Confirmation → Status Update → Retry Logic (if failed)
 * 4. Read Receipt → Analytics Tracking → Cleanup (for expired)
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    // Core Notification Information
    notificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    },

    // Recipient Information
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    recipientRole: {
      type: String,
      enum: ['FARMER', 'DTAM_REVIEWER', 'DTAM_INSPECTOR', 'DTAM_ADMIN'],
      required: true,
    },

    recipientEmail: {
      type: String,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },

    recipientPhone: {
      type: String,
      validate: {
        validator: function (phone) {
          // Thai mobile number format: 08XXXXXXXX or 09XXXXXXXX
          return !phone || /^(08|09)\d{8}$/.test(phone.replace(/[-\s]/g, ''));
        },
        message: 'Invalid Thai mobile number format',
      },
    },

    // Notification Content & Type
    notificationType: {
      type: String,
      enum: [
        // Application Workflow Notifications
        'APPLICATION_SUBMITTED',
        'APPLICATION_APPROVED',
        'APPLICATION_REJECTED',
        'APPLICATION_NEEDS_REVISION',
        'INSPECTION_SCHEDULED',
        'INSPECTION_COMPLETED',
        'CERTIFICATE_ISSUED',
        'CERTIFICATE_EXPIRED',

        // Payment Notifications
        'PAYMENT_REQUIRED',
        'PAYMENT_RECEIVED',
        'PAYMENT_FAILED',
        'PAYMENT_EXPIRED',
        'REFUND_PROCESSED',

        // Document Notifications
        'DOCUMENT_UPLOADED',
        'DOCUMENT_APPROVED',
        'DOCUMENT_REJECTED',
        'DOCUMENT_EXPIRED',

        // System Notifications
        'ACCOUNT_CREATED',
        'PASSWORD_RESET',
        'LOGIN_ALERT',
        'SYSTEM_MAINTENANCE',
        'DEADLINE_REMINDER',

        // Admin Notifications
        'NEW_APPLICATION_ALERT',
        'BULK_NOTIFICATION',
        'SYSTEM_ERROR_ALERT',
      ],
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'],
      default: 'NORMAL',
      index: true,
    },

    // Content & Messaging
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },

    messageHtml: {
      type: String,
      maxlength: 5000, // For rich HTML email content
    },

    // Template Information
    templateId: {
      type: String,
      index: true,
    },

    templateVersion: {
      type: String,
      default: '1.0',
    },

    templateVariables: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Delivery Channels
    channels: {
      email: {
        enabled: {
          type: Boolean,
          default: false,
        },

        status: {
          type: String,
          enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'],
          default: 'PENDING',
        },

        sentAt: Date,
        deliveredAt: Date,

        emailSubject: String,
        emailProvider: {
          type: String,
          enum: ['SES', 'SENDGRID', 'SMTP'],
          default: 'SES',
        },

        messageId: String, // Provider message ID

        failureReason: String,

        openedAt: Date,
        clickedAt: Date,

        trackingPixelId: String,
      },

      sms: {
        enabled: {
          type: Boolean,
          default: false,
        },

        status: {
          type: String,
          enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED'],
          default: 'PENDING',
        },

        sentAt: Date,
        deliveredAt: Date,

        smsProvider: {
          type: String,
          enum: ['TWILIO', 'AWS_SNS', 'THAI_SMS_GATEWAY'],
          default: 'THAI_SMS_GATEWAY',
        },

        messageId: String,

        failureReason: String,

        cost: {
          type: Number,
          min: 0,
          default: 0,
        },
      },

      inApp: {
        enabled: {
          type: Boolean,
          default: true,
        },

        status: {
          type: String,
          enum: ['PENDING', 'DELIVERED', 'READ', 'DISMISSED'],
          default: 'PENDING',
        },

        deliveredAt: Date,
        readAt: Date,
        dismissedAt: Date,

        actionUrl: String, // URL to navigate when notification clicked
        actionText: String, // Text for action button

        expiresAt: {
          type: Date,
          default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
    },

    // Context & Related Entities
    relatedEntities: {
      applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },

      paymentId: String,

      documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      inspectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inspection',
      },
    },

    // Delivery & Retry Logic
    deliveryAttempts: [
      {
        attemptNumber: {
          type: Number,
          required: true,
        },

        channel: {
          type: String,
          enum: ['email', 'sms', 'inApp'],
          required: true,
        },

        attemptedAt: {
          type: Date,
          default: Date.now,
        },

        status: {
          type: String,
          enum: ['SUCCESS', 'FAILED', 'RETRY'],
          required: true,
        },

        errorCode: String,
        errorMessage: String,

        providerResponse: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        nextRetryAt: Date,
      },
    ],

    // Scheduling & Timing
    scheduledFor: {
      type: Date,
      index: true,
    },

    timezone: {
      type: String,
      default: 'Asia/Bangkok',
    },

    // Batch Processing
    batchId: {
      type: String,
      index: true,
    },

    batchSize: Number,
    batchPosition: Number,

    // User Preferences & Personalization
    userPreferences: {
      language: {
        type: String,
        enum: ['th', 'en'],
        default: 'th',
      },

      emailFormat: {
        type: String,
        enum: ['text', 'html'],
        default: 'html',
      },

      timezone: String,
    },

    // Analytics & Tracking
    analytics: {
      opened: {
        count: {
          type: Number,
          default: 0,
        },
        firstOpenedAt: Date,
        lastOpenedAt: Date,
      },

      clicked: {
        count: {
          type: Number,
          default: 0,
        },
        firstClickedAt: Date,
        lastClickedAt: Date,
        clickedUrls: [String],
      },

      bounced: {
        type: Boolean,
        default: false,
      },

      marked_as_spam: {
        type: Boolean,
        default: false,
      },

      unsubscribed: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata & Tags
    metadata: {
      source: {
        type: String,
        default: 'SYSTEM',
      },

      campaign: String,

      tags: [String],

      customData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    // Status & Lifecycle
    status: {
      type: String,
      enum: [
        'DRAFT', // สร้างแล้วแต่ยังไม่ส่ง
        'SCHEDULED', // กำหนดเวลาส่งแล้ว
        'PROCESSING', // กำลังส่ง
        'SENT', // ส่งแล้วทุก channel
        'PARTIALLY_SENT', // ส่งได้บาง channel
        'FAILED', // ส่งไม่สำเร็จ
        'CANCELLED', // ยกเลิกการส่ง
        'EXPIRED', // หมดอายุ
      ],
      default: 'DRAFT',
      required: true,
      index: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    sentAt: Date,

    completedAt: Date,

    // TTL for cleanup
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  },
);

// Indexes for Performance
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ notificationType: 1, status: 1 });
NotificationSchema.index({ priority: 1, scheduledFor: 1 });
NotificationSchema.index({ batchId: 1, batchPosition: 1 });
NotificationSchema.index({ 'relatedEntities.applicationId': 1 });
NotificationSchema.index({ 'channels.email.status': 1 });
NotificationSchema.index({ 'channels.sms.status': 1 });
NotificationSchema.index({ 'channels.inApp.status': 1 });

// Virtual Fields
NotificationSchema.virtual('isDelivered').get(function () {
  return this.status === 'SENT' || this.status === 'PARTIALLY_SENT';
});

NotificationSchema.virtual('canRetry').get(function () {
  const maxRetries = this.priority === 'CRITICAL' ? 3 : 2;
  return this.status === 'FAILED' && this.deliveryAttempts.length < maxRetries;
});

NotificationSchema.virtual('isExpired').get(function () {
  if (this.channels.inApp.enabled && this.channels.inApp.expiresAt) {
    return new Date() > this.channels.inApp.expiresAt;
  }
  return false;
});

NotificationSchema.virtual('totalCost').get(function () {
  return this.channels.sms.cost || 0;
});

// Business Logic Methods
NotificationSchema.methods.markAsRead = function (channel = 'inApp') {
  if (channel === 'inApp' && this.channels.inApp.enabled) {
    this.channels.inApp.status = 'READ';
    this.channels.inApp.readAt = new Date();
  }

  this.updatedAt = new Date();
  return this.save();
};

NotificationSchema.methods.markAsDismissed = function () {
  if (this.channels.inApp.enabled) {
    this.channels.inApp.status = 'DISMISSED';
    this.channels.inApp.dismissedAt = new Date();
  }

  this.updatedAt = new Date();
  return this.save();
};

NotificationSchema.methods.addDeliveryAttempt = function (channel, status, errorData = {}) {
  const attemptNumber = this.deliveryAttempts.filter(a => a.channel === channel).length + 1;

  this.deliveryAttempts.push({
    attemptNumber,
    channel,
    status,
    errorCode: errorData.errorCode,
    errorMessage: errorData.errorMessage,
    providerResponse: errorData.providerResponse || {},
    nextRetryAt: errorData.nextRetryAt,
  });

  this.updatedAt = new Date();
  return this.save();
};

NotificationSchema.methods.updateChannelStatus = function (channel, status, metadata = {}) {
  if (this.channels[channel]) {
    this.channels[channel].status = status;

    if (status === 'SENT') {
      this.channels[channel].sentAt = new Date();
    } else if (status === 'DELIVERED') {
      this.channels[channel].deliveredAt = new Date();
    } else if (status === 'FAILED') {
      this.channels[channel].failureReason = metadata.failureReason;
    }

    // Update message ID if provided
    if (metadata.messageId) {
      this.channels[channel].messageId = metadata.messageId;
    }
  }

  // Update overall notification status
  this._updateOverallStatus();
  this.updatedAt = new Date();

  return this.save();
};

NotificationSchema.methods._updateOverallStatus = function () {
  const enabledChannels = [];
  const channelStatuses = [];

  if (this.channels.email.enabled) {
    enabledChannels.push('email');
    channelStatuses.push(this.channels.email.status);
  }

  if (this.channels.sms.enabled) {
    enabledChannels.push('sms');
    channelStatuses.push(this.channels.sms.status);
  }

  if (this.channels.inApp.enabled) {
    enabledChannels.push('inApp');
    channelStatuses.push(this.channels.inApp.status);
  }

  // Determine overall status
  if (channelStatuses.every(status => ['SENT', 'DELIVERED', 'READ'].includes(status))) {
    this.status = 'SENT';
    this.sentAt = new Date();
  } else if (channelStatuses.some(status => ['SENT', 'DELIVERED', 'READ'].includes(status))) {
    this.status = 'PARTIALLY_SENT';
  } else if (channelStatuses.every(status => status === 'FAILED')) {
    this.status = 'FAILED';
  } else if (channelStatuses.some(status => status === 'PENDING')) {
    this.status = 'PROCESSING';
  }
};

NotificationSchema.methods.recordAnalytics = function (event, data = {}) {
  switch (event) {
    case 'opened':
      this.analytics.opened.count += 1;
      if (!this.analytics.opened.firstOpenedAt) {
        this.analytics.opened.firstOpenedAt = new Date();
      }
      this.analytics.opened.lastOpenedAt = new Date();
      break;

    case 'clicked':
      this.analytics.clicked.count += 1;
      if (!this.analytics.clicked.firstClickedAt) {
        this.analytics.clicked.firstClickedAt = new Date();
      }
      this.analytics.clicked.lastClickedAt = new Date();
      if (data.url) {
        this.analytics.clicked.clickedUrls.push(data.url);
      }
      break;

    case 'bounced':
      this.analytics.bounced = true;
      break;

    case 'spam':
      this.analytics.marked_as_spam = true;
      break;

    case 'unsubscribed':
      this.analytics.unsubscribed = true;
      break;
  }

  this.updatedAt = new Date();
  return this.save();
};

// Static Methods
NotificationSchema.statics.findPendingNotifications = function () {
  return this.find({
    status: { $in: ['SCHEDULED', 'PROCESSING'] },
    scheduledFor: { $lte: new Date() },
  }).sort({ priority: -1, scheduledFor: 1 });
};

NotificationSchema.statics.findByRecipient = function (recipientId, options = {}) {
  const query = { recipientId };

  if (options.unreadOnly) {
    query['channels.inApp.status'] = { $in: ['PENDING', 'DELIVERED'] };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

NotificationSchema.statics.getStatistics = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          type: '$notificationType',
          status: '$status',
        },
        count: { $sum: 1 },
        totalCost: { $sum: '$channels.sms.cost' },
      },
    },
  ]);
};

// Pre-save Middleware
NotificationSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Set expiry for in-app notifications
  if (this.channels.inApp.enabled && !this.channels.inApp.expiresAt) {
    this.channels.inApp.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // Auto-expire old notifications
  if (!this.expiresAt && this.status === 'SENT') {
    this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
  }

  next();
});

// Post-save Middleware
NotificationSchema.post('save', function (doc) {
  // Emit events for external processing
  if (doc.status === 'SENT' && doc.isModified('status')) {
    logger.info(`[Notification] Notification sent: ${doc.notificationId}`);
  }

  if (doc.status === 'FAILED' && doc.isModified('status')) {
    logger.info(`[Notification] Notification failed: ${doc.notificationId}`);
  }
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
