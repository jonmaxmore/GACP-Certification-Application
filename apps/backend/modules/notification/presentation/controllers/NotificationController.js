const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('notification-notification');

/**
 * Notification Controller
 *
 * HTTP request handlers for notification endpoints.
 * Part of Clean Architecture - Presentation Layer
 */

class NotificationController {
  constructor({
    sendNotificationUseCase,
    sendBroadcastNotificationUseCase,
    getUserNotificationsUseCase,
    markNotificationAsReadUseCase,
    markAllAsReadUseCase,
    getUnreadCountUseCase,
    deleteNotificationUseCase,
    getNotificationStatisticsUseCase,
  }) {
    this.sendNotificationUseCase = sendNotificationUseCase;
    this.sendBroadcastNotificationUseCase = sendBroadcastNotificationUseCase;
    this.getUserNotificationsUseCase = getUserNotificationsUseCase;
    this.markNotificationAsReadUseCase = markNotificationAsReadUseCase;
    this.markAllAsReadUseCase = markAllAsReadUseCase;
    this.getUnreadCountUseCase = getUnreadCountUseCase;
    this.deleteNotificationUseCase = deleteNotificationUseCase;
    this.getNotificationStatisticsUseCase = getNotificationStatisticsUseCase;
  }

  // Send notification to specific user (DTAM only)
  async sendNotification(req, res) {
    try {
      const notificationData = {
        ...req.body,
        sentBy: req.user.id,
      };

      const notification = await this.sendNotificationUseCase.execute(notificationData);

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: notification,
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: error.message,
      });
    }
  }

  // Send broadcast notification to group/role (DTAM only)
  async sendBroadcast(req, res) {
    try {
      const notificationData = {
        ...req.body,
        sentBy: req.user.id,
      };

      const notification = await this.sendBroadcastNotificationUseCase.execute(
        notificationData,
        req.user,
      );

      res.status(201).json({
        success: true,
        message: 'Broadcast notification sent successfully',
        data: notification,
      });
    } catch (error) {
      logger.error('Error sending broadcast:', error);
      res.status(error.message.includes('authorized') ? 403 : 500).json({
        success: false,
        message: 'Failed to send broadcast notification',
        error: error.message,
      });
    }
  }

  // Get user's notifications (Farmer + DTAM)
  async getUserNotifications(req, res) {
    try {
      const recipientId = req.user.id;
      const filters = {
        status: req.query.status,
        type: req.query.type,
        priority: req.query.priority,
      };
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { sentAt: -1 },
      };

      const result = await this.getUserNotificationsUseCase.execute(recipientId, filters, options);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: error.message,
      });
    }
  }

  // Mark notification as read (Farmer + DTAM)
  async markAsRead(req, res) {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      const notification = await this.markNotificationAsReadUseCase.execute(notificationId, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('authorized')
          ? 403
          : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message,
      });
    }
  }

  // Mark all notifications as read (Farmer + DTAM)
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const count = await this.markAllAsReadUseCase.execute(userId);

      res.status(200).json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count },
      });
    } catch (error) {
      logger.error('Error marking all as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message,
      });
    }
  }

  // Get unread count (Farmer + DTAM)
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await this.getUnreadCountUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message,
      });
    }
  }

  // Delete (archive) notification (Farmer + DTAM)
  async deleteNotification(req, res) {
    try {
      const notificationId = req.params.id;
      const userId = req.user.id;

      const notification = await this.deleteNotificationUseCase.execute(notificationId, userId);

      res.status(200).json({
        success: true,
        message: 'Notification archived successfully',
        data: notification,
      });
    } catch (error) {
      logger.error('Error archiving notification:', error);
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('authorized')
          ? 403
          : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to archive notification',
        error: error.message,
      });
    }
  }

  // Get notification statistics (DTAM only)
  async getStatistics(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const statistics = await this.getNotificationStatisticsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification statistics',
        error: error.message,
      });
    }
  }
}

module.exports = NotificationController;
