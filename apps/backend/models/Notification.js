/**
 * Notification Model (V2 Enhanced)
 * For in-app notifications (closed-loop communication)
 * Replaces email notifications for internal system alerts
 */

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'urgent',        // 🔴 Urgent: Document returned for correction
        'payment',       // 🟡 Payment: Payment required
        'info',          // 🔵 Info: General information
        'appointment',   // 📅 Appointment: Video call scheduled
        'approval',      // ✅ Approval: Application approved
        'rejection',     // ❌ Rejection: Application rejected
        'task',          // Legacy: Task notification
        'report',        // Legacy: Report notification
        'message',       // Legacy: Message notification
        'system',        // Legacy: System notification
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxLength: 200,
    },
    message: {
      type: String,
      required: true,
      maxLength: 1000,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // V2: Enhanced status tracking
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },

    // V2: Priority for sorting
    priority: {
      type: Number,
      default: 1,
      enum: [0, 1, 2, 3], // 0=low, 1=normal, 2=high, 3=urgent
    },

    // V2: Action button configuration
    actionButton: {
      label: String,
      url: String,
    },

    // V2: Link to related entity
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['application', 'payment', 'inspection', 'ticket', 'task', 'report'],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },

    // Legacy data field (keep for backward compatibility)
    data: {
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
      reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
      },
      priority: String,
      url: String,
    },

    // V2: Auto-expire notifications after certain time
    expiresAt: Date,
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Indexes
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Instance methods
NotificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static methods
NotificationSchema.statics.createNotification = async function (data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

NotificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

NotificationSchema.statics.getUserNotifications = function (userId, limit = 20) {
  return this.find({ recipient: userId })
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .populate('sender', 'fullName role')
    .populate('relatedEntity.entityId');
};

module.exports = mongoose.model('Notification', NotificationSchema);
