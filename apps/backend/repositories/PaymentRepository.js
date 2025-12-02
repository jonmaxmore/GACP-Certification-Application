/**
 * PaymentRepository
 * Data access layer for Payment collection
 *
 * @module repositories/payment
 * @version 1.0.0
 */

const logger = require('../utils/logger');

class PaymentRepository {
  constructor(database) {
    this.db = database;
    this.collectionName = 'payments';
  }

  /**
   * Get payments collection
   * @private
   */
  get collection() {
    return this.db.collection(this.collectionName);
  }

  /**
   * Find payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object|null>} Payment document
   */
  async findById(paymentId) {
    try {
      return await this.collection.findOne({ _id: paymentId });
    } catch (error) {
      logger.error('[PaymentRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find payments by application ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<Array>} List of payments
   */
  async findByApplication(applicationId) {
    try {
      return await this.collection.find({ applicationId }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      logger.error('[PaymentRepository] findByApplication error:', error);
      throw error;
    }
  }

  /**
   * Find payments by farmer ID
   * @param {string} farmerId - Farmer ID
   * @param {Object} filters - Optional filters (status, type)
   * @returns {Promise<Array>} List of payments
   */
  async findByFarmer(farmerId, filters = {}) {
    try {
      const query = { farmerId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      return await this.collection.find(query).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      logger.error('[PaymentRepository] findByFarmer error:', error);
      throw error;
    }
  }

  /**
   * Find payment by application and type
   * @param {string} applicationId - Application ID
   * @param {string} type - Payment type (initial/resubmission)
   * @returns {Promise<Object|null>} Payment document
   */
  async findByApplicationAndType(applicationId, type) {
    try {
      return await this.collection.findOne({
        applicationId,
        type,
      });
    } catch (error) {
      logger.error('[PaymentRepository] findByApplicationAndType error:', error);
      throw error;
    }
  }

  /**
   * Create new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment
   */
  async create(paymentData) {
    try {
      const result = await this.collection.insertOne({
        ...paymentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        id: result.insertedId,
        ...paymentData,
      };
    } catch (error) {
      logger.error('[PaymentRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Update payment
   * @param {string} paymentId - Payment ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated payment
   */
  async update(paymentId, updateData) {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: paymentId },
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
      logger.error('[PaymentRepository] update error:', error);
      throw error;
    }
  }

  /**
   * Delete payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(paymentId) {
    try {
      const result = await this.collection.deleteOne({ _id: paymentId });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('[PaymentRepository] delete error:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - Optional filters (startDate, endDate, status, type)
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const query = {};

      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate);
        }
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      const [totalResult, statusBreakdown, typeBreakdown] = await Promise.all([
        // Total count and sum
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
              },
            },
          ])
          .toArray(),

        // Status breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                amount: { $sum: '$amount' },
              },
            },
          ])
          .toArray(),

        // Type breakdown
        this.collection
          .aggregate([
            { $match: query },
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                amount: { $sum: '$amount' },
              },
            },
          ])
          .toArray(),
      ]);

      const total = totalResult[0] || { totalCount: 0, totalAmount: 0 };

      return {
        total: {
          count: total.totalCount,
          amount: total.totalAmount,
        },
        byStatus: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            amount: item.amount,
          };
          return acc;
        }, {}),
        byType: typeBreakdown.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            amount: item.amount,
          };
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('[PaymentRepository] getStatistics error:', error);
      throw error;
    }
  }

  /**
   * Find pending payments older than specified days
   * @param {number} days - Number of days
   * @returns {Promise<Array>} List of overdue payments
   */
  async findOverdue(days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return await this.collection
        .find({
          status: 'pending',
          createdAt: { $lte: cutoffDate },
        })
        .sort({ createdAt: 1 })
        .toArray();
    } catch (error) {
      logger.error('[PaymentRepository] findOverdue error:', error);
      throw error;
    }
  }

  /**
   * Get payment count by status
   * @param {string} status - Payment status
   * @returns {Promise<number>} Count
   */
  async countByStatus(status) {
    try {
      return await this.collection.countDocuments({ status });
    } catch (error) {
      logger.error('[PaymentRepository] countByStatus error:', error);
      throw error;
    }
  }

  /**
   * Find recent payments
   * @param {number} limit - Number of records
   * @returns {Promise<Array>} List of payments
   */
  async findRecent(limit = 10) {
    try {
      return await this.collection.find().sort({ createdAt: -1 }).limit(limit).toArray();
    } catch (error) {
      logger.error('[PaymentRepository] findRecent error:', error);
      throw error;
    }
  }
}

module.exports = PaymentRepository;
