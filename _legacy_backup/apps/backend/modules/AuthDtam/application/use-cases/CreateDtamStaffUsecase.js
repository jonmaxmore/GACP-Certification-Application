/**
 * Create DTAM Staff Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Create new DTAM staff account (admin only)
 * - Validate staff data
 * - Check uniqueness
 * - Hash password
 * - Create staff entity
 * - Publish domain event
 */

const DTAMStaff = require('../../domain/entities/DTAMStaff');
const DTAMStaffCreated = require('../../domain/events/DTAMStaffCreated');
const Email = require('../../../auth-farmer/domain/value-objects/Email');
const Password = require('../../../auth-farmer/domain/value-objects/Password');

class CreateDTAMStaffUseCase {
  constructor({ staffRepository, passwordHasher, eventBus }) {
    this.staffRepository = staffRepository;
    this.passwordHasher = passwordHasher;
    this.eventBus = eventBus;
  }

  async execute({
    email,
    password,
    firstName,
    lastName,
    employeeId,
    department,
    position,
    role,
    permissions,
    phoneNumber,
    createdBy,
  }) {
    // Validate email
    const emailVO = new Email(email);
    if (!emailVO.isValid()) {
      throw new Error('Invalid email address');
    }

    // Validate password
    const passwordVO = new Password(password);
    passwordVO.validate();

    // Check if email already exists
    const emailExists = await this.staffRepository.emailExists(email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Check if employee ID already exists
    const employeeIdExists = await this.staffRepository.employeeIdExists(employeeId);
    if (employeeIdExists) {
      throw new Error('Employee ID already exists');
    }

    // Validate role
    if (!Object.values(DTAMStaff.ROLES).includes(role)) {
      throw new Error('Invalid role');
    }

    // Get default permissions for role if not provided
    const staffPermissions =
      permissions && permissions.length > 0 ? permissions : DTAMStaff.getDefaultPermissions(role);

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(password);

    // Create staff entity
    const staff = new DTAMStaff({
      email: emailVO.toString(),
      password: hashedPassword,
      firstName,
      lastName,
      employeeId,
      department,
      position,
      role,
      permissions: staffPermissions,
      phoneNumber,
      status: DTAMStaff.STATUS.ACTIVE,
      isEmailVerified: true, // DTAM staff emails are pre-verified
      emailVerifiedAt: new Date(),
      createdBy,
    });

    // Validate entity
    staff.validate();

    // Save to repository
    const savedStaff = await this.staffRepository.save(staff);

    // Publish domain event
    const event = new DTAMStaffCreated(savedStaff, createdBy);
    await this.eventBus.publish(event);

    return {
      staff: savedStaff,
    };
  }
}

module.exports = CreateDTAMStaffUseCase;
