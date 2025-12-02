/**
 * Notification Service
 *
 * Comprehensive notification system with multiple channels:
 * - In-app notifications (database)
 * - Email (SMTP)
 * - LINE Notify
 * - SMS (optional)
 * - Webhooks
 */

const logger = require('../../../shared/logger/logger');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const axios = require('axios');

class NotificationService {
  constructor(db) {
    this.db = db;
    this.notifications = null;
    this.preferences = null;
    this.templates = null;
    this.initialized = false;

    // Email transporter
    this.emailTransporter = null;

    // Notification templates
    this.notificationTemplates = {
      'application.submitted': {
        title: 'คำขอได้รับการส่งแล้ว',
        message: 'คำขอรับรองมาตรฐาน GACP ของคุณได้รับการส่งเรียบร้อยแล้ว',
        recipients: ['applicant'],
        priority: 'medium',
        channels: ['inapp', 'email'],
      },
      'application.under_review': {
        title: 'คำขออยู่ระหว่างการตรวจสอบ',
        message: 'คำขอของคุณกำลังได้รับการตรวจสอบโดยเจ้าหน้าที่',
        recipients: ['applicant'],
        priority: 'medium',
        channels: ['inapp', 'email'],
      },
      'application.approved': {
        title: 'คำขอได้รับการอนุมัติ',
        message: 'ยินดีด้วย! คำขอรับรองมาตรฐาน GACP ของคุณได้รับการอนุมัติแล้ว',
        recipients: ['applicant'],
        priority: 'high',
        channels: ['inapp', 'email', 'line'],
      },
      'application.rejected': {
        title: 'คำขอไม่ได้รับการอนุมัติ',
        message: 'คำขอของคุณไม่ได้รับการอนุมัติ กรุณาตรวจสอบเหตุผลและแก้ไข',
        recipients: ['applicant'],
        priority: 'high',
        channels: ['inapp', 'email', 'line'],
      },
      'certificate.issued': {
        title: 'ออกใบรับรองแล้ว',
        message: 'ใบรับรองมาตรฐาน GACP ของคุณได้รับการออกแล้ว',
        recipients: ['applicant'],
        priority: 'high',
        channels: ['inapp', 'email', 'line'],
      },
      'certificate.expiring': {
        title: 'ใบรับรองใกล้หมดอายุ',
        message: 'ใบรับรองของคุณจะหมดอายุในอีก {days} วัน กรุณาดำเนินการต่ออายุ',
        recipients: ['applicant'],
        priority: 'high',
        channels: ['inapp', 'email', 'line', 'sms'],
      },
      'certificate.renewed': {
        title: 'ต่ออายุใบรับรองแล้ว',
        message: 'ใบรับรองของคุณได้รับการต่ออายุเรียบร้อยแล้ว',
        recipients: ['applicant'],
        priority: 'medium',
        channels: ['inapp', 'email'],
      },
      'certificate.revoked': {
        title: 'ใบรับรองถูกเพิกถอน',
        message: 'ใบรับรองของคุณถูกเพิกถอน: {reason}',
        recipients: ['applicant'],
        priority: 'urgent',
        channels: ['inapp', 'email', 'line', 'sms'],
      },
      'survey.assigned': {
        title: 'ได้รับมอบหมายการสำรวจ',
        message: 'คุณได้รับมอบหมายให้ทำแบบสำรวจใหม่',
        recipients: ['surveyor'],
        priority: 'medium',
        channels: ['inapp', 'email'],
      },
      'survey.reminder': {
        title: 'แจ้งเตือนทำแบบสำรวจ',
        message: 'คุณยังมีแบบสำรวจที่รอการทำให้เสร็จสิ้น',
        recipients: ['surveyor'],
        priority: 'medium',
        channels: ['inapp', 'line'],
      },
      'payment.required': {
        title: 'รอการชำระเงิน',
        message: 'กรุณาชำระค่าธรรมเนียมการขอรับรอง จำนวน {amount} บาท',
        recipients: ['applicant'],
        priority: 'high',
        channels: ['inapp', 'email', 'line'],
      },
      'payment.confirmed': {
        title: 'ยืนยันการชำระเงิน',
        message: 'ได้รับการชำระเงินของคุณเรียบร้อยแล้ว',
        recipients: ['applicant'],
        priority: 'medium',
        channels: ['inapp', 'email'],
      },
      'document.uploaded': {
        title: 'อัปโหลดเอกสารแล้ว',
        message: 'เอกสาร {documentName} ได้รับการอัปโหลดเรียบร้อยแล้ว',
        recipients: ['applicant'],
        priority: 'low',
        channels: ['inapp'],
      },
      'document.verified': {
        title: 'ตรวจสอบเอกสารแล้ว',
        message: 'เอกสารของคุณได้รับการตรวจสอบและรับรองแล้ว',
        recipients: ['applicant'],
        priority: 'medium',
        channels: ['inapp', 'email'],
      },
      'announcement.general': {
        title: 'ประกาศทั่วไป',
        message: '{message}',
        recipients: ['all'],
        priority: 'medium',
        channels: ['inapp'],
      },
    };
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    try {
      logger.info('Initializing Notification Service...');

      // Get collections
      this.notifications = this.db.collection('notifications');
      this.preferences = this.db.collection('notificationPreferences');
      this.templates = this.db.collection('notificationTemplates');

      // Create indexes
      await this.createIndexes();

      // Initialize email transporter
      this.initializeEmailTransporter();

      this.initialized = true;
      logger.info('✓ Notification Service initialized');
    } catch (error) {
      logger.error('Failed to initialize Notification Service:', error);
      throw error;
    }
  }

