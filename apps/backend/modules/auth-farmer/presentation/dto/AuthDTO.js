/**
 * Auth DTOs (Data Transfer Objects)
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Transform data between layers
 * - Request DTOs
 * - Response DTOs
 * - Data mapping
 */

/**
 * Register Request DTO
 */
class RegisterRequestDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.idCard = data.idCard;
    this.farmName = data.farmName;
    this.province = data.province;
    this.district = data.district;
    this.subDistrict = data.subDistrict;
  }

  static fromRequest(req) {
    return new RegisterRequestDTO(req.body);
  }

  toUseCaseInput() {
    return {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      idCard: this.idCard,
      farmName: this.farmName,
      province: this.province,
      district: this.district,
      subDistrict: this.subDistrict,
    };
  }
}

/**
 * Login Request DTO
 */
class LoginRequestDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }

  static fromRequest(req) {
    return new LoginRequestDTO(req.body);
  }

  toUseCaseInput(ipAddress, userAgent) {
    return {
      email: this.email,
      password: this.password,
      ipAddress,
      userAgent,
    };
  }
}

/**
 * Update Profile Request DTO
 */
class UpdateProfileRequestDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phoneNumber = data.phoneNumber;
    this.farmName = data.farmName;
    this.farmSize = data.farmSize;
    this.farmingExperience = data.farmingExperience;
    this.province = data.province;
    this.district = data.district;
    this.subDistrict = data.subDistrict;
    this.postalCode = data.postalCode;
    this.address = data.address;
  }

  static fromRequest(req) {
    return new UpdateProfileRequestDTO(req.body);
  }

  toUseCaseInput() {
    // Filter out undefined values
    const updates = {};
    Object.keys(this).forEach(key => {
      if (this[key] !== undefined) {
        updates[key] = this[key];
      }
    });
    return updates;
  }
}

/**
 * User Response DTO
 */
class UserResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phoneNumber = user.phoneNumber;
    this.farmName = user.farmName;
    this.farmSize = user.farmSize;
    this.farmingExperience = user.farmingExperience;
    this.province = user.province;
    this.district = user.district;
    this.subDistrict = user.subDistrict;
    this.postalCode = user.postalCode;
    this.address = user.address;
    this.status = user.status;
    this.isEmailVerified = user.isEmailVerified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromDomain(user) {
    return new UserResponseDTO(user);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      farmName: this.farmName,
      farmSize: this.farmSize,
      farmingExperience: this.farmingExperience,
      province: this.province,
      district: this.district,
      subDistrict: this.subDistrict,
      postalCode: this.postalCode,
      address: this.address,
      status: this.status,
      isEmailVerified: this.isEmailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * Register Response DTO
 */
class RegisterResponseDTO {
  constructor(data) {
    this.userId = data.userId;
    this.email = data.email;
    this.verificationToken = data.verificationToken;
  }

  static fromUseCaseOutput(output) {
    return new RegisterResponseDTO({
      userId: output.user.id,
      email: output.user.email,
      verificationToken: output.verificationToken,
    });
  }

  toJSON() {
    return {
      userId: this.userId,
      email: this.email,
      verificationToken: this.verificationToken,
    };
  }
}

/**
 * Login Response DTO
 */
class LoginResponseDTO {
  constructor(data) {
    this.accessToken = data.accessToken;
    this.user = data.user;
  }

  static fromUseCaseOutput(output) {
    return new LoginResponseDTO({
      accessToken: output.token,
      user: UserResponseDTO.fromDomain(output.user),
    });
  }

  toJSON() {
    return {
      accessToken: this.accessToken,
      user: this.user.toJSON(),
    };
  }
}

/**
 * API Response wrapper
 */
class ApiResponse {
  constructor(success, data = null, message = null, errors = null) {
    this.success = success;
    if (message) {
      this.message = message;
    }
    if (data) {
      this.data = data;
    }
    if (errors) {
      this.errors = errors;
    }
  }

  static success(data, message = null) {
    return new ApiResponse(true, data, message);
  }

  static error(message, errors = null) {
    return new ApiResponse(false, null, message, errors);
  }

  toJSON() {
    const response = { success: this.success };
    if (this.message) {
      response.message = this.message;
    }
    if (this.data) {
      response.data = this.data;
    }
    if (this.errors) {
      response.errors = this.errors;
    }
    return response;
  }
}

module.exports = {
  RegisterRequestDTO,
  LoginRequestDTO,
  UpdateProfileRequestDTO,
  UserResponseDTO,
  RegisterResponseDTO,
  LoginResponseDTO,
  ApiResponse,
};
