/**
 * Access Logging Middleware
 * Automatically logs access to sensitive endpoints
 */

const AccessLog = require('../models-mongoose-legacy/AccessLog-model');

/**
 * Create middleware that logs access to sensitive data
 * @param {string} resourceType - Type of resource being accessed
 * @param {string} action - Type of action (VIEW, VIEW_SENSITIVE, EDIT, etc.)
 * @param {Function} getResourceId - Function to extract resource ID from request
 */
const logAccess = (resourceType, action, getResourceId) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to log after successful response
        res.json = async function (data) {
            // Only log successful responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const resourceId = getResourceId(req, data);

                    if (resourceId && req.user) {
                        await AccessLog.logAccess({
                            actorId: req.user.id || req.user._id,
                            actorEmail: req.user.email,
                            actorRole: req.user.role,
                            resourceType,
                            resourceId,
                            action,
                            fieldsAccessed: req.query.include?.split(',') || [],
                            ipAddress: req.ip || req.connection?.remoteAddress,
                            userAgent: req.get('User-Agent'),
                        });
                    }
                } catch (err) {
                    // Don't block response if logging fails, but log error
                    console.error('[AccessLog] Failed to log access:', err.message);
                }
            }

            return originalJson(data);
        };

        next();
    };
};

/**
 * Log sensitive data access (idCard, laserCode, etc.)
 */
const logSensitiveAccess = (fieldsAccessed) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        res.json = async function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                try {
                    // Extract resource ID from response
                    const resourceId = data?.data?.id || data?.data?._id || req.params.id;

                    if (resourceId) {
                        await AccessLog.logAccess({
                            actorId: req.user.id || req.user._id,
                            actorEmail: req.user.email,
                            actorRole: req.user.role,
                            resourceType: 'USER',
                            resourceId,
                            action: 'VIEW_SENSITIVE',
                            fieldsAccessed,
                            ipAddress: req.ip || req.connection?.remoteAddress,
                            userAgent: req.get('User-Agent'),
                        });
                    }
                } catch (err) {
                    console.error('[AccessLog] Failed to log sensitive access:', err.message);
                }
            }

            return originalJson(data);
        };

        next();
    };
};

module.exports = {
    logAccess,
    logSensitiveAccess,
};

