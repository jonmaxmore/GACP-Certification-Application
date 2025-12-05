/**
 * Application Repository
 *
 * Data access layer for GACP certification applications.
 * Implements Repository pattern with MongoDB integration.
 *
 * Features:
 * - CRUD operations with validation
 * - Complex queries with aggregation
 * - Pagination and sorting
 * - Indexing for performance
 * - Transaction support
 * - Audit trail integration
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const mongoose = require('mongoose');
const Application = require('../infrastructure/models/Application');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('application-repository');

class ApplicationRepository {
  constructor() {
    this.model = Application;
  }

  /**
   * Create new application
   * @param {Object} applicationData - Application data
   * @returns {Promise<Object>} - Created application
   */
  async create(applicationData) {
    try {
      const application = new this.model(applicationData);
      const savedApplication = await application.save();

      // Populate references for return
      await savedApplication.populate([
        { path: 'farmerId', select: 'firstName lastName email phone' },
        { path: 'documents.uploadedBy', select: 'firstName lastName' },
      ]);

      return savedApplication.toObject();
    } catch (error) {
      logger.error('[ApplicationRepository] Error creating application:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Find application by ID
   * @param {string} id - Application ID
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} - Application or null
   */
  async findById(id, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      let query = this.model.findById(id);

      // Apply population if requested
      if (options.populate !== false) {
        query = query.populate([
          { path: 'farmerId', select: 'firstName lastName email phone role' },
          { path: 'documents.uploadedBy', select: 'firstName lastName' },
          { path: 'review.reviewerId', select: 'firstName lastName role' },
          { path: 'inspection.inspectorId', select: 'firstName lastName role' },
          { path: 'approval.adminId', select: 'firstName lastName role' },
        ]);
      }

      const application = await query.lean();
      return application;
    } catch (error) {
      logger.error('[ApplicationRepository] Error finding application by ID:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Find application by application number
   * @param {string} applicationNumber - Application number
   * @returns {Promise<Object|null>} - Application or null
   */
  async findByApplicationNumber(applicationNumber) {
    try {
      const application = await this.model
        .findOne({ applicationNumber })
        .populate([
          { path: 'farmerId', select: 'firstName lastName email phone' },
          { path: 'documents.uploadedBy', select: 'firstName lastName' },
        ])
        .lean();

      return application;
    } catch (error) {
      logger.error('[ApplicationRepository] Error finding by application number:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Update application
   * @param {string} id - Application ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} - Updated application
   */
  async update(id, updateData, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid application ID');
      }

      // Add updatedAt timestamp
      updateData.updatedAt = new Date();

      const updatedApplication = await this.model
        .findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
          ...options,
        })
        .populate([
          { path: 'farmerId', select: 'firstName lastName email phone' },
          { path: 'documents.uploadedBy', select: 'firstName lastName' },
        ])
        .lean();

      if (!updatedApplication) {
        throw new Error('Application not found');
      }

      return updatedApplication;
    } catch (error) {
      logger.error('[ApplicationRepository] Error updating application:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Delete application (soft delete)
   * @param {string} id - Application ID
   * @returns {Promise<boolean>} - Success status
   */
  async delete(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid application ID');
      }

      const result = await this.model.findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
          isDeleted: true,
        },
        { new: true },
      );

      return !!result;
    } catch (error) {
      logger.error('[ApplicationRepository] Error deleting application:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Find applications with filters and pagination
   * @param {Object} filters - Query filters
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} - Paginated results
   */
  async findWithPagination(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        populate = true,
      } = options;

      // Build query filters
      const query = this._buildQuery(filters);

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute queries in parallel
      const [applications, totalCount] = await Promise.all([
        this._buildFindQuery(query, { skip, limit, sort: sortOptions, populate }),
        this.model.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error('[ApplicationRepository] Error in findWithPagination:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Find applications by farmer ID
   * @param {string} farmerId - Farmer ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Farmer's applications
   */
  async findByFarmerId(farmerId, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        throw new Error('Invalid farmer ID');
      }

      const filters = { farmerId, isDeleted: { $ne: true } };
      return await this.findWithPagination(filters, options);
    } catch (error) {
      logger.error('[ApplicationRepository] Error finding by farmer ID:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Find applications by status
   * @param {string} status - Application status
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Applications with status
   */
  async findByStatus(status, options = {}) {
    try {
      const filters = { status, isDeleted: { $ne: true } };
      return await this.findWithPagination(filters, options);
    } catch (error) {
      logger.error('[ApplicationRepository] Error finding by status:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Count applications created today
   * @returns {Promise<number>} - Count of today's applications
   */
  async countToday() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const count = await this.model.countDocuments({
        createdAt: {
          $gte: today,
          $lt: tomorrow,
        },
        isDeleted: { $ne: true },
      });

      return count;
    } catch (error) {
      logger.error('[ApplicationRepository] Error counting today applications:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Get applications dashboard statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Dashboard statistics
   */
  async getDashboardStats(filters = {}) {
    try {
      const baseQuery = this._buildQuery(filters);

      const stats = await this.model.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
            under_review: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } },
            payment_pending: { $sum: { $cond: [{ $eq: ['$status', 'payment_pending'] }, 1, 0] } },
            payment_verified: { $sum: { $cond: [{ $eq: ['$status', 'payment_verified'] }, 1, 0] } },
            inspection_scheduled: {
              $sum: { $cond: [{ $eq: ['$status', 'inspection_scheduled'] }, 1, 0] },
            },
            inspection_completed: {
              $sum: { $cond: [{ $eq: ['$status', 'inspection_completed'] }, 1, 0] },
            },
            phase2_payment_pending: {
              $sum: { $cond: [{ $eq: ['$status', 'phase2_payment_pending'] }, 1, 0] },
            },
            phase2_payment_verified: {
              $sum: { $cond: [{ $eq: ['$status', 'phase2_payment_verified'] }, 1, 0] },
            },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            certificate_issued: {
              $sum: { $cond: [{ $eq: ['$status', 'certificate_issued'] }, 1, 0] },
            },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
          },
        },
      ]);

      return (
        stats[0] || {
          total: 0,
          draft: 0,
          submitted: 0,
          under_review: 0,
          payment_pending: 0,
          payment_verified: 0,
          inspection_scheduled: 0,
          inspection_completed: 0,
          phase2_payment_pending: 0,
          phase2_payment_verified: 0,
          approved: 0,
          certificate_issued: 0,
          rejected: 0,
          expired: 0,
        }
      );
    } catch (error) {
      logger.error('[ApplicationRepository] Error getting dashboard stats:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Get applications requiring action by role
   * @param {string} role - User role (DTAM_REVIEWER, DTAM_INSPECTOR, etc.)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Applications requiring action
   */
  async findRequiringAction(role, options = {}) {
    try {
      let statusFilters = [];

      switch (role) {
        case 'DTAM_REVIEWER':
          statusFilters = ['under_review'];
          break;
        case 'DTAM_INSPECTOR':
          statusFilters = ['payment_verified', 'inspection_scheduled'];
          break;
        case 'DTAM_ADMIN':
          statusFilters = ['phase2_payment_verified'];
          break;
        default:
          statusFilters = [];
      }

      if (statusFilters.length === 0) {
        return { data: [], pagination: { totalItems: 0 } };
      }

      const filters = {
        status: { $in: statusFilters },
        isDeleted: { $ne: true },
      };

      return await this.findWithPagination(filters, options);
    } catch (error) {
      logger.error('[ApplicationRepository] Error finding applications requiring action:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Find expired applications
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Expired applications
   */
  async findExpired(options = {}) {
    try {
      const filters = {
        expiresAt: { $lt: new Date() },
        status: { $nin: ['certificate_issued', 'rejected', 'expired'] },
        isDeleted: { $ne: true },
      };

      return await this.findWithPagination(filters, options);
    } catch (error) {
      logger.error('[ApplicationRepository] Error finding expired applications:', error);
      throw this._handleDatabaseError(error);
    }
  }

  /**
   * Update multiple applications (bulk update)
   * @param {Object} filter - Query filter
   * @param {Object} update - Update data
   * @returns {Promise<Object>} - Update result
   */
  async updateMany(filter, update) {
    try {
      update.updatedAt = new Date();

      const result = await this.model.updateMany(filter, update);
      return result;
    } catch (error) {
      logger.error('[ApplicationRepository] Error in bulk update:', error);
      throw this._handleDatabaseError(error);
    }
  }

  // Private helper methods

  _buildQuery(filters) {
    const query = { isDeleted: { $ne: true } };

    // Add filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        query[key] = filters[key];
      }
    });

    return query;
  }

  async _buildFindQuery(query, options) {
    let findQuery = this.model.find(query);

    // Apply pagination
    if (options.skip) {
      findQuery = findQuery.skip(options.skip);
    }
    if (options.limit) {
      findQuery = findQuery.limit(options.limit);
    }

    // Apply sorting
    if (options.sort) {
      findQuery = findQuery.sort(options.sort);
    }

    // Apply population
    if (options.populate) {
      findQuery = findQuery.populate([
        { path: 'farmerId', select: 'firstName lastName email phone' },
        { path: 'documents.uploadedBy', select: 'firstName lastName' },
        { path: 'review.reviewerId', select: 'firstName lastName' },
        { path: 'inspection.inspectorId', select: 'firstName lastName' },
        { path: 'approval.adminId', select: 'firstName lastName' },
      ]);
    }

    return await findQuery.lean();
  }

  _handleDatabaseError(error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));
      return new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    if (error.name === 'CastError') {
      return new Error('Invalid ID format');
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return new Error(`Duplicate value for field: ${field}`);
    }

    return error;
  }
}

module.exports = ApplicationRepository;
