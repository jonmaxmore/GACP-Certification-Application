/**
 * Queue Monitoring Controller
 * Provides queue statistics and management endpoints
 */

const queueService = require('../services/queue/queueService');
const logger = require('../utils/logger');

/**
 * Get queue statistics
 */
exports.getQueueStats = async (req, res) => {
  try {
    const stats = await queueService.getQueueStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve queue statistics',
      error: error.message,
    });
  }
};

/**
 * Clean old jobs from queues
 */
exports.cleanOldJobs = async (req, res) => {
  try {
    await queueService.cleanOldJobs();

    res.json({
      success: true,
      message: 'Old jobs cleaned successfully',
    });
  } catch (error) {
    logger.error('Failed to clean old jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean old jobs',
      error: error.message,
    });
  }
};

/**
 * Pause all queues
 */
exports.pauseQueues = async (req, res) => {
  try {
    await queueService.pauseAll();

    res.json({
      success: true,
      message: 'All queues paused',
    });
  } catch (error) {
    logger.error('Failed to pause queues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause queues',
      error: error.message,
    });
  }
};

/**
 * Resume all queues
 */
exports.resumeQueues = async (req, res) => {
  try {
    await queueService.resumeAll();

    res.json({
      success: true,
      message: 'All queues resumed',
    });
  } catch (error) {
    logger.error('Failed to resume queues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume queues',
      error: error.message,
    });
  }
};

/**
 * Get queue health check
 */
exports.healthCheck = async (req, res) => {
  try {
    const stats = await queueService.getQueueStats();

    // Check if any queue has too many failed jobs
    const alerts = [];

    if (stats.aiQc.failed > 10) {
      alerts.push({
        queue: 'AI QC',
        severity: 'warning',
        message: `${stats.aiQc.failed} failed jobs`,
      });
    }

    if (stats.aiQc.waiting > 50) {
      alerts.push({
        queue: 'AI QC',
        severity: 'warning',
        message: `${stats.aiQc.waiting} jobs waiting`,
      });
    }

    const isHealthy = alerts.length === 0;

    res.json({
      success: true,
      healthy: isHealthy,
      stats,
      alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Queue health check failed:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
};
