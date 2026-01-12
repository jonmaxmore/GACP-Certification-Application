const { prisma } = require('./prisma-database');
const ocrService = require('./ocr-service');
const logger = require('../shared/logger');

class IdentityService {

    /**
     * Verify Identity (eKYC)
     * Handles Validation, Lockout, AI Check, and DB Updates
     */
    async verifyIdentity(userId, files, body) {
        const { laserCode, taxId, forceManual } = body;

        // 1. Validation
        if (!files.idCardImage && !files.companyCertImage) {
            throw new Error('Please upload at least ID Card or Company Certificate');
        }

        // Construct URLs
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

        // Fetch User
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { idCard: true, verificationAttempts: true, verificationLockedUntil: true },
        });

        if (!currentUser) throw new Error('User not found');

        // 2. Check Lockout
        if (currentUser.verificationLockedUntil && new Date() < new Date(currentUser.verificationLockedUntil)) {
            const waitTime = Math.ceil((new Date(currentUser.verificationLockedUntil) - new Date()) / 60000);
            return {
                success: false,
                isLocked: true,
                error: `ระบบถูกระงับชั่วคราวเนื่องจากทำรายการไม่สำเร็จเกินกำหนด กรุณารอ ${waitTime} นาที`,
            };
        }

        // 3. Force Manual Review
        if (forceManual === 'true') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    verificationStatus: 'PENDING',
                    verificationDocuments: docData,
                    verificationSubmittedAt: new Date(),
                    verificationNote: 'User requested manual review.',
                    verificationAttempts: 0,
                },
            });
            return { success: true, status: 'PENDING', message: 'Submitted for manual review.' };
        }

        // 4. AI Verification
        let match = false;
        let ocrMessage = '';
        let result = null;

        try {
            if (files.idCardImage && files.idCardImage[0]) {
                const filePath = files.idCardImage[0].path;
                result = await ocrService.verifyIdCard(filePath, currentUser.idCard);
                match = result.match;
                ocrMessage = result.message;
            }
        } catch (e) {
            logger.error('OCR Error', e);
            ocrMessage = 'OCR Error';
        }

        if (match) {
            // Success
            await prisma.user.update({
                where: { id: userId },
                data: {
                    verificationStatus: 'APPROVED',
                    status: 'ACTIVE',
                    verificationDocuments: docData,
                    verificationSubmittedAt: new Date(),
                    verificationNote: `AI Verified: ${ocrMessage} (Conf: ${result?.confidence}%)`,
                    verificationAttempts: 0,
                    verificationLockedUntil: null,
                },
            });

            return {
                success: true,
                status: 'APPROVED',
                message: 'Verified successfully.',
                aiAnalysis: {
                    confidence: result?.confidence,
                    message: ocrMessage,
                    extractedSnippet: result?.extractedText
                }
            };
        } else {
            // Failure
            let newAttempts = (currentUser.verificationAttempts || 0) + 1;
            let lockUntil = null;

            if (newAttempts >= 6) {
                lockUntil = new Date(Date.now() + 10 * 60 * 1000);
                newAttempts = 0;
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    verificationAttempts: newAttempts,
                    verificationLockedUntil: lockUntil,
                },
            });

            const isLocking = !!lockUntil;
            const canManual = newAttempts >= 3;

            return {
                success: false,
                error: isLocking
                    ? 'คุณทำรายการไม่สำเร็จครบ 6 ครั้ง ระบบจะระงับการอัปโหลด 10 นาที'
                    : `AI อ่านข้อมูลไม่พบ (ครั้งที่ ${newAttempts}/6) กรุณาใช้ไฟล์รูปที่ชัดเจน`,
                attempts: newAttempts,
                canManual: canManual && !isLocking,
                isLocked: isLocking,
                aiAnalysis: {
                    confidence: result ? result.confidence : 0,
                    message: ocrMessage || 'No match found',
                    extractedSnippet: result ? result.extractedText : ''
                }
            };
        }
    }

    /**
     * Get Verification Status
     */
    async getStatus(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                verificationStatus: true,
                verificationSubmittedAt: true,
                verificationNote: true,
                verificationDocuments: true,
            },
        });

        if (!user) throw new Error('User not found');

        return {
            status: user.verificationStatus || 'NEW',
            submittedAt: user.verificationSubmittedAt,
            note: user.verificationNote,
            documents: user.verificationDocuments,
        };
    }

    /**
     * List Pending Verifications (Staff)
     */
    async getPendingUsers() {
        return prisma.user.findMany({
            where: { verificationStatus: 'PENDING' },
            select: {
                id: true, firstName: true, lastName: true, email: true,
                accountType: true, verificationSubmittedAt: true,
            },
            orderBy: { verificationSubmittedAt: 'asc' },
        });
    }

    /**
     * Get User Details (Staff)
     */
    async getUserDetails(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true, firstName: true, lastName: true, email: true,
                phoneNumber: true, accountType: true, taxId: true,
                companyName: true, laserCode: true, verificationDocuments: true,
                verificationStatus: true, verificationSubmittedAt: true,
            },
        });
    }

    /**
     * Review User (Approve/Reject)
     */
    async reviewUser(id, action, note, reviewerName) {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

        return prisma.user.update({
            where: { id },
            data: {
                verificationStatus: newStatus,
                verificationNote: note || (action === 'APPROVE' ? 'Approved by Staff' : 'Documents rejected'),
                status: action === 'APPROVE' ? 'ACTIVE' : 'PENDING_VERIFICATION',
                updatedBy: reviewerName,
            },
        });
    }
}

module.exports = new IdentityService();
