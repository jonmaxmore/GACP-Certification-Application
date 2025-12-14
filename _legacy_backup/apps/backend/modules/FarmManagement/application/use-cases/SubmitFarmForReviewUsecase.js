/**
 * SubmitFarmForReviewUseCase (Application Layer)
 *
 * Business logic for farmer to submit farm for DTAM review
 * - Only DRAFT or REJECTED farms can be submitted
 */

class SubmitFarmForReviewUseCase {
  constructor({ farmRepository, eventBus }) {
    this.farmRepository = farmRepository;
    this.eventBus = eventBus;
  }

  async execute({ farmId, ownerId }) {
    const FarmSubmittedForReview = require('../../domain/events/FarmSubmittedForReview');

    // Find farm
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      throw new Error('Farm not found');
    }

    // Check ownership
    if (!farm.belongsTo(ownerId)) {
      throw new Error('You do not have permission to submit this farm');
    }

    // Check if farm can be submitted
    if (!farm.canSubmit()) {
      throw new Error(`Farm cannot be submitted in ${farm.status} status`);
    }

    // Validate farm before submission
    const validation = farm.validate();
    if (!validation.isValid) {
      throw new Error(`Farm validation failed: ${validation.errors.join(', ')}`);
    }

    // Submit for review
    farm.submitForReview();

    // Save updated farm
    const updatedFarm = await this.farmRepository.save(farm);

    // Publish event
    if (this.eventBus) {
      const event = new FarmSubmittedForReview({
        farmId: updatedFarm.id,
        ownerId: updatedFarm.ownerId,
        farmName: updatedFarm.farmName,
        submittedAt: updatedFarm.submittedAt,
      });
      this.eventBus.publish(event);
    }

    return updatedFarm;
  }
}

module.exports = SubmitFarmForReviewUseCase;
