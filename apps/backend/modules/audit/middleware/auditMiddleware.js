const { createLogger } = require('../../../shared/logger');
const logger = createLogger('audit-auditMiddleware');

/**
 * Audit Middleware
 *
 * Express middleware for automatic audit logging.
 * Captures HTTP requests and responses for audit trail.
 *
 * @module middleware/auditMiddleware
 */

/**
 * Create audit middleware
 * @param {Object} auditModule - The audit module instance
 * @returns {Function} Express middleware function
 */
function createAuditMiddleware(auditModule) {
  const { logFromRequest } = auditModule.services;
  const { ACTION_TYPE, ENTITY_TYPE } = auditModule.constants;

  /**
   * Middleware to automatically log HTTP requests
   */
  return function auditMiddleware(options = {}) {
    const {
      actionType = ACTION_TYPE.SYSTEM_CONFIG_CHANGE,
      entityType = null,
      getEntityId = null,
      enabled = true,
      excludePaths = [],
    } = options;

    return async (req, res, next) => {
      // Skip if disabled or path is excluded
      if (!enabled || excludePaths.some(path => req.path.includes(path))) {
        return next();
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to capture response
      res.json = function (data) {
        // Restore original json method
        res.json = originalJson;

        // Create audit log
        const entityId = getEntityId ? getEntityId(req, res, data) : null;

        logFromRequest(req, actionType, entityType, entityId, {
          responseStatus: res.statusCode,
          responseMessage: data?.message,
          success: res.statusCode < 400,
        }).catch(error => {
          logger.error('Audit middleware error:', error);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    };
  };
}

/**
 * Create action-specific audit middleware factories
 */
function createAuditHelpers(auditModule) {
  const { logFromRequest } = auditModule.services;
  const { ACTION_TYPE, ENTITY_TYPE } = auditModule.constants;

  return {
    // User actions
    auditUserLogin: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.USER_LOGIN,
        entityType: ENTITY_TYPE.USER,
        getEntityId: req => req.user?.userId,
      }),

    auditUserRegister: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.USER_REGISTER,
        entityType: ENTITY_TYPE.USER,
        getEntityId: (req, res, data) => data?.data?.id,
      }),

    // Farm actions
    auditFarmCreate: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.FARM_CREATE,
        entityType: ENTITY_TYPE.FARM,
        getEntityId: (req, res, data) => data?.data?.id,
      }),

    auditFarmUpdate: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.FARM_UPDATE,
        entityType: ENTITY_TYPE.FARM,
        getEntityId: req => req.params.id,
      }),

    auditFarmApprove: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.FARM_APPROVE,
        entityType: ENTITY_TYPE.FARM,
        getEntityId: req => req.params.id,
      }),

    auditFarmReject: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.FARM_REJECT,
        entityType: ENTITY_TYPE.FARM,
        getEntityId: req => req.params.id,
      }),

    // Survey actions
    auditSurveyCreate: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.SURVEY_CREATE,
        entityType: ENTITY_TYPE.SURVEY,
        getEntityId: (req, res, data) => data?.data?.id,
      }),

    auditSurveyUpdate: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.SURVEY_UPDATE,
        entityType: ENTITY_TYPE.SURVEY,
        getEntityId: req => req.params.id,
      }),

    auditSurveyApprove: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.SURVEY_APPROVE,
        entityType: ENTITY_TYPE.SURVEY,
        getEntityId: req => req.params.id,
      }),

    // Certificate actions
    auditCertificateIssue: () =>
      createAuditMiddleware(auditModule)({
        actionType: ACTION_TYPE.CERTIFICATE_ISSUE,
        entityType: ENTITY_TYPE.CERTIFICATE,
        getEntityId: (req, res, data) => data?.data?.id,
      }),

    // Generic action logger
    logAction: async (actionType, entityType, entityId, additionalData = {}) => {
      return logFromRequest(null, actionType, entityType, entityId, additionalData);
    },
  };
}

module.exports = {
  createAuditMiddleware,
  createAuditHelpers,
};
