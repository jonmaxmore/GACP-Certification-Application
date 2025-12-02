/**
 * Cache Controller
 * Admin endpoints for cache management
 */

const cacheService = require('../services/cache/cacheService');
const logger = require('../utils/logger');

/**
 * Get cache statistics
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = await cacheService.getStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache statistics',
      error: error.message,
    });
  }
};

/**
 * Clear all cache
 */
exports.clearAllCache = async (req, res) => {
  try {
    const result = await cacheService.clearAll();

    if (result) {
      logger.info('All cache cleared by admin');
      res.json({
        success: true,
        message: 'All cache cleared successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
      });
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message,
    });
  }
};

/**
 * Clear cache by pattern
 */
exports.clearCachePattern = async (req, res) => {
  try {
    const { pattern } = req.body;

    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern is required',
      });
    }

    const result = await cacheService.deletePattern(pattern);

    if (result) {
      logger.info(`Cache pattern cleared: ${pattern}`);
      res.json({
        success: true,
        message: `Cache cleared for pattern: ${pattern}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache pattern',
      });
    }
  } catch (error) {
    logger.error('Clear cache pattern error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache pattern',
      error: error.message,
    });
  }
};

/**
 * Invalidate cache for specific application
 */
exports.invalidateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    await cacheService.invalidateApplication(applicationId);

    logger.info(`Cache invalidated for application: ${applicationId}`);
    res.json({
      success: true,
      message: 'Application cache invalidated',
    });
  } catch (error) {
    logger.error('Invalidate application cache error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate application cache',
      error: error.message,
    });
  }
};

/**
 * Warm cache with frequently accessed data
 */
exports.warmCache = async (req, res) => {
  try {
    await cacheService.warmCache();

    logger.info('Cache warming completed');
    res.json({
      success: true,
      message: 'Cache warming completed',
    });
  } catch (error) {
    logger.error('Cache warming error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to warm cache',
      error: error.message,
    });
  }
};

/**
 * Get cache health check
 */
exports.healthCheck = async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    const healthy = stats.enabled && stats.keys >= 0;

    res.json({
      success: true,
      healthy,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cache health check error:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      message: 'Cache health check failed',
      error: error.message,
    });
  }
};
