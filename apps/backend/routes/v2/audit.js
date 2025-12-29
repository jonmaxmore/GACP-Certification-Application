/**
 * Audit Logging Middleware for GACP Platform
 * Tracks all significant actions for compliance and debugging
 */

const fs = require('fs');
const path = require('path');

// Audit log storage (in production, use database or log aggregation service)
const auditLogs = [];
const MAX_IN_MEMORY_LOGS = 10000;

// Ensure audit log directory exists
const auditLogDir = path.join(__dirname, '../logs/audit');
if (!fs.existsSync(auditLogDir)) {
    fs.mkdirSync(auditLogDir, { recursive: true });
}

// Get current audit log file path
const getAuditLogPath = () => {
    const date = new Date().toISOString().split('T')[0];
    return path.join(auditLogDir, `audit-${date}.jsonl`);
};

/**
 * Create an audit log entry
 */
const createAuditLog = (entry) => {
    const log = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...entry,
    };

    // Store in memory
    auditLogs.push(log);
    if (auditLogs.length > MAX_IN_MEMORY_LOGS) {
        auditLogs.shift();
    }

    // Write to file (append mode)
    try {
        fs.appendFileSync(getAuditLogPath(), JSON.stringify(log) + '\n');
    } catch (error) {
        console.error('Failed to write audit log:', error.message);
    }

    return log;
};

/**
 * Audit categories
 */
const AuditCategory = {
    AUTH: 'AUTH',           // Login, logout, token refresh
    DATA: 'DATA',           // Create, read, update, delete
    FILE: 'FILE',           // File upload, download, delete
    SECURITY: 'SECURITY',   // Security events, violations
    ADMIN: 'ADMIN',         // Admin actions
    SYSTEM: 'SYSTEM',       // System events
};

/**
 * Audit actions
 */
const AuditAction = {
    // Auth
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    TOKEN_REFRESH: 'TOKEN_REFRESH',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',

    // Data
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',

    // File
    FILE_UPLOAD: 'FILE_UPLOAD',
    FILE_DOWNLOAD: 'FILE_DOWNLOAD',
    FILE_DELETE: 'FILE_DELETE',

    // Security
    RATE_LIMIT_HIT: 'RATE_LIMIT_HIT',
    FORBIDDEN_PATTERN: 'FORBIDDEN_PATTERN',
    INVALID_TOKEN: 'INVALID_TOKEN',
    UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',

    // Admin
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    USER_DELETE: 'USER_DELETE',
    ROLE_CHANGE: 'ROLE_CHANGE',
    CONFIG_CHANGE: 'CONFIG_CHANGE',
};

/**
 * Audit middleware for Express routes
 */
const auditMiddleware = (category, action, options = {}) => {
    return (req, res, next) => {
        const startTime = Date.now();

        // Capture original end method
        const originalEnd = res.end;

        res.end = function (chunk, encoding) {
            // Restore original end
            res.end = originalEnd;
            res.end(chunk, encoding);

            // Create audit log after response is sent
            const duration = Date.now() - startTime;

            createAuditLog({
                category,
                action,
                user: {
                    id: req.user?.id || 'anonymous',
                    role: req.user?.role || 'guest',
                    ip: req.ip || req.connection?.remoteAddress,
                },
                request: {
                    method: req.method,
                    path: req.originalUrl,
                    params: options.logParams ? req.params : undefined,
                    query: options.logQuery ? req.query : undefined,
                    body: options.logBody ? sanitizeBody(req.body) : undefined,
                },
                response: {
                    statusCode: res.statusCode,
                    duration,
                },
                metadata: options.metadata || {},
            });
        };

        next();
    };
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeBody = (body) => {
    if (!body) return undefined;

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
};

/**
 * Log security event
 */
const logSecurityEvent = (type, details) => {
    return createAuditLog({
        category: AuditCategory.SECURITY,
        action: type,
        severity: 'WARNING',
        details,
    });
};

/**
 * Log admin action
 */
const logAdminAction = (action, actor, target, details) => {
    return createAuditLog({
        category: AuditCategory.ADMIN,
        action,
        user: actor,
        target,
        details,
    });
};

/**
 * Query audit logs
 */
const queryAuditLogs = (filters = {}) => {
    let results = [...auditLogs];

    if (filters.category) {
        results = results.filter(log => log.category === filters.category);
    }

    if (filters.action) {
        results = results.filter(log => log.action === filters.action);
    }

    if (filters.userId) {
        results = results.filter(log => log.user?.id === filters.userId);
    }

    if (filters.startDate) {
        results = results.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
        results = results.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    // Sort by timestamp descending
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    return {
        total: results.length,
        offset,
        limit,
        data: results.slice(offset, offset + limit),
    };
};

// Export API route
const express = require('express');
const router = express.Router();

/**
 * @route GET /api/v2/audit
 * @desc Query audit logs
 * @access Admin only
 */
router.get('/', (req, res) => {
    // In production, check for admin role
    const { category, action, userId, startDate, endDate, limit, offset } = req.query;

    const results = queryAuditLogs({
        category,
        action,
        userId,
        startDate,
        endDate,
        limit: parseInt(limit) || 100,
        offset: parseInt(offset) || 0,
    });

    res.json({
        success: true,
        ...results,
    });
});

/**
 * @route GET /api/v2/audit/stats
 * @desc Get audit statistics
 * @access Admin only
 */
router.get('/stats', (req, res) => {
    const stats = {
        totalLogs: auditLogs.length,
        byCategory: {},
        byAction: {},
        last24Hours: 0,
        lastHour: 0,
    };

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    for (const log of auditLogs) {
        // Count by category
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

        // Count by action
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

        // Count recent
        const logTime = new Date(log.timestamp).getTime();
        if (logTime >= oneDayAgo) stats.last24Hours++;
        if (logTime >= oneHourAgo) stats.lastHour++;
    }

    res.json({
        success: true,
        data: stats,
    });
});

module.exports = router;
module.exports.auditMiddleware = auditMiddleware;
module.exports.createAuditLog = createAuditLog;
module.exports.logSecurityEvent = logSecurityEvent;
module.exports.logAdminAction = logAdminAction;
module.exports.AuditCategory = AuditCategory;
module.exports.AuditAction = AuditAction;

