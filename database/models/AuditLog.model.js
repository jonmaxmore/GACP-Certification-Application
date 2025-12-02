/**
 * AuditLog Model - GACP Platform
 * MongoDB schema for immutable audit trail with hash chain
 *
 * @module database/models/AuditLog
 * @version 2.0.0
 * @date 2025-10-16
 *
 * @standards
 * - OpenAPI 3.0.3 specification compliance
 * - Blockchain-inspired hash chain (SHA-256)
 * - Immutable logs (write-only, no updates/deletes)
 * - 7-year retention (Thai tax law)
 * - Time-series optimized collection
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const { Schema } = mongoose;

/**
 * AuditLog Schema
 * Time-series collection for immutable audit logs
 */
const AuditLogSchema = new Schema(
  {
    // === PRIMARY KEY ===
    _id: {
      type: Schema.Types.ObjectId,
      auto: true
    },

    // === LOG IDENTIFIERS ===
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^LOG-\d{4}-[A-Z0-9]{8}$/,
      description: 'Format: LOG-YYYY-XXXXXXXX'
    },

    sequenceNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      description: 'Auto-increment for ordering and hash chain'
    },

    // === EVENT CLASSIFICATION ===
    category: {
      type: String,
      required: true,
      enum: [
        'AUTHENTICATION',
        'APPLICATION',
        'PAYMENT',
        'CERTIFICATE',
        'ADMIN',
        'SECURITY',
        'SYSTEM'
      ],
      index: true
    },

    action: {
      type: String,
      required: true,
      maxlength: 100,
      index: true,
      description: 'e.g., USER_LOGIN, APPLICATION_SUBMITTED, PAYMENT_COMPLETED'
    },

    severity: {
      type: String,
      required: true,
      enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
      default: 'INFO',
      index: true
    },

    // === ACTOR (Who) ===
    actorId: {
      type: String,
      required: true,
      index: true,
      description: 'User ID or SERVICE for system actions'
    },

    actorType: {
      type: String,
      required: true,
      enum: ['USER', 'SERVICE', 'SYSTEM'],
      default: 'USER'
    },

    actorEmail: {
      type: String,
      default: null,
      description: 'Denormalized for quick lookups'
    },

    actorRole: {
      type: String,
      required: true,
      enum: ['FARMER', 'DTAM', 'ADMIN', 'SYSTEM'],
      description: 'Role at time of action'
    },

    // === RESOURCE (What) ===
    resourceType: {
      type: String,
      required: true,
      enum: ['USER', 'APPLICATION', 'INVOICE', 'PAYMENT', 'CERTIFICATE', 'DOCUMENT', 'SYSTEM'],
      index: true
    },

    resourceId: {
      type: String,
      required: true,
      index: true,
      description: 'ID of the resource affected'
    },

    // === CONTEXT (Where/How) ===
    ipAddress: {
      type: String,
      required: true,
      maxlength: 45, // IPv6 max length
      description: 'IP address of the actor'
    },

    userAgent: {
      type: String,
      required: true,
      maxlength: 500,
      description: 'User agent string'
    },

    // === EVENT DATA ===
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
      description: 'Flexible JSON data for event-specific information'
    },

    // === RESULT ===
    result: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    },

    errorCode: {
      type: String,
      default: null,
      maxlength: 50
    },

    errorMessage: {
      type: String,
      default: null,
      maxlength: 1000
    },

    // === IMMUTABILITY (Hash Chain) ===
    previousHash: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/,
      index: true,
      description: 'SHA-256 hash of previous log entry'
    },

    currentHash: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/,
      unique: true,
      index: true,
      description: 'SHA-256 hash of current log entry'
    },

    hashAlgorithm: {
      type: String,
      required: true,
      enum: ['SHA-256'],
      default: 'SHA-256'
    },

    // === TIMESTAMP (Immutable) ===
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
      index: true
    }
  },
  {
    timestamps: false, // We manage timestamp manually
    collection: 'audit_logs',
    versionKey: false,

    // Time-series collection configuration (MongoDB 5.0+)
    timeseries: {
      timeField: 'timestamp',
      metaField: 'metadata',
      granularity: 'seconds'
    }
  }
);

// ========================================
// INDEXES
// ========================================

// Time-series optimized indexes
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ sequenceNumber: 1 }, { unique: true });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, severity: 1, timestamp: -1 });

