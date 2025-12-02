/**
 * ApplicationRepository
 * Data access layer for Application collection using Mongoose
 *
 * @module repositories/application
 * @version 2.1.0
 */

const logger = require('../shared/logger');
const Application = require('../models/Application');
const { ApplicationStatus } = require('../models/Application');

class ApplicationRepository {
  constructor() {
    this.model = Application;
  }

  /**
   * Find application by ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object|null>} Application document
   */
  async findById(applicationId) {
    try {
      return await this.model.findById(applicationId)
        .populate('applicant')
        .populate('assignedOfficer')
        .populate('assignedInspector');
    } catch (error) {
      logger.error('[ApplicationRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find application by ID (lean version for performance)
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object|null>} Plain object
   */
  async findByIdLean(applicationId) {
    try {
      return await this.model.findById(applicationId).lean();
    } catch (error) {
      logger.error('[ApplicationRepository] findByIdLean error:', error);
      throw error;
    }
  }

  /**
   * Find active application for a farmer
   * @param {string} farmerId
   * @returns {Promise<Object|null>}
   */
  async findActiveByFarmer(farmerId) {
    try {
      return await this.model.findOne({
        applicant: farmerId,
        currentStatus: {
          $nin: [
            ApplicationStatus.APPROVED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.CERTIFICATE_ISSUED
          ],
        },
      });
    } catch (error) {
      logger.error('[ApplicationRepository] findActiveByFarmer error:', error);
      throw error;
    }
  }

  /**
   * Find applications by farmer ID
   * @param {string} farmerId - Farmer ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} List of applications
   */
  async findByFarmer(farmerId, filters = {}) {
    try {
      const query = { applicant: farmerId };

      if (filters.status) {
        query.currentStatus = filters.status;
      }

      return await this.model.find(query)
        .sort({ submissionDate: -1 })
        .populate('assignedOfficer', 'name email');
    } catch (error) {
      logger.error('[ApplicationRepository] findByFarmer error:', error);
      throw error;
    }
  }

  /**
   * Find applications by status
   * @param {string} status - Application status
   * @returns {Promise<Array>} List of applications
   */
  async findByStatus(status) {
    try {
      return await this.model.find({ currentStatus: status })
        .populate('applicant', 'name email phone')
        .sort({ submissionDate: -1 });
    } catch (error) {
      logger.error('[ApplicationRepository] findByStatus error:', error);
      throw error;
    }
  }

  /**
   * Create new application
   * @param {Object} applicationData - Application data
   * @param {Object} session - Mongoose session (optional)
   * @returns {Promise<Object>} Created application document
   */
  async create(applicationData, session = null) {
    try {
      const application = new this.model(applicationData);

      // If session is provided, save with session
      if (session) {
        await application.save({ session });
      } else {
        await application.save();
      }

      return application;
    } catch (error) {
      logger.error('[ApplicationRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Update application
   * @param {string} applicationId - Application ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated application
   */
  async update(applicationId, updateData) {
    try {
      return await this.model.findByIdAndUpdate(
        applicationId,
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error('[ApplicationRepository] update error:', error);
      throw error;
    }
  }

  /**
   * Save an application document
   * Useful when modifying the document instance directly
   * @param {Object} application - Mongoose document
   * @returns {Promise<Object>} Saved document
   */
  async save(application) {
    try {
      return await application.save();
    } catch (error) {
      logger.error('[ApplicationRepository] save error:', error);
      throw error;
    }
  }

  /**
   * Delete application
   * @param {string} applicationId - Application ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(applicationId) {
    try {
      const result = await this.model.deleteOne({ _id: applicationId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('[ApplicationRepository] delete error:', error);
      throw error;
    }
  }

  /**
   * Get application statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.submissionDate = {};
        if (filters.startDate) {
          query.submissionDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.submissionDate.$lte = new Date(filters.endDate);
        }
      }

      const [totalCount, statusBreakdown] = await Promise.all([
        this.model.countDocuments(query),
        this.model.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$currentStatus',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      return {
        total: totalCount,
        byStatus: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('[ApplicationRepository] getStatistics error:', error);
      throw error;
    }
  }

  /**
   * Find all applications with pagination and sorting
   * @param {Object} query - Mongoose query object
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Array>} List of applications
   */
  async findAll(query = {}, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { createdAt: -1 };

      return await this.model.find(query)
        .populate('applicant')
        .populate('assignedOfficer')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      logger.error('[ApplicationRepository] findAll error:', error);
      throw error;
    }
  }

  /**
   * Count documents matching query
   * @param {Object} query - Mongoose query object
   * @returns {Promise<number>} Count
   */
  async count(query = {}) {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      logger.error('[ApplicationRepository] count error:', error);
      throw error;
    }
  }

  /**
   * Start a transaction session
   * @returns {Promise<Object>} Mongoose session
   */
  async startSession() {
    return await this.model.startSession();
  }
}

module.exports = ApplicationRepository;
