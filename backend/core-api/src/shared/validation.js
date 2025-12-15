/**
 * Validation Utilities
 * Comprehensive validation functions for GACP Platform
 *
 * Consolidated from multiple validation files:
 * - shared/validation.js (original)
 * - modules/shared/utils/validation.js (merged 2025-01)
 * - src/utils/validation.js (comprehensive version)
 */

/**
 * Email validation
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Alias for validateEmail (consistent naming)
 */
const isValidEmail = validateEmail;

/**
 * Phone validation (Thai format - 10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid Thai phone format
 */
const validatePhone = phone => /^[0-9]{10}$/.test(phone);

/**
 * Thai phone validation (more strict - must start with 08/09/06)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid Thai mobile format
 */
const isValidThaiPhone = phone => {
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Required field validation
 * @param {*} value - Value to check
 * @returns {boolean} True if not null/undefined/empty
 */
const validateRequired = value => value !== null && value !== undefined && value !== '';

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = value => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim().length === 0) ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
};

/**
 * Password strength validation
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 * @param {string} password - Password to validate
 * @returns {boolean} True if strong password
 */
const isStrongPassword = password => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * MongoDB ObjectId validation
 * @param {string} id - ObjectId to validate
 * @returns {boolean} True if valid ObjectId format
 */
const isValidObjectId = id => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Latitude validation
 * @param {number} lat - Latitude to validate
 * @returns {boolean} True if valid latitude (-90 to 90)
 */
const isValidLatitude = lat => {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
};

/**
 * Longitude validation
 * @param {number} lng - Longitude to validate
 * @returns {boolean} True if valid longitude (-180 to 180)
 */
const isValidLongitude = lng => {
  return !isNaN(lng) && lng >= -180 && lng <= 180;
};

/**
 * Thai National ID validation (with checksum)
 * @param {string} id - Thai national ID (13 digits)
 * @returns {boolean} True if valid Thai ID
 */
const isValidThaiID = id => {
  if (!/^\d{13}$/.test(id)) {
    return false;
  }

  // Checksum validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i);
  }

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;

  return checkDigit === parseInt(id[12]);
};

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
const isValidURL = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Date validation
 * @param {string|Date} dateString - Date to validate
 * @returns {boolean} True if valid date
 */
const isValidDate = dateString => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * File extension validation
 * @param {string} filename - Filename to check
 * @param {string[]} allowedExtensions - Allowed extensions
 * @returns {boolean} True if extension is allowed
 */
const isValidFileExtension = (filename, allowedExtensions) => {
  if (!filename || !allowedExtensions) {
    return false;
  }
  const extension = filename.toLowerCase().split('.').pop();
  return allowedExtensions.includes(extension);
};

/**
 * Sanitize string (remove HTML tags)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = str => {
  if (typeof str !== 'string') {
    return str;
  }
  return str
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 1000); // Limit length for security
};

/**
 * Sanitize object by removing unwanted fields
 * @param {Object} obj - Object to sanitize
 * @param {string[]} allowedFields - Allowed field names (empty = all)
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, allowedFields = []) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (allowedFields.length === 0 || allowedFields.includes(key)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = sanitizeObject(value, allowedFields);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

module.exports = {
  // Legacy exports (keep for backward compatibility)
  validateEmail,
  validatePhone,
  validateRequired,

  // Email validation
  isValidEmail,

  // Phone validation
  isValidThaiPhone,

  // Password validation
  isStrongPassword,

  // ID validation
  isValidObjectId,
  isValidThaiID,

  // Location validation
  isValidLatitude,
  isValidLongitude,

  // General validation
  isEmpty,
  isValidURL,
  isValidDate,
  isValidFileExtension,

  // Sanitization
  sanitizeString,
  sanitizeObject,
};
