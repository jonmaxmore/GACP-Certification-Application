/**
 * Audit Module Container
 *
 * Dependency Injection container that wires together all layers
 * of the audit module.
 *
 * @module module.container
 */

const MongoDBAuditLogRepository = require('./infrastructure/database/audit-log-model');
const { createLogger } = require('../../shared/shared/logger');
const logger = createLogger('audit-container');

const {
  AuditLog,
  ACTION_TYPE,
  ENTITY_TYPE,
  SEVERITY,
  ACTOR_TYPE,
} = require('./domain/entities/audit-log');

// Use Cases
const CreateAuditLogUseCase = require('./application/use-cases/create-audit-log-use-case');
const GetAuditLogDetailsUseCase = require('./application/use-cases/get-audit-log-details-use-case');
const ListAuditLogsUseCase = require('./application/use-cases/list-audit-logs-use-case');
const GetAuditStatisticsUseCase = require('./application/use-cases/get-audit-statistics-use-case');
const GetUserActivityUseCase = require('./application/use-cases/get-user-activity-use-case');

// Presentation Layer
const AuditController = require('./presentation/controllers/audit-controller');
const createAuditRoutes = require('./presentation/routes/audit.routes');

/**
 * Create and configure the audit module
 */
function createAuditModule(config) {
  const { database, auth-middleware } = config;

  // Infrastructure Layer
  const auditLogRepository = new MongoDBAuditLogRepository(database);

  // Application Layer - Use Cases
  const createAuditLogUseCase = new CreateAuditLogUseCase({
    auditLogRepository,
  });

  const getAuditLogDetailsUseCase = new GetAuditLogDetailsUseCase({
    auditLogRepository,
  });

  const listAuditLogsUseCase = new ListAuditLogsUseCase({
    auditLogRepository,
  });

  const getAuditStatisticsUseCase = new GetAuditStatisticsUseCase({
    auditLogRepository,
  });

  const getUserActivityUseCase = new GetUserActivityUseCase({
    auditLogRepository,
  });

  // Presentation Layer - Controller
  const auditController = new AuditController({
    getAuditLogDetailsUseCase,
    listAuditLogsUseCase,
    getAuditStatisticsUseCase,
    getUserActivityUseCase,
  });

  // Presentation Layer - Routes
  const { dtamRouter } = createAuditRoutes(auditController, auth-middleware);

  // Helper function to create audit logs
  const logAction = async auditLogData => {
    try {
      const auditLog = AuditLog.create(auditLogData);
      await createAuditLogUseCase.execute(auditLog);
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw - audit logging should not break application flow
    }
  };

  // Helper function to create audit log from request
  const logFromRequest = async (req, actionType, entityType, entityId, additionalData = {}) => {
    try {
      const auditLog = AuditLog.fromRequest(req, actionType, entityType, entityId, additionalData);
      await createAuditLogUseCase.execute(auditLog);
    } catch (error) {
      logger.error('Failed to create audit log from request:', error);
    }
  };

  // Return module interface
  return {
    // Routes to mount in main app
    dtamRouter, // Mount at /api/dtam/audit

    // Services for use by other modules
    services: {
      auditLogRepository,
      createAuditLogUseCase,
      logAction,
      logFromRequest,
    },

    // Constants for use by other modules
    constants: {
      ACTION_TYPE,
      ENTITY_TYPE,
      SEVERITY,
      ACTOR_TYPE,
      AuditLog,
    },
  };
}

module.exports = createAuditModule;
