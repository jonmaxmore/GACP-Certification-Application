/**
 * Role-based Access Control Middleware (V2)
 * Enforces strict role permissions for closed-loop system
 */

const { ForbiddenError } = require('../shared/errors');
const logger = require('../shared/logger');

/**
 * Check if user has required role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn('Unauthorized role access attempt', {
          userId: req.user._id,
          userRole,
          requiredRoles: allowedRoles,
          path: req.path,
        });
        throw new ForbiddenError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Predefined role middleware for common use cases
 */
const roleMiddleware = {
  // Admin only
  adminOnly: requireRole(['admin']),

  // DTAM Staff (all types)
  staffOnly: requireRole(['admin', 'officer', 'auditor']),

  // Registrar (Document checker)
  registrarOnly: requireRole(['admin', 'officer']),

  // Finance staff
  financeOnly: requireRole(['admin', 'officer']), // Assuming officer handles finance

  // Auditor/Inspector
  auditorOnly: requireRole(['admin', 'auditor']),

  // Farmer/Applicant
  farmerOnly: requireRole(['farmer']),

  // Farmer or Staff (for viewing applications)
  farmerOrStaff: requireRole(['farmer', 'admin', 'officer', 'auditor']),
};

/**
 * Check if user has specific permission
 * @param {string} permission - Required permission
 * @returns {Function} Express middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      if (!req.user.hasPermission || !req.user.hasPermission(permission)) {
        logger.warn('Unauthorized permission access attempt', {
          userId: req.user._id,
          userRole: req.user.role,
          requiredPermission: permission,
          path: req.path,
        });
        throw new ForbiddenError(`Permission denied: ${permission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user can access specific application
 * (Owner or assigned staff)
 */
const canAccessApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Admin can access all
    if (userRole === 'admin') {
      return next();
    }

    // Load application (assuming ApplicationRepository exists)
    const ApplicationRepository = require('../repositories/ApplicationRepository');
    const appRepo = new ApplicationRepository();
    const application = await appRepo.findById(applicationId);

    if (!application) {
      throw new ForbiddenError('Application not found');
    }

    // Check if user is applicant
    if (application.applicant.toString() === userId.toString()) {
      return next();
    }

    // Check if user is assigned staff
    if (
      (application.assignedOfficer && application.assignedOfficer.toString() === userId.toString()) ||
      (application.assignedAuditor && application.assignedAuditor.toString() === userId.toString())
    ) {
      return next();
    }

    throw new ForbiddenError('You do not have access to this application');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireRole,
  requirePermission,
  canAccessApplication,
  ...roleMiddleware,
};

