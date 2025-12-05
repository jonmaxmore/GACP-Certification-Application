/**
 * GetFarmDetailsUseCase (Application Layer)
 *
 * Get detailed information about a farm
 * - Farmers can only view their own farms
 * - DTAM staff can view any farm
 */

class GetFarmDetailsUseCase {
  constructor({ farmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute({ farmId, userId, userType }) {
    // Find farm
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      throw new Error('Farm not found');
    }

    // Check permissions
    if (userType === 'farmer' && !farm.belongsTo(userId)) {
      throw new Error('You do not have permission to view this farm');
    }

    return farm;
  }
}

module.exports = GetFarmDetailsUseCase;
