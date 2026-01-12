/**
 * @swagger
 * tags:
 *   name: Identity
 *   description: eKYC and Identity Verification
 */

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth-middleware');
const logger = require('../../shared/logger');
const identityService = require('../../services/identity-service');
const { createUploader } = require('../../services/storage-service');

// Configure Uploader
const upload = createUploader('identity', ['image/jpeg', 'image/png', 'application/pdf'], 10);
const uploadFields = upload.fields([
    { name: 'idCardImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
    { name: 'companyCertImage', maxCount: 1 },
]);

/**
 * @swagger
 * /api/identity/verify:
 *   post:
 *     summary: Submit identity verification documents (eKYC)
 *     tags: [Identity]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idCardImage:
 *                 type: string
 *                 format: binary
 *               selfieImage:
 *                 type: string
 *                 format: binary
 *               companyCertImage:
 *                 type: string
 *                 format: binary
 *               laserCode:
 *                 type: string
 *               taxId:
 *                 type: string
 *               forceManual:
 *                 type: string
 *                 enum: ['true', 'false']
 */
router.post('/verify', auth.authenticateFarmer, (req, res) => {
    uploadFields(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });

        try {
            const result = await identityService.verifyIdentity(req.user.id, req.files || {}, req.body);

            if (!result.success) {
                // If locked, return 429
                if (result.isLocked) {
                    return res.status(429).json(result);
                }
                // Otherwise validation/AI error
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (error) {
            logger.error('[Identity] Verify Error:', error);
            if (error.message.includes('Please upload')) {
                return res.status(400).json({ success: false, error: error.message });
            }
            res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
        }
    });
});

/**
 * @swagger
 * /api/identity/status:
 *   get:
 *     summary: Get current verification status
 *     tags: [Identity]
 *     security:
 *       - BearerAuth: []
 */
router.get('/status', auth.authenticateFarmer, async (req, res) => {
    try {
        const result = await identityService.getStatus(req.user.id);
        res.json({ success: true, data: result });
    } catch (error) {
        logger.error('[Identity] Get Status Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @swagger
 * /api/identity/pending:
 *   get:
 *     summary: List all pending verifications (Staff Only)
 *     tags: [Identity]
 *     security:
 *       - BearerAuth: []
 */
router.get('/pending', auth.authenticateDTAM, async (req, res) => {
    try {
        const users = await identityService.getPendingUsers();
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        logger.error('[Identity] List Pending Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @swagger
 * /api/identity/user/{id}:
 *   get:
 *     summary: Get specific user verification details (Staff Only)
 *     tags: [Identity]
 *     security:
 *       - BearerAuth: []
 */
router.get('/user/:id', auth.authenticateDTAM, async (req, res) => {
    try {
        const user = await identityService.getUserDetails(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        logger.error('[Identity] Get Details Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @swagger
 * /api/identity/review/{id}:
 *   post:
 *     summary: Approve or Reject verification (Staff Only)
 *     tags: [Identity]
 *     security:
 *       - BearerAuth: []
 */
router.post('/review/:id', auth.authenticateDTAM, async (req, res) => {
    try {
        const { action, note } = req.body;
        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        await identityService.reviewUser(req.params.id, action, note, req.user.username);
        res.json({ success: true, message: `User verification ${action}D` });
    } catch (error) {
        logger.error('[Identity] Review Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
