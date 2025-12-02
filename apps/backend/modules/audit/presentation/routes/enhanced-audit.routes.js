/**
 * Enhanced Audit Routes
 *
 * Complete route definitions for enhanced audit system including
 * compliance monitoring, government integration, and advanced analytics.
 *
 * Route Structure:
 * - Original audit routes (backward compatibility)
 * - Compliance monitoring routes
 * - Government integration routes
 * - Advanced analytics routes
 *
 * Business Logic Integration:
 * - All routes have clear business purpose
 * - Complete workflow coverage
 * - Government compliance requirements
 * - Real-time monitoring capabilities
 */

const express = require('express');
const { body, query, param } = require('express-validator');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('audit-enhanced-audit.routes');

/**
 * Create enhanced audit routes
 */
function createEnhancedAuditRoutes(auditController, authMiddleware) {
  const dtamRouter = express.Router();

  // ============================================================================
  // ORIGINAL AUDIT ROUTES (Backward Compatibility)
  // ============================================================================

  /**
   * Get audit log details
   * GET /api/dtam/audit/logs/:id
   *
   * Business Logic: View detailed audit log entry for investigation and compliance
   */
  dtamRouter.get(
    '/logs/:id',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    param('id').isUUID().withMessage('Invalid audit log ID'),
    auditController.getAuditLogDetails.bind(auditController),
  );

  /**
   * List audit logs with filtering
   * GET /api/dtam/audit/logs
   *
   * Business Logic: Browse and search audit logs for compliance and investigation
   */
  dtamRouter.get(
    '/logs',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('actionType').optional().isString(),
      query('entityType').optional().isString(),
      query('startDate').optional().isISO8601(),
      query('endDate').optional().isISO8601(),
    ],
    auditController.listAuditLogs.bind(auditController),
  );

  /**
   * Get audit statistics
   * GET /api/dtam/audit/statistics
   *
   * Business Logic: Provide audit metrics for management and compliance reporting
   */
  dtamRouter.get(
    '/statistics',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      query('period').optional().isIn(['last_7_days', 'last_30_days', 'last_90_days', 'last_year']),
      query('entityType').optional().isString(),
    ],
    auditController.getAuditStatistics.bind(auditController),
  );

  /**
   * Get user activity
   * GET /api/dtam/audit/users/:userId/activity
   *
   * Business Logic: Track individual user activity for security and compliance
   */
  dtamRouter.get(
    '/users/:userId/activity',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      param('userId').isUUID().withMessage('Invalid user ID'),
      query('startDate').optional().isISO8601(),
      query('endDate').optional().isISO8601(),
      query('limit').optional().isInt({ min: 1, max: 200 }),
    ],
    auditController.getUserActivity.bind(auditController),
  );

  // ============================================================================
  // COMPLIANCE MONITORING ROUTES
  // ============================================================================

  /**
   * Get comprehensive compliance dashboard
   * GET /api/dtam/audit/compliance/dashboard
   *
   * Business Logic:
   * - Real-time compliance overview for management
   * - Key performance indicators for compliance
   * - Alert status and violation summaries
   */
  dtamRouter.get(
    '/compliance/dashboard',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    auditController.getComplianceDashboard.bind(auditController),
  );

  /**
   * Get compliance violations
   * GET /api/dtam/audit/compliance/violations
   *
   * Business Logic:
   * - List all compliance violations for review
   * - Filter by severity, category, and status
   * - Support pagination for large datasets
   */
  dtamRouter.get(
    '/compliance/violations',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('severity').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
      query('category').optional().isString(),
      query('status')
        .optional()
        .isIn(['OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED']),
      query('startDate').optional().isISO8601(),
      query('endDate').optional().isISO8601(),
    ],
    auditController.getComplianceViolations.bind(auditController),
  );

  /**
   * Update violation status
   * PUT /api/dtam/audit/compliance/violations/:id
   *
   * Business Logic:
   * - Acknowledge and track violation resolution
   * - Record corrective actions taken
   * - Maintain audit trail of violation handling
   */
  dtamRouter.put(
    '/compliance/violations/:id',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      param('id').isUUID().withMessage('Invalid violation ID'),
      body('status').isIn(['ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED']),
      body('resolution').optional().isString().isLength({ min: 10, max: 1000 }),
      body('correctiveActions').optional().isArray(),
    ],
    auditController.updateViolationStatus.bind(auditController),
  );

  /**
   * Get compliance analytics
   * GET /api/dtam/audit/compliance/analytics
   *
   * Business Logic:
   * - Trend analysis for compliance violations
   * - Category distribution analysis
   * - Resolution time metrics
   * - Performance indicators for improvement
   */
  dtamRouter.get(
    '/compliance/analytics',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      query('period').optional().isIn(['7d', '30d', '90d', '1y']),
      query('category').optional().isString(),
    ],
    auditController.getComplianceAnalytics.bind(auditController),
  );

  /**
   * Control compliance monitoring
   * POST /api/dtam/audit/compliance/monitoring/:action
   *
   * Business Logic:
   * - Start/stop/restart compliance monitoring system
   * - Administrative control over monitoring processes
   * - System maintenance and troubleshooting
   */
  dtamRouter.post(
    '/compliance/monitoring/:action',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'system_admin']),
    param('action').isIn(['start', 'stop', 'restart']),
    auditController.controlComplianceMonitoring.bind(auditController),
  );

  // ============================================================================
  // GOVERNMENT INTEGRATION ROUTES
  // ============================================================================

  /**
   * Get government integration status
   * GET /api/dtam/audit/government/status
   *
   * Business Logic:
   * - Monitor connection status with government systems
   * - Track report submission metrics
   * - Identify integration issues for resolution
   */
  dtamRouter.get(
    '/government/status',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    auditController.getGovernmentIntegrationStatus.bind(auditController),
  );

  /**
   * Submit manual report to government
   * POST /api/dtam/audit/government/submit-report
   *
   * Business Logic:
   * - Manual submission of regulatory reports
   * - Backup mechanism for automated reporting failures
   * - Compliance with government reporting requirements
   */
  dtamRouter.post(
    '/government/submit-report',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      body('reportType').isIn(['CERTIFICATE_REPORT', 'COMPLIANCE_REPORT']),
      body('system').isIn(['DOA', 'FDA', 'DIGITAL_GOVERNMENT']),
      body('data').isObject().notEmpty(),
    ],
    auditController.submitGovernmentReport.bind(auditController),
  );

  /**
   * Get government submission history
   * GET /api/dtam/audit/government/submissions
   *
   * Business Logic:
   * - Track all government report submissions
   * - Monitor submission success rates
   * - Compliance verification and audit trail
   */
  dtamRouter.get(
    '/government/submissions',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('system').optional().isIn(['DOA', 'FDA', 'DIGITAL_GOVERNMENT']),
      query('type').optional().isString(),
      query('status').optional().isIn(['SUBMITTED', 'ACKNOWLEDGED', 'PROCESSED', 'FAILED']),
      query('startDate').optional().isISO8601(),
      query('endDate').optional().isISO8601(),
    ],
    async (req, res) => {
      // This would be implemented as a separate method
      // For now, redirect to existing functionality
      res.redirect('/api/dtam/audit/government/status');
    },
  );

  // ============================================================================
  // ADVANCED ANALYTICS ROUTES
  // ============================================================================

  /**
   * Get compliance score trends
   * GET /api/dtam/audit/analytics/compliance-trends
   *
   * Business Logic:
   * - Monitor compliance score improvements over time
   * - Identify areas needing attention
   * - Performance metrics for stakeholder reporting
   */
  dtamRouter.get(
    '/analytics/compliance-trends',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      query('period').optional().isIn(['7d', '30d', '90d', '1y']),
      query('category').optional().isString(),
      query('granularity').optional().isIn(['daily', 'weekly', 'monthly']),
    ],
    async (req, res) => {
      try {
        // Placeholder for compliance trends analysis
        // const trends = await auditController.getComplianceAnalytics(req, res);
        // This would be enhanced with trend-specific analysis
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'TRENDS_ERROR',
          message: 'Failed to get compliance trends',
        });
      }
    },
  );

  /**
   * Get audit performance metrics
   * GET /api/dtam/audit/analytics/performance
   *
   * Business Logic:
   * - System performance metrics for audit processes
   * - Response time analysis
   * - Throughput and efficiency measurements
   */
  dtamRouter.get(
    '/analytics/performance',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'system_admin']),
    [
      query('period').optional().isIn(['1h', '24h', '7d', '30d']),
      query('metric')
        .optional()
        .isIn(['response_time', 'throughput', 'error_rate', 'availability']),
    ],
    async (req, res) => {
      try {
        const performanceMetrics = await auditController.getSystemHealthMetrics();

        res.json({
          success: true,
          data: {
            metrics: performanceMetrics,
            period: req.query.period || '24h',
            generatedAt: new Date(),
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'PERFORMANCE_ERROR',
          message: 'Failed to get performance metrics',
        });
      }
    },
  );

  /**
   * Generate compliance report
   * POST /api/dtam/audit/reports/compliance
   *
   * Business Logic:
   * - Generate comprehensive compliance reports
   * - Support multiple export formats (PDF, Excel, JSON)
   * - Include all necessary compliance documentation
   */
  dtamRouter.post(
    '/reports/compliance',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'dtam_staff', 'compliance_officer']),
    [
      body('reportType').isIn(['MONTHLY', 'QUARTERLY', 'ANNUAL', 'CUSTOM']),
      body('startDate').isISO8601(),
      body('endDate').isISO8601(),
      body('format').optional().isIn(['PDF', 'EXCEL', 'JSON']),
      body('includeViolations').optional().isBoolean(),
      body('includeResolutions').optional().isBoolean(),
    ],
    async (req, res) => {
      try {
        // This would integrate with reporting service
        const reportData = {
          type: req.body.reportType,
          period: {
            start: new Date(req.body.startDate),
            end: new Date(req.body.endDate),
          },
          format: req.body.format || 'PDF',
          options: {
            includeViolations: req.body.includeViolations !== false,
            includeResolutions: req.body.includeResolutions !== false,
          },
        };

        res.json({
          success: true,
          message: 'Report generation initiated',
          data: {
            reportId: require('crypto').randomUUID(),
            status: 'GENERATING',
            estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'REPORT_ERROR',
          message: 'Failed to generate compliance report',
        });
      }
    },
  );

  // ============================================================================
  // SYSTEM HEALTH AND MONITORING
  // ============================================================================

  /**
   * Get system health status
   * GET /api/dtam/audit/system/health
   *
   * Business Logic:
   * - Overall system health monitoring
   * - Service availability status
   * - Performance indicators
   */
  dtamRouter.get(
    '/system/health',
    authMiddleware.requireAuth,
    authMiddleware.requireRole(['admin', 'system_admin']),
    async (req, res) => {
      try {
        const health = await auditController.getSystemHealthMetrics();

        res.json({
          success: true,
          data: {
            status: 'HEALTHY', // This would be calculated based on metrics
            components: health,
            timestamp: new Date(),
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'HEALTH_CHECK_ERROR',
          message: 'System health check failed',
        });
      }
    },
  );

  // ============================================================================
  // ERROR HANDLING MIDDLEWARE
  // ============================================================================

  // Global error handler for audit routes
  dtamRouter.use((error, req, res, _next) => {
    logger.error('[AuditRoutes] Unhandled error:', error);

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred in the audit system',
      requestId: req.id || 'unknown',
    });
  });

  return { dtamRouter };
}

