/**
 * DTAM Authentication Middleware
 * Separate middleware for DTAM government staff
 * Uses different JWT secret from public system
 * Migrated from microservices/auth-service/src/middleware/dtam-auth.js
 *
 * เธ—เธตเนเธกเธฒเธ—เธตเนเนเธ (WHY):
 * - เนเธขเธ JWT secret เธฃเธฐเธซเธงเนเธฒเธ public เนเธฅเธฐ government เน€เธเธทเนเธญเธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข
 * - เนเธเน fail-fast: เธ–เนเธฒเนเธกเนเธกเธต secret เธเธฐเนเธกเนเธชเธฒเธกเธฒเธฃเธ– start app เนเธ”เน
 * - เธกเธต detailed error messages เธชเธณเธซเธฃเธฑเธ debugging
 *
 * Workflow:
 * Request โ’ Extract Token โ’ Verify with DTAM Secret โ’ Check User Type โ’ Attach User Data โ’ Continue
 */

const shared = require('../../shared');
const { constants } = shared;
const logger = require('../../../shared/logger');
// Resolve JWT config from repository root to keep ESM/CJS compatibility in tests
const jwtConfig = require('../../../config/jwt-security');

// เนเธซเธฅเธ” JWT configuration (เธเธฐ throw error เธ–เนเธฒเนเธกเนเธกเธต secret)
let JWT_CONFIG;
try {
  JWT_CONFIG = jwtConfig.loadJWTConfiguration();
  logger.info('โ… DTAM JWT configuration loaded successfully');
} catch (error) {
  logger.error('โ Failed to load DTAM JWT configuration:', error.message);
  process.exit(1);
}

/**
 * Verify DTAM staff token
 * Must be DTAM_STAFF user type
 *
 * Logic:
 * 1. Extract Bearer token เธเธฒเธ Authorization header
 * 2. Verify token เธ”เนเธงเธข DTAM JWT secret (เนเธขเธเธเธฒเธ public)
 * 3. เธ•เธฃเธงเธเธชเธญเธ userType เธ•เนเธญเธเน€เธเนเธ DTAM_STAFF
 * 4. Attach user info เนเธเธ—เธตเน req.user
 * 5. Continue to next middleware
 */
const verifyDTAMToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return shared.response.error(
        res,
        'เนเธกเนเธเธ Authorization header',
        constants.statusCodes.UNAUTHORIZED,
      );
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return shared.response.error(res, 'เนเธกเนเธเธ token', constants.statusCodes.UNAUTHORIZED);
    }

    // Verify token with DTAM secret (เธเธฒเธ secure configuration)
    const decoded = jwtConfig.verifyToken(token, 'dtam', JWT_CONFIG);

    // Verify user type is DTAM_STAFF
    if (decoded.userType !== 'DTAM_STAFF') {
      return shared.response.error(
        res,
        'เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเน€เธเนเธฒเธ–เธถเธ - เธ•เนเธญเธเน€เธเนเธเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน DTAM เน€เธ—เนเธฒเธเธฑเนเธ',
        constants.statusCodes.FORBIDDEN,
      );
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      userType: decoded.userType,
      role: decoded.role,
      department: decoded.department,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return shared.response.error(res, 'Token เนเธกเนเธ–เธนเธเธ•เนเธญเธ', constants.statusCodes.UNAUTHORIZED);
    }

    if (error.name === 'TokenExpiredError') {
      return shared.response.error(
        res,
        'Token เธซเธกเธ”เธญเธฒเธขเธธ เธเธฃเธธเธ“เธฒเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเนเธซเธกเน',
        constants.statusCodes.UNAUTHORIZED,
      );
    }

    logger.error('DTAM token verification error:', error);
    return shared.response.error(
      res,
      'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเธชเธดเธ—เธเธดเน',
      constants.statusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * Check if user has specific role
 * Usage: requireDTAMRole(['admin', 'manager'])
 * @param {Array<string>} allowedRoles - List of allowed roles
 * @returns {Function} Express middleware
 */
const requireDTAMRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return shared.response.error(res, 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธนเนเนเธเน', constants.statusCodes.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return shared.response.error(
        res,
        'เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเนเธเธเธฒเธฃเธ”เธณเน€เธเธดเธเธเธฒเธฃเธเธตเน',
        constants.statusCodes.FORBIDDEN,
        {
          requiredRole: allowedRoles,
          yourRole: req.user.role,
        },
      );
    }

    next();
  };
};

/**
 * Admin only middleware
 * Shorthand for requireDTAMRole(['admin'])
 */
const requireDTAMAdmin = (req, res, next) => {
  if (!req.user) {
    return shared.response.error(res, 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธนเนเนเธเน', constants.statusCodes.UNAUTHORIZED);
  }

  if (req.user.role !== 'admin') {
    return shared.response.error(
      res,
      'เธ•เนเธญเธเน€เธเนเธเธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธเน€เธ—เนเธฒเธเธฑเนเธ',
      constants.statusCodes.FORBIDDEN,
    );
  }

  next();
};

/**
 * Manager or Admin middleware
 * Allows both managers and admins
 */
const requireDTAMManagerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return shared.response.error(res, 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธนเนเนเธเน', constants.statusCodes.UNAUTHORIZED);
  }

  if (!['admin', 'manager'].includes(req.user.role)) {
    return shared.response.error(
      res,
      'เธ•เนเธญเธเน€เธเนเธเธเธนเนเธเธฑเธ”เธเธฒเธฃเธซเธฃเธทเธญเธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธเน€เธ—เนเธฒเธเธฑเนเธ',
      constants.statusCodes.FORBIDDEN,
    );
  }

  next();
};

module.exports = {
  verifyDTAMToken,
  requireDTAMRole,
  requireDTAMAdmin,
  requireDTAMManagerOrAdmin,
};
