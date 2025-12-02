/**
 * User Entity
 * Domain Layer - Clean Architecture
 *
 * Purpose: Core business entity representing a farmer user
 * - Pure business logic, no framework dependencies
 * - Contains business rules and validations
 * - Immutable where appropriate
 */

class User {
  constructor({
    id,
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    idCard,
    idCardImage,
    laserCode,
    corporateId,
    farmerType,
    farmingExperience,
    address,
    province,
    district,
    subdistrict,
    zipCode,
    role = 'farmer',
    status = 'pending_verification',
    verificationStatus = 'pending',
    isEmailVerified = false,
    emailVerificationToken = null,
    emailVerificationExpiry = null,
    passwordResetToken = null,
    passwordResetExpiry = null,
    lastLoginAt = null,
    loginAttempts = 0,
    isLocked = false,
    lockedUntil = null,
    metadata = {},
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.idCard = idCard;
    this.idCardImage = idCardImage;
    this.laserCode = laserCode;
    this.corporateId = corporateId;
    this.farmerType = farmerType;
    this.farmingExperience = farmingExperience;
    this.address = address;
    this.province = province;
    this.district = district;
    this.subdistrict = subdistrict;
    this.zipCode = zipCode;
    this.role = role;
    this.status = status;
    this.verificationStatus = verificationStatus;
    this.isEmailVerified = isEmailVerified;
    this.emailVerificationToken = emailVerificationToken;
    this.emailVerificationExpiry = emailVerificationExpiry;
    this.passwordResetToken = passwordResetToken;
    this.passwordResetExpiry = passwordResetExpiry;
    this.lastLoginAt = lastLoginAt;
    this.loginAttempts = loginAttempts;
    this.isLocked = isLocked;
    this.lockedUntil = lockedUntil;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Get user's full name
   * @returns {string}
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Check if user is active
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'ACTIVE' && !this.isLocked;
  }

  /**
   * Check if account is locked
   * @returns {boolean}
   */
  isAccountLocked() {
    if (!this.isLocked) {
      return false;
    }

    // Check if lock period has expired
    if (this.lockedUntil && new Date() > this.lockedUntil) {
      this.unlock();
      return false;
    }

    return true;
  }

  /**
   * Check if email is verified
   * @returns {boolean}
   */
  isEmailVerificationValid() {
    if (!this.emailVerificationToken) {
      return false;
    }
    if (!this.emailVerificationExpiry) {
      return false;
    }
    return new Date() < this.emailVerificationExpiry;
  }

  /**
   * Check if password reset token is valid
   * @returns {boolean}
   */
  isPasswordResetValid() {
    if (!this.passwordResetToken) {
      return false;
    }
    if (!this.passwordResetExpiry) {
      return false;
    }
    return new Date() < this.passwordResetExpiry;
  }

  /**
   * Verify email
   */
  verifyEmail() {
    this.isEmailVerified = true;
    this.emailVerificationToken = null;
    this.emailVerificationExpiry = null;
    this.updatedAt = new Date();
  }

  /**
   * Record successful login
   */
  recordSuccessfulLogin() {
    this.lastLoginAt = new Date();
    this.loginAttempts = 0;
    this.isLocked = false;
    this.lockedUntil = null;
    this.updatedAt = new Date();
  }

  /**
   * Record failed login attempt
   * @param {number} maxAttempts - Maximum allowed attempts before locking
   */
  recordFailedLogin(maxAttempts = 5) {
    this.loginAttempts += 1;
    this.updatedAt = new Date();

    // Lock account if max attempts reached
    if (this.loginAttempts >= maxAttempts) {
      this.lock(30); // Lock for 30 minutes
    }
  }

  /**
   * Lock user account
   * @param {number} durationMinutes - Lock duration in minutes
   */
  lock(durationMinutes = 30) {
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    this.updatedAt = new Date();
  }

  /**
   * Unlock user account
   */
  unlock() {
    this.isLocked = false;
    this.lockedUntil = null;
    this.loginAttempts = 0;
    this.updatedAt = new Date();
  }

  /**
   * Activate user account
   */
  activate() {
    if (!this.isEmailVerified) {
      throw new Error('Cannot activate account without email verification');
    }
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  /**
   * Suspend user account
   * @param {string} reason - Suspension reason
   */
  suspend(reason) {
    this.status = 'SUSPENDED';
    this.metadata.suspensionReason = reason;
    this.metadata.suspendedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Update profile information
   * @param {Object} profileData
   */
  updateProfile(profileData) {
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'address',
      'province',
      'district',
      'subdistrict',
      'zipCode',
    ];

    allowedFields.forEach(field => {
      if (profileData[field] !== undefined) {
        this[field] = profileData[field];
      }
    });

    this.updatedAt = new Date();
  }

  /**
   * Set password reset token
   * @param {string} token
   * @param {number} expiryMinutes
   */
  setPasswordResetToken(token, expiryMinutes = 60) {
    this.passwordResetToken = token;
    this.passwordResetExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
    this.updatedAt = new Date();
  }

  /**
   * Clear password reset token
   */
  clearPasswordResetToken() {
    this.passwordResetToken = null;
    this.passwordResetExpiry = null;
    this.updatedAt = new Date();
  }

  /**
   * Set email verification token
   * @param {string} token
   * @param {number} expiryHours
   */
  setEmailVerificationToken(token, expiryHours = 24) {
    this.emailVerificationToken = token;
    this.emailVerificationExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    this.updatedAt = new Date();
  }

  /**
   * Validate user entity
   * @returns {Array} Array of validation errors
   */
  validate() {
    const errors = [];

    if (!this.email) {
      errors.push('Email is required');
    }

    if (!this.firstName) {
      errors.push('First name is required');
    }

    if (!this.lastName) {
      errors.push('Last name is required');
    }

    if (!this.phoneNumber) {
      errors.push('Phone number is required');
    }

    if (!this.idCard) {
      errors.push('ID card is required');
    }

    if (this.idCard && this.idCard.length !== 13) {
      errors.push('ID card must be 13 digits');
    }

    if (!this.laserCode) {
      errors.push('Laser code is required');
    }

    const validStatuses = ['pending_verification', 'active', 'suspended', 'inactive'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid user status');
    }

    return errors;
  }

  /**
   * Convert to plain object (for API responses)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      phoneNumber: this.phoneNumber,
      idCard: this.idCard,
      idCardImage: this.idCardImage,
      laserCode: this.laserCode,
      corporateId: this.corporateId,
      farmerType: this.farmerType,
      farmingExperience: this.farmingExperience,
      address: this.address,
      province: this.province,
      district: this.district,
      subdistrict: this.subdistrict,
      zipCode: this.zipCode,
      role: this.role,
      status: this.status,
      verificationStatus: this.verificationStatus,
      isEmailVerified: this.isEmailVerified,
      isActive: this.isActive(),
      isLocked: this.isAccountLocked(),
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Note: Sensitive fields (password, tokens) are excluded
    };
  }

  /**
   * Convert to public profile (minimal data)
   * @returns {Object}
   */
  toPublicProfile() {
    return {
      id: this.id,
      fullName: this.getFullName(),
      province: this.province,
      role: this.role,
    };
  }
}

module.exports = User;
