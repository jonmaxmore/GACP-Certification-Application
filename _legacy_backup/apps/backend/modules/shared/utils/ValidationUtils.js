/**
 * Validation Utilities
 * Common validation functions for the GACP platform
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate Thai phone number
 */
function isValidPhoneNumber(phone) {
  const phoneRegex = /^[+]?[0-9()\s-]+$/;
  return phoneRegex.test(phone);
}

/**
 * Validate Thai National ID (13 digits)
 */
function isValidNationalId(nationalId) {
  if (!nationalId || nationalId.length !== 13) {
    return false;
  }

  const digits = nationalId.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === digits[12];
}

/**
 * Sanitize string input
 */
function sanitizeString(str) {
  if (!str) {
    return '';
  }
  return str
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
}

/**
 * Validate required fields
 */
function validateRequired(data, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (!data[field] || data[field] === '') {
      missing.push(field);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Validate date range
 */
function isValidDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return start <= end;
}

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
  isValidNationalId,
  sanitizeString,
  validateRequired,
  isValidDateRange,
};
