const { createLogger } = require('../../../shared/logger');
const logger = createLogger('notification-notification.controller');

/**
 * Notification Controller
 *
 * HTTP request handlers for notification management
 */

class NotificationController {
  constructor(notificationService) {
    this.service = notificationService;
  }

  /**
   * Get user notifications
   * GET /api/notifications/user/:userId
   */
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page, limit, isRead, priority } = req.query;

      // Authorization check
      if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const result = await this.service.getUserNotifications(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        priority,
      });

      res.json({
        success: true,
        message: 'Notifications retrieved',
        data: result,
      });
    } catch (error) {
      logger.error('Get user notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: error.message,
      });
    }
  }

  /**
   * Get unread count
   * GET /api/notifications/user/:userId/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const { userId } = req.params;

      // Authorization check
      if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const stats = await this.service.getNotificationStats(userId);

      res.json({
        success: true,
        data: {
          unread: stats.unread,
        },
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message,
      });
    }
  }

  /**
   * Mark notification as read
   * PATCH /api/notifications/:notificationId/read
   */
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      const success = await this.service.markAsRead(notificationId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notification marked as read',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }
    } catch (error) {
      logger.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark as read',
        error: error.message,
      });
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/user/:userId/read-all
   */
  async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;

      // Authorization check
      if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const count = await this.service.markAllAsRead(userId);

      res.json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count },
      });
    } catch (error) {
      logger.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all as read',
        error: error.message,
      });
    }
  }

  /**
   * Delete notification
   * DELETE /api/notifications/:notificationId
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.userId;

      const success = await this.service.deleteNotification(notificationId, userId);

      if (success) {
        res.json({
          success: true,
          message: 'Notification deleted',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }
    } catch (error) {
      logger.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message,
      });
    }
  }

  /**
   * Get notification statistics
   * GET /api/notifications/user/:userId/stats
   */
  async getNotificationStats(req, res) {
    try {
      const { userId } = req.params;

      // Authorization check
      if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const stats = await this.service.getNotificationStats(userId);

      res.json({
        success: true,
        message: 'Statistics retrieved',
        data: stats,
      });
    } catch (error) {
      logger.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message,
      });
    }
  }

  /**
   * Send custom notification (admin only)
   * POST /api/notifications/send
   */
  async sendCustomNotification(req, res) {
    try {
      const { recipients, title, message, options } = req.body;

      // Validation
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Recipients array is required',
        });
      }

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required',
        });
      }

      const count = await this.service.sendCustomNotification(
        recipients,
        title,
        message,
        options || {},
      );

      res.status(201).json({
        success: true,
        message: `Notification sent to ${count} users`,
        data: { count },
      });
    } catch (error) {
      logger.error('Send custom notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: error.message,
      });
    }
  }

  /**
   * Broadcast announcement (admin only)
   * POST /api/notifications/broadcast
   */
  async broadcastAnnouncement(req, res) {
    try {
      const { title, message, targetRoles, priority } = req.body;

      // Validation
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required',
        });
      }

      const announcementId = await this.service.broadcastAnnouncement(
        title,
        message,
        targetRoles || [],
        priority || 'medium',
      );

      res.status(201).json({
        success: true,
        message: 'Announcement broadcasted successfully',
        data: { announcementId },
      });
    } catch (error) {
      logger.error('Broadcast announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to broadcast announcement',
        error: error.message,
      });
    }
  }

  /**
   * Send test notification (admin only)
   * POST /api/notifications/test
   */
  async sendTestNotification(req, res) {
    try {
      const { eventType, data } = req.body;

      // Validation
      if (!eventType || !data) {
        return res.status(400).json({
          success: false,
          message: 'Event type and data are required',
        });
      }

      const result = await this.service.notify(eventType, data);

      res.json({
        success: true,
        message: 'Test notification sent',
        data: result,
      });
    } catch (error) {
      logger.error('Send test notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message,
      });
    }
  }

  /**
   * Update notification preferences
   * PUT /api/notifications/user/:userId/preferences
   */
  async updatePreferences(req, res) {
    try {
      const { userId } = req.params;
      const preferences = req.body;

      // Authorization check
      if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const success = await this.service.updateNotificationPreferences(userId, preferences);

      if (success) {
        res.json({
          success: true,
          message: 'Preferences updated',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update preferences',
        });
      }
    } catch (error) {
      logger.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        error: error.message,
      });
    }
  }

  /**
   * Get notification preferences
   * GET /api/notifications/user/:userId/preferences
   */
  async getPreferences(req, res) {
    try {
      const { userId } = req.params;

      // Authorization check
      if (req.user.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const preferences = await this.service.getUserPreferences(userId);

      res.json({
        success: true,
        message: 'Preferences retrieved',
        data: preferences,
      });
    } catch (error) {
      logger.error('Get preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get preferences',
        error: error.message,
      });
    }
  }

  /**
   * Webhook endpoint for external services
   * POST /api/notifications/webhook/:service
   */
  async handleWebhook(req, res) {
    try {
      const { service } = req.params;
      const payload = req.body;

      logger.info(`Webhook received from ${service}:`, payload);

      // Handle different webhook services
      switch (service) {
        case 'email':
          // Handle email delivery status
          // Update notification status based on email delivery
          break;
        case 'sms':
          // Handle SMS delivery status
          break;
        case 'line':
          // Handle LINE delivery status
          break;
        default:
          logger.warn(`Unknown webhook service: ${service}`);
      }

      res.json({
        success: true,
        message: 'Webhook processed',
      });
    } catch (error) {
      logger.error('Webhook processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process webhook',
        error: error.message,
      });
    }
  }

  /**
   * Get notification templates (admin only)
   * GET /api/notifications/templates
   */
  async getTemplates(req, res) {
    try {
      const templates = this.service.notificationTemplates;

      // Sanitize templates (remove sensitive data)
      const sanitized = {};
      for (const [key, template] of Object.entries(templates)) {
        sanitized[key] = {
          title: template.title,
          recipients: template.recipients,
          priority: template.priority,
          channels: template.channels,
        };
      }

      res.json({
        success: true,
        message: 'Templates retrieved',
        data: sanitized,
      });
    } catch (error) {
      logger.error('Get templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get templates',
        error: error.message,
      });
    }
  }
}

module.exports = NotificationController;
