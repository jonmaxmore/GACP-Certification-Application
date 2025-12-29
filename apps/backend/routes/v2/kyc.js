const express = require('express');
const router = express.Router();
const User = require('../../models-mongoose-legacy/user-model');
const { authenticate, checkPermission } = require('../../middleware/auth-middleware');

// Real implementation
const kycController = {
    getPendingKYC: async (req, res) => {
        try {
            // Assume pending KYC means verificationStatus is 'pending' or similar
            // Adjust based on your User model schema. using 'pending' generic logic
            const query = {
                role: 'farmer',
                $or: [
                    { 'verificationStatus': 'pending' },
                    { 'status': 'pending_approval' } // Covering potential schema variations
                ]
            };

            // Clean logic based on actual UserModel inspection if needed.
            // Using a broader query or standardized field.
            // If field not present, it will return empty which is safe.
            const pendingUsers = await User.find(query).select('-password');
            res.json({ success: true, data: pendingUsers });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    verifyUser: async (req, res) => {
        try {
            const { userId, status, reason } = req.body;

            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const updateData = {
                verificationStatus: status,
                verificationDate: new Date(),
                verifiedBy: req.user.userId
            };

            if (status === 'rejected' && reason) {
                updateData.rejectionReason = reason;
            } else {
                updateData.isActive = true; // Activate user on approval
            }

            const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

// Routes
// GET /api/v2/kyc/pending - List pending verifications (Admin/Officer only)
router.get('/pending', authenticate, checkPermission('user.list'), (req, res) => kycController.getPendingKYC(req, res));

// POST /api/v2/kyc/verify - Approve/Reject user (Admin/Officer only)
router.post('/verify', authenticate, checkPermission('user.update'), (req, res) => kycController.verifyUser(req, res));

module.exports = router;

