/**
 * Certificate Model - GACP Platform
 * MongoDB schema for GACP certificate records
 *
 * @module database/models/Certificate
 * @version 2.0.0
 * @date 2025-10-16
 *
 * @standards
 * - OpenAPI 3.0.3 specification compliance
 * - PDF/A-1b format (ISO 19005-1)
 * - RSA-2048 digital signature
 * - QR code public verification
 * - 3-year validity period
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Digital Signature Subdocument Schema
 * RSA-2048 signature metadata
 */
const DigitalSignatureSchema = new Schema(
  {
    algorithm: {
      type: String,
      required: true,
      enum: ['RSA-SHA256'],
      default: 'RSA-SHA256'
    },
    keySize: {
      type: Number,
      required: true,
      enum: [2048],
      default: 2048
    },
    signature: {
      type: String,
      required: true,
      description: 'Base64-encoded signature'
    },
    signedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    signedBy: {
      type: String,
      required: true,
      default: 'DTAM (Department of Thai Autonomous Medicine)'
    },
    signerCertificate: {
      type: String,
      required: true,
      description: 'Base64-encoded X.509 certificate'
    }
  },
  { _id: false }
);

/**
 * Certificate Schema
 * GACP certificate records
 */
const CertificateSchema = new Schema(
  {
    // === PRIMARY KEY ===
    _id: {
      type: Schema.Types.ObjectId,
      auto: true
    },

    // === UNIQUE IDENTIFIERS ===
    certificateId: {
      type: String,
      required: true,
      match: /^CERT-\d{4}-[A-Z0-9]{8}$/,
      description: 'Format: CERT-YYYY-XXXXXXXX'
    },

    certificateNumber: {
      type: String,
      required: true,
      match: /^GACP-CERT-\d{4}-\d{6}$/,
      description: 'Public verification number: GACP-CERT-YYYY-NNNNNN'
    },

    // === ASSOCIATIONS ===
    applicationId: { type: String, required: true, ref: 'Application' },

    applicationNumber: {
      type: String,
      required: true,
      description: 'Denormalized for performance'
    },

    userId: {
      type: String,
      required: true,
      index: true,
      ref: 'User'
    },

    // === FARMER INFORMATION (Denormalized) ===
    farmerName: {
      type: String,
      required: true,
      trim: true
    },

    farmName: {
      type: String,
      required: true,
      trim: true
    },

    farmAddress: {
      type: String,
      required: true,
      maxlength: 500,
      description: 'Full formatted address for certificate display'
    },

    // === CERTIFICATE DETAILS ===
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED'],
      default: 'ACTIVE',
      index: true
    },

    // === VALIDITY PERIOD ===
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
      description: '3 years from issuance'
    },

    validityPeriod: {
      type: Number,
      required: true,
      default: 3,
      description: 'Validity period in years'
    },

    daysUntilExpiry: {
      type: Number,
      default: null,
      description: 'Calculated field, updated daily'
    },

    // === PDF GENERATION ===
    pdfS3Bucket: {
      type: String,
      required: true,
      default: 'gacp-platform-certificates-production'
    },

    pdfS3Key: {
      type: String,
      required: true,
      description: 'S3 key: certificates/YYYY/CERT-YYYY-XXXXXXXX.pdf'
    },

    pdfUrl: {
      type: String,
      required: true,
      description: 'CloudFront CDN URL for certificate download'
    },

    pdfGeneratedAt: {
      type: Date,
      required: true,
      default: Date.now
    },

    pdfFormat: {
      type: String,
      required: true,
      enum: ['PDF/A-1b'],
      default: 'PDF/A-1b',
      description: 'ISO 19005-1 long-term archival format'
    },

    // === DIGITAL SIGNATURE ===
    digitalSignature: {
      type: DigitalSignatureSchema,
      required: true
    },

    // === QR CODE VERIFICATION ===
    qrCode: {
      type: String,
      required: true,
      description: 'Base64-encoded PNG QR code'
    },

    qrData: {
      type: String,
      required: true,
      description: 'Public verification URL'
    },

    verificationUrl: {
      type: String,
      required: true,
      description: 'https://gacp.platform/verify/GACP-CERT-YYYY-NNNNNN'
    },

    // === REVOCATION ===
    revoked: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    },

    revokedAt: {
      type: Date,
      default: null
    },

    revokedBy: {
      type: String,
      default: null,
      description: 'userId who revoked the certificate'
    },

    revocationReason: {
      type: String,
      enum: [null, 'FRAUD', 'VIOLATION', 'INSPECTION_FAILURE', 'REQUEST'],
      default: null
    },

    revocationNotes: {
      type: String,
      maxlength: 1000,
      default: null
    },

    // === RENEWAL ===
    isRenewal: {
      type: Boolean,
      required: true,
      default: false
    },

    originalCertificateId: {
      type: String,
      default: null,
      description: 'Reference to original certificate if this is a renewal'
    },

    renewalApplicationId: {
      type: String,
      default: null,
      description: 'Application ID of renewal application'
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
    }
  },
  {
    timestamps: true,
    collection: 'certificates',
    versionKey: false
  }
);

