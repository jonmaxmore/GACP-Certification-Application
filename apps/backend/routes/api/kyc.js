/**
 * V2 KYC Routes - Prisma Version
 * User verification system using PostgreSQL
 */

const express = require('express');
const router = express.Router();
const prismaDatabase = require('../../services/prisma-database');
const { authenticate, checkPermission } = require('../../middleware/auth-middleware');

const kycController = {
    getPendingKYC: async (req, res) => {
        try {
            const prisma = prismaDatabase.getClient();
            const pendingUsers = await prisma.user.findMany({
                where: {
                    role: 'FARMER',
                    status: 'PENDING_VERIFICATION',
                    isDeleted: false,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    accountType: true,
                    companyName: true,
                    communityName: true,
                    status: true,
                    createdAt: true,
                },
            });
            res.json({ success: true, data: pendingUsers });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    verifyUser: async (req, res) => {
        try {
            const prisma = prismaDatabase.getClient();
            const { userId, status, reason } = req.body;

            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const updateData = {
                status: status === 'approved' ? 'ACTIVE' : 'SUSPENDED',
                updatedBy: req.user.userId,
                updatedAt: new Date(),
            };

            const user = await prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                },
            });

            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

// Routes
router.get('/pending', authenticate, checkPermission('user.list'), kycController.getPendingKYC);
router.post('/verify', authenticate, checkPermission('user.update'), kycController.verifyUser);

module.exports = router;
