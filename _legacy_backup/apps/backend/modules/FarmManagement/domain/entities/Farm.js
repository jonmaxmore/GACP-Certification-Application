/**
 * Farm Entity (Domain Layer)
 *
 * Core business entity representing a GACP farm
 * - Farm registration and management
 * - Location and area tracking
 * - Verification workflow
 * - Cultivation details
 */

class Farm {
  // Verification Status
  static STATUS = {
    DRAFT: 'DRAFT', // Initial creation
    PENDING_REVIEW: 'PENDING_REVIEW', // Submitted for DTAM review
    UNDER_REVIEW: 'UNDER_REVIEW', // DTAM is reviewing
    APPROVED: 'APPROVED', // DTAM approved
    REJECTED: 'REJECTED', // DTAM rejected
    SUSPENDED: 'SUSPENDED', // Temporarily suspended
    INACTIVE: 'INACTIVE', // Deactivated
  };

  // Farm Types
  static FARM_TYPE = {
    OUTDOOR: 'OUTDOOR', // Outdoor cultivation
    GREENHOUSE: 'GREENHOUSE', // Greenhouse cultivation
    INDOOR: 'INDOOR', // Indoor cultivation
    MIXED: 'MIXED', // Mixed cultivation
  };

  // Irrigation Types
  static IRRIGATION_TYPE = {
    DRIP: 'DRIP', // Drip irrigation
    SPRINKLER: 'SPRINKLER', // Sprinkler irrigation
    FLOOD: 'FLOOD', // Flood irrigation
    MANUAL: 'MANUAL', // Manual watering
    MIXED: 'MIXED', // Mixed methods
  };

