/**
 * Audit Routes
 *
 * Express routes for audit log operations.
 * DTAM staff only - no farmer routes.
 *
 * @module presentation/routes/audit.routes
 */

const express = require('express');

function createAuditRoutes(controller, authMiddleware) {
  // DTAM routes only
  const dtamRouter = express.Router();

  // List audit logs
  dtamRouter.get(
    '/',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_audit_logs', 'manage_system']),
    (req, res) => controller.listAuditLogs(req, res),
  );

  // Get audit statistics
  dtamRouter.get(
    '/statistics',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_audit_logs', 'manage_system']),
    (req, res) => controller.getAuditStatistics(req, res),
  );

  // Get user activity
  dtamRouter.get(
    '/activity/:userId',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_audit_logs', 'manage_system']),
    (req, res) => controller.getUserActivity(req, res),
  );

  // Get audit log details
  dtamRouter.get(
    '/:id',
    authMiddleware.authenticateDTAMStaff,
    authMiddleware.requireAnyPermission(['view_audit_logs', 'manage_system']),
    (req, res) => controller.getAuditLogDetails(req, res),
  );

  return {
    dtamRouter,
  };
}

module.exports = createAuditRoutes;
