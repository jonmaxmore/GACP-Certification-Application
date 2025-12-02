/**
 * Monitoring Routes
 *
 * API endpoints for system monitoring and metrics
 * All routes require admin authentication
 */

const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { adminOnly } = require('../middleware/auth-middleware');

// Apply admin-only middleware to all monitoring routes
router.use(adminOnly);

/**
 * @route   GET /api/monitoring/metrics
 * @desc    Get current metrics
 * @query   timeWindow - realtime|short|medium|long
 * @access  Admin
 */
router.get('/metrics', monitoringController.getMetrics);

/**
 * @route   GET /api/monitoring/health
 * @desc    Get health status
 * @access  Admin
 */
router.get('/health', monitoringController.getHealth);

/**
 * @route   GET /api/monitoring/system
 * @desc    Get system metrics (CPU, memory, disk)
 * @query   timeWindow
 * @access  Admin
 */
router.get('/system', monitoringController.getSystemMetrics);

/**
 * @route   GET /api/monitoring/database
 * @desc    Get database metrics
 * @query   timeWindow
 * @access  Admin
 */
router.get('/database', monitoringController.getDatabaseMetrics);

/**
 * @route   GET /api/monitoring/cache
 * @desc    Get cache metrics
 * @query   timeWindow
 * @access  Admin
 */
router.get('/cache', monitoringController.getCacheMetrics);

/**
 * @route   GET /api/monitoring/queue
 * @desc    Get queue metrics
 * @access  Admin
 */
router.get('/queue', monitoringController.getQueueMetrics);

/**
 * @route   GET /api/monitoring/api
 * @desc    Get API metrics
 * @query   timeWindow
 * @access  Admin
 */
router.get('/api', monitoringController.getAPIMetrics);

/**
 * @route   GET /api/monitoring/endpoints/top
 * @desc    Get top endpoints by request count
 * @query   limit - Number of endpoints (default: 10)
 * @access  Admin
 */
router.get('/endpoints/top', monitoringController.getTopEndpoints);

/**
 * @route   GET /api/monitoring/export
 * @desc    Export metrics to JSON file
 * @access  Admin
 */
router.get('/export', monitoringController.exportMetrics);

/**
 * @route   POST /api/monitoring/reset
 * @desc    Reset metrics counters
 * @access  Admin
 */
router.post('/reset', monitoringController.resetMetrics);

/**
 * @route   GET /api/monitoring/stream
 * @desc    Stream metrics in real-time (Server-Sent Events)
 * @access  Admin
 */
router.get('/stream', monitoringController.streamMetrics);

/**
 * @route   GET /api/monitoring/thresholds
 * @desc    Get alert thresholds
 * @access  Admin
 */
router.get('/thresholds', monitoringController.getThresholds);

/**
 * @route   PUT /api/monitoring/thresholds
 * @desc    Update alert thresholds
 * @body    thresholds - Object with threshold values
 * @access  Admin
 */
router.put('/thresholds', monitoringController.updateThresholds);

module.exports = router;
