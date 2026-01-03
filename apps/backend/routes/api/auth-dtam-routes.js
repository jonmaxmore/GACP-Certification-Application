/**
 * DTAM Staff Authentication Routes
 * Handles login/logout for DTAM staff (separated from farmer auth)
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../services/prisma-database').prisma;
const { authLimiter } = require('../../middleware/rate-limiter');

const JWT_SECRET = process.env.JWT_SECRET || 'gacp-jwt-secret-key-2024';
const JWT_EXPIRES_IN = '8h';

// POST /auth-dtam/login - 🛡️ Rate limited: 5 attempts per 15 minutes
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
            });
        }

        // Find staff by username, email, or employeeId
        const staff = await prisma.dTAMStaff.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username },
                    { employeeId: username }
                ],
                isDeleted: false
            }
        });

        if (!staff) {
            return res.status(401).json({
                success: false,
                error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        // Check if account is active
        if (!staff.isActive) {
            return res.status(403).json({
                success: false,
                error: 'บัญชีของคุณถูกระงับการใช้งาน'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, staff.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: staff.id,
                uuid: staff.uuid,
                username: staff.username,
                email: staff.email,
                role: staff.role,
                userType: 'DTAM_STAFF'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Update last login
        await prisma.dTAMStaff.update({
            where: { id: staff.id },
            data: { lastLoginAt: new Date() }
        });

        console.log(`[Auth] Staff login: ${staff.username} (${staff.role})`);

        res.json({
            success: true,
            data: {
                user: {
                    id: staff.id,
                    uuid: staff.uuid,
                    username: staff.username,
                    email: staff.email,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    role: staff.role,
                    department: staff.department,
                    dashboardUrl: '/staff/dashboard'
                },
                token
            }
        });
    } catch (error) {
        console.error('[Auth] DTAM login error:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่'
        });
    }
});

// POST /auth-dtam/logout
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'ออกจากระบบสำเร็จ'
    });
});

// GET /auth-dtam/me - Get current user from token
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const staff = await prisma.dTAMStaff.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                uuid: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                isActive: true
            }
        });

        if (!staff || !staff.isActive) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        res.json({ success: true, data: staff });
    } catch (error) {
        console.error('[Auth] /me error:', error);
        res.status(401).json({ success: false, error: 'Token invalid or expired' });
    }
});

module.exports = router;
