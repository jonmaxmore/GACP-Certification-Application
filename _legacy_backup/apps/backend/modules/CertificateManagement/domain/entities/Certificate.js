/**
 * Certificate Entity (Domain Layer)
 * Pure business object - No framework dependencies
 */

class Certificate {
  constructor({
    id,
    certificateNumber,
    applicationId,
    userId,
    farmId,
    certificateType,
    standardType,
    issueDate,
    expiryDate,
    status,
    qrCode,
    pdfUrl,
    issuedBy,
    verificationCount,
    metadata,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.certificateNumber = certificateNumber;
    this.applicationId = applicationId;
    this.userId = userId;
    this.farmId = farmId;
    this.certificateType = certificateType || 'GACP';
    this.standardType = standardType || 'GACP';
    this.issueDate = issueDate || new Date();
    this.expiryDate = expiryDate || this.calculateExpiryDate();
    this.status = status || 'ACTIVE';
    this.qrCode = qrCode;
    this.pdfUrl = pdfUrl;
    this.issuedBy = issuedBy;
    this.verificationCount = verificationCount || 0;
    this.metadata = metadata || {};
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Business Logic: Calculate expiry date (3 years from issue)
   */
  calculateExpiryDate() {
    const expiry = new Date(this.issueDate);
    expiry.setFullYear(expiry.getFullYear() + 3);
    return expiry;
  }

  /**
   * Business Logic: Check if certificate is valid
   */
  isValid() {
    return this.status === 'ACTIVE' && new Date() < this.expiryDate;
  }

  /**
   * Business Logic: Check if certificate is expired
   */
  isExpired() {
    return new Date() >= this.expiryDate;
  }

  /**
   * Business Logic: Check if certificate is near expiry (< 90 days)
   */
  isNearExpiry() {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((this.expiryDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 90 && daysUntilExpiry > 0;
  }

  /**
   * Business Logic: Revoke certificate
   */
  revoke(reason, revokedBy) {
    if (this.status === 'REVOKED') {
      throw new Error('Certificate is already revoked');
    }

    this.status = 'REVOKED';
    this.metadata.revokedAt = new Date();
    this.metadata.revokedBy = revokedBy;
    this.metadata.revocationReason = reason;
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Renew certificate
   */
  renew(newExpiryDate, renewedBy) {
    if (this.status === 'REVOKED') {
      throw new Error('Cannot renew revoked certificate');
    }

    this.expiryDate = newExpiryDate;
    this.status = 'ACTIVE';
    this.metadata.renewedAt = new Date();
    this.metadata.renewedBy = renewedBy;
    this.updatedAt = new Date();
  }

  /**
   * Business Logic: Increment verification count
   */
  incrementVerificationCount() {
    this.verificationCount++;
    this.metadata.lastVerifiedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Validation: Check if certificate data is valid
   */
  validate() {
    const errors = [];

    if (!this.certificateNumber) {
      errors.push('Certificate number is required');
    }

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!this.farmId) {
      errors.push('Farm ID is required');
    }

    if (!['GACP', 'GAP', 'ORGANIC'].includes(this.certificateType)) {
      errors.push('Invalid certificate type');
    }

    if (!['ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED'].includes(this.status)) {
      errors.push('Invalid certificate status');
    }

    if (this.issueDate > this.expiryDate) {
      errors.push('Issue date cannot be after expiry date');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object (for JSON serialization)
   */
  toJSON() {
    return {
      id: this.id,
      certificateNumber: this.certificateNumber,
      applicationId: this.applicationId,
      userId: this.userId,
      farmId: this.farmId,
      certificateType: this.certificateType,
      standardType: this.standardType,
      issueDate: this.issueDate,
      expiryDate: this.expiryDate,
      status: this.status,
      qrCode: this.qrCode,
      pdfUrl: this.pdfUrl,
      issuedBy: this.issuedBy,
      verificationCount: this.verificationCount,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Computed properties
      isValid: this.isValid(),
      isExpired: this.isExpired(),
      isNearExpiry: this.isNearExpiry(),
    };
  }
}

module.exports = Certificate;