  constructor({
    id,
    ownerId,
    farmName,
    farmType,
    // Location
    address,
    subDistrict,
    district,
    province,
    postalCode,
    latitude,
    longitude,
    // Area
    totalArea,
    cultivationArea,
    areaUnit = 'rai',
    // Cultivation Details
    cultivationMethod,
    irrigationType,
    soilType,
    waterSource,
    // Verification
    status = Farm.STATUS.DRAFT,
    verificationNotes,
    verifiedBy,
    verifiedAt,
    rejectionReason,
    // Metadata
    submittedAt,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.ownerId = ownerId;
    this.farmName = farmName;
    this.farmType = farmType;

    // Location
    this.address = address;
    this.subDistrict = subDistrict;
    this.district = district;
    this.province = province;
    this.postalCode = postalCode;
    this.latitude = latitude;
    this.longitude = longitude;

    // Area
    this.totalArea = totalArea;
    this.cultivationArea = cultivationArea;
    this.areaUnit = areaUnit;

    // Cultivation Details
    this.cultivationMethod = cultivationMethod;
    this.irrigationType = irrigationType;
    this.soilType = soilType;
    this.waterSource = waterSource;

    // Verification
    this.status = status;
    this.verificationNotes = verificationNotes;
    this.verifiedBy = verifiedBy;
    this.verifiedAt = verifiedAt;
    this.rejectionReason = rejectionReason;

    // Metadata
    this.submittedAt = submittedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Create new Farm
   */
  static create({
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
    areaUnit = 'rai',
    cultivationMethod,
    irrigationType,
    soilType,
    waterSource,
  }) {
    return new Farm({
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
      status: Farm.STATUS.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Update farm details
   */
  update({
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
    if (farmName !== undefined) {
      this.farmName = farmName;
    }
    if (farmType !== undefined) {
      this.farmType = farmType;
    }
    if (address !== undefined) {
      this.address = address;
    }
    if (subDistrict !== undefined) {
      this.subDistrict = subDistrict;
    }
    if (district !== undefined) {
      this.district = district;
    }
    if (province !== undefined) {
      this.province = province;
    }
    if (postalCode !== undefined) {
      this.postalCode = postalCode;
    }
    if (latitude !== undefined) {
      this.latitude = latitude;
    }
    if (longitude !== undefined) {
      this.longitude = longitude;
    }
    if (totalArea !== undefined) {
      this.totalArea = totalArea;
    }
    if (cultivationArea !== undefined) {
      this.cultivationArea = cultivationArea;
    }
    if (areaUnit !== undefined) {
      this.areaUnit = areaUnit;
    }
    if (cultivationMethod !== undefined) {
      this.cultivationMethod = cultivationMethod;
    }
    if (irrigationType !== undefined) {
      this.irrigationType = irrigationType;
    }
    if (soilType !== undefined) {
      this.soilType = soilType;
    }
    if (waterSource !== undefined) {
      this.waterSource = waterSource;
    }

    this.updatedAt = new Date();
  }

  /**
   * Submit for DTAM review
   */
  submitForReview() {
    if (this.status !== Farm.STATUS.DRAFT && this.status !== Farm.STATUS.REJECTED) {
      throw new Error('Only DRAFT or REJECTED farms can be submitted for review');
    }

    this.status = Farm.STATUS.PENDING_REVIEW;
    this.submittedAt = new Date();
    this.updatedAt = new Date();
    this.rejectionReason = null; // Clear previous rejection reason
  }

  /**
   * DTAM starts review
   */
  startReview(staffId) {
    if (this.status !== Farm.STATUS.PENDING_REVIEW) {
      throw new Error('Only PENDING_REVIEW farms can be reviewed');
    }

    this.status = Farm.STATUS.UNDER_REVIEW;
    this.verifiedBy = staffId;
    this.updatedAt = new Date();
  }

  /**
   * DTAM approves farm
   */
  approve(staffId, notes) {
    if (this.status !== Farm.STATUS.UNDER_REVIEW) {
      throw new Error('Only UNDER_REVIEW farms can be approved');
    }

    this.status = Farm.STATUS.APPROVED;
    this.verifiedBy = staffId;
    this.verifiedAt = new Date();
    this.verificationNotes = notes;
    this.updatedAt = new Date();
  }

  /**
   * DTAM rejects farm
   */
  reject(staffId, reason) {
    if (this.status !== Farm.STATUS.UNDER_REVIEW) {
      throw new Error('Only UNDER_REVIEW farms can be rejected');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    this.status = Farm.STATUS.REJECTED;
    this.verifiedBy = staffId;
    this.verifiedAt = new Date();
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  /**
   * Suspend farm
   */
  suspend(staffId, reason) {
    if (this.status !== Farm.STATUS.APPROVED) {
      throw new Error('Only APPROVED farms can be suspended');
    }

    this.status = Farm.STATUS.SUSPENDED;
    this.verificationNotes = reason;
    this.verifiedBy = staffId;
    this.updatedAt = new Date();
  }

  /**
   * Reactivate suspended farm
   */
  reactivate(staffId) {
    if (this.status !== Farm.STATUS.SUSPENDED) {
      throw new Error('Only SUSPENDED farms can be reactivated');
    }

    this.status = Farm.STATUS.APPROVED;
    this.verifiedBy = staffId;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate farm
   */
  deactivate() {
    this.status = Farm.STATUS.INACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Check if farm can be edited
   */
  canEdit() {
    return [Farm.STATUS.DRAFT, Farm.STATUS.REJECTED].includes(this.status);
  }

  /**
   * Check if farm can be submitted
   */
  canSubmit() {
    return [Farm.STATUS.DRAFT, Farm.STATUS.REJECTED].includes(this.status);
  }

  /**
   * Check if farm is approved
   */
  isApproved() {
    return this.status === Farm.STATUS.APPROVED;
  }

  /**
   * Check if farm is under verification
   */
  isUnderVerification() {
    return [Farm.STATUS.PENDING_REVIEW, Farm.STATUS.UNDER_REVIEW].includes(this.status);
  }

  /**
   * Check if farm belongs to owner
   */
  belongsTo(ownerId) {
    return this.ownerId === ownerId;
  }

  /**
   * Get full address
   */
  getFullAddress() {
    return `${this.address}, ${this.subDistrict}, ${this.district}, ${this.province} ${this.postalCode}`;
  }

  /**
   * Get area in specified unit
   */
  getAreaInUnit(unit) {
    const conversionRates = {
      rai: 1,
      ngan: 4,
      wa: 400,
      sqm: 1600,
      hectare: 0.16,
    };

    if (!conversionRates[unit]) {
      throw new Error(`Invalid area unit: ${unit}`);
    }

    const areaInRai = this.totalArea / (conversionRates[this.areaUnit] / conversionRates.rai);
    return areaInRai * conversionRates[unit];
  }

  /**
   * Calculate cultivation percentage
   */
  getCultivationPercentage() {
    if (!this.totalArea || this.totalArea === 0) {
      return 0;
    }
    return (this.cultivationArea / this.totalArea) * 100;
  }

  /**
   * Validate farm data
   */
  validate() {
    const errors = [];

    // Required fields
    if (!this.ownerId) {
      errors.push('Owner ID is required');
    }
    if (!this.farmName || this.farmName.trim().length === 0) {
      errors.push('Farm name is required');
    }
    if (!this.farmType || !Object.values(Farm.FARM_TYPE).includes(this.farmType)) {
      errors.push('Valid farm type is required');
    }

    // Location
    if (!this.address || this.address.trim().length === 0) {
      errors.push('Address is required');
    }
    if (!this.subDistrict) {
      errors.push('Sub-district is required');
    }
    if (!this.district) {
      errors.push('District is required');
    }
    if (!this.province) {
      errors.push('Province is required');
    }
    if (!this.postalCode || !/^\d{5}$/.test(this.postalCode)) {
      errors.push('Valid 5-digit postal code is required');
    }

    // Coordinates (optional but must be valid if provided)
    if (this.latitude !== undefined && this.latitude !== null) {
      if (typeof this.latitude !== 'number' || this.latitude < -90 || this.latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }
    if (this.longitude !== undefined && this.longitude !== null) {
      if (typeof this.longitude !== 'number' || this.longitude < -180 || this.longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }

    // Area
    if (!this.totalArea || this.totalArea <= 0) {
      errors.push('Total area must be greater than 0');
    }
    if (!this.cultivationArea || this.cultivationArea <= 0) {
      errors.push('Cultivation area must be greater than 0');
    }
    if (this.cultivationArea > this.totalArea) {
      errors.push('Cultivation area cannot exceed total area');
    }

    // Cultivation details
    if (!this.cultivationMethod || this.cultivationMethod.trim().length === 0) {
      errors.push('Cultivation method is required');
    }
    if (this.irrigationType && !Object.values(Farm.IRRIGATION_TYPE).includes(this.irrigationType)) {
      errors.push('Valid irrigation type is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      farmName: this.farmName,
      farmType: this.farmType,
      address: this.address,
      subDistrict: this.subDistrict,
      district: this.district,
      province: this.province,
      postalCode: this.postalCode,
      latitude: this.latitude,
      longitude: this.longitude,
      totalArea: this.totalArea,
      cultivationArea: this.cultivationArea,
      areaUnit: this.areaUnit,
      cultivationMethod: this.cultivationMethod,
      irrigationType: this.irrigationType,
      soilType: this.soilType,
      waterSource: this.waterSource,
      status: this.status,
      verificationNotes: this.verificationNotes,
      verifiedBy: this.verifiedBy,
      verifiedAt: this.verifiedAt,
      rejectionReason: this.rejectionReason,
      submittedAt: this.submittedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fullAddress: this.getFullAddress(),
      cultivationPercentage: this.getCultivationPercentage(),
      canEdit: this.canEdit(),
      canSubmit: this.canSubmit(),
      isApproved: this.isApproved(),
    };
  }
}

module.exports = Farm;
