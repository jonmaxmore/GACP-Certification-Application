/**
 * Certificate Data Transfer Objects (DTOs)
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Transform data between HTTP requests/responses and application layer
 * - Request DTOs: Validate and structure incoming HTTP data
 * - Response DTOs: Format domain data for API responses
 */

class GenerateCertificateRequestDTO {
  constructor(body) {
    this.applicationId = body.applicationId;
    this.userId = body.userId;
    this.farmId = body.farmId;
    this.certificateType = body.certificateType || 'GACP';
    this.validityPeriod = body.validityPeriod || 12; // months
    this.metadata = body.metadata || {};
  }

  validate() {
    const errors = [];

    if (!this.applicationId) {
      errors.push('applicationId is required');
    }

    if (!this.userId) {
      errors.push('userId is required');
    }

    if (!this.farmId) {
      errors.push('farmId is required');
    }

    if (!['GACP', 'GAP', 'ORGANIC'].includes(this.certificateType)) {
      errors.push('certificateType must be GACP, GAP, or ORGANIC');
    }

    if (this.validityPeriod < 1 || this.validityPeriod > 60) {
      errors.push('validityPeriod must be between 1 and 60 months');
    }

    return errors;
  }

  toApplicationRequest() {
    return {
      applicationId: this.applicationId,
      userId: this.userId,
      farmId: this.farmId,
      certificateType: this.certificateType,
      validityPeriod: this.validityPeriod,
      metadata: this.metadata,
    };
  }
}

class CertificateResponseDTO {
  static fromDomain(certificate) {
    return {
      id: certificate.id,
      certificateNumber: certificate.certificateNumber,
      applicationId: certificate.applicationId,
      userId: certificate.userId,
      farmId: certificate.farmId,
      certificateType: certificate.certificateType,
      status: certificate.status,
      issuedDate: certificate.issuedDate,
      expiryDate: certificate.expiryDate,
      issuedBy: certificate.issuedBy,
      qrCodeUrl: certificate.qrCodeUrl,
      pdfUrl: certificate.pdfUrl,
      verificationCount: certificate.verificationCount,
      metadata: certificate.metadata,
      createdAt: certificate.createdAt,
      updatedAt: certificate.updatedAt,
      // Computed fields
      isValid: certificate.isValid(),
      isExpired: certificate.isExpired(),
      isNearExpiry: certificate.isNearExpiry(),
      daysUntilExpiry: certificate.getDaysUntilExpiry ? certificate.getDaysUntilExpiry() : null,
    };
  }

  static fromDomainList(certificates) {
    return certificates.map(cert => this.fromDomain(cert));
  }
}

class VerifyCertificateResponseDTO {
  static fromVerificationResult(result) {
    return {
      valid: result.valid,
      status: result.status,
      message: result.message,
      certificate: result.certificate
        ? CertificateResponseDTO.fromDomain(result.certificate)
        : null,
      verifiedAt: new Date(),
      verificationCount: result.certificate?.verificationCount || 0,
    };
  }
}

class RevokeCertificateRequestDTO {
  constructor(body) {
    this.reason = body.reason;
    this.revokedBy = body.revokedBy;
  }

  validate() {
    const errors = [];

    if (!this.reason) {
      errors.push('reason is required');
    }

    if (!this.revokedBy) {
      errors.push('revokedBy is required');
    }

    if (this.reason.length < 10) {
      errors.push('reason must be at least 10 characters');
    }

    return errors;
  }

  toApplicationRequest() {
    return {
      reason: this.reason,
      revokedBy: this.revokedBy,
    };
  }
}

class RenewCertificateRequestDTO {
  constructor(body) {
    this.newValidityPeriod = body.newValidityPeriod || 12;
    this.renewedBy = body.renewedBy;
  }

  validate() {
    const errors = [];

    if (!this.renewedBy) {
      errors.push('renewedBy is required');
    }

    if (this.newValidityPeriod < 1 || this.newValidityPeriod > 60) {
      errors.push('newValidityPeriod must be between 1 and 60 months');
    }

    return errors;
  }

  toApplicationRequest() {
    return {
      validityPeriod: this.newValidityPeriod,
      renewedBy: this.renewedBy,
    };
  }
}

class CertificateListQueryDTO {
  constructor(query) {
    this.userId = query.userId;
    this.farmId = query.farmId;
    this.status = query.status;
    this.certificateType = query.certificateType;
    this.page = parseInt(query.page) || 1;
    this.limit = parseInt(query.limit) || 20;
    this.sortBy = query.sortBy || 'createdAt';
    this.sortOrder = query.sortOrder || 'desc';
  }

  validate() {
    const errors = [];

    if (this.page < 1) {
      errors.push('page must be greater than 0');
    }

    if (this.limit < 1 || this.limit > 100) {
      errors.push('limit must be between 1 and 100');
    }

    if (this.status && !['ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING'].includes(this.status)) {
      errors.push('Invalid status value');
    }

    if (!['asc', 'desc'].includes(this.sortOrder)) {
      errors.push('sortOrder must be asc or desc');
    }

    return errors;
  }

  toApplicationQuery() {
    const query = {};

    if (this.userId) {
      query.userId = this.userId;
    }
    if (this.farmId) {
      query.farmId = this.farmId;
    }
    if (this.status) {
      query.status = this.status;
    }
    if (this.certificateType) {
      query.certificateType = this.certificateType;
    }

    return {
      filters: query,
      pagination: {
        page: this.page,
        limit: this.limit,
      },
      sort: {
        field: this.sortBy,
        order: this.sortOrder,
      },
    };
  }
}

module.exports = {
  GenerateCertificateRequestDTO,
  CertificateResponseDTO,
  VerifyCertificateResponseDTO,
  RevokeCertificateRequestDTO,
  RenewCertificateRequestDTO,
  CertificateListQueryDTO,
};
