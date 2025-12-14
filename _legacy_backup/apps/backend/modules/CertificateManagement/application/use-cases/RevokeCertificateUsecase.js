/**
 * Revoke Certificate Use Case (Application Layer)
 * Business Logic: Revoke an existing certificate
 */

const CertificateRevoked = require('../../domain/events/CertificateRevoked');

class RevokeCertificateUseCase {
  constructor({ certificateRepository, eventBus }) {
    this.certificateRepository = certificateRepository;
    this.eventBus = eventBus;
  }

  async execute(request) {
    const { certificateId, reason, revokedBy } = request;

    if (!certificateId || !reason || !revokedBy) {
      throw new Error('Certificate ID, reason, and revokedBy are required');
    }

    // Find certificate
    const certificate = await this.certificateRepository.findById(certificateId);

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    // Revoke certificate (domain logic)
    certificate.revoke(reason, revokedBy);

    // Save changes
    const updatedCertificate = await this.certificateRepository.save(certificate);

    // Publish domain event
    const event = new CertificateRevoked({
      certificateId: updatedCertificate.id,
      certificateNumber: updatedCertificate.certificateNumber,
      userId: updatedCertificate.userId,
      reason,
      revokedBy,
    });

    await this.eventBus.publish(event.toEventPayload());

    return updatedCertificate.toJSON();
  }
}

module.exports = RevokeCertificateUseCase;
