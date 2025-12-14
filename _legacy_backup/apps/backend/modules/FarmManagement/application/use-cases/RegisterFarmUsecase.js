/**
 * RegisterFarmUseCase (Application Layer)
 *
 * Business logic for farmer to register a new farm
 */

class RegisterFarmUseCase {
  constructor({ farmRepository, eventBus }) {
    this.farmRepository = farmRepository;
    this.eventBus = eventBus;
  }

  async execute({
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
    const Farm = require('../../domain/entities/Farm');
    const FarmRegistered = require('../../domain/events/FarmRegistered');

    // Check if farm name already exists for this owner
    const nameExists = await this.farmRepository.farmNameExists(ownerId, farmName);
    if (nameExists) {
      throw new Error(`Farm name "${farmName}" already exists for this owner`);
    }

    // Create farm entity
    const farm = Farm.create({
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
    });

    // Validate farm data
    const validation = farm.validate();
    if (!validation.isValid) {
      throw new Error(`Farm validation failed: ${validation.errors.join(', ')}`);
    }

    // Save farm
    const savedFarm = await this.farmRepository.save(farm);

    // Publish event
    if (this.eventBus) {
      const event = new FarmRegistered({
        farmId: savedFarm.id,
        ownerId: savedFarm.ownerId,
        farmName: savedFarm.farmName,
        province: savedFarm.province,
        district: savedFarm.district,
        totalArea: savedFarm.totalArea,
        createdAt: savedFarm.createdAt,
      });
      this.eventBus.publish(event);
    }

    return savedFarm;
  }
}

module.exports = RegisterFarmUseCase;