// Hash chain verification indexes
AuditLogSchema.index({ previousHash: 1 });
AuditLogSchema.index({ currentHash: 1 }, { unique: true });

// Compound index for common queries
AuditLogSchema.index({
  category: 1,
  action: 1,
  timestamp: -1
});

// ========================================
// VIRTUAL PROPERTIES
// ========================================

/**
 * Check if log is a security event
 */
AuditLogSchema.virtual('isSecurityEvent').get(function () {
  return this.category === 'SECURITY' || this.severity === 'CRITICAL' || this.result === 'FAILURE';
});

/**
 * Get log age in days
 */
AuditLogSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const diff = now - this.timestamp;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

/**
 * Check if log should be archived (> 1 year)
 */
AuditLogSchema.virtual('shouldArchive').get(function () {
  return this.ageInDays > 365;
});

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Verify hash chain integrity with previous log
 * @param {AuditLog} previousLog - Previous log entry
 * @returns {Boolean}
 */
AuditLogSchema.methods.verifyChain = function (previousLog) {
  if (!previousLog) {
    // First log in chain
    return this.previousHash === '0'.repeat(64);
  }

  return this.previousHash === previousLog.currentHash;
};

/**
 * Calculate hash for this log entry
 * @returns {String} - SHA-256 hash
 */
AuditLogSchema.methods.calculateHash = function () {
  const data = {
    logId: this.logId,
    sequenceNumber: this.sequenceNumber,
    category: this.category,
    action: this.action,
    actorId: this.actorId,
    resourceType: this.resourceType,
    resourceId: this.resourceId,
    timestamp: this.timestamp.toISOString(),
    previousHash: this.previousHash,
    result: this.result
  };

  const dataString = JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

/**
 * Get formatted log entry
 * @returns {String}
 */
AuditLogSchema.methods.getFormattedLog = function () {
  return (
    `[${this.timestamp.toISOString()}] [${this.severity}] [${this.category}] ` +
    `${this.action} by ${this.actorId} (${this.actorRole}) on ` +
    `${this.resourceType}:${this.resourceId} - ${this.result}`
  );
};

// ========================================
// STATIC METHODS
// ========================================

/**
 * Generate unique Log ID
 * @returns {Promise<String>} - Format: LOG-YYYY-XXXXXXXX
 */
AuditLogSchema.statics.generateLogId = async function () {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const logId = `LOG-${year}-${randomPart}`;

  const existing = await this.findOne({ logId });
  if (existing) {
    return this.generateLogId();
  }

  return logId;
};

/**
 * Get next sequence number
 * @returns {Promise<Number>}
 */
AuditLogSchema.statics.getNextSequenceNumber = async function () {
  const lastLog = await this.findOne().sort({ sequenceNumber: -1 });
  return lastLog ? lastLog.sequenceNumber + 1 : 1;
};

/**
 * Get last log entry (for hash chain)
 * @returns {Promise<AuditLog>}
 */
AuditLogSchema.statics.getLastLog = async function () {
  return this.findOne().sort({ sequenceNumber: -1 });
};

/**
 * Create audit log entry with hash chain
 * @param {Object} logData - Log entry data
 * @returns {Promise<AuditLog>}
 */
AuditLogSchema.statics.createLog = async function (logData) {
  // Get previous log for hash chain
  const previousLog = await this.getLastLog();
  const previousHash = previousLog ? previousLog.currentHash : '0'.repeat(64);

  // Generate IDs
  const logId = await this.generateLogId();
  const sequenceNumber = await this.getNextSequenceNumber();

  // Create log entry
  const log = new this({
    logId,
    sequenceNumber,
    category: logData.category,
    action: logData.action,
    severity: logData.severity || 'INFO',
    actorId: logData.actorId,
    actorType: logData.actorType || 'USER',
    actorEmail: logData.actorEmail || null,
    actorRole: logData.actorRole,
    resourceType: logData.resourceType,
    resourceId: logData.resourceId,
    ipAddress: logData.ipAddress,
    userAgent: logData.userAgent,
    metadata: logData.metadata || {},
    result: logData.result || 'SUCCESS',
    errorCode: logData.errorCode || null,
    errorMessage: logData.errorMessage || null,
    previousHash: previousHash,
    currentHash: '', // Calculate after
    hashAlgorithm: 'SHA-256',
    timestamp: new Date()
  });

  // Calculate and set current hash
  log.currentHash = log.calculateHash();

  // Save to database
  await log.save();
  return log;
};

/**
 * Verify entire hash chain integrity
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>}
 */
AuditLogSchema.statics.verifyChainIntegrity = async function (startDate, endDate) {
  const logs = await this.find({
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ sequenceNumber: 1 });

  let previousHash = null;
  let tamperedLogs = [];
  let totalLogs = logs.length;

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Check if previous hash matches
    if (i === 0) {
      if (log.previousHash !== '0'.repeat(64)) {
        // First log in range, should reference previous chain
        const previousLog = await this.findOne({
          sequenceNumber: log.sequenceNumber - 1
        });
        if (previousLog && log.previousHash !== previousLog.currentHash) {
          tamperedLogs.push({
            logId: log.logId,
            sequenceNumber: log.sequenceNumber,
            issue: 'Hash chain broken'
          });
        }
      }
    } else {
      if (log.previousHash !== previousHash) {
        tamperedLogs.push({
          logId: log.logId,
          sequenceNumber: log.sequenceNumber,
          issue: 'Previous hash mismatch'
        });
      }
    }

    // Verify current hash
    const calculatedHash = log.calculateHash();
    if (log.currentHash !== calculatedHash) {
      tamperedLogs.push({
        logId: log.logId,
        sequenceNumber: log.sequenceNumber,
        issue: 'Current hash invalid (log tampered)'
      });
    }

    previousHash = log.currentHash;
  }

  return {
    totalLogs,
    tamperedLogs: tamperedLogs.length,
    intact: tamperedLogs.length === 0,
    details: tamperedLogs
  };
};

