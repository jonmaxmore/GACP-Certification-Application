/**
 * Notification Service (V2)
 * Business logic layer for notification management
 * Follows layered architecture pattern
 */

const Notification = require('../../models/Notification');
const { ValidationError, NotFoundError } = require('../../shared/errors');
const logger = require('../../shared/logger');

class NotificationService {
  /**
   * Get user's notifications with filtering and pagination
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notifications and metadata
   */
  async getUserNotifications(userId, options = {}) {
    const { limit = 20, unreadOnly = false, page = 1 } = options;

    // Input validation
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const parsedLimit = parseInt(limit);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    // Build query
    const query = { recipient: userId };
    if (unreadOnly === true || unreadOnly === 'true') {
      query.read = false;
    }

    try {
      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parsedLimit;
      const [notifications, unreadCount, totalCount] = await Promise.all([
        Notification.find(query)
          .sort({ priority: -1, createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
          .populate('sender', 'fullName role')
          .populate('relatedEntity.entityId')
          .lean(),
        Notification.getUnreadCount(userId),
        Notification.countDocuments(query),
      ]);

      logger.info('Notifications retrieved', {
        userId,
        count: notifications.length,
        unreadCount,
      });

      return {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parsedLimit,
          total: totalCount,
          pages: Math.ceil(totalCount / parsedLimit),
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve notifications', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    try {
      const count = await Notification.getUnreadCount(userId);
      return count;
    } catch (error) {
      logger.error('Failed to get unread count', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    // Input validation
    if (!notificationId || !userId) {
      throw new ValidationError('Notification ID and User ID are required');
    }

    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
      });

      if (!notification) {
        throw new NotFoundError('Notification not found or access denied');
      }

      // Skip if already read
      if (notification.read) {
        return notification;
      }

      await notification.markAsRead();

      logger.info('Notification marked as read', {
        notificationId,
        userId,
      });

      return notification;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Failed to mark notification as read', {
        notificationId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of notifications updated
   */
  async markAllAsRead(userId) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    try {
      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { $set: { read: true, readAt: new Date() } }
      );

      logger.info('All notifications marked as read', {
        userId,
        count: result.modifiedCount,
      });

      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @param {string} senderId - Sender user ID
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(data, senderId) {
    const {
      recipientId,
      type,
      title,
      message,
      priority = 1,
      actionButton,
      relatedEntity,
      expiresAt,
    } = data;

    // Input validation
    if (!recipientId || !type || !title || !message) {
      throw new ValidationError('Missing required fields: recipientId, type, title, message');
    }

    // Validate type
    const validTypes = ['urgent', 'payment', 'info', 'appointment', 'approval', 'rejection'];
    if (!validTypes.includes(type)) {
      throw new ValidationError(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate priority
    if (![0, 1, 2, 3].includes(priority)) {
      throw new ValidationError('Priority must be 0 (low), 1 (normal), 2 (high), or 3 (urgent)');
    }

    // Sanitize inputs
    const sanitizedData = {
      recipient: recipientId,
      sender: senderId,
      type,
      title: title.trim().substring(0, 200),
      message: message.trim().substring(0, 1000),
      priority,
      actionButton,
      relatedEntity,
      expiresAt,
    };

    try {
      const notification = await Notification.createNotification(sanitizedData);

      logger.info('Notification created', {
        notificationId: notification._id,
        type,
        recipient: recipientId,
        sender: senderId,
      });

      return notification;
    } catch (error) {
      logger.error('Failed to create notification', {
        type,
        recipient: recipientId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete expired notifications (cleanup job)
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteExpired() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      logger.info('Expired notifications deleted', {
        count: result.deletedCount,
      });

      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to delete expired notifications', {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new NotificationService();
