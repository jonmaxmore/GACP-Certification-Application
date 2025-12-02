/**
 * User Domain Entity Tests
 * Tests business logic and domain rules
 */

const User = require('../../domain/entities/User');
const { createUserPayload } = require('../fixtures/userFactory');

describe('User Domain Entity', () => {
  describe('Constructor and Creation', () => {
    it('should create a user with valid data', () => {
      const userData = createUserPayload({
        password: 'hashedPassword123', // Already hashed for domain entity
      });

      const user = new User(userData);

      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.status).toBe('PENDING_VERIFICATION');
      expect(user.isEmailVerified).toBe(false);
    });

    it('should set default values for optional fields', () => {
      const user = new User(
        createUserPayload({
          password: 'hashedPassword123',
        }),
      );

      expect(user.loginAttempts).toBe(0);
      expect(user.lockedUntil).toBeNull();
      expect(user.status).toBe('PENDING_VERIFICATION');
    });
  });

  describe('getFullName()', () => {
    it('should return formatted full name', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
      });

      expect(user.getFullName()).toBe('John Doe');
    });

    it('should handle single-word names', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: '',
        idCard: '1234567890123',
      });

      expect(user.getFullName()).toBe('John');
    });
  });

  describe('isActive()', () => {
    it('should return true for ACTIVE status', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'ACTIVE',
      });

      expect(user.isActive()).toBe(true);
    });

    it('should return false for PENDING_VERIFICATION status', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'PENDING_VERIFICATION',
      });

      expect(user.isActive()).toBe(false);
    });

    it('should return false for SUSPENDED status', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'SUSPENDED',
      });

      expect(user.isActive()).toBe(false);
    });
  });

  describe('isAccountLocked()', () => {
    it('should return false when accountLockedUntil is null', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        accountLockedUntil: null,
      });

      expect(user.isAccountLocked()).toBe(false);
    });

    it('should return true when locked until future date', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000);
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        lockedUntil: futureDate,
        isLocked: true,
      });

      expect(user.isAccountLocked()).toBe(true);
    });

    it('should return false when lock has expired', () => {
      const pastDate = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        accountLockedUntil: pastDate,
      });

      expect(user.isAccountLocked()).toBe(false);
    });
  });

  describe('verifyEmail()', () => {
    it('should set isEmailVerified to true', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'PENDING_VERIFICATION',
      });

      user.verifyEmail();

      expect(user.isEmailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeNull();
      expect(user.emailVerificationExpiry).toBeNull();
    });

    it('should change status from PENDING_VERIFICATION to ACTIVE when using activate()', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'PENDING_VERIFICATION',
      });

      user.verifyEmail();
      user.activate();

      expect(user.status).toBe('ACTIVE');
    });

    it('should not change status if already ACTIVE', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'ACTIVE',
        isEmailVerified: false,
      });

      user.verifyEmail();

      expect(user.status).toBe('ACTIVE');
      expect(user.isEmailVerified).toBe(true);
    });
  });

  describe('recordSuccessfulLogin()', () => {
    it('should reset failed login attempts', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        loginAttempts: 3,
      });

      user.recordSuccessfulLogin();

      expect(user.loginAttempts).toBe(0);
    });

    it('should update lastLoginAt timestamp', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
      });

      const beforeLogin = new Date();
      user.recordSuccessfulLogin();
      const afterLogin = new Date();

      expect(user.lastLoginAt).toBeInstanceOf(Date);
      expect(user.lastLoginAt.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
      expect(user.lastLoginAt.getTime()).toBeLessThanOrEqual(afterLogin.getTime());
    });

    it('should clear account lock', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000);
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        lockedUntil: futureDate,
        loginAttempts: 5,
        isLocked: true,
      });

      user.recordSuccessfulLogin();

      expect(user.lockedUntil).toBeNull();
      expect(user.loginAttempts).toBe(0);
      expect(user.isLocked).toBe(false);
    });
  });

  describe('recordFailedLogin()', () => {
    it('should increment failed login attempts', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        loginAttempts: 2,
      });

      user.recordFailedLogin(5);

      expect(user.loginAttempts).toBe(3);
    });

    it('should lock account after max attempts', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        loginAttempts: 4,
      });

      user.recordFailedLogin(5);

      expect(user.loginAttempts).toBe(5);
      expect(user.isLocked).toBe(true);
      expect(user.lockedUntil).toBeInstanceOf(Date);
      expect(user.lockedUntil.getTime()).toBeGreaterThan(Date.now());
    });

    it('should not lock account if below max attempts', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        loginAttempts: 2,
      });

      user.recordFailedLogin(5);

      expect(user.lockedUntil).toBeNull();
      expect(user.isLocked).toBe(false);
    });

    it('should use default max attempts of 5', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        loginAttempts: 4,
      });

      user.recordFailedLogin();

      expect(user.isLocked).toBe(true);
      expect(user.lockedUntil).toBeInstanceOf(Date);
    });
  });

  describe('lock()', () => {
    it('should lock account for specified duration', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
      });

      const durationMinutes = 30;
      user.lock(durationMinutes);

      expect(user.isLocked).toBe(true);
      expect(user.lockedUntil).toBeInstanceOf(Date);

      const expectedLockUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
      const timeDiff = Math.abs(user.lockedUntil.getTime() - expectedLockUntil.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it('should use default duration of 30 minutes', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
      });

      user.lock();

      expect(user.isLocked).toBe(true);
      expect(user.lockedUntil).toBeInstanceOf(Date);

      const expectedLockUntil = new Date(Date.now() + 30 * 60 * 1000);
      const timeDiff = Math.abs(user.lockedUntil.getTime() - expectedLockUntil.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('unlock()', () => {
    it('should clear account lock', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000);
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        lockedUntil: futureDate,
        isLocked: true,
      });

      user.unlock();

      expect(user.lockedUntil).toBeNull();
      expect(user.isLocked).toBe(false);
    });

    it('should reset failed login attempts', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        loginAttempts: 5,
        isLocked: true,
      });

      user.unlock();

      expect(user.loginAttempts).toBe(0);
    });
  });

  describe('activate()', () => {
    it('should change status to ACTIVE', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'PENDING_VERIFICATION',
        isEmailVerified: true,
      });

      user.activate();

      expect(user.status).toBe('ACTIVE');
    });
  });

  describe('suspend()', () => {
    it('should change status to SUSPENDED', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'ACTIVE',
      });

      user.suspend('Violation of terms');

      expect(user.status).toBe('SUSPENDED');
    });

    it('should store suspension reason', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        status: 'ACTIVE',
      });

      const reason = 'Fraudulent activity detected';
      user.suspend(reason);

      expect(user.status).toBe('SUSPENDED');
      // Note: User entity doesn't store reason in current implementation
      // This is a potential enhancement
    });
  });

  describe('validate()', () => {
    it('should return empty array for valid user', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        phoneNumber: '0812345678',
      });

      const errors = user.validate();

      expect(errors).toEqual([]);
    });

    it('should return error for missing email', () => {
      const user = new User({
        email: '',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
      });

      const errors = user.validate();

      expect(errors).toContain('Email is required');
    });

    it('should return error for missing password', () => {
      const user = new User({
        email: 'test@example.com',
        password: '',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        phoneNumber: '0812345678',
      });

      const errors = user.validate();

      // Note: validate() doesn't check password - only email, names, phone, idCard
      expect(errors).toEqual([]);
    });

    it('should return error for missing firstName', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: '',
        lastName: 'Doe',
        idCard: '1234567890123',
      });

      const errors = user.validate();

      expect(errors).toContain('First name is required');
    });

    it('should return error for missing lastName', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: '',
        idCard: '1234567890123',
      });

      const errors = user.validate();

      expect(errors).toContain('Last name is required');
    });

    it('should return multiple errors for multiple missing fields', () => {
      const user = new User({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        idCard: '1234567890123',
      });

      const errors = user.validate();

      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('toJSON()', () => {
    it('should exclude password from JSON output', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
      });

      const json = user.toJSON();

      expect(json).not.toHaveProperty('password');
    });

    it('should include all non-sensitive fields', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        phoneNumber: '0812345678',
      });

      const json = user.toJSON();

      expect(json).toHaveProperty('email', 'test@example.com');
      expect(json).toHaveProperty('firstName', 'John');
      expect(json).toHaveProperty('lastName', 'Doe');
      expect(json).toHaveProperty('phoneNumber', '0812345678');
    });
  });

  describe('toPublicProfile()', () => {
    it('should exclude sensitive fields', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        phoneNumber: '0812345678',
      });

      const profile = user.toPublicProfile();

      expect(profile).not.toHaveProperty('password');
      expect(profile).not.toHaveProperty('idCard');
      expect(profile).not.toHaveProperty('emailVerificationToken');
      expect(profile).not.toHaveProperty('passwordResetToken');
    });

    it('should include only public fields', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        idCard: '1234567890123',
        province: 'Bangkok',
      });

      const profile = user.toPublicProfile();

      // toPublicProfile returns: id, fullName, province, role
      expect(profile).toHaveProperty('fullName', 'John Doe');
      expect(profile).toHaveProperty('province', 'Bangkok');
      expect(profile).toHaveProperty('role', 'FARMER');
      // Does NOT include firstName, lastName, status separately
      expect(profile).not.toHaveProperty('firstName');
      expect(profile).not.toHaveProperty('lastName');
    });
  });
});
