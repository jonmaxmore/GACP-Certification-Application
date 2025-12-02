/**
 * User Model - GACP Platform
 * MongoDB schema for user authentication and profile management
 *
 * @module database/models/User
 * @version 2.0.0
 * @date 2025-10-16
 *
 * @standards
 * - OpenAPI 3.0.3 specification compliance
 * - Thai ID validation (Mod 11 algorithm)
 * - GDPR compliance (right to erasure)
 * - RBAC (Role-Based Access Control)
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Login History Subdocument Schema
 * Embedded array (max 10 recent logins)
 */
const LoginHistorySchema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    ipAddress: {
      type: String,
      required: true,
      maxlength: 45 // IPv6 max length
    },
    userAgent: {
      type: String,
      required: true,
      maxlength: 500
    },
    success: {
      type: Boolean,
      required: true,
      default: true
    },
    failureReason: {
      type: String,
      enum: [null, 'INVALID_PASSWORD', 'ACCOUNT_LOCKED', 'ACCOUNT_SUSPENDED'],
      default: null
    }
  },
  { _id: false }
);

/**
 * User Schema
 * Main collection for user authentication and profile
 */
const UserSchema = new Schema(
  {
    // === PRIMARY KEY ===
    _id: {
      type: Schema.Types.ObjectId,
      auto: true
    },

    // === UNIQUE IDENTIFIERS ===
    userId: {
      type: String,
      required: true,
      match: /^USR-\d{4}-[A-Z0-9]{8}$/,
      description: 'Format: USR-YYYY-XXXXXXXX'
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/
    },

    // === THAI ID VALIDATION ===
    thaiId: {
      type: String,
      match: /^[0-9]{13}$/,
      description: '13-digit Thai national ID (Mod 11 validated)'
    },

    thaiIdVerified: {
      type: Boolean,
      required: true,
      default: false
    },

    // === AUTHENTICATION ===
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return in queries by default
      description: 'Bcrypt hash with cost factor 12'
    },

    passwordChangedAt: {
      type: Date,
      default: null
    },

    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5
    },

    accountLocked: {
      type: Boolean,
      required: true,
      default: false
    },

    accountLockedUntil: {
      type: Date,
      default: null
    },

    // === PROFILE ===
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200
    },

    phoneNumber: {
      type: String,
      match: /^0[0-9]{9}$/,
      description: 'Thai phone format: 0XXXXXXXXX'
    },

    phoneVerified: {
      type: Boolean,
      required: true,
      default: false
    },

    // === ROLE-BASED ACCESS CONTROL ===
    role: {
      type: String,
      required: true,
      enum: ['FARMER', 'DTAM', 'ADMIN'],
      default: 'FARMER',
      index: true
    },

    permissions: [
      {
        type: String,
        enum: [
          // Farmer permissions
          'application:create',
          'application:read',
          'application:read:own',
          'application:update:own',
          'document:upload:own',
          'payment:create',
          'payment:read',
          'certificate:read:own',

          // DTAM permissions
          'application:read:all',
          'application:review',
          'application:approve',
          'certificate:issue',
          'certificate:revoke',

          // Wildcard permissions for flexibility
          'application:*',
          'payment:*',
          'certificate:*',
          'document:*',

          // Admin permissions (use '*' for all)
          '*'
        ]
      }
    ],

    // === STATUS ===
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'],
      default: 'ACTIVE',
      index: true
    },

    emailVerified: {
      type: Boolean,
      required: true,
      default: false
    },

    emailVerificationToken: {
      type: String,
      select: false, // Don't expose in queries
      default: null
    },

    emailVerificationExpires: {
      type: Date,
      default: null
    },

    // === PASSWORD RESET ===
    passwordResetToken: {
      type: String,
      select: false, // Don't expose in queries
      default: null,
      description: 'Hex-encoded token for password reset (64 chars)'
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      description: 'Token expiration timestamp (typically 1 hour)'
    },

    // === TWO-FACTOR AUTHENTICATION (Future) ===
    twoFactorEnabled: {
      type: Boolean,
      required: true,
      default: false
    },

    twoFactorSecret: {
      type: String,
      select: false,
      default: null
    },

    // === AUDIT ===
    lastLoginAt: {
      type: Date,
      default: null
    },

    lastLoginIp: {
      type: String,
      maxlength: 45,
      default: null
    },

    loginHistory: {
      type: [LoginHistorySchema],
      default: [],
      description: 'Max 10 recent logins (FIFO)'
    },

    // === TIMESTAMPS ===
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true
    },

    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, // Auto-manage createdAt/updatedAt
    collection: 'users',
    versionKey: false
  }
);

// ========================================
// INDEXES
// ========================================

// Unique indexes
UserSchema.index({ userId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ thaiId: 1 }, { unique: true, sparse: true });

// Query indexes
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ phoneNumber: 1 }, { sparse: true });
UserSchema.index({ createdAt: -1 });

// Partial index (active users only)
UserSchema.index(
  { email: 1 },
  {
    partialFilterExpression: { status: 'ACTIVE' },
    name: 'active_users_email'
  }
);

