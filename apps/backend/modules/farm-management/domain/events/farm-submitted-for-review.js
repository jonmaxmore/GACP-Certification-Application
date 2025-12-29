/**
 * FarmSubmittedForReview Event (Domain Event)
 *
 * Published when a farm is submitted for DTAM review
 */

class FarmSubmittedForReview {
  constructor({ farmId, ownerId, farmName, submittedAt, timestamp = new Date() }) {
    this.eventType = 'FarmSubmittedForReview';
    this.farmId = farmId;
    this.ownerId = ownerId;
    this.farmName = farmName;
    this.submittedAt = submittedAt;
    this.timestamp = timestamp;
  }
}

module.exports = FarmSubmittedForReview;
