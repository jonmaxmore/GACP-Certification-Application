/**
 * Staff API Routes
 * Endpoints for staff management (Admin/Super Admin only)
 */

const express = require('express');
const router = express.Router();
const staffController = require('../../controllers/StaffController');
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

// All routes require authentication
router.use(authenticate);

// Get available staff roles
router.get('/roles', staffController.getRoles.bind(staffController));

// List all staff members
router.get(
    '/',
    checkPermission('staff.list'),
    staffController.listStaff.bind(staffController)
);

// Create new staff account (Admin only)
router.post(
    '/',
    checkPermission('staff.create'),
    staffController.createStaff.bind(staffController)
);

// Get staff by ID
router.get(
    '/:id',
    checkPermission('staff.list'),
    staffController.getStaffById.bind(staffController)
);

// Update staff
router.put(
    '/:id',
    checkPermission('staff.update'),
    staffController.updateStaff.bind(staffController)
);

// Get team members
router.get(
    '/team/:teamId',
    checkPermission('team.view'),
    staffController.getTeamMembers.bind(staffController)
);

// Get staff by region
router.get(
    '/region/:region',
    checkPermission('team.view'),
    staffController.getStaffByRegion.bind(staffController)
);

module.exports = router;

