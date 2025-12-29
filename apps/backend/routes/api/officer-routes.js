const express = require('express');
const router = express.Router();
const officerController = require('../../controllers/OfficerController');
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

// Middleware to ensure user is an officer or admin
// allow 'officer.access' permission or similar. Assuming checkPermission handles it.
// For now, using 'application.review' as a generic permission or just checking role if permission system is complex.
// The user prompt implies checkPermission usage in other files.

// 1. Review Docs
router.patch(
    '/applications/:id/review-docs',
    authenticate,
    checkPermission('application.review', 'officer'),
    officerController.reviewDocs
);

// 2. Get Auditors
router.get(
    '/auditors',
    authenticate,
    checkPermission('application.assign', 'officer'),
    officerController.getAuditors
);

// 3. Assign Auditor
router.patch(
    '/applications/:id/assign-auditor',
    authenticate,
    checkPermission('application.assign', 'officer'),
    officerController.assignAuditor
);

// 4. Submit Inspection Result
router.post(
    '/applications/:id/inspection',
    authenticate,
    checkPermission('inspection.conduct', 'inspection'),
    officerController.submitInspectionResult
);

module.exports = router;

