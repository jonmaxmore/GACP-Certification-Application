/**
 * Farmer Authentication Routes
 * Handles registration, login, profile management for farmer users
 * Migrated from microservices/auth-service/src/routes/auth.js
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import from shared module
const shared = require('../../shared');
const { config, middleware } = shared;
const path = require('path');
const jwtSecurity = require(path.resolve(__dirname, '../../../../../config/jwt-security'));

// Import farmer-specific models (use absolute path to avoid case-sensitivity issues)
const User = require(path.join(process.cwd(), 'models', 'User.js'));
const logger = require('../../../shared/logger');

function getFarmerJwtOptions() {
  const jwtConfig = jwtSecurity.getJWTConfiguration();
  const farmerConfig = jwtConfig.public || {};

  const options = {
    secret: farmerConfig.secret || process.env.FARMER_JWT_SECRET || process.env.JWT_SECRET,
    expiresIn: farmerConfig.expiry || config.environment.jwtExpiry || '7d',
    issuer: farmerConfig.issuer,
    audience: farmerConfig.audience,
    algorithm: farmerConfig.algorithm || 'HS256',
  };

  if (!options.secret) {
    throw new Error('Farmer JWT secret is not configured');
  }

  return options;
}

/**
 * @route POST /api/auth-farmer/register
 * @desc ลงทะเบียนเกษตรกรใหม่ (Register new farmer)
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('กรุณาใส่อีเมลที่ถูกต้อง'),
    body('password').isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    body('firstName').trim().isLength({ min: 2 }).withMessage('กรุณาใส่ชื่อ'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('กรุณาใส่นามสกุล'),
    body('phoneNumber').isMobilePhone('th-TH').withMessage('กรุณาใส่เบอร์โทรศัพท์ที่ถูกต้อง'),
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

      const { email, password, firstName, lastName, phoneNumber, organizationName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return shared.response.error(
          res,
          'อีเมลนี้ถูกใช้งานแล้ว',
          shared.constants.statusCodes.CONFLICT,
        );
      }

      // Create new farmer user
      const newUser = new User({
        email: email.toLowerCase(),
        password, // Will be hashed by pre-save middleware
        firstName,
        lastName,
        phoneNumber,
        role: shared.constants.userRoles.FARMER,
        organizationType: 'farmer',
        organizationName: organizationName || `${firstName} ${lastName} Farm`,
        accountStatus: 'active',
        isVerified: false,
      });

      await newUser.save();

      logger.info(`New farmer registered: ${newUser.email}`);

      // Generate JWT token
      const farmerJwt = getFarmerJwtOptions();
      const tokenPayload = {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
      };
      const tokenOptions = {
        expiresIn: farmerJwt.expiresIn,
        issuer: farmerJwt.issuer,
        audience: farmerJwt.audience,
        algorithm: farmerJwt.algorithm,
      };

      const token = jwt.sign(tokenPayload, farmerJwt.secret, tokenOptions);

      return shared.response.success(
        res,
        {
          token,
          user: {
            id: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            fullName: newUser.fullName,
            role: newUser.role,
            organizationType: newUser.organizationType,
            permissions: newUser.getPermissions(),
            accountStatus: newUser.accountStatus,
          },
        },
        'ลงทะเบียนสำเร็จ',
        shared.constants.statusCodes.CREATED,
      );
    } catch (error) {
      logger.error('Registration error:', error);
      return shared.response.error(
        res,
        'ไม่สามารถลงทะเบียนได้ในขณะนี้',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route POST /api/auth-farmer/login
 * @desc เข้าสู่ระบบเกษตรกร (Farmer login)
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('กรุณาใส่อีเมลที่ถูกต้อง'),
    body('password').notEmpty().withMessage('กรุณาใส่รหัสผ่าน'),
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

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return shared.response.error(
          res,
          'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          shared.constants.statusCodes.UNAUTHORIZED,
        );
      }

      // Check account status
      if (user.accountStatus === 'locked') {
        return shared.response.error(res, 'บัญชีถูกล็อก กรุณาติดต่อผู้ดูแลระบบ', 423);
      }

      if (user.accountStatus === 'suspended') {
        return shared.response.error(res, 'บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ', 423);
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        // Increment login attempts
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
          user.accountStatus = 'locked';
          user.lockedAt = new Date();
        }
        await user.save();

        return shared.response.error(
          res,
          'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
          shared.constants.statusCodes.UNAUTHORIZED,
        );
      }

      // Successful login - reset attempts and update login time
      user.loginAttempts = 0;
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      const farmerJwt = getFarmerJwtOptions();
      const tokenPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
      };
      const tokenOptions = {
        expiresIn: farmerJwt.expiresIn,
        issuer: farmerJwt.issuer,
        audience: farmerJwt.audience,
        algorithm: farmerJwt.algorithm,
      };

      const token = jwt.sign(tokenPayload, farmerJwt.secret, tokenOptions);

      logger.info(`Farmer logged in: ${user.email}`);

      return shared.response.success(
        res,
        {
          token,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            role: user.role,
            organizationType: user.organizationType,
            permissions: user.getPermissions(),
            accountStatus: user.accountStatus,
          },
        },
        'เข้าสู่ระบบสำเร็จ',
      );
    } catch (error) {
      logger.error('Login error:', error);
      return shared.response.error(
        res,
        'ไม่สามารถเข้าสู่ระบบได้ในขณะนี้',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route GET /api/auth-farmer/profile
 * @desc ดึงข้อมูลโปรไฟล์เกษตรกร (Get farmer profile)
 * @access Private
 */
