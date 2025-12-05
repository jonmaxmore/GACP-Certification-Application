/**
 * RejectFarmUseCase (Application Layer)
 *
 * DTAM staff rejects a farm
 * - Changes status from UNDER_REVIEW to REJECTED
 * - Records rejection reason
 * - Publishes verification event
 */

class RejectFarmUseCase {
  constructor({ farmRepository, eventBus }) {
    this.farmRepository = farmRepository;
    this.eventBus = eventBus;
  }

  async execute({ farmId, staffId, reason }) {
    const FarmVerificationCompleted = require('../../domain/events/FarmVerificationCompleted');

    // Find farm
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      throw new Error('Farm not found');
    }

    // Reject farm
    try {
      farm.reject(staffId, reason);
    } catch (error) {
      throw new Error(error.message);
    }

    // Save updated farm
    const updatedFarm = await this.farmRepository.save(farm);

    // Publish event
    if (this.eventBus) {
      const event = new FarmVerificationCompleted({
        farmId: updatedFarm.id,
        ownerId: updatedFarm.ownerId,
        farmName: updatedFarm.farmName,
        status: updatedFarm.status,
        verifiedBy: updatedFarm.verifiedBy,
        verifiedAt: updatedFarm.verifiedAt,
        notes: null,
        rejectionReason: updatedFarm.rejectionReason,
      });
      this.eventBus.publish(event);
    }

    return updatedFarm;
  }
}

module.exports = RejectFarmUseCase;
