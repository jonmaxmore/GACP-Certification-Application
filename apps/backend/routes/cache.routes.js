/**
 * Cache Management Routes
 */

const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cacheController');
const { authenticate } = require('../middleware/auth-middleware');
const { checkRole } = require('../middleware/roleCheck-middleware');

// All cache management requires admin role
router.use(authenticate);
router.use(checkRole(['admin']));

/**
 * @route   GET /api/v1/cache/stats
 * @desc    Get cache statistics
 * @access  Private (Admin)
 */
router.get('/stats', cacheController.getCacheStats);

/**
 * @route   GET /api/v1/cache/health
 * @desc    Get cache health status
 * @access  Private (Admin)
 */
router.get('/health', cacheController.healthCheck);

/**
 * @route   POST /api/v1/cache/clear
 * @desc    Clear all cache
 * @access  Private (Admin)
 */
router.post('/clear', cacheController.clearAllCache);

/**
 * @route   POST /api/v1/cache/clear-pattern
 * @desc    Clear cache by pattern
 * @access  Private (Admin)
 */
router.post('/clear-pattern', cacheController.clearCachePattern);

/**
 * @route   POST /api/v1/cache/invalidate/application/:applicationId
 * @desc    Invalidate cache for specific application
 * @access  Private (Admin)
 */
router.post('/invalidate/application/:applicationId', cacheController.invalidateApplication);

/**
 * @route   POST /api/v1/cache/warm
 * @desc    Warm cache with frequently accessed data
 * @access  Private (Admin)
 */
router.post('/warm', cacheController.warmCache);

module.exports = router;
