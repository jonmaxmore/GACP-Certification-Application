/**
 * CertificateNumber Value Object (Domain Layer)
 * Immutable value object for certificate numbers
 */

class CertificateNumber {
  constructor(value) {
    if (!value) {
      throw new Error('Certificate number cannot be empty');
    }

    this.value = value;
    Object.freeze(this); // Make immutable
  }

  /**
   * Generate new certificate number
   * Format: GACP-YYYY-MMDD-NNNN
   */
  static generate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    const value = `GACP-${year}-${month}${day}-${random}`;
    return new CertificateNumber(value);
  }

  /**
   * Validate certificate number format
   */
  isValid() {
    const pattern = /^GACP-\d{4}-\d{4}-\d{4}$/;
    return pattern.test(this.value);
  }

  /**
   * Get year from certificate number
   */
  getYear() {
    if (!this.isValid()) {
      return null;
    }
    return parseInt(this.value.split('-')[1]);
  }

  /**
   * Get date from certificate number
   */
  getDate() {
    if (!this.isValid()) {
      return null;
    }
    const datePart = this.value.split('-')[2];
    const month = parseInt(datePart.substring(0, 2));
    const day = parseInt(datePart.substring(2, 4));
    const year = this.getYear();
    return new Date(year, month - 1, day);
  }

  /**
   * Get sequence number
   */
  getSequence() {
    if (!this.isValid()) {
      return null;
    }
    return parseInt(this.value.split('-')[3]);
  }

  /**
   * Compare with another certificate number
   */
  equals(other) {
    if (!(other instanceof CertificateNumber)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * String representation
   */
  toString() {
    return this.value;
  }

  /**
   * JSON representation
   */
  toJSON() {
    return this.value;
  }
}

module.exports = CertificateNumber;
