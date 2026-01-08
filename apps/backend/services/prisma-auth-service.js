/**
 * Prisma Auth Service - PostgreSQL
 * Replaces MongoDB-based AuthService
 */

const userRepository = require('../repositories/prisma-user-repository');
const jwt = require('jsonwebtoken');
const { hash } = require('../shared/encryption');
const logger = require('../shared/logger');
const bcrypt = require('bcryptjs');

// Read JWT_SECRET dynamically to ensure dotenv has loaded
const getJwtSecret = () => process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

class PrismaAuthService {
    constructor() {
        console.log('[Auth] Service Initialized at', new Date().toISOString());
    }

    async register(userData) {
        try {
            const { accountType = 'INDIVIDUAL', identifier, password, phoneNumber } = userData;
            const cleanId = identifier ? identifier.replace(/-/g, '') : null;
            const idHash = cleanId ? hash(cleanId) : null;

            // Build user data based on account type
            const createData = {
                password,
                phoneNumber: phoneNumber?.replace(/-/g, ''),
                accountType,
                role: 'FARMER',
                status: 'ACTIVE',
            };

            if (accountType === 'INDIVIDUAL') {
                createData.idCardHash = idHash;
                createData.firstName = userData.firstName;
                createData.lastName = userData.lastName;
            } else if (accountType === 'JURISTIC') {
                createData.taxIdHash = idHash;
                createData.companyName = userData.companyName;
            } else if (accountType === 'COMMUNITY_ENTERPRISE') {
                createData.communityRegistrationNoHash = idHash;
                createData.communityName = userData.communityName;
            }

            if (userData.email) {
                createData.email = userData.email.toLowerCase();
            }

            const user = await userRepository.create(createData);
            logger.info(`[Auth] User registered: ${user.id}`);
            return user;
        } catch (error) {
            logger.error(`[Auth] Register error: ${error.message}`);
            throw error;
        }
    }

    async login(identifier, password, accountType = 'INDIVIDUAL') {
        try {
            const cleanId = identifier.replace(/-/g, '');
            const idHash = hash(cleanId);

            let user;
            if (accountType === 'INDIVIDUAL') {
                // Use Optimized Scan to avoid OOM
                user = await userRepository.findAuthUserByIdCardHash
                    ? await userRepository.findAuthUserByIdCardHash(idHash)
                    : await userRepository.findByIdCardHash(idHash);
            } else if (accountType === 'JURISTIC') {
                user = await userRepository.findByTaxIdHash(idHash);
            } else if (accountType === 'COMMUNITY_ENTERPRISE') {
                user = await userRepository.findByCommunityHash(idHash);
            } else {
                user = await userRepository.findByEmail(identifier);
            }

            if (!user) {
                logger.warn(`[Auth] User not found for hash: ${idHash}`);
                throw new Error('ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
            }

            if (user.status === 'SUSPENDED' || user.status === 'LOCKED') {
                throw new Error('บัญชีถูกระงับการใช้งาน');
            }

            const isMatch = bcrypt.compareSync(password, user.password);

            if (!isMatch) {
                await userRepository.incrementLoginAttempts(user.id);
                logger.warn(`[Auth] Invalid password for user: ${user.id}`);
                throw new Error('ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
            }

            // Skip updateLoginInfo to reduce load on login
            // await userRepository.updateLoginInfo(user.id);

            const token = this._generateToken(user);
            const refreshToken = this._generateRefreshToken(user);

            return {
                token,
                refreshToken,
                user: this._sanitizeUser(user),
            };

        } catch (error) {
            logger.error(`[Auth] Login error: ${error.message}`);
            throw error;
        }
    }

    _generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                uuid: user.uuid,
                role: user.role
            },
            getJwtSecret(),
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    _generateRefreshToken(user) {
        return jwt.sign(
            { id: user.id },
            getJwtSecret(),
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
        );
    }


    _sanitizeUser(user) {
        return {
            id: user.id,
            uuid: user.uuid,
            role: user.role,
            accountType: user.accountType,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            status: user.status
        };
    }
}

module.exports = new PrismaAuthService();
