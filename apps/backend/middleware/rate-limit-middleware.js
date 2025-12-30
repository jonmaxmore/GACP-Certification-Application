/**
 * Rate Limiting Middleware
 * Blueprint Pattern: Race Condition Prevention
 * 
 * Purpose: Prevent brute force attacks and duplicate submissions
 * - Limits requests per IP/User
 * - Implements sliding window algorithm
 */

const logger = require('../shared/logger');

// In-memory store (for single instance, use Redis for multi-instance)
const requestStore = new Map();

/**
 * Rate Limiter Configuration
 */
const RATE_LIMITS = {
    // Auth endpoints - increased for development, reduce in production
    'auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 50 },     // 50 per 15 min (dev)
    'auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 10 },  // 10 per hour
    'auth/forgot-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 },

    // Application endpoints
    'applications/draft': { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per min
    'applications/submit': { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 per 5 min

    // Default
    'default': { windowMs: 60 * 1000, maxRequests: 100 } // 100 per min
};

/**
 * Get client identifier (IP or User ID)
 */
function getClientId(req) {
    // Prefer user ID if authenticated
    if (req.user && req.user.id) {
        return `user:${req.user.id}`;
    }
    // Fallback to IP
    return `ip:${req.ip || req.headers['x-forwarded-for'] || 'unknown'}`;
}

/**
 * Get rate limit config for endpoint
 */
function getRateLimitConfig(path) {
    // Normalize path
    const normalizedPath = path.replace(/^\/api\/v\d+\//, '').replace(/\/[a-f0-9]{24}/g, '/:id');

    for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
        if (normalizedPath.includes(pattern)) {
            return config;
        }
    }
    return RATE_LIMITS['default'];
}

/**
 * Clean expired entries
 */
function cleanExpired() {
    const now = Date.now();
    for (const [key, data] of requestStore.entries()) {
        if (now > data.windowEnd) {
            requestStore.delete(key);
        }
    }
}

// Cleanup interval reference
let cleanupInterval = null;

/**
 * Start cleanup interval (call in production)
 */
function startCleanup() {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    if (!cleanupInterval) {
        cleanupInterval = setInterval(cleanExpired, 60 * 1000);
    }
}

/**
 * Stop cleanup interval
 */
function stopCleanup() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}

/**
 * Rate Limiting Middleware
 */
function rateLimiter(req, res, next) {
    const clientId = getClientId(req);
    const config = getRateLimitConfig(req.path);
    const key = `${clientId}:${req.path}`;
    const now = Date.now();

    // Get or create entry
    let entry = requestStore.get(key);

    if (!entry || now > entry.windowEnd) {
        // New window
        entry = {
            count: 1,
            windowStart: now,
            windowEnd: now + config.windowMs
        };
        requestStore.set(key, entry);
    } else {
        // Existing window
        entry.count++;
    }

    // Set headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', new Date(entry.windowEnd).toISOString());

    // Check limit
    if (entry.count > config.maxRequests) {
        logger.warn('[RateLimiter] Rate limit exceeded:', {
            clientId,
            path: req.path,
            count: entry.count,
            limit: config.maxRequests
        });

        return res.status(429).json({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'กรุณารอสักครู่ก่อนลองใหม่อีกครั้ง',
            retryAfter: Math.ceil((entry.windowEnd - now) / 1000)
        });
    }

    next();
}

/**
 * Strict rate limiter for sensitive endpoints
 * Bypassed in test/CI environment for E2E testing
 */
function strictRateLimiter(windowMs, maxRequests) {
    return (req, res, next) => {
        // Bypass rate limiting in test environment
        if (process.env.NODE_ENV === 'test' || process.env.CI === 'true') {
            return next();
        }

        const clientId = getClientId(req);
        const key = `strict:${clientId}:${req.path}`;
        const now = Date.now();

        let entry = requestStore.get(key);

        if (!entry || now > entry.windowEnd) {
            entry = { count: 1, windowEnd: now + windowMs };
            requestStore.set(key, entry);
        } else {
            entry.count++;
        }

        if (entry.count > maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'TOO_MANY_REQUESTS',
                message: 'คำขอมากเกินไป กรุณารอสักครู่',
                retryAfter: Math.ceil((entry.windowEnd - now) / 1000)
            });
        }

        next();
    };
}

module.exports = {
    rateLimiter,
    strictRateLimiter,
    RATE_LIMITS,
    startCleanup,
    stopCleanup
};


