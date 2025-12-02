/**
 * NotificationRepository
 * Data access layer for Notification collection
 *
 * @module repositories/notification
 * @version 1.0.0
 */

const logger = require('../utils/logger');

class NotificationRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = 'notifications';
  }

  /**
   * Get notifications collection
   * @private
   */
  get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Find notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object|null>} Notification document
   */
  async findById(notificationId) {
    try {
      return await this.collection.findOne({ _id: notificationId });
    } catch (error) {
      logger.error('[NotificationRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find notifications by user ID
   * @param {string} userId - User ID
   * @param {Object} options - Optional filters (read, type, priority, limit, skip)
   * @returns {Promise<Array>} List of notifications
   */
  async findByUser(userId, options = {}) {
    try {
      const query = { userId };

      if (typeof options.read === 'boolean') {
        query.read = options.read;
      }

      if (options.type) {
        query.type = options.type;
      }

      if (options.priority) {
        query.priority = options.priority;
      }

      let cursor = this.collection.find(query).sort({ createdAt: -1 });

      if (options.limit) {
        cursor = cursor.limit(options.limit);
      }

      if (options.skip) {
        cursor = cursor.skip(options.skip);
      }

      return await cursor.toArray();
    } catch (error) {
      logger.error('[NotificationRepository] findByUser error:', error);
      throw error;
    }
  }

  /**
   * Get unread count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    try {
      return await this.collection.countDocuments({
        userId,
        read: false,
      });
    } catch (error) {
      logger.error('[NotificationRepository] getUnreadCount error:', error);
      throw error;
    }
  }

  /**
   * Create new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async create(notificationData) {
    try {
      const result = await this.collection.insertOne({
        ...notificationData,
        read: false,
        createdAt: new Date(),
      });

      return {
        id: result.insertedId,
        ...notificationData,
        read: false,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('[NotificationRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Create multiple notifications
   * @param {Array} notificationsData - Array of notification data
   * @returns {Promise<Array>} Created notifications
   */
  async createMany(notificationsData) {
    try {
      const notifications = notificationsData.map(data => ({
        ...data,
        read: false,
        createdAt: new Date(),
      }));

      const result = await this.collection.insertMany(notifications);

      return notifications.map((notification, index) => ({
        id: result.insertedIds[index],
        ...notification,
      }));
    } catch (error) {
      logger.error('[NotificationRepository] createMany error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object|null>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const result = await this.collection.findOneAndUpdate(
        {
          _id: notificationId,
          userId, // Ensure user owns this notification
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[NotificationRepository] markAsRead error:', error);
      throw error;
    }
  }

  /**
   * Mark all user notifications as read
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of updated notifications
   */
  async markAllAsRead(userId) {
    try {
      const result = await this.collection.updateMany(
        {
          userId,
          read: false,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        },
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error('[NotificationRepository] markAllAsRead error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} Success status
   */
  async delete(notificationId, userId) {
    try {
      const result = await this.collection.deleteOne({
        _id: notificationId,
        userId, // Ensure user owns this notification
      });

      return result.deletedCount > 0;
    } catch (error) {
      logger.error('[NotificationRepository] delete error:', error);
      throw error;
    }
  }

  /**
   * Delete old read notifications
   * @param {number} daysOld - Number of days (default 30)
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteOldRead(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.collection.deleteMany({
        read: true,
        readAt: { $lte: cutoffDate },
      });

      return result.deletedCount;
    } catch (error) {
      logger.error('[NotificationRepository] deleteOldRead error:', error);
      throw error;
    }
  }

  /**
   * Find notifications by role
   * @param {string} role - User role
   * @param {Object} options - Optional filters
   * @returns {Promise<Array>} List of user IDs with role
   */
  async findUsersByRole(_role) {
    try {
      // This would typically query the users collection
      // For now, return empty array - implement when user repository is available
      logger.warn('[NotificationRepository] findUsersByRole needs user repository integration');
      return [];
    } catch (error) {
      logger.error('[NotificationRepository] findUsersByRole error:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(userId = null) {
    try {
      const query = userId ? { userId } : {};

      const [total, unread, byType, byPriority] = await Promise.all([
        // Total count
        this.collection.countDocuments(query),

        // Unread count
        this.collection.countDocuments({ ...query, read: false }),

        // By type
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                unread: {
                  $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] },
                },
              },
            },
          ])
          .toArray(),

        // By priority
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
                unread: {
                  $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] },
                },
              },
            },
          ])
          .toArray(),
      ]);

      return {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = {
            total: item.count,
            unread: item.unread,
          };
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = {
            total: item.count,
            unread: item.unread,
          };
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('[NotificationRepository] getStatistics error:', error);
      throw error;
    }
  }

  /**
   * Find recent notifications
   * @param {number} limit - Number of records
   * @returns {Promise<Array>} List of notifications
   */
  async findRecent(limit = 10) {
    try {
      return await this.collection.find().sort({ createdAt: -1 }).limit(limit).toArray();
    } catch (error) {
      logger.error('[NotificationRepository] findRecent error:', error);
      throw error;
    }
  }
}

module.exports = NotificationRepository;
