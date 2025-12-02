/**
 * User Model for GACP Platform
 * Supports different user roles: farmer, dtam_officer, inspector, admin
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't include password in queries by default
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[+]?[0-9\-()s]+$/, 'Please enter a valid phone number'],
    },

    nationalId: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{13}$/, 'Please enter a valid Thai national ID'],
    },

    laserCode: {
      type: String,
      required: function () { return this.role === 'farmer'; },
      match: [/^[A-Z]{2}[0-9]{10}$/, 'Please enter a valid Laser Code (e.g., ME0123456789)'],
      select: false, // Sensitive data
    },

    corporateId: {
      type: String,
      required: function () {
        return this.role === 'farmer' && this.farmerType === 'corporate';
      },
      match: [/^\d{13}$/, 'Please enter a valid Corporate ID'],
      sparse: true,
    },

    licenseNumber: {
      type: String,
      trim: true,
      sparse: true,
    },

    farmerType: {
      type: String,
      enum: ['individual', 'corporate'],
      default: 'individual',
      required: function () {
        return this.role === 'farmer';
      },
    },

    // Role and Permissions
    role: {
      type: String,
      required: true,
      enum: ['farmer', 'officer', 'auditor', 'admin'],
      default: 'farmer',
    },

    permissions: [
      {
        type: String,
        enum: [
          'create_application',
          'view_application',
          'edit_application',
          'delete_application',
          'review_application',
          'approve_application',
          'reject_application',
          'schedule_inspection',
          'conduct_inspection',
          'complete_inspection',
          'generate_certificate',
          'revoke_certificate',
          'renew_certificate',
          'manage_users',
          'view_reports',
          'system_admin',
        ],
      },
    ],

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // Profile Picture
    profilePicture: {
      filename: String,
      path: String,
      size: Number,
      uploadedAt: Date,
    },

    // Identity Verification (KYC)
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    idCardImage: {
      path: String,
      uploadedAt: Date,
    },

    // Role-specific Information

    // Farmer-specific fields
    farmingExperience: {
      type: Number,
      min: 0,
      max: 100,
      required: function () {
        return this.role === 'farmer';
      },
    },

    // DTAM Officer & Inspector fields
    workLocation: {
      provinces: [
        {
          type: String,
          required: function () {
            return this.role === 'officer' || this.role === 'auditor';
          },
        },
      ],

      districts: [String],

      office: {
        name: String,
        address: String,
        phone: String,
      },
    },

    // Inspector-specific fields
    expertise: {
      cropTypes: [
        {
          type: String,
          enum: [
            'rice',
            'vegetables',
            'herbs',
            'fruits',
            'legumes',
            'root_crops',
            'cereals',
            'spices',
            'medicinal_plants',
          ],
          required: function () {
            return this.role === 'auditor';
          },
        },
      ],

      certifications: [String],

      experience: {
        type: Number,
        min: 0,
        required: function () {
          return this.role === 'auditor';
        },
      },

      languages: [String],
    },

    // Work tracking (for officers and inspectors)
    workload: {
      activeApplications: {
        type: Number,
        default: 0,
      },

      scheduledInspections: {
        type: Number,
        default: 0,
      },

      completedThisMonth: {
        type: Number,
        default: 0,
      },

      averageProcessingTime: {
        type: Number, // in hours
        default: 0,
      },
    },

    // Availability & Queue Management (New)
    availability: {
      isOnline: { type: Boolean, default: false }, // For real-time queue
      autoAssignEnabled: { type: Boolean, default: true }, // Accept system assignment
      unavailableDates: [{
        date: Date,
        reason: String, // 'leave', 'holiday', 'busy'
        type: { type: String, enum: ['full_day', 'morning', 'afternoon'] }
      }],
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' }
      }
    },

    // Authentication & Security
    lastLogin: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    phoneVerificationCode: String,
    phoneVerificationExpires: Date,

    // API Access
    apiKey: String,
    apiKeyExpiry: Date,

    // Two-factor authentication
    twoFactorSecret: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Notification preferences
    notifications: {
      email: {
        applicationUpdates: { type: Boolean, default: true },
        inspectionReminders: { type: Boolean, default: true },
        certificateExpiry: { type: Boolean, default: true },
        systemAnnouncements: { type: Boolean, default: true },
      },

      sms: {
        urgentAlerts: { type: Boolean, default: true },
        inspectionScheduled: { type: Boolean, default: true },
      },

      inApp: {
        enabled: { type: Boolean, default: true },
        sound: { type: Boolean, default: true },
      },
    },

    // Activity tracking
    lastActivity: Date,
    loginHistory: [
      {
        timestamp: Date,
        ip: String,
        userAgent: String,
        location: String,
      },
    ],

    // Additional metadata
    registrationSource: {
      type: String,
      enum: ['web', 'mobile', 'admin', 'import'],
      default: 'web',
    },

    notes: String, // Admin notes about the user

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    strict: true, // Enforce strict schema
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.emailVerificationToken;
        delete ret.phoneVerificationCode;
        delete ret.twoFactorSecret;
        delete ret.apiKey;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ nationalId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'workLocation.provinces': 1 });
userSchema.index({ isActive: 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full profile completion
userSchema.virtual('profileCompleteness').get(function () {
  let completion = 0;
  const totalFields = 10;

  if (this.fullName) {
    completion++;
  }
  if (this.phone) {
    completion++;
  }
  if (this.nationalId) {
    completion++;
  }
  if (this.isEmailVerified) {
    completion++;
  }
  if (this.isPhoneVerified) {
    completion++;
  }
  if (this.profilePicture) {
    completion++;
  }

  // Role-specific completeness
  if (this.role === 'farmer') {
    if (this.farmingExperience !== undefined) {
      completion++;
    }
    if (this.farmerType) {
      completion++;
    }
  } else if (this.role === 'auditor') {
    if (this.expertise && this.expertise.cropTypes.length > 0) {
      completion++;
    }
    if (this.expertise && this.expertise.experience !== undefined) {
      completion++;
    }
  } else if (this.role === 'officer') {
    if (this.workLocation && this.workLocation.provinces.length > 0) {
      completion++;
    }
    if (this.workLocation && this.workLocation.office) {
      completion++;
    }
  }

  return Math.round((completion / totalFields) * 100);
});

// Pre-save middleware
userSchema.pre('save', async function (next) {
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Update lastActivity
  this.lastActivity = new Date();

  // Set default permissions based on role
  if (this.isNew || this.isModified('role')) {
    this.permissions = this.getDefaultPermissions();
  }

  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.getDefaultPermissions = function () {
  const permissionMap = {
    farmer: ['create_application', 'view_application', 'edit_application'],
    officer: [
      'view_application',
      'review_application',
      'approve_application',
      'reject_application',
      'schedule_inspection',
      'view_reports',
      'manage_users', // Officer can manage users (e.g. assign tasks)
    ],
    auditor: ['view_application', 'conduct_inspection', 'complete_inspection', 'review_application'],
    admin: [
      'create_application',
      'view_application',
      'edit_application',
      'delete_application',
      'review_application',
      'approve_application',
      'reject_application',
      'schedule_inspection',
      'conduct_inspection',
      'complete_inspection',
      'generate_certificate',
      'revoke_certificate',
      'renew_certificate',
      'manage_users',
      'view_reports',
      'system_admin',
    ],
  };

  return permissionMap[this.role] || [];
};

userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission) || this.role === 'admin';
};

userSchema.methods.incrementLoginAttempts = function () {
  // Clear attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

userSchema.methods.generatePhoneVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  this.phoneVerificationCode = code;
  this.phoneVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

  return code;
};

userSchema.methods.generateApiKey = function () {
  const apiKey = crypto.randomBytes(32).toString('hex');

  this.apiKey = apiKey;
  this.apiKeyExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

  return apiKey;
};

userSchema.methods.addLoginHistory = function (ip, userAgent, location = null) {
  this.loginHistory.unshift({
    timestamp: new Date(),
    ip,
    userAgent,
    location,
  });

  // Keep only last 10 login records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(0, 10);
  }

  this.lastLogin = new Date();
};

userSchema.methods.updateWorkload = function (delta) {
  this.workload.activeApplications += delta;
  this.workload.activeApplications = Math.max(0, this.workload.activeApplications);
};

userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    role: this.role,
    isActive: this.isActive,
    profilePicture: this.profilePicture,
    expertise: this.role === 'auditor' ? this.expertise : undefined,
    workLocation: ['officer', 'auditor'].includes(this.role) ? this.workLocation : undefined,
    profileCompleteness: this.profileCompleteness,
    lastActivity: this.lastActivity,
  };
};

// Static methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });
};

userSchema.statics.findAvailableOfficers = function (province) {
  return this.find({
    role: 'officer',
    'workLocation.provinces': province,
    isActive: true,
  }).sort({ 'workload.activeApplications': 1 });
};

userSchema.statics.findAvailableAuditors = function (province, cropTypes = []) {
  const query = {
    role: 'auditor',
    'workLocation.provinces': province,
    isActive: true,
  };

  if (cropTypes.length > 0) {
    query['expertise.cropTypes'] = { $in: cropTypes };
  }

  return this.find(query).sort({ 'workload.scheduledInspections': 1 });
};

userSchema.statics.getActiveUserStats = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        avgWorkload: { $avg: '$workload.activeApplications' },
      },
    },
  ]);
};

// Create model only if it doesn't exist
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

module.exports = User;