  /**
   * Create database indexes
   */
  async createIndexes() {
    await this.notifications.createIndex({ userId: 1, isRead: 1 });
    await this.notifications.createIndex({ userId: 1, createdAt: -1 });
    await this.notifications.createIndex({ eventType: 1 });
    await this.notifications.createIndex({ priority: 1 });
    await this.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    await this.preferences.createIndex({ userId: 1 }, { unique: true });

    logger.info('✓ Notification indexes created');
  }

  /**
   * Initialize email transporter (SMTP)
   */
  initializeEmailTransporter() {
    const config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    if (config.auth.user && config.auth.pass) {
      this.emailTransporter = nodemailer.createTransport(config);
      logger.info('✓ Email transporter initialized');
    } else {
      logger.info('⚠ Email credentials not configured - email notifications disabled');
    }
  }

  /**
   * Send notification (main method)
   *
   * @param {String} eventType - Type of event
   * @param {Object} data - Event data
   * @returns {Object} - Notification result
   */
  async notify(eventType, data) {
    try {
      const template = this.notificationTemplates[eventType];

      if (!template) {
        logger.warn(`No template found for event type: ${eventType}`);
        return { success: false, error: 'Unknown event type' };
      }

      // Prepare notification data
      const notification = {
        eventType,
        userId: data.userId,
        title: this.interpolate(template.title, data),
        message: this.interpolate(template.message, data),
        priority: template.priority,
        metadata: data.metadata || {},
        isRead: false,
        createdAt: new Date(),
        expiresAt: this.calculateExpiry(template.priority),
      };

      const results = {
        inapp: false,
        email: false,
        line: false,
        sms: false,
      };

      // Get user preferences
      const userPrefs = await this.getUserPreferences(data.userId);

      // Send through enabled channels
      for (const channel of template.channels) {
        if (this.isChannelEnabled(channel, userPrefs)) {
          switch (channel) {
            case 'inapp':
              results.inapp = await this.sendInAppNotification(notification);
              break;
            case 'email':
              results.email = await this.sendEmailNotification(
                data.email || data.userEmail,
                notification,
              );
              break;
            case 'line':
              results.line = await this.sendLineNotification(
                data.lineToken || userPrefs.lineToken,
                notification,
              );
              break;
            case 'sms':
              results.sms = await this.sendSMSNotification(
                data.phone || data.userPhone,
                notification,
              );
              break;
          }
        }
      }

      return {
        success: true,
        notificationId: notification._id,
        channels: results,
      };
    } catch (error) {
      logger.error('Notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send in-app notification (database)
   */
  async sendInAppNotification(notification) {
    try {
      const result = await this.notifications.insertOne(notification);
      return result.acknowledged;
    } catch (error) {
      logger.error('In-app notification failed:', error);
      return false;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(email, notification) {
    if (!this.emailTransporter || !email) {
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@gacp-certify.go.th',
        to: email,
        subject: notification.title,
        text: notification.message,
        html: this.generateEmailHTML(notification),
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      logger.error('Email notification failed:', error);
      return false;
    }
  }

  /**
   * Send LINE notification
   */
  async sendLineNotification(lineToken, notification) {
    if (!lineToken) {
      return false;
    }

    try {
      const response = await axios.post(
        'https://notify-api.line.me/api/notify',
        new URLSearchParams({
          message: `${notification.title}\n${notification.message}`,
        }),
        {
          headers: {
            Authorization: `Bearer ${lineToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.status === 200;
    } catch (error) {
      logger.error('LINE notification failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification (placeholder - needs SMS provider)
   */
  async sendSMSNotification(phone, notification) {
    if (!phone) {
      return false;
    }

    try {
      // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
      logger.info(`SMS to ${phone}: ${notification.message}`);
      return true;
    } catch (error) {
      logger.error('SMS notification failed:', error);
      return false;
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, isRead, priority } = options;

    const query = { userId };

    if (typeof isRead === 'boolean') {
      query.isRead = isRead;
    }

    if (priority) {
      query.priority = priority;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notifications.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      this.notifications.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const result = await this.notifications.updateOne(
      {
        _id: new ObjectId(notificationId),
        userId,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const result = await this.notifications.updateMany(
      {
        userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const result = await this.notifications.deleteOne({
      _id: new ObjectId(notificationId),
      userId,
    });

    return result.deletedCount > 0;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId) {
    const [stats] = await this.notifications
      .aggregate([
        { $match: { userId } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            unread: [{ $match: { isRead: false } }, { $count: 'count' }],
            byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
            byEventType: [{ $group: { _id: '$eventType', count: { $sum: 1 } } }],
            recent: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              { $project: { title: 1, createdAt: 1, isRead: 1 } },
            ],
          },
        },
      ])
      .toArray();

    return {
      total: stats.total[0]?.count || 0,
      unread: stats.unread[0]?.count || 0,
      byPriority: stats.byPriority || [],
      byEventType: stats.byEventType || [],
      recent: stats.recent || [],
    };
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(recipients, title, message, options = {}) {
    const { priority = 'medium', channels = ['inapp'], metadata = {} } = options;

    const notifications = recipients.map(userId => ({
      userId,
      title,
      message,
      priority,
      eventType: 'custom',
      metadata,
      isRead: false,
      createdAt: new Date(),
      expiresAt: this.calculateExpiry(priority),
    }));

    const result = await this.notifications.insertMany(notifications);

    return result.insertedCount;
  }

  /**
   * Broadcast announcement
   */
  async broadcastAnnouncement(title, message, targetRoles = [], priority = 'medium') {
    // TODO: Get all users or users with specific roles
    // For now, create a broadcast record
    const announcement = {
      type: 'broadcast',
      title,
      message,
      targetRoles,
      priority,
      createdAt: new Date(),
      expiresAt: this.calculateExpiry(priority),
    };

    const result = await this.notifications.insertOne(announcement);

    return result.insertedId;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    const result = await this.preferences.updateOne(
      { userId },
      {
        $set: {
          ...preferences,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return result.acknowledged;
  }

  /**
   * Get notification preferences
   */
  async getUserPreferences(userId) {
    const prefs = await this.preferences.findOne({ userId });

    return (
      prefs || {
        inapp: true,
        email: true,
        line: false,
        sms: false,
        lineToken: null,
      }
    );
  }

  /**
   * Helper: Interpolate template strings
   */
  interpolate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Helper: Calculate notification expiry
   */
  calculateExpiry(priority) {
    const now = new Date();
    const days = {
      urgent: 7,
      high: 30,
      medium: 90,
      low: 180,
    };

    now.setDate(now.getDate() + (days[priority] || 90));
    return now;
  }

  /**
   * Helper: Check if channel is enabled
   */
  isChannelEnabled(channel, preferences) {
    if (!preferences) {
      return channel === 'inapp';
    }
    return preferences[channel] !== false;
  }

  /**
   * Helper: Generate email HTML
   */
  generateEmailHTML(notification) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .priority-urgent { border-left: 4px solid #f44336; }
          .priority-high { border-left: 4px solid #ff9800; }
          .priority-medium { border-left: 4px solid #2196F3; }
          .priority-low { border-left: 4px solid #4CAF50; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>ระบบรับรองมาตรฐาน GACP</h2>
          </div>
          <div class="content priority-${notification.priority}">
            <h3>${notification.title}</h3>
            <p>${notification.message}</p>
            <p><small>เมื่อ: ${notification.createdAt.toLocaleString('th-TH')}</small></p>
          </div>
          <div class="footer">
            <p>ระบบแจ้งเตือนอัตโนมัติ - กรมวิชาการเกษตร</p>
            <p><a href="https://gacp-certify.go.th">เข้าสู่ระบบ</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = NotificationService;
