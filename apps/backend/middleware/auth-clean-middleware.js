/**
 * Clean Architecture Authentication Middleware
 *
 * Purpose: JWT authentication for both Farmer and DTAM Staff
 * - Verify JWT tokens
 * - Check user types (farmer, dtam_staff)
 * - Permission-based access control (DTAM)
 * - Role-based access control (DTAM)
 *
 * Usage:
 *   const auth = require('./middleware/auth-clean-middleware');
 *   router.get('/profile', auth.authenticateFarmer, controller.getProfile);
 *   router.post('/staff', auth.authenticateDTAMStaff, auth.requirePermission('create_staff'), controller.createStaff);
 */

const JWTService = require('../modules/auth-farmer/infrastructure/security/JWTService');

// Initialize JWT service with environment variable
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const jwtService = new JWTService(jwtSecret);

/**
 * Authenticate Farmer
 * Verifies JWT token and checks if user type is 'farmer'
 * Sets req.user with payload
 */
const authenticateFarmer = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const payload = jwtService.verify(token);

    if (payload.type !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type. Farmer authentication required.',
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
};

/**
 * Authenticate DTAM Staff
 * Verifies JWT token and checks if user type is 'dtam_staff'
 * Sets req.staff with payload (includes role and permissions)
 */
const authenticateDTAMStaff = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const payload = jwtService.verify(token);

    if (payload.type !== 'dtam_staff') {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type. DTAM staff authentication required.',
      });
    }

    req.staff = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
};

/**
 * Authenticate Any (Farmer or DTAM Staff)
 * Verifies JWT token regardless of user type
 * Sets req.user for farmers or req.staff for DTAM staff
 * Sets req.authType to 'farmer' or 'dtam_staff'
 */
const authenticateAny = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const payload = jwtService.verify(token);

    // Set appropriate property based on type
    if (payload.type === 'farmer') {
      req.user = payload;
    } else if (payload.type === 'dtam_staff') {
      req.staff = payload;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid user type',
      });
    }

    req.authType = payload.type;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token',
    });
  }
};

/**
 * Require Permission (DTAM Staff only)
 * Checks if authenticated staff has specific permission
 * Must be used after authenticateDTAMStaff middleware
 *
 * Example:
 *   router.post('/staff', authenticateDTAMStaff, requirePermission('create_staff'), controller.createStaff)
 */
const requirePermission = permission => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'DTAM staff authentication required',
      });
    }

    if (!req.staff.permissions || !req.staff.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission: ${permission}`,
        required: permission,
        userPermissions: req.staff.permissions || [],
      });
    }

    next();
  };
};

/**
 * Require Multiple Permissions (DTAM Staff only)
 * Checks if authenticated staff has ALL specified permissions
 *
 * Example:
 *   router.put('/certificate/:id/approve', authenticateDTAMStaff, requireAllPermissions(['view_certificates', 'issue_certificates']), controller.approveCertificate)
 */
const requireAllPermissions = permissions => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'DTAM staff authentication required',
      });
    }

    if (!req.staff.permissions) {
      return res.status(403).json({
        success: false,
        message: 'No permissions found',
      });
    }

    const hasAllPermissions = permissions.every(permission =>
      req.staff.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = permissions.filter(
        permission => !req.staff.permissions.includes(permission),
      );

      return res.status(403).json({
        success: false,
        message: `Permission denied. Missing permissions: ${missingPermissions.join(', ')}`,
        required: permissions,
        missing: missingPermissions,
        userPermissions: req.staff.permissions,
      });
    }

    next();
  };
};

/**
 * Require Any Permission (DTAM Staff only)
 * Checks if authenticated staff has AT LEAST ONE of specified permissions
 *
 * Example:
 *   router.get('/reports', authenticateDTAMStaff, requireAnyPermission(['view_reports', 'export_data']), controller.getReports)
 */
const requireAnyPermission = permissions => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'DTAM staff authentication required',
      });
    }

    if (!req.staff.permissions) {
      return res.status(403).json({
        success: false,
        message: 'No permissions found',
      });
    }

    const hasAnyPermission = permissions.some(permission =>
      req.staff.permissions.includes(permission),
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required at least one of: ${permissions.join(', ')}`,
        required: permissions,
        userPermissions: req.staff.permissions,
      });
    }

    next();
  };
};

/**
 * Require Role (DTAM Staff only)
 * Checks if authenticated staff has specific role
 *
 * Example:
 *   router.post('/staff', authenticateDTAMStaff, requireRole('ADMIN'), controller.createStaff)
 */
const requireRole = role => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'DTAM staff authentication required',
      });
    }

    if (req.staff.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${role}`,
        required: role,
        userRole: req.staff.role,
      });
    }

    next();
  };
};

/**
 * Require Any Role (DTAM Staff only)
 * Checks if authenticated staff has one of specified roles
 *
 * Example:
 *   router.get('/applications', authenticateDTAMStaff, requireAnyRole(['ADMIN', 'MANAGER', 'REVIEWER']), controller.listApplications)
 */
const requireAnyRole = roles => {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({
        success: false,
        message: 'DTAM staff authentication required',
      });
    }

    if (!roles.includes(req.staff.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        required: roles,
        userRole: req.staff.role,
      });
    }

    next();
  };
};

/**
 * Require Admin (DTAM Staff only)
 * Shorthand for requireRole('ADMIN')
 *
 * Example:
 *   router.delete('/staff/:id', authenticateDTAMStaff, requireAdmin, controller.deleteStaff)
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Optional Authentication
 * Authenticates if token is provided, but doesn't fail if not
 * Useful for endpoints that work differently for authenticated vs anonymous users
 *
 * Example:
 *   router.get('/public-data', optionalAuth, controller.getPublicData)
 *   // Inside controller: if (req.user || req.staff) { show extra data }
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    const payload = jwtService.verify(token);

    // Set appropriate property based on type
    if (payload.type === 'farmer') {
      req.user = payload;
    } else if (payload.type === 'dtam_staff') {
      req.staff = payload;
    }

    req.authType = payload.type;
    next();
  } catch (error) {
    // Invalid token, but don't fail - continue without authentication
    next();
  }
};

module.exports = {
  // Core authentication
  authenticateFarmer,
  authenticateDTAMStaff,
  authenticateAny,
  optionalAuth,

  // Permission-based (DTAM only)
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,

  // Role-based (DTAM only)
  requireRole,
  requireAnyRole,
  requireAdmin,
};
