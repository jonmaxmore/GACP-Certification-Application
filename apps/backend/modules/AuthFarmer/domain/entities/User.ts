/**
 * User Entity
 * Domain Layer - Clean Architecture
 *
 * Purpose: Core business entity representing a farmer user
 * - Pure business logic, no framework dependencies
 * - Contains business rules and validations
 * - Immutable where appropriate
 */

export type UserId = string;
export type UserRole = 'FARMER' | 'INSPECTOR' | 'ADMIN';
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type FarmerType = 'individual' | 'corporate';

export interface UserProps {
  id?: UserId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  idCard?: string;
  corporateId?: string;
  licenseNumber?: string;
  farmerType?: FarmerType;
  farmingExperience?: number;
  address?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
  zipCode?: string;
  role?: UserRole;
  status?: UserStatus;
  isEmailVerified?: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpiry?: Date | null;
  emailVerifiedAt?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpiry?: Date | null;
  lastLoginAt?: Date | null;
  loginAttempts?: number;
  isLocked?: boolean;
  lockedUntil?: Date | null;
  accountLockedUntil?: Date | null;
  failedLoginAttempts?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id?: UserId;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber?: string;
  readonly idCard?: string;
  readonly corporateId?: string;
  readonly licenseNumber?: string;
  readonly farmerType: FarmerType;
  readonly farmingExperience?: number;
  readonly address?: string;
  readonly province?: string;
  readonly district?: string;
  readonly subdistrict?: string;
  readonly zipCode?: string;
  readonly role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpiry: Date | null;
  emailVerifiedAt: Date | null;
  passwordResetToken: string | null;
  passwordResetExpiry: Date | null;
  lastLoginAt: Date | null;
  loginAttempts: number;
  isLocked: boolean;
  lockedUntil: Date | null;
  accountLockedUntil: Date | null;
  failedLoginAttempts: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phoneNumber = props.phoneNumber;
    this.idCard = props.idCard;
    this.corporateId = props.corporateId;
    this.licenseNumber = props.licenseNumber;
    this.farmerType = props.farmerType || 'individual';
    this.farmingExperience = props.farmingExperience;
    this.address = props.address;
    this.province = props.province;
    this.district = props.district;
    this.subdistrict = props.subdistrict;
    this.zipCode = props.zipCode;
    this.role = props.role || 'FARMER';
    this.status = props.status || 'PENDING_VERIFICATION';
    this.isEmailVerified = props.isEmailVerified || false;
    this.emailVerificationToken = props.emailVerificationToken || null;
    this.emailVerificationExpiry = props.emailVerificationExpiry || null;
    this.emailVerifiedAt = props.emailVerifiedAt || null;
    this.passwordResetToken = props.passwordResetToken || null;
    this.passwordResetExpiry = props.passwordResetExpiry || null;
    this.lastLoginAt = props.lastLoginAt || null;
    this.loginAttempts = props.loginAttempts || 0;
    this.isLocked = props.isLocked || false;
    this.lockedUntil = props.lockedUntil || null;
    this.accountLockedUntil = props.accountLockedUntil || null;
    this.failedLoginAttempts = props.failedLoginAttempts || 0;
    this.metadata = props.metadata || {};
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * Get user's full name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Check if user is active
   */
  isActive(): boolean {
    return this.status === 'ACTIVE' && !this.isAccountLocked();
  }

  /**
   * Check if account is locked
   */
  isAccountLocked(): boolean {
    if (!this.accountLockedUntil) {
      return false;
    }
    return new Date() < this.accountLockedUntil;
  }

