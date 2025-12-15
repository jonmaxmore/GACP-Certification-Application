/**
 * Audit DTOs (Data Transfer Objects)
 *
 * Transform AuditLog entities to response formats.
 *
 * @module presentation/dto/AuditDTO
 */

class AuditDTO {
  /**
   * Convert AuditLog entity to detailed DTO
   */
  static toDetailedDTO(auditLog) {
    return {
      id: auditLog.id,

      // Actor information
      actor: {
        type: auditLog.actorType,
        id: auditLog.actorId,
        name: auditLog.actorName,
        email: auditLog.actorEmail,
        role: auditLog.actorRole,
      },

      // Action information
      action: {
        type: auditLog.actionType,
        description: auditLog.actionDescription,
      },

      // Entity information
      entity: {
        type: auditLog.entityType,
        id: auditLog.entityId,
        name: auditLog.entityName,
      },

      // Changes
      changes: {
        before: auditLog.changesBefore,
        after: auditLog.changesAfter,
        summary: auditLog.changesSummary,
      },

      // Request context
      request: {
        method: auditLog.requestMethod,
        path: auditLog.requestPath,
        query: auditLog.requestQuery,
        body: auditLog.requestBody,
      },

      // Response
      response: {
        status: auditLog.responseStatus,
        message: auditLog.responseMessage,
      },

      // Metadata
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      sessionId: auditLog.sessionId,
      severity: auditLog.severity,
      tags: auditLog.tags,
      metadata: auditLog.metadata,

      // Result
      success: auditLog.success,
      error: auditLog.errorMessage
        ? {
            message: auditLog.errorMessage,
            stack: auditLog.errorStack,
          }
        : null,

      // Computed fields
      isSecurityRelated: auditLog.isSecurityRelated(),
      isCritical: auditLog.isCritical(),
      timeSince: auditLog.getTimeSince(),

      // Timestamp
      timestamp: auditLog.timestamp,
      createdAt: auditLog.createdAt,
    };
  }

  /**
   * Convert AuditLog entity to list item DTO
   */
  static toListItemDTO(auditLog) {
    return {
      id: auditLog.id,
      actorType: auditLog.actorType,
      actorName: auditLog.actorName,
      actionType: auditLog.actionType,
      actionDescription: auditLog.actionDescription,
      entityType: auditLog.entityType,
      entityName: auditLog.entityName,
      severity: auditLog.severity,
      success: auditLog.success,
      ipAddress: auditLog.ipAddress,
      isSecurityRelated: auditLog.isSecurityRelated(),
      isCritical: auditLog.isCritical(),
      timeSince: auditLog.getTimeSince(),
      timestamp: auditLog.timestamp,
    };
  }

  /**
   * Convert AuditLog entity to summary DTO
   */
  static toSummaryDTO(auditLog) {
    return {
      id: auditLog.id,
      actorName: auditLog.actorName,
      actionType: auditLog.actionType,
      entityType: auditLog.entityType,
      entityName: auditLog.entityName,
      severity: auditLog.severity,
      success: auditLog.success,
      timestamp: auditLog.timestamp,
    };
  }

  /**
   * Success response wrapper
   */
  static successResponse(message, data) {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Error response wrapper
   */
  static errorResponse(message, errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }
}

module.exports = AuditDTO;
