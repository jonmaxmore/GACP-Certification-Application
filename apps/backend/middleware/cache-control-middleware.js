/**
 * Cache Control Middleware for CDN/Browser Caching
 * 
 * Adds appropriate cache headers for different content types.
 * Works with Cloudflare, AWS CloudFront, or any CDN that respects standard Cache-Control headers.
 * 
 * Cache Strategies:
 * - Static assets (images, fonts, CSS, JS): Long-term cache (1 year) with immutable
 * - HTML/API responses: Short cache or no-cache
 * - User-specific data: No cache
 */

const path = require('path');

// Cache duration presets (in seconds)
const CACHE_PRESETS = {
    IMMUTABLE: 31536000,    // 1 year - for versioned assets (hash in filename)
    LONG: 86400,            // 1 day
    MEDIUM: 3600,           // 1 hour
    SHORT: 300,             // 5 minutes
    NO_CACHE: 0,
};

// File extension to cache preset mapping
const EXTENSION_CACHE_MAP = {
    // Immutable assets (usually have hash in filename)
    '.woff2': CACHE_PRESETS.IMMUTABLE,
    '.woff': CACHE_PRESETS.IMMUTABLE,
    '.ttf': CACHE_PRESETS.IMMUTABLE,
    '.eot': CACHE_PRESETS.IMMUTABLE,

    // Long cache (images)
    '.jpg': CACHE_PRESETS.LONG,
    '.jpeg': CACHE_PRESETS.LONG,
    '.png': CACHE_PRESETS.LONG,
    '.gif': CACHE_PRESETS.LONG,
    '.svg': CACHE_PRESETS.LONG,
    '.webp': CACHE_PRESETS.LONG,
    '.ico': CACHE_PRESETS.LONG,

    // Medium cache (styles, scripts)
    '.css': CACHE_PRESETS.MEDIUM,
    '.js': CACHE_PRESETS.MEDIUM,

    // Short cache (generated content)
    '.pdf': CACHE_PRESETS.SHORT,
    '.json': CACHE_PRESETS.SHORT,
};

/**
 * Static File Cache Middleware
 * Apply to express.static or upload endpoints
 */
function staticCacheMiddleware(req, res, next) {
    const ext = path.extname(req.path).toLowerCase();
    const maxAge = EXTENSION_CACHE_MAP[ext];

    if (maxAge !== undefined) {
        if (maxAge === CACHE_PRESETS.IMMUTABLE) {
            res.set('Cache-Control', `public, max-age=${maxAge}, immutable`);
        } else if (maxAge > 0) {
            res.set('Cache-Control', `public, max-age=${maxAge}`);
        } else {
            res.set('Cache-Control', 'no-store');
        }
    }

    next();
}

/**
 * API Response Cache Middleware
 * Use for specific endpoints that can be cached
 */
function apiCacheMiddleware(duration = CACHE_PRESETS.SHORT) {
    return (req, res, next) => {
        // Don't cache POST, PUT, DELETE
        if (req.method !== 'GET') {
            res.set('Cache-Control', 'no-store');
            return next();
        }

        // Set cache headers
        res.set('Cache-Control', `public, max-age=${duration}`);
        res.set('Vary', 'Accept-Encoding, Authorization');

        next();
    };
}

/**
 * No Cache Middleware
 * For user-specific or sensitive endpoints
 */
function noCacheMiddleware(req, res, next) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
}

/**
 * CDN URL Helper
 * Converts local file paths to CDN URLs when CDN is configured
 */
function getCdnUrl(localPath) {
    const cdnBaseUrl = process.env.CDN_BASE_URL;

    if (!cdnBaseUrl) {
        // No CDN configured, return local path
        return localPath;
    }

    // Convert local path to CDN URL
    // e.g., /uploads/images/photo.jpg -> https://cdn.example.com/uploads/images/photo.jpg
    return `${cdnBaseUrl}${localPath}`;
}

/**
 * Transform response to use CDN URLs
 * Apply to API responses that include file URLs
 */
function cdnTransformMiddleware(req, res, next) {
    const cdnBaseUrl = process.env.CDN_BASE_URL;

    if (!cdnBaseUrl) {
        return next();
    }

    // Override res.json to transform URLs
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        const transformed = transformUrls(body, cdnBaseUrl);
        return originalJson(transformed);
    };

    next();
}

/**
 * Recursively transform URLs in response body
 */
function transformUrls(obj, cdnBaseUrl) {
    if (typeof obj === 'string') {
        // Check if it's a local file URL
        if (obj.startsWith('/uploads/')) {
            return `${cdnBaseUrl}${obj}`;
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => transformUrls(item, cdnBaseUrl));
    }

    if (obj && typeof obj === 'object') {
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = transformUrls(obj[key], cdnBaseUrl);
        }
        return result;
    }

    return obj;
}

module.exports = {
    staticCacheMiddleware,
    apiCacheMiddleware,
    noCacheMiddleware,
    cdnTransformMiddleware,
    getCdnUrl,
    CACHE_PRESETS,
};

