/**
 * CertificateIssued Domain Event
 * Triggered when a new certificate is issued
 */

class CertificateIssued {
  constructor({
    certificateId,
    certificateNumber,
    userId,
    farmId,
    certificateType,
    issueDate,
    expiryDate,
    issuedBy,
    occurredAt = new Date(),
  }) {
    this.eventType = 'CertificateIssued';
    this.certificateId = certificateId;
    this.certificateNumber = certificateNumber;
    this.userId = userId;
    this.farmId = farmId;
    this.certificateType = certificateType;
    this.issueDate = issueDate;
    this.expiryDate = expiryDate;
    this.issuedBy = issuedBy;
    this.occurredAt = occurredAt;
  }

  /**
   * Get event payload for event bus
   */
  toEventPayload() {
    return {
      eventType: this.eventType,
      data: {
        certificateId: this.certificateId,
        certificateNumber: this.certificateNumber,
        userId: this.userId,
        farmId: this.farmId,
        certificateType: this.certificateType,
        issueDate: this.issueDate,
        expiryDate: this.expiryDate,
        issuedBy: this.issuedBy,
      },
      occurredAt: this.occurredAt,
    };
  }
}

module.exports = CertificateIssued;