/**
 * Find security events
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<AuditLog[]>}
 */
AuditLogSchema.statics.findSecurityEvents = function (startDate, endDate) {
  return this.find({
    timestamp: { $gte: startDate, $lte: endDate },
    $or: [{ category: 'SECURITY' }, { severity: 'CRITICAL' }, { result: 'FAILURE' }]
  }).sort({ timestamp: -1 });
};

/**
 * Get audit timeline for resource
 * @param {String} resourceType - Resource type
 * @param {String} resourceId - Resource ID
 * @returns {Promise<AuditLog[]>}
 */
AuditLogSchema.statics.getResourceTimeline = function (resourceType, resourceId) {
  return this.find({
    resourceType,
    resourceId
  }).sort({ timestamp: 1 });
};

/**
 * Get user activity summary
 * @param {String} actorId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>}
 */
AuditLogSchema.statics.getUserActivity = async function (actorId, startDate, endDate) {
  const logs = await this.find({
    actorId,
    timestamp: { $gte: startDate, $lte: endDate }
  });

  const summary = {
    totalActions: logs.length,
    successCount: logs.filter(l => l.result === 'SUCCESS').length,
    failureCount: logs.filter(l => l.result === 'FAILURE').length,
    categories: {},
    lastActivity: logs.length > 0 ? logs[logs.length - 1].timestamp : null
  };

  // Count by category
  logs.forEach(log => {
    summary.categories[log.category] = (summary.categories[log.category] || 0) + 1;
  });

  return summary;
};

// ========================================
// MIDDLEWARE (Hooks)
// ========================================

/**
 * Pre-save: Prevent updates (immutability)
 */
AuditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable and cannot be updated'));
  }
  next();
});

/**
 * Pre-remove: Prevent deletion (immutability)
 */
AuditLogSchema.pre('remove', function (next) {
  return next(new Error('Audit logs are immutable and cannot be deleted'));
});

/**
 * Pre-deleteOne: Prevent deletion (immutability)
 */
AuditLogSchema.pre('deleteOne', function (next) {
  return next(new Error('Audit logs are immutable and cannot be deleted'));
});

/**
 * Pre-findOneAndUpdate: Prevent updates (immutability)
 */
AuditLogSchema.pre('findOneAndUpdate', function (next) {
  return next(new Error('Audit logs are immutable and cannot be updated'));
});

// ========================================
// SCHEMA CONFIGURATION
// ========================================

AuditLogSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

AuditLogSchema.set('toObject', {
  virtuals: true
});

// ========================================
// EXPORT MODEL
// ========================================

module.exports = mongoose.model('AuditLog', AuditLogSchema);
