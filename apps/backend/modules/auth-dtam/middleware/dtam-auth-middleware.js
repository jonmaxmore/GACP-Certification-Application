/**
 * DTAM Authentication Middleware
 * Separate middleware for DTAM government staff
 * Uses different JWT secret from public system
 * Migrated from microservices/auth-service/src/middleware/dtam-auth.js
 *
 * ที่มาที่ไป (WHY):
 * - แยก JWT secret ระหว่าง public และ government เพื่อความปลอดภัย
 * - ใช้ fail-fast: ถ้าไม่มี secret จะไม่สามารถ start app ได้
 * - มี detailed error messages สำหรับ debugging
 *
 * Workflow:
 * Request → Extract Token → Verify with DTAM Secret → Check User Type → Attach User Data → Continue
 */

const shared = require('../../shared');
const { constants } = shared;
const logger = require('../../../shared/logger');
// Resolve JWT config from repository root to keep ESM/CJS compatibility in tests
const jwtConfig = require('../../../../../config/jwt-security');

// โหลด JWT configuration (จะ throw error ถ้าไม่มี secret)
let JWT_CONFIG;
try {
  JWT_CONFIG = jwtConfig.loadJWTConfiguration();
  logger.info('✅ DTAM JWT configuration loaded successfully');
} catch (error) {
  logger.error('❌ Failed to load DTAM JWT configuration:', error.message);
  process.exit(1);
}

/**
 * Verify DTAM staff token
 * Must be DTAM_STAFF user type
 *
 * Logic:
 * 1. Extract Bearer token จาก Authorization header
 * 2. Verify token ด้วย DTAM JWT secret (แยกจาก public)
 * 3. ตรวจสอบ userType ต้องเป็น DTAM_STAFF
 * 4. Attach user info ไปที่ req.user
 * 5. Continue to next middleware
 */
const verifyDTAMToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return shared.response.error(
        res,
        'ไม่พบ Authorization header',
        constants.statusCodes.UNAUTHORIZED,
      );
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return shared.response.error(res, 'ไม่พบ token', constants.statusCodes.UNAUTHORIZED);
    }

    // Verify token with DTAM secret (จาก secure configuration)
    const decoded = jwtConfig.verifyToken(token, 'dtam', JWT_CONFIG);

    // Verify user type is DTAM_STAFF
    if (decoded.userType !== 'DTAM_STAFF') {
      return shared.response.error(
        res,
        'คุณไม่มีสิทธิ์เข้าถึง - ต้องเป็นเจ้าหน้าที่ DTAM เท่านั้น',
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
      return shared.response.error(res, 'Token ไม่ถูกต้อง', constants.statusCodes.UNAUTHORIZED);
    }

    if (error.name === 'TokenExpiredError') {
      return shared.response.error(
        res,
        'Token หมดอายุ กรุณาเข้าสู่ระบบใหม่',
        constants.statusCodes.UNAUTHORIZED,
      );
    }

    logger.error('DTAM token verification error:', error);
    return shared.response.error(
      res,
      'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
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
      return shared.response.error(res, 'ไม่พบข้อมูลผู้ใช้', constants.statusCodes.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return shared.response.error(
        res,
        'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
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
    return shared.response.error(res, 'ไม่พบข้อมูลผู้ใช้', constants.statusCodes.UNAUTHORIZED);
  }

  if (req.user.role !== 'admin') {
    return shared.response.error(
      res,
      'ต้องเป็นผู้ดูแลระบบเท่านั้น',
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
    return shared.response.error(res, 'ไม่พบข้อมูลผู้ใช้', constants.statusCodes.UNAUTHORIZED);
  }

  if (!['admin', 'manager'].includes(req.user.role)) {
    return shared.response.error(
      res,
      'ต้องเป็นผู้จัดการหรือผู้ดูแลระบบเท่านั้น',
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
