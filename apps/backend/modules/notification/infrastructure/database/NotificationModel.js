/**
 * MongoDB Notification Repository Implementation
 *
 * Implements INotificationRepository interface using MongoDB/Mongoose.
 * Part of Clean Architecture - Infrastructure Layer
 */

const mongoose = require('mongoose');
const Notification = require('../../domain/entities/Notification');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('notification-notification');

// Mongoose Schema
const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipientType: {
      type: String,
      enum: Object.values(Notification.RECIPIENT_TYPE),
      required: true,
    },
    recipientRole: String,

    type: {
      type: String,
      enum: Object.values(Notification.TYPE),
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    messageEn: String,

    priority: {
      type: String,
      enum: Object.values(Notification.PRIORITY),
      default: Notification.PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(Notification.STATUS),
      default: Notification.STATUS.UNREAD,
    },

    channels: [
      {
        type: String,
        enum: Object.values(Notification.CHANNEL),
      },
    ],
    deliveryStatus: {
      inApp: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String,
      },
    },

    actionUrl: String,
    actionLabel: String,

    relatedEntity: {
      type: String,
      id: String,
    },

    metadata: mongoose.Schema.Types.Mixed,
    imageUrl: String,

    sentAt: { type: Date, default: Date.now },
    readAt: Date,
    archivedAt: Date,
    expiresAt: Date,

    sentBy: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
    collection: 'notifications',
  },
);

// Indexes
notificationSchema.index({ recipientId: 1, status: 1, sentAt: -1 });
notificationSchema.index({ recipientId: 1, sentAt: -1 });
notificationSchema.index({ recipientType: 1, sentAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ sentAt: -1 });

class MongoDBNotificationRepository {
  constructor(database) {
    this.NotificationModel = database.model('Notification', notificationSchema);
  }

