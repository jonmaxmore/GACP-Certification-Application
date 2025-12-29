/**
 * DTAM Staff DTOs (Data Transfer Objects)
 * Presentation Layer - Clean Architecture
 *
 * Purpose: Transform data between layers
 */

/**
 * Create Staff Request DTO
 */
class CreateStaffRequestDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.employeeId = data.employeeId;
    this.department = data.department;
    this.position = data.position;
    this.role = data.role;
    this.permissions = data.permissions;
    this.phoneNumber = data.phoneNumber;
  }

  static fromRequest(req) {
    return new CreateStaffRequestDTO(req.body);
  }

  toUseCaseInput(createdBy) {
    return {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      employeeId: this.employeeId,
      department: this.department,
      position: this.position,
      role: this.role,
      permissions: this.permissions,
      phoneNumber: this.phoneNumber,
      createdBy,
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
    this.department = data.department;
    this.position = data.position;
  }

  static fromRequest(req) {
    return new UpdateProfileRequestDTO(req.body);
  }

  toUseCaseInput() {
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
 * Update Role Request DTO
 */
class UpdateRoleRequestDTO {
  constructor(data) {
    this.role = data.role;
    this.permissions = data.permissions;
  }

  static fromRequest(req) {
    return new UpdateRoleRequestDTO(req.body);
  }

  toUseCaseInput(staffId, updatedBy) {
    return {
      staffId,
      role: this.role,
      permissions: this.permissions,
      updatedBy,
    };
  }
}

/**
 * Staff Response DTO
 */
class StaffResponseDTO {
  constructor(staff) {
    this.id = staff.id;
    this.email = staff.email;
    this.firstName = staff.firstName;
    this.lastName = staff.lastName;
    this.fullName = staff.getFullName();
    this.employeeId = staff.employeeId;
    this.department = staff.department;
    this.position = staff.position;
    this.role = staff.role;
    this.permissions = staff.permissions;
    this.phoneNumber = staff.phoneNumber;
    this.status = staff.status;
    this.isEmailVerified = staff.isEmailVerified;
    this.lastLoginAt = staff.lastLoginAt;
    this.createdAt = staff.createdAt;
    this.updatedAt = staff.updatedAt;
  }

  static fromDomain(staff) {
    return new StaffResponseDTO(staff);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      employeeId: this.employeeId,
      department: this.department,
      position: this.position,
      role: this.role,
      permissions: this.permissions,
      phoneNumber: this.phoneNumber,
      status: this.status,
      isEmailVerified: this.isEmailVerified,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * Staff Public Profile DTO (for listing)
 */
class StaffPublicProfileDTO {
  constructor(staff) {
    this.id = staff.id;
    this.email = staff.email;
    this.firstName = staff.firstName;
    this.lastName = staff.lastName;
    this.fullName = staff.getFullName();
    this.employeeId = staff.employeeId;
    this.department = staff.department;
    this.position = staff.position;
    this.role = staff.role;
    this.status = staff.status;
  }

  static fromDomain(staff) {
    return new StaffPublicProfileDTO(staff);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      employeeId: this.employeeId,
      department: this.department,
      position: this.position,
      role: this.role,
      status: this.status,
    };
  }
}

/**
 * Login Response DTO
 */
class LoginResponseDTO {
  constructor(data) {
    this.accessToken = data.accessToken;
    this.staff = data.staff;
  }

  static fromUseCaseOutput(output) {
    return new LoginResponseDTO({
      accessToken: output.token,
      staff: StaffResponseDTO.fromDomain(output.staff),
    });
  }

  toJSON() {
    return {
      accessToken: this.accessToken,
      staff: this.staff.toJSON(),
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
  CreateStaffRequestDTO,
  LoginRequestDTO,
  UpdateProfileRequestDTO,
  UpdateRoleRequestDTO,
  StaffResponseDTO,
  StaffPublicProfileDTO,
  LoginResponseDTO,
  ApiResponse,
};