router.get(
  '/profile',
  middleware.auth.authenticateToken || ((req, res, next) => next()),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');

      if (!user || user.accountStatus !== 'active') {
        return shared.response.error(res, 'ไม่พบผู้ใช้งาน', shared.constants.statusCodes.NOT_FOUND);
      }

      return shared.response.success(res, {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        organizationType: user.organizationType,
        organizationName: user.organizationName,
        permissions: user.getPermissions(),
        accountStatus: user.accountStatus,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      return shared.response.error(
        res,
        'ไม่สามารถดึงข้อมูลโปรไฟล์ได้',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route PUT /api/auth-farmer/profile
 * @desc อัปเดตโปรไฟล์เกษตรกร (Update farmer profile)
 * @access Private
 */
router.put(
  '/profile',
  [
    middleware.auth.authenticateToken || ((req, res, next) => next()),
    body('firstName').optional().trim().isLength({ min: 2 }).withMessage('กรุณาใส่ชื่อ'),
    body('lastName').optional().trim().isLength({ min: 2 }).withMessage('กรุณาใส่นามสกุล'),
    body('phoneNumber')
      .optional()
      .isMobilePhone('th-TH')
      .withMessage('กรุณาใส่เบอร์โทรศัพท์ที่ถูกต้อง'),
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

      const user = await User.findById(req.user.userId);

      if (!user || user.accountStatus !== 'active') {
        return shared.response.error(res, 'ไม่พบผู้ใช้งาน', shared.constants.statusCodes.NOT_FOUND);
      }

      // Update allowed fields
      const allowedUpdates = ['firstName', 'lastName', 'phoneNumber', 'organizationName'];
      const updates = {};

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      Object.assign(user, updates);
      await user.save();

      return shared.response.success(
        res,
        {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          organizationType: user.organizationType,
          organizationName: user.organizationName,
          permissions: user.getPermissions(),
          accountStatus: user.accountStatus,
        },
        'อัปเดตโปรไฟล์สำเร็จ',
      );
    } catch (error) {
      logger.error('Update profile error:', error);
      return shared.response.error(
        res,
        'ไม่สามารถอัปเดตโปรไฟล์ได้',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route POST /api/auth-farmer/change-password
 * @desc เปลี่ยนรหัสผ่าน (Change password)
 * @access Private
 */
router.post(
  '/change-password',
  [
    middleware.auth.authenticateToken || ((req, res, next) => next()),
    body('currentPassword').notEmpty().withMessage('กรุณาใส่รหัสผ่านปัจจุบัน'),
    body('newPassword').isLength({ min: 8 }).withMessage('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'),
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

      const user = await User.findById(req.user.userId);

      if (!user || user.accountStatus !== 'active') {
        return shared.response.error(res, 'ไม่พบผู้ใช้งาน', shared.constants.statusCodes.NOT_FOUND);
      }

      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isValidCurrentPassword = await user.comparePassword(currentPassword);
      if (!isValidCurrentPassword) {
        return shared.response.error(
          res,
          'รหัสผ่านปัจจุบันไม่ถูกต้อง',
          shared.constants.statusCodes.BAD_REQUEST,
        );
      }

      // Update password (will be hashed by pre-save middleware)
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      return shared.response.success(res, { success: true }, 'เปลี่ยนรหัสผ่านสำเร็จ');
    } catch (error) {
      logger.error('Change password error:', error);
      return shared.response.error(
        res,
        'ไม่สามารถเปลี่ยนรหัสผ่านได้',
        shared.constants.statusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

/**
 * @route POST /api/auth-farmer/logout
 * @desc ออกจากระบบ (Logout)
 * @access Private
 */
router.post(
  '/logout',
  middleware.auth.authenticateToken || ((req, res, next) => next()),
  (req, res) => {
    // In production, add token to blacklist
    logger.info(`User logged out: ${req.user.email || req.user.userId}`);
    return shared.response.success(res, { success: true }, 'ออกจากระบบสำเร็จ');
  },
);

/**
 * @route GET /api/auth-farmer/verify
 * @desc ตรวจสอบ token (Verify token)
 * @access Public
 */
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return shared.response.error(res, 'ไม่พบ token', shared.constants.statusCodes.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, config.environment.jwtSecret || 'fallback-secret-key');
    return shared.response.success(res, {
      valid: true,
      user: decoded,
    });
  } catch (error) {
    return shared.response.error(
      res,
      'Token ไม่ถูกต้อง',
      shared.constants.statusCodes.UNAUTHORIZED,
    );
  }
});

module.exports = router;
