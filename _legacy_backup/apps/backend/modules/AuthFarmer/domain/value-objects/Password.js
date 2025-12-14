/**
 * Password Value Object
 * Domain Layer - Clean Architecture
 *
 * Purpose: Immutable value object for passwords
 * - Password strength validation
 * - Hashing (delegated to infrastructure)
 * - Business rules for password policy
 */

class Password {
  constructor(value, isHashed = false) {
    if (!value) {
      throw new Error('Password cannot be empty');
    }

    // If password is already hashed, store as-is
    if (isHashed) {
      Object.defineProperty(this, 'hashedValue', {
        value: value,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      Object.defineProperty(this, 'isHashed', {
        value: true,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    } else {
      // Validate plain text password
      const validationErrors = this.validate(value);
      if (validationErrors.length > 0) {
        throw new Error(`Password validation failed: ${validationErrors.join(', ')}`);
      }

      Object.defineProperty(this, 'plainValue', {
        value: value,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      Object.defineProperty(this, 'isHashed', {
        value: false,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }

    Object.freeze(this);
  }

  /**
   * Create from hashed password
   * @param {string} hashedPassword
   * @returns {Password}
   */
  static fromHash(hashedPassword) {
    return new Password(hashedPassword, true);
  }

  /**
   * Validate password strength
   * @param {string} password
   * @returns {Array} Array of validation errors
   */
  validate(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Optional: Check for special characters
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //   errors.push('Password must contain at least one special character');
    // }

    return errors;
  }

  /**
   * Get plain text value (only if not hashed)
   * @returns {string}
   */
  getPlainValue() {
    if (this.isHashed) {
      throw new Error('Cannot get plain value from hashed password');
    }
    return this.plainValue;
  }

  /**
   * Get hashed value (only if hashed)
   * @returns {string}
   */
  getHashedValue() {
    if (!this.isHashed) {
      throw new Error('Cannot get hashed value from plain password');
    }
    return this.hashedValue;
  }

  /**
   * Check password strength level
   * @param {string} password
   * @returns {string} 'weak' | 'medium' | 'strong'
   */
  static getStrength(password) {
    let strength = 0;

    if (password.length >= 8) {
      strength++;
    }
    if (password.length >= 12) {
      strength++;
    }
    if (/[a-z]/.test(password)) {
      strength++;
    }
    if (/[A-Z]/.test(password)) {
      strength++;
    }
    if (/[0-9]/.test(password)) {
      strength++;
    }
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength++;
    }

    if (strength <= 2) {
      return 'weak';
    }
    if (strength <= 4) {
      return 'medium';
    }
    return 'strong';
  }

  /**
   * Convert to JSON (never expose password)
   * @returns {string}
   */
  toJSON() {
    return '***REDACTED***';
  }
}

module.exports = Password;
