/**
 * Enhanced CORS Configuration
 *
 * Provides strict origin validation, dynamic origin checking,
 * and secure credential handling for production environments.
 *
 * Features:
 * - Whitelist-based origin validation
 * - Pattern matching for dynamic subdomains
 * - Strict pre-flight caching
 * - Credential handling security
 * - Origin logging and monitoring
 *
 * @module middleware/cors-config
 * @author GACP Platform Team
 * @date 2025-10-26
 */

const logger = require('../shared/logger');

/**
 * Production allowed origins (strict whitelist)
 */
const PRODUCTION_ORIGINS = [
  'https://gacp.go.th',
  'https://www.gacp.go.th',
  'https://farmer.gacp.go.th',
  'https://admin.gacp.go.th',
  'https://certificate.gacp.go.th',
  'https://inspector.gacp.go.th',
  'https://reviewer.gacp.go.th',
];

/**
 * Development allowed origins
 */
const DEVELOPMENT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:5000',
];

/**
 * Pattern matching for dynamic origins (use with caution)
 */
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/.*\.gacp\.go\.th$/, // Any subdomain of gacp.go.th
  /^https:\/\/gacp-.*\.vercel\.app$/, // Vercel preview deployments
];

/**
 * Check if origin is allowed
 * @param {string} origin - Request origin
 * @param {Array} allowedOrigins - Whitelist of allowed origins
 * @returns {boolean}
 */
function isOriginAllowed(origin, allowedOrigins, allowedPatterns = []) {
  if (!origin) {
    return false;
  }

  // Check exact match in whitelist
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check pattern matches
  return allowedPatterns.some(pattern => pattern.test(origin));
}

/**
 * Create enhanced CORS options
 * @param {Object} options - Configuration options
 * @returns {Object} CORS configuration
 */
function createCorsOptions(options = {}) {
  const {
    environment = process.env.NODE_ENV || 'development',
    customOrigins = [],
    allowPatterns = true,
    logRejected = true,
  } = options;

  // Determine allowed origins based on environment
  let allowedOrigins;
  if (environment === 'production') {
    allowedOrigins = [...PRODUCTION_ORIGINS, ...customOrigins];
  } else {
    allowedOrigins = [...DEVELOPMENT_ORIGINS, ...PRODUCTION_ORIGINS, ...customOrigins];
  }

  // Allowed patterns (only in non-production or if explicitly enabled)
  const allowedPatterns =
    environment !== 'production' || allowPatterns ? ALLOWED_ORIGIN_PATTERNS : [];

  return {
    /**
     * Dynamic origin validation
     */
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      const allowed = isOriginAllowed(origin, allowedOrigins, allowedPatterns);

      if (allowed) {
        callback(null, true);
      } else {
        if (logRejected) {
          logger.warn('[CORS] Blocked request from unauthorized origin:', {
            origin,
            environment,
            timestamp: new Date(),
          });
        }

        // In production, strictly reject
        if (environment === 'production') {
          callback(new Error('Not allowed by CORS policy'));
        } else {
          // In development, log warning but allow (for easier testing)
          logger.warn('[CORS] [DEV] Allowing unauthorized origin for development');
          callback(null, true);
        }
      }
    },

    /**
     * Allowed HTTP methods
     */
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

    /**
     * Allowed request headers
     */
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Request-Id',
      'X-Client-Version',
    ],

    /**
     * Exposed response headers
     */
    exposedHeaders: [
      'Content-Length',
      'Content-Type',
      'X-Request-Id',
      'X-Response-Time',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],

    /**
     * Enable credentials (cookies, authorization headers)
     * IMPORTANT: When credentials is true, origin cannot be '*'
     */
    credentials: true,

    /**
     * Pre-flight request caching (in seconds)
     * Browsers will cache preflight responses for this duration
     */
    maxAge: 86400, // 24 hours

    /**
     * Pass preflight requests to next handler
     * Set to false to handle OPTIONS internally
     */
    preflightContinue: false,

    /**
     * Provide successful OPTIONS response status
     */
    optionsSuccessStatus: 204,
  };
}

/**
 * CORS logging middleware
 * Logs CORS-related request information
 */
function corsLoggingMiddleware() {
  return (req, res, next) => {
    const origin = req.get('origin');

    if (origin) {
      // Log CORS requests in production for monitoring
      if (process.env.NODE_ENV === 'production') {
        logger.debug('[CORS] Request from origin:', {
          origin,
          method: req.method,
          path: req.path,
          ip: req.ip,
        });
      }
    }

    next();
  };
}

/**
 * Get allowed origins for current environment
 * @returns {Array} List of allowed origins
 */
function getAllowedOrigins() {
  const environment = process.env.NODE_ENV || 'development';

  if (environment === 'production') {
    return PRODUCTION_ORIGINS;
  }

  return [...DEVELOPMENT_ORIGINS, ...PRODUCTION_ORIGINS];
}

module.exports = {
  createCorsOptions,
  corsLoggingMiddleware,
  getAllowedOrigins,
  isOriginAllowed,
  PRODUCTION_ORIGINS,
  DEVELOPMENT_ORIGINS,
  ALLOWED_ORIGIN_PATTERNS,
};
