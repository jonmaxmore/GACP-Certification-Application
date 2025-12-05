/**
 * Login DTAM Staff Use Case
 * Application Layer - Clean Architecture
 *
 * Purpose: Authenticate DTAM staff
 * - Validate credentials
 * - Check account status
 * - Generate JWT token
 * - Record login
 * - Publish domain event
 */

const DTAMStaffLoggedIn = require('../../domain/events/DTAMStaffLoggedIn');

class LoginDTAMStaffUseCase {
  constructor({ staffRepository, passwordHasher, jwtService, eventBus }) {
    this.staffRepository = staffRepository;
    this.passwordHasher = passwordHasher;
    this.jwtService = jwtService;
    this.eventBus = eventBus;
  }

  async execute({ email, password, ipAddress, userAgent }) {
    // Find staff by email
    const staff = await this.staffRepository.findByEmail(email);
    if (!staff) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (staff.isAccountLocked()) {
      const lockedUntil = staff.accountLockedUntil.toLocaleString();
      throw new Error(`Account is locked until ${lockedUntil}. Please try again later.`);
    }

    // Check account status
    if (!staff.isActive()) {
      throw new Error('Account is not active. Please contact administrator.');
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.compare(password, staff.password);

    if (!isPasswordValid) {
      // Record failed login attempt
      staff.recordFailedLogin();
      await this.staffRepository.save(staff);

      throw new Error('Invalid credentials');
    }

    // Record successful login
    staff.recordSuccessfulLogin(ipAddress, userAgent);
    await this.staffRepository.save(staff);

    // Generate JWT token with role and permissions
    const token = this.jwtService.sign({
      staffId: staff.id,
      email: staff.email,
      type: 'dtam_staff',
      role: staff.role,
      permissions: staff.permissions,
    });

    // Publish domain event
    const event = new DTAMStaffLoggedIn(staff, ipAddress, userAgent);
    await this.eventBus.publish(event);

    return {
      staff,
      token,
    };
  }
}

module.exports = LoginDTAMStaffUseCase;
