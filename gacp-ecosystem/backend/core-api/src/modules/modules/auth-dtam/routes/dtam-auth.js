/**
 * DTAM Staff Authentication Routes
 * Separate authentication system for government staff
 * NO self-registration - accounts created by admin only
 * Migrated from microservices/auth-service/src/routes/auth-dtam.js
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import from shared module
const shared = require('../../shared');
const { config } = shared;

// Import DTAM-specific middleware (not from shared)
const dtamMiddleware = require('../middleware/dtam-auth-middleware');

// Import DTAM-specific models
const DTAMStaff = require('../models/d-t-a-m-staff');
const logger = require('../../../../shared/logger');

/**
 * Role-based Permissions Configuration
 * Based on SCOPE_OF_WORK.md
 */
const ROLE_PERMISSIONS = {
  REVIEWER_AUDITOR: [
    'document.review',
    'document.approve',
    'document.reject',
    'audit.conduct',
    'audit.report',
    'car.create',
    'car.review',
  ],
  SCHEDULER: [
    'schedule.create',
    'schedule.update',
    'schedule.assign',
    'schedule.view',
    'auditor.availability',
  ],
  ACCOUNTANT: [
    'quote.view',
    'quote.update',
    'invoice.view',
    'invoice.update',
    'receipt.create',
    'receipt.print',
    'report.financial',
  ],
  ADMIN: [
    'staff.list',
    'staff.view',
    'staff.create',
    'staff.update',
    'settings.view',
    'settings.update',
    'report.all',
  ],
  SUPER_ADMIN: [
    'staff.list',
    'staff.view',
    'staff.create',
    'staff.update',
    'staff.delete',
    'settings.view',
    'settings.update',
    'settings.system',
    'report.all',
    'system.config',
  ],
  // Legacy roles mapping
  admin: ['staff.list', 'staff.create', 'staff.update', 'report.all'],
  reviewer: ['document.review', 'document.approve', 'document.reject'],
  manager: ['staff.list', 'schedule.view', 'report.all'],
  inspector: ['audit.conduct', 'audit.report'],
};

const ROLE_DISPLAY_NAMES = {
  REVIEWER_AUDITOR: 'เธเธนเนเธ•เธฃเธงเธเธชเธญเธเน€เธญเธเธชเธฒเธฃ/เธเธนเนเธ•เธฃเธงเธเธเธฃเธฐเน€เธกเธดเธ',
  SCHEDULER: 'เธเธนเนเธเธฑเธ”เธเธดเธงเธเธฑเธ”เธซเธกเธฒเธข',
  ACCOUNTANT: 'เธเธเธฑเธเธเธฒเธเธเธฑเธเธเธต',
  ADMIN: 'เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ',
  SUPER_ADMIN: 'เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธเธชเธนเธเธชเธธเธ”',
  admin: 'เธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ',
  reviewer: 'เธเธนเนเธ•เธฃเธงเธเธชเธญเธ',
  manager: 'เธเธนเนเธเธฑเธ”เธเธฒเธฃ',
  inspector: 'เธเธนเนเธ•เธฃเธงเธเธเธฃเธฐเน€เธกเธดเธ',
};

const ROLE_DASHBOARD_URLS = {
  REVIEWER_AUDITOR: '/staff/dashboard/reviewer',
  SCHEDULER: '/staff/dashboard/scheduler',
  ACCOUNTANT: '/staff/dashboard/accountant',
  ADMIN: '/staff/dashboard/admin',
  SUPER_ADMIN: '/staff/dashboard/admin',
  admin: '/staff/dashboard/admin',
  reviewer: '/staff/dashboard/reviewer',
  manager: '/staff/dashboard/admin',
  inspector: '/staff/dashboard/reviewer',
};

function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

function getRoleDisplayName(role) {
  return ROLE_DISPLAY_NAMES[role] || role;
}

function getDashboardUrl(role) {
  return ROLE_DASHBOARD_URLS[role] || '/staff/dashboard';
}

