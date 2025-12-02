/**
 * User Model Schema
 *
 * Mongoose schema for user accounts with comprehensive validation and security.
 * Supports multiple user roles in the GACP certification system.
 *
 * User Roles:
 * - FARMER: Farm owners applying for certification
 * - DTAM_REVIEWER: Document reviewers
 * - DTAM_INSPECTOR: Farm inspectors
 * - DTAM_ADMIN: System administrators
 *
 * Security Features:
 * - Password hashing with bcrypt
 * - Account lockout tracking
 * - Password reset tokens
 * - Audit trail integration
 * - Role-based permissions
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      index: true,
    },

    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [60, 'Password hash should be properly encrypted'], // bcrypt hash length
    },

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
      match: [/^[a-zA-Zก-๏\s]+$/, 'First name can only contain letters and spaces'],
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      match: [/^[a-zA-Zก-๏\s]+$/, 'Last name can only contain letters and spaces'],
    },

    // Role-based access control
    role: {
      type: String,
      required: [true, 'User role is required'],
      enum: {
        values: ['FARMER', 'DTAM_REVIEWER', 'DTAM_INSPECTOR', 'DTAM_ADMIN'],
        message: 'Role must be one of: FARMER, DTAM_REVIEWER, DTAM_INSPECTOR, DTAM_ADMIN',
      },
      index: true,
    },

    // Account status and security
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    requirePasswordChange: {
      type: Boolean,
      default: false,
    },

    // Password management
    passwordUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    passwordHistory: [
      {
        hash: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    passwordResetToken: {
      type: String,
      select: false, // Don't include in queries by default
    },

    passwordResetExpiry: {
      type: Date,
      select: false,
    },

    // Account security tracking
    lastLoginAt: {
      type: Date,
      index: true,
    },

    lastLoginIP: {
      type: String,
      trim: true,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      index: true,
    },

    // Profile information (role-specific)
    profile: {
      // Common fields
      phone: {
        type: String,
        trim: true,
        match: [/^[0-9+\-\s()]+$/, 'Please provide a valid phone number'],
      },

      address: {
        street: { type: String, trim: true, maxlength: 200 },
        district: { type: String, trim: true, maxlength: 100 },
        province: { type: String, trim: true, maxlength: 100 },
        postalCode: { type: String, trim: true, match: /^[0-9]{5}$/ },
        country: { type: String, default: 'Thailand', trim: true },
      },

      // Farmer-specific fields
      farmInfo: {
        farmName: { type: String, trim: true, maxlength: 200 },
        farmSize: { type: Number, min: 0 }, // in rai
        farmType: {
          type: String,
          enum: ['ORGANIC', 'CONVENTIONAL', 'MIXED'],
        },
        coordinates: {
          latitude: { type: Number, min: -90, max: 90 },
          longitude: { type: Number, min: -180, max: 180 },
        },
        certificationHistory: [
          {
            certType: String,
            issuedDate: Date,
            expiryDate: Date,
            certNumber: String,
          },
        ],
      },

      // DTAM staff fields
      dtamInfo: {
        employeeId: { type: String, trim: true },
        department: { type: String, trim: true },
        position: { type: String, trim: true },
        specializations: [{ type: String, trim: true }],
        workingProvinces: [{ type: String, trim: true }],
      },

      // Additional profile data
      avatar: { type: String, trim: true }, // URL to profile picture
      bio: { type: String, trim: true, maxlength: 500 },
      language: { type: String, default: 'th', enum: ['th', 'en'] },
    },

    // Preferences and settings
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },

      dashboard: {
        defaultView: { type: String, default: 'summary' },
        itemsPerPage: { type: Number, default: 10, min: 5, max: 100 },
      },

      privacy: {
        profileVisibility: { type: String, default: 'private', enum: ['public', 'private'] },
        contactInfoVisible: { type: Boolean, default: false },
      },
    },

    // System metadata
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Verification tokens
    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      transform: function (doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiry;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpiry;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpiry;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpiry;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for performance optimization
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'profile.farmInfo.coordinates': '2dsphere' }); // Geospatial index for farms

// Compound indexes
userSchema.index({ role: 1, 'profile.dtamInfo.workingProvinces': 1 }); // For inspector assignment
userSchema.index({ isActive: 1, isVerified: 1 }); // For active user queries

// Virtual properties
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

userSchema.virtual('passwordAge').get(function () {
  if (!this.passwordUpdatedAt) {
    return null;
  }
  return Math.floor((Date.now() - this.passwordUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)); // Days
});

// Pre-save middleware
userSchema.pre('save', async function (next) {
  // Update the updatedAt timestamp
  this.updatedAt = new Date();

  // Hash password if it's new or modified
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2')) {
    try {
      const saltRounds = 12;
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
      this.passwordUpdatedAt = new Date();
    } catch (error) {
      return next(error);
    }
  }

  // Validate role-specific profile data
  if (this.isModified('profile')) {
    try {
      this._validateRoleSpecificProfile();
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.incrementLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockedUntil: 1 },
      $set: { failedLoginAttempts: 1 },
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // If we have reached max attempts and it's not locked yet, lock account
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  if (this.failedLoginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockedUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { failedLoginAttempts: 1, lockedUntil: 1 },
  });
};

userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = resetToken;
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return verificationToken;
};

userSchema.methods.hasPermission = function (permission) {
  const rolePermissions = {
    FARMER: [
      'application:create',
      'application:read:own',
      'application:update:own',
      'document:upload:own',
      'payment:make:own',
    ],
    DTAM_REVIEWER: [
      'application:read:all',
      'application:review',
      'application:approve',
      'application:reject',
      'document:read:all',
    ],
    DTAM_INSPECTOR: [
      'application:read:assigned',
      'inspection:schedule',
      'inspection:conduct',
      'inspection:report',
    ],
    DTAM_ADMIN: ['*'], // Admin has all permissions
  };

  const userPermissions = rolePermissions[this.role] || [];
  return userPermissions.includes('*') || userPermissions.includes(permission);
};

// Private validation methods
userSchema.methods._validateRoleSpecificProfile = function () {
  switch (this.role) {
    case 'FARMER':
      if (this.profile && this.profile.farmInfo) {
        if (this.profile.farmInfo.farmSize && this.profile.farmInfo.farmSize <= 0) {
          throw new Error('Farm size must be greater than 0');
        }
      }
      break;

    case 'DTAM_REVIEWER':
    case 'DTAM_INSPECTOR':
    case 'DTAM_ADMIN':
      if (this.profile && this.profile.dtamInfo) {
        if (!this.profile.dtamInfo.employeeId) {
          throw new Error('Employee ID is required for DTAM staff');
        }
      }
      break;
  }
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, isVerified: true });
};

userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

userSchema.statics.getInspectorsByProvince = function (province) {
  return this.find({
    role: 'DTAM_INSPECTOR',
    isActive: true,
    'profile.dtamInfo.workingProvinces': province,
  });
};

userSchema.statics.searchUsers = function (searchTerm, role = null) {
  const query = {
    $or: [
      { firstName: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ],
    isActive: true,
  };

  if (role) {
    query.role = role;
  }

  return this.find(query);
};

// Create model only if it doesn't exist
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

module.exports = User;
