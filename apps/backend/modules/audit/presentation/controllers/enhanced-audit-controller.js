const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('audit-EnhancedAuditController');

/**
 * Enhanced Audit Controller
 *
 * Complete audit management system with compliance monitoring,
 * government integration, and advanced analytics.
 *
 * Features:
 * - Traditional audit log management
 * - Real-time compliance monitoring
 * - Government integration status
 * - Compliance dashboard
 * - Advanced audit analytics
 * - Complete audit trail management
 * - Violation management system
 */

class EnhancedAuditController {
  constructor(dependencies = {}) {
    // Original audit services
    this.getAuditLogDetailsUseCase = dependencies.getAuditLogDetailsUseCase;
    this.listAuditLogsUseCase = dependencies.listAuditLogsUseCase;
    this.getAuditStatisticsUseCase = dependencies.getAuditStatisticsUseCase;
    this.getUserActivityUseCase = dependencies.getUserActivityUseCase;

    // Enhanced services
    this.complianceMonitoringSystem = dependencies.complianceMonitoringSystem;
    this.governmentIntegrationService = dependencies.governmentIntegrationService;
    this.auditService = dependencies.auditService;
  }

  /**
   * Get comprehensive compliance dashboard
   * GET /api/dtam/audit/compliance/dashboard
   */
  async getComplianceDashboard(req, res) {
    try {
      logger.info('[EnhancedAuditController] Getting compliance dashboard...');

      // Get compliance monitoring data
      const complianceDashboard = await this.complianceMonitoringSystem.getComplianceDashboard();

      // Get government integration status
      const governmentStatus = this.governmentIntegrationService.getIntegrationStatus();

      // Get recent audit statistics
      const auditStats = await this.getAuditStatisticsUseCase.execute({
        period: 'last_30_days',
      });

      // Compile dashboard data
      const dashboardData = {
        compliance: {
          overallScore: complianceDashboard.summary.overallComplianceScore,
          totalViolations: complianceDashboard.summary.totalViolations,
          openViolations: complianceDashboard.summary.openViolations,
          criticalViolations: complianceDashboard.summary.criticalViolations,
          recentViolations: complianceDashboard.recentViolations.slice(0, 5),
          trends: complianceDashboard.violationTrends,
        },

        government: {
          authenticatedSystems: governmentStatus.authenticatedSystems,
          reportsSubmitted: governmentStatus.metrics.reportsSubmitted,
          successRate:
            (governmentStatus.metrics.successfulSubmissions /
              (governmentStatus.metrics.successfulSubmissions +
                governmentStatus.metrics.failedSubmissions)) *
            100,
          lastSubmission: governmentStatus.lastUpdate,
        },

        audit: {
          totalLogs: auditStats.totalLogs,
          criticalActions: auditStats.criticalActions,
          systemEvents: auditStats.systemEvents,
          userActivities: auditStats.userActivities,
        },

        performance: {
          monitoringStatus: this.complianceMonitoringSystem.getMonitoringStatus(),
          systemHealth: await this.getSystemHealthMetrics(),
        },

        generatedAt: new Date(),
      };

      res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'DASHBOARD_ERROR',
        message: 'Failed to load compliance dashboard',
      });
    }
  }

  /**
   * Get real-time compliance violations
   * GET /api/dtam/audit/compliance/violations
   */
  async getComplianceViolations(req, res) {
    try {
      const { page = 1, limit = 20, severity, category, status, startDate, endDate } = req.query;

      const filters = {};

      if (severity) {
        filters.severity = severity;
      }
      if (category) {
        filters.category = category;
      }
      if (status) {
        filters.status = status;
      }

      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) {
          filters.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          filters.createdAt.$lte = new Date(endDate);
        }
      }

      // Get violations from database
      const violations = await this.complianceMonitoringSystem.database
        .collection('compliance_violations')
        .find(filters)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .toArray();

      const totalViolations = await this.complianceMonitoringSystem.database
        .collection('compliance_violations')
        .countDocuments(filters);

      res.json({
        success: true,
        data: {
          violations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalViolations,
            pages: Math.ceil(totalViolations / limit),
          },
        },
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Violations error:', error);
      res.status(500).json({
        success: false,
        error: 'VIOLATIONS_ERROR',
        message: 'Failed to fetch compliance violations',
      });
    }
  }

  /**
   * Update violation status (resolve/acknowledge)
   * PUT /api/dtam/audit/compliance/violations/:id
   */
  async updateViolationStatus(req, res) {
    try {
      const violationId = req.params.id;
      const { status, resolution, correctiveActions } = req.body;
      const userId = req.userId;

      // Validate status
      const validStatuses = ['ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STATUS',
          message: 'Invalid violation status',
        });
      }

      // Update violation
      const updateData = {
        status,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      if (resolution) {
        updateData.resolution = resolution;
      }
      if (correctiveActions) {
        updateData.correctiveActions = correctiveActions;
      }
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }

      await this.complianceMonitoringSystem.database
        .collection('compliance_violations')
        .updateOne({ id: violationId }, { $set: updateData });

      // Log audit entry
      await this.auditService.logAction(
        'COMPLIANCE_VIOLATION_UPDATED',
        { userId, role: req.userRole },
        'compliance_violation',
        violationId,
        {
          previousStatus: req.body.previousStatus,
          newStatus: status,
          resolution,
        },
      );

      res.json({
        success: true,
        message: 'Violation status updated successfully',
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Update violation error:', error);
      res.status(500).json({
        success: false,
        error: 'UPDATE_ERROR',
        message: 'Failed to update violation status',
      });
    }
  }

  /**
   * Get government integration status
   * GET /api/dtam/audit/government/status
   */
  async getGovernmentIntegrationStatus(req, res) {
    try {
      const status = this.governmentIntegrationService.getIntegrationStatus();

      // Get recent submissions
      const recentSubmissions = await this.complianceMonitoringSystem.database
        .collection('government_submissions')
        .find({})
        .sort({ submittedAt: -1 })
        .limit(10)
        .toArray();

      res.json({
        success: true,
        data: {
          ...status,
          recentSubmissions,
        },
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Government status error:', error);
      res.status(500).json({
        success: false,
        error: 'GOVERNMENT_STATUS_ERROR',
        message: 'Failed to get government integration status',
      });
    }
  }

  /**
   * Submit manual report to government
   * POST /api/dtam/audit/government/submit-report
   */
  async submitGovernmentReport(req, res) {
    try {
      const { reportType, system, data } = req.body;
      const userId = req.userId;

      let response;

      switch (reportType) {
        case 'CERTIFICATE_REPORT':
          response = await this.governmentIntegrationService.submitCertificateReport(data);
          break;

        case 'COMPLIANCE_REPORT':
          response = await this.governmentIntegrationService.submitComplianceReport(data);
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'INVALID_REPORT_TYPE',
            message: 'Invalid report type',
          });
      }

      // Log manual submission
      await this.auditService.logAction(
        'MANUAL_GOVERNMENT_REPORT_SUBMITTED',
        { userId, role: req.userRole },
        'government_report',
        response.submission_id,
        {
          reportType,
          system,
          submissionId: response.submission_id,
        },
      );

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Report submission error:', error);
      res.status(500).json({
        success: false,
        error: 'SUBMISSION_ERROR',
        message: 'Failed to submit report to government',
      });
    }
  }

  /**
   * Get compliance analytics
   * GET /api/dtam/audit/compliance/analytics
   */
  async getComplianceAnalytics(req, res) {
    try {
      const { period = '30d', category } = req.query;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      // Get analytics data
      const analytics = await this.generateComplianceAnalytics(startDate, endDate, category);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'ANALYTICS_ERROR',
        message: 'Failed to generate compliance analytics',
      });
    }
  }

  /**
   * Start/stop compliance monitoring
   * POST /api/dtam/audit/compliance/monitoring/:action
   */
  async controlComplianceMonitoring(req, res) {
    try {
      const { action } = req.params;
      const userId = req.userId;

      let result;

      switch (action) {
        case 'start':
          result = await this.complianceMonitoringSystem.startMonitoring();
          break;

        case 'stop':
          result = await this.complianceMonitoringSystem.stopMonitoring();
          break;

        case 'restart':
          await this.complianceMonitoringSystem.stopMonitoring();
          result = await this.complianceMonitoringSystem.startMonitoring();
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'INVALID_ACTION',
            message: 'Invalid monitoring action',
          });
      }

      // Log action
      await this.auditService.logAction(
        'COMPLIANCE_MONITORING_CONTROLLED',
        { userId, role: req.userRole },
        'compliance_monitoring',
        'system',
        { action },
      );

      res.json({
        success: true,
        message: `Compliance monitoring ${action}ed successfully`,
        data: result,
      });
    } catch (error) {
      const { action } = req.params;
      logger.error('[EnhancedAuditController] Monitoring control error:', error);
      res.status(500).json({
        success: false,
        error: 'MONITORING_ERROR',
        message: `Failed to ${action} compliance monitoring`,
      });
    }
  }

  /**
   * Generate compliance analytics
   */
  async generateComplianceAnalytics(startDate, endDate, category) {
    const filters = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (category) {
      filters.category = category;
    }

    // Violation trends
    const violationTrends = await this.complianceMonitoringSystem.database
      .collection('compliance_violations')
      .aggregate([
        { $match: filters },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              severity: '$severity',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ])
      .toArray();

    // Category distribution
    const categoryDistribution = await this.complianceMonitoringSystem.database
      .collection('compliance_violations')
      .aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Resolution time analysis
    const resolutionTimes = await this.complianceMonitoringSystem.database
      .collection('compliance_violations')
      .aggregate([
        {
          $match: {
            ...filters,
            status: 'RESOLVED',
            resolvedAt: { $exists: true },
          },
        },
        {
          $project: {
            resolutionTime: {
              $subtract: ['$resolvedAt', '$createdAt'],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgResolutionTime: { $avg: '$resolutionTime' },
            minResolutionTime: { $min: '$resolutionTime' },
            maxResolutionTime: { $max: '$resolutionTime' },
          },
        },
      ])
      .toArray();

    return {
      violationTrends,
      categoryDistribution,
      resolutionTimes: resolutionTimes[0] || null,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics() {
    return {
      complianceMonitoring: this.complianceMonitoringSystem.getMonitoringStatus(),
      governmentIntegration: this.governmentIntegrationService.getIntegrationStatus(),
      lastHealthCheck: new Date(),
    };
  }

  // Include all original audit controller methods
  async getAuditLogDetails(req, res) {
    try {
      const auditLogId = req.params.id;
      const auditLog = await this.getAuditLogDetailsUseCase.execute({ auditLogId });

      res.json({
        success: true,
        data: auditLog,
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Get audit log error:', error);
      res.status(500).json({
        success: false,
        error: 'AUDIT_LOG_ERROR',
        message: 'Failed to get audit log details',
      });
    }
  }

  async listAuditLogs(req, res) {
    try {
      const criteria = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        actionType: req.query.actionType,
        entityType: req.query.entityType,
        actorId: req.query.actorId,
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
      };

      const result = await this.listAuditLogsUseCase.execute(criteria);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] List audit logs error:', error);
      res.status(500).json({
        success: false,
        error: 'LIST_AUDIT_LOGS_ERROR',
        message: 'Failed to list audit logs',
      });
    }
  }

  async getAuditStatistics(req, res) {
    try {
      const criteria = {
        period: req.query.period || 'last_30_days',
        entityType: req.query.entityType,
      };

      const statistics = await this.getAuditStatisticsUseCase.execute(criteria);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'STATISTICS_ERROR',
        message: 'Failed to get audit statistics',
      });
    }
  }

  async getUserActivity(req, res) {
    try {
      const userId = req.params.userId;
      const criteria = {
        userId,
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        limit: parseInt(req.query.limit) || 50,
      };

      const activity = await this.getUserActivityUseCase.execute(criteria);

      res.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      logger.error('[EnhancedAuditController] Get user activity error:', error);
      res.status(500).json({
        success: false,
        error: 'USER_ACTIVITY_ERROR',
        message: 'Failed to get user activity',
      });
    }
  }
}

module.exports = EnhancedAuditController;
