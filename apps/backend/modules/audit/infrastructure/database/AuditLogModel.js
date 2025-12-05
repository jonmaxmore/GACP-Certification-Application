/**
 * MongoDB Audit Log Repository
 *
 * Implementation of IAuditLogRepository using MongoDB/Mongoose.
 *
 * @class MongoDBuditLogRepository
 * @implements {IAuditLogRepository}
 */

const mongoose = require('mongoose');
const IAuditLogRepository = require('../../domain/interfaces/IAuditLogRepository');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('audit-audit-log');

const {
  AuditLog,
  ACTION_TYPE,
  ENTITY_TYPE,
  SEVERITY,
  ACTOR_TYPE,
} = require('../../domain/entities/AuditLog');

// Mongoose Schema
const auditLogSchema = new mongoose.Schema(
  {
    // Actor Information
    actorType: {
      type: String,
      enum: Object.values(ACTOR_TYPE),
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    actorName: String,
    actorEmail: String,
    actorRole: String,

    // Action Information
    actionType: {
      type: String,
      enum: Object.values(ACTION_TYPE),
      required: true,
      index: true,
    },
    actionDescription: String,

    // Entity Information
    entityType: {
      type: String,
      enum: Object.values(ENTITY_TYPE),
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    entityName: String,

    // Change Details
    changesBefore: mongoose.Schema.Types.Mixed,
    changesAfter: mongoose.Schema.Types.Mixed,
    changesSummary: [
      {
        field: String,
        from: mongoose.Schema.Types.Mixed,
        to: mongoose.Schema.Types.Mixed,
      },
    ],

    // Request Context
    requestMethod: String,
    requestPath: String,
    requestQuery: mongoose.Schema.Types.Mixed,
    requestBody: mongoose.Schema.Types.Mixed,
    responseStatus: Number,
    responseMessage: String,

    // Metadata
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: String,
    sessionId: String,
    severity: {
      type: String,
      enum: Object.values(SEVERITY),
      default: SEVERITY.INFO,
      index: true,
    },
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,

    // Result
    success: {
      type: Boolean,
      default: true,
      index: true,
    },
    errorMessage: String,
    errorStack: String,

    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  },
);

// Compound indexes for common queries
auditLogSchema.index({ actorId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ actionType: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // For time-based queries

class MongoDBAuditLogRepository extends IAuditLogRepository {
  constructor(database) {
    super();
    this.AuditLogModel = database.model('AuditLog', auditLogSchema);
  }

  /**
   * Convert MongoDB document to AuditLog entity
   */
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    return new AuditLog({
      id: doc._id.toString(),
      actorType: doc.actorType,
      actorId: doc.actorId?.toString(),
      actorName: doc.actorName,
      actorEmail: doc.actorEmail,
      actorRole: doc.actorRole,
      actionType: doc.actionType,
      actionDescription: doc.actionDescription,
      entityType: doc.entityType,
      entityId: doc.entityId?.toString(),
      entityName: doc.entityName,
      changesBefore: doc.changesBefore,
      changesAfter: doc.changesAfter,
      changesSummary: doc.changesSummary,
      requestMethod: doc.requestMethod,
      requestPath: doc.requestPath,
      requestQuery: doc.requestQuery,
      requestBody: doc.requestBody,
      responseStatus: doc.responseStatus,
      responseMessage: doc.responseMessage,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      sessionId: doc.sessionId,
      severity: doc.severity,
      tags: doc.tags,
      metadata: doc.metadata,
      success: doc.success,
      errorMessage: doc.errorMessage,
      errorStack: doc.errorStack,
      timestamp: doc.timestamp,
      createdAt: doc.createdAt,
    });
  }

  /**
   * Convert AuditLog entity to MongoDB document
   */
  toMongoDB(auditLog) {
    const doc = {
      actorType: auditLog.actorType,
      actionType: auditLog.actionType,
      actionDescription: auditLog.actionDescription,
      entityType: auditLog.entityType,
      changesBefore: auditLog.changesBefore,
      changesAfter: auditLog.changesAfter,
      changesSummary: auditLog.changesSummary,
      requestMethod: auditLog.requestMethod,
      requestPath: auditLog.requestPath,
      requestQuery: auditLog.requestQuery,
      requestBody: auditLog.requestBody,
      responseStatus: auditLog.responseStatus,
      responseMessage: auditLog.responseMessage,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      sessionId: auditLog.sessionId,
      severity: auditLog.severity,
      tags: auditLog.tags,
      metadata: auditLog.metadata,
      success: auditLog.success,
      errorMessage: auditLog.errorMessage,
      errorStack: auditLog.errorStack,
      timestamp: auditLog.timestamp,
    };

    // Optional fields (only include if present)
    if (auditLog.id) {
      doc._id = new mongoose.Types.ObjectId(auditLog.id);
    }
    if (auditLog.actorId) {
      doc.actorId = new mongoose.Types.ObjectId(auditLog.actorId);
    }
    if (auditLog.actorName) {
      doc.actorName = auditLog.actorName;
    }
    if (auditLog.actorEmail) {
      doc.actorEmail = auditLog.actorEmail;
    }
    if (auditLog.actorRole) {
      doc.actorRole = auditLog.actorRole;
    }
    if (auditLog.entityId) {
      doc.entityId = new mongoose.Types.ObjectId(auditLog.entityId);
    }
    if (auditLog.entityName) {
      doc.entityName = auditLog.entityName;
    }

    return doc;
  }

  async save(auditLog) {
    try {
      const mongoDoc = this.toMongoDB(auditLog);
      const doc = new this.AuditLogModel(mongoDoc);
      const saved = await doc.save();
      return this.toDomain(saved);
    } catch (error) {
      logger.error('Error saving audit log:', error);
      // Don't throw - audit logging should not break application flow
      return null;
    }
  }

  async findById(id) {
    try {
      const doc = await this.AuditLogModel.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding audit log by ID:', error);
      throw error;
    }
  }

  async findByActorId(actorId, options = {}) {
    try {
      const { page = 1, limit = 50, sort = { timestamp: -1 } } = options;
      const skip = (page - 1) * limit;

      const docs = await this.AuditLogModel.find({ actorId: new mongoose.Types.ObjectId(actorId) })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding audit logs by actor:', error);
      throw error;
    }
  }

  async findByActionType(actionType, options = {}) {
    try {
      const { page = 1, limit = 50, sort = { timestamp: -1 } } = options;
      const skip = (page - 1) * limit;

      const docs = await this.AuditLogModel.find({ actionType }).sort(sort).skip(skip).limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding audit logs by action type:', error);
      throw error;
    }
  }

  async findByEntity(entityType, entityId, options = {}) {
    try {
      const { page = 1, limit = 50, sort = { timestamp: -1 } } = options;
      const skip = (page - 1) * limit;

      const docs = await this.AuditLogModel.find({
        entityType,
        entityId: new mongoose.Types.ObjectId(entityId),
      })
        .sort(sort)
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding audit logs by entity:', error);
      throw error;
    }
  }

  async findWithFilters(filters, options = {}) {
    try {
      const { page = 1, limit = 50, sort = { timestamp: -1 } } = options;
      const skip = (page - 1) * limit;

      const query = {};

      if (filters.actorType) {
        query.actorType = filters.actorType;
      }
      if (filters.actorId) {
        query.actorId = new mongoose.Types.ObjectId(filters.actorId);
      }
      if (filters.actionType) {
        query.actionType = filters.actionType;
      }
      if (filters.entityType) {
        query.entityType = filters.entityType;
      }
      if (filters.entityId) {
        query.entityId = new mongoose.Types.ObjectId(filters.entityId);
      }
      if (filters.severity) {
        query.severity = filters.severity;
      }
      if (filters.success !== undefined) {
        query.success = filters.success;
      }
      if (filters.ipAddress) {
        query.ipAddress = filters.ipAddress;
      }

      // Date range
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.timestamp.$lte = new Date(filters.endDate);
        }
      }

      // Tags
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      // Search in action description or entity name
      if (filters.search) {
        query.$or = [
          { actionDescription: { $regex: filters.search, $options: 'i' } },
          { entityName: { $regex: filters.search, $options: 'i' } },
          { actorName: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const docs = await this.AuditLogModel.find(query).sort(sort).skip(skip).limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding audit logs with filters:', error);
      throw error;
    }
  }

  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const docs = await this.AuditLogModel.find({
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding audit logs by date range:', error);
      throw error;
    }
  }

  async findRecent(limit = 50) {
    try {
      const docs = await this.AuditLogModel.find().sort({ timestamp: -1 }).limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding recent audit logs:', error);
      throw error;
    }
  }

  async findSecurityLogs(options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const securityActions = [
        ACTION_TYPE.SECURITY_VIOLATION,
        ACTION_TYPE.ACCESS_DENIED,
        ACTION_TYPE.SUSPICIOUS_ACTIVITY,
      ];

      const docs = await this.AuditLogModel.find({ actionType: { $in: securityActions } })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding security logs:', error);
      throw error;
    }
  }

  async findFailedActions(options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const docs = await this.AuditLogModel.find({ success: false })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding failed actions:', error);
      throw error;
    }
  }

  async count(criteria = {}) {
    try {
      return await this.AuditLogModel.countDocuments(criteria);
    } catch (error) {
      logger.error('Error counting audit logs:', error);
      throw error;
    }
  }

  async getStatistics(filters = {}) {
    try {
      const query = {};
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) {
          query.timestamp.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.timestamp.$lte = new Date(filters.endDate);
        }
      }

      const [
        totalLogs,
        successfulActions,
        failedActions,
        actionTypeStats,
        severityStats,
        actorTypeStats,
      ] = await Promise.all([
        this.AuditLogModel.countDocuments(query),
        this.AuditLogModel.countDocuments({ ...query, success: true }),
        this.AuditLogModel.countDocuments({ ...query, success: false }),
        this.AuditLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$actionType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        this.AuditLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]),
        this.AuditLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$actorType', count: { $sum: 1 } } },
        ]),
      ]);

      return {
        totalLogs,
        successfulActions,
        failedActions,
        successRate: totalLogs > 0 ? ((successfulActions / totalLogs) * 100).toFixed(2) : 0,
        topActions: actionTypeStats.map(stat => ({
          actionType: stat._id,
          count: stat.count,
        })),
        bySeverity: severityStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byActorType: actorTypeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('Error getting audit statistics:', error);
      throw error;
    }
  }

  async getActivitySummary(actorId, startDate, endDate) {
    try {
      const query = {
        actorId: new mongoose.Types.ObjectId(actorId),
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const [totalActions, actionsByType, recentActions] = await Promise.all([
        this.AuditLogModel.countDocuments(query),
        this.AuditLogModel.aggregate([
          { $match: query },
          { $group: { _id: '$actionType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        this.AuditLogModel.find(query).sort({ timestamp: -1 }).limit(10),
      ]);

      return {
        actorId,
        period: { startDate, endDate },
        totalActions,
        actionsByType: actionsByType.map(stat => ({
          actionType: stat._id,
          count: stat.count,
        })),
        recentActions: recentActions.map(doc => this.toDomain(doc)),
      };
    } catch (error) {
      logger.error('Error getting activity summary:', error);
      throw error;
    }
  }

  async deleteOldLogs(beforeDate) {
    try {
      const result = await this.AuditLogModel.deleteMany({
        timestamp: { $lt: new Date(beforeDate) },
      });
      return result.deletedCount;
    } catch (error) {
      logger.error('Error deleting old audit logs:', error);
      throw error;
    }
  }
}

module.exports = MongoDBAuditLogRepository;
