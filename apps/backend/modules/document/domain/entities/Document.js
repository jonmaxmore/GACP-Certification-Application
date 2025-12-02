/**
 * Document Entity
 *
 * Core business entity representing a document in the system.
 * Part of Clean Architecture - Domain Layer
 */

class Document {
  // Document Types
  static TYPE = {
    // Farm Documents
    FARM_CERTIFICATE: 'FARM_CERTIFICATE',
    LAND_DEED: 'LAND_DEED',
    FARM_MAP: 'FARM_MAP',
    FARM_PHOTO: 'FARM_PHOTO',

    // Survey Documents
    SURVEY_FORM: 'SURVEY_FORM',
    SURVEY_PHOTOS: 'SURVEY_PHOTOS',
    INSPECTION_REPORT: 'INSPECTION_REPORT',

    // Certificate Documents
    GAP_CERTIFICATE: 'GAP_CERTIFICATE',
    TRAINING_CERTIFICATE: 'TRAINING_CERTIFICATE',
    ORGANIC_CERTIFICATE: 'ORGANIC_CERTIFICATE',

    // Identity Documents
    ID_CARD: 'ID_CARD',
    HOUSE_REGISTRATION: 'HOUSE_REGISTRATION',

    // Business Documents
    BUSINESS_LICENSE: 'BUSINESS_LICENSE',
    TAX_DOCUMENT: 'TAX_DOCUMENT',
    BANK_STATEMENT: 'BANK_STATEMENT',

    // Other
    CONTRACT: 'CONTRACT',
    AGREEMENT: 'AGREEMENT',
    REPORT: 'REPORT',
    OTHER: 'OTHER',
  };

  // Document Status
  static STATUS = {
    PENDING: 'PENDING', // Uploaded, waiting for review
    UNDER_REVIEW: 'UNDER_REVIEW', // Being reviewed by staff
    APPROVED: 'APPROVED', // Approved by staff
    REJECTED: 'REJECTED', // Rejected by staff
    EXPIRED: 'EXPIRED', // Document expired
    ARCHIVED: 'ARCHIVED', // Archived (soft delete)
  };

  // File Categories
  static CATEGORY = {
    IDENTITY: 'IDENTITY',
    FARM: 'FARM',
    SURVEY: 'SURVEY',
    CERTIFICATE: 'CERTIFICATE',
    BUSINESS: 'BUSINESS',
    REPORT: 'REPORT',
    OTHER: 'OTHER',
  };

  // Access Level
  static ACCESS_LEVEL = {
    PRIVATE: 'PRIVATE', // Only owner can view
    INTERNAL: 'INTERNAL', // Owner + DTAM staff
    PUBLIC: 'PUBLIC', // Anyone authenticated
  };

  constructor(data = {}) {
    this.id = data.id || null;

    // Basic Information
    this.name = data.name;
    this.description = data.description || '';
    this.type = data.type;
    this.category = data.category;

    // File Information
    this.fileName = data.fileName;
    this.originalFileName = data.originalFileName;
    this.filePath = data.filePath;
    this.fileSize = data.fileSize; // in bytes
    this.mimeType = data.mimeType;
    this.fileExtension = data.fileExtension;
    this.fileUrl = data.fileUrl || null;

    // Ownership
    this.uploadedBy = data.uploadedBy;
    this.uploadedByType = data.uploadedByType; // FARMER or DTAM_STAFF
    this.relatedEntity = data.relatedEntity || null; // { type: 'farm', id: '...' }

    // Status & Review
    this.status = data.status || Document.STATUS.PENDING;
    this.reviewedBy = data.reviewedBy || null;
    this.reviewedAt = data.reviewedAt || null;
    this.reviewNotes = data.reviewNotes || '';
    this.rejectionReason = data.rejectionReason || '';

    // Access Control
    this.accessLevel = data.accessLevel || Document.ACCESS_LEVEL.INTERNAL;
    this.allowedRoles = data.allowedRoles || [];

    // Version Control
    this.version = data.version || 1;
    this.previousVersionId = data.previousVersionId || null;
    this.isLatestVersion = data.isLatestVersion !== undefined ? data.isLatestVersion : true;

    // Expiration
    this.expiresAt = data.expiresAt || null;
    this.issuedDate = data.issuedDate || null;

    // Metadata
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.checksum = data.checksum || null; // MD5 or SHA256

    // Thumbnails & Preview
    this.thumbnailUrl = data.thumbnailUrl || null;
    this.previewUrl = data.previewUrl || null;

    // Statistics
    this.downloadCount = data.downloadCount || 0;
    this.viewCount = data.viewCount || 0;
    this.lastAccessedAt = data.lastAccessedAt || null;

    // Timestamps
    this.uploadedAt = data.uploadedAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.archivedAt = data.archivedAt || null;
  }

