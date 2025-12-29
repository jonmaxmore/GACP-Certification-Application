/**
 * Email Value Object
 * Domain Layer - Clean Architecture
 *
 * Purpose: Immutable value object for email addresses
 * - Email validation
 * - Normalization (lowercase, trim)
 * - Equality comparison
 */

class Email {
  constructor(value) {
    if (!value) {
      throw new Error('Email cannot be empty');
    }

    const normalized = value.toLowerCase().trim();

    if (!this.isValid(normalized)) {
      throw new Error('Invalid email format');
    }

    // Make immutable
    Object.defineProperty(this, 'value', {
      value: normalized,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    Object.freeze(this);
  }

  /**
   * Validate email format
   * @param {string} email
   * @returns {boolean}
   */
  isValid(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get domain from email
   * @returns {string}
   */
  getDomain() {
    return this.value.split('@')[1];
  }

  /**
   * Get local part (before @)
   * @returns {string}
   */
  getLocalPart() {
    return this.value.split('@')[0];
  }

  /**
   * Check if email equals another email
   * @param {Email|string} other
   * @returns {boolean}
   */
  equals(other) {
    if (other instanceof Email) {
      return this.value === other.value;
    }
    return this.value === other;
  }

  /**
   * Convert to string
   * @returns {string}
   */
  toString() {
    return this.value;
  }

  /**
   * Convert to JSON
   * @returns {string}
   */
  toJSON() {
    return this.value;
  }
}

module.exports = Email;
