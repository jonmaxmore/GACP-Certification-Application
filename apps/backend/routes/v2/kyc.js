const express = require('express');
const router = express.Router();
const KYCController = require('../../modules/user-management/presentation/controllers/KYCController');
const User = require('../../models/User');
const { requireRole } = require('../../middleware/roleMiddleware');

// Instantiate Controller with User Model as Repository
const kycController = new KYCController({ userRepository: User });

// Routes
// GET /api/v2/kyc/pending - List pending verifications (Admin/Registrar only)
router.get('/pending', requireRole(['admin', 'dtam_officer']), (req, res) => kycController.getPendingKYC(req, res));

// POST /api/v2/kyc/verify - Approve/Reject user (Admin/Registrar only)
router.post('/verify', requireRole(['admin', 'dtam_officer']), (req, res) => kycController.verifyUser(req, res));

module.exports = router;
