/**
 * Audit Trail Service
 * บันทึก Log ทุกการเปลี่ยนแปลงข้อมูลในระบบ GACP
 *
 * Apple Audit Requirements:
 * - Immutable records (ห้ามลบ/แก้ไข)
 * - 5-year retention (ตามระเบียบ DTAM)
 * - Complete traceability
 *
 * @version 1.0.0
 */

const { prisma } = require('./prisma-database');

// Action types
const ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    SOFT_DELETE: 'SOFT_DELETE',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    LOGIN_FAILED: 'LOGIN_FAILED',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    UPLOAD: 'UPLOAD',
    DOWNLOAD: 'DOWNLOAD',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    SUBMIT: 'SUBMIT',
};

// Entity types
const ENTITIES = {
    USER: 'User',
    FARM: 'Farm',
    APPLICATION: 'Application',
    DOCUMENT: 'Document',
    HARVEST_BATCH: 'HarvestBatch',
    PLANT_SPECIES: 'PlantSpecies',
    NOTIFICATION: 'Notification',
    PAYMENT: 'Payment',
    AUDIT: 'Audit',
    CERTIFICATE: 'Certificate',
};

// Severity levels
const SEVERITY = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL',
};

/**
 * Log an action to the audit trail
 * @param {Object} params
 */
async function logAction({
    action,
    entityType,
    entityId = null,
    entityUuid = null,
    userId = null,
    userEmail = null,
    userRole = null,
    ipAddress = null,
    userAgent = null,
    sessionId = null,
    oldValues = null,
    newValues = null,
    changedFields = [],
    description = null,
    metadata = null,
    applicationId = null,
    farmId = null,
    batchNumber = null,
    severity = SEVERITY.INFO,
}) {
    try {
        const auditLog = await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId: entityId?.toString(),
                entityUuid,
                userId: userId?.toString(),
                userEmail,
                userRole,
                ipAddress,
                userAgent,
                sessionId,
                oldValues,
                newValues,
                changedFields,
                description,
                metadata,
                applicationId: applicationId?.toString(),
                farmId: farmId?.toString(),
                batchNumber,
                severity,
            },
        });

        return auditLog;
    } catch (error) {
        // Log error but don't throw - audit should not break main flow
        console.error('[AuditService] Failed to log action:', error.message);
        return null;
    }
}

/**
 * Log from Express request context
 * @param {Object} req - Express request object
 * @param {Object} params - Audit parameters
 */
async function logFromRequest(req, params) {
    const user = req.user || {};

    return logAction({
        ...params,
        userId: user.id || user.uuid || params.userId,
        userEmail: user.email || params.userEmail,
        userRole: user.role || params.userRole,
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID || req.headers['x-session-id'],
    });
}

/**
 * Get audit logs with filtering
 * @param {Object} filters
 */
async function getAuditLogs({
    entityType,
    entityId,
    userId,
    action,
    startDate,
    endDate,
    applicationId,
    farmId,
    severity,
    limit = 100,
    offset = 0,
}) {
    const where = {};

    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (applicationId) where.applicationId = applicationId;
    if (farmId) where.farmId = farmId;
    if (severity) where.severity = severity;

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
}

/**
 * Get audit trail for a specific entity
 * @param {string} entityType
 * @param {string} entityId
 */
async function getEntityHistory(entityType, entityId) {
    return prisma.auditLog.findMany({
        where: {
            entityType,
            entityId: entityId?.toString(),
        },
        orderBy: { createdAt: 'asc' },
    });
}

/**
 * Get user activity
 * @param {string} userId
 * @param {number} days - Last N days
 */
async function getUserActivity(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.auditLog.findMany({
        where: {
            userId: userId?.toString(),
            createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'desc' },
    });
}

/**
 * Get statistics for audit logs
 */
async function getAuditStats(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
        totalLogs,
        actionCounts,
        severityCounts,
    ] = await Promise.all([
        prisma.auditLog.count({
            where: { createdAt: { gte: startDate } },
        }),
        prisma.auditLog.groupBy({
            by: ['action'],
            where: { createdAt: { gte: startDate } },
            _count: true,
        }),
        prisma.auditLog.groupBy({
            by: ['severity'],
            where: { createdAt: { gte: startDate } },
            _count: true,
        }),
    ]);

    return {
        period: `${days} days`,
        total: totalLogs,
        byAction: actionCounts.reduce((acc, { action, _count }) => {
            acc[action] = _count;
            return acc;
        }, {}),
        bySeverity: severityCounts.reduce((acc, { severity, _count }) => {
            acc[severity] = _count;
            return acc;
        }, {}),
    };
}

module.exports = {
    logAction,
    logFromRequest,
    getAuditLogs,
    getEntityHistory,
    getUserActivity,
    getAuditStats,
    ACTIONS,
    ENTITIES,
    SEVERITY,
};
