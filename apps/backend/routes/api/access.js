/**
 * Access Control Routes - "One Brain, Many Faces" Architecture
 * 
 * Backend handles ALL authorization decisions.
 * Frontend just calls the API and displays the result.
 */

const express = require('express');
const router = express.Router();
const { authenticateFarmer } = require('../../middleware/auth-middleware');

// Role hierarchy for staff access
const STAFF_ROLES = ['REVIEWER_AUDITOR', 'SCHEDULER', 'ADMIN', 'SUPER_ADMIN'];
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

/**
 * @route POST /api/v2/access/check
 * @description Check if user has access to a specific resource
 * @access Private (requires auth)
 */
router.post('/check', authenticateFarmer, async (req, res) => {
    try {
        const { resource } = req.body;
        const user = req.user;

        if (!resource) {
            return res.status(400).json({
                success: false,
                error: 'กรุณาระบุ resource ที่ต้องการตรวจสอบ',
            });
        }

        // Define access rules for each resource
        const accessRules = {
            'staff-login': {
                allowed: STAFF_ROLES,
                redirect: '/staff/dashboard',
            },
            'staff-dashboard': {
                allowed: STAFF_ROLES,
                redirect: '/staff/dashboard',
            },
            'admin-panel': {
                allowed: ADMIN_ROLES,
                redirect: '/admin',
            },
            'farmer-dashboard': {
                allowed: ['FARMER'],
                redirect: '/dashboard',
            },
            'application-review': {
                allowed: ['REVIEWER_AUDITOR', 'ADMIN', 'SUPER_ADMIN'],
                redirect: '/staff/applications',
            },
            'scheduling': {
                allowed: ['SCHEDULER', 'ADMIN', 'SUPER_ADMIN'],
                redirect: '/staff/calendar',
            },
        };

        const rule = accessRules[resource];

        if (!rule) {
            return res.status(404).json({
                success: false,
                error: 'ไม่พบ resource ที่ระบุ',
            });
        }

        const hasAccess = rule.allowed.includes(user.role);

        res.json({
            success: true,
            data: {
                resource,
                allowed: hasAccess,
                role: user.role,
                redirect: hasAccess ? rule.redirect : '/unauthorized',
                message: hasAccess
                    ? 'คุณมีสิทธิ์เข้าถึง'
                    : 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
            },
        });
    } catch (error) {
        console.error('Access check error:', error);
        res.status(500).json({
            success: false,
            error: 'ไม่สามารถตรวจสอบสิทธิ์ได้',
        });
    }
});

/**
 * @route POST /api/v2/access/verify-staff
 * @description Verify if user is valid staff member (for login)
 * @body { role: string }
 */
router.post('/verify-staff', (req, res) => {
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({
            success: false,
            error: 'กรุณาระบุ role',
        });
    }

    const isStaff = STAFF_ROLES.includes(role);
    const isAdmin = ADMIN_ROLES.includes(role);

    res.json({
        success: true,
        data: {
            isStaff,
            isAdmin,
            redirect: isAdmin ? '/admin' : isStaff ? '/staff/dashboard' : '/unauthorized',
            message: isStaff
                ? 'ยืนยันเจ้าหน้าที่สำเร็จ'
                : 'บัญชีนี้ไม่ใช่บัญชีเจ้าหน้าที่',
        },
    });
});

/**
 * @route GET /api/v2/access/roles
 * @description Get list of available roles and their permissions
 * @access Public (for documentation)
 */
router.get('/roles', (req, res) => {
    res.json({
        success: true,
        data: {
            staffRoles: STAFF_ROLES,
            adminRoles: ADMIN_ROLES,
            allRoles: ['FARMER', ...STAFF_ROLES],
        },
    });
});

module.exports = router;

