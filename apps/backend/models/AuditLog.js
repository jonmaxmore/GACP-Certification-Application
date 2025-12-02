/**
 * AuditLog Model (Capped Collection)
 *
 * Stores all database changes for compliance and forensics.
 * Capped collection: max 5GB or 10M documents.
 *
 * @module models/AuditLog
 */

const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'READ',
        'LOGIN',
        'LOGOUT',
        'VERIFY',
        'APPROVE',
        'REJECT',
      ],
      index: true,
    },

    collection: {
      type: String,
      required: [true, 'Collection name is required'],
      index: true,
    },

    documentId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Document ID is required'],
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      ipAddress: String,
      userAgent: String,
      requestId: String,
      sessionId: String,
      method: String,
      path: String,
      status: Number,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'audit_log',
    capped: {
      size: 5368709120, // 5GB
      max: 10000000, // 10 million documents
    },
    versionKey: false,
  },
);

// Indexes
AuditLogSchema.index({ userId: 1, timestamp: -1 }); // User activity
AuditLogSchema.index({ collection: 1, documentId: 1, timestamp: -1 }); // Document history
AuditLogSchema.index({ action: 1, timestamp: -1 }); // Action filter
AuditLogSchema.index({ timestamp: -1 }); // Recent activity

// Static methods
AuditLogSchema.statics.log = async function (entry) {
  try {
    await this.create({
      action: entry.action,
      collection: entry.collection,
      documentId: entry.documentId,
      userId: entry.userId,
      oldData: entry.oldData || null,
      newData: entry.newData || null,
      changes: entry.changes || null,
      metadata: entry.metadata || {},
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw - audit logging should not break the app
  }
};

AuditLogSchema.statics.logCreate = async function (collection, document, userId, metadata = {}) {
  return await this.log({
    action: 'CREATE',
    collection,
    documentId: document._id || document.id,
    userId,
    newData: document,
    metadata,
  });
};

AuditLogSchema.statics.logUpdate = async function (
  collection,
  documentId,
  oldData,
  newData,
  userId,
  metadata = {},
) {
  const changes = {};

  // Compute what changed
  for (const key in newData) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  }

  return await this.log({
    action: 'UPDATE',
    collection,
    documentId,
    userId,
    oldData,
    newData,
    changes,
    metadata,
  });
};

AuditLogSchema.statics.logDelete = async function (collection, document, userId, metadata = {}) {
  return await this.log({
    action: 'DELETE',
    collection,
    documentId: document._id || document.id,
    userId,
    oldData: document,
    metadata,
  });
};

AuditLogSchema.statics.logAccess = async function (collection, documentId, userId, metadata = {}) {
  return await this.log({
    action: 'READ',
    collection,
    documentId,
    userId,
    metadata,
  });
};

AuditLogSchema.statics.getDocumentHistory = async function (collection, documentId, limit = 50) {
  return await this.find({
    collection,
    documentId,
  })
    .sort('-timestamp')
    .limit(limit)
    .populate('userId', 'userId email profile.firstName profile.lastName');
};

AuditLogSchema.statics.getUserActivity = async function (userId, limit = 100) {
  return await this.find({
    userId,
  })
    .sort('-timestamp')
    .limit(limit)
    .select('-oldData -newData'); // Don't include full data for privacy
};

AuditLogSchema.statics.getRecentActivity = async function (limit = 100) {
  return await this.find()
    .sort('-timestamp')
    .limit(limit)
    .populate('userId', 'userId email profile.firstName profile.lastName');
};

AuditLogSchema.statics.getStatsByAction = async function (startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

AuditLogSchema.statics.getStatsByUser = async function (startDate, endDate, limit = 10) {
  return await this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$userId',
        count: { $sum: 1 },
        actions: { $push: '$action' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
};

// JSON transform
AuditLogSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

const AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);

module.exports = AuditLogModel;
