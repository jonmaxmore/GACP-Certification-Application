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
const DTAMStaff = require('../models/DTAMStaff');
const logger = require('../../../shared/logger');

/**
 * @route POST /api/auth-dtam/login
 * @desc DTAM Staff Login - Separate from public farmer login
 * @access Public
 */
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('กรุณากรอกชื่อผู้ใช้'),
    body('password').notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),
    body('userType').equals('DTAM_STAFF').withMessage('ประเภทผู้ใช้ไม่ถูกต้อง'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return shared.response.error(
          res,
          'ข้อมูลไม่ถูกต้อง',
          shared.constants.statusCodes.BAD_REQUEST,
          errors.array(),
        );
      }

      const { username, password, userType } = req.body;

      // Verify userType is DTAM_STAFF
      if (userType !== 'DTAM_STAFF') {
        return shared.response.error(
          res,
          'คุณไม่มีสิทธิ์เข้าถึงระบบนี้',
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
          'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          shared.constants.statusCodes.UNAUTHORIZED,
        );
      }

      // Check if account is active
      if (!staff.isActive) {
        return shared.response.error(
          res,
          'บัญชีของคุณถูกระงับการใช้งาน',
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
          'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
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
            department: staff.department,
          },
        },
        'เข้าสู่ระบบสำเร็จ',
      );
    } catch (error) {
      logger.error('DTAM login error:', error);
      return shared.response.error(
        res,
        'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
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
    'ไม่สามารถสมัครสมาชิกด้วยตนเองได้ - บัญชีเจ้าหน้าที่ต้องสร้างโดยผู้ดูแลระบบเท่านั้น กรุณาติดต่อผู้ดูแลระบบ',
    shared.constants.statusCodes.FORBIDDEN,
  );
});

/**
 * @route GET /api/auth-dtam/verify
 * @desc Verify DTAM token
 * @access Public
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return shared.response.error(res, 'ไม่พบ token', shared.constants.statusCodes.UNAUTHORIZED);
    }

    // Verify token with DTAM secret
    const dtamJwtSecret =
      config.environment.dtamJwtSecret ||
      process.env.DTAM_JWT_SECRET ||
      'gacp-dtam-secret-key-2025';
    const decoded = jwt.verify(token, dtamJwtSecret);

    // Verify userType
    if (decoded.userType !== 'DTAM_STAFF') {
      return shared.response.error(res, 'Token ไม่ถูกต้อง', shared.constants.statusCodes.FORBIDDEN);
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
        'Token ไม่ถูกต้อง',
        shared.constants.statusCodes.UNAUTHORIZED,
      );
    }
    if (error.name === 'TokenExpiredError') {
      return shared.response.error(res, 'Token หมดอายุ', shared.constants.statusCodes.UNAUTHORIZED);
    }
    logger.error('DTAM token verification error:', error);
    return shared.response.error(
      res,
      'เกิดข้อผิดพลาดในการตรวจสอบ token',
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
        'ไม่พบข้อมูลผู้ใช้',
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
      'ไม่สามารถดึงข้อมูลโปรไฟล์ได้',
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
        'เกิดข้อผิดพลาด',
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
      .withMessage('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
    body('email').isEmail().normalizeEmail().withMessage('กรุณาใส่อีเมลที่ถูกต้อง'),
    body('password').isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    body('firstName').notEmpty().withMessage('กรุณาใส่ชื่อ'),
    body('lastName').notEmpty().withMessage('กรุณาใส่นามสกุล'),
    body('role')
      .isIn(['admin', 'reviewer', 'manager', 'inspector'])
      .withMessage('ตำแหน่งไม่ถูกต้อง'),
  ],
  async (req, res) => {
    try {
      // Validate request
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
        password, // Will be hashed by pre-save middleware
        firstName,
        lastName,
        userType: 'DTAM_STAFF',
        role,
        department: department || 'กรมส่งเสริมการเกษตร',
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
        'สร้างบัญชีเจ้าหน้าที่สำเร็จ',
        shared.constants.statusCodes.CREATED,
      );
    } catch (error) {
      logger.error('Create DTAM staff error:', error);
      return shared.response.error(
        res,
        'ไม่สามารถสร้างบัญชีได้',
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

module.exports = router;
