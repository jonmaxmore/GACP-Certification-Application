/**
 * KPIService
 * Key Performance Indicator tracking and metrics
 * Tracks workflow performance, processing times, and completion rates
 *
 * @module services/kpi
 * @version 1.0.0
 */

const EventEmitter = require('events');
const logger = require('../utils/logger');

class KPIService extends EventEmitter {
  constructor(kpiRepository) {
    super();
    this.kpiRepository = kpiRepository;

    // KPI status
    this.STATUS = {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      DELAYED: 'delayed',
      CANCELLED: 'cancelled',
    };

    // Role types
    this.ROLES = {
      REVIEWER: 'reviewer',
      INSPECTOR: 'inspector',
      APPROVER: 'approver',
    };

    // SLA thresholds (in hours)
    this.SLA_THRESHOLDS = {
      reviewer: 72, // 3 days
      inspector: 120, // 5 days
      approver: 48, // 2 days
    };
  }

  /**
   * Start tracking a new task
   * @param {Object} data - Task data
   * @param {string} data.taskId - Task ID (generated if not provided)
   * @param {string} data.applicationId - Application ID
   * @param {string} data.role - User role (reviewer/inspector/approver)
   * @param {string} data.userId - User ID
   * @param {string} data.comments - Optional initial comments
   * @returns {Promise<Object>} Created KPI record
   */
  async startTask(data) {
    try {
      const { taskId = this._generateTaskId(), applicationId, role, userId, comments = '' } = data;

      // Validate role
      if (!Object.values(this.ROLES).includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }

      logger.info(`[KPIService] Starting task tracking: ${taskId} (${role})`);

      const kpi = await this.kpiRepository.create({
        taskId,
        applicationId,
        role,
        userId,
        startTime: new Date(),
        endTime: null,
        status: this.STATUS.IN_PROGRESS,
        processingTime: 0,
        comments,
        feedbackScore: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.emit('task:started', { kpi, taskId, applicationId, role, userId });

      logger.info(`[KPIService] Task started: ${taskId}`);
      return kpi;
    } catch (error) {
      logger.error('[KPIService] Start task error:', error);
      throw error;
    }
  }

  /**
   * Complete a task
   * @param {string} taskId - Task ID
   * @param {Object} data - Completion data
   * @param {string} data.comments - Final comments
   * @param {number} data.feedbackScore - Feedback score (1-5)
   * @returns {Promise<Object>} Updated KPI record
   */
  async completeTask(taskId, data = {}) {
    try {
      const { comments, feedbackScore } = data;

      logger.info(`[KPIService] Completing task: ${taskId}`);

      const kpi = await this.kpiRepository.findByTaskId(taskId);
      if (!kpi) {
        throw new Error(`Task not found: ${taskId}`);
      }

      if (kpi.status === this.STATUS.COMPLETED) {
        logger.warn(`[KPIService] Task already completed: ${taskId}`);
        return kpi;
      }

      const endTime = new Date();
      const processingTime = this._calculateProcessingTime(kpi.startTime, endTime);
      const isDelayed = this._isDelayed(kpi.role, processingTime);

      const updatedKpi = await this.kpiRepository.update(taskId, {
        endTime,
        processingTime,
        status: isDelayed ? this.STATUS.DELAYED : this.STATUS.COMPLETED,
        comments: comments || kpi.comments,
        feedbackScore: feedbackScore || kpi.feedbackScore,
        updatedAt: new Date(),
      });

      this.emit('task:completed', {
        kpi: updatedKpi,
        taskId,
        processingTime,
        isDelayed,
      });

      logger.info(
        `[KPIService] Task completed: ${taskId} (${processingTime} minutes, delayed: ${isDelayed})`,
      );
      return updatedKpi;
    } catch (error) {
      logger.error('[KPIService] Complete task error:', error);
      throw error;
    }
  }

  /**
   * Update task comments
   * @param {string} taskId - Task ID
   * @param {string} comments - Comments to add
   * @returns {Promise<Object>} Updated KPI record
   */
  async updateTaskComments(taskId, comments) {
    try {
      const kpi = await this.kpiRepository.findByTaskId(taskId);
      if (!kpi) {
        throw new Error(`Task not found: ${taskId}`);
      }

      const updatedComments = kpi.comments ? `${kpi.comments}\n${comments}` : comments;

      return await this.kpiRepository.update(taskId, {
        comments: updatedComments,
        updatedAt: new Date(),
      });
    } catch (error) {
      logger.error('[KPIService] Update comments error:', error);
      throw error;
    }
  }

  /**
   * Set feedback score for task
   * @param {string} taskId - Task ID
   * @param {number} feedbackScore - Score (1-5)
   * @returns {Promise<Object>} Updated KPI record
   */
  async setFeedbackScore(taskId, feedbackScore) {
    try {
      if (feedbackScore < 1 || feedbackScore > 5) {
        throw new Error('Feedback score must be between 1 and 5');
      }

      return await this.kpiRepository.update(taskId, {
        feedbackScore,
        updatedAt: new Date(),
      });
    } catch (error) {
      logger.error('[KPIService] Set feedback score error:', error);
      throw error;
    }
  }

  /**
   * Get KPI metrics for a role
   * @param {string} role - User role
   * @param {Object} filters - Optional filters (startDate, endDate, userId)
   * @returns {Promise<Object>} KPI metrics
   */
  async getRoleMetrics(role, filters = {}) {
    try {
      const kpis = await this.kpiRepository.findByRole(role, filters);

      const completed = kpis.filter(k => k.status === this.STATUS.COMPLETED);
      const delayed = kpis.filter(k => k.status === this.STATUS.DELAYED);
      const inProgress = kpis.filter(k => k.status === this.STATUS.IN_PROGRESS);

      const totalProcessingTime = completed.reduce((sum, k) => sum + k.processingTime, 0);
      const avgProcessingTime = completed.length > 0 ? totalProcessingTime / completed.length : 0;

      const totalTasks = kpis.length;
      const completionRate = totalTasks > 0 ? (completed.length / totalTasks) * 100 : 0;

      const delayCount = delayed.length;
      const delayRate = totalTasks > 0 ? (delayCount / totalTasks) * 100 : 0;

      const feedbackScores = kpis.filter(k => k.feedbackScore !== null).map(k => k.feedbackScore);
      const avgFeedbackScore =
        feedbackScores.length > 0
          ? feedbackScores.reduce((sum, s) => sum + s, 0) / feedbackScores.length
          : 0;

      return {
        role,
        totalTasks,
        completedTasks: completed.length,
        delayedTasks: delayed.length,
        inProgressTasks: inProgress.length,
        avgProcessingTime: Math.round(avgProcessingTime),
        avgProcessingHours: Math.round(avgProcessingTime / 60),
        completionRate: Math.round(completionRate * 100) / 100,
        delayCount,
        delayRate: Math.round(delayRate * 100) / 100,
        avgFeedbackScore: Math.round(avgFeedbackScore * 100) / 100,
        slaThreshold: this.SLA_THRESHOLDS[role],
        filters,
      };
    } catch (error) {
      logger.error('[KPIService] Get role metrics error:', error);
      throw error;
    }
  }

  /**
   * Get KPI metrics for a specific user
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} User KPI metrics
   */
  async getUserMetrics(userId, filters = {}) {
    try {
      const kpis = await this.kpiRepository.findByUser(userId, filters);

      const completed = kpis.filter(k => k.status === this.STATUS.COMPLETED);
      const delayed = kpis.filter(k => k.status === this.STATUS.DELAYED);

      const totalProcessingTime = completed.reduce((sum, k) => sum + k.processingTime, 0);
      const avgProcessingTime = completed.length > 0 ? totalProcessingTime / completed.length : 0;

      const completionRate = kpis.length > 0 ? (completed.length / kpis.length) * 100 : 0;

      const feedbackScores = kpis.filter(k => k.feedbackScore !== null).map(k => k.feedbackScore);
      const avgFeedbackScore =
        feedbackScores.length > 0
          ? feedbackScores.reduce((sum, s) => sum + s, 0) / feedbackScores.length
          : 0;

      return {
        userId,
        totalTasks: kpis.length,
        completedTasks: completed.length,
        delayedTasks: delayed.length,
        avgProcessingTime: Math.round(avgProcessingTime),
        avgProcessingHours: Math.round(avgProcessingTime / 60),
        completionRate: Math.round(completionRate * 100) / 100,
        delayRate: kpis.length > 0 ? Math.round((delayed.length / kpis.length) * 10000) / 100 : 0,
        avgFeedbackScore: Math.round(avgFeedbackScore * 100) / 100,
        filters,
      };
    } catch (error) {
      logger.error('[KPIService] Get user metrics error:', error);
      throw error;
    }
  }

  /**
   * Get overall system metrics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} System-wide metrics
   */
  async getSystemMetrics(filters = {}) {
    try {
      const [reviewerMetrics, inspectorMetrics, approverMetrics] = await Promise.all([
        this.getRoleMetrics(this.ROLES.REVIEWER, filters),
        this.getRoleMetrics(this.ROLES.INSPECTOR, filters),
        this.getRoleMetrics(this.ROLES.APPROVER, filters),
      ]);

      const totalTasks =
        reviewerMetrics.totalTasks + inspectorMetrics.totalTasks + approverMetrics.totalTasks;

      const totalCompleted =
        reviewerMetrics.completedTasks +
        inspectorMetrics.completedTasks +
        approverMetrics.completedTasks;

      const totalDelayed =
        reviewerMetrics.delayedTasks + inspectorMetrics.delayedTasks + approverMetrics.delayedTasks;

      const avgProcessingTime =
        totalCompleted > 0
          ? Math.round(
              (reviewerMetrics.avgProcessingTime * reviewerMetrics.completedTasks +
                inspectorMetrics.avgProcessingTime * inspectorMetrics.completedTasks +
                approverMetrics.avgProcessingTime * approverMetrics.completedTasks) /
                totalCompleted,
            )
          : 0;

      return {
        totalTasks,
        totalCompleted,
        totalDelayed,
        totalInProgress: totalTasks - totalCompleted - totalDelayed,
        avgProcessingTime,
        avgProcessingHours: Math.round(avgProcessingTime / 60),
        completionRate:
          totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 10000) / 100 : 0,
        delayRate: totalTasks > 0 ? Math.round((totalDelayed / totalTasks) * 10000) / 100 : 0,
        byRole: {
          reviewer: reviewerMetrics,
          inspector: inspectorMetrics,
          approver: approverMetrics,
        },
        filters,
      };
    } catch (error) {
      logger.error('[KPIService] Get system metrics error:', error);
      throw error;
    }
  }

  /**
   * Detect and flag delayed tasks
   * @returns {Promise<Array>} List of delayed tasks
   */
  async detectDelayedTasks() {
    try {
      const inProgressTasks = await this.kpiRepository.findByStatus(this.STATUS.IN_PROGRESS);
      const now = new Date();
      const delayedTasks = [];

      for (const task of inProgressTasks) {
        const processingTime = this._calculateProcessingTime(task.startTime, now);
        const isDelayed = this._isDelayed(task.role, processingTime);

        if (isDelayed) {
          // Update task status to delayed
          await this.kpiRepository.update(task.taskId, {
            status: this.STATUS.DELAYED,
            processingTime,
            updatedAt: new Date(),
          });

          delayedTasks.push({
            ...task,
            processingTime,
            hoursOverdue: Math.round(processingTime / 60 - this.SLA_THRESHOLDS[task.role]),
          });

          this.emit('task:delayed', { task, processingTime });
        }
      }

      logger.info(`[KPIService] Detected ${delayedTasks.length} delayed tasks`);
      return delayedTasks;
    } catch (error) {
      logger.error('[KPIService] Detect delayed tasks error:', error);
      throw error;
    }
  }

  /**
   * Get KPI trends over time
   * @param {string} role - Role to analyze (optional)
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Object>} Trend data
   */
  async getTrends(role = null, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const kpis = role
        ? await this.kpiRepository.findByRole(role, { startDate, endDate })
        : await this.kpiRepository.findAll({ startDate, endDate });

      // Group by day
      const dailyMetrics = {};

      for (const kpi of kpis) {
        const date = kpi.createdAt.toISOString().split('T')[0];

        if (!dailyMetrics[date]) {
          dailyMetrics[date] = {
            date,
            total: 0,
            completed: 0,
            delayed: 0,
            totalProcessingTime: 0,
          };
        }

        dailyMetrics[date].total++;

        if (kpi.status === this.STATUS.COMPLETED) {
          dailyMetrics[date].completed++;
          dailyMetrics[date].totalProcessingTime += kpi.processingTime;
        } else if (kpi.status === this.STATUS.DELAYED) {
          dailyMetrics[date].delayed++;
        }
      }

      // Calculate daily metrics
      const trends = Object.values(dailyMetrics).map(day => ({
        ...day,
        completionRate: day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0,
        avgProcessingTime:
          day.completed > 0 ? Math.round(day.totalProcessingTime / day.completed) : 0,
      }));

      return {
        role: role || 'all',
        days,
        startDate,
        endDate,
        trends: trends.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      logger.error('[KPIService] Get trends error:', error);
      throw error;
    }
  }

  /**
   * Calculate processing time in minutes
   * @private
   */
  _calculateProcessingTime(startTime, endTime) {
    return Math.round((endTime - startTime) / (1000 * 60)); // minutes
  }

  /**
   * Check if task is delayed based on SLA
   * @private
   */
  _isDelayed(role, processingTimeMinutes) {
    const slaHours = this.SLA_THRESHOLDS[role] || 72;
    const slaMinutes = slaHours * 60;
    return processingTimeMinutes > slaMinutes;
  }

  /**
   * Generate unique task ID
   * @private
   */
  _generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cancel a task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Updated KPI record
   */
  async cancelTask(taskId) {
    try {
      return await this.kpiRepository.update(taskId, {
        status: this.STATUS.CANCELLED,
        endTime: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      logger.error('[KPIService] Cancel task error:', error);
      throw error;
    }
  }
}

module.exports = KPIService;
