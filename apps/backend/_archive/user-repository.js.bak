/**
 * UserRepository
 * Data access layer for User collection using Mongoose
 *
 * @module repositories/user
 * @version 1.0.0
 */

const logger = require('../shared/logger');
const User = require('../models/User');

class UserRepository {
  constructor() {
    this.model = User;
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User document
   */
  async findById(userId) {
    try {
      return await this.model.findById(userId);
    } catch (error) {
      logger.error('[UserRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find user by ID with password (for auth)
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User document with password
   */
  async findByIdWithPassword(userId) {
    try {
      return await this.model.findById(userId).select('+password');
    } catch (error) {
      logger.error('[UserRepository] findByIdWithPassword error:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} User document
   */
  async findByEmail(email) {
    try {
      return await this.model.findOne({
        email: email.toLowerCase(),
        isActive: true,
      });
    } catch (error) {
      logger.error('[UserRepository] findByEmail error:', error);
      throw error;
    }
  }

  /**
   * Find user by email with password (for auth)
   * @param {string} email - Email address
   * @returns {Promise<Object|null>} User document with password
   */
  async findByEmailWithPassword(email) {
    try {
      return await this.model.findOne({
        email: email.toLowerCase(),
        isActive: true,
      }).select('+password');
    } catch (error) {
      logger.error('[UserRepository] findByEmailWithPassword error:', error);
      throw error;
    }
  }

  /**
   * Find user by username or email (for DTAM login)
   * @param {string} identifier - Username or Email
   * @returns {Promise<Object|null>} User document with password
   */
  async findByUsernameOrEmail(identifier) {
    try {
      return await this.model.findOne({
        $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
        isActive: true,
      }).select('+password');
    } catch (error) {
      logger.error('[UserRepository] findByUsernameOrEmail error:', error);
      throw error;
    }
  }

  /**
   * Find user by National ID
   * @param {string} nationalId - National ID
   * @returns {Promise<Object|null>} User document
   */
  async findByNationalId(nationalId) {
    try {
      return await this.model.findOne({ nationalId });
    } catch (error) {
      logger.error('[UserRepository] findByNationalId error:', error);
      throw error;
    }
  }

  /**
   * Find user by verification token
   * @param {string} token - Hashed token
   * @param {string} type - Token type ('email' or 'password')
   * @returns {Promise<Object|null>} User document
   */
  async findByToken(token, type) {
    try {
      const query = { isActive: true };
      if (type === 'email') {
        query.emailVerificationToken = token;
        query.emailVerificationExpires = { $gt: Date.now() };
      } else if (type === 'password') {
        query.passwordResetToken = token;
        query.passwordResetExpires = { $gt: Date.now() };
      }
      return await this.model.findOne(query);
    } catch (error) {
      logger.error('[UserRepository] findByToken error:', error);
      throw error;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user document
   */
  async create(userData) {
    try {
      const user = new this.model(userData);
      await user.save();
      return user;
    } catch (error) {
      logger.error('[UserRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object|null>} Updated user
   */
  async update(userId, updateData) {
    try {
      return await this.model.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error('[UserRepository] update error:', error);
      throw error;
    }
  }

  /**
   * Save user document
   * @param {Object} user - User document
   * @returns {Promise<Object>} Saved user
   */
  async save(user) {
    try {
      return await user.save();
    } catch (error) {
      logger.error('[UserRepository] save error:', error);
      throw error;
    }
  }

  /**
   * Update login history
   * @param {string} userId - User ID
   * @param {Object} historyEntry - Login history entry
   * @returns {Promise<void>}
   */
  async updateLoginHistory(userId, historyEntry) {
    try {
      await this.model.updateOne(
        { _id: userId },
        {
          $set: { lastLogin: new Date() },
          $push: {
            loginHistory: {
              $each: [historyEntry],
              $position: 0,
              $slice: 10,
            },
          },
        }
      );
    } catch (error) {
      logger.error('[UserRepository] updateLoginHistory error:', error);
      throw error;
    }
  }

  /**
   * Find available officers
   * @param {string} province - Province name
   * @returns {Promise<Array>} List of officers
   */
  async findAvailableOfficers(province) {
    try {
      return await this.model.find({
        role: 'officer',
        'workLocation.provinces': province,
        isActive: true,
      }).sort({ 'workload.activeApplications': 1 });
    } catch (error) {
      logger.error('[UserRepository] findAvailableOfficers error:', error);
      throw error;
    }
  }

  /**
   * Find available auditors
   * @param {string} province - Province name
   * @param {Array} cropTypes - List of crop types
   * @returns {Promise<Array>} List of auditors
   */
  async findAvailableAuditors(province, cropTypes = []) {
    try {
      const query = {
        role: 'auditor',
        'workLocation.provinces': province,
        isActive: true,
      };

      if (cropTypes.length > 0) {
        query['expertise.cropTypes'] = { $in: cropTypes };
      }

      return await this.model.find(query).sort({ 'workload.scheduledInspections': 1 });
    } catch (error) {
      logger.error('[UserRepository] findAvailableAuditors error:', error);
      throw error;
    }
  }

  /**
   * Get active user statistics
   * @returns {Promise<Array>} Statistics
   */
  async getActiveUserStats() {
    try {
      return await this.model.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            avgWorkload: { $avg: '$workload.activeApplications' },
          },
        },
      ]);
    } catch (error) {
      logger.error('[UserRepository] getActiveUserStats error:', error);
      throw error;
    }
  }
}

module.exports = UserRepository;

