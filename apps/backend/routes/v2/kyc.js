const express = require('express');
const router = express.Router();
// Mock controller for cleanup
const kycController = {
    getPendingKYC: (req, res) => res.json({ success: true, data: [] }),
    verifyUser: (req, res) => res.json({ success: true }),
};
const { requireRole } = require('../../middleware/RoleMiddleware');

// Routes
// GET /api/v2/kyc/pending - List pending verifications (Admin/Registrar only)
router.get('/pending', requireRole(['admin', 'dtam_officer']), (req, res) => kycController.getPendingKYC(req, res));

// POST /api/v2/kyc/verify - Approve/Reject user (Admin/Registrar only)
router.post('/verify', requireRole(['admin', 'dtam_officer']), (req, res) => kycController.verifyUser(req, res));

module.exports = router;
