/**
 * Email Value Object
 * Provides email validation and normalization
 * Part of Clean Architecture Domain Layer
 */

export class InvalidEmailError extends Error {
  constructor(message = 'invalid_email') {
    super(message);
    this.name = 'InvalidEmailError';
    Object.setPrototypeOf(this, InvalidEmailError.prototype);
  }
}

/**
 * Email value object ensuring valid email format
 * Immutable and self-validating
 */
export class Email {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Factory method to create Email instance
   * @param input - Raw email string
   * @returns Email instance
   * @throws InvalidEmailError if validation fails
   */
  static create(input: string): Email {
    if (!input || typeof input !== 'string') {
      throw new InvalidEmailError('Email must be a non-empty string');
    }

    const normalized = input.trim().toLowerCase();

    if (normalized.length === 0) {
      throw new InvalidEmailError('Email cannot be empty');
    }

    // RFC 5322 simplified email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new InvalidEmailError('Email format is invalid');
    }

    // Additional checks
    if (normalized.length > 254) {
      throw new InvalidEmailError('Email exceeds maximum length');
    }

    const [localPart, domain] = normalized.split('@');
    if (localPart.length > 64) {
      throw new InvalidEmailError('Email local part exceeds maximum length');
    }

    // Check for common invalid patterns
    if (normalized.includes('..') || normalized.startsWith('.') || normalized.endsWith('.')) {
      throw new InvalidEmailError('Email contains invalid dot pattern');
    }

    return new Email(normalized);
  }

  /**
   * Get string representation
   */
  toString(): string {
    return this.value;
  }

  /**
   * JSON serialization
   */
  toJSON(): string {
    return this.value;
  }

  /**
   * Compare with another Email
   */
  equals(other: Email): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Get domain part of email
   */
  getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Get local part of email (before @)
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Check if email is from a specific domain
   */
  isFromDomain(domain: string): boolean {
    return this.getDomain() === domain.toLowerCase();
  }
}

/**
 * Type guard to check if value is Email instance
 */
export function isEmail(value: any): value is Email {
  return value instanceof Email;
}
