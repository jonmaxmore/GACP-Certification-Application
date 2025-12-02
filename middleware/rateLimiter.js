/**
 * ================================================================
 * RATE LIMITING MIDDLEWARE
 * ================================================================
 *
 * ที่มาที่ไป (WHY):
 * - ป้องกัน brute force attacks บน authentication endpoints
 * - ป้องกัน DoS (Denial of Service) attacks
 * - จำกัดการใช้งาน API ให้เป็นธรรม
 * - รักษา server resources
 *
 * Logic การทำงาน (HOW):
 * - ใช้ express-rate-limit ติดตาม requests ต่อ IP address
 * - แบ่ง rate limits ตาม endpoint types:
 *   1. AUTH (Login/Register): เข้มงวดที่สุด - 5 requests/15min
 *   2. API (General): ปานกลาง - 100 requests/15min
 *   3. PUBLIC (No auth): ยืดหยุ่น - 200 requests/15min
 *
 * Workflow:
 * Request → Check IP + Endpoint Type → Count Requests →
 *   ├─ Within Limit → Allow + Increment Counter
 *   └─ Exceed Limit → Block + Return 429 (Too Many Requests)
 *
 * ผลลัพธ์ (RESULT):
 * - Attacker ไม่สามารถ brute force login ได้
 * - System stability ดีขึ้นเพราะจำกัด traffic
 * - User ปกติไม่ได้รับผลกระทบ (limits สูงพอ)
 *
 * ================================================================
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

/**
 * สร้าง Redis client สำหรับ rate limiting
 * (ถ้าไม่มี Redis จะใช้ memory store แทน)
 */
function createRedisClient() {
  if (process.env.REDIS_HOST && process.env.REDIS_ENABLED !== 'false') {
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryStrategy: times => {
          if (times > 3) {
            console.warn(
              '⚠️  Redis connection failed - falling back to memory store for rate limiting'
            );
            return null; // Stop retrying
          }
          return Math.min(times * 100, 3000);
        }
      });

      redis.on('connect', () => {
        console.log('✅ Redis connected for rate limiting');
      });

      redis.on('error', err => {
        console.warn('⚠️  Redis error:', err.message);
      });

      return redis;
    } catch (error) {
      console.warn('⚠️  Failed to create Redis client:', error.message);
      return null;
    }
  }

  return null;
}

const redisClient = createRedisClient();

/**
 * สร้าง rate limiter configuration
 *
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // 100 requests default
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = undefined,
    handler = undefined
  } = options;

  const config = {
    windowMs,
    max,
    message: {
      success: false,
      error: 'TooManyRequests',
      message,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000) // seconds
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skipSuccessfulRequests,
    skipFailedRequests
  };

  // ใช้ Redis store ถ้ามี
  if (redisClient) {
    config.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    });
  }

  // Custom key generator ถ้ามี
  if (keyGenerator) {
    config.keyGenerator = keyGenerator;
  }

  // Custom handler ถ้ามี
  if (handler) {
    config.handler = handler;
  }

  return rateLimit(config);
}

/**
 * ================================================================
 * AUTHENTICATION RATE LIMITER
 * ================================================================
 *
 * เข้มงวดที่สุด - ป้องกัน brute force attacks
 *
 * Logic:
 * - จำกัด 5 requests ต่อ IP ภายใน 15 นาที
 * - นับเฉพาะ failed requests (skipSuccessfulRequests: true)
 * - ถ้า login สำเร็จ ไม่นับรวม
 * - ถ้า login ไม่สำเร็จ 5 ครั้ง → block 15 นาที
 *
 * Use case:
 * - POST /api/auth/login
 * - POST /api/auth/dtam/login
 * - POST /api/auth/register
 * - POST /api/auth/forgot-password
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'TooManyRequests',
      message: 'Too many authentication attempts',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: 900, // 15 minutes in seconds
      hint: 'Please wait 15 minutes before trying again'
    });
  }
});

/**
 * ================================================================
 * API RATE LIMITER
 * ================================================================
 *
 * ปานกลาง - สำหรับ general API endpoints
 *
 * Logic:
 * - จำกัด 100 requests ต่อ IP ภายใน 15 นาที
 * - นับทุก requests ไม่ว่าจะสำเร็จหรือไม่
 * - เหมาะสำหรับ authenticated endpoints
 *
 * Use case:
 * - GET /api/applications
 * - POST /api/applications
 * - PUT /api/applications/:id
 * - DELETE /api/applications/:id
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many API requests. Please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'TooManyRequests',
      message: 'API rate limit exceeded',
      code: 'API_RATE_LIMIT_EXCEEDED',
      retryAfter: 900, // 15 minutes in seconds
      limit: 100,
      window: '15 minutes'
    });
  }
});

/**
 * ================================================================
 * PUBLIC RATE LIMITER
 * ================================================================
 *
 * ยืดหยุ่นที่สุด - สำหรับ public endpoints
 *
 * Logic:
 * - จำกัด 200 requests ต่อ IP ภายใน 15 นาที
 * - เหมาะสำหรับ read-only public data
 *
 * Use case:
 * - GET /api/public/surveys
 * - GET /api/public/standards
 * - GET /api/public/track-trace/:qrCode
 */
const publicRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests
  message: 'Too many requests. Please try again later.'
});

/**
 * ================================================================
 * STRICT RATE LIMITER
 * ================================================================
 *
 * เข้มงวดมาก - สำหรับ sensitive operations
 *
 * Logic:
 * - จำกัด 10 requests ต่อ IP ภายใน 1 ชั่วโมง
 * - สำหรับ operations ที่มีค่าใช้จ่ายสูง
 *
 * Use case:
 * - POST /api/payment/process
 * - POST /api/certificate/generate
 * - POST /api/admin/bulk-update
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests
  message: 'This operation has strict rate limiting. Please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'TooManyRequests',
      message: 'Strict rate limit exceeded for sensitive operation',
      code: 'STRICT_RATE_LIMIT_EXCEEDED',
      retryAfter: 3600, // 1 hour in seconds
      hint: 'This operation is limited to 10 requests per hour'
    });
  }
});

/**
 * ================================================================
 * DYNAMIC RATE LIMITER
 * ================================================================
 *
 * ปรับได้ตาม user role
 *
 * Logic:
 * - DTAM staff: สูงกว่า
 * - Normal users: ปานกลาง
 * - Anonymous: ต่ำสุด
 */
function dynamicRateLimiter(req, res, next) {
  let max = 50; // Default for anonymous

  if (req.user) {
    if (req.user.role === 'ADMIN' || req.user.role === 'DTAM_STAFF') {
      max = 500; // Higher limit for staff
    } else {
      max = 200; // Normal authenticated users
    }
  }

  const limiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max,
    message: `Rate limit exceeded. Your limit is ${max} requests per 15 minutes.`
  });

  return limiter(req, res, next);
}

/**
 * ================================================================
 * MONITORING & LOGGING
 * ================================================================
 */

/**
 * Log rate limit hits (สำหรับ monitoring)
 */
function logRateLimitHit(req, identifier) {
  console.warn('[RATE_LIMIT]', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    identifier,
    timestamp: new Date().toISOString(),
    userAgent: req.get('user-agent')
  });
}

/**
 * Rate limit event handler (แนบเข้ากับ rate limiters)
 */
function attachRateLimitLogger(limiter, identifier) {
  return (req, res, next) => {
    limiter(req, res, err => {
      if (res.statusCode === 429) {
        logRateLimitHit(req, identifier);
      }
      if (err) return next(err);
      next();
    });
  };
}

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  publicRateLimiter,
  strictRateLimiter,
  dynamicRateLimiter,
  createRateLimiter,
  logRateLimitHit,
  attachRateLimitLogger
};