  // Factory method to create new document
  static create(documentData) {
    // Validate required fields
    if (!documentData.name) {
      throw new Error('Document name is required');
    }
    if (!documentData.type) {
      throw new Error('Document type is required');
    }
    if (!documentData.fileName) {
      throw new Error('File name is required');
    }
    if (!documentData.uploadedBy) {
      throw new Error('Uploader ID is required');
    }

    // Set category based on type if not provided
    if (!documentData.category) {
      documentData.category = Document._inferCategory(documentData.type);
    }

    // Set file extension
    if (!documentData.fileExtension && documentData.fileName) {
      documentData.fileExtension = Document._getFileExtension(documentData.fileName);
    }

    return new Document({
      ...documentData,
      status: Document.STATUS.PENDING,
      uploadedAt: new Date(),
      version: 1,
      isLatestVersion: true,
    });
  }

  // Business Methods

  // Submit for review
  submitForReview() {
    if (this.status !== Document.STATUS.PENDING) {
      throw new Error('Only pending documents can be submitted for review');
    }
    this.status = Document.STATUS.UNDER_REVIEW;
    this.updatedAt = new Date();
  }

  // Approve document
  approve(reviewerId, notes = '') {
    if (this.status !== Document.STATUS.UNDER_REVIEW && this.status !== Document.STATUS.PENDING) {
      throw new Error('Only documents under review can be approved');
    }
    this.status = Document.STATUS.APPROVED;
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
    this.updatedAt = new Date();
  }

  // Reject document
  reject(reviewerId, reason) {
    if (this.status !== Document.STATUS.UNDER_REVIEW && this.status !== Document.STATUS.PENDING) {
      throw new Error('Only documents under review can be rejected');
    }
    if (!reason) {
      throw new Error('Rejection reason is required');
    }
    this.status = Document.STATUS.REJECTED;
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  // Mark as expired
  markAsExpired() {
    this.status = Document.STATUS.EXPIRED;
    this.updatedAt = new Date();
  }

  // Archive document (soft delete)
  archive() {
    this.status = Document.STATUS.ARCHIVED;
    this.archivedAt = new Date();
    this.updatedAt = new Date();
  }

  // Create new version
  createNewVersion(newFileData) {
    // Mark current as not latest
    this.isLatestVersion = false;
    this.updatedAt = new Date();

    // Create new version
    return new Document({
      ...this,
      id: null, // New ID will be assigned
      ...newFileData,
      version: this.version + 1,
      previousVersionId: this.id,
      isLatestVersion: true,
      status: Document.STATUS.PENDING,
      uploadedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: '',
      rejectionReason: '',
    });
  }

  // Update metadata
  updateMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
    this.updatedAt = new Date();
  }

