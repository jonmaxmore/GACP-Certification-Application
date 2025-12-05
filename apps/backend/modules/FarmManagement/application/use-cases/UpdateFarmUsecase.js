/**
 * UpdateFarmUseCase (Application Layer)
 *
 * Business logic for farmer to update farm details
 * - Only DRAFT or REJECTED farms can be updated
 */

class UpdateFarmUseCase {
  constructor({ farmRepository }) {
    this.farmRepository = farmRepository;
  }

  async execute({
    farmId,
    ownerId,
    farmName,
    farmType,
    address,
    subDistrict,
    district,
    province,
    postalCode,
    latitude,
    longitude,
    totalArea,
    cultivationArea,
    areaUnit,
    cultivationMethod,
    irrigationType,
    soilType,
    waterSource,
  }) {
    // Find farm
    const farm = await this.farmRepository.findById(farmId);
    if (!farm) {
      throw new Error('Farm not found');
    }

    // Check ownership
    if (!farm.belongsTo(ownerId)) {
      throw new Error('You do not have permission to update this farm');
    }

    // Check if farm can be edited
    if (!farm.canEdit()) {
      throw new Error(`Farm cannot be edited in ${farm.status} status`);
    }

    // Check farm name uniqueness if changed
    if (farmName && farmName !== farm.farmName) {
      const nameExists = await this.farmRepository.farmNameExists(ownerId, farmName, farmId);
      if (nameExists) {
        throw new Error(`Farm name "${farmName}" already exists for this owner`);
      }
    }

    // Update farm
    farm.update({
      farmName,
      farmType,
      address,
      subDistrict,
      district,
      province,
      postalCode,
      latitude,
      longitude,
      totalArea,
      cultivationArea,
      areaUnit,
      cultivationMethod,
      irrigationType,
      soilType,
      waterSource,
    });

    // Validate updated farm
    const validation = farm.validate();
    if (!validation.isValid) {
      throw new Error(`Farm validation failed: ${validation.errors.join(', ')}`);
    }

    // Save updated farm
    const updatedFarm = await this.farmRepository.save(farm);

    return updatedFarm;
  }
}

module.exports = UpdateFarmUseCase;
