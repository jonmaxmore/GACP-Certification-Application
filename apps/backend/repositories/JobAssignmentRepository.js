/**
 * JobAssignmentRepository
 * Data access layer for JobAssignment collection
 *
 * @module repositories/jobassignment
 * @version 1.0.0
 */

const logger = require('../utils/logger');

class JobAssignmentRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = 'job_assignments';
  }

  /**
   * Get job assignments collection
   * @private
   */
  get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Find assignment by ID
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<Object|null>} Assignment document
   */
  async findById(assignmentId) {
    try {
      return await this.collection.findOne({ _id: assignmentId });
    } catch (error) {
      logger.error('[JobAssignmentRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by user ID
   * @param {string} userId - User ID
   * @param {Object} filters - Optional filters (status, role)
   * @returns {Promise<Array>} List of assignments
   */
  async findByUser(userId, filters = {}) {
    try {
      const query = { assignedTo: userId };

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query.status = { $in: filters.status };
        } else {
          query.status = filters.status;
        }
      }

      if (filters.role) {
        query.role = filters.role;
      }

      return await this.collection.find(query).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByUser error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by application ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Array>} List of assignments
   */
  async findByApplication(applicationId) {
    try {
      return await this.collection.find({ applicationId }).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByApplication error:', error);
      throw error;
    }
  }

  /**
   * Find assignment by application and role
   * @param {string} applicationId - Application ID
   * @param {string} role - User role
   * @returns {Promise<Object|null>} Assignment document
   */
  async findByApplicationAndRole(applicationId, role) {
    try {
      return await this.collection.findOne({
        applicationId,
        role,
        status: { $nin: ['completed', 'cancelled', 'reassigned'] },
      });
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByApplicationAndRole error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by role
   * @param {string} role - User role
   * @param {Object} filters - Optional filters (status)
   * @returns {Promise<Array>} List of assignments
   */
  async findByRole(role, filters = {}) {
    try {
      const query = { role };

      if (filters.status) {
        query.status = filters.status;
      }

      return await this.collection.find(query).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByRole error:', error);
      throw error;
    }
  }

  /**
   * Create new assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  async create(assignmentData) {
    try {
      const result = await this.collection.insertOne({
        ...assignmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        id: result.insertedId,
        ...assignmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      logger.error('[JobAssignmentRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Update assignment
   * @param {string} assignmentId - Assignment ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated assignment
   */
  async update(assignmentId, updateData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: assignmentId },
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
      logger.error('[JobAssignmentRepository] update error:', error);
      throw error;
    }
  }

  /**
   * Delete assignment
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(assignmentId) {
    try {
      const result = await this.collection.deleteOne({ _id: assignmentId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('[JobAssignmentRepository] delete error:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   * @param {Object} filters - Optional filters (role, startDate, endDate)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const query = {};

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.startDate || filters.endDate) {
        query.assignedAt = {};
        if (filters.startDate) {
          query.assignedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.assignedAt.$lte = new Date(filters.endDate);
        }
      }

      const [statusBreakdown, roleBreakdown, strategyBreakdown, avgTimes] = await Promise.all([
        // Status breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
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
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),

        // Strategy breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$strategy',
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),

        // Average times
        this.collection
          .aggregate([
            {
              $match: {
                ...query,
                status: 'completed',
                assignedAt: { $exists: true },
                completedAt: { $exists: true },
              },
            },
            {
              $project: {
                timeToComplete: {
                  $subtract: ['$completedAt', '$assignedAt'],
                },
                timeToAccept: {
                  $cond: [
                    { $ifNull: ['$acceptedAt', false] },
                    { $subtract: ['$acceptedAt', '$assignedAt'] },
                    null,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgTimeToComplete: { $avg: '$timeToComplete' },
                avgTimeToAccept: { $avg: '$timeToAccept' },
              },
            },
          ])
          .toArray(),
      ]);

      const times = avgTimes[0] || {
        avgTimeToComplete: 0,
        avgTimeToAccept: 0,
      };

      return {
        byStatus: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byRole: roleBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStrategy: strategyBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgTimeToComplete: times.avgTimeToComplete
          ? Math.round(times.avgTimeToComplete / 1000 / 60) // Convert to minutes
          : 0,
        avgTimeToAccept: times.avgTimeToAccept
          ? Math.round(times.avgTimeToAccept / 1000 / 60) // Convert to minutes
          : 0,
      };
    } catch (error) {
      logger.error('[JobAssignmentRepository] getStatistics error:', error);
      throw error;
    }
  }

  /**
   * Get active assignment count by user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Count of active assignments
   */
  async getActiveCountByUser(userId) {
    try {
      return await this.collection.countDocuments({
        assignedTo: userId,
        status: { $in: ['assigned', 'accepted', 'in_progress'] },
      });
    } catch (error) {
      logger.error('[JobAssignmentRepository] getActiveCountByUser error:', error);
      throw error;
    }
  }

  /**
   * Find assignments by priority
   * @param {string} priority - Priority level (low/medium/high/urgent)
   * @param {Object} filters - Optional filters (status, role)
   * @returns {Promise<Array>} List of assignments
   */
  async findByPriority(priority, filters = {}) {
    try {
      const query = { priority };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.role) {
        query.role = filters.role;
      }

      return await this.collection.find(query).sort({ assignedAt: -1 }).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findByPriority error:', error);
      throw error;
    }
  }

  /**
   * Find overdue assignments (assigned but not started within threshold)
   * @param {number} hoursThreshold - Hours threshold (default 24)
   * @returns {Promise<Array>} List of overdue assignments
   */
  async findOverdue(hoursThreshold = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hoursThreshold);

      return await this.collection
        .find({
          status: { $in: ['assigned', 'accepted'] },
          assignedAt: { $lte: cutoffDate },
        })
        .sort({ assignedAt: 1 })
        .toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findOverdue error:', error);
      throw error;
    }
  }

  /**
   * Get user workload (active assignments)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Workload summary
   */
  async getUserWorkload(userId) {
    try {
      const [total, byStatus, byPriority] = await Promise.all([
        // Total active
        this.collection.countDocuments({
          assignedTo: userId,
          status: { $in: ['assigned', 'accepted', 'in_progress'] },
        }),

        // By status
        this.collection
          .aggregate([
            {
              $match: {
                assignedTo: userId,
                status: { $in: ['assigned', 'accepted', 'in_progress'] },
              },
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),

        // By priority
        this.collection
          .aggregate([
            {
              $match: {
                assignedTo: userId,
                status: { $in: ['assigned', 'accepted', 'in_progress'] },
              },
            },
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]);

      return {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('[JobAssignmentRepository] getUserWorkload error:', error);
      throw error;
    }
  }

  /**
   * Find recent assignments
   * @param {number} limit - Number of records
   * @returns {Promise<Array>} List of assignments
   */
  async findRecent(limit = 10) {
    try {
      return await this.collection.find().sort({ assignedAt: -1 }).limit(limit).toArray();
    } catch (error) {
      logger.error('[JobAssignmentRepository] findRecent error:', error);
      throw error;
    }
  }
}

module.exports = JobAssignmentRepository;
