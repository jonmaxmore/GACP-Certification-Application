/**
 * StartFarmReviewUseCase (Application Layer)
 *
 * DTAM staff starts reviewing a farm
 * - Changes status from PENDING_REVIEW to UNDER_REVIEW
 * - Records reviewer
 */

class StartFarmReviewUseCase {
  constructor({ farmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute({ farmId, staffId }) {
    // Find farm
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      throw new Error('Farm not found');
    }

    // Start review
    try {
      farm.startReview(staffId);
    } catch (error) {
      throw new Error(error.message);
    }

    // Save updated farm
    const updatedFarm = await this.farmRepository.save(farm);

    return updatedFarm;
  }
}

module.exports = StartFarmReviewUseCase;
