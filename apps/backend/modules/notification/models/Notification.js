/**
 * Notification Model
 *
 * Mongoose schema for notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // User identification
    userId: {
      type: String,
      required: true,
      index: true,
      description: 'User who receives the notification',
    },

    // Event information
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'application.submitted',
        'application.under_review',
        'application.approved',
        'application.rejected',
        'certificate.issued',
        'certificate.expiring',
        'certificate.renewed',
        'certificate.revoked',
        'survey.assigned',
        'survey.reminder',
        'payment.required',
        'payment.confirmed',
        'document.uploaded',
        'document.verified',
        'announcement.general',
        'custom',
      ],
      description: 'Type of notification event',
    },

    // Content
    title: {
      type: String,
      required: true,
      maxlength: 200,
      description: 'Notification title',
    },

    message: {
      type: String,
      required: true,
      maxlength: 1000,
      description: 'Notification message',
    },

    // Priority
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
      description: 'Notification priority level',
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
      description: 'Whether notification has been read',
    },

    readAt: {
      type: Date,
      description: 'Timestamp when notification was read',
    },

    // Delivery channels
    channels: {
      type: [String],
      enum: ['inapp', 'email', 'line', 'sms'],
      default: ['inapp'],
      description: 'Delivery channels used',
    },

    deliveryStatus: {
      inapp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      line: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },

    // Related entities
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'Related entity ID (application, certificate, etc.)',
    },

    relatedType: {
      type: String,
      enum: ['application', 'certificate', 'survey', 'payment', 'document'],
      description: 'Type of related entity',
    },

    // Action
    actionUrl: {
      type: String,
      description: 'URL for notification action',
    },

    actionLabel: {
      type: String,
      description: 'Label for action button',
    },

    // Additional data
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      description: 'Additional metadata',
    },

    // Icon/Image
    icon: {
      type: String,
      description: 'Notification icon',
    },

    imageUrl: {
      type: String,
      description: 'Notification image URL',
    },

    // Expiry
    expiresAt: {
      type: Date,
      index: true,
      description: 'When notification expires and should be auto-deleted',
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  },
);

// Indexes for performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ eventType: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes
notificationSchema.index({ userId: 1, eventType: 1 });
notificationSchema.index({ userId: 1, priority: 1 });
notificationSchema.index({ relatedId: 1, relatedType: 1 });

// Virtual: Is expired
notificationSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual: Age in days
notificationSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const diffTime = now - this.createdAt;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Instance method: Mark as read
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method: Check if urgent
notificationSchema.methods.isUrgent = function () {
  return this.priority === 'urgent';
};

// Static method: Find unread for user
notificationSchema.statics.findUnreadForUser = function (userId) {
  return this.find({
    userId,
    isRead: false,
  }).sort({ createdAt: -1 });
};

// Static method: Find by event type
notificationSchema.statics.findByEventType = function (userId, eventType) {
  return this.find({
    userId,
    eventType,
  }).sort({ createdAt: -1 });
};

// Static method: Get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    userId,
    isRead: false,
  });
};

// Static method: Mark all as read for user
notificationSchema.statics.markAllAsReadForUser = async function (userId) {
  return this.updateMany(
    { userId, isRead: false },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
  );
};

// Static method: Delete old notifications
notificationSchema.statics.deleteOldNotifications = async function (days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true,
  });
};

// Pre-save middleware: Set default expiry if not provided
notificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const days = {
      urgent: 7,
      high: 30,
      medium: 90,
      low: 180,
    };

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (days[this.priority] || 90));
    this.expiresAt = expiryDate;
  }
  next();
});

// Enable virtuals in JSON output
notificationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

notificationSchema.set('toObject', {
  virtuals: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
