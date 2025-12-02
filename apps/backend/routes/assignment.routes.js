/**
 * Job Assignment API Routes
 * REST endpoints for job assignment operations
 *
 * @module routes/assignment
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * Initialize job assignment routes with dependencies
 * @param {Object} dependencies - Service dependencies
 * @param {JobAssignmentService} dependencies.jobAssignmentService - Job assignment service instance
 * @param {Object} dependencies.authMiddleware - Authentication middleware
 */
function initializeAssignmentRoutes(dependencies) {
  const { jobAssignmentService, authMiddleware } = dependencies;

  /**
   * @route   POST /api/assignments/auto
   * @desc    Auto-assign job based on workflow
   * @access  Private (System or Admin)
   * @body    {applicationId, role, priority, strategy, assignedBy}
   */
  router.post('/auto', authMiddleware, async (req, res) => {
    try {
      const { applicationId, role, priority, strategy, assignedBy } = req.body;

      if (!applicationId || !role) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: applicationId, role',
        });
      }

      const assignment = await jobAssignmentService.autoAssign({
        applicationId,
        role,
        priority,
        strategy,
        assignedBy,
      });

      res.status(201).json({
        success: true,
        message: 'Job auto-assigned successfully',
        data: assignment,
      });
    } catch (error) {
      logger.error('[Assignment API] Auto-assign error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to auto-assign job',
      });
    }
  });

  /**
   * @route   POST /api/assignments
   * @desc    Create manual job assignment
   * @access  Private (Admin)
   * @body    {applicationId, assignedTo, role, priority, assignedBy}
   */
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { applicationId, assignedTo, role, priority, assignedBy } = req.body;

      if (!applicationId || !assignedTo || !role) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: applicationId, assignedTo, role',
        });
      }

      const assignment = await jobAssignmentService.createAssignment({
        applicationId,
        assignedTo,
        role,
        priority,
        assignedBy: assignedBy || req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Job assigned successfully',
        data: assignment,
      });
    } catch (error) {
      logger.error('[Assignment API] Create assignment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create assignment',
      });
    }
  });

  /**
   * @route   PUT /api/assignments/:id/accept
   * @desc    Accept job assignment
   * @access  Private
   */
  router.put('/:id/accept', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const assignment = await jobAssignmentService.acceptAssignment(id, userId);

      res.json({
        success: true,
        message: 'Assignment accepted',
        data: assignment,
      });
    } catch (error) {
      logger.error('[Assignment API] Accept assignment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to accept assignment',
      });
    }
  });

  /**
   * @route   PUT /api/assignments/:id/start
   * @desc    Start working on assignment
   * @access  Private
   */
  router.put('/:id/start', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const assignment = await jobAssignmentService.startAssignment(id, userId);

      res.json({
        success: true,
        message: 'Assignment started',
        data: assignment,
      });
    } catch (error) {
      logger.error('[Assignment API] Start assignment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start assignment',
      });
    }
  });

  /**
   * @route   PUT /api/assignments/:id/complete
   * @desc    Complete assignment
   * @access  Private
   * @body    {comments, feedbackScore}
   */
  router.put('/:id/complete', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { comments, feedbackScore } = req.body;

      const assignment = await jobAssignmentService.completeAssignment(id, userId, {
        comments,
        feedbackScore,
      });

      res.json({
        success: true,
        message: 'Assignment completed',
        data: assignment,
      });
    } catch (error) {
      logger.error('[Assignment API] Complete assignment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete assignment',
      });
    }
  });

  /**
   * @route   PUT /api/assignments/:id/reassign
   * @desc    Reassign job to different user
   * @access  Private (Admin)
   * @body    {newUserId, reason}
   */
  router.put('/:id/reassign', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { newUserId, reason } = req.body;
      const reassignedBy = req.user.id;

      if (!newUserId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: newUserId',
        });
      }

      const assignment = await jobAssignmentService.reassignJob(
        id,
        newUserId,
        reason || 'Reassigned by admin',
        reassignedBy,
      );

      res.json({
        success: true,
        message: 'Assignment reassigned successfully',
        data: assignment,
      });
    } catch (error) {
      logger.error('[Assignment API] Reassign error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reassign assignment',
      });
    }
  });

  /**
   * @route   DELETE /api/assignments/:id
   * @desc    Cancel assignment
   * @access  Private (Admin)
   * @body    {reason}
   */
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const assignment = await jobAssignmentService.cancelAssignment(
        id,
        reason || 'Assignment cancelled',
      );

      res.json({
        success: true,
        message: 'Assignment cancelled',
        data: assignment,
      });
    } catch (error) {
      logger.error('[Assignment API] Cancel assignment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel assignment',
      });
    }
  });

  /**
   * @route   GET /api/assignments/user/:userId
   * @desc    Get user assignments
   * @access  Private (Self or Admin)
   * @query   {status, role}
   */
  router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const { status, role } = req.query;

      const filters = {};
      if (status) {
        filters.status = status;
      }
      if (role) {
        filters.role = role;
      }

      const assignments = await jobAssignmentService.getUserAssignments(userId, filters);

      res.json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    } catch (error) {
      logger.error('[Assignment API] Get user assignments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user assignments',
      });
    }
  });

  /**
   * @route   GET /api/assignments/application/:applicationId
   * @desc    Get application assignments
   * @access  Private
   */
  router.get('/application/:applicationId', authMiddleware, async (req, res) => {
    try {
      const { applicationId } = req.params;

      const assignments = await jobAssignmentService.getApplicationAssignments(applicationId);

      res.json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    } catch (error) {
      logger.error('[Assignment API] Get application assignments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get application assignments',
      });
    }
  });

  /**
   * @route   GET /api/assignments/statistics
   * @desc    Get assignment statistics (Admin only)
   * @access  Private (Admin)
   * @query   {role, startDate, endDate}
   */
  router.get('/statistics', authMiddleware, async (req, res) => {
    try {
      const { role, startDate, endDate } = req.query;

      const filters = {};
      if (role) {
        filters.role = role;
      }
      if (startDate) {
        filters.startDate = startDate;
      }
      if (endDate) {
        filters.endDate = endDate;
      }

      const statistics = await jobAssignmentService.getStatistics(filters);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('[Assignment API] Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get assignment statistics',
      });
    }
  });

  /**
   * @route   GET /api/assignments/my-assignments
   * @desc    Get current user's assignments
   * @access  Private
   * @query   {status}
   */
  router.get('/my-assignments', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      const filters = {};
      if (status) {
        filters.status = status;
      }

      const assignments = await jobAssignmentService.getUserAssignments(userId, filters);

      res.json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    } catch (error) {
      logger.error('[Assignment API] Get my assignments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get assignments',
      });
    }
  });

  /**
   * @route   GET /api/assignments/workload/:userId
   * @desc    Get user workload summary
   * @access  Private (Self or Admin)
   */
  router.get('/workload/:userId', authMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;

      const workload = await jobAssignmentService.assignmentRepository.getUserWorkload(userId);

      res.json({
        success: true,
        data: workload,
      });
    } catch (error) {
      logger.error('[Assignment API] Get workload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get workload',
      });
    }
  });

  /**
   * @route   GET /api/assignments/overdue
   * @desc    Get overdue assignments (Admin only)
   * @access  Private (Admin)
   * @query   {hours}
   */
  router.get('/overdue', authMiddleware, async (req, res) => {
    try {
      const { hours = 24 } = req.query;

      const overdueAssignments = await jobAssignmentService.assignmentRepository.findOverdue(
        Number(hours),
      );

      res.json({
        success: true,
        count: overdueAssignments.length,
        data: overdueAssignments,
      });
    } catch (error) {
      logger.error('[Assignment API] Get overdue assignments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get overdue assignments',
      });
    }
  });

  return router;
}

module.exports = initializeAssignmentRoutes;
