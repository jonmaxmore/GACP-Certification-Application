/**
 * GACP Platform - Unified Utility Functions
 * Consolidates duplicate utilities found across the platform
 */

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Format date to Thai locale string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
function formatDateThai(date, options = {}) {
  if (!date) {
    return '';
  }

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Date(date).toLocaleDateString('th-TH', defaultOptions);
}

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} ISO date string
 */
function formatDateISO(date) {
  if (!date) {
    return '';
  }
  return new Date(date).toISOString();
}

/**
 * Get date difference in days
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
function getDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to date
 * @param {Date|string} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if date is expired
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if expired
 */
function isExpired(date) {
  return new Date(date) < new Date();
}

/**
 * Format relative time (ago)
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Relative time in Thai
 */
function formatRelativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'เมื่อสักครู่';
  }
  if (diffMins < 60) {
    return `${diffMins} นาทีที่แล้ว`;
  }
  if (diffHours < 24) {
    return `${diffHours} ชั่วโมงที่แล้ว`;
  }
  if (diffDays < 30) {
    return `${diffDays} วันที่แล้ว`;
  }

  return formatDateThai(date);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate Thai ID card number
 * @param {string} id - Thai ID to validate
 * @returns {boolean} True if valid
 */
function isValidThaiId(id) {
  if (!id || id.length !== 13) {
    return false;
  }

  const digits = id.split('').map(Number);
  const checksum = digits.slice(0, 12).reduce((sum, digit, index) => sum + digit * (13 - index), 0);

  return (11 - (checksum % 11)) % 10 === digits[12];
}

/**
 * Validate Thai phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidThaiPhone(phone) {
  if (!phone) {
    return false;
  }
  const cleaned = phone.replace(/[^0-9]/g, '');
  return /^(06|08|09)\d{8}$/.test(cleaned);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  if (!email) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if object is empty
 * @param {any} obj - Object to check
 * @returns {boolean} True if empty
 */
function isEmpty(obj) {
  if (obj === null || obj === undefined) {
    return true;
  }
  if (typeof obj === 'string') {
    return obj.trim().length === 0;
  }
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  return false;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-case string
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Convert to camelCase
 * @param {string} str - String to convert
 * @returns {string} CamelCase string
 */
function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
    )
    .replace(/\s+/g, '');
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicates from array
 * @param {Array} arr - Array to deduplicate
 * @param {string} key - Key for object deduplication
 * @returns {Array} Deduplicated array
 */
function removeDuplicates(arr, key = null) {
  if (!Array.isArray(arr)) {
    return [];
  }

  if (key) {
    const seen = new Set();
    return arr.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  }

  return [...new Set(arr)];
}

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
function chunkArray(arr, size) {
  if (!Array.isArray(arr) || size <= 0) {
    return [];
  }

  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
  return obj;
}

/**
 * Pick specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} Object with picked keys
 */
function pick(obj, keys) {
  if (!obj || !Array.isArray(keys)) {
    return {};
  }

  const result = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} Object without omitted keys
 */
function omit(obj, keys) {
  if (!obj) {
    return {};
  }

  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format currency (Thai Baht)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    return '฿0';
  }

  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (typeof num !== 'number') {
    return '0';
  }
  return num.toLocaleString('th-TH');
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Date utilities
  formatDateThai,
  formatDateISO,
  getDaysDifference,
  addDays,
  isExpired,
  formatRelativeTime,

  // Validation utilities
  isValidThaiId,
  isValidThaiPhone,
  isValidEmail,
  isEmpty,

  // String utilities
  capitalize,
  toKebabCase,
  toCamelCase,
  generateRandomString,

  // Array utilities
  removeDuplicates,
  chunkArray,

  // Object utilities
  deepClone,
  pick,
  omit,

  // Formatting utilities
  formatFileSize,
  formatCurrency,
  formatNumber,

  // Performance utilities
  debounce,
  throttle,
};
