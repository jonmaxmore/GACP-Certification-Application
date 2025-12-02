/**
 * DTAM Staff Model
 * Represents government staff members in the system
 * Migrated and enhanced from microservices/auth-service/src/routes/auth-dtam.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import logger
const logger = require('../../../shared/logger');

/**
 * DTAM Staff Schema
 * Separate from farmer users for security and clarity
 */
const dtamStaffSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
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
    userType: {
      type: String,
      enum: ['DTAM_STAFF'],
      default: 'DTAM_STAFF',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'reviewer', 'manager', 'inspector', 'operator'],
      default: 'reviewer',
      required: true,
    },
    department: {
      type: String,
      default: 'กรมส่งเสริมการเกษตร',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    loginCount: {
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
    passwordChangedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DTAMStaff',
    },
    metadata: {
      createdByUsername: String,
      createdByRole: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
    collection: 'dtam_staff',
  },
);

// Apply shared mongoose plugins (commented out - plugin not available)
// dtamStaffSchema.plugin(shared.database.mongoosePlugins.timestampPlugin);

// Indexes for performance
dtamStaffSchema.index({ username: 1 }, { unique: true });
dtamStaffSchema.index({ email: 1 }, { unique: true });
dtamStaffSchema.index({ role: 1 });
dtamStaffSchema.index({ isActive: 1 });
dtamStaffSchema.index({ userType: 1 });
dtamStaffSchema.index({ createdAt: -1 });

// Virtual for full name
dtamStaffSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included when converting to JSON
dtamStaffSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

dtamStaffSchema.set('toObject', { virtuals: true });

/**
 * Pre-save middleware to hash password
 */
dtamStaffSchema.pre('save', async function (next) {
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
dtamStaffSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Need to explicitly select password for comparison
    const staff = await mongoose.model('DTAMStaff').findById(this._id).select('+password');
    if (!staff) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, staff.password);
  } catch (error) {
    logger.error('Password comparison error:', error);
    return false;
  }
};

/**
 * Check if account is locked
 * @returns {boolean}
 */
dtamStaffSchema.methods.isAccountLocked = function () {
  return !this.isActive || (this.lockedAt && Date.now() - this.lockedAt < 2 * 60 * 60 * 1000); // 2 hours
};

/**
 * Get staff permissions based on role
 * @returns {Array<string>}
 */
dtamStaffSchema.methods.getPermissions = function () {
  const rolePermissions = {
    admin: ['*'], // All permissions
    manager: [
      'view_all_applications',
      'approve_applications',
      'reject_applications',
      'view_statistics',
      'manage_staff',
      'export_data',
    ],
    reviewer: ['view_applications', 'review_applications', 'view_statistics', 'create_reports'],
    inspector: ['view_applications', 'conduct_inspections', 'upload_documents', 'create_reports'],
    operator: ['view_applications', 'update_status', 'view_statistics'],
  };

  return rolePermissions[this.role] || rolePermissions.operator;
};

/**
 * Update last login
 * @returns {Promise<void>}
 */
dtamStaffSchema.methods.updateLastLogin = async function () {
  return this.updateOne({
    $set: { lastLoginAt: new Date() },
    $inc: { loginCount: 1 },
  });
};

/**
 * Get safe profile (without sensitive data)
 * @returns {Object}
 */
dtamStaffSchema.methods.getSafeProfile = function () {
  const staff = this.toObject();
  delete staff.password;
  delete staff.__v;
  return staff;
};

/**
 * Static Methods
 */

/**
 * Find staff by username or email
 * @param {string} identifier - Username or email
 * @returns {Promise<DTAMStaff|null>}
 */
dtamStaffSchema.statics.findByIdentifier = function (identifier) {
  return this.findOne({
    $or: [{ username: identifier.toLowerCase() }, { email: identifier.toLowerCase() }],
  });
};

/**
 * Create staff with validation
 * @param {Object} staffData - Staff data
 * @param {Object} creator - Creator info (userId, username, role)
 * @returns {Promise<Object>}
 */
dtamStaffSchema.statics.createStaff = async function (staffData, creator = null) {
  try {
    // Check if username or email already exists
    const existingStaff = await this.findByIdentifier(staffData.username || staffData.email);
    if (existingStaff) {
      throw new Error('Username or email already exists');
    }

    // Create new staff
    const staff = new this({
      ...staffData,
      username: staffData.username.toLowerCase(),
      email: staffData.email.toLowerCase(),
      userType: 'DTAM_STAFF',
      metadata: creator
        ? {
            createdByUsername: creator.username,
            createdByRole: creator.role,
            ipAddress: creator.ipAddress,
          }
        : {},
    });

    if (creator) {
      staff.createdBy = creator.userId;
    }

    await staff.save();

    logger.info('DTAM staff created successfully', {
      staffId: staff._id,
      username: staff.username,
      createdBy: creator?.username,
    });

    return staff.getSafeProfile();
  } catch (error) {
    logger.error('Staff creation error:', error);
    throw error;
  }
};

/**
 * Authenticate DTAM staff
 * @param {string} identifier - Username or email
 * @param {string} password
 * @returns {Promise<Object>}
 */
dtamStaffSchema.statics.authenticate = async function (identifier, password) {
  try {
    const staff = await this.findByIdentifier(identifier).select('+password');
    if (!staff) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Check if account is locked
    if (staff.isAccountLocked()) {
      return {
        success: false,
        message: 'Account temporarily locked. Try again later.',
      };
    }

    // Check if account is active
    if (!staff.isActive) {
      return { success: false, message: 'Account is deactivated' };
    }

    // Check password
    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
      // Increment failed attempts
      await staff.updateOne({
        $inc: { failedLoginAttempts: 1 },
      });

      // Lock account after 5 failed attempts
      if (staff.failedLoginAttempts + 1 >= 5) {
        await staff.updateOne({
          $set: {
            isActive: false,
            lockedAt: new Date(),
          },
        });
      }

      return { success: false, message: 'Invalid credentials' };
    }

    // Reset failed attempts and update last login
    await staff.updateOne({
      $set: {
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
      },
      $inc: { loginCount: 1 },
    });

    return {
      success: true,
      staff: staff.getSafeProfile(),
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
 * Get staff list with filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
dtamStaffSchema.statics.getStaffList = async function (options = {}) {
  const { page = 1, limit = 10, role, isActive, search } = options;

  const query = { userType: 'DTAM_STAFF' };

  if (role) {
    query.role = role;
  }
  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [staff, total] = await Promise.all([
    this.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    this.countDocuments(query),
  ]);

  return {
    staff,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Create and export model
const DTAMStaff = mongoose.model('DTAMStaff', dtamStaffSchema);

module.exports = DTAMStaff;
