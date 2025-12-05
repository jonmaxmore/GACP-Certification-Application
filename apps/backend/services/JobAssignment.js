/**
 * JobAssignmentService
 * Auto job assignment system based on workflow state
 * Handles task prioritization and assignment history
 *
 * @module services/jobassignment
 * @version 1.0.0
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class JobAssignmentService extends EventEmitter {
  constructor(assignmentRepository, userRepository, kpiService) {
    super();
    this.assignmentRepository = assignmentRepository;
    this.userRepository = userRepository;
    this.kpiService = kpiService;

    // Assignment status
    this.STATUS = {
      ASSIGNED: 'assigned',
      ACCEPTED: 'accepted',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      REJECTED: 'rejected',
      CANCELLED: 'cancelled',
      REASSIGNED: 'reassigned',
    };

    // Priority levels
    this.PRIORITY = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      URGENT: 'urgent',
    };

    // Role types
    this.ROLES = {
      OFFICER: 'officer',
      AUDITOR: 'auditor',
    };

    // Assignment strategies
    this.STRATEGIES = {
      ROUND_ROBIN: 'round_robin',
      WORKLOAD_BASED: 'workload_based',
      PERFORMANCE_BASED: 'performance_based',
      MANUAL: 'manual',
    };

    // Track round-robin indices
    this.roundRobinIndex = {
      officer: 0,
      auditor: 0,
    };
  }

  /**
   * Get unassigned jobs (for Officer dashboard)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of unassigned jobs
   */
  async getUnassignedJobs(filters = {}) {
    try {
      // implementation depends on how unassigned jobs are tracked
      // assuming we query applications with specific status
      // This might need integration with ApplicationRepository
      // For now, returning placeholder or querying assignments with status 'pending' if applicable
      return [];
    } catch (error) {
      logger.error('[JobAssignmentService] Get unassigned jobs error:', error);
      throw error;
    }
  }

  /**
   * Assign job to auditor (Officer action)
   * @param {string} applicationId - Application ID
   * @param {string} auditorId - Auditor ID
   * @param {string} officerId - Officer ID (assignedBy)
   * @param {string} priority - Priority
   * @returns {Promise<Object>} Created assignment
   */
  async assignJobToAuditor(applicationId, auditorId, officerId, priority = 'medium') {
    return this.createAssignment({
      applicationId,
      assignedTo: auditorId,
      role: this.ROLES.AUDITOR,
      priority,
      assignedBy: officerId,
      strategy: this.STRATEGIES.MANUAL,
    });
  }

  /**
   * Auto-assign job to user based on workflow state
   * @param {Object} data - Assignment data
   * @param {string} data.applicationId - Application ID
   * @param {string} data.role - User role (reviewer/inspector/approver)
   * @param {string} data.priority - Priority level (default: 'medium')
   * @param {string} data.strategy - Assignment strategy (default: 'workload_based')
   * @param {string} data.assignedBy - User ID who created assignment (optional)
   * @returns {Promise<Object>} Created assignment
   */
  async autoAssign(data) {
    try {
      const {
        applicationId,
        role,
        priority = this.PRIORITY.MEDIUM,
        strategy = this.STRATEGIES.WORKLOAD_BASED,
        assignedBy = 'system',
      } = data;

      logger.info(
        `[JobAssignmentService] Auto-assigning ${role} for ${applicationId} using ${strategy}`,
      );

      // Validate role
      if (!Object.values(this.ROLES).includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }

      // Get available users for this role
      const availableUsers = await this.userRepository.findByRole(role);
      if (availableUsers.length === 0) {
        throw new Error(`No users available for role: ${role}`);
      }

      // Select user based on strategy
      let selectedUser;
      switch (strategy) {
        case this.STRATEGIES.ROUND_ROBIN:
          selectedUser = this._selectRoundRobin(role, availableUsers);
          break;
        case this.STRATEGIES.WORKLOAD_BASED:
          selectedUser = await this._selectByWorkload(role, availableUsers);
          break;
        case this.STRATEGIES.PERFORMANCE_BASED:
          selectedUser = await this._selectByPerformance(role, availableUsers);
          break;
        default:
          selectedUser = this._selectRoundRobin(role, availableUsers);
      }

      // Create assignment
      const assignment = await this.createAssignment({
        applicationId,
        assignedTo: selectedUser.id,
        role,
        priority,
        assignedBy,
        strategy,
      });

      return assignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Auto-assign error:', error);
      throw error;
    }
  }

  /**
   * Create manual job assignment
   * @param {Object} data - Assignment data
   * @param {string} data.applicationId - Application ID
   * @param {string} data.assignedTo - User ID to assign to
   * @param {string} data.role - User role
   * @param {string} data.priority - Priority level
   * @param {string} data.assignedBy - User ID who created assignment
   * @param {string} data.strategy - Assignment strategy
   * @returns {Promise<Object>} Created assignment
   */
  async createAssignment(data) {
    try {
      const {
        applicationId,
        assignedTo,
        role,
        priority = this.PRIORITY.MEDIUM,
        assignedBy = 'system',
        strategy = this.STRATEGIES.MANUAL,
      } = data;

      logger.info(`[JobAssignmentService] Creating assignment for ${assignedTo} (${role})`);

      // Check if assignment already exists
      const existingAssignment = await this.assignmentRepository.findByApplicationAndRole(
        applicationId,
        role,
      );

      if (existingAssignment && existingAssignment.status !== this.STATUS.COMPLETED) {
        logger.warn(
          `[JobAssignmentService] Active assignment already exists: ${existingAssignment.id}`,
        );
        return existingAssignment;
      }

      // Create assignment
      const assignment = await this.assignmentRepository.create({
        applicationId,
        assignedTo,
        assignedBy,
        role,
        priority,
        strategy,
        status: this.STATUS.ASSIGNED,
        assignedAt: new Date(),
        acceptedAt: null,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Start KPI tracking
      if (this.kpiService) {
        await this.kpiService.startTask({
          taskId: `assignment_${assignment.id}`,
          applicationId,
          role,
          userId: assignedTo,
          comments: `Auto-assigned using ${strategy} strategy`,
        });
      }

      this.emit('assignment:created', {
        assignment,
        applicationId,
        assignedTo,
        role,
      });

      logger.info(`[JobAssignmentService] Assignment created: ${assignment.id}`);
      return assignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Create assignment error:', error);
      throw error;
    }
  }

  /**
   * Accept job assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated assignment
   */
  async acceptAssignment(assignmentId, userId) {
    try {
      logger.info(`[JobAssignmentService] User ${userId} accepting assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      if (assignment.assignedTo !== userId) {
        throw new Error('Unauthorized to accept this assignment');
      }

      if (assignment.status !== this.STATUS.ASSIGNED) {
        throw new Error(`Cannot accept assignment with status: ${assignment.status}`);
      }

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.ACCEPTED,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      });

      this.emit('assignment:accepted', { assignment: updatedAssignment, userId });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Accept assignment error:', error);
      throw error;
    }
  }

  /**
   * Start working on assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<Object>} Updated assignment
   */
  async startAssignment(assignmentId, userId) {
    try {
      logger.info(`[JobAssignmentService] User ${userId} starting assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      if (assignment.assignedTo !== userId) {
        throw new Error('Unauthorized to start this assignment');
      }

      if (![this.STATUS.ASSIGNED, this.STATUS.ACCEPTED].includes(assignment.status)) {
        throw new Error(`Cannot start assignment with status: ${assignment.status}`);
      }

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.IN_PROGRESS,
        startedAt: new Date(),
        acceptedAt: assignment.acceptedAt || new Date(),
        updatedAt: new Date(),
      });

      this.emit('assignment:started', { assignment: updatedAssignment, userId });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Start assignment error:', error);
      throw error;
    }
  }

  /**
   * Complete job assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} userId - User ID (for verification)
   * @param {Object} data - Completion data (optional)
   * @returns {Promise<Object>} Updated assignment
   */
  async completeAssignment(assignmentId, userId, data = {}) {
    try {
      logger.info(`[JobAssignmentService] User ${userId} completing assignment ${assignmentId}`);

      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      if (assignment.assignedTo !== userId) {
        throw new Error('Unauthorized to complete this assignment');
      }

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.COMPLETED,
        completedAt: new Date(),
        updatedAt: new Date(),
        ...data,
      });

      // Complete KPI tracking
      if (this.kpiService) {
        await this.kpiService.completeTask(`assignment_${assignmentId}`, {
          comments: data.comments || 'Assignment completed',
          feedbackScore: data.feedbackScore,
        });
      }

      this.emit('assignment:completed', { assignment: updatedAssignment, userId });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Complete assignment error:', error);
      throw error;
    }
  }

  /**
   * Reassign job to different user
   * @param {string} assignmentId - Assignment ID
   * @param {string} newUserId - New user ID
   * @param {string} reason - Reassignment reason
   * @param {string} reassignedBy - User ID who is reassigning
   * @returns {Promise<Object>} New assignment
   */
  async reassignJob(assignmentId, newUserId, reason, reassignedBy) {
    try {
      logger.info(`[JobAssignmentService] Reassigning ${assignmentId} to ${newUserId}`);

      const oldAssignment = await this.assignmentRepository.findById(assignmentId);
      if (!oldAssignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      // Mark old assignment as reassigned
      await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.REASSIGNED,
        reassignedTo: newUserId,
        reassignedBy,
        reassignReason: reason,
        updatedAt: new Date(),
      });

      // Create new assignment
      const newAssignment = await this.createAssignment({
        applicationId: oldAssignment.applicationId,
        assignedTo: newUserId,
        role: oldAssignment.role,
        priority: oldAssignment.priority,
        assignedBy: reassignedBy,
        strategy: this.STRATEGIES.MANUAL,
      });

      this.emit('assignment:reassigned', {
        oldAssignment,
        newAssignment,
        newUserId,
        reason,
      });

      return newAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Reassign job error:', error);
      throw error;
    }
  }

  /**
   * Get user assignments
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (status, role)
   * @returns {Promise<Array>} List of assignments
   */
  async getUserAssignments(userId, filters = {}) {
    try {
      return await this.assignmentRepository.findByUser(userId, filters);
    } catch (error) {
      logger.error('[JobAssignmentService] Get user assignments error:', error);
      throw error;
    }
  }

  /**
   * Get assignments for application
   * @param {string} applicationId - Application ID
   * @returns {Promise<Array>} List of assignments
   */
  async getApplicationAssignments(applicationId) {
    try {
      return await this.assignmentRepository.findByApplication(applicationId);
    } catch (error) {
      logger.error('[JobAssignmentService] Get application assignments error:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Assignment statistics
   */
  async getStatistics(filters = {}) {
    try {
      return await this.assignmentRepository.getStatistics(filters);
    } catch (error) {
      logger.error('[JobAssignmentService] Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Select user using round-robin strategy
   * @private
   */
  _selectRoundRobin(role, users) {
    const index = this.roundRobinIndex[role] % users.length;
    const selectedUser = users[index];
    this.roundRobinIndex[role]++;
    return selectedUser;
  }

  /**
   * Select user based on current workload
   * @private
   */
  async _selectByWorkload(role, users) {
    try {
      // Get active assignments for each user
      const workloads = await Promise.all(
        users.map(async user => {
          const activeAssignments = await this.assignmentRepository.findByUser(user.id, {
            status: [this.STATUS.ASSIGNED, this.STATUS.ACCEPTED, this.STATUS.IN_PROGRESS],
          });
          return {
            user,
            workload: activeAssignments.length,
          };
        }),
      );

      // Sort by workload (ascending) and select user with least workload
      workloads.sort((a, b) => a.workload - b.workload);
      return workloads[0].user;
    } catch (error) {
      logger.error('[JobAssignmentService] Select by workload error:', error);
      // Fallback to round-robin
      return this._selectRoundRobin(role, users);
    }
  }

  /**
   * Select user based on performance metrics
   * @private
   */
  async _selectByPerformance(role, users) {
    try {
      if (!this.kpiService) {
        return this._selectRoundRobin(role, users);
      }

      // Get performance metrics for each user
      const performances = await Promise.all(
        users.map(async user => {
          const metrics = await this.kpiService.getUserMetrics(user.id);
          return {
            user,
            score: this._calculatePerformanceScore(metrics),
          };
        }),
      );

      // Sort by score (descending) and select best performer
      performances.sort((a, b) => b.score - a.score);
      return performances[0].user;
    } catch (error) {
      logger.error('[JobAssignmentService] Select by performance error:', error);
      // Fallback to round-robin
      return this._selectRoundRobin(role, users);
    }
  }

  /**
   * Calculate performance score from KPI metrics
   * @private
   */
  _calculatePerformanceScore(metrics) {
    // Weighted score: completion rate (40%), feedback score (30%), speed (30%)
    const completionScore = metrics.completionRate * 0.4;
    const feedbackScore = (metrics.avgFeedbackScore / 5) * 100 * 0.3;
    const speedScore = Math.max(0, 100 - (metrics.avgProcessingHours / 24) * 100) * 0.3;

    return completionScore + feedbackScore + speedScore;
  }

  /**
   * Cancel assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Updated assignment
   */
  async cancelAssignment(assignmentId, reason) {
    try {
      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment not found: ${assignmentId}`);
      }

      const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
        status: this.STATUS.CANCELLED,
        cancellationReason: reason,
        updatedAt: new Date(),
      });

      // Cancel KPI tracking
      if (this.kpiService) {
        await this.kpiService.cancelTask(`assignment_${assignmentId}`);
      }

      this.emit('assignment:cancelled', { assignment: updatedAssignment, reason });

      return updatedAssignment;
    } catch (error) {
      logger.error('[JobAssignmentService] Cancel assignment error:', error);
      throw error;
    }
  }
}

module.exports = JobAssignmentService;
