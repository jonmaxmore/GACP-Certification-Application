/**
 * Authentication Rate Limiters
 *
 * Specialized rate limiting configurations for authentication endpoints.
 * Implements tiered rate limiting based on endpoint sensitivity.
 *
 * Rate Limit Strategy:
 * - Login: Strict (5 attempts per 15 min per IP)
 * - Token Refresh: Moderate (10 per min)
 * - Password Reset: Very Strict (3 per hour)
 * - Registration: Strict (5 per hour)
 * - Profile Updates: Moderate (20 per 15 min)
 *
 * Features:
 * - IP-based tracking
 * - Redis-backed store for distributed systems
 * - Custom error messages
 * - Skip successful requests option
 * - Headers with retry information
 *
 * @module middleware/auth-rate-limiters
 * @author GACP Platform Team
 * @date 2025-10-26
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const logger = require('../shared/logger');

/**
 * Create Redis store for rate limiting (if Redis is available)
 * Falls back to memory store if Redis is unavailable
 */
function createStore(redisClient, prefix) {
  if (!redisClient || !redisClient.isReady) {
    logger.warn('[RateLimiter] Redis not available, using memory store');
    return undefined; // Use default memory store
  }

  try {
    return new RedisStore({
      client: redisClient,
      prefix: `rate-limit:${prefix}:`,
      sendCommand: (...args) => redisClient.sendCommand(args),
    });
  } catch (error) {
    logger.error('[RateLimiter] Failed to create Redis store:', error);
    return undefined;
  }
}

/**
 * Standard rate limit handler
 */
const standardHandler = (req, res) => {
  res.status(429).json({
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
    retryAfter: res.getHeader('Retry-After'),
  });
};

/**
 * Key generator based on IP address
 */
const ipKeyGenerator = req => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Skip successful requests (only count failed attempts)
 */
const _skipSuccessfulRequests = (req, res) => {
  return res.statusCode < 400;
};

/**
 * Create rate limiters for authentication endpoints
 * @param {Object} redisClient - Redis client instance (optional)
 * @returns {Object} Rate limiter middleware functions
 */
function createAuthRateLimiters(redisClient = null) {
  // Login endpoint - Very strict (5 attempts per 15 minutes)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'login'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
    _skipSuccessfulRequests: true, // Only count failed login attempts
  });

  // Token refresh - Moderate (10 requests per minute)
  const refreshLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many token refresh requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'refresh'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  // Password reset request - Very strict (3 requests per hour)
  const passwordResetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many password reset requests, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'password-reset-request'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  // Password reset confirmation - Strict (5 attempts per 15 minutes)
  const passwordResetConfirmLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many password reset attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'password-reset-confirm'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
    _skipSuccessfulRequests: true,
  });

  // Password change - Moderate (10 requests per 15 minutes)
  const passwordChangeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many password change requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'password-change'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  // Registration - Strict (5 registrations per hour per IP)
  const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many registration attempts from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'registration'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  // Profile updates - Moderate (20 requests per 15 minutes)
  const profileUpdateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: 'Too many profile update requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'profile-update'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  // General auth endpoints - Normal (100 requests per 15 minutes)
  const generalAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'auth-general'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  // Email verification - Strict (5 requests per hour)
  const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many email verification requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'email-verification'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  // Account recovery - Very strict (3 requests per day)
  const accountRecoveryLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3,
    message: 'Too many account recovery requests, please contact support',
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(redisClient, 'account-recovery'),
    keyGenerator: ipKeyGenerator,
    handler: standardHandler,
  });

  logger.info('[AuthRateLimiters] Initialized with', {
    store: redisClient ? 'Redis' : 'Memory',
    endpoints: [
      'login (5/15min)',
      'refresh (10/min)',
      'password-reset-request (3/hour)',
      'password-reset-confirm (5/15min)',
      'password-change (10/15min)',
      'registration (5/hour)',
      'profile-update (20/15min)',
      'general (100/15min)',
      'email-verification (5/hour)',
      'account-recovery (3/day)',
    ],
  });

  return {
    loginLimiter,
    refreshLimiter,
    passwordResetRequestLimiter,
    passwordResetConfirmLimiter,
    passwordChangeLimiter,
    registrationLimiter,
    profileUpdateLimiter,
    generalAuthLimiter,
    emailVerificationLimiter,
    accountRecoveryLimiter,
  };
}

module.exports = {
  createAuthRateLimiters,
};
