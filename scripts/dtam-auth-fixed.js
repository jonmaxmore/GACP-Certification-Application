/**
 * DTAM Staff Authentication Routes (DEBUG VERSION)
 * Uses Prisma (PostgreSQL)
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// Import Prisma client
const { prisma } = require('../../../services/prisma-database');

// Role permissions
const ROLE_PERMISSIONS = {
    admin: ['staff.list', 'staff.create', 'staff.update', 'staff.delete'],
    reviewer: ['document.review', 'document.approve'],
    auditor: ['audit.conduct', 'audit.report'],
    scheduler: ['schedule.create', 'schedule.update'],
    accountant: ['quote.view', 'invoice.view', 'receipt.create'],
};

const ROLE_DISPLAY_NAMES = {
    admin: 'ผู้ดูแลระบบ',
    reviewer: 'ผู้ตรวจสอบเอกสาร',
    auditor: 'ผู้ตรวจประเมิน',
    scheduler: 'ผู้จัดคิวนัดหมาย',
    accountant: 'พนักงานบัญชี',
};

/**
 * @route POST /api/auth-dtam/login
 */
router.post('/login', async (req, res) => {
    console.log('=== DTAM LOGIN START ===');

    try {
        const { username, password, userType } = req.body;
        console.log('Username:', username);
        console.log('UserType:', userType);

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
            });
        }

        // Find staff
        const staff = await prisma.dTAMStaff.findFirst({
            where: {
                OR: [{ username: username }, { email: username }],
                isDeleted: false,
            },
        });

        console.log('Staff found:', staff ? staff.username : 'NOT FOUND');

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
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            });
        }

        // Update last login
        await prisma.dTAMStaff.update({
            where: { id: staff.id },
            data: {
                failedLoginAttempts: 0,
                lastLoginAt: new Date(),
            },
        });

        // Generate JWT
        const jwtSecret = process.env.DTAM_JWT_SECRET || 'gacp-dtam-secret-2025';
        const token = jwt.sign(
            {
                userId: staff.id,
                username: staff.username,
                email: staff.email,
                userType: 'DTAM_STAFF',
                role: staff.role,
            },
            jwtSecret,
            { expiresIn: '8h' }
        );

        console.log('=== DTAM LOGIN SUCCESS ===');

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
                    roleDisplayName: ROLE_DISPLAY_NAMES[staff.role] || staff.role,
                    permissions: ROLE_PERMISSIONS[staff.role] || [],
                    dashboardUrl: '/staff/dashboard',
                },
            },
        });
    } catch (error) {
        console.error('=== DTAM LOGIN ERROR ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        return res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            debug: error.message,
        });
    }
});

/**
 * @route GET /api/auth-dtam/health
 */
router.get('/health', async (req, res) => {
    try {
        const staffCount = await prisma.dTAMStaff.count();
        const activeCount = await prisma.dTAMStaff.count({ where: { isActive: true } });
        res.json({
            service: 'auth-dtam',
            status: 'healthy',
            database: 'postgresql',
            staffCount,
            activeStaffCount: activeCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({
            service: 'auth-dtam',
            status: 'error',
            error: error.message,
        });
    }
});

/**
 * @route GET /api/auth-dtam/verify
 */
router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token' });
        }
        const jwtSecret = process.env.DTAM_JWT_SECRET || 'gacp-dtam-secret-2025';
        const decoded = jwt.verify(token, jwtSecret);
        return res.json({ success: true, data: { valid: true, user: decoded } });
    } catch (error) {
        return res.status(401).json({ success: false, error: error.message });
    }
});

module.exports = router;