  // Convert MongoDB document to Domain Entity
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    const data = doc.toObject ? doc.toObject() : doc;
    return new Notification({
      id: data._id.toString(),
      ...data,
      recipientId: data.recipientId?.toString(),
      sentBy: data.sentBy?.toString(),
    });
  }

  // Convert Domain Entity to MongoDB document
  toMongoDB(notification) {
    const data = { ...notification };
    if (notification.id) {
      data._id = mongoose.Types.ObjectId(notification.id);
      delete data.id;
    }
    if (notification.recipientId) {
      data.recipientId = mongoose.Types.ObjectId(notification.recipientId);
    }
    if (notification.sentBy) {
      data.sentBy = mongoose.Types.ObjectId(notification.sentBy);
    }
    return data;
  }

  async save(notification) {
    try {
      const data = this.toMongoDB(notification);

      if (data._id) {
        // Update existing
        const updated = await this.NotificationModel.findByIdAndUpdate(data._id, data, {
          new: true,
          runValidators: true,
        });
        return this.toDomain(updated);
      } else {
        // Create new
        const created = await this.NotificationModel.create(data);
        return this.toDomain(created);
      }
    } catch (error) {
      logger.error('Error saving notification:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const doc = await this.NotificationModel.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding notification by ID:', error);
      return null;
    }
  }

  async findByRecipientId(recipientId, filters = {}, options = {}) {
    try {
      const query = { recipientId: mongoose.Types.ObjectId(recipientId) };

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.priority) {
        query.priority = filters.priority;
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { sentAt: -1 };

      const [docs, total] = await Promise.all([
        this.NotificationModel.find(query).sort(sort).skip(skip).limit(limit),
        this.NotificationModel.countDocuments(query),
      ]);

      return {
        notifications: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding notifications by recipient:', error);
      throw error;
    }
  }

  async findUnreadByRecipient(recipientId) {
    try {
      const docs = await this.NotificationModel.find({
        recipientId: mongoose.Types.ObjectId(recipientId),
        status: Notification.STATUS.UNREAD,
      })
        .sort({ sentAt: -1 })
        .limit(50); // Limit to recent 50

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding unread notifications:', error);
      throw error;
    }
  }

  async findByType(type, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { sentAt: -1 };

      const [docs, total] = await Promise.all([
        this.NotificationModel.find({ type }).sort(sort).skip(skip).limit(limit),
        this.NotificationModel.countDocuments({ type }),
      ]);

      return {
        notifications: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding notifications by type:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { sentAt: -1 };

      const [docs, total] = await Promise.all([
        this.NotificationModel.find({ status }).sort(sort).skip(skip).limit(limit),
        this.NotificationModel.countDocuments({ status }),
      ]);

      return {
        notifications: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding notifications by status:', error);
      throw error;
    }
  }

  async findByPriority(priority, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { sentAt: -1 };

      const [docs, total] = await Promise.all([
        this.NotificationModel.find({ priority }).sort(sort).skip(skip).limit(limit),
        this.NotificationModel.countDocuments({ priority }),
      ]);

      return {
        notifications: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding notifications by priority:', error);
      throw error;
    }
  }

  async findWithFilters(filters = {}, options = {}) {
    try {
      const query = {};

      if (filters.recipientId) {
        query.recipientId = mongoose.Types.ObjectId(filters.recipientId);
      }
      if (filters.recipientType) {
        query.recipientType = filters.recipientType;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.priority) {
        query.priority = filters.priority;
      }
      if (filters.startDate || filters.endDate) {
        query.sentAt = {};
        if (filters.startDate) {
          query.sentAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.sentAt.$lte = new Date(filters.endDate);
        }
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { sentAt: -1 };

      const [docs, total] = await Promise.all([
        this.NotificationModel.find(query).sort(sort).skip(skip).limit(limit),
        this.NotificationModel.countDocuments(query),
      ]);

      return {
        notifications: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding notifications with filters:', error);
      throw error;
    }
  }

  async findBroadcasts(recipientType, role = null, options = {}) {
    try {
      const query = {
        recipientId: null,
        recipientType,
      };

      if (role) {
        query.recipientRole = role;
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { sentAt: -1 };

      const [docs, total] = await Promise.all([
        this.NotificationModel.find(query).sort(sort).skip(skip).limit(limit),
        this.NotificationModel.countDocuments(query),
      ]);

      return {
        notifications: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding broadcast notifications:', error);
      throw error;
    }
  }

  async countUnread(recipientId) {
    try {
      return await this.NotificationModel.countDocuments({
        recipientId: mongoose.Types.ObjectId(recipientId),
        status: Notification.STATUS.UNREAD,
      });
    } catch (error) {
      logger.error('Error counting unread notifications:', error);
      return 0;
    }
  }

  async count(criteria = {}) {
    try {
      return await this.NotificationModel.countDocuments(criteria);
    } catch (error) {
      logger.error('Error counting notifications:', error);
      return 0;
    }
  }

  async markAllAsRead(recipientId) {
    try {
      const result = await this.NotificationModel.updateMany(
        {
          recipientId: mongoose.Types.ObjectId(recipientId),
          status: Notification.STATUS.UNREAD,
        },
        {
          $set: {
            status: Notification.STATUS.READ,
            readAt: new Date(),
          },
        },
      );
      return result.modifiedCount;
    } catch (error) {
      logger.error('Error marking all as read:', error);
      return 0;
    }
  }

  async deleteExpired() {
    try {
      const result = await this.NotificationModel.deleteMany({
        expiresAt: { $lte: new Date() },
      });
      return result.deletedCount;
    } catch (error) {
      logger.error('Error deleting expired notifications:', error);
      return 0;
    }
  }

  async getStatistics(filters = {}) {
    try {
      const matchStage = {};

      if (filters.startDate || filters.endDate) {
        matchStage.sentAt = {};
        if (filters.startDate) {
          matchStage.sentAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          matchStage.sentAt.$lte = new Date(filters.endDate);
        }
      }

      const [
        totalNotifications,
        unreadCount,
        readCount,
        archivedCount,
        byType,
        byPriority,
        byChannel,
      ] = await Promise.all([
        this.NotificationModel.countDocuments(matchStage),
        this.NotificationModel.countDocuments({
          ...matchStage,
          status: Notification.STATUS.UNREAD,
        }),
        this.NotificationModel.countDocuments({ ...matchStage, status: Notification.STATUS.READ }),
        this.NotificationModel.countDocuments({
          ...matchStage,
          status: Notification.STATUS.ARCHIVED,
        }),
        this.NotificationModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        this.NotificationModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        this.NotificationModel.aggregate([
          { $match: matchStage },
          { $unwind: '$channels' },
          { $group: { _id: '$channels', count: { $sum: 1 } } },
        ]),
      ]);

      return {
        totalNotifications,
        unreadCount,
        readCount,
        archivedCount,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byChannel: byChannel.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('Error getting notification statistics:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.NotificationModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      return false;
    }
  }
}

module.exports = MongoDBNotificationRepository;
