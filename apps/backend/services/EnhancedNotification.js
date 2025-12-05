/**
 * Enhanced Real-time Notification System
 * Comprehensive notification management with role-based preferences and real-time delivery
 */

const logger = require('../shared/logger');
const EventEmitter = require('events');
const mongoose = require('mongoose');

// Enhanced Notification Schema
const EnhancedNotificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      },
    },

    // Recipient information
    recipient: {
      userId: { type: String, required: true, index: true },
      userRole: { type: String, required: true },
      userName: String,
      userEmail: String,
      userPhone: String,
    },

    // Notification content
    content: {
      title: { type: String, required: true, maxlength: 200 },
      titleTH: { type: String, maxlength: 200 },
      message: { type: String, required: true, maxlength: 1000 },
      messageTH: { type: String, maxlength: 1000 },
      summary: { type: String, maxlength: 300 },

      // Rich content
      htmlContent: String,
      attachments: [
        {
          filename: String,
          url: String,
          type: String,
          size: Number,
        },
      ],

      // Action buttons
      actions: [
        {
          actionId: String,
          label: String,
          labelTH: String,
          actionType: { type: String, enum: ['url', 'api', 'modal', 'download'] },
          actionData: Object,
          style: { type: String, enum: ['primary', 'secondary', 'success', 'warning', 'danger'] },
        },
      ],
    },

    // Notification classification
    classification: {
      category: {
        type: String,
        required: true,
        enum: [
          'application', // แอปพลิเคชั่น
          'audit', // ตรวจสอบ
          'sop_compliance', // การปฏิบัติตาม SOP
          'cannabis_compliance', // ความเป็นไปตามกฎหมายกัญชา
          'deadline', // เส้นตาย
          'task_assignment', // มอบหมายงาน
          'system', // ระบบ
          'security', // ความปลอดภัย
          'payment', // การชำระเงิน
          'certificate', // ใบรับรอง
          'training', // การฝึกอบรม
          'maintenance', // การบำรุงรักษา
          'emergency', // เหตุฉุกเฉิน
        ],
      },

      subcategory: String,

      eventType: {
        type: String,
        required: true,
        enum: [
          // Application events
          'application_submitted',
          'application_approved',
          'application_rejected',
          'application_needs_revision',
          'documents_required',
          'payment_required',

          // Audit events
          'audit_scheduled',
          'audit_rescheduled',
          'audit_cancelled',
          'audit_reminder',
          'audit_started',
          'audit_completed',
          'audit_report_available',
          'corrective_action_required',

          // SOP events
          'sop_activity_due',
          'sop_activity_overdue',
          'sop_compliance_low',
          'sop_deviation_recorded',
          'sop_updated',
          'sop_training_required',

          // Cannabis events
          'license_expiry_warning',
          'production_limit_warning',
          'security_compliance_issue',
          'inventory_discrepancy',
          'regulatory_update',
          'inspection_required',

          // System events
          'system_maintenance',
          'system_update',
          'backup_completed',
          'security_alert',
          'login_suspicious',
          'password_expiry',

          // Task events
          'task_assigned',
          'task_completed',
          'task_overdue',
          'task_escalated',
          'task_cancelled',

          // General
          'deadline_approaching',
          'certificate_issued',
          'certificate_expiring',
          'training_due',
          'payment_received',
          'custom',
        ],
      },

      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent', 'critical'],
        default: 'medium',
      },

      urgency: {
        type: String,
        enum: ['routine', 'standard', 'urgent', 'emergency'],
        default: 'standard',
      },
    },

    // Context and links
    context: {
      // Related entities
      farmCode: String,
      applicationId: String,
      auditId: String,
      sopCode: String,
      cultivationRecordCode: String,
      taskId: String,

      // Source information
      sourceSystem: String,
      sourceEvent: String,
      triggeredBy: {
        userId: String,
        userName: String,
        userRole: String,
      },

      // Deep links
      deepLinks: [
        {
          label: String,
          labelTH: String,
          url: String,
          target: { type: String, enum: ['_self', '_blank', 'modal'], default: '_self' },
        },
      ],

      // Additional metadata
      metadata: Object,
    },

    // Delivery settings
    delivery: {
      channels: [
        {
          channel: {
            type: String,
            enum: ['database', 'email', 'sms', 'push', 'webhook', 'line', 'telegram'],
            required: true,
          },
          status: {
            type: String,
            enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
            default: 'pending',
          },
          sentAt: Date,
          deliveredAt: Date,
          failureReason: String,
          retryCount: { type: Number, default: 0 },
          maxRetries: { type: Number, default: 3 },
        },
      ],

      scheduledFor: Date,
      expiresAt: Date,

      deliveryPreferences: {
        immediate: { type: Boolean, default: true },
        digest: { type: Boolean, default: false },
        batchWith: [String], // Batch with other notification types
      },
    },

    // User interaction
    interaction: {
      read: { type: Boolean, default: false },
      readAt: Date,

      acknowledged: { type: Boolean, default: false },
      acknowledgedAt: Date,
      acknowledgmentRequired: { type: Boolean, default: false },

      dismissed: { type: Boolean, default: false },
      dismissedAt: Date,

      starred: { type: Boolean, default: false },
      starredAt: Date,

      actionsTaken: [
        {
          actionId: String,
          takenAt: { type: Date, default: Date.now },
          result: String,
        },
      ],

      feedback: {
        helpful: Boolean,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        submittedAt: Date,
      },
    },

    // Status and lifecycle
    status: {
      type: String,
      enum: [
        'pending',
        'scheduled',
        'sent',
        'delivered',
        'read',
        'acknowledged',
        'expired',
        'cancelled',
      ],
      default: 'pending',
    },

    // Tracking and analytics
    tracking: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      lastViewedAt: Date,

      userAgent: String,
      ipAddress: String,
      deviceInfo: Object,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
