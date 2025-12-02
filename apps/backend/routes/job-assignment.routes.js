/**
 * Job Assignment Routes
 * API endpoints for managing job assignments
 */

const express = require('express');
const router = express.Router();
const JobAssignmentController = require('../controllers/JobAssignmentController');
const { authenticate, authorize } = require('../middleware/auth-middleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Officer routes
router.get(
    '/unassigned',
    authenticate,
    requireRole(['officer', 'admin']),
    JobAssignmentController.getUnassignedJobs
);

router.post(
    '/assign',
    authenticate,
    requireRole(['officer', 'admin']),
    JobAssignmentController.assignJob
);

// Auditor routes
router.get(
    '/my-assignments',
    authenticate,
    requireRole(['auditor', 'admin']),
    JobAssignmentController.getMyAssignments
);

router.post(
    '/:id/accept',
    authenticate,
    requireRole(['auditor', 'admin']),
    JobAssignmentController.acceptAssignment
);

router.post(
    '/:id/start',
    authenticate,
    requireRole(['auditor', 'admin']),
    JobAssignmentController.startAssignment
);

router.post(
    '/:id/complete',
    authenticate,
    requireRole(['auditor', 'admin']),
    JobAssignmentController.completeAssignment
);

module.exports = router;
