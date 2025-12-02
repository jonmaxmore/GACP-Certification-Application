/**
 * application.routes.js
 * Routes for GACP Application Workflow
 */

const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const { authenticateToken } = require('../../../../shared/auth'); // Assuming auth middleware exists

// -- Dashboard Routes --
router.get('/dashboard', authenticateToken, ApplicationController.getDashboard);
router.get('/my-applications', authenticateToken, ApplicationController.getMyApplications);
router.get('/officer/queue', authenticateToken, ApplicationController.getOfficerQueue);

// -- Core Workflow Routes --
// Create Draft
router.post('/', authenticateToken, ApplicationController.create);

// Get Application
router.get('/:id', authenticateToken, ApplicationController.getOne);

// Update Self-Assessment
router.put('/:id/self-assessment', authenticateToken, ApplicationController.updateSelfAssessment);

// Submit Application
router.post('/:id/submit', authenticateToken, ApplicationController.submit);

// Review Application (Officer/Admin only)
router.post('/:id/review', authenticateToken, ApplicationController.review);

module.exports = router;