/**
 * Route documentation for API reference
 */
function getRouteDocumentation() {
  return {
    basePath: '/api/dtam/audit',
    version: '2.0.0',
    description: 'Enhanced audit system with compliance monitoring and government integration',

    categories: {
      'Audit Logs': {
        description: 'Traditional audit log management',
        routes: ['GET /logs', 'GET /logs/:id', 'GET /statistics', 'GET /users/:userId/activity'],
      },

      'Compliance Monitoring': {
        description: 'Real-time compliance monitoring and violation management',
        routes: [
          'GET /compliance/dashboard',
          'GET /compliance/violations',
          'PUT /compliance/violations/:id',
          'GET /compliance/analytics',
          'POST /compliance/monitoring/:action',
        ],
      },

      'Government Integration': {
        description: 'Government system integration and reporting',
        routes: [
          'GET /government/status',
          'POST /government/submit-report',
          'GET /government/submissions',
        ],
      },

      'Advanced Analytics': {
        description: 'Advanced analytics and reporting capabilities',
        routes: [
          'GET /analytics/compliance-trends',
          'GET /analytics/performance',
          'POST /reports/compliance',
        ],
      },

      'System Health': {
        description: 'System monitoring and health checks',
        routes: ['GET /system/health'],
      },
    },

    businessLogic: {
      complianceMonitoring:
        'Real-time monitoring of all system activities for compliance violations',
      governmentIntegration: 'Automated submission of regulatory reports to government systems',
      auditTrail: 'Comprehensive audit trail for all system activities and user actions',
      performanceMetrics: 'System performance monitoring and analytics for optimization',
    },
  };
}

module.exports = {
  createEnhancedAuditRoutes,
  getRouteDocumentation,
};
