/**
 * FarmVerificationCompleted Event (Domain Event)
 *
 * Published when DTAM completes farm verification (approved or rejected)
 */

class FarmVerificationCompleted {
  constructor({
    farmId,
    ownerId,
    farmName,
    status,
    verifiedBy,
    verifiedAt,
    notes,
    rejectionReason,
    timestamp = new Date(),
  }) {
    this.eventType = 'FarmVerificationCompleted';
    this.farmId = farmId;
    this.ownerId = ownerId;
    this.farmName = farmName;
    this.status = status;
    this.verifiedBy = verifiedBy;
    this.verifiedAt = verifiedAt;
    this.notes = notes;
    this.rejectionReason = rejectionReason;
    this.timestamp = timestamp;
  }
}

module.exports = FarmVerificationCompleted;
