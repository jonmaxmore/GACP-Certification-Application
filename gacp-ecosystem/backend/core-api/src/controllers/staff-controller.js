/**
 * Staff Controller
 * Handles staff management operations for Admin/Super Admin
 */

const User = require('../database/models/user-model');
const { createLogger } = require('../shared/logger');
const logger = createLogger('staff-controller');

const STAFF_ROLES = ['REVIEWER_AUDITOR', 'SCHEDULER', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'];

class StaffController {
    /**
     * Create new staff account
     * Only ADMIN or SUPER_ADMIN can create staff
     */
    async createStaff(req, res) {
        try {
            const { email, password, firstName, lastName, role, departmentId, teamId, region } = req.body;

            // Validate role is a staff role
            if (!STAFF_ROLES.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid staff role',
                    allowedRoles: STAFF_ROLES,
                });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use',
                });
            }

            // Create staff user
            const staffUser = new User({
                email: email.toLowerCase(),
                password,
                firstName,
                lastName,
                accountType: 'STAFF',
                role,
                departmentId,
                teamId,
                region,
                status: 'ACTIVE',
                verificationStatus: 'approved',
            });

            await staffUser.save();

            logger.info(`Staff created: ${email} with role ${role} by ${req.user?.email || 'system'}`);

            res.status(201).json({
                success: true,
                message: 'Staff account created successfully',
                data: {
                    id: staffUser._id,
                    email: staffUser.email,
                    firstName: staffUser.firstName,
                    lastName: staffUser.lastName,
                    role: staffUser.role,
                    departmentId: staffUser.departmentId,
                    teamId: staffUser.teamId,
                    region: staffUser.region,
                },
            });
        } catch (error) {
            logger.error('Create staff error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create staff account',
                error: error.message,
            });
        }
    }

    /**
     * List all staff members
     * Can filter by role, department, team, region
     */
    async listStaff(req, res) {
        try {
            const { role, departmentId, teamId, region, page = 1, limit = 20 } = req.query;

            const query = { role: { $in: STAFF_ROLES } };

            if (role && STAFF_ROLES.includes(role)) query.role = role;
            if (departmentId) query.departmentId = departmentId;
            if (teamId) query.teamId = teamId;
            if (region) query.region = region;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const [staff, total] = await Promise.all([
                User.find(query)
                    .select('-password -idCard -laserCode -taxId')
                    .skip(skip)
                    .limit(parseInt(limit))
                    .sort({ createdAt: -1 }),
                User.countDocuments(query),
            ]);

            res.json({
                success: true,
                data: staff,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            });
        } catch (error) {
            logger.error('List staff error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to list staff',
                error: error.message,
            });
        }
    }

    /**
     * Get single staff by ID
     */
    async getStaffById(req, res) {
        try {
            const { id } = req.params;

            const staff = await User.findById(id)
                .select('-password -idCard -laserCode -taxId')
                .populate('supervisorId', 'firstName lastName email');

            if (!staff || !STAFF_ROLES.includes(staff.role)) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff not found',
                });
            }

            res.json({
                success: true,
                data: staff,
            });
        } catch (error) {
            logger.error('Get staff error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get staff',
                error: error.message,
            });
        }
    }

    /**
     * Update staff information
     */
    async updateStaff(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, role, departmentId, teamId, region, supervisorId, status } = req.body;

            const staff = await User.findById(id);
            if (!staff || !STAFF_ROLES.includes(staff.role)) {
                return res.status(404).json({
                    success: false,
                    message: 'Staff not found',
                });
            }

            // Update fields
            if (firstName) staff.firstName = firstName;
            if (lastName) staff.lastName = lastName;
            if (role && STAFF_ROLES.includes(role)) staff.role = role;
            if (departmentId !== undefined) staff.departmentId = departmentId;
            if (teamId !== undefined) staff.teamId = teamId;
            if (region !== undefined) staff.region = region;
            if (supervisorId !== undefined) staff.supervisorId = supervisorId;
            if (status) staff.status = status;

            await staff.save();

            logger.info(`Staff updated: ${staff.email} by ${req.user?.email || 'system'}`);

            res.json({
                success: true,
                message: 'Staff updated successfully',
                data: {
                    id: staff._id,
                    email: staff.email,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    role: staff.role,
                    departmentId: staff.departmentId,
                    teamId: staff.teamId,
                    region: staff.region,
                    status: staff.status,
                },
            });
        } catch (error) {
            logger.error('Update staff error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update staff',
                error: error.message,
            });
        }
    }

    /**
     * Get staff by team
     */
    async getTeamMembers(req, res) {
        try {
            const { teamId } = req.params;

            const members = await User.find({ teamId, role: { $in: STAFF_ROLES } })
                .select('firstName lastName email role region status')
                .sort({ role: 1, firstName: 1 });

            res.json({
                success: true,
                data: {
                    teamId,
                    memberCount: members.length,
                    members,
                },
            });
        } catch (error) {
            logger.error('Get team members error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get team members',
                error: error.message,
            });
        }
    }

    /**
     * Get staff by region
     */
    async getStaffByRegion(req, res) {
        try {
            const { region } = req.params;

            const staff = await User.find({ region, role: { $in: STAFF_ROLES } })
                .select('firstName lastName email role teamId status')
                .sort({ role: 1, firstName: 1 });

            res.json({
                success: true,
                data: {
                    region,
                    staffCount: staff.length,
                    staff,
                },
            });
        } catch (error) {
            logger.error('Get staff by region error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get staff by region',
                error: error.message,
            });
        }
    }

    /**
     * Get available roles for staff
     */
    getRoles(req, res) {
        const roles = STAFF_ROLES.map(role => ({
            code: role,
            name: this.getRoleDisplayName(role),
        }));

        res.json({
            success: true,
            data: roles,
        });
    }

    getRoleDisplayName(role) {
        const names = {
            'REVIEWER_AUDITOR': 'ผู้ตรวจสอบเอกสาร/ลงพื้นที่',
            'SCHEDULER': 'ผู้จัดตารางงาน',
            'ACCOUNTANT': 'พนักงานบัญชี',
            'ADMIN': 'ผู้ดูแลระบบ',
            'SUPER_ADMIN': 'ผู้ดูแลสูงสุด',
        };
        return names[role] || role;
    }
}

module.exports = new StaffController();
