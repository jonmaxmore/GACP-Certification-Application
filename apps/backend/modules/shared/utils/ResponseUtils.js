/**
 * Response Utility Functions
 * Standard response format for all API endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Object} errors - Validation errors (optional)
 */
const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, errors);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {String} resource - Resource name
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {String} message - Custom message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response
 * @param {Object} res - Express response object
 * @param {String} message - Custom message
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 */
const paginatedResponse = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  paginatedResponse,

  // Aliases for backward compatibility
  success: successResponse,
  error: errorResponse,
  validationError: validationErrorResponse,
  notFound: notFoundResponse,
  unauthorized: unauthorizedResponse,
  forbidden: forbiddenResponse,
  paginated: paginatedResponse,
};
