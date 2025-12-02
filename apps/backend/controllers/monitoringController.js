/**
 * Monitoring Controller
 *
 * API endpoints for metrics retrieval and system monitoring
 * Admin-only access with real-time data streaming support
 */

const metricsService = require('../services/monitoring/metricsService');

/**
 * Get current metrics
 *
 * @route GET /api/monitoring/metrics
 * @access Admin only
 * @query {string} timeWindow - realtime|short|medium|long (default: realtime)
 */
exports.getMetrics = async (req, res) => {
  try {
    const { timeWindow = 'realtime' } = req.query;

    const validWindows = ['realtime', 'short', 'medium', 'long'];
    if (!validWindows.includes(timeWindow)) {
      return res.status(400).json({
        success: false,
        error: `Invalid time window. Use: ${validWindows.join(', ')}`,
      });
    }

    const metrics = metricsService.getMetrics(timeWindow);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
    });
  }
};

/**
 * Get health status
 *
 * @route GET /api/monitoring/health
 * @access Admin only
 */
exports.getHealth = async (req, res) => {
  try {
    const health = await metricsService.getHealthStatus();

    const statusCode = health.status === 'critical' ? 503 : 200;

    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('Error getting health status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve health status',
    });
  }
};

/**
 * Get system metrics (CPU, memory, disk)
 *
 * @route GET /api/monitoring/system
 * @access Admin only
 */
exports.getSystemMetrics = async (req, res) => {
  try {
    const { timeWindow = 'short' } = req.query;
    const metrics = metricsService.getMetrics(timeWindow);

    res.json({
      success: true,
      data: {
        cpu: metrics.system.cpu,
        memory: metrics.system.memory,
        disk: metrics.system.disk,
        uptime: metrics.system.uptime,
        timestamp: metrics.timestamp,
      },
    });
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve system metrics',
    });
  }
};

/**
 * Get database metrics
 *
 * @route GET /api/monitoring/database
 * @access Admin only
 */
exports.getDatabaseMetrics = async (req, res) => {
  try {
    const { timeWindow = 'short' } = req.query;
    const metrics = metricsService.getMetrics(timeWindow);
    const poolMetrics = await metricsService.getConnectionPoolMetrics();

    res.json({
      success: true,
      data: {
        queryTime: metrics.database.queryTime,
        slowQueries: metrics.database.slowQueries,
        operations: metrics.database.operations,
        connectionPool: poolMetrics,
        timestamp: metrics.timestamp,
      },
    });
  } catch (error) {
    console.error('Error getting database metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve database metrics',
    });
  }
};

/**
 * Get cache metrics (Redis)
 *
 * @route GET /api/monitoring/cache
 * @access Admin only
 */
exports.getCacheMetrics = async (req, res) => {
  try {
    const { timeWindow = 'short' } = req.query;
    const metrics = metricsService.getMetrics(timeWindow);

    res.json({
      success: true,
      data: {
        hits: metrics.cache.hits,
        misses: metrics.cache.misses,
        hitRate: metrics.cache.hitRate,
        recent: metrics.cache.recent,
        timestamp: metrics.timestamp,
      },
    });
  } catch (error) {
    console.error('Error getting cache metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache metrics',
    });
  }
};

/**
 * Get queue metrics (Bull)
 *
 * @route GET /api/monitoring/queue
 * @access Admin only
 */
exports.getQueueMetrics = async (req, res) => {
  try {
    const metrics = metricsService.getMetrics('short');

    res.json({
      success: true,
      data: {
        jobs: metrics.queue.jobs,
        throughput: metrics.queue.throughput,
        timestamp: metrics.timestamp,
      },
    });
  } catch (error) {
    console.error('Error getting queue metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve queue metrics',
    });
  }
};

/**
 * Get API metrics
 *
 * @route GET /api/monitoring/api
 * @access Admin only
 */
exports.getAPIMetrics = async (req, res) => {
  try {
    const { timeWindow = 'short' } = req.query;
    const metrics = metricsService.getMetrics(timeWindow);

    res.json({
      success: true,
      data: {
        requests: metrics.api.requests,
        responseTime: metrics.api.responseTime,
        statusCodes: metrics.api.statusCodes,
        topEndpoints: metrics.api.topEndpoints,
        timestamp: metrics.timestamp,
      },
    });
  } catch (error) {
    console.error('Error getting API metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API metrics',
    });
  }
};

/**
 * Get top endpoints by request count
 *
 * @route GET /api/monitoring/endpoints/top
 * @access Admin only
 * @query {number} limit - Number of endpoints to return (default: 10)
 */
exports.getTopEndpoints = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topEndpoints = metricsService.getTopEndpoints(parseInt(limit));

    res.json({
      success: true,
      data: topEndpoints,
    });
  } catch (error) {
    console.error('Error getting top endpoints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve top endpoints',
    });
  }
};

/**
 * Export metrics to JSON
 *
 * @route GET /api/monitoring/export
 * @access Admin only
 */
exports.exportMetrics = async (req, res) => {
  try {
    const metrics = metricsService.exportMetrics();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="metrics-${Date.now()}.json"`);

    res.json(metrics);
  } catch (error) {
    console.error('Error exporting metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export metrics',
    });
  }
};

/**
 * Reset metrics
 *
 * @route POST /api/monitoring/reset
 * @access Admin only
 */
exports.resetMetrics = async (req, res) => {
  try {
    metricsService.reset();

    res.json({
      success: true,
      message: 'Metrics reset successfully',
    });
  } catch (error) {
    console.error('Error resetting metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset metrics',
    });
  }
};

/**
 * Stream metrics in real-time (Server-Sent Events)
 *
 * @route GET /api/monitoring/stream
 * @access Admin only
 */
exports.streamMetrics = async (req, res) => {
  try {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection message
    res.write('data: {"type":"connected"}\n\n');

    // Send metrics every 5 seconds
    const interval = setInterval(async () => {
      try {
        const metrics = metricsService.getMetrics('realtime');
        const health = await metricsService.getHealthStatus();

        const data = {
          type: 'update',
          metrics,
          health,
          timestamp: new Date(),
        };

        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error('Error streaming metrics:', error);
      }
    }, 5000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
      console.log('Client disconnected from metrics stream');
    });
  } catch (error) {
    console.error('Error setting up metrics stream:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stream metrics',
    });
  }
};

/**
 * Get alert thresholds
 *
 * @route GET /api/monitoring/thresholds
 * @access Admin only
 */
exports.getThresholds = async (req, res) => {
  try {
    res.json({
      success: true,
      data: metricsService.thresholds,
    });
  } catch (error) {
    console.error('Error getting thresholds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve thresholds',
    });
  }
};

/**
 * Update alert thresholds
 *
 * @route PUT /api/monitoring/thresholds
 * @access Admin only
 * @body {object} thresholds - Threshold values to update
 */
exports.updateThresholds = async (req, res) => {
  try {
    const { thresholds } = req.body;

    if (!thresholds || typeof thresholds !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid thresholds object',
      });
    }

    // Update thresholds
    Object.keys(thresholds).forEach(key => {
      if (metricsService.thresholds[key] !== undefined) {
        metricsService.thresholds[key] = thresholds[key];
      }
    });

    res.json({
      success: true,
      message: 'Thresholds updated successfully',
      data: metricsService.thresholds,
    });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update thresholds',
    });
  }
};

module.exports = exports;
