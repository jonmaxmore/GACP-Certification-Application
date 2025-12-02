/**
 * Notification Controller (V2)
 * Request handler layer for notification endpoints
 * Delegates business logic to NotificationService
 */

const notificationService = require('../services/notificationService');

class NotificationController {
  /**
   * GET /api/v2/notifications
   * Get user's notifications
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user._id;
      const { limit, unreadOnly, page } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        limit,
        unreadOnly,
        page,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v2/notifications/unread-count
   * Get count of unread notifications
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user._id;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v2/notifications/:id/read
   * Mark notification as read
   */
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const notification = await notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v2/notifications/mark-all-read
   * Mark all notifications as read
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user._id;
      const count = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v2/notifications
   * Create a new notification (Admin/Staff only)
   */
  async createNotification(req, res, next) {
    try {
      const senderId = req.user._id;
      const notification = await notificationService.createNotification(req.body, senderId);

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
