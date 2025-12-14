/**
 * Farm DTOs (Presentation Layer)
 *
 * Data Transfer Objects for transforming farm data between layers
 */

class FarmDTO {
  /**
   * Convert Farm entity to public DTO (for farmers)
   */
  static toPublicDTO(farm) {
    return {
      id: farm.id,
      farmName: farm.farmName,
      farmType: farm.farmType,
      address: farm.address,
      subDistrict: farm.subDistrict,
      district: farm.district,
      province: farm.province,
      postalCode: farm.postalCode,
      latitude: farm.latitude,
      longitude: farm.longitude,
      totalArea: farm.totalArea,
      cultivationArea: farm.cultivationArea,
      areaUnit: farm.areaUnit,
      cultivationMethod: farm.cultivationMethod,
      irrigationType: farm.irrigationType,
      soilType: farm.soilType,
      waterSource: farm.waterSource,
      status: farm.status,
      submittedAt: farm.submittedAt,
      createdAt: farm.createdAt,
      updatedAt: farm.updatedAt,
      // Computed fields
      fullAddress: farm.getFullAddress(),
      cultivationPercentage: farm.getCultivationPercentage(),
      canEdit: farm.canEdit(),
      canSubmit: farm.canSubmit(),
      isApproved: farm.isApproved(),
      // Include rejection reason if rejected
      ...(farm.status === 'REJECTED' && {
        rejectionReason: farm.rejectionReason,
      }),
    };
  }

  /**
   * Convert Farm entity to detailed DTO (for DTAM staff)
   */
  static toDetailedDTO(farm) {
    return {
      ...this.toPublicDTO(farm),
      ownerId: farm.ownerId,
      verificationNotes: farm.verificationNotes,
      verifiedBy: farm.verifiedBy,
      verifiedAt: farm.verifiedAt,
      rejectionReason: farm.rejectionReason,
      isUnderVerification: farm.isUnderVerification(),
    };
  }

  /**
   * Convert Farm entity to list item DTO
   */
  static toListItemDTO(farm, userType = 'farmer') {
    const baseData = {
      id: farm.id,
      farmName: farm.farmName,
      farmType: farm.farmType,
      province: farm.province,
      district: farm.district,
      totalArea: farm.totalArea,
      areaUnit: farm.areaUnit,
      status: farm.status,
      submittedAt: farm.submittedAt,
      createdAt: farm.createdAt,
      updatedAt: farm.updatedAt,
    };

    if (userType === 'dtam_staff') {
      return {
        ...baseData,
        ownerId: farm.ownerId,
        verifiedBy: farm.verifiedBy,
        verifiedAt: farm.verifiedAt,
      };
    }

    return baseData;
  }

  /**
   * Create farm registration request from body
   */
  static fromRegistrationRequest(body, ownerId) {
    return {
      ownerId,
      farmName: body.farmName,
      farmType: body.farmType,
      address: body.address,
      subDistrict: body.subDistrict,
      district: body.district,
      province: body.province,
      postalCode: body.postalCode,
      latitude: body.latitude,
      longitude: body.longitude,
      totalArea: body.totalArea,
      cultivationArea: body.cultivationArea,
      areaUnit: body.areaUnit || 'rai',
      cultivationMethod: body.cultivationMethod,
      irrigationType: body.irrigationType,
      soilType: body.soilType,
      waterSource: body.waterSource,
    };
  }

  /**
   * Create farm update request from body
   */
  static fromUpdateRequest(body) {
    const updates = {};

    if (body.farmName !== undefined) {
      updates.farmName = body.farmName;
    }
    if (body.farmType !== undefined) {
      updates.farmType = body.farmType;
    }
    if (body.address !== undefined) {
      updates.address = body.address;
    }
    if (body.subDistrict !== undefined) {
      updates.subDistrict = body.subDistrict;
    }
    if (body.district !== undefined) {
      updates.district = body.district;
    }
    if (body.province !== undefined) {
      updates.province = body.province;
    }
    if (body.postalCode !== undefined) {
      updates.postalCode = body.postalCode;
    }
    if (body.latitude !== undefined) {
      updates.latitude = body.latitude;
    }
    if (body.longitude !== undefined) {
      updates.longitude = body.longitude;
    }
    if (body.totalArea !== undefined) {
      updates.totalArea = body.totalArea;
    }
    if (body.cultivationArea !== undefined) {
      updates.cultivationArea = body.cultivationArea;
    }
    if (body.areaUnit !== undefined) {
      updates.areaUnit = body.areaUnit;
    }
    if (body.cultivationMethod !== undefined) {
      updates.cultivationMethod = body.cultivationMethod;
    }
    if (body.irrigationType !== undefined) {
      updates.irrigationType = body.irrigationType;
    }
    if (body.soilType !== undefined) {
      updates.soilType = body.soilType;
    }
    if (body.waterSource !== undefined) {
      updates.waterSource = body.waterSource;
    }

    return updates;
  }

  /**
   * API Response wrapper
   */
  static successResponse(message, data = null) {
    return {
      success: true,
      message,
      ...(data && { data }),
    };
  }

  static errorResponse(message, errors = null) {
    return {
      success: false,
      message,
      ...(errors && { errors }),
    };
  }
}

module.exports = FarmDTO;
