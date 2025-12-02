/**
 * KPIRepository
 * Data access layer for KPI collection
 *
 * @module repositories/kpi
 * @version 1.0.0
 */

const logger = require('../utils/logger');

class KPIRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = 'kpis';
  }

  /**
   * Get KPI collection
   * @private
   */
  get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Find KPI by task ID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object|null>} KPI document
   */
  async findByTaskId(taskId) {
    try {
      return await this.collection.findOne({ taskId });
    } catch (error) {
      logger.error('[KPIRepository] findByTaskId error:', error);
      throw error;
    }
  }

  /**
   * Find KPIs by application ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Array>} List of KPIs
   */
  async findByApplication(applicationId) {
    try {
      return await this.collection.find({ applicationId }).sort({ startTime: -1 }).toArray();
    } catch (error) {
      logger.error('[KPIRepository] findByApplication error:', error);
      throw error;
    }
  }

  /**
   * Find KPIs by role
   * @param {string} role - User role (reviewer/inspector/approver)
   * @param {Object} filters - Optional filters (status, startDate, endDate)
   * @returns {Promise<Array>} List of KPIs
   */
  async findByRole(role, filters = {}) {
    try {
      const query = { role };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) {
          query.startTime.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.startTime.$lte = new Date(filters.endDate);
        }
      }

      return await this.collection.find(query).sort({ startTime: -1 }).toArray();
    } catch (error) {
      logger.error('[KPIRepository] findByRole error:', error);
      throw error;
    }
  }

  /**
   * Find KPIs by user ID
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (status, startDate, endDate)
   * @returns {Promise<Array>} List of KPIs
   */
  async findByUser(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) {
          query.startTime.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.startTime.$lte = new Date(filters.endDate);
        }
      }

      return await this.collection.find(query).sort({ startTime: -1 }).toArray();
    } catch (error) {
      logger.error('[KPIRepository] findByUser error:', error);
      throw error;
    }
  }

  /**
   * Find KPIs by status
   * @param {string} status - Status (pending/in_progress/completed/delayed/cancelled)
   * @returns {Promise<Array>} List of KPIs
   */
  async findByStatus(status) {
    try {
      return await this.collection.find({ status }).sort({ startTime: -1 }).toArray();
    } catch (error) {
      logger.error('[KPIRepository] findByStatus error:', error);
      throw error;
    }
  }

  /**
   * Find delayed tasks (in_progress past SLA threshold)
   * @returns {Promise<Array>} List of delayed KPIs
   */
  async findDelayed() {
    try {
      return await this.collection
        .find({
          status: { $in: ['in_progress', 'delayed'] },
        })
        .sort({ startTime: 1 })
        .toArray();
    } catch (error) {
      logger.error('[KPIRepository] findDelayed error:', error);
      throw error;
    }
  }

  /**
   * Create new KPI record
   * @param {Object} kpiData - KPI data
   * @returns {Promise<Object>} Created KPI
   */
  async create(kpiData) {
    try {
      const result = await this.collection.insertOne({
        ...kpiData,
        createdAt: new Date(),
      });

      return {
        id: result.insertedId,
        ...kpiData,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('[KPIRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Update KPI record
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated KPI
   */
  async update(taskId, updateData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { taskId },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      );

      return result.value;
    } catch (error) {
      logger.error('[KPIRepository] update error:', error);
      throw error;
    }
  }

  /**
   * Delete KPI record
   * @param {string} taskId - Task ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(taskId) {
    try {
      const result = await this.collection.deleteOne({ taskId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('[KPIRepository] delete error:', error);
      throw error;
    }
  }

  /**
   * Get role metrics statistics
   * @param {string} role - User role
   * @param {Object} filters - Optional filters (startDate, endDate)
   * @returns {Promise<Object>} Role metrics
   */
  async getRoleMetrics(role, filters = {}) {
    try {
      const query = { role };

      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) {
          query.startTime.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.startTime.$lte = new Date(filters.endDate);
        }
      }

      const metrics = await this.collection
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
              completedTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
              delayedTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
              },
              inProgressTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
              },
              avgProcessingTime: {
                $avg: {
                  $cond: [{ $ifNull: ['$processingTime', false] }, '$processingTime', null],
                },
              },
              avgFeedbackScore: {
                $avg: {
                  $cond: [{ $ifNull: ['$feedbackScore', false] }, '$feedbackScore', null],
                },
              },
            },
          },
        ])
        .toArray();

      return (
        metrics[0] || {
          totalTasks: 0,
          completedTasks: 0,
          delayedTasks: 0,
          inProgressTasks: 0,
          avgProcessingTime: 0,
          avgFeedbackScore: 0,
        }
      );
    } catch (error) {
      logger.error('[KPIRepository] getRoleMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get user metrics statistics
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (startDate, endDate)
   * @returns {Promise<Object>} User metrics
   */
  async getUserMetrics(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) {
          query.startTime.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.startTime.$lte = new Date(filters.endDate);
        }
      }

      const metrics = await this.collection
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
              completedTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
              delayedTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
              },
              avgProcessingTime: {
                $avg: {
                  $cond: [{ $ifNull: ['$processingTime', false] }, '$processingTime', null],
                },
              },
              avgFeedbackScore: {
                $avg: {
                  $cond: [{ $ifNull: ['$feedbackScore', false] }, '$feedbackScore', null],
                },
              },
            },
          },
        ])
        .toArray();

      return (
        metrics[0] || {
          totalTasks: 0,
          completedTasks: 0,
          delayedTasks: 0,
          avgProcessingTime: 0,
          avgFeedbackScore: 0,
        }
      );
    } catch (error) {
      logger.error('[KPIRepository] getUserMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get system-wide metrics
   * @param {Object} filters - Optional filters (startDate, endDate)
   * @returns {Promise<Object>} System metrics
   */
  async getSystemMetrics(filters = {}) {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.startTime = {};
        if (filters.startDate) {
          query.startTime.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.startTime.$lte = new Date(filters.endDate);
        }
      }

      const [overallMetrics, roleBreakdown] = await Promise.all([
        // Overall metrics
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
                delayedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
                },
                avgProcessingTime: {
                  $avg: {
                    $cond: [{ $ifNull: ['$processingTime', false] }, '$processingTime', null],
                  },
                },
              },
            },
          ])
          .toArray(),

        // Role breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$role',
                totalTasks: { $sum: 1 },
                completedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
                delayedTasks: {
                  $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
                },
              },
            },
          ])
          .toArray(),
      ]);

      const overall = overallMetrics[0] || {
        totalTasks: 0,
        completedTasks: 0,
        delayedTasks: 0,
        avgProcessingTime: 0,
      };

      return {
        ...overall,
        byRole: roleBreakdown.reduce((acc, item) => {
          acc[item._id] = {
            totalTasks: item.totalTasks,
            completedTasks: item.completedTasks,
            delayedTasks: item.delayedTasks,
          };
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('[KPIRepository] getSystemMetrics error:', error);
      throw error;
    }
  }

  /**
   * Get daily trends for specified period
   * @param {string} role - User role (optional)
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} Daily trend data
   */
  async getDailyTrends(role = null, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const query = {
        startTime: { $gte: startDate },
      };

      if (role) {
        query.role = role;
      }

      const trends = await this.collection
        .aggregate([
          { $match: query },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
              },
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
              delayed: {
                $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] },
              },
              avgProcessingTime: {
                $avg: {
                  $cond: [{ $ifNull: ['$processingTime', false] }, '$processingTime', null],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      return trends.map(item => ({
        date: item._id,
        total: item.total,
        completed: item.completed,
        delayed: item.delayed,
        completionRate: item.total > 0 ? ((item.completed / item.total) * 100).toFixed(2) : 0,
        avgProcessingTime: item.avgProcessingTime || 0,
      }));
    } catch (error) {
      logger.error('[KPIRepository] getDailyTrends error:', error);
      throw error;
    }
  }
}

module.exports = KPIRepository;