/**
 * @route POST /api/auth-dtam/login
 * @desc DTAM Staff Login - Separate from public farmer login
 * @access Public
 */
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธทเนเธญเธเธนเนเนเธเน'),
    body('password').notEmpty().withMessage('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธฃเธซเธฑเธชเธเนเธฒเธ'),
    body('userType').equals('DTAM_STAFF').withMessage('เธเธฃเธฐเน€เธ เธ—เธเธนเนเนเธเนเนเธกเนเธ–เธนเธเธ•เนเธญเธ'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return shared.response.error(
          res,
          'เธเนเธญเธกเธนเธฅเนเธกเนเธ–เธนเธเธ•เนเธญเธ',
          shared.constants.statusCodes.BAD_REQUEST,
          errors.array(),
        );
      }

      const { username, password, userType } = req.body;

      // Verify userType is DTAM_STAFF
      if (userType !== 'DTAM_STAFF') {
        return shared.response.error(
          res,
          'เธเธธเธ“เนเธกเนเธกเธตเธชเธดเธ—เธเธดเนเน€เธเนเธฒเธ–เธถเธเธฃเธฐเธเธเธเธตเน',
          shared.constants.statusCodes.FORBIDDEN,
        );
      }

      // Find staff user by username or email
      const staff = await DTAMStaff.findOne({
        $or: [{ username: username }, { email: username }],
        userType: 'DTAM_STAFF',
      });

      if (!staff) {
        return shared.response.error(
          res,
          'เธเธทเนเธญเธเธนเนเนเธเนเธซเธฃเธทเธญเธฃเธซเธฑเธชเธเนเธฒเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ',
          shared.constants.statusCodes.UNAUTHORIZED,
        );
      }

      // Check if account is active
      if (!staff.isActive) {
        return shared.response.error(
          res,
          'เธเธฑเธเธเธตเธเธญเธเธเธธเธ“เธ–เธนเธเธฃเธฐเธเธฑเธเธเธฒเธฃเนเธเนเธเธฒเธ',
          shared.constants.statusCodes.FORBIDDEN,
        );
      }

      // Verify password
      const isPasswordValid = await staff.comparePassword(password);
      if (!isPasswordValid) {
        // Increment failed attempts
        staff.failedLoginAttempts += 1;
        if (staff.failedLoginAttempts >= 5) {
          staff.isActive = false;
          staff.lockedAt = new Date();
        }
        await staff.save();

        return shared.response.error(
          res,
          'เธเธทเนเธญเธเธนเนเนเธเนเธซเธฃเธทเธญเธฃเธซเธฑเธชเธเนเธฒเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ',
          shared.constants.statusCodes.UNAUTHORIZED,
        );
      }

      // Reset failed attempts on successful login
      staff.failedLoginAttempts = 0;
      staff.lastLoginAt = new Date();
      await staff.save();

      // Generate DTAM-specific JWT token (separate secret)
      const dtamJwtSecret =
        config.environment.dtamJwtSecret ||
        process.env.DTAM_JWT_SECRET ||
        'gacp-dtam-secret-key-2025';
      const token = jwt.sign(
        {
          userId: staff._id,
          username: staff.username,
          email: staff.email,
          userType: 'DTAM_STAFF',
          role: staff.role,
          department: staff.department,
        },
        dtamJwtSecret,
        { expiresIn: '8h' }, // Shorter session for security
      );

      logger.info(`DTAM staff login successful: ${staff.username} (${staff.role})`);

      // Get permissions based on role
      const rolePermissions = getRolePermissions(staff.role);
      const dashboardUrl = getDashboardUrl(staff.role);

      return shared.response.success(
        res,
        {
          token,
          user: {
            userId: staff._id,
            username: staff.username,
            email: staff.email,
            firstName: staff.firstName,
            lastName: staff.lastName,
            userType: 'DTAM_STAFF',
            role: staff.role,
            roleDisplayName: getRoleDisplayName(staff.role),
            department: staff.department,
            permissions: rolePermissions,
            dashboardUrl: dashboardUrl,
          },
        },
        'เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเธชเธณเน€เธฃเนเธ',
      );
    } catch (error) {
      logger.error('DTAM login error:', error);
      return shared.response.error(
        res,
        'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route POST /api/auth-dtam/register
 * @desc BLOCKED - DTAM staff cannot self-register
 * @access Public (but always returns 403)
 */
router.post('/register', (req, res) => {
  return shared.response.error(
    res,
    'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธชเธกเธฑเธเธฃเธชเธกเธฒเธเธดเธเธ”เนเธงเธขเธ•เธเน€เธญเธเนเธ”เน - เธเธฑเธเธเธตเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธ•เนเธญเธเธชเธฃเนเธฒเธเนเธ”เธขเธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธเน€เธ—เนเธฒเธเธฑเนเธ เธเธฃเธธเธ“เธฒเธ•เธดเธ”เธ•เนเธญเธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ',
    shared.constants.statusCodes.FORBIDDEN,
  );
});

/**
 * @route POST /api/auth-dtam/setup
 * @desc First-time setup - Create initial admin account
 * @access Public (only works when NO staff exists in database)
 */
router.post(
  '/setup',
  [
    body('email').isEmail().withMessage('เธญเธตเน€เธกเธฅเนเธกเนเธ–เธนเธเธ•เนเธญเธ'),
    body('username').isLength({ min: 3 }).withMessage('เธเธทเนเธญเธเธนเนเนเธเนเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข 3 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ'),
    body('password').isLength({ min: 6 }).withMessage('เธฃเธซเธฑเธชเธเนเธฒเธเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข 6 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ'),
    body('firstName').notEmpty().withMessage('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธทเนเธญ'),
    body('lastName').notEmpty().withMessage('เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธฒเธกเธชเธเธธเธฅ'),
    body('setupKey').equals(process.env.ADMIN_SETUP_KEY || 'GACP-FIRST-ADMIN-2025').withMessage('Setup key เนเธกเนเธ–เธนเธเธ•เนเธญเธ'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return shared.response.error(
          res,
          errors.array()[0].msg,
          shared.constants.statusCodes.BAD_REQUEST,
        );
      }

      // Check if any staff exists
      const staffCount = await DTAMStaff.countDocuments();
      if (staffCount > 0) {
        return shared.response.error(
          res,
          'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธเนเธเธฒเธ setup เนเธ”เน - เธกเธตเธเธฑเธเธเธตเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธญเธขเธนเนเนเธฅเนเธง เธเธฃเธธเธ“เธฒเธ•เธดเธ”เธ•เนเธญเธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ',
          shared.constants.statusCodes.FORBIDDEN,
        );
      }

      const { email, username, password, firstName, lastName } = req.body;

      // Create first admin account
      const admin = new DTAMStaff({
        email,
        username,
        password,
        firstName,
        lastName,
        role: 'admin', // Valid enum: admin, auditor, officer
        department: 'IT',
        isActive: true,
        userType: 'DTAM_STAFF',
      });

      await admin.save();

      logger.info(`First admin account created: ${username} (${email})`);

      return shared.response.success(
        res,
        {
          message: 'เธชเธฃเนเธฒเธเธเธฑเธเธเธตเธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธเธชเธณเน€เธฃเนเธ',
          user: {
            userId: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
        },
        'Setup เธชเธณเน€เธฃเนเธ - เธชเธฒเธกเธฒเธฃเธ–เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธเนเธ”เนเนเธฅเนเธง',
        shared.constants.statusCodes.CREATED,
      );
    } catch (error) {
      logger.error('Setup error:', error);
      return shared.response.error(
        res,
        error.message || 'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธชเธฃเนเธฒเธเธเธฑเธเธเธต',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route GET /api/auth-dtam/verify
 * @desc Verify DTAM token
 * @access Public
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return shared.response.error(res, 'เนเธกเนเธเธ token', shared.constants.statusCodes.UNAUTHORIZED);
    }

    // Verify token with DTAM secret
    const dtamJwtSecret =
      config.environment.dtamJwtSecret ||
      process.env.DTAM_JWT_SECRET ||
      'gacp-dtam-secret-key-2025';
    const decoded = jwt.verify(token, dtamJwtSecret);

    // Verify userType
    if (decoded.userType !== 'DTAM_STAFF') {
      return shared.response.error(res, 'Token เนเธกเนเธ–เธนเธเธ•เนเธญเธ', shared.constants.statusCodes.FORBIDDEN);
    }

    return shared.response.success(res, {
      valid: true,
      user: {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        userType: decoded.userType,
        role: decoded.role,
        department: decoded.department,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return shared.response.error(
        res,
        'Token เนเธกเนเธ–เธนเธเธ•เนเธญเธ',
        shared.constants.statusCodes.UNAUTHORIZED,
      );
    }
    if (error.name === 'TokenExpiredError') {
      return shared.response.error(res, 'Token เธซเธกเธ”เธญเธฒเธขเธธ', shared.constants.statusCodes.UNAUTHORIZED);
    }
    logger.error('DTAM token verification error:', error);
    return shared.response.error(
      res,
      'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”เนเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธ token',
      shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

/**
 * @route GET /api/auth-dtam/profile
 * @desc Get DTAM staff profile
 * @access Private (DTAM staff only)
 */
router.get('/profile', dtamMiddleware.verifyDTAMToken, async (req, res) => {
  try {
    const staff = await DTAMStaff.findById(req.user.userId).select('-password');

    if (!staff || !staff.isActive) {
      return shared.response.error(
        res,
        'เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธเธนเนเนเธเน',
        shared.constants.statusCodes.NOT_FOUND,
      );
    }

    return shared.response.success(res, {
      userId: staff._id,
      username: staff.username,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      userType: staff.userType,
      role: staff.role,
      department: staff.department,
      isActive: staff.isActive,
      lastLoginAt: staff.lastLoginAt,
      createdAt: staff.createdAt,
    });
  } catch (error) {
    logger.error('Get DTAM profile error:', error);
    return shared.response.error(
      res,
      'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธ”เธถเธเธเนเธญเธกเธนเธฅเนเธเธฃเนเธเธฅเนเนเธ”เน',
      shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

/**
 * @route GET /api/auth-dtam/staff-list
 * @desc Get list of DTAM staff (admin only)
 * @access Private (DTAM admin only)
 */
router.get(
  '/staff-list',
  dtamMiddleware.verifyDTAMToken,
  dtamMiddleware.requireDTAMAdmin,
  async (req, res) => {
    try {
      const staffList = await DTAMStaff.find().select('-password').sort({ createdAt: -1 });

      return shared.response.success(res, {
        count: staffList.length,
        staff: staffList.map(staff => ({
          userId: staff._id,
          username: staff.username,
          email: staff.email,
          firstName: staff.firstName,
          lastName: staff.lastName,
          role: staff.role,
          department: staff.department,
          isActive: staff.isActive,
          createdAt: staff.createdAt,
          lastLoginAt: staff.lastLoginAt,
        })),
      });
    } catch (error) {
      logger.error('Get DTAM staff list error:', error);
      return shared.response.error(
        res,
        'เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route POST /api/auth-dtam/create-staff
 * @desc Create new DTAM staff account (admin only)
 * @access Private (DTAM admin only)
 */
router.post(
  '/create-staff',
  [
    dtamMiddleware.verifyDTAMToken,
    dtamMiddleware.requireDTAMAdmin,
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('เธเธทเนเธญเธเธนเนเนเธเนเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข 3 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ'),
    body('email').isEmail().normalizeEmail().withMessage('เธเธฃเธธเธ“เธฒเนเธชเนเธญเธตเน€เธกเธฅเธ—เธตเนเธ–เธนเธเธ•เนเธญเธ'),
    body('password').isLength({ min: 8 }).withMessage('เธฃเธซเธฑเธชเธเนเธฒเธเธ•เนเธญเธเธกเธตเธญเธขเนเธฒเธเธเนเธญเธข 8 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ'),
    body('firstName').notEmpty().withMessage('เธเธฃเธธเธ“เธฒเนเธชเนเธเธทเนเธญ'),
    body('lastName').notEmpty().withMessage('เธเธฃเธธเธ“เธฒเนเธชเนเธเธฒเธกเธชเธเธธเธฅ'),
    body('role')
      .isIn(['admin', 'reviewer', 'manager', 'inspector'])
      .withMessage('เธ•เธณเนเธซเธเนเธเนเธกเนเธ–เธนเธเธ•เนเธญเธ'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return shared.response.error(
          res,
          'เธเนเธญเธกเธนเธฅเนเธกเนเธ–เธนเธเธ•เนเธญเธ',
          shared.constants.statusCodes.BAD_REQUEST,
          errors.array(),
        );
      }

      const { username, email, password, firstName, lastName, role, department } = req.body;

      // Check if username or email already exists
      const existingStaff = await DTAMStaff.findOne({
        $or: [{ username }, { email }],
      });

      if (existingStaff) {
        return shared.response.error(
          res,
          'เธเธทเนเธญเธเธนเนเนเธเนเธซเธฃเธทเธญเธญเธตเน€เธกเธฅเธเธตเนเธ–เธนเธเนเธเนเธเธฒเธเนเธฅเนเธง',
          shared.constants.statusCodes.CONFLICT,
        );
      }

      // Create new staff
      const newStaff = new DTAMStaff({
        username,
        email,
        password, // Will be hashed by pre-save middleware
        firstName,
        lastName,
        userType: 'DTAM_STAFF',
        role,
        department: department || 'เธเธฃเธกเธชเนเธเน€เธชเธฃเธดเธกเธเธฒเธฃเน€เธเธฉเธ•เธฃ',
        isActive: true,
      });

      await newStaff.save();

      logger.info(`New DTAM staff created: ${newStaff.username} by ${req.user.username}`);

      return shared.response.success(
        res,
        {
          userId: newStaff._id,
          username: newStaff.username,
          email: newStaff.email,
          firstName: newStaff.firstName,
          lastName: newStaff.lastName,
          role: newStaff.role,
          department: newStaff.department,
        },
        'เธชเธฃเนเธฒเธเธเธฑเธเธเธตเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธชเธณเน€เธฃเนเธ',
        shared.constants.statusCodes.CREATED,
      );
    } catch (error) {
      logger.error('Create DTAM staff error:', error);
      return shared.response.error(
        res,
        'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธชเธฃเนเธฒเธเธเธฑเธเธเธตเนเธ”เน',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route GET /api/auth-dtam/health
 * @desc Health check for DTAM auth
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const staffCount = await DTAMStaff.countDocuments();
    const activeCount = await DTAMStaff.countDocuments({ isActive: true });

    res.json({
      service: 'auth-dtam',
      status: 'healthy',
      staffCount,
      activeStaffCount: activeCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      service: 'auth-dtam',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ==========================================
// NEW FEATURES (Based on Code Review)
// ==========================================

/**
 * Token Blacklist (In-Memory)
 * In production, use Redis for distributed systems
 */
const tokenBlacklist = new Set();

/**
 * Check if token is blacklisted
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * Role Hierarchy for permission checking
 * Higher number = higher privilege
 */
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  admin: 80,
  manager: 60,
  SCHEDULER: 50,
  ACCOUNTANT: 50,
  REVIEWER_AUDITOR: 40,
  reviewer: 40,
  auditor: 40,
  officer: 30,
  inspector: 30,
};

/**
 * Check if creator can create a role
 * @param {string} creatorRole - Role of the person creating
 * @param {string} targetRole - Role being created
 * @returns {boolean}
 */
function canCreateRole(creatorRole, targetRole) {
  const creatorLevel = ROLE_HIERARCHY[creatorRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

  // Can only create roles equal or lower than your own
  // Exception: SUPER_ADMIN can create any role
  if (creatorRole === 'SUPER_ADMIN') {
    return true;
  }

  return creatorLevel >= targetLevel;
}

/**
 * @route POST /api/auth-dtam/logout
 * @desc DTAM Staff Logout - Invalidate token
 * @access Private (requires valid DTAM token)
 */
router.post('/logout', dtamMiddleware.verifyDTAMToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // Add token to blacklist
      tokenBlacklist.add(token);

      // Clean up old tokens periodically (simple implementation)
      // In production, use Redis with TTL
      if (tokenBlacklist.size > 10000) {
        // Clear oldest entries if too many (simple cleanup)
        const tokens = Array.from(tokenBlacklist);
        tokenBlacklist.clear();
        tokens.slice(-5000).forEach(t => tokenBlacklist.add(t));
      }

      logger.info(`DTAM staff logged out: ${req.user.username}`);
    }

    return shared.response.success(
      res,
      { message: 'ออกจากระบบสำเร็จ' },
      'Logout successful',
    );
  } catch (error) {
    logger.error('Logout error:', error);
    return shared.response.error(
      res,
      'เกิดข้อผิดพลาดในการออกจากระบบ',
      shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

/**
 * @route POST /api/auth-dtam/change-password
 * @desc Change own password
 * @access Private (DTAM staff only)
 */
router.post(
  '/change-password',
  [
    dtamMiddleware.verifyDTAMToken,
    body('currentPassword').notEmpty().withMessage('กรุณากรอกรหัสผ่านปัจจุบัน'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.newPassword)
      .withMessage('รหัสผ่านใหม่ไม่ตรงกัน'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return shared.response.error(
          res,
          errors.array()[0].msg,
          shared.constants.statusCodes.BAD_REQUEST,
        );
      }

      const { currentPassword, newPassword } = req.body;

      // Find staff with password
      const staff = await DTAMStaff.findById(req.user.userId).select('+password');
      if (!staff) {
        return shared.response.error(
          res,
          'ไม่พบข้อมูลผู้ใช้',
          shared.constants.statusCodes.NOT_FOUND,
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await staff.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return shared.response.error(
          res,
          'รหัสผ่านปัจจุบันไม่ถูกต้อง',
          shared.constants.statusCodes.UNAUTHORIZED,
        );
      }

      // Check if new password is same as current
      const isSamePassword = await staff.comparePassword(newPassword);
      if (isSamePassword) {
        return shared.response.error(
          res,
          'รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน',
          shared.constants.statusCodes.BAD_REQUEST,
        );
      }

      // Update password (will be hashed by pre-save hook)
      staff.password = newPassword;
      staff.passwordChangedAt = new Date();
      await staff.save();

      logger.info(`Password changed for DTAM staff: ${staff.username}`);

      return shared.response.success(
        res,
        { message: 'เปลี่ยนรหัสผ่านสำเร็จ' },
        'Password changed successfully',
      );
    } catch (error) {
      logger.error('Change password error:', error);
      return shared.response.error(
        res,
        'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route POST /api/auth-dtam/create-staff-v2
 * @desc Create new DTAM staff account with role hierarchy check
 * @access Private (DTAM admin only, with role hierarchy validation)
 */
router.post(
  '/create-staff-v2',
  [
    dtamMiddleware.verifyDTAMToken,
    dtamMiddleware.requireDTAMAdmin,
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
    body('email').isEmail().normalizeEmail().withMessage('กรุณาใส่อีเมลที่ถูกต้อง'),
    body('password').isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    body('firstName').notEmpty().withMessage('กรุณาใส่ชื่อ'),
    body('lastName').notEmpty().withMessage('กรุณาใส่นามสกุล'),
    body('role')
      .isIn(['admin', 'reviewer', 'manager', 'inspector', 'auditor', 'officer'])
      .withMessage('ตำแหน่งไม่ถูกต้อง'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return shared.response.error(
          res,
          'ข้อมูลไม่ถูกต้อง',
          shared.constants.statusCodes.BAD_REQUEST,
          errors.array(),
        );
      }

      const { username, email, password, firstName, lastName, role, department } = req.body;

      // Role Hierarchy Check: Prevent creating roles higher than your own
      if (!canCreateRole(req.user.role, role)) {
        logger.warn(`Role hierarchy violation: ${req.user.username} (${req.user.role}) tried to create ${role}`);
        return shared.response.error(
          res,
          `คุณไม่มีสิทธิ์สร้างบัญชีตำแหน่ง "${getRoleDisplayName(role)}" เนื่องจากเป็นตำแหน่งที่สูงกว่าหรือเท่ากับตำแหน่งของคุณ`,
          shared.constants.statusCodes.FORBIDDEN,
        );
      }

      // Check if username or email already exists
      const existingStaff = await DTAMStaff.findOne({
        $or: [{ username }, { email }],
      });

      if (existingStaff) {
        return shared.response.error(
          res,
          'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว',
          shared.constants.statusCodes.CONFLICT,
        );
      }

      // Create new staff
      const newStaff = new DTAMStaff({
        username,
        email,
        password,
        firstName,
        lastName,
        userType: 'DTAM_STAFF',
        role,
        department: department || 'กรมส่งเสริมการเกษตร',
        isActive: true,
      });

      await newStaff.save();

      logger.info(`New DTAM staff created: ${newStaff.username} (${role}) by ${req.user.username} (${req.user.role})`);

      return shared.response.success(
        res,
        {
          userId: newStaff._id,
          username: newStaff.username,
          email: newStaff.email,
          firstName: newStaff.firstName,
          lastName: newStaff.lastName,
          role: newStaff.role,
          roleDisplayName: getRoleDisplayName(newStaff.role),
          department: newStaff.department,
          createdBy: {
            username: req.user.username,
            role: req.user.role,
          },
        },
        'สร้างบัญชีเจ้าหน้าที่สำเร็จ',
        shared.constants.statusCodes.CREATED,
      );
    } catch (error) {
      logger.error('Create DTAM staff v2 error:', error);
      return shared.response.error(
        res,
        'ไม่สามารถสร้างบัญชีได้',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Export token blacklist check for middleware use
router.isTokenBlacklisted = isTokenBlacklisted;
router.canCreateRole = canCreateRole;
router.ROLE_HIERARCHY = ROLE_HIERARCHY;

module.exports = router;

