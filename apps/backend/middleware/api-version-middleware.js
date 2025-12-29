/**
 * API Version Middleware
 * 
 * Adds version headers to all API responses and checks client compatibility.
 * Similar to Facebook/Instagram API versioning patterns.
 * 
 * Headers Added:
 * - X-API-Version: Current server API version
 * - X-Min-Client-Version: Minimum supported client version
 * - X-Deprecated: If current endpoint version is deprecated
 * 
 * Client Headers Expected:
 * - X-Client-Version: Client app version (optional)
 * - X-Client-Platform: ios/android/web (optional)
 */

const { createLogger } = require('../shared/logger');
const logger = createLogger('api-version');

// Current API configuration
const API_VERSION_CONFIG = {
    currentVersion: '2.1.0',
    minClientVersion: '1.0.0',
    deprecatedEndpoints: [
        // { path: '/api/v1/auth/login', deprecatedSince: '2.0.0', removalDate: '2025-06-01' }
    ],
};

/**
 * Compare semantic versions
 * @returns -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        if ((partsA[i] || 0) < (partsB[i] || 0)) return -1;
        if ((partsA[i] || 0) > (partsB[i] || 0)) return 1;
    }
    return 0;
}

/**
 * API Version Middleware
 */
function apiVersionMiddleware(req, res, next) {
    // 1. Add version headers to response
    res.set('X-API-Version', API_VERSION_CONFIG.currentVersion);
    res.set('X-Min-Client-Version', API_VERSION_CONFIG.minClientVersion);

    // 2. Check for deprecated endpoint
    const requestPath = req.originalUrl || req.url;
    const deprecated = API_VERSION_CONFIG.deprecatedEndpoints.find(
        ep => requestPath.startsWith(ep.path)
    );

    if (deprecated) {
        res.set('X-Deprecated', 'true');
        res.set('X-Deprecated-Since', deprecated.deprecatedSince);
        res.set('X-Removal-Date', deprecated.removalDate);
        logger.warn(`Deprecated endpoint accessed: ${requestPath}`, {
            clientVersion: req.headers['x-client-version'],
            platform: req.headers['x-client-platform'],
        });
    }

    // 3. Check client version compatibility (optional)
    const clientVersion = req.headers['x-client-version'];
    if (clientVersion) {
        if (compareVersions(clientVersion, API_VERSION_CONFIG.minClientVersion) < 0) {
            // Client is too old - add warning header but don't block
            res.set('X-Upgrade-Required', 'true');
            res.set('X-Update-Message', 'กรุณาอัปเดตแอปเป็นเวอร์ชันล่าสุด');
            logger.info(`Outdated client detected: ${clientVersion}`, {
                platform: req.headers['x-client-platform'],
            });
        }
    }

    // 4. Log API usage for analytics (optional)
    const platform = req.headers['x-client-platform'] || 'unknown';
    // Could send to analytics service here

    next();
}

/**
 * Force Upgrade Middleware (Blocks old clients)
 * Use this for critical updates only
 */
function forceUpgradeMiddleware(minVersion) {
    return (req, res, next) => {
        const clientVersion = req.headers['x-client-version'];

        if (clientVersion && compareVersions(clientVersion, minVersion) < 0) {
            return res.status(426).json({
                success: false,
                error: 'UPGRADE_REQUIRED',
                message: 'กรุณาอัปเดตแอปเป็นเวอร์ชันล่าสุดเพื่อใช้งานต่อ',
                minVersion: minVersion,
                currentVersion: clientVersion,
            });
        }

        next();
    };
}

/**
 * Get version info endpoint data
 */
function getVersionInfo() {
    return {
        apiVersion: API_VERSION_CONFIG.currentVersion,
        minClientVersion: API_VERSION_CONFIG.minClientVersion,
        deprecatedEndpoints: API_VERSION_CONFIG.deprecatedEndpoints.length,
    };
}

module.exports = apiVersionMiddleware;
module.exports.forceUpgradeMiddleware = forceUpgradeMiddleware;
module.exports.getVersionInfo = getVersionInfo;
module.exports.API_VERSION_CONFIG = API_VERSION_CONFIG;

