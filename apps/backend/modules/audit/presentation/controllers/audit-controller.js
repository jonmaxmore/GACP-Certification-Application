const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('audit-audit');

/**
 * Audit Controller
 *
 * HTTP request handlers for audit log operations.
 * DTAM staff only - farmers cannot access audit logs.
 *
 * @class AuditController
 */

class AuditController {
  constructor({
    getAuditLogDetailsUseCase,
    listAuditLogsUseCase,
    getAuditStatisticsUseCase,
    getUserActivityUseCase,
  }) {
    this.getAuditLogDetailsUseCase = getAuditLogDetailsUseCase;
    this.listAuditLogsUseCase = listAuditLogsUseCase;
    this.getAuditStatisticsUseCase = getAuditStatisticsUseCase;
    this.getUserActivityUseCase = getUserActivityUseCase;
  }

  /**
   * Get audit log details (DTAM)
   */
  async getAuditLogDetails(req, res) {
    try {
      const auditLogId = req.params.id;

      const auditLog = await this.getAuditLogDetailsUseCase.execute({ auditLogId });

      res.json({
        success: true,
        data: auditLog,
      });
    } catch (error) {
      if (error.message === 'Audit log not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      logger.error('Get audit log details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit log details',
      });
    }
  }

  /**
   * List audit logs (DTAM)
   */
  async listAuditLogs(req, res) {
    try {
      const filters = {
        actorType: req.query.actorType,
        actorId: req.query.actorId,
        actionType: req.query.actionType,
        entityType: req.query.entityType,
        entityId: req.query.entityId,
        severity: req.query.severity,
        success: req.query.success !== undefined ? req.query.success === 'true' : undefined,
        ipAddress: req.query.ipAddress,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        sort: req.query.sort || { timestamp: -1 },
      };

      const auditLogs = await this.listAuditLogsUseCase.execute({
        filters,
        options,
      });

      res.json({
        success: true,
        data: auditLogs,
        pagination: {
          page: options.page,
          limit: options.limit,
        },
      });
    } catch (error) {
      logger.error('List audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit logs',
      });
    }
  }

  /**
   * Get audit statistics (DTAM)
   */
  async getAuditStatistics(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const statistics = await this.getAuditStatisticsUseCase.execute({ filters });

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('Get audit statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit statistics',
      });
    }
  }

  /**
   * Get user activity (DTAM)
   */
  async getUserActivity(req, res) {
    try {
      const actorId = req.params.userId;
      const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      const endDate = req.query.endDate || new Date();

      const activity = await this.getUserActivityUseCase.execute({
        actorId,
        startDate,
        endDate,
      });

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      logger.error('Get user activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user activity',
      });
    }
  }
}

module.exports = AuditController;
