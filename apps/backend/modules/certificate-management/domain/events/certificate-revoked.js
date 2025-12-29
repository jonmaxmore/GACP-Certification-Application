/**
 * CertificateRevoked Domain Event
 * Triggered when a certificate is revoked
 */

class CertificateRevoked {
  constructor({
    certificateId,
    certificateNumber,
    userId,
    reason,
    revokedBy,
    occurredAt = new Date(),
  }) {
    this.eventType = 'CertificateRevoked';
    this.certificateId = certificateId;
    this.certificateNumber = certificateNumber;
    this.userId = userId;
    this.reason = reason;
    this.revokedBy = revokedBy;
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
        reason: this.reason,
        revokedBy: this.revokedBy,
      },
      occurredAt: this.occurredAt,
    };
  }
}

module.exports = CertificateRevoked;
