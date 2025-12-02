/**
 * Alert Controller
 *
 * API endpoints for alert management
 * Admin-only access
 */

const alertService = require('../services/monitoring/alertService');

/**
 * Get alert history
 *
 * @route GET /api/v1/alerts/history
 * @access Admin only
 * @query {number} limit - Number of alerts (default: 50)
 * @query {string} severity - Filter by severity (warning|critical)
 */
exports.getAlertHistory = async (req, res) => {
  try {
    const { limit = 50, severity } = req.query;

    const history = alertService.getAlertHistory(parseInt(limit), severity);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error getting alert history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alert history',
    });
  }
};

/**
 * Get alert statistics
 *
 * @route GET /api/v1/alerts/stats
 * @access Admin only
 */
exports.getAlertStats = async (req, res) => {
  try {
    const stats = alertService.getAlertStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting alert stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alert statistics',
    });
  }
};

/**
 * Get alert rules
 *
 * @route GET /api/v1/alerts/rules
 * @access Admin only
 */
exports.getAlertRules = async (req, res) => {
  try {
    const rules = alertService.getAlertRules();

    res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    console.error('Error getting alert rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alert rules',
    });
  }
};

/**
 * Update alert rule
 *
 * @route PUT /api/v1/alerts/rules/:metric
 * @access Admin only
 * @body {object} rule - Rule updates (warning, critical, enabled)
 */
exports.updateAlertRule = async (req, res) => {
  try {
    const { metric } = req.params;
    const updates = req.body;

    if (!metric) {
      return res.status(400).json({
        success: false,
        error: 'Metric name is required',
      });
    }

    alertService.updateAlertRule(metric, updates);

    res.json({
      success: true,
      message: 'Alert rule updated successfully',
      data: alertService.getAlertRules()[metric],
    });
  } catch (error) {
    console.error('Error updating alert rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update alert rule',
    });
  }
};

/**
 * Clear alert history
 *
 * @route DELETE /api/v1/alerts/history
 * @access Admin only
 */
exports.clearAlertHistory = async (req, res) => {
  try {
    alertService.clearHistory();

    res.json({
      success: true,
      message: 'Alert history cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing alert history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear alert history',
    });
  }
};

/**
 * Test alert system
 *
 * @route POST /api/v1/alerts/test
 * @access Admin only
 */
exports.testAlert = async (req, res) => {
  try {
    await alertService.testAlert();

    res.json({
      success: true,
      message: 'Test alert sent successfully',
    });
  } catch (error) {
    console.error('Error sending test alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test alert',
    });
  }
};

module.exports = exports;