// ========================================
// INDEXES
// ========================================

CertificateSchema.index({ certificateId: 1 }, { unique: true });
CertificateSchema.index({ certificateNumber: 1 }, { unique: true });
CertificateSchema.index({ applicationId: 1 });
CertificateSchema.index({ userId: 1, status: 1 });
CertificateSchema.index({ status: 1, expiresAt: 1 }); // Expiring certificates
CertificateSchema.index({ issuedAt: -1 });

// Partial index (active certificates only)
CertificateSchema.index(
  { expiresAt: 1 },
  {
    partialFilterExpression: {
      status: { $in: ['ACTIVE', 'EXPIRING_SOON'] }
    },
    name: 'active_certificates_expiry'
  }
);

// ========================================
// VIRTUAL PROPERTIES
// ========================================

/**
 * Check if certificate is valid
 */
CertificateSchema.virtual('isValid').get(function () {
  return this.status === 'ACTIVE' && !this.revoked && this.expiresAt > new Date();
});

/**
 * Check if certificate is expiring soon (within 30 days)
 */
CertificateSchema.virtual('isExpiringSoon').get(function () {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return this.expiresAt <= thirtyDaysFromNow && this.expiresAt > new Date();
});

/**
 * Get days remaining until expiry
 */
CertificateSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const diff = this.expiresAt - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
});

/**
 * Get certificate age in days
 */
CertificateSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const diff = now - this.issuedAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Revoke certificate
 * @param {String} revokedBy - User ID who is revoking
 * @param {String} reason - Revocation reason
 * @param {String} notes - Optional notes
 * @returns {Promise<Certificate>}
 */
CertificateSchema.methods.revoke = async function (revokedBy, reason, notes = null) {
  if (this.revoked) {
    throw new Error('Certificate already revoked');
  }

  if (!['FRAUD', 'VIOLATION', 'INSPECTION_FAILURE', 'REQUEST'].includes(reason)) {
    throw new Error('Invalid revocation reason');
  }

  this.revoked = true;
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revocationReason = reason;
  this.revocationNotes = notes;
  this.status = 'REVOKED';

  await this.save();
  return this;
};

/**
 * Update expiry status based on current date
 * @returns {Promise<Certificate>}
 */
CertificateSchema.methods.updateExpiryStatus = async function () {
  const now = new Date();

  if (this.revoked) {
    this.status = 'REVOKED';
  } else if (this.expiresAt < now) {
    this.status = 'EXPIRED';
  } else if (this.isExpiringSoon) {
    this.status = 'EXPIRING_SOON';
  } else {
    this.status = 'ACTIVE';
  }

  this.daysUntilExpiry = this.daysRemaining;

  await this.save();
  return this;
};

/**
 * Generate verification data
 * @returns {Object}
 */
CertificateSchema.methods.getVerificationData = function () {
  return {
    certificateNumber: this.certificateNumber,
    farmerName: this.farmerName,
    farmName: this.farmName,
    farmAddress: this.farmAddress,
    issuedAt: this.issuedAt,
    expiresAt: this.expiresAt,
    status: this.status,
    isValid: this.isValid,
    revoked: this.revoked,
    revokedAt: this.revokedAt,
    revocationReason: this.revocationReason,
    verificationUrl: this.verificationUrl
  };
};

// ========================================
// STATIC METHODS
// ========================================

