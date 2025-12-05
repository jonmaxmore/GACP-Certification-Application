/**
 * Certificate Model
 *
 * Mongoose schema for GACP certificates
 */

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    // Certificate identification
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^GACP-\d{4}-\d{4}$/,
      description: 'Unique certificate number in format GACP-YYYY-NNNN',
    },

    verificationCode: {
      type: String,
      required: true,
      index: true,
      description: 'Cryptographic verification code for public verification',
    },

    qrData: {
      type: String,
      required: true,
      description: 'QR code data containing verification URL',
    },

    // Related entities
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      description: 'Reference to the approved application',
    },

    farmId: {
      type: String,
      required: true,
      index: true,
      description: 'Farm identification number',
    },

    userId: {
      type: String,
      required: true,
      index: true,
      description: 'User/Farmer identification number',
    },

    // Farm information
    farmName: {
      type: String,
      required: true,
      description: 'Name of the certified farm',
    },

    farmerName: {
      type: String,
      required: true,
      description: 'Name of the farmer/owner',
    },

    location: {
      province: { type: String, required: true },
      district: { type: String, required: true },
      subDistrict: { type: String, required: true },
      address: { type: String },
    },

    cropType: {
      type: String,
      required: true,
      description: 'Type of crop/cannabis cultivated',
    },

    farmSize: {
      type: Number,
      required: true,
      min: 0,
      description: 'Farm size in rai',
    },

    // Standard information
    standardId: {
      type: String,
      required: true,
      description: 'Standard identification (GAP/GACP)',
    },

    standardName: {
      type: String,
      required: true,
      description: 'Full name of the standard',
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      description: 'Certification score/rating',
    },

    // Certificate status
    status: {
      type: String,
      required: true,
      enum: ['active', 'expired', 'revoked', 'renewed'],
      default: 'active',
      index: true,
      description: 'Current status of the certificate',
    },

    // Dates
    issuedDate: {
      type: Date,
      required: true,
      default: Date.now,
      description: 'Date certificate was issued',
    },

    expiryDate: {
      type: Date,
      required: true,
      index: true,
      description: 'Date certificate expires',
    },

    validityYears: {
      type: Number,
      required: true,
      default: 3,
      description: 'Number of years certificate is valid',
    },

    // Issuing authority
    issuedBy: {
      type: String,
      required: true,
      description: 'Authority or person who issued the certificate',
    },

    // PDF information
    pdfGenerated: {
      type: Boolean,
      default: false,
      description: 'Whether PDF certificate has been generated',
    },

    pdfUrl: {
      type: String,
      description: 'URL to the PDF certificate file',
    },

    pdfGeneratedAt: {
      type: Date,
      description: 'Timestamp when PDF was generated',
    },

    // Usage tracking
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
      description: 'Number of times certificate was downloaded',
    },

    verificationCount: {
      type: Number,
      default: 0,
      min: 0,
      description: 'Number of times certificate was verified',
    },

    lastDownloadedAt: {
      type: Date,
      description: 'Timestamp of last download',
    },

    lastVerifiedAt: {
      type: Date,
      description: 'Timestamp of last verification',
    },

    // Revocation information
    revokedAt: {
      type: Date,
      description: 'Timestamp when certificate was revoked',
    },

    revokedBy: {
      type: String,
      description: 'User who revoked the certificate',
    },

    revokedReason: {
      type: String,
      description: 'Reason for revocation',
    },

    // Renewal information
    renewedCertificateId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'Reference to the renewed certificate',
    },

    previousCertificateId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'Reference to the previous certificate (if renewal)',
    },

    // Additional metadata
    notes: {
      type: String,
      description: 'Additional notes or comments',
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Additional flexible metadata',
    },
  },
  {
    timestamps: true,
    collection: 'certificates',
  },
);

// Indexes for performance
certificateSchema.index({ certificateNumber: 1 }, { unique: true });
certificateSchema.index({ applicationId: 1 });
certificateSchema.index({ farmId: 1 });
certificateSchema.index({ userId: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ expiryDate: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ issuedDate: -1 });

// Compound indexes
certificateSchema.index({ userId: 1, status: 1 });
certificateSchema.index({ status: 1, expiryDate: 1 });
certificateSchema.index({ farmId: 1, status: 1 });

// Virtual: Check if certificate is expired
certificateSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

// Virtual: Check if certificate is active
certificateSchema.virtual('isActive').get(function () {
  return this.status === 'active' && !this.isExpired;
});

