/**
 * Prisma Auth Service - PostgreSQL
 * 
 * Authentication service using Prisma ORM (PostgreSQL)
 * Replaces MongoDB-based AuthService
 */

const userRepository = require('../repositories/prisma-user-repository');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../shared/logger');
const { hash } = require('../shared/encryption');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

class PrismaAuthService {
    /**
     * Register a new user
     */
    async register(userData) {
        const { accountType = 'INDIVIDUAL', password, identifier, idCardImage, ...rest } = userData;

        // Prepare data based on account type
        const createData = {
            accountType,
            password,
            status: 'PENDING_VERIFICATION',
            role: 'FARMER',
            ...rest,
        };

        // Set identifier hash based on account type
        if (accountType === 'INDIVIDUAL' && userData.idCard) {
            createData.idCard = userData.idCard; // Will be encrypted by repository
            createData.idCardHash = hash(userData.idCard.replace(/-/g, ''));
        } else if (accountType === 'JURISTIC' && userData.taxId) {
            createData.taxId = userData.taxId;
            createData.taxIdHash = hash(userData.taxId.replace(/-/g, ''));
        } else if (accountType === 'COMMUNITY_ENTERPRISE' && userData.communityRegistrationNo) {
            createData.communityRegistrationNo = userData.communityRegistrationNo;
            createData.communityRegistrationNoHash = hash(userData.communityRegistrationNo.replace(/-/g, ''));
        }

        // Handle generic identifier field (from mobile app)
        if (userData.identifier) {
            const cleanId = userData.identifier.replace(/-/g, '');
            switch (accountType) {
                case 'INDIVIDUAL':
                    createData.idCard = userData.identifier;
                    createData.idCardHash = hash(cleanId);
                    break;
                case 'JURISTIC':
                    createData.taxId = userData.identifier;
                    createData.taxIdHash = hash(cleanId);
                    break;
                case 'COMMUNITY_ENTERPRISE':
                    createData.communityRegistrationNo = userData.identifier;
                    createData.communityRegistrationNoHash = hash(cleanId);
                    break;
            }
        }

        const user = await userRepository.create(createData);

        logger.info(`[PrismaAuthService] User registered: ${user.uuid}`);

        return this._sanitizeUser(user);
    }

    /**
     * Login user
     */
    async login(identifier, password, accountType = 'INDIVIDUAL') {
        const cleanId = identifier.replace(/-/g, '');
        const idHash = hash(cleanId);

        let user;

        // Find user based on account type
        switch (accountType) {
            case 'INDIVIDUAL':
                user = await userRepository.findByIdCardHash(idHash);
                break;
            case 'JURISTIC':
                user = await userRepository.findByTaxIdHash(idHash);
                break;
            case 'COMMUNITY_ENTERPRISE':
                user = await userRepository.findByCommunityHash(idHash);
                break;
            default:
                // Try email login
                user = await userRepository.findByEmail(identifier);
        }

        if (!user) {
            throw new Error('ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
        }

        // Check if account is locked
        if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error('บัญชีถูกล็อคชั่วคราว กรุณาลองใหม่ในภายหลัง');
        }

        // Check if account is active
        if (user.status === 'SUSPENDED' || user.status === 'LOCKED') {
            throw new Error('บัญชีถูกระงับการใช้งาน');
        }

        // Verify password
        const isMatch = await userRepository.comparePassword(user.id, password);
        if (!isMatch) {
            await userRepository.incrementLoginAttempts(user.id);
            throw new Error('ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง');
        }

        // Update login info
        await userRepository.updateLoginInfo(user.id);

        // Generate tokens
        const token = this._generateToken(user);
        const refreshToken = this._generateRefreshToken(user);

        logger.info(`[PrismaAuthService] User logged in: ${user.uuid}`);

        return {
            token,
            refreshToken,
            user: this._sanitizeUser(user),
        };
    }

    /**
     * Get user profile
     */
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return this._sanitizeUser(user);
    }

    /**
     * Check if identifier already exists
     */
    async checkIdentifierExists(identifier, accountType) {
        const cleanId = identifier.replace(/-/g, '');
        const idHash = hash(cleanId);

        let user;
        switch (accountType) {
            case 'INDIVIDUAL':
                user = await userRepository.findByIdCardHash(idHash);
                break;
            case 'JURISTIC':
                user = await userRepository.findByTaxIdHash(idHash);
                break;
            case 'COMMUNITY_ENTERPRISE':
                user = await userRepository.findByCommunityHash(idHash);
                break;
        }

        return !!user;
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, JWT_SECRET);
            const user = await userRepository.findById(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            const newToken = this._generateToken(user);
            return { token: newToken };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    // Private methods
    _generateToken(user) {
        return jwt.sign(
            { id: user.id, uuid: user.uuid, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    _generateRefreshToken(user) {
        return jwt.sign(
            { id: user.id, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
        );
    }

    _sanitizeUser(user) {
        const { password, idCard, laserCode, taxId, communityRegistrationNo, ...safeUser } = user;
        return safeUser;
    }
}

module.exports = new PrismaAuthService();

