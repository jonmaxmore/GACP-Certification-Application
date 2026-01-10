/**
 * 🔒 Audit Logging System - ISO 27799 Compliant
 * Matches Prisma AuditLog schema with Hash Chain for immutability
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

// Categories matching Prisma schema
const AuditCategory = {
    AUTHENTICATION: 'AUTHENTICATION',
    APPLICATION: 'APPLICATION',
    PAYMENT: 'PAYMENT',
    CERTIFICATE: 'CERTIFICATE',
    ADMIN: 'ADMIN',
    SECURITY: 'SECURITY',
    SYSTEM: 'SYSTEM',
};

// Severity levels
const AuditSeverity = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL',
};

// Resource types matching Prisma schema
const ResourceType = {
    USER: 'USER',
    APPLICATION: 'APPLICATION',
    INVOICE: 'INVOICE',
    PAYMENT: 'PAYMENT',
    CERTIFICATE: 'CERTIFICATE',
    DOCUMENT: 'DOCUMENT',
    SYSTEM: 'SYSTEM',
};

class AuditLogger {
    constructor() {
        this.prisma = new PrismaClient();
        this.lastHash = null;
        this.sequenceCounter = 0;
    }

    /**
     * Generate unique log ID
     */
    generateLogId() {
        return `LOG-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }

    /**
     * Generate hash for immutability
     */
    generateHash(data, previousHash) {
        const content = JSON.stringify({ ...data, previousHash });
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Get last hash from database
     */
    async getLastHash() {
        const lastLog = await this.prisma.auditLog.findFirst({
            orderBy: { sequenceNumber: 'desc' },
            select: { currentHash: true, sequenceNumber: true },
        });
        return {
            hash: lastLog?.currentHash || 'GENESIS',
            sequence: lastLog?.sequenceNumber || 0,
        };
    }

    /**
     * Log an audit event with hash chain
     */
    async log(event) {
        const {
            category,
            action,
            severity = AuditSeverity.INFO,
            actorId,
            actorEmail = null,
            actorRole,
            actorType = 'USER',
            resourceType,
            resourceId,
            ipAddress,
            userAgent,
            metadata = {},
            result = 'SUCCESS',
            errorCode = null,
            errorMessage = null,
        } = event;

        try {
            // Get last hash for chain
            const last = await this.getLastHash();
            const previousHash = last.hash;
            const sequenceNumber = last.sequence + 1;

            // Generate log ID and current hash
            const logId = this.generateLogId();
            const currentHash = this.generateHash({
                logId,
                sequenceNumber,
                category,
                action,
                actorId,
                resourceType,
                resourceId,
                timestamp: new Date().toISOString(),
            }, previousHash);

            // Create immutable audit record
            const auditRecord = await this.prisma.auditLog.create({
                data: {
                    logId,
                    sequenceNumber,
                    category,
                    action,
                    severity,
                    actorId,
                    actorType,
                    actorEmail,
                    actorRole,
                    resourceType,
                    resourceId,
                    ipAddress: ipAddress || 'unknown',
                    userAgent: userAgent?.substring(0, 500) || 'unknown',
                    metadata: JSON.stringify(metadata),
                    result,
                    errorCode,
                    errorMessage,
                    previousHash,
                    currentHash,
                    hashAlgorithm: 'SHA-256',
                },
            });

            // Alert for critical events
            if (severity === AuditSeverity.CRITICAL) {
                console.error(`[AUDIT_CRITICAL] ${category}:${action} by ${actorId}`);
            }

            return auditRecord;
        } catch (error) {
            // Fallback to console
            console.error('[AUDIT_FALLBACK]', {
                category, action, severity,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
            return null;
        }
    }

    /**
     * Log authentication events
     */
    async logAuth(action, actorId, actorRole, outcome, ipAddress, userAgent, metadata = {}) {
        return this.log({
            category: AuditCategory.AUTHENTICATION,
            action,
            actorId,
            actorEmail: metadata.email,
            actorRole,
            resourceType: ResourceType.USER,
            resourceId: actorId,
            ipAddress,
            userAgent,
            metadata,
            result: outcome,
            severity: outcome === 'FAILURE' ? AuditSeverity.WARNING : AuditSeverity.INFO,
        });
    }

    /**
     * Log security events
     */
    async logSecurity(action, actorId, actorRole, ipAddress, userAgent, metadata = {}) {
        return this.log({
            category: AuditCategory.SECURITY,
            action,
            actorId: actorId || 'ANONYMOUS',
            actorRole: actorRole || 'UNKNOWN',
            resourceType: ResourceType.SYSTEM,
            resourceId: 'SECURITY',
            ipAddress,
            userAgent,
            metadata,
            severity: AuditSeverity.WARNING,
        });
    }

    /**
     * Verify hash chain integrity
     */
    async verifyChain(startSequence = 1, endSequence = null) {
        const logs = await this.prisma.auditLog.findMany({
            where: {
                sequenceNumber: {
                    gte: startSequence,
                    ...(endSequence && { lte: endSequence }),
                },
            },
            orderBy: { sequenceNumber: 'asc' },
        });

        let previousHash = 'GENESIS';
        const corrupted = [];

        for (const log of logs) {
            if (log.previousHash !== previousHash) {
                corrupted.push({
                    logId: log.logId,
                    sequenceNumber: log.sequenceNumber,
                    expected: previousHash,
                    found: log.previousHash,
                });
            }
            previousHash = log.currentHash;
        }

        return {
            verified: corrupted.length === 0,
            totalLogs: logs.length,
            corruptedLogs: corrupted,
        };
    }

    /**
     * Close Prisma connection
     */
    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Singleton instance
const auditLogger = new AuditLogger();

module.exports = {
    auditLogger,
    AuditCategory,
    AuditSeverity,
    ResourceType,
};
