/**
 * Staff Routes for Scheduler and Admin 
 * Uses Prisma DTAMStaff model
 */
const express = require('express');
const router = express.Router();
const prisma = require('../../services/prisma-database').prisma;
const authModule = require('../../middleware/auth-middleware');

const authenticateDTAM = authModule.authenticateDTAM;

// Get all staff (with optional role filter)
router.get('/', authenticateDTAM, async (req, res) => {
    try {
        const { role, isActive } = req.query;

        const where = { isDeleted: false };
        if (role) { where.role = role.toLowerCase(); }
        if (isActive !== undefined) { where.isActive = isActive === 'true'; }

        const staff = await prisma.dTAMStaff.findMany({
            where,
            select: {
                id: true,
                uuid: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                employeeId: true,
                department: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: staff });
    } catch (error) {
        console.error('[Staff] getStaff error:', error);
        res.json({ success: true, data: [] });
    }
});

// Get inspectors only (for scheduler dropdown)
router.get('/inspectors', authenticateDTAM, async (req, res) => {
    try {
        const inspectors = await prisma.dTAMStaff.findMany({
            where: {
                role: { in: ['inspector', 'auditor', 'reviewer'] },
                isActive: true,
                isDeleted: false,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
            },
            orderBy: { firstName: 'asc' },
        });

        res.json({ success: true, data: inspectors });
    } catch (error) {
        console.error('[Staff] getInspectors error:', error);
        res.json({ success: true, data: [] });
    }
});

// Get staff roles
router.get('/roles', authenticateDTAM, async (req, res) => {
    res.json({
        success: true,
        data: [
            { value: 'admin', label: 'ผู้ดูแลระบบ' },
            { value: 'reviewer', label: 'ผู้ตรวจเอกสาร' },
            { value: 'auditor', label: 'ผู้ตรวจประเมิน' },
            { value: 'inspector', label: 'ผู้ตรวจสอบพื้นที่' },
            { value: 'scheduler', label: 'เจ้าหน้าที่จัดคิว' },
            { value: 'accountant', label: 'เจ้าหน้าที่บัญชี' },
        ],
    });
});

// Create new staff member
router.post('/', authenticateDTAM, async (req, res) => {
    try {
        // RPAC: Only Admin/SuperAdmin can create staff
        const currentUserRole = req.user?.role?.toLowerCase();
        if (currentUserRole !== 'admin' && currentUserRole !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized: Only Admins can create staff accounts',
            });
        }

        const { username, email, password, firstName, lastName, role, employeeId } = req.body;

        // Check required fields
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: username, email, password, firstName, lastName',
            });
        }

        // Check if username or email already exists
        const existing = await prisma.dTAMStaff.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email },
                ],
            },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Username or email already exists',
            });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);

        const newStaff = await prisma.dTAMStaff.create({
            data: {
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role?.toLowerCase() || 'reviewer',
                employeeId: employeeId || null,
                createdBy: req.user?.id,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Staff created successfully',
            data: {
                id: newStaff.id,
                username: newStaff.username,
                email: newStaff.email,
                firstName: newStaff.firstName,
                lastName: newStaff.lastName,
                role: newStaff.role,
            },
        });
    } catch (error) {
        console.error('[Staff] createStaff error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get staff by ID
router.get('/:id', authenticateDTAM, async (req, res) => {
    try {
        const staff = await prisma.dTAMStaff.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!staff) {
            return res.status(404).json({ success: false, error: 'Staff not found' });
        }

        res.json({ success: true, data: staff });
    } catch (error) {
        console.error('[Staff] getStaffById error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update staff
router.patch('/:id', authenticateDTAM, async (req, res) => {
    try {
        // RPAC: Only Admin/SuperAdmin can update staff
        const currentUserRole = req.user?.role?.toLowerCase();
        if (currentUserRole !== 'admin' && currentUserRole !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized: Only Admins can manage staff accounts',
            });
        }

        const { id } = req.params;
        const { firstName, lastName, role, isActive, employeeId } = req.body;

        const updateData = {};
        if (firstName) { updateData.firstName = firstName; }
        if (lastName) { updateData.lastName = lastName; }
        if (role) { updateData.role = role.toLowerCase(); }
        if (isActive !== undefined) { updateData.isActive = isActive; }
        if (employeeId) { updateData.employeeId = employeeId; }
        updateData.updatedBy = req.user?.id;

        const updated = await prisma.dTAMStaff.update({
            where: { id },
            data: updateData,
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('[Staff] updateStaff error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