// Virtual: Days until expiry
certificateSchema.virtual('daysUntilExpiry').get(function () {
  const now = new Date();
  const diffTime = this.expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual: Is expiring soon (within 90 days)
certificateSchema.virtual('isExpiringSoon').get(function () {
  return this.daysUntilExpiry <= 90 && this.daysUntilExpiry > 0;
});

// Virtual: Can be renewed (within 90 days before expiry)
certificateSchema.virtual('canRenew').get(function () {
  return this.status === 'active' && this.isExpiringSoon;
});

// Virtual: Full location string
certificateSchema.virtual('fullLocation').get(function () {
  const { address, subDistrict, district, province } = this.location;
  const parts = [];
  if (address) {
    parts.push(address);
  }
  if (subDistrict) {
    parts.push(`ต.${subDistrict}`);
  }
  if (district) {
    parts.push(`อ.${district}`);
  }
  if (province) {
    parts.push(`จ.${province}`);
  }
  return parts.join(' ');
});

// Instance method: Verify certificate
certificateSchema.methods.verify = function (code) {
  // Check if certificate is revoked
  if (this.status === 'revoked') {
    return {
      valid: false,
      reason: 'Certificate has been revoked',
      revokedAt: this.revokedAt,
      revokedReason: this.revokedReason,
    };
  }

  // Check if certificate is expired
  if (this.isExpired) {
    return {
      valid: false,
      reason: 'Certificate has expired',
      expiryDate: this.expiryDate,
    };
  }

  // Check verification code if provided
  if (code && this.verificationCode !== code) {
    return {
      valid: false,
      reason: 'Invalid verification code',
    };
  }

  return {
    valid: true,
    certificate: {
      certificateNumber: this.certificateNumber,
      farmName: this.farmName,
      farmerName: this.farmerName,
      standardName: this.standardName,
      issuedDate: this.issuedDate,
      expiryDate: this.expiryDate,
      status: this.status,
    },
  };
};

// Instance method: Increment download count
certificateSchema.methods.incrementDownloadCount = async function () {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  return this.save();
};

// Instance method: Increment verification count
certificateSchema.methods.incrementVerificationCount = async function () {
  this.verificationCount += 1;
  this.lastVerifiedAt = new Date();
  return this.save();
};

// Instance method: Revoke certificate
certificateSchema.methods.revoke = async function (revokedBy, reason) {
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revokedReason = reason;
  return this.save();
};

// Instance method: Mark as renewed
certificateSchema.methods.markAsRenewed = async function (newCertificateId) {
  this.status = 'renewed';
  this.renewedCertificateId = newCertificateId;
  return this.save();
};

// Static method: Find active certificates
certificateSchema.statics.findActive = function () {
  return this.find({
    status: 'active',
    expiryDate: { $gt: new Date() },
  });
};

// Static method: Find expiring certificates
certificateSchema.statics.findExpiring = function (days = 90) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: 'active',
    expiryDate: {
      $gt: now,
      $lte: futureDate,
    },
  }).sort({ expiryDate: 1 });
};

// Static method: Find expired certificates
certificateSchema.statics.findExpired = function () {
  return this.find({
    status: 'active',
    expiryDate: { $lte: new Date() },
  });
};

// Static method: Find by user
certificateSchema.statics.findByUser = function (userId, options = {}) {
  const query = { userId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.includeExpired === false) {
    query.expiryDate = { $gt: new Date() };
  }

  return this.find(query).sort({ issuedDate: -1 });
};

// Static method: Find by farm
certificateSchema.statics.findByFarm = function (farmId, options = {}) {
  const query = { farmId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.includeExpired === false) {
    query.expiryDate = { $gt: new Date() };
  }

  return this.find(query).sort({ issuedDate: -1 });
};

// Static method: Get certificate statistics
certificateSchema.statics.getStats = async function () {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expiringDate = new Date();
  expiringDate.setDate(expiringDate.getDate() + 90);

  const [stats] = await this.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        active: [{ $match: { status: 'active', expiryDate: { $gt: now } } }, { $count: 'count' }],
        expired: [{ $match: { status: 'active', expiryDate: { $lte: now } } }, { $count: 'count' }],
        revoked: [{ $match: { status: 'revoked' } }, { $count: 'count' }],
        thisMonth: [{ $match: { issuedDate: { $gte: startOfMonth } } }, { $count: 'count' }],
        expiringSoon: [
          {
            $match: {
              status: 'active',
              expiryDate: { $gt: now, $lte: expiringDate },
            },
          },
          { $count: 'count' },
        ],
        byStandard: [{ $group: { _id: '$standardId', count: { $sum: 1 } } }],
      },
    },
  ]);

  return {
    total: stats.total[0]?.count || 0,
    active: stats.active[0]?.count || 0,
    expired: stats.expired[0]?.count || 0,
    revoked: stats.revoked[0]?.count || 0,
    thisMonth: stats.thisMonth[0]?.count || 0,
    expiringSoon: stats.expiringSoon[0]?.count || 0,
    byStandard: stats.byStandard || [],
  };
};

// Pre-save middleware: Update expiry status
certificateSchema.pre('save', function (next) {
  // Auto-update status to expired if expiry date has passed
  if (this.status === 'active' && this.expiryDate < new Date()) {
    this.status = 'expired';
  }
  next();
});

// Enable virtuals in JSON output
certificateSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

certificateSchema.set('toObject', {
  virtuals: true,
});

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