// ========================================
// VIRTUAL PROPERTIES
// ========================================

/**
 * Check if user is admin
 */
UserSchema.virtual('isAdmin').get(function () {
  return this.role === 'ADMIN';
});

/**
 * Check if account is locked
 */
UserSchema.virtual('isLocked').get(function () {
  if (!this.accountLocked) return false;
  if (!this.accountLockedUntil) return true;
  return this.accountLockedUntil > new Date();
});

/**
 * Check if user can login
 */
UserSchema.virtual('canLogin').get(function () {
  return this.status === 'ACTIVE' && !this.isLocked && this.emailVerified;
});

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Add login attempt to history
 * @param {String} ipAddress - IP address
 * @param {String} userAgent - User agent string
 * @param {Boolean} success - Login success status
 * @param {String} failureReason - Failure reason if failed
 */
UserSchema.methods.recordLogin = async function (
  ipAddress,
  userAgent,
  success,
  failureReason = null
) {
  // Add to login history (keep max 10)
  const loginRecord = {
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success,
    failureReason
  };

  this.loginHistory.unshift(loginRecord);
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(0, 10);
  }

  // Update last login
  if (success) {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ipAddress;
    this.loginAttempts = 0;
  } else {
    this.loginAttempts += 1;

    // Lock account after 5 failed attempts
    if (this.loginAttempts >= 5) {
      this.accountLocked = true;
      this.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
  }

  await this.save();
};

/**
 * Unlock account manually
 */
UserSchema.methods.unlockAccount = async function () {
  this.accountLocked = false;
  this.accountLockedUntil = null;
  this.loginAttempts = 0;
  await this.save();
};

/**
 * Check if user has permission
 * @param {String} permission - Permission string
 * @returns {Boolean}
 */
UserSchema.methods.hasPermission = function (permission) {
  // Admin has all permissions
  if (this.permissions.includes('*')) return true;

  // Check exact permission
  if (this.permissions.includes(permission)) return true;

  // Check wildcard permissions (e.g., 'application:*')
  const permissionParts = permission.split(':');
  if (permissionParts.length > 1) {
    const wildcardPermission = `${permissionParts[0]}:*`;
    return this.permissions.includes(wildcardPermission);
  }

  return false;
};

/**
 * Anonymize user data (GDPR compliance)
 */
UserSchema.methods.anonymize = async function () {
  this.email = `deleted_${this.userId}@anonymized.local`;
  this.fullName = 'Anonymized User';
  this.thaiId = null;
  this.phoneNumber = null;
  this.status = 'DELETED';
  this.deletedAt = new Date();
  this.loginHistory = [];

  await this.save();
};

// ========================================
// STATIC METHODS
// ========================================

/**
 * Find active users by role
 * @param {String} role - User role
 * @returns {Promise<User[]>}
 */
UserSchema.statics.findActiveByRole = function (role) {
  return this.find({
    role,
    status: 'ACTIVE',
    emailVerified: true
  }).sort({ createdAt: -1 });
};

/**
 * Generate unique User ID
 * @returns {Promise<String>} - Format: USR-YYYY-XXXXXXXX
 */
UserSchema.statics.generateUserId = async function () {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const userId = `USR-${year}-${randomPart}`;

  // Check uniqueness
  const existing = await this.findOne({ userId });
  if (existing) {
    return this.generateUserId(); // Retry
  }

  return userId;
};

/**
 * Validate Thai ID (Mod 11 algorithm)
 * @param {String} thaiId - 13-digit Thai national ID
 * @returns {Boolean}
 */
UserSchema.statics.validateThaiId = function (thaiId) {
  if (!/^[0-9]{13}$/.test(thaiId)) return false;

  // Mod 11 validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(thaiId.charAt(i)) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(thaiId.charAt(12));
};

// ========================================
// MIDDLEWARE (Hooks)
// ========================================

/**
 * Pre-save middleware: Update updatedAt timestamp
 */
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Pre-save middleware: Validate Thai ID before saving
 */
UserSchema.pre('save', function (next) {
  if (this.thaiId && this.isModified('thaiId')) {
    const User = mongoose.model('User');
    if (!User.validateThaiId(this.thaiId)) {
      return next(new Error('Invalid Thai ID (Mod 11 validation failed)'));
    }
  }
  next();
});

/**
 * Post-save middleware: Clear account lock if expired
 */
UserSchema.post('save', function (doc, next) {
  if (doc.accountLocked && doc.accountLockedUntil && doc.accountLockedUntil < new Date()) {
    doc.accountLocked = false;
    doc.accountLockedUntil = null;
  }
  next();
});

// ========================================
// SCHEMA VALIDATION
// ========================================

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove sensitive fields from JSON output
    delete ret.passwordHash;
    delete ret.emailVerificationToken;
    delete ret.twoFactorSecret;
    delete ret.__v;
    return ret;
  }
});

UserSchema.set('toObject', {
  virtuals: true
});

// ========================================
// EXPORT MODEL
// ========================================

module.exports = mongoose.model('User', UserSchema);
