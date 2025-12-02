/**
 * Audit Service - Comprehensive Audit Trail System
 *
 * Purpose: Log all critical actions with full context
 * Features:
 * - Comprehensive audit logging
 * - Critical action monitoring
 * - Query audit trail
 * - SIEM integration (optional)
 */

const logger = require('../shared/logger');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  constructor(db, config = {}) {
    this.db = db;
    this.collection = config.collection || 'audit_logs';
    this.siemEnabled = config.siemEnabled || false;
    this.siemEndpoint = config.siemEndpoint || null;

    // Critical actions that require special attention
    this.criticalActions = new Set([
      'application_submitted',
      'application_approved',
      'application_rejected',
      'certificate_issued',
      'certificate_revoked',
      'payment_processed',
      'payment_refunded',
      'user_created',
      'user_deleted',
      'user_role_changed',
      'password_reset',
      'account_locked',
      'account_unlocked',
      'inspector_assigned',
      'reviewer_assigned',
      'approver_assigned',
    ]);
  }

  /**
   * Log an action
   */
  async logAction(action, actor, resource, metadata = {}) {
    const log = {
      id: uuidv4(),
      timestamp: new Date(),
      actor: {
        userId: actor.userId,
        role: actor.role,
        name: actor.name || 'Unknown',
        email: actor.email,
        ip: actor.ip || 'unknown',
        userAgent: actor.userAgent || 'unknown',
      },
      action,
      resource: {
        type: resource.type,
        id: resource.id,
        before: resource.before || null,
        after: resource.after || null,
      },
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV || 'development',
      },
      result: 'success',
    };

    try {
      // Save to database
      await this.db.collection(this.collection).insertOne(log);

      // Log critical actions to SIEM if enabled
      if (this.isCriticalAction(action) && this.siemEnabled) {
        await this.logToSIEM(log);
      }

      logger.info(`✅ Audit log created: ${action} by ${actor.userId}`);

      return log;
    } catch (error) {
      logger.error('❌ Failed to create audit log:', error);
      // Don't throw - audit logging should not break the main flow
      return null;
    }
  }

  /**
   * Log a failed action
   */
  async logFailure(action, actor, resource, error, metadata = {}) {
    const log = {
      id: uuidv4(),
      timestamp: new Date(),
      actor: {
        userId: actor.userId,
        role: actor.role,
        name: actor.name || 'Unknown',
        email: actor.email,
        ip: actor.ip || 'unknown',
        userAgent: actor.userAgent || 'unknown',
      },
      action,
      resource: {
        type: resource.type,
        id: resource.id,
        before: resource.before || null,
        after: null,
      },
      metadata: {
        ...metadata,
        environment: process.env.NODE_ENV || 'development',
      },
      result: 'failure',
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
    };

    try {
      await this.db.collection(this.collection).insertOne(log);

      // Always log failures to SIEM if enabled
      if (this.siemEnabled) {
        await this.logToSIEM(log);
      }

      return log;
    } catch (err) {
      logger.error('❌ Failed to log failure:', err);
      return null;
    }
  }

  /**
   * Check if action is critical
   */
  isCriticalAction(action) {
    return this.criticalActions.has(action);
  }

  /**
   * Log to external SIEM system
   */
  async logToSIEM(log) {
    if (!this.siemEndpoint) {
      logger.warn('⚠️ SIEM endpoint not configured');
      return;
    }

    try {
      // Send to SIEM (example using fetch)
      const response = await fetch(this.siemEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SIEM_API_KEY}`,
        },
        body: JSON.stringify(log),
      });

      if (!response.ok) {
        throw new Error(`SIEM request failed: ${response.statusText}`);
      }

      logger.info('✅ Log sent to SIEM');
    } catch (error) {
      logger.error('❌ SIEM logging failed:', error.message);
      // Don't throw - SIEM failures should not affect main flow
    }
  }

  /**
   * Get audit trail for a resource
   */
  async getAuditTrail(resourceType, resourceId, options = {}) {
    const query = {
      'resource.type': resourceType,
      'resource.id': resourceId,
    };

    // Add time filter if provided
    if (options.from || options.to) {
      query.timestamp = {};
      if (options.from) {
        query.timestamp.$gte = new Date(options.from);
      }
      if (options.to) {
        query.timestamp.$lte = new Date(options.to);
      }
    }

    // Add action filter if provided
    if (options.actions && options.actions.length > 0) {
      query.action = { $in: options.actions };
    }

    // Add actor filter if provided
    if (options.actorId) {
      query['actor.userId'] = options.actorId;
    }

    const logs = await this.db
      .collection(this.collection)
      .find(query)
      .sort({ timestamp: -1 })
      .limit(options.limit || 100)
      .toArray();

    return logs;
  }

  /**
   * Get audit logs by actor
   */
  async getAuditLogsByActor(userId, options = {}) {
    const query = {
      'actor.userId': userId,
    };

    if (options.from || options.to) {
      query.timestamp = {};
      if (options.from) {
        query.timestamp.$gte = new Date(options.from);
      }
      if (options.to) {
        query.timestamp.$lte = new Date(options.to);
      }
    }

    const logs = await this.db
      .collection(this.collection)
      .find(query)
      .sort({ timestamp: -1 })
      .limit(options.limit || 100)
      .toArray();

    return logs;
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(filters = {}) {
    const query = {};

    // Filter by action
    if (filters.action) {
      query.action = filters.action;
    }

    // Filter by resource type
    if (filters.resourceType) {
      query['resource.type'] = filters.resourceType;
    }

    // Filter by result
    if (filters.result) {
      query.result = filters.result;
    }

    // Filter by actor role
    if (filters.role) {
      query['actor.role'] = filters.role;
    }

    // Time range
    if (filters.from || filters.to) {
      query.timestamp = {};
      if (filters.from) {
        query.timestamp.$gte = new Date(filters.from);
      }
      if (filters.to) {
        query.timestamp.$lte = new Date(filters.to);
      }
    }

    const logs = await this.db
      .collection(this.collection)
      .find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .toArray();

    return logs;
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(from, to) {
    const query = {
      timestamp: {
        $gte: from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: to || new Date(),
      },
    };

    const [totalLogs, successfulActions, failedActions, criticalActions, topActors, topActions] =
      await Promise.all([
        this.db.collection(this.collection).countDocuments(query),
        this.db.collection(this.collection).countDocuments({ ...query, result: 'success' }),
        this.db.collection(this.collection).countDocuments({ ...query, result: 'failure' }),
        this.db.collection(this.collection).countDocuments({
          ...query,
          action: { $in: Array.from(this.criticalActions) },
        }),
        this.db
          .collection(this.collection)
          .aggregate([
            { $match: query },
            {
              $group: { _id: '$actor.userId', count: { $sum: 1 }, name: { $first: '$actor.name' } },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ])
          .toArray(),
        this.db
          .collection(this.collection)
          .aggregate([
            { $match: query },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ])
          .toArray(),
      ]);

    return {
      totalLogs,
      successfulActions,
      failedActions,
      criticalActions,
      successRate: totalLogs > 0 ? ((successfulActions / totalLogs) * 100).toFixed(2) : 0,
      topActors: topActors.map(a => ({ userId: a._id, name: a.name, count: a.count })),
      topActions: topActions.map(a => ({ action: a._id, count: a.count })),
    };
  }

  /**
   * Get recent critical actions
   */
  async getRecentCriticalActions(limit = 20) {
    return await this.db
      .collection(this.collection)
      .find({
        action: { $in: Array.from(this.criticalActions) },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get failed actions requiring attention
   */
  async getFailedActions(limit = 50) {
    return await this.db
      .collection(this.collection)
      .find({ result: 'failure' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Create audit report
   */
  async createAuditReport(from, to) {
    const stats = await this.getAuditStats(from, to);
    const recentCritical = await this.getRecentCriticalActions(10);
    const recentFailures = await this.getFailedActions(10);

    return {
      period: {
        from,
        to,
      },
      statistics: stats,
      recentCriticalActions: recentCritical,
      recentFailures: recentFailures,
      generatedAt: new Date(),
    };
  }

  /**
   * Cleanup old audit logs (data retention)
   */
  async cleanupOldLogs(retentionDays = 365) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const result = await this.db.collection(this.collection).deleteMany({
      timestamp: { $lt: cutoffDate },
      action: { $nin: Array.from(this.criticalActions) }, // Keep critical actions
    });

    logger.info(`✅ Cleaned up ${result.deletedCount} old audit logs`);

    return result.deletedCount;
  }
}

module.exports = AuditService;

// Example usage
if (require.main === module) {
  const { MongoClient } = require('mongodb');

  const test = async function () {
    const client = await MongoClient.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_platform',
    );
    const db = client.db();

    const auditService = new AuditService(db, {
      collection: 'audit_logs',
      siemEnabled: false,
    });

    // Test logging
    await auditService.logAction(
      'application_submitted',
      {
        userId: 'USER-001',
        role: 'farmer',
        name: 'นายทดสอบ ระบบ',
        email: 'test@example.com',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
      {
        type: 'application',
        id: 'APP-2025-000001',
        before: null,
        after: { status: 'submitted', farmName: 'ฟาร์มทดสอบ' },
      },
      {
        reason: 'New application submitted',
        paymentId: 'PAY-001',
      },
    );

    // Test failure logging
    await auditService.logFailure(
      'payment_failed',
      {
        userId: 'USER-001',
        role: 'farmer',
        name: 'นายทดสอบ ระบบ',
        email: 'test@example.com',
        ip: '127.0.0.1',
      },
      {
        type: 'payment',
        id: 'PAY-002',
      },
      new Error('Insufficient funds'),
      {
        amount: 5000,
        currency: 'THB',
      },
    );

    // Get audit trail
    const trail = await auditService.getAuditTrail('application', 'APP-2025-000001');
    logger.info('Audit trail:', trail.length, 'entries');

    // Get statistics
    const stats = await auditService.getAuditStats(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
    );
    logger.info('Audit stats:', stats);

    // Get recent critical actions
    const critical = await auditService.getRecentCriticalActions(5);
    logger.info('Recent critical actions:', critical.length);

    await client.close();
  };

  test().catch(console.error);
}
