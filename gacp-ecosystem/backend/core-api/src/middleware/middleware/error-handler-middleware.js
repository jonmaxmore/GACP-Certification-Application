

/**
 * Enhanced error codes for GACP Standards Comparison system
 */
const ERROR_CODES = {
  // Authentication & Authorization
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  ACCESS_TOKEN_REQUIRED: 'ACCESS_TOKEN_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_VALIDATION_FAILED: 'TOKEN_VALIDATION_FAILED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',

  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Business Logic Errors
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  LOGIN_FAILED: 'LOGIN_FAILED',
  STANDARDS_COMPARISON_FAILED: 'STANDARDS_COMPARISON_FAILED',
  ASSESSMENT_CREATION_FAILED: 'ASSESSMENT_CREATION_FAILED',
  REPORT_GENERATION_FAILED: 'REPORT_GENERATION_FAILED',

  // System Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // File & Security Errors
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
};

/**
 * Thai translations for error messages
 */
const ERROR_MESSAGES_TH = {
  [ERROR_CODES.AUTHENTICATION_REQUIRED]: 'จำเป็นต้องเข้าสู่ระบบ',
  [ERROR_CODES.ACCESS_TOKEN_REQUIRED]: 'กรุณาเข้าสู่ระบบ',
  [ERROR_CODES.INVALID_TOKEN]: 'โทเค่นไม่ถูกต้องหรือหมดอายุ',
  [ERROR_CODES.TOKEN_EXPIRED]: 'โทเค่นหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  [ERROR_CODES.TOKEN_VALIDATION_FAILED]: 'การตรวจสอบโทเค่นล้มเหลว',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'สิทธิ์ไม่เพียงพอ',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'บัญชีถูกล็อค',
  [ERROR_CODES.ACCOUNT_DISABLED]: 'บัญชีถูกปิดใช้งาน',

  [ERROR_CODES.VALIDATION_ERROR]: 'ข้อมูลไม่ถูกต้อง',
  [ERROR_CODES.REQUIRED_FIELD_MISSING]: 'กรุณากรอกข้อมูลที่จำเป็น',
  [ERROR_CODES.INVALID_FORMAT]: 'รูปแบบข้อมูลไม่ถูกต้อง',
  [ERROR_CODES.INVALID_EMAIL]: 'รูปแบบอีเมลไม่ถูกต้อง',
  [ERROR_CODES.INVALID_PASSWORD]: 'รหัสผ่านไม่ถูกต้อง',

  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'ไม่พบข้อมูลที่ต้องการ',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'ข้อมูลนี้มีอยู่แล้ว',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'ข้อมูลขัดแย้งกัน',

  [ERROR_CODES.REGISTRATION_FAILED]: 'การสมัครสมาชิกล้มเหลว',
  [ERROR_CODES.LOGIN_FAILED]: 'การเข้าสู่ระบบล้มเหลว',
  [ERROR_CODES.APPLICATION_SUBMISSION_FAILED]: 'การส่งใบสมัครล้มเหลว',
  [ERROR_CODES.DOCUMENT_UPLOAD_FAILED]: 'การอัพโหลดเอกสารล้มเหลว',
  [ERROR_CODES.CERTIFICATION_ERROR]: 'เกิดข้อผิดพลาดในกระบวนการออกใบรับรอง',

  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'เกิดข้อผิดพลาดภายในระบบ',
  [ERROR_CODES.DATABASE_ERROR]: 'เกิดข้อผิดพลาดกับฐานข้อมูล',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'บริการไม่พร้อมใช้งานในขณะนี้',
  [ERROR_CODES.NETWORK_ERROR]: 'เกิดข้อผิดพลาดเครือข่าย',
  [ERROR_CODES.WEBHOOK_PROCESSING_FAILED]: 'การประมวลผล webhook ล้มเหลว',

  [ERROR_CODES.PAYMENT_PROCESSING_FAILED]: 'การชำระเงินล้มเหลว',
  [ERROR_CODES.EMAIL_DELIVERY_FAILED]: 'การส่งอีเมลล้มเหลว',
  [ERROR_CODES.SMS_DELIVERY_FAILED]: 'การส่ง SMS ล้มเหลว',
};

/**
 * Create standardized error response
 * @param {string} errorCode - Error code from ERROR_CODES
 * @param {string} message - English error message
 * @param {Object} details - Additional error details
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Standardized error response
 */
const createErrorResponse = (errorCode, message, details = null, statusCode = 500) => {
  return {
    success: false,
    error: errorCode,
    message: message,
    messageThTh: ERROR_MESSAGES_TH[errorCode] || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    details: details,
    timestamp: new Date().toISOString(),
    statusCode: statusCode,
  };
};

const logger = require('../shared/logger');

/**
 * Express error handler middleware
 */
const errorHandler = (err, req, res, _next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    errorCode: err.errorCode,
  });

  // Handle AppError instances
  if (err.isOperational) {
    const errorResponse = createErrorResponse(
      err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR,
      err.message,
      err.details || null,
      err.statusCode || 500
    );
    return res.status(err.statusCode || 500).json(errorResponse);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.VALIDATION_ERROR,
      'Validation failed',
      err.errors,
      400,
    );
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.DATABASE_ERROR,
      'Database operation failed',
      process.env.NODE_ENV === 'development' ? err.message : null,
      500,
    );
    return res.status(500).json(errorResponse);
  }

  if (err.name === 'JsonWebTokenError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.INVALID_TOKEN,
      'Invalid token',
      null,
      401,
    );
    return res.status(401).json(errorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    const errorResponse = createErrorResponse(
      ERROR_CODES.TOKEN_EXPIRED,
      'Token expired',
      null,
      401,
    );
    return res.status(401).json(errorResponse);
  }

  // Default internal server error
  const errorResponse = createErrorResponse(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    'Internal server error',
    process.env.NODE_ENV === 'development' ? err.message : null,
    500,
  );

  res.status(500).json(errorResponse);
};

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res) => {
  const errorResponse = createErrorResponse(
    ERROR_CODES.RESOURCE_NOT_FOUND,
    'Endpoint not found',
    { endpoint: req.path, method: req.method },
    404,
  );
  res.status(404).json(errorResponse);
};

/**
 * Helper function to send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message: message,
    data: data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Helper function to send error response
 * @param {Object} res - Express response object
 * @param {string} errorCode - Error code from ERROR_CODES
 * @param {string} message - Error message
 * @param {Object} details - Additional details
 * @param {number} statusCode - HTTP status code
 */
const sendError = (res, errorCode, message, details = null, statusCode = 500) => {
  const errorResponse = createErrorResponse(errorCode, message, details, statusCode);
  res.status(statusCode).json(errorResponse);
};

/**
 * Async handler wrapper to catch async errors
 * @param {Function} fn - Async function to wrap
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES_TH,
  createErrorResponse,
  errorHandler,
  notFoundHandler,
  sendSuccess,
  sendError,
  asyncHandler,
  handleAsync: asyncHandler, // Alias for backward compatibility
};
