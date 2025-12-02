/**
 * Alert Routes
 *
 * API endpoints for alert management
 * All routes require admin authentication
 */

const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { adminOnly } = require('../middleware/auth-middleware');

// Apply admin-only middleware
router.use(adminOnly);

/**
 * @route   GET /api/v1/alerts/history
 * @desc    Get alert history
 * @query   limit, severity
 * @access  Admin
 */
router.get('/history', alertController.getAlertHistory);

/**
 * @route   GET /api/v1/alerts/stats
 * @desc    Get alert statistics
 * @access  Admin
 */
router.get('/stats', alertController.getAlertStats);

/**
 * @route   GET /api/v1/alerts/rules
 * @desc    Get alert rules
 * @access  Admin
 */
router.get('/rules', alertController.getAlertRules);

/**
 * @route   PUT /api/v1/alerts/rules/:metric
 * @desc    Update alert rule for specific metric
 * @params  metric - Metric name
 * @body    rule - Rule updates
 * @access  Admin
 */
router.put('/rules/:metric', alertController.updateAlertRule);

/**
 * @route   DELETE /api/v1/alerts/history
 * @desc    Clear alert history
 * @access  Admin
 */
router.delete('/history', alertController.clearAlertHistory);

/**
 * @route   POST /api/v1/alerts/test
 * @desc    Test alert system
 * @access  Admin
 */
router.post('/test', alertController.testAlert);

module.exports = router;
