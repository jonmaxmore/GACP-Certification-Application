/**
 * User Repository
 *
 * Data access layer for user management with optimized queries and caching.
 * Implements repository pattern for clean separation of data access logic.
 *
 * Features:
 * - CRUD operations with validation
 * - Performance-optimized queries
 * - Pagination and filtering
 * - Search functionality
 * - Geospatial queries for farm locations
 * - Role-based user management
 * - Audit trail integration
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const User = require('../models/User');
const mongoose = require('mongoose');

class UserRepository {
  constructor(dependencies = {}) {
    this.cacheService = dependencies.cacheService;
    this.auditService = dependencies.auditService;

    // Cache TTL configurations
    this.cacheTTL = {
      user: 15 * 60, // 15 minutes
      userList: 5 * 60, // 5 minutes
      search: 10 * 60, // 10 minutes
    };

    logger.info('[UserRepository] Initialized successfully');
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} - Created user
   */
  async create(userData) {
    try {
      // Validate required fields
      this._validateUserData(userData);

      // Check if email already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Create user
      const user = new User(userData);
      const savedUser = await user.save();

      // Clear relevant caches
      await this._clearUserListCaches();

      // Log user creation
      if (this.auditService) {
        await this.auditService.log({
          type: 'USER_CREATED',
          userId: savedUser.id,
          details: {
            email: savedUser.email,
            role: savedUser.role,
            createdBy: userData.createdBy,
          },
          timestamp: new Date(),
        });
      }

      return savedUser;
    } catch (error) {
      logger.error('[UserRepository] Create user error:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - User or null
   */
  async findById(userId, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }

      const cacheKey = `user:${userId}:${JSON.stringify(options)}`;

      // Try cache first
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Build query
      let query = User.findById(userId);

      // Apply options
      if (options.select) {
        query = query.select(options.select);
      }

      if (options.populate) {
        query = query.populate(options.populate);
      }

      const user = await query.exec();

      // Cache result
      if (this.cacheService && user) {
        await this.cacheService.set(cacheKey, user, this.cacheTTL.user);
      }

      return user;
    } catch (error) {
      logger.error('[UserRepository] Find by ID error:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - User or null
   */
  async findByEmail(email, options = {}) {
    try {
      if (!email) {
        return null;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const cacheKey = `user:email:${normalizedEmail}:${JSON.stringify(options)}`;

      // Try cache first
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Build query
      let query = User.findByEmail(normalizedEmail);

      // Apply options
      if (options.select) {
        query = query.select(options.select);
      }

      if (options.includePassword) {
        query = query.select('+passwordHash +passwordResetToken +passwordResetExpiry');
      }

      const user = await query.exec();

      // Cache result
      if (this.cacheService && user) {
        await this.cacheService.set(cacheKey, user, this.cacheTTL.user);
      }

      return user;
    } catch (error) {
      logger.error('[UserRepository] Find by email error:', error);
      throw error;
    }
  }

  /**
   * Find one user by query
   * @param {Object} query - MongoDB query
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - User or null
   */
  async findOne(query, options = {}) {
    try {
      let mongoQuery = User.findOne(query);

      if (options.select) {
        mongoQuery = mongoQuery.select(options.select);
      }

      if (options.populate) {
        mongoQuery = mongoQuery.populate(options.populate);
      }

      return await mongoQuery.exec();
    } catch (error) {
      logger.error('[UserRepository] Find one error:', error);
      throw error;
    }
  }

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object>} - Updated user
   */
  async update(userId, updateData, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      // Remove sensitive fields that shouldn't be updated directly
      const sanitizedData = { ...updateData };
      delete sanitizedData._id;
      delete sanitizedData.__v;
      delete sanitizedData.createdAt;

      // Set updatedAt
      sanitizedData.updatedAt = new Date();

      const updateOptions = {
        new: true,
        runValidators: true,
        ...options,
      };

      const updatedUser = await User.findByIdAndUpdate(userId, sanitizedData, updateOptions);

      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Clear caches
      await this._clearUserCaches(userId);
      await this._clearUserListCaches();

      // Log user update
      if (this.auditService) {
        await this.auditService.log({
          type: 'USER_UPDATED',
          userId,
          details: {
            updatedFields: Object.keys(sanitizedData),
            updatedBy: options.updatedBy,
          },
          timestamp: new Date(),
        });
      }

      return updatedUser;
    } catch (error) {
      logger.error('[UserRepository] Update user error:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID (soft delete)
   * @param {string} userId - User ID
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>} - Success status
   */
  async delete(userId, options = {}) {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      // Soft delete by setting isActive to false
      const updatedUser = await this.update(
        userId,
        {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: options.deletedBy,
        },
        options,
      );

      // Log user deletion
      if (this.auditService) {
        await this.auditService.log({
          type: 'USER_DELETED',
          userId,
          details: {
            deletedBy: options.deletedBy,
            reason: options.reason,
          },
          timestamp: new Date(),
        });
      }

      return !!updatedUser;
    } catch (error) {
      logger.error('[UserRepository] Delete user error:', error);
      throw error;
    }
  }

  /**
   * Find users with pagination and filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Paginated results
   */
  async findWithPagination(filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        select = null,
        populate = null,
      } = options;

      const skip = (page - 1) * limit;
      const cacheKey = `users:paginated:${JSON.stringify({ filter, page, limit, sort, select })}`;

      // Try cache first
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Build query
      let query = User.find(filter);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        query = query.populate(populate);
      }

      // Execute query with pagination
      const [users, total] = await Promise.all([
        query.sort(sort).skip(skip).limit(limit).exec(),
        User.countDocuments(filter),
      ]);

      const result = {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };

      // Cache result
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, result, this.cacheTTL.userList);
      }

      return result;
    } catch (error) {
      logger.error('[UserRepository] Find with pagination error:', error);
      throw error;
    }
  }

  /**
   * Search users by text
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Search results
   */
  async searchUsers(searchTerm, options = {}) {
    try {
      const { role = null, limit = 20, includeInactive = false } = options;

      const cacheKey = `users:search:${searchTerm}:${JSON.stringify(options)}`;

      // Try cache first
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Build search query
      const searchQuery = {
        $and: [
          {
            $or: [
              { firstName: { $regex: searchTerm, $options: 'i' } },
              { lastName: { $regex: searchTerm, $options: 'i' } },
              { email: { $regex: searchTerm, $options: 'i' } },
              { 'profile.farmInfo.farmName': { $regex: searchTerm, $options: 'i' } },
            ],
          },
        ],
      };

      // Add filters
      if (!includeInactive) {
        searchQuery.$and.push({ isActive: true });
      }

      if (role) {
        searchQuery.$and.push({ role });
      }

      const users = await User.find(searchQuery)
        .select('firstName lastName email role isActive profile.farmInfo.farmName')
        .limit(limit)
        .sort({ firstName: 1, lastName: 1 })
        .exec();

      // Cache result
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, users, this.cacheTTL.search);
      }

      return users;
    } catch (error) {
      logger.error('[UserRepository] Search users error:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Users with specified role
   */
  async findByRole(role, options = {}) {
    try {
      const { isActive = true, limit = null, select = null } = options;

      const cacheKey = `users:role:${role}:${JSON.stringify(options)}`;

      // Try cache first
      if (this.cacheService && !options.skipCache) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const filter = { role };
      if (isActive !== null) {
        filter.isActive = isActive;
      }

      let query = User.find(filter);

      if (select) {
        query = query.select(select);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const users = await query.sort({ firstName: 1, lastName: 1 }).exec();

      // Cache result
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, users, this.cacheTTL.userList);
      }

      return users;
    } catch (error) {
      logger.error('[UserRepository] Find by role error:', error);
      throw error;
    }
  }

  /**
   * Get inspectors by province
   * @param {string} province - Province name
   * @returns {Promise<Array>} - Available inspectors
   */
  async getInspectorsByProvince(province) {
    try {
      const cacheKey = `inspectors:province:${province}`;

      // Try cache first
      if (this.cacheService) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const inspectors = await User.getInspectorsByProvince(province);

      // Cache result
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, inspectors, this.cacheTTL.userList);
      }

      return inspectors;
    } catch (error) {
      logger.error('[UserRepository] Get inspectors by province error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} - User statistics
   */
  async getUserStatistics() {
    try {
      const cacheKey = 'users:statistics';

      // Try cache first
      if (this.cacheService) {
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
            },
            verifiedUsers: {
              $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] },
            },
            usersByRole: {
              $push: {
                role: '$role',
                isActive: '$isActive',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalUsers: 1,
            activeUsers: 1,
            verifiedUsers: 1,
            roleBreakdown: {
              $reduce: {
                input: '$usersByRole',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [
                          {
                            k: '$$this.role',
                            v: {
                              $add: [
                                {
                                  $ifNull: [
                                    { $getField: { field: '$$this.role', input: '$$value' } },
                                    0,
                                  ],
                                },
                                1,
                              ],
                            },
                          },
                        ],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        roleBreakdown: {},
      };

      // Cache result
      if (this.cacheService) {
        await this.cacheService.set(cacheKey, result, this.cacheTTL.userList);
      }

      return result;
    } catch (error) {
      logger.error('[UserRepository] Get user statistics error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Validate user data
   * @private
   */
  _validateUserData(userData) {
    if (!userData.email) {
      throw new Error('Email is required');
    }

    if (!userData.firstName) {
      throw new Error('First name is required');
    }

    if (!userData.lastName) {
      throw new Error('Last name is required');
    }

    if (!userData.role) {
      throw new Error('Role is required');
    }

    const validRoles = ['FARMER', 'DTAM_REVIEWER', 'DTAM_INSPECTOR', 'DTAM_ADMIN'];
    if (!validRoles.includes(userData.role)) {
      throw new Error('Invalid role');
    }
  }

  /**
   * Clear user-specific caches
   * @private
   */
  async _clearUserCaches(userId) {
    if (!this.cacheService) {
      return;
    }

    try {
      const patterns = [`user:${userId}:*`, 'user:email:*:*'];

      for (const pattern of patterns) {
        await this.cacheService.deletePattern(pattern);
      }
    } catch (error) {
      logger.error('[UserRepository] Clear user caches error:', error);
    }
  }

  /**
   * Clear user list caches
   * @private
   */
  async _clearUserListCaches() {
    if (!this.cacheService) {
      return;
    }

    try {
      const patterns = ['users:*', 'inspectors:*'];

      for (const pattern of patterns) {
        await this.cacheService.deletePattern(pattern);
      }
    } catch (error) {
      logger.error('[UserRepository] Clear user list caches error:', error);
    }
  }
}

module.exports = UserRepository;
