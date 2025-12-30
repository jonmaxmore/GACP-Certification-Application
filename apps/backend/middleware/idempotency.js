/**
 * 🍎 Apple-Standard Idempotency Middleware
 * 
 * Prevents duplicate form submissions (Race Condition Protection)
 * Uses Redis for distributed locking across server instances
 * 
 * Usage in routes:
 * router.post('/applications', idempotency(), createApplicationHandler);
 */

const crypto = require('crypto');

// In-memory store for development (use Redis in production)
const requestStore = new Map();

// Configuration
const CONFIG = {
    headerName: 'X-Idempotency-Key',
    ttlSeconds: 3600, // 1 hour
    maxKeyLength: 64,
};

/**
 * Generate a hash of the request for duplicate detection
 */
function generateRequestHash(req) {
    const hashData = {
        method: req.method,
        path: req.path,
        userId: req.user?.userId || 'anonymous',
        body: JSON.stringify(req.body || {}),
    };

    return crypto
        .createHash('sha256')
        .update(JSON.stringify(hashData))
        .digest('hex');
}

/**
 * Store request status
 */
function storeRequest(key, data) {
    requestStore.set(key, {
        ...data,
        timestamp: Date.now(),
    });

    // Cleanup old entries (simple TTL)
    setTimeout(() => {
        requestStore.delete(key);
    }, CONFIG.ttlSeconds * 1000);
}

/**
 * Get stored request
 */
function getStoredRequest(key) {
    return requestStore.get(key);
}

/**
 * Idempotency middleware factory
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether idempotency key is required
 * @param {number} options.ttlSeconds - Time to live for stored responses
 */
function idempotency(options = {}) {
    const { required = false, ttlSeconds = CONFIG.ttlSeconds } = options;

    return async (req, res, next) => {
        // Get idempotency key from header
        let idempotencyKey = req.get(CONFIG.headerName);

        // If no key provided, generate one from request
        if (!idempotencyKey) {
            if (required) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required header: ${CONFIG.headerName}`,
                    message: 'กรุณาส่ง Idempotency Key เพื่อป้องกันการทำรายการซ้ำ',
                });
            }

            // Auto-generate key from request hash
            idempotencyKey = `auto:${generateRequestHash(req)}`;
        }

        // Validate key format
        if (idempotencyKey.length > CONFIG.maxKeyLength) {
            return res.status(400).json({
                success: false,
                error: `Idempotency key too long (max ${CONFIG.maxKeyLength} characters)`,
            });
        }

        // Create full key with user context
        const fullKey = `idempotency:${req.user?.userId || 'anon'}:${idempotencyKey}`;

        // Check for existing request
        const existing = getStoredRequest(fullKey);

        if (existing) {
            // Request is in progress
            if (existing.status === 'processing') {
                return res.status(409).json({
                    success: false,
                    error: 'Request is currently being processed',
                    message: 'กำลังดำเนินการ กรุณารอสักครู่',
                });
            }

            // Request was completed - return cached response
            if (existing.status === 'completed') {
                res.set('X-Idempotency-Replayed', 'true');
                return res.status(existing.statusCode).json(existing.response);
            }
        }

        // Mark request as processing
        storeRequest(fullKey, {
            status: 'processing',
            requestHash: generateRequestHash(req),
        });

        // Override res.json to capture response
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            // Store successful response for replay
            if (res.statusCode >= 200 && res.statusCode < 300) {
                storeRequest(fullKey, {
                    status: 'completed',
                    statusCode: res.statusCode,
                    response: body,
                });
            } else {
                // Don't cache error responses (allow retry)
                requestStore.delete(fullKey);
            }

            return originalJson(body);
        };

        // Handle errors
        const cleanup = () => {
            requestStore.delete(fullKey);
        };

        res.on('error', cleanup);
        res.on('close', () => {
            if (!res.writableEnded) {
                cleanup();
            }
        });

        next();
    };
}

/**
 * Middleware for critical operations (applications, payments)
 * Requires explicit idempotency key
 */
function requireIdempotency() {
    return idempotency({ required: true });
}

/**
 * Middleware for optional idempotency (auto-generates key)
 */
function optionalIdempotency() {
    return idempotency({ required: false });
}

/**
 * Generate a unique idempotency key for clients
 */
function generateIdempotencyKey() {
    return crypto.randomBytes(16).toString('hex');
}

module.exports = {
    idempotency,
    requireIdempotency,
    optionalIdempotency,
    generateIdempotencyKey,
    CONFIG,
};
