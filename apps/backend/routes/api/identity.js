const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/auth-middleware');
const logger = require('../../shared/logger');

// Configure Multer for local storage (Simulating S3)
const uploadDir = path.join(__dirname, '../../public/uploads/identity');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: user-timestamp-original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    },
});

// Fields to upload
const uploadFields = upload.fields([
    { name: 'idCardImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
    { name: 'companyCertImage', maxCount: 1 },
]);

/**
 * @route   POST /api/identity/verify
 * @desc    Submit identity verification documents (eKYC)
 * @access  Private (Authenticated User)
 */
router.post('/verify', auth.authenticateFarmer, (req, res) => {
    logger.info('[Identity] Verify Request Received');
    logger.info('[Identity] CWD:', process.cwd());
    logger.info('[Identity] Content-Type:', req.headers['content-type']);

    uploadFields(req, res, async (err) => {
        if (err) {
            logger.error('[Identity] Multer Error:', err);
            return res.status(400).json({ success: false, error: err.message });
        }

        logger.info('[Identity] Multer Success');
        logger.info('[Identity] Files:', req.files ? Object.keys(req.files) : 'No files');
        logger.info('[Identity] Body:', req.body);

        try {
            const { laserCode, taxId } = req.body;
            const files = req.files || {};

            // Validation
            if (!files.idCardImage && !files.companyCertImage) {
                logger.error('[Identity] Validation Failed: Missing files');
                return res.status(400).json({ success: false, error: 'Please upload at least ID Card or Company Certificate' });
            }

            // Construct URLs (Local for now)
            const getFileUrl = (fieldname) => {
                if (files[fieldname] && files[fieldname][0]) {
                    return `/uploads/identity/${files[fieldname][0].filename}`;
                }
                return null;
            };

            const docData = {
                idCard: getFileUrl('idCardImage'),
                selfie: getFileUrl('selfieImage'),
                companyCert: getFileUrl('companyCertImage'),
                laserCode: laserCode || null,
                taxId: taxId || null,
                submittedAt: new Date().toISOString(),
            };

            // Fetch User for Logic
            const currentUser = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { idCard: true, verificationAttempts: true, verificationLockedUntil: true },
            });

            // 1. Check Lockout
            if (currentUser.verificationLockedUntil && new Date() < new Date(currentUser.verificationLockedUntil)) {
                const waitTime = Math.ceil((new Date(currentUser.verificationLockedUntil) - new Date()) / 60000);
                return res.status(429).json({
                    success: false,
                    error: `ระบบถูกระงับชั่วคราวเนื่องจากทำรายการไม่สำเร็จเกินกำหนด กรุณารอ ${waitTime} นาที`,
                });
            }

            // 2. Check Force Manual Flag from Frontend (User choice at attempt 3+)
            const useManualReview = req.body.forceManual === 'true';

            if (useManualReview) {
                await prisma.user.update({
                    where: { id: req.user.id },
                    data: {
                        verificationStatus: 'PENDING',
                        verificationDocuments: docData,
                        verificationSubmittedAt: new Date(),
                        verificationNote: 'User requested manual review.',
                        verificationAttempts: 0, // Reset on manual submit
                    },
                });
                return res.json({ success: true, status: 'PENDING', message: 'Submitted for manual review.' });
            }

            // 3. AI Verification Logic
            const ocrService = require('../../services/ocr-service');
            let match = false;
            let ocrMessage = '';

            try {
                if (files.idCardImage && files.idCardImage[0]) {
                    const filePath = files.idCardImage[0].path;
                    const result = await ocrService.verifyIdCard(filePath, currentUser.idCard);
                    match = result.match;
                    ocrMessage = result.message;
                    logger.info('OCR Message:', ocrMessage);
                }
            } catch (e) {
                logger.error('OCR Error', e);
                ocrMessage = 'OCR Error';
            }

            if (match) {
                // Success!
                await prisma.user.update({
                    where: { id: req.user.id },
                    data: {
                        verificationStatus: 'APPROVED',
                        status: 'ACTIVE',
                        verificationDocuments: docData,
                        verificationSubmittedAt: new Date(),
                        verificationNote: 'AI Verified: ID Match',
                        verificationAttempts: 0,
                        verificationLockedUntil: null,
                    },
                });
                return res.json({ success: true, status: 'APPROVED', message: 'Verified successfully.' });
            } else {
                // Failure Logic
                let newAttempts = (currentUser.verificationAttempts || 0) + 1;
                let lockUntil = null;

                // If 6th failure -> Lock for 10 mins
                if (newAttempts >= 6) {
                    lockUntil = new Date(Date.now() + 10 * 60 * 1000);
                    // Reset attempts logically for next cycle? User said "10 mins then come back and loop".
                    // So we keep attempts at 6 or reset? Let's reset to 0 so after 10 mins they start fresh 0/6.
                    newAttempts = 0;
                }

                await prisma.user.update({
                    where: { id: req.user.id },
                    data: {
                        verificationAttempts: newAttempts,
                        verificationLockedUntil: lockUntil,
                    },
                });

                // Return Error to Frontend (Do NOT set Pending)
                const isLocking = !!lockUntil;
                const canManual = newAttempts >= 3;

                return res.status(400).json({
                    success: false,
                    error: isLocking
                        ? 'คุณทำรายการไม่สำเร็จครบ 6 ครั้ง ระบบจะระงับการอัปโหลด 10 นาที'
                        : `AI อ่านข้อมูลไม่พบ (ครั้งที่ ${newAttempts}/6) กรุณาใช้ไฟล์รูปที่ชัดเจน`,
                    attempts: newAttempts,
                    canManual: canManual && !isLocking,
                    isLocked: isLocking,
                });
            }



        } catch (error) {
            logger.error('Identity Verify Error:', error);
            logger.info('CRITICAL DEBUG:', error.message);

            // Handle "Record not found" (P2025)
            // This happens if the user was deleted but their JWT is still valid (Zombie Token)
            if (error.code === 'P2025' || error.message.includes('Record to update not found')) {
                return res.status(401).json({ success: false, error: 'User account not found / Session Invalid. Please log out and log in again.' });
            }

            // EXPOSE ERROR TO FRONTEND FOR DEBUGGING
            res.status(500).json({ success: false, error: 'Debug Error: ' + error.message, details: error.stack });
        }
    });
});

