/**
 * Request Validation Middleware
 *
 * Validates incoming requests against defined schemas to ensure
 * data integrity and consistency.
 */
const { AppError } = require('./error-middleware');
const logger = require('../shared/logger');
const validatorLogger = logger.createLogger('validator');

// Schema registry
const schemaRegistry = new Map();

/**
 * Register a validation schema for a specific route
 *
 * @param {string} route - The route path
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Object} schema - Joi schema for validation
 * @param {Object} options - Validation options
 */
function registerSchema(route, method, schema, options = {}) {
  const key = `${method.toUpperCase()}:${route}`;
  schemaRegistry.set(key, { schema, options });
  validatorLogger.debug(`Registered schema for ${key}`);
}

/**
 * Find a schema that matches the request path
 *
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @returns {Object|null} Matching schema or null
 */
function findMatchingSchema(path, method) {
  // First try exact match
  const exactKey = `${method.toUpperCase()}:${path}`;
  if (schemaRegistry.has(exactKey)) {
    return schemaRegistry.get(exactKey);
  }

  // Try pattern match for paths with parameters
  // This is a simplified implementation - a real one would use a path-matching library
  for (const [key, value] of schemaRegistry.entries()) {
    const [schemaMethod, schemaPath] = key.split(':');

    if (schemaMethod !== method.toUpperCase()) {
      continue;
    }

    // Convert route patterns to regex
    // e.g. /users/:id becomes /users/([^/]+)
    const patternRegex = new RegExp('^' + schemaPath.replace(/:[^/]+/g, '([^/]+)') + '$');

    if (patternRegex.test(path)) {
      return value;
    }
  }

  return null;
}

/**
 * Validate request body, query and params
 *
 * @param {Object} req - Express request object
 * @param {Object} schema - Joi schema
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
function validateRequest(req, schema, options = {}) {
  const validationErrors = {};

  // Validate body if schema.body exists and request has a body
  if (schema.body && Object.keys(req.body).length) {
    const { error, value } = schema.body.validate(req.body, options);
    if (error) {
      validationErrors.body = formatJoiError(error);
    } else {
      // Replace with validated and sanitized data
      req.body = value;
    }
  }

  // Validate query params
  if (schema.query && Object.keys(req.query).length) {
    const { error, value } = schema.query.validate(req.query, options);
    if (error) {
      validationErrors.query = formatJoiError(error);
    } else {
      req.query = value;
    }
  }

  // Validate URL params
  if (schema.params && Object.keys(req.params).length) {
    const { error, value } = schema.params.validate(req.params, options);
    if (error) {
      validationErrors.params = formatJoiError(error);
    } else {
      req.params = value;
    }
  }

  return {
    hasErrors: Object.keys(validationErrors).length > 0,
    errors: validationErrors,
  };
}

/**
 * Format Joi error into a more user-friendly structure
 */
function formatJoiError(error) {
  return error.details.map(detail => ({
    message: detail.message,
    path: detail.path,
    type: detail.type,
  }));
}

/**
 * Request validation middleware factory
 *
 * @param {Object} options - Global validation options
 * @returns {Function} Express middleware
 */
module.exports = function (options = {}) {
  const defaultOptions = {
    abortEarly: false,
    stripUnknown: true,
    ...options,
  };

  return function (req, res, next) {
    // Find schema for this route
    const matchedSchema = findMatchingSchema(req.path, req.method);

    // If no schema found, continue
    if (!matchedSchema) {
      return next();
    }

    const { schema, options: schemaOptions } = matchedSchema;
    const mergedOptions = { ...defaultOptions, ...schemaOptions };

    // Validate request
    const result = validateRequest(req, schema, mergedOptions);

    if (result.hasErrors) {
      validatorLogger.warn(`Validation failed for ${req.method} ${req.path}`, {
        errors: result.errors,
        requestId: req.id,
      });

      return next(AppError.validation('Request validation failed', result.errors));
    }

    next();
  };
};

// Export functions to register schemas
module.exports.registerSchema = registerSchema;
module.exports.schemaRegistry = schemaRegistry;