/**
 * Generate unique Certificate ID
 * @returns {Promise<String>} - Format: CERT-YYYY-XXXXXXXX
 */
CertificateSchema.statics.generateCertificateId = async function () {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const certificateId = `CERT-${year}-${randomPart}`;

  const existing = await this.findOne({ certificateId });
  if (existing) {
    return this.generateCertificateId();
  }

  return certificateId;
};

/**
 * Generate sequential Certificate Number
 * @returns {Promise<String>} - Format: GACP-CERT-YYYY-NNNNNN
 */
CertificateSchema.statics.generateCertificateNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `GACP-CERT-${year}-`;

  const lastCert = await this.findOne({
    certificateNumber: new RegExp(`^${prefix}`)
  }).sort({ certificateNumber: -1 });

  let nextNumber = 1;
  if (lastCert) {
    const lastNumber = parseInt(lastCert.certificateNumber.split('-')[3]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

/**
 * Verify certificate by number (public API)
 * @param {String} certificateNumber - Certificate number
 * @returns {Promise<Object>}
 */
CertificateSchema.statics.verifyByNumber = async function (certificateNumber) {
  const certificate = await this.findOne({ certificateNumber });

  if (!certificate) {
    return {
      valid: false,
      message: 'Certificate not found'
    };
  }

  return {
    valid: certificate.isValid,
    message: certificate.isValid ? 'Certificate is valid' : 'Certificate is not valid',
    data: certificate.getVerificationData()
  };
};

/**
 * Find expiring certificates (within days)
 * @param {Number} days - Days threshold
 * @returns {Promise<Certificate[]>}
 */
CertificateSchema.statics.findExpiring = function (days = 30) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: { $in: ['ACTIVE', 'EXPIRING_SOON'] },
    revoked: false,
    expiresAt: { $gte: now, $lte: futureDate }
  }).sort({ expiresAt: 1 });
};

/**
 * Find expired certificates
 * @returns {Promise<Certificate[]>}
 */
CertificateSchema.statics.findExpired = function () {
  return this.find({
    status: { $ne: 'EXPIRED' },
    revoked: false,
    expiresAt: { $lt: new Date() }
  });
};

// ========================================
// MIDDLEWARE (Hooks)
// ========================================

/**
 * Pre-save: Update updatedAt
 */
CertificateSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Pre-save: Set expiry date (3 years)
 */
CertificateSchema.pre('save', function (next) {
  if (this.isNew && !this.expiresAt) {
    const expiryDate = new Date(this.issuedAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + this.validityPeriod);
    this.expiresAt = expiryDate;
  }
  next();
});

/**
 * Pre-save: Generate verification URL
 */
CertificateSchema.pre('save', function (next) {
  if (this.isNew && !this.verificationUrl) {
    this.verificationUrl = `https://gacp.platform/verify/${this.certificateNumber}`;
    this.qrData = this.verificationUrl;
  }
  next();
});

/**
 * Pre-save: Generate S3 key
 */
CertificateSchema.pre('save', function (next) {
  if (this.isNew && !this.pdfS3Key) {
    const year = new Date().getFullYear();
    this.pdfS3Key = `certificates/${year}/${this.certificateId}.pdf`;
  }
  next();
});

/**
 * Pre-save: Calculate days until expiry
 */
CertificateSchema.pre('save', function (next) {
  this.daysUntilExpiry = this.daysRemaining;
  next();
});

/**
 * Post-save: Update expiry status
 */
CertificateSchema.post('save', async function (doc, next) {
  // Auto-update status based on expiry
  const now = new Date();
  let newStatus = doc.status;

  if (doc.revoked) {
    newStatus = 'REVOKED';
  } else if (doc.expiresAt < now) {
    newStatus = 'EXPIRED';
  } else if (doc.isExpiringSoon) {
    newStatus = 'EXPIRING_SOON';
  } else {
    newStatus = 'ACTIVE';
  }

  if (newStatus !== doc.status) {
    doc.status = newStatus;
    await doc.save();
  }

  next();
});

// ========================================
// SCHEMA CONFIGURATION
// ========================================

CertificateSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

CertificateSchema.set('toObject', {
  virtuals: true
});

// ========================================
// EXPORT MODEL
// ========================================

module.exports = mongoose.model('Certificate', CertificateSchema);
