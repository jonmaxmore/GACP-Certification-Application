/**
 * Document Model Schema
 *
 * Mongoose schema for document management with comprehensive metadata tracking.
 * Supports versioning, security, and audit requirements for GACP certification.
 *
 * Features:
 * - Complete document lifecycle tracking
 * - Security metadata (encryption, virus scan)
 * - OCR and content extraction results
 * - Version control and change history
 * - Access control and audit logging
 * - File integrity verification
 * - Expiry date management
 * - Document relationships and dependencies
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    // Core document identification
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: [
        'farm_license',
        'land_deed',
        'farmer_id',
        'farm_photos',
        'water_test_report',
        'soil_test_report',
        'inspection_photos',
        'inspection_report',
        'certificate',
        'payment_receipt',
        'revision_request',
        'other',
      ],
      index: true,
    },

    // Application and user context
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application ID is required'],
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader ID is required'],
      index: true,
    },

    userRole: {
      type: String,
      required: [true, 'User role is required'],
      enum: ['FARMER', 'DTAM_REVIEWER', 'DTAM_INSPECTOR', 'DTAM_ADMIN', 'SYSTEM'],
    },

    // File information
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
      maxlength: [255, 'Filename cannot exceed 255 characters'],
    },

    fileName: {
      type: String,
      required: [true, 'Storage filename is required'],
      unique: true,
      trim: true,
    },

    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be greater than 0'],
      max: [100 * 1024 * 1024, 'File size cannot exceed 100MB'], // 100MB limit
    },

    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },

    fileExtension: {
      type: String,
      required: true,
      enum: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
    },

    // Storage and security
    storagePath: {
      type: String,
      required: [true, 'Storage path is required'],
      trim: true,
    },

    storageUrl: {
      type: String,
      trim: true,
    },

    storageKey: {
      type: String,
      required: [true, 'Storage key is required'],
      trim: true,
    },

    checksum: {
      type: String,
      required: [true, 'File checksum is required'],
      length: 64, // SHA-256 hash length
    },

    // Security and encryption
    encrypted: {
      type: Boolean,
      default: false,
    },

    encryptionKey: {
      type: String,
      select: false, // Never include in queries by default
    },

    encryptionAlgorithm: {
      type: String,
      default: 'AES-256-GCM',
    },

    // Virus scanning results
    virusScanResult: {
      scanned: { type: Boolean, default: false },
      clean: { type: Boolean, default: false },
      scanDate: { type: Date },
      scanEngine: { type: String },
      threat: { type: String },
      scanId: { type: String },
    },

    // OCR and content extraction
    ocrText: {
      type: String,
      index: 'text', // Text search index
    },

    ocrConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },

    extractedData: {
      dates: [{ type: Date }],
      numbers: [{ type: String }],
      entities: [
        {
          type: { type: String },
          value: { type: String },
          confidence: { type: Number },
        },
      ],
      keywords: [{ type: String }],
      language: { type: String, default: 'th' },
    },

    // Document metadata and validation
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    expiryDate: {
      type: Date,
      index: true,
    },

    validationStatus: {
      status: {
        type: String,
        enum: ['PENDING', 'VALID', 'INVALID', 'EXPIRED', 'REQUIRES_REVIEW'],
        default: 'PENDING',
      },
      validatedAt: { type: Date },
      validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      validationNotes: { type: String, trim: true },
    },

    // Document lifecycle
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED', 'DELETED', 'QUARANTINED'],
      default: 'ACTIVE',
      index: true,
    },

    // Version control
    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    previousVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },

    versionHistory: [
      {
        version: { type: Number },
        createdAt: { type: Date },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changes: { type: String },
        fileSize: { type: Number },
        checksum: { type: String },
      },
    ],

    // Image-specific metadata
    imageMetadata: {
      width: { type: Number },
      height: { type: Number },
      dpi: { type: Number },
      colorSpace: { type: String },
      hasGpsData: { type: Boolean, default: false },
      gpsCoordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
        accuracy: { type: Number },
      },
      cameraInfo: {
        make: { type: String },
        model: { type: String },
        timestamp: { type: Date },
      },
    },

    // PDF-specific metadata
    pdfMetadata: {
      pageCount: { type: Number },
      hasText: { type: Boolean, default: false },
      hasImages: { type: Boolean, default: false },
      isSearchable: { type: Boolean, default: false },
      passwordProtected: { type: Boolean, default: false },
      author: { type: String },
      creator: { type: String },
      producer: { type: String },
      creationDate: { type: Date },
    },

    // Thumbnail and preview
    thumbnailUrl: {
      type: String,
      trim: true,
    },

    previewUrl: {
      type: String,
      trim: true,
    },

    // Access control and sharing
    accessLevel: {
      type: String,
      enum: ['PRIVATE', 'APPLICATION_TEAM', 'DTAM_STAFF', 'PUBLIC'],
      default: 'APPLICATION_TEAM',
    },

    sharedWith: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        sharedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        permissions: [{ type: String, enum: ['READ', 'DOWNLOAD', 'COMMENT'] }],
      },
    ],

    // Audit trail
    downloadHistory: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        downloadedAt: { type: Date, default: Date.now },
        ipAddress: { type: String },
        userAgent: { type: String },
      },
    ],

    // Timestamps and tracking
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    lastAccessedAt: {
      type: Date,
      index: true,
    },

    archivedAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    deletionReason: {
      type: String,
      trim: true,
    },

    // Retention and compliance
    retentionPolicy: {
      retainUntil: { type: Date },
      autoDeleteAfter: { type: Date },
      legalHold: { type: Boolean, default: false },
      complianceNotes: { type: String },
    },
  },
  {
    timestamps: true,
    collection: 'documents',
    toJSON: {
      transform: function (doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.encryptionKey;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.encryptionKey;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for performance optimization
documentSchema.index({ applicationId: 1, documentType: 1 });
documentSchema.index({ uploadedBy: 1, uploadedAt: -1 });
documentSchema.index({ status: 1, uploadedAt: -1 });
documentSchema.index({ expiryDate: 1 }, { sparse: true });
documentSchema.index({ validationStatus: 1 });
documentSchema.index({ 'virusScanResult.clean': 1 });
documentSchema.index({ checksum: 1 });

// Compound indexes
documentSchema.index({ applicationId: 1, status: 1, documentType: 1 });
documentSchema.index({ uploadedBy: 1, status: 1, uploadedAt: -1 });

// Text search index for OCR content
documentSchema.index({
  ocrText: 'text',
  originalName: 'text',
  description: 'text',
  tags: 'text',
});

// Virtual properties
documentSchema.virtual('isExpired').get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});

documentSchema.virtual('isValid').get(function () {
  return this.validationStatus?.status === 'VALID' && !this.isExpired;
});

documentSchema.virtual('fileType').get(function () {
  return this.mimeType.split('/')[0]; // 'image', 'application', etc.
});

documentSchema.virtual('fileSizeHuman').get(function () {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  let size = this.fileSize;
  let i = 0;

  while (size >= 1024 && i < sizes.length - 1) {
    size /= 1024;
    i++;
  }

  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
});

// Pre-save middleware
documentSchema.pre('save', function (next) {
  // Extract file extension
  if (this.originalName && !this.fileExtension) {
    const path = require('path');
    this.fileExtension = path.extname(this.originalName).toLowerCase();
  }

  // Set retention policy if not set
  if (!this.retentionPolicy?.retainUntil) {
    const retentionYears = 7; // Default retention period
    this.retentionPolicy = {
      ...this.retentionPolicy,
      retainUntil: new Date(Date.now() + retentionYears * 365 * 24 * 60 * 60 * 1000),
    };
  }

  next();
});

// Instance methods
documentSchema.methods.generateDownloadToken = function (userId, expiresIn = 3600) {
  const crypto = require('crypto');
  const payload = {
    documentId: this._id,
    userId,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

documentSchema.methods.validateChecksum = async function (fileBuffer) {
  const crypto = require('crypto');
  const calculatedChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  return calculatedChecksum === this.checksum;
};

documentSchema.methods.addVersionHistory = function (userId, changes = '') {
  this.versionHistory.push({
    version: this.version,
    createdAt: new Date(),
    createdBy: userId,
    changes,
    fileSize: this.fileSize,
    checksum: this.checksum,
  });
};

documentSchema.methods.recordDownload = function (userId, ipAddress = '', userAgent = '') {
  this.downloadHistory.push({
    userId,
    downloadedAt: new Date(),
    ipAddress,
    userAgent,
  });

  this.lastAccessedAt = new Date();
  return this.save();
};

documentSchema.methods.shareWith = function (
  userId,
  role,
  permissions = ['READ'],
  expiresIn = null,
) {
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null;

  // Remove existing share for this user
  this.sharedWith = this.sharedWith.filter(share => !share.userId.equals(userId));

  // Add new share
  this.sharedWith.push({
    userId,
    role,
    permissions,
    expiresAt,
    sharedAt: new Date(),
  });

  return this.save();
};

// Static methods
documentSchema.statics.findByApplication = function (applicationId, options = {}) {
  const query = { applicationId };

  if (!options.includeDeleted) {
    query.status = { $ne: 'DELETED' };
  }

  return this.find(query).sort({ uploadedAt: -1 });
};

documentSchema.statics.findExpiredDocuments = function () {
  return this.find({
    expiryDate: { $lt: new Date() },
    status: 'ACTIVE',
  });
};

documentSchema.statics.findByType = function (documentType, applicationId = null) {
  const query = { documentType, status: 'ACTIVE' };

  if (applicationId) {
    query.applicationId = applicationId;
  }

  return this.find(query).sort({ uploadedAt: -1 });
};

documentSchema.statics.findDuplicatesByChecksum = function (checksum) {
  return this.find({ checksum, status: { $ne: 'DELETED' } });
};

documentSchema.statics.getStorageStatistics = function () {
  return this.aggregate([
    { $match: { status: { $ne: 'DELETED' } } },
    {
      $group: {
        _id: '$documentType',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgSize: { $avg: '$fileSize' },
      },
    },
    { $sort: { totalSize: -1 } },
  ]);
};

// Model compilation
const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
