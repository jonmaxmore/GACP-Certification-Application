/**
 * User Model for Farmer Authentication
 * Corresponds to Domain Entity: apps/backend/modules/auth-farmer/domain/entities/User.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const logger = require('../shared/logger');
const { encrypt, decrypt, hash } = require('../shared/encryption');

const userSchema = new mongoose.Schema(
  {
    // ========== UUID (Public-safe identifier for API) ==========
    uuid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => uuidv4(),
      immutable: true,
    },

    // ========== SOFT DELETE ==========
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deleteReason: {
      type: String,
      trim: true,
    },

    // ========== AUDIT TRAIL ==========
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByIp: {
      type: String,
      maxlength: 45, // IPv6 max
    },
    updatedByIp: {
      type: String,
      maxlength: 45,
    },

    // ========== LEGAL RETENTION (5 years per GACP/DTAM) ==========
    retainUntil: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 365.25 * 24 * 60 * 60 * 1000),
    },
    legalHold: {
      type: Boolean,
      default: false,
    },

    // ========== ACCOUNT TYPE (determines login method) ==========
    accountType: {
      type: String,
      enum: ['INDIVIDUAL', 'JURISTIC', 'COMMUNITY_ENTERPRISE', 'STAFF'],
      required: true,
      default: 'INDIVIDUAL',
    },

    // ========== LOGIN CREDENTIALS ==========
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // Allow null for non-staff accounts
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    // ========== INDIVIDUAL FARMER FIELDS ==========
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    idCard: {
      type: String,
      trim: true,
      length: 13,
      select: false, // Privacy: Exclude from default queries
    },
    idCardHash: {
      type: String,
      // Note: index defined via schema.index() below
    },
    idCardImage: {
      type: String,
    },
    laserCode: {
      type: String,
      trim: true,
      select: false,
    },

    // ========== JURISTIC PERSON (COMPANY) FIELDS ==========
    companyName: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
      length: 13, // Thai Tax ID is 13 digits
    },
    taxIdHash: {
      type: String,
      // Note: index defined via schema.index() below
    },
    representativeName: {
      type: String,
      trim: true,
    },
    representativePosition: {
      type: String,
      trim: true,
    },

    // ========== COMMUNITY ENTERPRISE FIELDS ==========
    communityName: {
      type: String,
      trim: true,
    },
    communityRegistrationNo: {
      type: String,
      trim: true,
    },
    communityRegistrationNoHash: {
      type: String,
      // Note: index defined via schema.index() below
    },

    // ========== LEGACY FIELDS (kept for compatibility) ==========
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
      enum: [
        // Farmer roles
        'FARMER',
        'PREMIUM_FARMER',
        // Staff roles
        'REVIEWER_AUDITOR',  // ผู้ตรวจเอกสาร + ผู้ตรวจประเมิน (ลงพื้นที่)
        'SCHEDULER',         // เจ้าหน้าที่จัดคิว
        'ACCOUNTANT',        // พนักงานบัญชี (ใบเสนอราคา, ใบวางบิล, ใบเสร็จ)
        'ADMIN',             // ผู้ดูแลระบบ
        'SUPER_ADMIN',       // ผู้ดูแลสูงสุด (Full access)
        // Legacy (deprecated)
        'INSPECTOR',
        'DTAM_ADMIN',
        'OPERATOR',
      ],
      default: 'FARMER',
    },
    // Staff-specific fields
    departmentId: {
      type: String,
      trim: true,
    },
    teamId: {
      type: String,
      trim: true,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    region: {
      type: String,
      enum: ['NORTH', 'NORTHEAST', 'CENTRAL', 'EAST', 'WEST', 'SOUTH'],
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

// Indexes - sparse to allow null values
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ idCardHash: 1 }, { unique: true, sparse: true });
userSchema.index({ taxIdHash: 1 }, { unique: true, sparse: true });
userSchema.index({ communityRegistrationNoHash: 1 }, { unique: true, sparse: true });
userSchema.index({ accountType: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  if (this.accountType === 'JURISTIC') {
    return this.companyName || `${this.firstName} ${this.lastName}`;
  }
  if (this.accountType === 'COMMUNITY_ENTERPRISE') {
    return this.communityName || `${this.firstName} ${this.lastName}`;
  }
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password and encrypt sensitive fields
userSchema.pre('save', async function (next) {
  // Encrypt idCard if modified (AES-256-CBC) - for INDIVIDUAL
  if (this.isModified('idCard') && this.idCard) {
    if (!this.idCard.includes(':')) {
      this.idCardHash = hash(this.idCard);
      this.idCard = encrypt(this.idCard);
    }
  }

  // Encrypt taxId if modified - for JURISTIC
  if (this.isModified('taxId') && this.taxId) {
    if (!this.taxId.includes(':')) {
      this.taxIdHash = hash(this.taxId);
      this.taxId = encrypt(this.taxId);
    }
  }

  // Encrypt communityRegistrationNo if modified - for COMMUNITY_ENTERPRISE
  if (this.isModified('communityRegistrationNo') && this.communityRegistrationNo) {
    if (!this.communityRegistrationNo.includes(':')) {
      this.communityRegistrationNoHash = hash(this.communityRegistrationNo);
      this.communityRegistrationNo = encrypt(this.communityRegistrationNo);
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
