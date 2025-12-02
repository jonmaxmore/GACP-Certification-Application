/**
 * ApproveFarmUseCase (Application Layer)
 *
 * DTAM staff approves a farm
 * - Changes status from UNDER_REVIEW to APPROVED
 * - Records verification details
 * - Publishes verification event
 */

class ApproveFarmUseCase {
  constructor({ farmRepository, eventBus }) {
    this.farmRepository = farmRepository;
    this.eventBus = eventBus;
  }

  async execute({ farmId, staffId, notes = '' }) {
    const FarmVerificationCompleted = require('../../domain/events/FarmVerificationCompleted');

    // Find farm
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      throw new Error('Farm not found');
    }

    // Approve farm
    try {
      farm.approve(staffId, notes);
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
        notes: updatedFarm.verificationNotes,
        rejectionReason: null,
      });
      this.eventBus.publish(event);
    }

    return updatedFarm;
  }
}

module.exports = ApproveFarmUseCase;
