/**
 * DTAM Staff Authentication Routes
 * Now uses Prisma (PostgreSQL) instead of MongoDB
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import Prisma client
const { prisma } = require('../../../services/prisma-database');
const logger = require('../../../shared/logger');

/**
 * Role-based Permissions Configuration
 */
const ROLE_PERMISSIONS = {
  admin: ['staff.list', 'staff.create', 'staff.update', 'staff.delete', 'report.all', 'settings.update'],
  reviewer: ['document.review', 'document.approve', 'document.reject'],
  auditor: ['audit.conduct', 'audit.report', 'car.create'],
  scheduler: ['schedule.create', 'schedule.update', 'schedule.assign'],
  accountant: ['quote.view', 'invoice.view', 'receipt.create', 'report.financial'],
  inspector: ['audit.conduct', 'audit.report'],
  manager: ['staff.list', 'schedule.view', 'report.all'],
};

const ROLE_DISPLAY_NAMES = {
  admin: 'ผู้ดูแลระบบ',
  reviewer: 'ผู้ตรวจสอบเอกสาร',
  auditor: 'ผู้ตรวจประเมิน',
  scheduler: 'ผู้จัดคิวนัดหมาย',
  accountant: 'พนักงานบัญชี',
  inspector: 'ผู้ตรวจประเมิน',
  manager: 'ผู้จัดการ',
};

const ROLE_DASHBOARD_URLS = {
  admin: '/staff/dashboard/admin',
  reviewer: '/staff/dashboard/reviewer',
  auditor: '/staff/dashboard/reviewer',
  scheduler: '/staff/dashboard/scheduler',
  accountant: '/staff/dashboard/accountant',
  inspector: '/staff/dashboard/reviewer',
  manager: '/staff/dashboard/admin',
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
 * @desc DTAM Staff Login using Prisma
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'ข้อมูลไม่ถูกต้อง',
          errors: errors.array(),
        });
      }

      const { username, password } = req.body;

      // Find staff by username or email using Prisma
      const staff = await prisma.dTAMStaff.findFirst({
        where: {
          OR: [{ username: username }, { email: username }],
          isDeleted: false,
        },
      });

      if (!staff) {
        return res.status(401).json({
          success: false,
          error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        });
      }

      if (!staff.isActive) {
        return res.status(403).json({
          success: false,
          error: 'บัญชีของคุณถูกระงับการใช้งาน',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, staff.password);
      if (!isPasswordValid) {
        // Increment failed attempts
        await prisma.dTAMStaff.update({
          where: { id: staff.id },
          data: {
            failedLoginAttempts: staff.failedLoginAttempts + 1,
            isActive: staff.failedLoginAttempts >= 4 ? false : staff.isActive,
            lockedAt: staff.failedLoginAttempts >= 4 ? new Date() : null,
          },
        });

        return res.status(401).json({
          success: false,
          error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        });
      }

      // Reset failed attempts and update last login
      await prisma.dTAMStaff.update({
        where: { id: staff.id },
        data: {
          failedLoginAttempts: 0,
          lastLoginAt: new Date(),
        },
      });

      // Generate JWT token
      const dtamJwtSecret = process.env.DTAM_JWT_SECRET || 'gacp-dtam-secret-key-2025';
      const token = jwt.sign(
        {
          userId: staff.id,
          username: staff.username,
          email: staff.email,
          userType: 'DTAM_STAFF',
          role: staff.role,
          department: staff.department,
        },
        dtamJwtSecret,
        { expiresIn: '8h' },
      );

      logger.info(`DTAM staff login successful: ${staff.username} (${staff.role})`);

      return res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        data: {
          token,
          user: {
            userId: staff.id,
            username: staff.username,
            email: staff.email,
            firstName: staff.firstName,
            lastName: staff.lastName,
            userType: 'DTAM_STAFF',
            role: staff.role,
            roleDisplayName: getRoleDisplayName(staff.role),
            department: staff.department,
            permissions: getRolePermissions(staff.role),
            dashboardUrl: getDashboardUrl(staff.role),
          },
        },
      });
    } catch (error) {
      logger.error('DTAM login error:', error.message);
      logger.error('DTAM login stack:', error.stack);
      return res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        debug: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      });
    }
  },
);

/**
 * @route POST /api/auth-dtam/register
 * @desc BLOCKED - Staff cannot self-register
 */
router.post('/register', (req, res) => {
  return res.status(403).json({
    success: false,
    error: 'ไม่สามารถสมัครสมาชิกด้วยตนเองได้ - บัญชีเจ้าหน้าที่ต้องสร้างโดยผู้ดูแลระบบ',
  });
});

/**
 * @route POST /api/auth-dtam/setup
 * @desc First-time setup - Create initial admin account
 */
router.post(
  '/setup',
  [
    body('email').isEmail().withMessage('อีเมลไม่ถูกต้อง'),
    body('username').isLength({ min: 3 }).withMessage('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร'),
    body('password').isLength({ min: 6 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
    body('firstName').notEmpty().withMessage('กรุณากรอกชื่อ'),
    body('lastName').notEmpty().withMessage('กรุณากรอกนามสกุล'),
    body('setupKey')
      .equals(process.env.ADMIN_SETUP_KEY || 'GACP-FIRST-ADMIN-2025')
      .withMessage('Setup key ไม่ถูกต้อง'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      // Check if any staff exists
      const staffCount = await prisma.dTAMStaff.count();
      if (staffCount > 0) {
        return res.status(403).json({
          success: false,
          error: 'ไม่สามารถใช้งาน setup ได้ - มีบัญชีเจ้าหน้าที่อยู่แล้ว',
        });
      }

      const { email, username, password, firstName, lastName } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create first admin account
      const admin = await prisma.dTAMStaff.create({
        data: {
          email,
          username,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'admin',
          department: 'IT',
          isActive: true,
          userType: 'DTAM_STAFF',
        },
      });

      logger.info(`First admin account created: ${username} (${email})`);

      return res.status(201).json({
        success: true,
        message: 'Setup สำเร็จ - สามารถเข้าสู่ระบบได้แล้ว',
        data: {
          userId: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      logger.error('Setup error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี',
      });
    }
  },
);

/**
 * @route GET /api/auth-dtam/health
 * @desc Health check
 */
router.get('/health', async (req, res) => {
  try {
    const staffCount = await prisma.dTAMStaff.count();
    const activeCount = await prisma.dTAMStaff.count({ where: { isActive: true } });

    res.json({
      service: 'auth-dtam',
      status: 'healthy',
      database: 'prisma/postgresql',
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

/**
 * @route GET /api/auth-dtam/verify
 * @desc Verify DTAM token
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'ไม่พบ token' });
    }

    const dtamJwtSecret = process.env.DTAM_JWT_SECRET || 'gacp-dtam-secret-key-2025';
    const decoded = jwt.verify(token, dtamJwtSecret);

    if (decoded.userType !== 'DTAM_STAFF') {
      return res.status(403).json({ success: false, error: 'Token ไม่ถูกต้อง' });
    }

    return res.json({
      success: true,
      data: {
        valid: true,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          userType: decoded.userType,
          role: decoded.role,
          department: decoded.department,
        },
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Token ไม่ถูกต้อง' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token หมดอายุ' });
    }
    return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;
