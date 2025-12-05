/**
 * Real Validation Utilities
 * Implements strict algorithms for Thai Identity Verification
 */

/**
 * Validate Thai National ID using Modulus 13 algorithm
 * @param {string} id - 13-digit Thai National ID
 * @returns {boolean} - True if valid
 */
exports.validateThaiID = (id) => {
  if (!id || typeof id !== 'string' || id.length !== 13) {
    return false;
  }

  // Check if all characters are digits
  if (!/^\d+$/.test(id)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseFloat(id.charAt(i)) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;

  return checkDigit === parseFloat(id.charAt(12));
};

/**
 * Validate Laser Code (Back of ID Card)
 * Format: 2 Upper Case Letters followed by 10 Digits (e.g., ME0-9999999-99)
 * Note: Input usually comes without hyphens
 * @param {string} laser - Laser Code
 * @returns {boolean} - True if format is valid
 */
exports.validateLaserCode = (laser) => {
  if (!laser || typeof laser !== 'string') {
    return false;
  }

  // Remove hyphens if present
  const cleanLaser = laser.replace(/-/g, '');

  // Real Format Check: 2 Upper Case Letters followed by 10 Digits
  const regex = /^[A-Z]{2}[0-9]{10}$/;
  return regex.test(cleanLaser);
};
