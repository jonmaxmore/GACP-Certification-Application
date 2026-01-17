const { prisma } = require('./prisma-database');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt-security');

const crypto = require('crypto');

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
                idCard: identifier || userData.idCard, // [FIX] Ensure idCard is set from identifier if provided
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
        console.log('[AuthService] Login attempt:', { loginId, accountType });

        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: loginId },
                        { idCard: loginId },
                    ],
                },
            });

            console.log('[AuthService] User found:', user ? 'YES' : 'NO');

            if (!user) {
                console.log('[AuthService] User not found');
                throw new Error('ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
            }

            // [LOCKOUT CHECK]
            if (user.isLocked && user.lockedUntil && new Date() < user.lockedUntil) {
                const remainingMs = user.lockedUntil.getTime() - new Date().getTime();
                const remainingMin = Math.ceil(remainingMs / 60000);
                throw new Error(`Account locked. Try again in ${remainingMin} minutes.`);
            }

            // [AUTO UNLOCK]
            if (user.isLocked && user.lockedUntil && new Date() >= user.lockedUntil) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { isLocked: false, lockedUntil: null, loginAttempts: 0 }
                });
            }

            console.log('[AuthService] Comparing password...');
            const passwordMatch = await bcrypt.compare(password, user.password);
            console.log('[AuthService] Password match:', passwordMatch ? 'YES' : 'NO');

            if (!passwordMatch) {
                console.log('[AuthService] Password incorrect');

                // [INCREMENT ATTEMPTS]
                const newAttempts = (user.loginAttempts || 0) + 1;
                let updateData = { loginAttempts: newAttempts };

                if (newAttempts >= 5) {
                    updateData.isLocked = true;
                    updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: updateData
                });

                if (newAttempts >= 5) {
                    throw new Error('Account locked due to too many failed attempts.');
                }

                throw new Error('ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
            }

            console.log('[AuthService] Login successful for user:', user.id);

            // [RESET ATTEMPTS using updateMany or update to match id]
            await prisma.user.update({
                where: { id: user.id },
                data: { loginAttempts: 0, isLocked: false, lockedUntil: null, lastLoginAt: new Date() }
            });

            const token = jwtConfig.generateToken({ id: user.id, role: user.accountType });
            return { user, token };

        } catch (error) {
            console.log('[AuthService] Login error:', error.message);
            throw error;
        }
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

    async checkIdentifierExists(identifier, accountType = 'INDIVIDUAL') {
        const cleanId = (identifier || '').replace(/-/g, '');
        if (!cleanId) {
            return false;
        }

        const hashed = crypto.createHash('sha256').update(cleanId).digest('hex');
        let where;

        switch (accountType) {
            case 'JURISTIC':
                where = { taxIdHash: hashed };
                break;
            case 'COMMUNITY_ENTERPRISE':
                where = { communityRegistrationNoHash: hashed };
                break;
            case 'INDIVIDUAL':
            default:
                where = { idCardHash: hashed };
                break;
        }

        const existing = await prisma.user.findFirst({ where });
        return !!existing;
    }

    /**
     * Login or Register with ThaID (Trusted Source)
     * @param {Object} userData - Data from ThaID (idCard, firstName, lastName, address)
     * @returns {Object} { user, token }
     */
    async loginWithThaID(userData) {
        console.log('[AuthService] Login with ThaID:', userData.idCard);

        const idCardHash = crypto.createHash('sha256').update(userData.idCard).digest('hex');

        let user = await prisma.user.findFirst({
            where: { idCardHash },
        });

        if (user) {
            console.log('[AuthService] ThaID User exists, logging in:', user.id);
            // If exists, just update latest info if needed (optional)
        } else {
            console.log('[AuthService] ThaID User new, registering...');
            // Auto-register
            user = await prisma.user.create({
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    phoneNumber: userData.phoneNumber || '', // Might need to ask user later
                    email: userData.email || '',
                    idCard: userData.idCard,
                    idCardHash,
                    password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password
                    accountType: 'INDIVIDUAL', // Default to Individual for ThaID
                    role: 'INDIVIDUAL_FARMER',
                    status: 'ACTIVE',
                    verificationStatus: 'APPROVED', // Trusted Source!
                    verificationNote: 'Verified via ThaID (Digital ID)',
                    verificationSubmittedAt: new Date(),
                    address: typeof userData.address === 'string' ? userData.address : JSON.stringify(userData.address),
                },
            });
        }

        const token = jwtConfig.generateToken({ id: user.id, role: user.accountType });
        return { user, token };
    }
}

module.exports = new PrismaAuthService();
