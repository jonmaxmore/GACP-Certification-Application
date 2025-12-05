const express = require('express');
const router = express.Router();
// Mock controller for cleanup
const kycController = {
    getPendingKYC: (req, res) => res.json({ success: true, data: [] }),
    verifyUser: (req, res) => res.json({ success: true }),
};
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

// Routes
// GET /api/v2/kyc/pending - List pending verifications (Admin/Officer only)
router.get('/pending', authenticate, checkPermission('user.list'), (req, res) => kycController.getPendingKYC(req, res));

// POST /api/v2/kyc/verify - Approve/Reject user (Admin/Officer only)
router.post('/verify', authenticate, checkPermission('user.update'), (req, res) => kycController.verifyUser(req, res));

module.exports = router;
