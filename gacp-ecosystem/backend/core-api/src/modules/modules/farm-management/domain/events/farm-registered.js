/**
 * FarmRegistered Event (Domain Event)
 *
 * Published when a new farm is registered
 */

class FarmRegistered {
  constructor({
    farmId,
    ownerId,
    farmName,
    province,
    district,
    totalArea,
    createdAt,
    timestamp = new Date(),
  }) {
    this.eventType = 'FarmRegistered';
    this.farmId = farmId;
    this.ownerId = ownerId;
    this.farmName = farmName;
    this.province = province;
    this.district = district;
    this.totalArea = totalArea;
    this.createdAt = createdAt;
    this.timestamp = timestamp;
  }
}

module.exports = FarmRegistered;
