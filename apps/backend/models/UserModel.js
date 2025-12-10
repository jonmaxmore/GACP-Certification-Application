/**
 * User Model for Farmer Authentication
 * Corresponds to Domain Entity: apps/backend/modules/auth-farmer/domain/entities/User.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const logger = require('../shared/logger');
const { encrypt, decrypt } = require('../shared/encryption');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
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
      required: true,
      trim: true,
    },
    idCard: {
      type: String,
      required: true,
      trim: true,
      length: 13,
      select: false, // Privacy: Exclude from default queries
    },
    idCardImage: {
      type: String,
    },
    laserCode: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    corporateId: {
      type: String,
      trim: true,
    },
    farmerType: {
      type: String,
      enum: ['INDIVIDUAL', 'CORPORATE', 'COMMUNITY_ENTERPRISE'],
      default: 'INDIVIDUAL',
    },
    farmingExperience: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    subdistrict: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['FARMER', 'PREMIUM_FARMER', 'INSPECTOR', 'DTAM_ADMIN', 'OPERATOR', 'SUPER_ADMIN'],
      default: 'FARMER',
    },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'INACTIVE'],
      default: 'PENDING_VERIFICATION',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpiry: Date,
    passwordResetToken: String,
    passwordResetExpiry: Date,

    lastLoginAt: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedUntil: Date,

    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ idCard: 1 }, { unique: true });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password and encrypt sensitive fields
userSchema.pre('save', async function (next) {
  // Encrypt idCard if modified (AES-256-CBC)
  if (this.isModified('idCard') && this.idCard) {
    if (!this.idCard.includes(':')) {
      this.idCard = encrypt(this.idCard);
    }
  }

  // Encrypt laserCode if modified (AES-256-CBC)
  if (this.isModified('laserCode') && this.laserCode) {
    if (!this.laserCode.includes(':')) {
      this.laserCode = encrypt(this.laserCode);
    }
  }

  if (!this.isModified('password')) {
    return next();
  }

  // Prevent double hashing if password is already hashed (starts with $2)
  if (this.password && this.password.startsWith('$2')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    logger.error('Password hashing error:', error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const user = await this.constructor.findById(this._id).select('+password');
    if (!user) {
      return false;
    }
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    logger.error('Password comparison error:', error);
    return false;
  }
};

// Decrypt laser code method
userSchema.methods.getDecryptedLaserCode = function () {
  if (!this.laserCode) return null;
  return decrypt(this.laserCode);
};

// Decrypt ID card method
userSchema.methods.getDecryptedIdCard = function () {
  if (!this.idCard) return null;
  return decrypt(this.idCard);
};

// Create model
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

module.exports = User;
