/**
 * AuditLog Entity - System Activity Audit Trail
 *
 * Domain entity representing an audit log entry.
 * Tracks all significant system activities for compliance and security.
 *
 * @module domain/entities/AuditLog
 */

// Action Types
const ACTION_TYPE = {
  // User Actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',

  // Farm Actions
  FARM_CREATE: 'FARM_CREATE',
  FARM_UPDATE: 'FARM_UPDATE',
  FARM_DELETE: 'FARM_DELETE',
  FARM_SUBMIT: 'FARM_SUBMIT',
  FARM_APPROVE: 'FARM_APPROVE',
  FARM_REJECT: 'FARM_REJECT',
  FARM_SUSPEND: 'FARM_SUSPEND',

  // Survey Actions
  SURVEY_CREATE: 'SURVEY_CREATE',
  SURVEY_UPDATE: 'SURVEY_UPDATE',
  SURVEY_DELETE: 'SURVEY_DELETE',
  SURVEY_SUBMIT: 'SURVEY_SUBMIT',
  SURVEY_APPROVE: 'SURVEY_APPROVE',
  SURVEY_REJECT: 'SURVEY_REJECT',
  SURVEY_REVISION: 'SURVEY_REVISION',

  // Certificate Actions
  CERTIFICATE_ISSUE: 'CERTIFICATE_ISSUE',
  CERTIFICATE_RENEW: 'CERTIFICATE_RENEW',
  CERTIFICATE_REVOKE: 'CERTIFICATE_REVOKE',
  CERTIFICATE_SUSPEND: 'CERTIFICATE_SUSPEND',
  CERTIFICATE_DOWNLOAD: 'CERTIFICATE_DOWNLOAD',

  // DTAM Staff Actions
  STAFF_CREATE: 'STAFF_CREATE',
  STAFF_UPDATE: 'STAFF_UPDATE',
  STAFF_DELETE: 'STAFF_DELETE',
  STAFF_ROLE_CHANGE: 'STAFF_ROLE_CHANGE',
  STAFF_PERMISSION_CHANGE: 'STAFF_PERMISSION_CHANGE',

  // Document Actions
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  DOCUMENT_DOWNLOAD: 'DOCUMENT_DOWNLOAD',
  DOCUMENT_DELETE: 'DOCUMENT_DELETE',

  // System Actions
  SYSTEM_CONFIG_CHANGE: 'SYSTEM_CONFIG_CHANGE',
  SYSTEM_BACKUP: 'SYSTEM_BACKUP',
  SYSTEM_RESTORE: 'SYSTEM_RESTORE',

  // Security Actions
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  ACCESS_DENIED: 'ACCESS_DENIED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
};

// Entity Types
const ENTITY_TYPE = {
  USER: 'USER',
  DTAM_STAFF: 'DTAM_STAFF',
  FARM: 'FARM',
  SURVEY: 'SURVEY',
  CERTIFICATE: 'CERTIFICATE',
  DOCUMENT: 'DOCUMENT',
  SYSTEM: 'SYSTEM',
};

// Severity Levels
const SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
};

// Actor Types
const ACTOR_TYPE = {
  FARMER: 'FARMER',
  DTAM_STAFF: 'DTAM_STAFF',
  SYSTEM: 'SYSTEM',
  ANONYMOUS: 'ANONYMOUS',
};

class AuditLog {
  constructor({
    id,

    // Actor Information (who)
    actorType,
    actorId,
    actorName,
    actorEmail,
    actorRole,

    // Action Information (what)
    actionType,
    actionDescription,

    // Entity Information (target)
    entityType,
    entityId,
    entityName,

    // Change Details
    changesBefore,
    changesAfter,
    changesSummary,

    // Request Context
    requestMethod,
    requestPath,
    requestQuery,
    requestBody,
    responseStatus,
    responseMessage,

    // Metadata
    ipAddress,
    userAgent,
    sessionId,
    severity = SEVERITY.INFO,
    tags = [],
    metadata = {},

    // Result
    success = true,
    errorMessage,
    errorStack,

    // Timestamp
    timestamp = new Date(),
    createdAt = new Date(),
  }) {
    // Identifiers
    this.id = id;

    // Actor Information
    this.actorType = actorType;
    this.actorId = actorId;
    this.actorName = actorName;
    this.actorEmail = actorEmail;
    this.actorRole = actorRole;

    // Action Information
    this.actionType = actionType;
    this.actionDescription = actionDescription;

    // Entity Information
    this.entityType = entityType;
    this.entityId = entityId;
    this.entityName = entityName;

    // Change Details
    this.changesBefore = changesBefore;
    this.changesAfter = changesAfter;
    this.changesSummary = changesSummary;

    // Request Context
    this.requestMethod = requestMethod;
    this.requestPath = requestPath;
    this.requestQuery = requestQuery;
    this.requestBody = requestBody;
    this.responseStatus = responseStatus;
    this.responseMessage = responseMessage;

    // Metadata
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.sessionId = sessionId;
    this.severity = severity;
    this.tags = tags;
    this.metadata = metadata;

    // Result
    this.success = success;
    this.errorMessage = errorMessage;
    this.errorStack = errorStack;

    // Timestamp
    this.timestamp = timestamp;
    this.createdAt = createdAt;
  }