EnhancedNotificationSchema.index({ notificationId: 1 });
EnhancedNotificationSchema.index({ 'recipient.userId': 1, status: 1 });
EnhancedNotificationSchema.index({ 'classification.category': 1, 'classification.priority': 1 });
EnhancedNotificationSchema.index({ 'classification.eventType': 1 });
EnhancedNotificationSchema.index({ 'context.farmCode': 1 });
EnhancedNotificationSchema.index({ 'context.auditId': 1 });
EnhancedNotificationSchema.index({ 'delivery.scheduledFor': 1 });
EnhancedNotificationSchema.index({ 'delivery.expiresAt': 1 });
EnhancedNotificationSchema.index({ createdAt: -1 });

// Virtual fields
EnhancedNotificationSchema.virtual('isOverdue').get(function () {
  return this.delivery.expiresAt && this.delivery.expiresAt < new Date() && !this.interaction.read;
});

EnhancedNotificationSchema.virtual('age').get(function () {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Instance methods
EnhancedNotificationSchema.methods.markAsRead = function (userId) {
  if (this.recipient.userId === userId) {
    this.interaction.read = true;
    this.interaction.readAt = new Date();
    this.status = 'read';
    return this.save();
  }
  throw new Error('Unauthorized to mark notification as read');
};

EnhancedNotificationSchema.methods.acknowledge = function (userId) {
  if (this.recipient.userId === userId) {
    this.interaction.acknowledged = true;
    this.interaction.acknowledgedAt = new Date();
    if (this.interaction.acknowledgmentRequired) {
      this.status = 'acknowledged';
    }
    return this.save();
  }
  throw new Error('Unauthorized to acknowledge notification');
};

EnhancedNotificationSchema.methods.recordAction = function (actionId, result) {
  this.interaction.actionsTaken.push({
    actionId,
    takenAt: new Date(),
    result,
  });
  this.tracking.clicks += 1;
  return this.save();
};

// Enhanced Notification Service
class EnhancedNotificationService extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map();
    this.templates = new Map();
    this.userPreferences = new Map();
    this.rateLimits = new Map();
    this.deliveryQueue = [];

    this.initializeChannels();
    this.initializeTemplates();
    this.startDeliveryProcessor();
  }

  /**
   * Initialize notification channels
   */
  initializeChannels() {
    // Database channel (always available)
    this.channels.set('database', {
      enabled: true,
      deliver: this.deliverToDatabase.bind(this),
    });

    // Email channel
    this.channels.set('email', {
      enabled: process.env.EMAIL_ENABLED === 'true',
      deliver: this.deliverToEmail.bind(this),
    });

    // SMS channel
    this.channels.set('sms', {
      enabled: process.env.SMS_ENABLED === 'true',
      deliver: this.deliverToSMS.bind(this),
    });

    // Push notification channel
    this.channels.set('push', {
      enabled: process.env.PUSH_ENABLED === 'true',
      deliver: this.deliverToPush.bind(this),
    });

    // LINE channel
    this.channels.set('line', {
      enabled: process.env.LINE_ENABLED === 'true',
      deliver: this.deliverToLine.bind(this),
    });
  }

  /**
   * Initialize notification templates
   */
  initializeTemplates() {
    // SOP Activity Templates
    this.templates.set('sop_activity_due', {
      title: 'SOP Activity Due',
      titleTH: 'กิจกรรม SOP ครบกำหนด',
      message: 'You have SOP activity "{activityName}" due on {dueDate}',
      messageTH: 'คุณมีกิจกรรม SOP "{activityName}" ครบกำหนดในวันที่ {dueDate}',
      priority: 'medium',
      channels: ['database', 'email'],
      actions: [
        {
          actionId: 'view_activity',
          label: 'View Activity',
          labelTH: 'ดูกิจกรรม',
          actionType: 'url',
          style: 'primary',
        },
      ],
    });

    // Cannabis License Templates
    this.templates.set('license_expiry_warning', {
      title: 'Cannabis License Expiring Soon',
      titleTH: 'ใบอนุญาตกัญชาใกล้หมดอายุ',
      message: 'Your cannabis license expires in {daysUntilExpiry} days',
      messageTH: 'ใบอนุญาตกัญชาของคุณจะหมดอายุในอีก {daysUntilExpiry} วัน',
      priority: 'high',
      channels: ['database', 'email', 'sms'],
      actions: [
        {
          actionId: 'renew_license',
          label: 'Renew License',
          labelTH: 'ต่ออายุใบอนุญาต',
          actionType: 'url',
          style: 'warning',
        },
      ],
    });

    // Audit Templates
    this.templates.set('audit_scheduled', {
      title: 'Audit Scheduled',
      titleTH: 'กำหนดการตรวจสอบ',
      message: 'An audit has been scheduled for {auditDate} at {farmName}',
      messageTH: 'มีการกำหนดตรวจสอบในวันที่ {auditDate} ที่ {farmName}',
      priority: 'medium',
      channels: ['database', 'email'],
      actions: [
        {
          actionId: 'view_audit',
          label: 'View Details',
          labelTH: 'ดูรายละเอียด',
          actionType: 'url',
          style: 'primary',
        },
        {
          actionId: 'prepare_checklist',
          label: 'Preparation Checklist',
          labelTH: 'รายการเตรียมความพร้อม',
          actionType: 'url',
          style: 'secondary',
        },
      ],
    });

    // Task Assignment Templates
    this.templates.set('task_assigned', {
      title: 'New Task Assigned',
      titleTH: 'มอบหมายงานใหม่',
      message: 'You have been assigned task: {taskTitle}',
      messageTH: 'คุณได้รับมอบหมายงาน: {taskTitle}',
      priority: 'medium',
      channels: ['database', 'email'],
      actions: [
        {
          actionId: 'view_task',
          label: 'View Task',
          labelTH: 'ดูงาน',
          actionType: 'url',
          style: 'primary',
        },
        {
          actionId: 'accept_task',
          label: 'Accept',
          labelTH: 'รับงาน',
          actionType: 'api',
          style: 'success',
        },
      ],
    });
  }

  /**
   * Create and send notification
   */
  async createNotification(notificationData) {
    try {
      // Get user preferences
      const userPrefs = await this.getUserPreferences(notificationData.recipient.userId);

      // Apply template if specified
      if (notificationData.templateId) {
        notificationData = this.applyTemplate(notificationData.templateId, notificationData);
      }

      // Create notification record
      const notification = new EnhancedNotification({
        ...notificationData,
        delivery: {
          ...notificationData.delivery,
          channels: this.determineChannels(notificationData, userPrefs),
        },
      });

      await notification.save();

      // Queue for delivery
      this.queueForDelivery(notification);

      this.emit('notification_created', notification);

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Apply notification template
   */
  applyTemplate(templateId, data) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Merge template with data
    const merged = {
      ...data,
      content: {
        ...data.content,
        title: this.interpolateString(template.title, data.variables || {}),
        titleTH: this.interpolateString(template.titleTH, data.variables || {}),
        message: this.interpolateString(template.message, data.variables || {}),
        messageTH: this.interpolateString(template.messageTH, data.variables || {}),
        actions: template.actions,
      },
      classification: {
        ...data.classification,
        priority: data.classification?.priority || template.priority,
      },
      delivery: {
        ...data.delivery,
        channels: template.channels.map(channel => ({ channel, status: 'pending' })),
      },
    };

    return merged;
  }

  /**
   * Interpolate template strings
   */
  interpolateString(template, variables) {
    if (!template) {
      return '';
    }

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Determine delivery channels based on user preferences and notification type
   */
  determineChannels(notificationData, userPrefs) {
    const defaultChannels = ['database'];

    if (!userPrefs) {
      return defaultChannels.map(channel => ({ channel, status: 'pending' }));
    }

    const channels = [];

    // Always include database
    channels.push({ channel: 'database', status: 'pending' });

    // Add other channels based on preferences and notification priority
    if (
      notificationData.classification.priority === 'urgent' ||
      notificationData.classification.priority === 'critical'
    ) {
      // High priority notifications use all available channels
      if (userPrefs.email.enabled) {
        channels.push({ channel: 'email', status: 'pending' });
      }
      if (userPrefs.sms.enabled) {
        channels.push({ channel: 'sms', status: 'pending' });
      }
      if (userPrefs.push.enabled) {
        channels.push({ channel: 'push', status: 'pending' });
      }
    } else {
      // Normal priority based on preferences
      if (
        userPrefs.email.enabled &&
        userPrefs.email.categories.includes(notificationData.classification.category)
      ) {
        channels.push({ channel: 'email', status: 'pending' });
      }
      if (
        userPrefs.sms.enabled &&
        userPrefs.sms.categories.includes(notificationData.classification.category)
      ) {
        channels.push({ channel: 'sms', status: 'pending' });
      }
    }

    return channels;
  }

  /**
   * Queue notification for delivery
   */
  queueForDelivery(notification) {
    if (notification.delivery.scheduledFor && notification.delivery.scheduledFor > new Date()) {
      // Schedule for later
      setTimeout(() => {
        this.deliveryQueue.push(notification);
      }, notification.delivery.scheduledFor - new Date());
    } else {
      // Immediate delivery
      this.deliveryQueue.push(notification);
    }
  }

  /**
   * Start delivery processor
   */
  startDeliveryProcessor() {
    setInterval(async () => {
      if (this.deliveryQueue.length > 0) {
        const notification = this.deliveryQueue.shift();
        await this.processDelivery(notification);
      }
    }, 1000); // Process every second
  }

  /**
   * Process notification delivery
   */
  async processDelivery(notification) {
    try {
      for (const channelConfig of notification.delivery.channels) {
        if (channelConfig.status === 'pending') {
          await this.deliverToChannel(notification, channelConfig);
        }
      }
    } catch (error) {
      logger.error('Error processing delivery:', error);
    }
  }

  /**
   * Deliver to specific channel
   */
  async deliverToChannel(notification, channelConfig) {
    const channel = this.channels.get(channelConfig.channel);

    if (!channel || !channel.enabled) {
      channelConfig.status = 'failed';
      channelConfig.failureReason = 'Channel not available';
      await notification.save();
      return;
    }

    try {
      await channel.deliver(notification);
      channelConfig.status = 'sent';
      channelConfig.sentAt = new Date();
    } catch (error) {
      channelConfig.status = 'failed';
      channelConfig.failureReason = error.message;
      channelConfig.retryCount += 1;

      // Retry logic
      if (channelConfig.retryCount < channelConfig.maxRetries) {
        setTimeout(
          () => {
            channelConfig.status = 'pending';
            this.queueForDelivery(notification);
          },
          Math.pow(2, channelConfig.retryCount) * 1000,
        ); // Exponential backoff
      }
    }

    await notification.save();
  }

  // Channel delivery methods
  async deliverToDatabase(_notification) {
    // Already saved to database
    return true;
  }

  async deliverToEmail(notification) {
    // Email delivery implementation
    logger.info(`Sending email notification to ${notification.recipient.userEmail}`);
    // Implementation would use nodemailer or similar
    return true;
  }

  async deliverToSMS(notification) {
    // SMS delivery implementation
    logger.info(`Sending SMS notification to ${notification.recipient.userPhone}`);
    // Implementation would use Twilio or similar
    return true;
  }

  async deliverToPush(notification) {
    // Push notification delivery
    logger.info(`Sending push notification to user ${notification.recipient.userId}`);
    // Implementation would use Firebase or similar
    return true;
  }

  async deliverToLine(notification) {
    // LINE notification delivery
    logger.info(`Sending LINE notification to user ${notification.recipient.userId}`);
    // Implementation would use LINE API
    return true;
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(_userId) {
    // Mock implementation - would typically fetch from database
    return {
      email: {
        enabled: true,
        categories: ['audit', 'sop_compliance', 'deadline', 'task_assignment'],
      },
      sms: {
        enabled: true,
        categories: ['urgent', 'cannabis_compliance', 'emergency'],
      },
      push: {
        enabled: true,
        categories: ['all'],
      },
    };
  }

  /**
   * Send SOP activity notification
   */
  async sendSOPActivityNotification(userId, activityData) {
    return this.createNotification({
      templateId: 'sop_activity_due',
      recipient: {
        userId: userId,
        userRole: activityData.userRole,
      },
      variables: {
        activityName: activityData.stepName,
        dueDate: activityData.scheduledDate.toLocaleDateString('th-TH'),
      },
      context: {
        cultivationRecordCode: activityData.cultivationRecordCode,
        sopCode: activityData.sopCode,
        deepLinks: [
          {
            label: 'View Activity',
            labelTH: 'ดูกิจกรรม',
            url: `/cultivation/${activityData.cultivationRecordCode}/activities/${activityData.activityId}`,
          },
        ],
      },
    });
  }

  /**
   * Send cannabis license expiry warning
   */
  async sendCannabisLicenseWarning(userId, licenseData) {
    return this.createNotification({
      templateId: 'license_expiry_warning',
      recipient: {
        userId: userId,
        userRole: 'farmer',
      },
      variables: {
        daysUntilExpiry: licenseData.daysUntilExpiry,
      },
      context: {
        farmCode: licenseData.farmCode,
        deepLinks: [
          {
            label: 'Renew License',
            labelTH: 'ต่ออายุใบอนุญาต',
            url: `/cannabis/license/renew/${licenseData.licenseNumber}`,
          },
        ],
      },
    });
  }

  /**
   * Send audit scheduled notification
   */
  async sendAuditScheduledNotification(userId, auditData) {
    return this.createNotification({
      templateId: 'audit_scheduled',
      recipient: {
        userId: userId,
        userRole: auditData.userRole,
      },
      variables: {
        auditDate: auditData.scheduledDate.toLocaleDateString('th-TH'),
        farmName: auditData.farmName,
      },
      context: {
        auditId: auditData.auditId,
        farmCode: auditData.farmCode,
        deepLinks: [
          {
            label: 'View Details',
            labelTH: 'ดูรายละเอียด',
            url: `/audits/${auditData.auditId}`,
          },
        ],
      },
    });
  }

  /**
   * Send task assignment notification
   */
  async sendTaskAssignmentNotification(userId, taskData) {
    return this.createNotification({
      templateId: 'task_assigned',
      recipient: {
        userId: userId,
        userRole: taskData.userRole,
      },
      variables: {
        taskTitle: taskData.title,
      },
      context: {
        taskId: taskData.taskId,
        deepLinks: [
          {
            label: 'View Task',
            labelTH: 'ดูงาน',
            url: `/tasks/${taskData.taskId}`,
          },
        ],
      },
    });
  }
}

// Models
const EnhancedNotification = mongoose.model('EnhancedNotification', EnhancedNotificationSchema);

module.exports = {
  EnhancedNotification,
  EnhancedNotificationService,
};
