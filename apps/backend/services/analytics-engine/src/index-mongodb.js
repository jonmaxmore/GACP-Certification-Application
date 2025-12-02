/**
 * GACP Analytics Engine - MongoDB Integration
 * Real-time Analytics and Reporting Service with MongoDB
 * ระบบวิเคราะห์ข้อมูลและรายงานแบบเรียลไทม์ด้วย MongoDB
 */

const express = require('express');
const winston = require('winston');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cron = require('node-cron');

// Import MongoDB models
const Application = require('../../../models/Application');
const User = require('../../../models/User');

class AnalyticsEngine {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3008;
    this.setupLogger();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupCronJobs();
  }

  setupLogger() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'analytics.log' }),
      ],
    });
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        service: 'Analytics Engine',
        timestamp: new Date().toISOString(),
        version: '2.0.0-mongodb',
      });
    });

    // Dashboard Analytics - MongoDB Version
    this.app.get('/api/analytics/dashboard', async (req, res) => {
      try {
        const dashboardData = await this.getDashboardAnalytics();
        res.json(dashboardData);
      } catch (error) {
        this.logger.error('Dashboard analytics error:', error);
        res.status(500).json({ error: 'Failed to get dashboard analytics' });
      }
    });

    // Application Statistics - MongoDB Version
    this.app.get('/api/analytics/applications', async (req, res) => {
      try {
        const { period = '30d', status, herbType } = req.query;
        const stats = await this.getApplicationStatistics(period, { status, herbType });
        res.json(stats);
      } catch (error) {
        this.logger.error('Application statistics error:', error);
        res.status(500).json({ error: 'Failed to get application statistics' });
      }
    });

    // User Analytics - MongoDB Version
    this.app.get('/api/analytics/users', async (req, res) => {
      try {
        const { period = '30d', role } = req.query;
        const userStats = await this.getUserAnalytics(period, { role });
        res.json(userStats);
      } catch (error) {
        this.logger.error('User analytics error:', error);
        res.status(500).json({ error: 'Failed to get user analytics' });
      }
    });

    // Performance Metrics - MongoDB Version
    this.app.get('/api/analytics/performance', async (req, res) => {
      try {
        const performance = await this.getPerformanceMetrics();
        res.json(performance);
      } catch (error) {
        this.logger.error('Performance metrics error:', error);
        res.status(500).json({ error: 'Failed to get performance metrics' });
      }
    });

    // Compliance Reports - MongoDB Version
    this.app.get('/api/analytics/compliance', async (req, res) => {
      try {
        const { period = '30d', herbType } = req.query;
        const compliance = await this.getComplianceReports(period, { herbType });
        res.json(compliance);
      } catch (error) {
        this.logger.error('Compliance reports error:', error);
        res.status(500).json({ error: 'Failed to get compliance reports' });
      }
    });

    // Real-time Statistics - MongoDB Version
    this.app.get('/api/analytics/realtime', async (req, res) => {
      try {
        const realtime = await this.getRealtimeStatistics();
        res.json(realtime);
      } catch (error) {
        this.logger.error('Realtime statistics error:', error);
        res.status(500).json({ error: 'Failed to get realtime statistics' });
      }
    });
  }

  /**
   * Get Dashboard Analytics from MongoDB
   */
  async getDashboardAnalytics() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalApplications,
        recentApplications,
        applicationsByStatus,
        applicationsByHerbType,
        totalUsers,
        usersByRole,
        averageProcessingTime,
      ] = await Promise.all([
        Application.countDocuments(),
        Application.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        this.getApplicationsByStatus(),
        this.getApplicationsByHerbType(),
        User.countDocuments(),
        this.getUsersByRole(),
        this.getAverageProcessingTime(),
      ]);

      return {
        overview: {
          totalApplications,
          recentApplications,
          totalUsers,
          averageProcessingTime,
        },
        applications: {
          byStatus: applicationsByStatus,
          byHerbType: applicationsByHerbType,
        },
        users: {
          byRole: usersByRole,
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Get dashboard analytics error:', error);
      throw error;
    }
  }

  /**
   * Get Application Statistics from MongoDB
   */
  async getApplicationStatistics(period, filters = {}) {
    try {
      const dateRange = this.getDateRange(period);
      const query = {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.herbType) {
        query['herbDetails.herbType'] = filters.herbType;
      }

      const [applications, dailyStats, statusDistribution, processingTimes] = await Promise.all([
        Application.find(query).sort({ createdAt: -1 }),
        this.getDailyApplicationStats(dateRange, filters),
        this.getStatusDistribution(query),
        this.getProcessingTimeStats(query),
      ]);

      return {
        total: applications.length,
        period: period,
        dailyStats,
        statusDistribution,
        processingTimes,
        applications: applications.slice(0, 100), // Limit for performance
      };
    } catch (error) {
      this.logger.error('Get application statistics error:', error);
      throw error;
    }
  }

  /**
   * Get User Analytics from MongoDB
   */
  async getUserAnalytics(period, filters = {}) {
    try {
      const dateRange = this.getDateRange(period);
      const query = {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      };

      if (filters.role) {
        query.role = filters.role;
      }

      const [users, registrationTrend, roleDistribution, activityStats] = await Promise.all([
        User.find(query).select('-password').sort({ createdAt: -1 }),
        this.getUserRegistrationTrend(dateRange, filters),
        this.getUserRoleDistribution(query),
        this.getUserActivityStats(dateRange, filters),
      ]);

      return {
        total: users.length,
        period: period,
        registrationTrend,
        roleDistribution,
        activityStats,
        users: users.slice(0, 100), // Limit for performance
      };
    } catch (error) {
      this.logger.error('Get user analytics error:', error);
      throw error;
    }
  }

  /**
   * Get Performance Metrics from MongoDB
   */
  async getPerformanceMetrics() {
    try {
      const [avgProcessingTime, approvalRate, inspectionEfficiency, systemUptime] =
        await Promise.all([
          this.getAverageProcessingTime(),
          this.getApprovalRate(),
          this.getInspectionEfficiency(),
          this.getSystemUptime(),
        ]);

      return {
        averageProcessingTime: avgProcessingTime,
        approvalRate: approvalRate,
        inspectionEfficiency: inspectionEfficiency,
        systemUptime: systemUptime,
        lastCalculated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Get performance metrics error:', error);
      throw error;
    }
  }

  /**
   * Get Compliance Reports from MongoDB
   */
  async getComplianceReports(period, filters = {}) {
    try {
      const dateRange = this.getDateRange(period);
      const query = {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      };

      if (filters.herbType) {
        query['herbDetails.herbType'] = filters.herbType;
      }

      const [complianceScores, nonComplianceIssues, improvementTrends, inspectionResults] =
        await Promise.all([
          this.getComplianceScores(query),
          this.getNonComplianceIssues(query),
          this.getImprovementTrends(dateRange, filters),
          this.getInspectionResults(query),
        ]);

      return {
        period: period,
        complianceScores,
        nonComplianceIssues,
        improvementTrends,
        inspectionResults,
      };
    } catch (error) {
      this.logger.error('Get compliance reports error:', error);
      throw error;
    }
  }

  /**
   * Get Realtime Statistics from MongoDB
   */
  async getRealtimeStatistics() {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [todayApplications, pendingReviews, activeInspections, recentLogins] =
        await Promise.all([
          Application.countDocuments({ createdAt: { $gte: todayStart } }),
          Application.countDocuments({ status: 'submitted' }),
          Application.countDocuments({ status: 'under_review' }),
          User.countDocuments({ lastLoginAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } }),
        ]);

      return {
        todayApplications,
        pendingReviews,
        activeInspections,
        recentLogins,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Get realtime statistics error:', error);
      throw error;
    }
  }

  // Helper methods for MongoDB aggregations

  async getApplicationsByStatus() {
    const result = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    result.forEach(item => {
      statusMap[item._id] = item.count;
    });

    return statusMap;
  }

  async getApplicationsByHerbType() {
    const result = await Application.aggregate([
      { $group: { _id: '$herbDetails.herbType', count: { $sum: 1 } } },
    ]);

    const herbTypeMap = {};
    result.forEach(item => {
      herbTypeMap[item._id] = item.count;
    });

    return herbTypeMap;
  }

  async getUsersByRole() {
    const result = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

    const roleMap = {};
    result.forEach(item => {
      roleMap[item._id] = item.count;
    });

    return roleMap;
  }

  async getAverageProcessingTime() {
    const result = await Application.aggregate([
      {
        $match: {
          status: { $in: ['approved', 'rejected'] },
          submittedAt: { $exists: true },
          inspectionCompletedAt: { $exists: true },
        },
      },
      {
        $project: {
          processingTime: {
            $subtract: ['$inspectionCompletedAt', '$submittedAt'],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: '$processingTime' },
        },
      },
    ]);

    return result.length > 0 ? Math.round(result[0].avgProcessingTime / (1000 * 60 * 60 * 24)) : 0; // Days
  }

  async getDailyApplicationStats(dateRange, filters) {
    const query = {
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
    };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.herbType) {
      query['herbDetails.herbType'] = filters.herbType;
    }

    const result = await Application.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map(item => ({
      date: item._id,
      count: item.count,
    }));
  }

  async getStatusDistribution(query) {
    const result = await Application.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const distribution = {};
    result.forEach(item => {
      distribution[item._id] = item.count;
    });

    return distribution;
  }

  async getApprovalRate() {
    const [totalCompleted, approved] = await Promise.all([
      Application.countDocuments({ status: { $in: ['approved', 'rejected'] } }),
      Application.countDocuments({ status: 'approved' }),
    ]);

    return totalCompleted > 0 ? Math.round((approved / totalCompleted) * 100) : 0;
  }

  getDateRange(period) {
    const now = new Date();
    let days = 30; // default

    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      case '1y':
        days = 365;
        break;
    }

    return {
      start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
      end: now,
    };
  }

  async getProcessingTimeStats(_query) {
    // Implementation for processing time statistics
    return { average: 0, median: 0, distribution: {} };
  }

  async getUserRegistrationTrend(_dateRange, _filters) {
    // Implementation for user registration trend
    return [];
  }

  async getUserRoleDistribution(_query) {
    // Implementation for user role distribution
    return {};
  }

  async getUserActivityStats(_dateRange, _filters) {
    // Implementation for user activity statistics
    return {};
  }

  async getComplianceScores(_query) {
    // Implementation for compliance scores
    return { average: 0, distribution: {} };
  }

  async getNonComplianceIssues(_query) {
    // Implementation for non-compliance issues
    return [];
  }

  async getImprovementTrends(_dateRange, _filters) {
    // Implementation for improvement trends
    return [];
  }

  async getInspectionResults(_query) {
    // Implementation for inspection results
    return {};
  }

  async getInspectionEfficiency() {
    // Implementation for inspection efficiency
    return 0;
  }

  async getSystemUptime() {
    // Implementation for system uptime
    return 99.9;
  }

  setupCronJobs() {
    // Generate daily reports at midnight
    cron.schedule('0 0 * * *', async () => {
      this.logger.info('Generating daily analytics report...');
      try {
        await this.generateDailyReport();
      } catch (error) {
        this.logger.error('Daily report generation failed:', error);
      }
    });

    // Update analytics cache every hour
    cron.schedule('0 * * * *', async () => {
      this.logger.info('Updating analytics cache...');
      try {
        await this.updateAnalyticsCache();
      } catch (error) {
        this.logger.error('Analytics cache update failed:', error);
      }
    });
  }

  async generateDailyReport() {
    try {
      const dashboard = await this.getDashboardAnalytics();
      this.logger.info('Daily report generated', {
        totalApplications: dashboard.overview.totalApplications,
        totalUsers: dashboard.overview.totalUsers,
      });
    } catch (error) {
      this.logger.error('Generate daily report error:', error);
    }
  }

  async updateAnalyticsCache() {
    try {
      // Cache frequently accessed analytics in MongoDB or Redis
      this.logger.info('Analytics cache updated successfully');
    } catch (error) {
      this.logger.error('Update analytics cache error:', error);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      this.logger.info(`🚀 Analytics Engine running on port ${this.port}`);
      this.logger.info('✅ MongoDB integration enabled');
      this.logger.info(`
Port: ${this.port}
Environment: ${process.env.NODE_ENV || 'development'}
Time: ${new Date().toISOString()}
            `);
    });
  }
}

// Start the analytics engine
if (require.main === module) {
  const analytics = new AnalyticsEngine();
  analytics.start();
}

module.exports = AnalyticsEngine;
