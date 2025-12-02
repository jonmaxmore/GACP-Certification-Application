/**
 * Error Handling Middleware
 *
 * Centralized error handling with standardized formatting
 * and intelligent error classification.
 */
const logger = require('../shared/logger');
const metrics = require('../shared/metrics');
const errorLogger = logger.createLogger('error');
const configManager = require('../config/config-manager');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, code, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
  }

  static badRequest(message, code = 'BAD_REQUEST', details = {}) {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message = 'Unauthorized access', code = 'UNAUTHORIZED', details = {}) {
    return new AppError(message, 401, code, details);
  }

  static forbidden(message = 'Access forbidden', code = 'FORBIDDEN', details = {}) {
    return new AppError(message, 403, code, details);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND', details = {}) {
    return new AppError(message, 404, code, details);
  }

  static conflict(message, code = 'CONFLICT', details = {}) {
    return new AppError(message, 409, code, details);
  }

  static validation(message = 'Validation error', details = {}) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR', details = {}) {
    return new AppError(message, 500, code, details);
  }
}

/**
 * Error middleware factory function
 */
module.exports = function () {
  return (err, req, res, _next) => {
    // Default to 500 if statusCode not set
    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_ERROR';

    // Log error details
    const errorContext = {
      url: req.originalUrl,
      method: req.method,
      statusCode,
      errorCode,
      requestId: req.id,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    // Log based on error severity
    if (statusCode >= 500) {
      errorLogger.error(`${statusCode} ${errorCode}: ${err.message}`, {
        ...errorContext,
        stack: err.stack,
      });

      // Record metrics
      metrics.recordError('server', err);
    } else if (statusCode >= 400) {
      errorLogger.warn(`${statusCode} ${errorCode}: ${err.message}`, errorContext);

      // Record client error metrics
      if (statusCode === 401 || statusCode === 403) {
        metrics.recordError('auth', err);
      } else {
        metrics.recordError('client', err);
      }
    }

    // Send response
    const config = configManager.getConfig();
    res.status(statusCode).json({
      status: 'error',
      message: err.message,
      code: errorCode,
      requestId: req.id,
      details: statusCode < 500 ? err.details : undefined,
      stack: config.app.environment === 'development' && statusCode >= 500 ? err.stack : undefined,
    });
  };
};

// Export the AppError class for use throughout the application
module.exports.AppError = AppError;