  // Add tags
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  // Remove tag
  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date();
  }

  // Increment download count
  incrementDownloadCount() {
    this.downloadCount++;
    this.lastAccessedAt = new Date();
    this.updatedAt = new Date();
  }

  // Increment view count
  incrementViewCount() {
    this.viewCount++;
    this.lastAccessedAt = new Date();
  }

  // Set expiration date
  setExpiration(expiresAt) {
    this.expiresAt = expiresAt;
    this.updatedAt = new Date();
  }

  // Update access level
  updateAccessLevel(accessLevel, allowedRoles = []) {
    if (!Object.values(Document.ACCESS_LEVEL).includes(accessLevel)) {
      throw new Error('Invalid access level');
    }
    this.accessLevel = accessLevel;
    this.allowedRoles = allowedRoles;
    this.updatedAt = new Date();
  }

  // Query Methods

  // Check if document is pending
  isPending() {
    return this.status === Document.STATUS.PENDING;
  }

  // Check if document is under review
  isUnderReview() {
    return this.status === Document.STATUS.UNDER_REVIEW;
  }

  // Check if document is approved
  isApproved() {
    return this.status === Document.STATUS.APPROVED;
  }

  // Check if document is rejected
  isRejected() {
    return this.status === Document.STATUS.REJECTED;
  }

  // Check if document is expired
  isExpired() {
    if (this.status === Document.STATUS.EXPIRED) {
      return true;
    }
    if (this.expiresAt && new Date() > this.expiresAt) {
      return true;
    }
    return false;
  }

  // Check if document is archived
  isArchived() {
    return this.status === Document.STATUS.ARCHIVED;
  }

  // Check if document is latest version
  isLatest() {
    return this.isLatestVersion;
  }

  // Check if user can access document
  canAccess(userId, userRole) {
    // Archived documents cannot be accessed
    if (this.isArchived()) {
      return false;
    }

    // Owner can always access
    if (this.uploadedBy === userId) {
      return true;
    }

    // Check access level
    if (this.accessLevel === Document.ACCESS_LEVEL.PUBLIC) {
      return true;
    }
    if (this.accessLevel === Document.ACCESS_LEVEL.PRIVATE) {
      return false;
    }
    if (this.accessLevel === Document.ACCESS_LEVEL.INTERNAL) {
      // DTAM staff can access internal documents
      if (userRole === 'DTAM_STAFF' || userRole === 'admin') {
        return true;
      }
      // Check allowed roles
      if (this.allowedRoles.length > 0 && this.allowedRoles.includes(userRole)) {
        return true;
      }
    }

    return false;
  }

  // Check if document requires review
  requiresReview() {
    return this.status === Document.STATUS.PENDING || this.status === Document.STATUS.UNDER_REVIEW;
  }

  // Get file size in human readable format
  getFileSizeFormatted() {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Get days until expiration
  getDaysUntilExpiration() {
    if (!this.expiresAt) {
      return null;
    }
    const now = new Date();
    const diff = this.expiresAt - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Check if document is image
  isImage() {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return imageTypes.includes(this.mimeType);
  }

  // Check if document is PDF
  isPDF() {
    return this.mimeType === 'application/pdf';
  }

  // Check if document is supported for preview
  isPreviewSupported() {
    return this.isImage() || this.isPDF();
  }

  // Helper Methods

  static _inferCategory(type) {
    if (type === Document.TYPE.ID_CARD || type === Document.TYPE.HOUSE_REGISTRATION) {
      return Document.CATEGORY.IDENTITY;
    }
    if (type.startsWith('FARM_')) {
      return Document.CATEGORY.FARM;
    }
    if (type.startsWith('SURVEY_') || type === Document.TYPE.INSPECTION_REPORT) {
      return Document.CATEGORY.SURVEY;
    }
    if (type.includes('CERTIFICATE')) {
      return Document.CATEGORY.CERTIFICATE;
    }
    if (type === Document.TYPE.BUSINESS_LICENSE || type === Document.TYPE.TAX_DOCUMENT) {
      return Document.CATEGORY.BUSINESS;
    }
    if (type === Document.TYPE.REPORT) {
      return Document.CATEGORY.REPORT;
    }
    return Document.CATEGORY.OTHER;
  }

  static _getFileExtension(fileName) {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }
}

module.exports = Document;
