const { prisma } = require('./prisma-database');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt-security');

class PrismaAuthService {
    async register(data) {
        const { idCardImage, identifier, confirmPassword, ...userData } = data;
        // Basic user creation

        // --- 🤖 Mock OCR Logic for UAT ---
        // If ID Card ends with '9' -> Simulate "OCR Fail" (Require Manual Review)
        // Else -> Simulate "OCR Pass" (Auto Approve)
        let verificationStatus = 'APPROVED';
        let status = 'ACTIVE';
        let verificationNote = 'Auto-approved by OCR System';

        if (userData.idCard && userData.idCard.endsWith('9')) {
            verificationStatus = 'PENDING_VERIFICATION';
            status = 'PENDING_VERIFICATION';
            verificationNote = 'OCR Failed: Image unclear or data mismatch. Manual review required.';
        }

        console.log('[MockOCR] ID:', userData.idCard);
        console.log('[MockOCR] Decided Status:', status);
        console.log('[MockOCR] Decided Verify:', verificationStatus);

        // ---------------------------------



        // Generate Hash for Uniqueness Check
        const crypto = require('crypto');
        let idCardHash = null;
        if (userData.idCard) {
            idCardHash = crypto.createHash('sha256').update(userData.idCard).digest('hex');
        }

        const createPayload = {
            data: {
                ...userData,
                idCardHash, // Enforce Uniqueness
                password: await bcrypt.hash(userData.password, 10),
                verificationStatus,
                status,
                verificationNote,
                verificationSubmittedAt: new Date(),
            },
        };
        console.log('[MockOCR] Prisma Payload:', JSON.stringify(createPayload, null, 2));

        const user = await prisma.user.create(createPayload);

        // [UAT Fix] Force update if status doesn't match (Double-check)
        if (user.status !== status || user.verificationStatus !== verificationStatus) {
            console.log('[MockOCR] ⚠️ Status mismatch detected. Forcing update to ensure UAT works...');
            return await prisma.user.update({
                where: { id: user.id },
                data: { status, verificationStatus },
            });
        }

        return user;
    }

    async login(loginId, password, accountType) {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: loginId },
                    { idCard: loginId },
                ],
            },
        });
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new Error('Invalid credentials');
        }

        const token = jwtConfig.generateToken({ id: user.id, role: user.accountType });
        return { user, token };
    }

    async getProfile(userId) {
        return await prisma.user.findUnique({ where: { id: userId } });
    }

    // [NEW] Update Profile
    async updateProfile(userId, data) {
        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async checkIdentifierExists(identifier) {
        // checks...
        return false;
    }
}

module.exports = new PrismaAuthService();