/**
 * @route   GET /api/identity/status
 * @desc    Get current verification status
 * @access  Private
 */
router.get('/status', auth.authenticateFarmer, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                verificationStatus: true,
                verificationSubmittedAt: true,
                verificationNote: true,
                verificationDocuments: true,
            },
        });

        // Handle legacy users (null status) -> Treat as NEW
        const status = user.verificationStatus || 'NEW';

        res.json({
            success: true,
            data: {
                status: status,
                submittedAt: user.verificationSubmittedAt,
                note: user.verificationNote,
                documents: user.verificationDocuments,
            },
        });
    } catch (error) {
        logger.error('Get Status Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @route   GET /api/identity/pending
 * @desc    List all pending verifications
 * @access  Staff Only
 */
router.get('/pending', auth.authenticateDTAM, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                verificationStatus: 'PENDING',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                accountType: true,
                verificationSubmittedAt: true,
            },
            orderBy: {
                verificationSubmittedAt: 'asc',
            },
        });

        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        logger.error('List Pending Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @route   GET /api/identity/user/:id
 * @desc    Get specific user verification details
 * @access  Staff Only
 */
router.get('/user/:id', auth.authenticateDTAM, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                accountType: true,
                taxId: true,
                companyName: true,
                laserCode: true,
                verificationDocuments: true,
                verificationStatus: true,
                verificationSubmittedAt: true,
            },
        });

        if (!user) { return res.status(404).json({ success: false, error: 'User not found' }); }

        res.json({ success: true, data: user });
    } catch (error) {
        logger.error('Get User Details Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

/**
 * @route   POST /api/identity/review/:id
 * @desc    Approve or Reject verification
 * @access  Staff Only
 */
router.post('/review/:id', auth.authenticateDTAM, async (req, res) => {
    const { action, note } = req.body; // action: 'APPROVE' | 'REJECT'

    try {
        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        // const userStatus = action === 'APPROVE' ? 'ACTIVE' : 'PENDING_VERIFICATION';
        // If rejected, user stays PENDING_VERIFICATION (or LOCKED?) 
        // Logic: if Rejected, we set verificationStatus='REJECTED' so frontend shows rejection message.
        // And user.status can be 'PENDING_VERIFICATION' (restricted).

        await prisma.user.update({
            where: { id: req.params.id },
            data: {
                verificationStatus: newStatus,
                verificationNote: note || (action === 'APPROVE' ? 'Approved by Staff' : 'Documents rejected'),
                status: action === 'APPROVE' ? 'ACTIVE' : 'PENDING_VERIFICATION',
                updatedBy: req.user.username, // Log who did it
            },
        });

        res.json({ success: true, message: `User verification ${action}D` });

    } catch (error) {
        logger.error('Review Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
