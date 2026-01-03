/**
 * Security Rate Limiting Middleware
 * Prevents brute force attacks on authentication endpoints
 */

const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max requests per window
 * @param {string} options.message - Error message
 */
function createRateLimiter(options = {}) {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes default
        max = 5, // 5 attempts default
        message = 'Too many attempts, please try again later',
    } = options;

    return (req, res, next) => {
        // Use IP + endpoint as key for granular limiting
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const key = `${ip}:${req.path}`;
        const now = Date.now();

        let record = rateLimitStore.get(key);

        if (!record || now > record.resetTime) {
            // Create new record
            record = {
                count: 1,
                resetTime: now + windowMs,
            };
            rateLimitStore.set(key, record);
        } else {
            // Increment count
            record.count++;
        }

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

        // Check if exceeded
        if (record.count > max) {
            console.warn(`[SECURITY] Rate limit exceeded for ${ip} on ${req.path}`);
            return res.status(429).json({
                success: false,
                error: 'Too Many Requests',
                message,
                retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
            });
        }

        next();
    };
}

// Pre-configured limiters
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts
    message: 'Too many login attempts, please try again in 15 minutes',
});

const registrationLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: 'Too many registration attempts, please try again later',
});

const apiLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'API rate limit exceeded',
});

module.exports = {
    createRateLimiter,
    authLimiter,
    registrationLimiter,
    apiLimiter,
};