  /**
   * Check if email verification is valid
   */
  isEmailVerificationValid(): boolean {
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
   */
  isPasswordResetValid(): boolean {
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
  verifyEmail(): void {
    this.isEmailVerified = true;
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = null;
    this.emailVerificationExpiry = null;

    // Auto-activate if status is PENDING_VERIFICATION
    if (this.status === 'PENDING_VERIFICATION') {
      this.status = 'ACTIVE';
    }

    this.updatedAt = new Date();
  }

  /**
   * Record successful login
   */
  recordSuccessfulLogin(): void {
    this.lastLoginAt = new Date();
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = null;
    this.updatedAt = new Date();
  }

  /**
   * Record failed login attempt
   * @param maxAttempts - Maximum allowed attempts before locking
   */
  recordFailedLogin(maxAttempts: number = 5): void {
    this.failedLoginAttempts += 1;
    this.updatedAt = new Date();

    // Lock account if max attempts reached
    if (this.failedLoginAttempts >= maxAttempts) {
      this.lock(30); // Lock for 30 minutes
    }
  }

  /**
   * Lock account
   * @param durationMinutes - Lock duration in minutes
   */
  lock(durationMinutes: number = 30): void {
    this.accountLockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    this.updatedAt = new Date();
  }

  /**
   * Unlock account
   */
  unlock(): void {
    this.accountLockedUntil = null;
    this.failedLoginAttempts = 0;
    this.updatedAt = new Date();
  }

  /**
   * Activate account
   */
  activate(): void {
    if (!this.isEmailVerified) {
      throw new Error('Cannot activate account without email verification');
    }
    this.status = 'ACTIVE';
    this.updatedAt = new Date();
  }

  /**
   * Suspend account
   * @param reason - Suspension reason
   */
  suspend(reason?: string): void {
    this.status = 'SUSPENDED';
    if (reason) {
      this.metadata.suspensionReason = reason;
      this.metadata.suspendedAt = new Date();
    }
    this.updatedAt = new Date();
  }

  /**
   * Deactivate account
   */
  deactivate(): void {
    this.status = 'INACTIVE';
    this.updatedAt = new Date();
  }

  /**
   * Set password reset token
   * @param token - Reset token
   * @param expiryMinutes - Token expiry in minutes
   */
  setPasswordResetToken(token: string, expiryMinutes: number = 60): void {
    this.passwordResetToken = token;
    this.passwordResetExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);
    this.updatedAt = new Date();
  }

  /**
   * Clear password reset token
   */
  clearPasswordResetToken(): void {
    this.passwordResetToken = null;
    this.passwordResetExpiry = null;
    this.updatedAt = new Date();
  }

  /**
   * Update profile
   * @param updates - Profile updates
   */
  updateProfile(
    updates: Partial<
      Pick<
        UserProps,
        | 'firstName'
        | 'lastName'
        | 'phoneNumber'
        | 'address'
        | 'province'
        | 'district'
        | 'subdistrict'
        | 'zipCode'
      >
    >,
  ): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  /**
   * Validate user data
   * @returns Array of validation errors
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.email) {
      errors.push('Email is required');
    }

    if (!this.password) {
      errors.push('Password is required');
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

    return errors;
  }

  /**
   * Convert to JSON (safe for API responses)
   * Excludes password
   */
  toJSON(): Omit<UserProps, 'password'> & { id: UserId | undefined } {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      idCard: this.idCard,
      corporateId: this.corporateId,
      licenseNumber: this.licenseNumber,
      farmerType: this.farmerType,
      farmingExperience: this.farmingExperience,
      address: this.address,
      province: this.province,
      district: this.district,
      subdistrict: this.subdistrict,
      zipCode: this.zipCode,
      role: this.role,
      status: this.status,
      isEmailVerified: this.isEmailVerified,
      emailVerifiedAt: this.emailVerifiedAt,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to public profile (minimal data)
   */
  toPublicProfile(): {
    id?: UserId;
    fullName: string;
    role: UserRole;
    province?: string;
    status: UserStatus;
  } {
    return {
      id: this.id,
      fullName: this.getFullName(),
      role: this.role,
      province: this.province,
      status: this.status,
    };
  }
}