  /**
   * Create a new audit log entry
   */
  static create({ actorType, actorId, actionType, entityType, entityId, ...logData }) {
    if (!actorType) {
      throw new Error('Actor type is required');
    }
    if (!actionType) {
      throw new Error('Action type is required');
    }

    return new AuditLog({
      actorType,
      actorId,
      actionType,
      entityType,
      entityId,
      ...logData,
      timestamp: new Date(),
      createdAt: new Date(),
    });
  }

  /**
   * Create audit log from HTTP request
   */
  static fromRequest(req, actionType, entityType, entityId, additionalData = {}) {
    const actor = req.user || req.staff;
    const actorType = req.user
      ? ACTOR_TYPE.FARMER
      : req.staff
        ? ACTOR_TYPE.DTAM_STAFF
        : ACTOR_TYPE.ANONYMOUS;

    // Sanitize request body (remove sensitive data)
    const sanitizedBody = AuditLog.sanitizeData(req.body);

    return AuditLog.create({
      actorType,
      actorId: actor?.userId || actor?.staffId,
      actorName: actor?.name || actor?.fullName,
      actorEmail: actor?.email,
      actorRole: actor?.role,

      actionType,
      entityType,
      entityId,

      requestMethod: req.method,
      requestPath: req.path,
      requestQuery: req.query,
      requestBody: sanitizedBody,

      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      sessionId: req.session?.id,

      ...additionalData,
    });
  }

  /**
   * Sanitize sensitive data from objects
   */
  static sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'privateKey',
      'creditCard',
      'ssn',
      'nationalId',
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = AuditLog.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Add tags to the audit log
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Add multiple tags
   */
  addTags(tags) {
    tags.forEach(tag => this.addTag(tag));
  }

  /**
   * Set severity level
   */
  setSeverity(severity) {
    if (!Object.values(SEVERITY).includes(severity)) {
      throw new Error(`Invalid severity: ${severity}`);
    }
    this.severity = severity;
  }

  /**
   * Mark as failed with error
   */
  markAsFailed(errorMessage, errorStack = null) {
    this.success = false;
    this.errorMessage = errorMessage;
    this.errorStack = errorStack;
    this.severity = SEVERITY.ERROR;
  }

  /**
   * Add metadata
   */
  addMetadata(key, value) {
    this.metadata[key] = value;
  }

  /**
   * Set changes (before/after)
   */
  setChanges(before, after) {
    this.changesBefore = AuditLog.sanitizeData(before);
    this.changesAfter = AuditLog.sanitizeData(after);
    this.changesSummary = this.generateChangesSummary(before, after);
  }

  /**
   * Generate changes summary
   */
  generateChangesSummary(before, after) {
    if (!before || !after) {
      return null;
    }

    const changes = [];
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    allKeys.forEach(key => {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changes.push({
          field: key,
          from: before[key],
          to: after[key],
        });
      }
    });

    return changes.length > 0 ? changes : null;
  }

  /**
   * Get audit log summary
   */
  getSummary() {
    return {
      id: this.id,
      actorType: this.actorType,
      actorName: this.actorName,
      actionType: this.actionType,
      entityType: this.entityType,
      entityName: this.entityName,
      severity: this.severity,
      success: this.success,
      timestamp: this.timestamp,
    };
  }

  /**
   * Check if audit log is security-related
   */
  isSecurityRelated() {
    const securityActions = [
      ACTION_TYPE.SECURITY_VIOLATION,
      ACTION_TYPE.ACCESS_DENIED,
      ACTION_TYPE.SUSPICIOUS_ACTIVITY,
      ACTION_TYPE.PASSWORD_CHANGE,
      ACTION_TYPE.PASSWORD_RESET,
    ];
    return securityActions.includes(this.actionType);
  }

  /**
   * Check if audit log is critical
   */
  isCritical() {
    return this.severity === SEVERITY.CRITICAL;
  }

  /**
   * Check if action was successful
   */
  isSuccessful() {
    return this.success === true;
  }

  /**
   * Get time since action
   */
  getTimeSince() {
    const now = new Date();
    const diffMs = now - new Date(this.timestamp);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day(s) ago`;
    }
    if (diffHours > 0) {
      return `${diffHours} hour(s) ago`;
    }
    if (diffMins > 0) {
      return `${diffMins} minute(s) ago`;
    }
    return 'Just now';
  }
}

module.exports = {
  AuditLog,
  ACTION_TYPE,
  ENTITY_TYPE,
  SEVERITY,
  ACTOR_TYPE,
};
