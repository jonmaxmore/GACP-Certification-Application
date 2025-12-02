/**
 * Health Monitoring API Routes
 * Complete system health monitoring endpoints
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-19
 */

const logger = require('../shared/logger');
const express = require('express');
const router = express.Router();
const dbHealthMonitor = require('../services/health-monitoring');

// Basic health check endpoint
router.get('/health', async (req, res) => {
  try {
    const healthStatus = dbHealthMonitor.getHealthStatus();

    const response = {
      success: true,
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      data: {
        database: {
          status: healthStatus.status,
          isHealthy: healthStatus.summary.isHealthy,
          responseTime: healthStatus.metrics.responseTime,
          successRate: healthStatus.summary.successRate,
        },
        api: {
          uptime: healthStatus.summary.uptime,
          version: process.env.API_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        },
        system: {
          memory: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version,
        },
      },
    };

    // Set appropriate HTTP status based on health
    const statusCode = healthStatus.summary.isHealthy ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      error: 'Health check failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed system health report
router.get('/health/detailed', async (req, res) => {
  try {
    const detailedHealth = dbHealthMonitor.getDetailedHealthReport();

    res.status(200).json({
      success: true,
      data: detailedHealth,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Detailed health check failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Database-specific health endpoint
router.get('/health/database', async (req, res) => {
  try {
    const healthStatus = dbHealthMonitor.getHealthStatus();

    res.status(200).json({
      success: true,
      data: {
        status: healthStatus.status,
        metrics: healthStatus.metrics,
        collections: healthStatus.metrics.collections,
        performance: healthStatus.metrics.performance,
        recentHistory: healthStatus.history,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Database health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Database health check failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Force database reconnection (admin endpoint)
router.post('/health/database/reconnect', async (req, res) => {
  try {
    logger.info('🔄 Manual database reconnection requested');
    const reconnected = await dbHealthMonitor.forceReconnection();

    if (reconnected) {
      res.status(200).json({
        success: true,
        message: 'Database reconnection successful',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Database reconnection failed',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Database reconnection error:', error);
    res.status(500).json({
      success: false,
      error: 'Database reconnection failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Performance metrics endpoint
router.get('/health/metrics', async (req, res) => {
  try {
    const healthStatus = dbHealthMonitor.getHealthStatus();

    res.status(200).json({
      success: true,
      data: {
        performance: healthStatus.metrics.performance,
        uptime: healthStatus.summary.uptime,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        connections: healthStatus.metrics.activeConnections,
        responseTime: {
          current: healthStatus.metrics.responseTime,
          average: healthStatus.metrics.performance.avgResponseTime,
          peak: healthStatus.metrics.performance.peakResponseTime,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance metrics',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health history endpoint
router.get('/health/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const healthStatus = dbHealthMonitor.getHealthStatus();

    res.status(200).json({
      success: true,
      data: {
        history: healthStatus.history.slice(0, limit),
        totalEntries: healthStatus.history.length,
        summary: healthStatus.summary,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Health history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health history',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// System status endpoint (comprehensive)
router.get('/status', async (req, res) => {
  try {
    const healthStatus = dbHealthMonitor.getHealthStatus();

    const systemStatus = {
      overall: healthStatus.summary.isHealthy ? 'operational' : 'degraded',
      services: {
        api: {
          status: 'operational',
          uptime: healthStatus.summary.uptime,
          version: process.env.API_VERSION || '1.0.0',
        },
        database: {
          status: healthStatus.status === 'healthy' ? 'operational' : 'degraded',
          responseTime: healthStatus.metrics.responseTime,
          successRate: healthStatus.summary.successRate,
        },
        gacpWorkflow: {
          status: 'operational', // This should be checked against actual service
          endpoints: 6,
        },
        authentication: {
          status: 'operational', // This should be checked against actual service
        },
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        region: process.env.AWS_REGION || 'local',
        version: process.env.API_VERSION || '1.0.0',
      },
    };

    const statusCode = systemStatus.overall === 'operational' ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      data: systemStatus,
    });
  } catch (error) {
    logger.error('System status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system status',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
