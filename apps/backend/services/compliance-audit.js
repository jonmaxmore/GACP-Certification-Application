/**
 * GACP Platform Compliance & Audit Trail Service
 *
 * Implements comprehensive audit logging for:
 * - ISO 13485 (Medical Devices Quality Management)
 * - GxP (Good Practice Guidelines)
 * - HIPAA (Health Insurance Portability and Accountability)
 * - Thai FDA compliance requirements
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const { createLogger } = require('../shared/logger');
const logger = createLogger('compliance-audit');

// Audit Log Schema
const auditLogSchema = new mongoose.Schema(
  {
    // Core audit fields
    timestamp: { type: Date, default: Date.now, required: true },
    eventId: { type: String, required: true, unique: true },
    eventType: {
      type: String,
      required: true,
      enum: [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_CREATION',
        'USER_MODIFICATION',
        'APPLICATION_SUBMIT',
        'APPLICATION_REVIEW',
        'APPLICATION_APPROVE',
        'APPLICATION_REJECT',
        'CERTIFICATE_ISSUE',
        'CERTIFICATE_REVOKE',
        'CERTIFICATE_RENEWAL',
        'INSPECTION_SCHEDULE',
        'INSPECTION_COMPLETE',
        'INSPECTION_RESCHEDULE',
        'PAYMENT_PROCESS',
        'PAYMENT_REFUND',
        'DATA_ACCESS',
        'DATA_MODIFICATION',
        'DATA_DELETION',
        'DATA_EXPORT',
        'SYSTEM_CONFIG',
        'SECURITY_EVENT',
        'ERROR_EVENT',
        'COMPLIANCE_CHECK',
        'AUDIT_ACCESS',
      ],
    },

    // Who performed the action
    user: {
      id: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
      name: { type: String },
      ipAddress: { type: String, required: true },
      userAgent: { type: String },
    },

    // What was affected
    resource: {
      type: { type: String, required: true }, // e.g., 'Application', 'Certificate', 'User'
      id: { type: String, required: true },
      name: { type: String },
      previousState: { type: mongoose.Schema.Types.Mixed },
      newState: { type: mongoose.Schema.Types.Mixed },
    },

    // Action details
    action: {
      description: { type: String, required: true },
      method: { type: String }, // HTTP method for API calls
      endpoint: { type: String }, // API endpoint
      success: { type: Boolean, required: true },
      errorMessage: { type: String },
      riskLevel: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW',
      },
    },

    // Compliance metadata
    compliance: {
      regulatoryBasis: [{ type: String }], // ['ISO_13485', 'THAI_FDA', 'GxP', 'HIPAA']
      dataClassification: {
        type: String,
        enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
        default: 'INTERNAL',
      },
      retentionPeriod: { type: Number, default: 2555 }, // days (7 years default)
      businessJustification: { type: String },
    },

    // Technical metadata
    technical: {
      sessionId: { type: String },
      transactionId: { type: String },
      correlationId: { type: String },
      environment: { type: String, required: true },
      version: { type: String },
      checksumBefore: { type: String },
      checksumAfter: { type: String },
    },

    // Tamper protection
    integrity: {
      hash: { type: String, required: true },
      signature: { type: String },
      verified: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  },
);

// Prevent modification of audit logs
auditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('Audit logs cannot be modified');
});

auditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs cannot be modified');
});

auditLogSchema.pre('updateMany', function () {
  throw new Error('Audit logs cannot be modified');
});

// Create indexes for performance and compliance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ 'user.id': 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ 'resource.type': 1, 'resource.id': 1, timestamp: -1 });
auditLogSchema.index({ 'action.riskLevel': 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

class ComplianceAuditService {
  constructor() {
    this.secretKey = process.env.AUDIT_SECRET_KEY || 'default-audit-key';
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Log audit event with full compliance metadata
   */
  async logEvent(eventData) {
    try {
      const auditEntry = {
        eventId: this.generateEventId(),
        timestamp: new Date(),
        eventType: eventData.eventType,
        user: {
          id: eventData.userId,
          email: eventData.userEmail,
          role: eventData.userRole,
          name: eventData.userName,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
        },
        resource: {
          type: eventData.resourceType,
          id: eventData.resourceId,
          name: eventData.resourceName,
          previousState: eventData.previousState,
          newState: eventData.newState,
        },
        action: {
          description: eventData.description,
          method: eventData.method,
          endpoint: eventData.endpoint,
          success: eventData.success !== false,
          errorMessage: eventData.errorMessage,
          riskLevel: this.assessRiskLevel(eventData),
        },
        compliance: {
          regulatoryBasis: this.determineRegulatoryBasis(eventData),
          dataClassification: eventData.dataClassification || 'INTERNAL',
          retentionPeriod: eventData.retentionPeriod || 2555,
          businessJustification: eventData.businessJustification,
        },
        technical: {
          sessionId: eventData.sessionId,
          transactionId: eventData.transactionId,
          correlationId: eventData.correlationId,
          environment: this.environment,
          version: process.env.APP_VERSION || '1.0.0',
          checksumBefore: eventData.checksumBefore,
          checksumAfter: eventData.checksumAfter,
        },
      };

      // Generate integrity hash
      auditEntry.integrity = {
        hash: this.generateIntegrityHash(auditEntry),
        signature: this.generateSignature(auditEntry),
        verified: true,
      };

      const audit = new AuditLog(auditEntry);
      await audit.save();

      return {
        success: true,
        eventId: auditEntry.eventId,
        timestamp: auditEntry.timestamp,
      };
    } catch (error) {
      // Critical: Audit logging failure should be escalated
      logger.error('CRITICAL: Audit logging failed:', error);

      // Attempt to log the failure itself
      try {
        await this.logSystemEvent('AUDIT_LOGGING_FAILURE', {
          error: error.message,
          originalEvent: eventData,
          riskLevel: 'CRITICAL',
        });
      } catch (fallbackError) {
        logger.error('CRITICAL: Fallback audit logging also failed:', fallbackError);
      }

      throw error;
    }
  }

  /**
   * Log system events (non-user actions)
   */
  async logSystemEvent(eventType, data) {
    return this.logEvent({
      eventType,
      userId: 'SYSTEM',
      userEmail: 'system@gacp-platform.com',
      userRole: 'SYSTEM',
      userName: 'System Process',
      ipAddress: '127.0.0.1',
      userAgent: 'GACP-System/1.0',
      resourceType: 'SYSTEM',
      resourceId: 'SYSTEM',
      description: data.description || `System event: ${eventType}`,
      success: data.success !== false,
      errorMessage: data.error,
      riskLevel: data.riskLevel || 'LOW',
      ...data,
    });
  }

  /**
   * Retrieve audit trail with filtering and pagination
   */
  async getAuditTrail(filters = {}, options = {}) {
    const { startDate, endDate, userId, eventType, resourceType, resourceId, riskLevel, success } =
      filters;

    const { page = 1, limit = 100, sortBy = 'timestamp', sortOrder = 'desc' } = options;

    // Build query
    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    if (userId) {
      query['user.id'] = userId;
    }
    if (eventType) {
      query.eventType = eventType;
    }
    if (resourceType) {
      query['resource.type'] = resourceType;
    }
    if (resourceId) {
      query['resource.id'] = resourceId;
    }
    if (riskLevel) {
      query['action.riskLevel'] = riskLevel;
    }
    if (success !== undefined) {
      query['action.success'] = success;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [auditLogs, total] = await Promise.all([
      AuditLog.find(query).sort(sort).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    // Verify integrity of retrieved logs
    const verifiedLogs = auditLogs.map(log => ({
      ...log,
      integrityVerified: this.verifyIntegrity(log),
    }));

    return {
      auditLogs: verifiedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(regulatoryBasis, dateRange) {
    const { startDate, endDate } = dateRange;

    const pipeline = [
      {
        $match: {
          timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
          'compliance.regulatoryBasis': regulatoryBasis,
        },
      },
      {
        $group: {
          _id: {
            eventType: '$eventType',
            riskLevel: '$action.riskLevel',
            success: '$action.success',
          },
          count: { $sum: 1 },
          events: { $push: '$eventId' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ];

    const aggregation = await AuditLog.aggregate(pipeline);

    return {
      regulatoryBasis,
      period: { startDate, endDate },
      summary: aggregation,
      generatedAt: new Date(),
      totalEvents: aggregation.reduce((sum, group) => sum + group.count, 0),
    };
  }

  /**
   * Verify audit log integrity
   */
  verifyIntegrity(auditLog) {
    if (!auditLog.integrity || !auditLog.integrity.hash) {
      return false;
    }

    const computedHash = this.generateIntegrityHash(auditLog);
    return computedHash === auditLog.integrity.hash;
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `AUDIT_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Generate integrity hash for tamper detection
   */
  generateIntegrityHash(auditEntry) {
    const hashData = {
      eventId: auditEntry.eventId,
      timestamp: auditEntry.timestamp,
      eventType: auditEntry.eventType,
      userId: auditEntry.user.id,
      resourceType: auditEntry.resource.type,
      resourceId: auditEntry.resource.id,
      action: auditEntry.action.description,
      success: auditEntry.action.success,
    };

    return crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(hashData))
      .digest('hex');
  }

  /**
   * Generate digital signature
   */
  generateSignature(auditEntry) {
    const signatureData = JSON.stringify(auditEntry);
    return crypto.createHmac('sha512', this.secretKey).update(signatureData).digest('hex');
  }

  /**
   * Assess risk level based on event data
   */
  assessRiskLevel(eventData) {
    if (eventData.riskLevel) {
      return eventData.riskLevel;
    }

    // Risk assessment logic
    if (eventData.eventType.includes('DELETE') || eventData.eventType.includes('REVOKE')) {
      return 'HIGH';
    }

    if (eventData.eventType.includes('APPROVE') || eventData.eventType.includes('CERTIFICATE')) {
      return 'MEDIUM';
    }

    if (!eventData.success) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Determine regulatory basis for event
   */
  determineRegulatoryBasis(eventData) {
    const basis = [];

    // All medical device related events
    if (
      eventData.resourceType?.includes('Certificate') ||
      eventData.eventType?.includes('CERTIFICATE')
    ) {
      basis.push('ISO_13485', 'THAI_FDA');
    }

    // All inspection related events
    if (eventData.eventType?.includes('INSPECTION')) {
      basis.push('GxP', 'THAI_FDA');
    }

    // All user data events
    if (eventData.eventType?.includes('USER') || eventData.resourceType === 'User') {
      basis.push('HIPAA');
    }

    return basis.length > 0 ? basis : ['ISO_13485'];
  }

  /**
   * Express.js middleware for automatic audit logging
   */
  auditMiddleware() {
    return async (req, res, next) => {
      // Capture original res.json to log responses
      const originalJson = res.json;
      let responseData = null;

      res.json = function (data) {
        responseData = data;
        return originalJson.call(this, data);
      };

      // Log after response is sent
      res.on('finish', async () => {
        try {
          // Skip health check endpoints
          if (req.path.match(/\/(health|status|version)$/)) {
            return;
          }

          await this.logEvent({
            eventType: 'DATA_ACCESS',
            userId: req.user?.id || 'ANONYMOUS',
            userEmail: req.user?.email || 'anonymous@unknown.com',
            userRole: req.user?.role || 'ANONYMOUS',
            userName: req.user?.name || 'Anonymous User',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            resourceType: 'API_ENDPOINT',
            resourceId: req.path,
            description: `${req.method} ${req.path}`,
            method: req.method,
            endpoint: req.path,
            success: res.statusCode < 400,
            errorMessage: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null,
            sessionId: req.sessionID,
            correlationId: req.headers['x-correlation-id'],
          });
        } catch (error) {
          logger.error('Audit middleware error:', error);
        }
      });

      next();
    };
  }
}

module.exports = { ComplianceAuditService, AuditLog };
