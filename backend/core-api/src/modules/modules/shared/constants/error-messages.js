/**
 * Error Messages Constants
 */

module.exports = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_REQUIRED: 'Authentication token required',

  // Validation errors
  VALIDATION_FAILED: 'Validation failed',
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PASSWORD:
    'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  INVALID_PHONE: 'Invalid phone number format',

  // Resource errors
  NOT_FOUND: 'Resource not found',
  USER_NOT_FOUND: 'User not found',
  FARM_NOT_FOUND: 'Farm not found',
  APPLICATION_NOT_FOUND: 'Application not found',
  SURVEY_NOT_FOUND: 'Survey not found',

  // Duplicate errors
  EMAIL_EXISTS: 'Email already exists',
  FARM_EXISTS: 'Farm already exists',

  // Permission errors
  FORBIDDEN: 'You do not have permission to perform this action',
  ACCESS_DENIED: 'Access denied',

  // Server errors
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database error occurred',

  // Application errors
  APPLICATION_ALREADY_SUBMITTED: 'Application already submitted',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',

  // Farm errors
  INVALID_COORDINATES: 'Invalid GPS coordinates',
  INVALID_AREA: 'Invalid farm area',

  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
};
