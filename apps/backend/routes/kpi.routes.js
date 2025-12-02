/**
 * KPI API Routes
 * REST endpoints for KPI tracking operations
 *
 * @module routes/kpi
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Initialize KPI routes with dependencies
 * @param {Object} dependencies - Service dependencies
 * @param {KPIService} dependencies.kpiService - KPI service instance
 * @param {Object} dependencies.authMiddleware - Authentication middleware
 */
function initializeKPIRoutes(dependencies) {
  const { kpiService, authMiddleware } = dependencies;

  /**
   * @route   POST /api/kpi/start
   * @desc    Start task tracking
   * @access  Private
   * @body    {taskId, applicationId, role, userId, comments}
   */
  router.post('/start', authMiddleware, async (req, res) => {
    try {
      const { taskId, applicationId, role, userId, comments } = req.body;

      if (!applicationId || !role || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: applicationId, role, userId',
        });
      }

      const kpi = await kpiService.startTask({
        taskId,
        applicationId,
        role,
        userId,
        comments,
      });

      res.status(201).json({
        success: true,
        message: 'Task tracking started',
        data: kpi,
      });
    } catch (error) {
      logger.error('[KPI API] Start task error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start task tracking',
      });
    }
  });

  /**
   * @route   PUT /api/kpi/:taskId/complete
   * @desc    Complete task
   * @access  Private
   * @body    {comments, feedbackScore}
   */
  router.put('/:taskId/complete', authMiddleware, async (req, res) => {
    try {
      const { taskId } = req.params;
      const { comments, feedbackScore } = req.body;

      const kpi = await kpiService.completeTask(taskId, {
        comments,
        feedbackScore,
      });

      res.json({
        success: true,
        message: 'Task completed',
        data: kpi,
      });
    } catch (error) {
      logger.error('[KPI API] Complete task error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete task',
      });
    }
  });

  /**
   * @route   PUT /api/kpi/:taskId/comments
   * @desc    Update task comments
   * @access  Private
   * @body    {comments}
   */
  router.put('/:taskId/comments', authMiddleware, async (req, res) => {
    try {
      const { taskId } = req.params;
      const { comments } = req.body;

      if (!comments) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: comments',
        });
      }

      const kpi = await kpiService.updateTaskComments(taskId, comments);

      res.json({
        success: true,
        message: 'Task comments updated',
        data: kpi,
      });
    } catch (error) {
      logger.error('[KPI API] Update comments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update task comments',
      });
    }
  });

  /**
   * @route   PUT /api/kpi/:taskId/feedback
   * @desc    Set feedback score
   * @access  Private
   * @body    {feedbackScore}
   */
  router.put('/:taskId/feedback', authMiddleware, async (req, res) => {
    try {
      const { taskId } = req.params;
      const { feedbackScore } = req.body;

      if (!feedbackScore || feedbackScore < 1 || feedbackScore > 5) {
        return res.status(400).json({
          success: false,
          message: 'Feedback score must be between 1 and 5',
        });
      }

      const kpi = await kpiService.setFeedbackScore(taskId, feedbackScore);

      res.json({
        success: true,
        message: 'Feedback score set',
        data: kpi,
      });
    } catch (error) {
      logger.error('[KPI API] Set feedback error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to set feedback score',
      });
    }
  });

  /**
   * @route   GET /api/kpi/role/:role
   * @desc    Get KPI metrics for role
   * @access  Private (Admin or same role)
   * @query   {startDate, endDate, userId}
   */
  router.get('/role/:role', authMiddleware, async (req, res) => {
    try {
      const { role } = req.params;
      const { startDate, endDate, userId } = req.query;

      const filters = {};
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }
      if (userId) {
        filters.userId = userId;
      }

      const metrics = await kpiService.getRoleMetrics(role, filters);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('[KPI API] Get role metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get role metrics',
      });
    }
  });

  /**
   * @route   GET /api/kpi/user/:userId
   * @desc    Get KPI metrics for user
   * @access  Private (Self or Admin)
   * @query   {startDate, endDate}
   */
  router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const filters = {};
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }

      const metrics = await kpiService.getUserMetrics(userId, filters);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('[KPI API] Get user metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user metrics',
      });
    }
  });

  /**
   * @route   GET /api/kpi/system
   * @desc    Get system-wide metrics (Admin only)
   * @access  Private (Admin)
   * @query   {startDate, endDate}
   */
  router.get('/system', authMiddleware, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const filters = {};
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }

      const metrics = await kpiService.getSystemMetrics(filters);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('[KPI API] Get system metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get system metrics',
      });
    }
  });

  /**
   * @route   GET /api/kpi/delayed
   * @desc    Get delayed tasks (Admin only)
   * @access  Private (Admin)
   */
  router.get('/delayed', authMiddleware, async (req, res) => {
    try {
      const delayedTasks = await kpiService.detectDelayedTasks();

      res.json({
        success: true,
        count: delayedTasks.length,
        data: delayedTasks,
      });
    } catch (error) {
      logger.error('[KPI API] Get delayed tasks error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get delayed tasks',
      });
    }
  });

  /**
   * @route   GET /api/kpi/trends
   * @desc    Get KPI trends over time
   * @access  Private (Admin)
   * @query   {role, days}
   */
  router.get('/trends', authMiddleware, async (req, res) => {
    try {
      const { role, days = 30 } = req.query;

      const trends = await kpiService.getTrends(role, Number(days));

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      logger.error('[KPI API] Get trends error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get KPI trends',
      });
    }
  });

  /**
   * @route   DELETE /api/kpi/:taskId
   * @desc    Cancel task (Admin only)
   * @access  Private (Admin)
   */
  router.delete('/:taskId', authMiddleware, async (req, res) => {
    try {
      const { taskId } = req.params;

      const kpi = await kpiService.cancelTask(taskId);

      res.json({
        success: true,
        message: 'Task cancelled',
        data: kpi,
      });
    } catch (error) {
      logger.error('[KPI API] Cancel task error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel task',
      });
    }
  });

  /**
   * @route   GET /api/kpi/dashboard
   * @desc    Get KPI dashboard data (Admin only)
   * @access  Private (Admin)
   * @query   {startDate, endDate}
   */
  router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const filters = {};
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }

      const [systemMetrics, delayedTasks, trends] = await Promise.all([
        kpiService.getSystemMetrics(filters),
        kpiService.detectDelayedTasks(),
        kpiService.getTrends(null, 7), // Last 7 days
      ]);

      res.json({
        success: true,
        data: {
          systemMetrics,
          delayedTasks: {
            count: delayedTasks.length,
            tasks: delayedTasks.slice(0, 10), // Top 10
          },
          recentTrends: trends,
        },
      });
    } catch (error) {
      logger.error('[KPI API] Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get dashboard data',
      });
    }
  });

  return router;
}

module.exports = initializeKPIRoutes;
