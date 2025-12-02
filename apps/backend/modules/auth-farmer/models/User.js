/**
 * User Model for Farmer Authentication
 * Migrated from microservices/auth-service/src/models/User.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import shared utilities
const shared = require('../../shared');
const { constants } = shared;

// Import logger service
const logger = require('../../../shared/logger');

/**
 * User Schema
 * Represents farmer users in the system
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    organizationType: {
      type: String,
      enum: ['farmer', 'government', 'certifier', 'inspector', 'admin'],
      default: 'farmer',
    },
    role: {
      type: String,
      enum: ['farmer', 'premium_farmer', 'inspector', 'dtam_admin', 'operator', 'super_admin'],
      default: 'farmer',
    },
    organizationName: {
      type: String,
      trim: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'locked', 'inactive'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedAt: {
      type: Date,
    },
    accountLockedUntil: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    permissions: [
      {
        type: String,
      },
    ],
    profile: {
      bio: String,
      avatar: String,
      language: {
        type: String,
        default: 'th',
      },
      timezone: {
        type: String,
        default: 'Asia/Bangkok',
      },
    },
    metadata: {
      registrationSource: String,
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

// Apply shared mongoose plugins
// userSchema.plugin(shared.database.mongoosePlugins.timestampPlugin); // Temporarily disabled
// userSchema.plugin(shared.database.mongoosePlugins.paginationPlugin); // Temporarily disabled

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ organizationType: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.twoFactorSecret;
    return ret;
  },
});

userSchema.set('toObject', { virtuals: true });

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (error) {
    logger.error('Password hashing error:', error);
    next(error);
  }
});

/**
 * Instance Methods
 */

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Need to explicitly select password for comparison
    const user = await mongoose.model('User').findById(this._id).select('+password');
    if (!user) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    logger.error('Password comparison error:', error);
    return false;
  }
};

/**
 * Check if account is locked
 * @returns {boolean}
 */
userSchema.methods.isAccountLocked = function () {
  return !!(this.accountLockedUntil && this.accountLockedUntil > Date.now());
};

/**
 * Get user permissions based on role
 * @returns {Array<string>}
 */
userSchema.methods.getPermissions = function () {
  const rolePermissions = {
    [constants.userRoles.FARMER]: ['view_profile', 'edit_profile', 'submit_application'],
    [constants.userRoles.PREMIUM_FARMER]: [
      'view_profile',
      'edit_profile',
      'submit_application',
      'view_analytics',
    ],
    [constants.userRoles.INSPECTOR]: ['view_all', 'review_applications', 'generate_reports'],
    [constants.userRoles.DTAM_ADMIN]: [
      'view_all',
      'edit_all',
      'manage_users',
      'approve_applications',
    ],
    [constants.userRoles.OPERATOR]: ['view_all', 'edit_all', 'manage_system'],
    [constants.userRoles.SUPER_ADMIN]: ['*'], // All permissions
  };

  return rolePermissions[this.role] || rolePermissions[constants.userRoles.FARMER];
};

/**
 * Increment login attempts
 * @returns {Promise<void>}
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.accountLockedUntil && this.accountLockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { accountLockedUntil: 1 },
      $set: { failedLoginAttempts: 1, loginAttempts: 1 },
    });
  }

  const updates = {
    $inc: {
      failedLoginAttempts: 1,
      loginAttempts: 1,
    },
  };

  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5) {
    updates.$set = {
      accountLockedUntil: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      accountStatus: 'locked',
      lockedAt: new Date(),
    };
  }

  return this.updateOne(updates);
};

/**
 * Reset login attempts after successful login
 * @returns {Promise<void>}
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: {
      failedLoginAttempts: 0,
      loginAttempts: 0,
    },
    $unset: {
      accountLockedUntil: 1,
    },
  });
};

/**
 * Update last login timestamp
 * @returns {Promise<void>}
 */
userSchema.methods.updateLastLogin = async function () {
  return this.updateOne({
    $set: { lastLoginAt: new Date() },
    $inc: { loginCount: 1 },
  });
};

/**
 * Get safe user profile (without sensitive data)
 * @returns {Object}
 */
userSchema.methods.getSafeProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  delete user.__v;
  return user;
};

/**
 * Static Methods
 */

/**
 * Find user by email
 * @param {string} email
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Create user with validation
 * @param {Object} userData - User data
 * @returns {Promise<Object>}
 */
userSchema.statics.createUser = async function (userData) {
  try {
    // Validate email doesn't exist
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = new this({
      ...userData,
      email: userData.email.toLowerCase(),
    });
    await user.save();

    logger.info('User created successfully', {
      userId: user._id,
      email: user.email,
    });

    return user.getSafeProfile();
  } catch (error) {
    logger.error('User creation error:', error);
    throw error;
  }
};

/**
 * Authenticate user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
userSchema.statics.authenticate = async function (email, password) {
  try {
    const user = await this.findByEmail(email).select('+password');
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return {
        success: false,
        message: 'Account temporarily locked. Try again later.',
      };
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return { success: false, message: 'Invalid credentials' };
    }

    // Check if account is active
    if (!user.isActive) {
      return { success: false, message: 'Account is deactivated' };
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();
    await user.updateLastLogin();

    return {
      success: true,
      user: user.getSafeProfile(),
    };
  } catch (error) {
    logger.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication failed',
    };
  }
};

/**
 * Get users with pagination and filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
userSchema.statics.getUsers = async function (options = {}) {
  const { page = 1, limit = 10, role, organizationType, isActive, search } = options;

  const query = {};

  if (role) {
    query.role = role;
  }
  if (organizationType) {
    query.organizationType = organizationType;
  }
  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    this.find(query)
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Create model only if it doesn't exist
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

module.exports = User;
