/**
 * Password Value Object
 * Provides password validation and comparison abstraction
 * Part of Clean Architecture Domain Layer
 */

export class InvalidPasswordError extends Error {
  constructor(message = 'invalid_password') {
    super(message);
    this.name = 'InvalidPasswordError';
    Object.setPrototypeOf(this, InvalidPasswordError.prototype);
  }
}

/**
 * Interface for password hashing service (abstraction for infrastructure layer)
 */
export interface IPasswordHasher {
  compare(raw: string, hash: string): Promise<boolean>;
  hash(raw: string): Promise<string>;
}

/**
 * Password value object ensuring password requirements
 * Stores raw password temporarily for validation and hashing
 * Never persisted - only the hash should be stored
 */
export class Password {
  private constructor(private readonly raw: string) {}

  /**
   * Factory method to create Password instance
   * @param raw - Raw password string
   * @returns Password instance
   * @throws InvalidPasswordError if validation fails
   */
  static create(raw: string): Password {
    if (!raw || typeof raw !== 'string') {
      throw new InvalidPasswordError('Password must be a non-empty string');
    }

    // Minimum length requirement
    if (raw.length < 8) {
      throw new InvalidPasswordError('password_too_short');
    }

    // Maximum length (prevent DoS attacks)
    if (raw.length > 128) {
      throw new InvalidPasswordError('password_too_long');
    }

    // Complexity requirements
    const hasUpperCase = /[A-Z]/.test(raw);
    const hasLowerCase = /[a-z]/.test(raw);
    const hasNumber = /[0-9]/.test(raw);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(raw);

    const complexityCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(
      Boolean,
    ).length;

    if (complexityCount < 3) {
      throw new InvalidPasswordError('password_too_weak');
    }

    // Check for common weak patterns
    if (/^(.)\1+$/.test(raw)) {
      // All same character: "aaaaaaaa"
      throw new InvalidPasswordError('password_too_weak');
    }

    if (/^(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh)/.test(raw.toLowerCase())) {
      // Sequential patterns
      throw new InvalidPasswordError('password_too_weak');
    }

    // Common weak passwords (extend this list as needed)
    const commonWeakPasswords = [
      'password',
      'password123',
      '12345678',
      'qwerty',
      'abc123',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
    ];

    if (commonWeakPasswords.includes(raw.toLowerCase())) {
      throw new InvalidPasswordError('password_too_common');
    }

    return new Password(raw);
  }

  /**
   * Compare raw password with a hashed password using injected hasher
   * @param hasher - Password hasher implementation (bcrypt, argon2, etc.)
   * @param hash - Hashed password to compare against
   * @returns Promise<boolean> - True if passwords match
   */
  async compareToHash(hasher: IPasswordHasher, hash: string): Promise<boolean> {
    return hasher.compare(this.raw, hash);
  }

  /**
   * Get raw password value
   * WARNING: Only use this for hashing during registration
   * Never store or log this value
   */
  get value(): string {
    return this.raw;
  }

  /**
   * Hash the password using injected hasher
   * @param hasher - Password hasher implementation
   * @returns Promise<string> - Hashed password
   */
  async hash(hasher: IPasswordHasher): Promise<string> {
    return hasher.hash(this.raw);
  }

  /**
   * Check password strength (returns score 0-100)
   */
  getStrength(): number {
    let score = 0;

    // Length score (max 40 points)
    score += Math.min(this.raw.length * 2, 40);

    // Complexity score (max 40 points)
    if (/[A-Z]/.test(this.raw)) {
      score += 10;
    }
    if (/[a-z]/.test(this.raw)) {
      score += 10;
    }
    if (/[0-9]/.test(this.raw)) {
      score += 10;
    }
    if (/[^A-Za-z0-9]/.test(this.raw)) {
      score += 10;
    }

    // Variety score (max 20 points)
    const uniqueChars = new Set(this.raw).size;
    score += Math.min(uniqueChars * 2, 20);

    return Math.min(score, 100);
  }

  /**
   * Get password strength label
   */
  getStrengthLabel(): 'weak' | 'fair' | 'good' | 'strong' | 'very-strong' {
    const strength = this.getStrength();
    if (strength < 40) {
      return 'weak';
    }
    if (strength < 60) {
      return 'fair';
    }
    if (strength < 80) {
      return 'good';
    }
    if (strength < 90) {
      return 'strong';
    }
    return 'very-strong';
  }
}

/**
 * Type guard to check if value is Password instance
 */
export function isPassword(value: any): value is Password {
  return value instanceof Password;
}
