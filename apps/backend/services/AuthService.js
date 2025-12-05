const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwtSecurity = require('../config/jwt-security');
const { validateThaiID, validateLaserCode } = require('../utils/validators');
const crypto = require('crypto');

class AuthService {
    /**
     * Register a new farmer
     * @param {Object} data - Registration data
     * @returns {Promise<Object>} - Created user and verification token
     */
    async register(data) {
        // 1. Check if email already exists
        const emailExists = await UserModel.findOne({ email: data.email.toLowerCase() });
        if (emailExists) {
            throw new Error('Email already registered');
        }

        // 2. Check if ID card already exists
        const idCardExists = await UserModel.findOne({ idCard: data.idCard });
        if (idCardExists) {
            throw new Error('ID card already registered');
        }

        // 3. Validate ID Card
        if (!validateThaiID(data.idCard)) {
            throw new Error('Invalid Thai ID Card number');
        }

        // 4. Validate Laser Code
        if (!data.laserCode || !validateLaserCode(data.laserCode)) {
            throw new Error(`Invalid Laser Code format: '${data.laserCode}'`);
        }

        // 5. Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // 6. Create user
        // Note: Password hashing is handled by UserModel pre-save hook
        const user = new UserModel({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            idCard: data.idCard,
            idCardImage: data.idCardImage,
            laserCode: data.laserCode,
            corporateId: data.corporateId,
            farmerType: (data.farmerType || 'INDIVIDUAL').toUpperCase(),
            farmingExperience: data.farmingExperience || 0,
            address: data.address || '',
            province: data.province || '',
            district: data.district || '',
            subdistrict: data.subDistrict || data.subdistrict || '',
            zipCode: data.postalCode || data.zipCode || '',
            role: 'FARMER',
            status: 'PENDING_VERIFICATION',
            verificationStatus: 'pending',
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpiry: verificationExpiry,
            metadata: data.metadata || {},
        });

        await user.save();

        return {
            user,
            verificationToken
        };
    }

    /**
     * Login a farmer
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} - User and token
     */
    async login(email, password) {
        // 1. Find user
        const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // 2. Check status
        if (user.status === 'SUSPENDED') {
            throw new Error('Your account has been suspended. Please contact support');
        }

        // Note: We might want to allow login even if pending verification for some flows, 
        // but strict requirement says verify first.
        if (user.status === 'PENDING_VERIFICATION' && !user.isEmailVerified) {
            throw new Error('Please verify your email before logging in');
        }

        // 3. Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        // 4. Generate Token
        const token = jwtSecurity.generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
            status: user.status
        });

        // 5. Update login stats
        user.lastLoginAt = new Date();
        user.loginAttempts = 0;
        await user.save();

        return {
            user,
            token
        };
    }

    /**
     * Verify email
     * @param {string} token 
     */
    async verifyEmail(token) {
        const user = await UserModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpiry: { $gt: new Date() }
        });

        if (!user) {
            throw new Error('Invalid or expired verification token');
        }

        user.isEmailVerified = true;
        user.status = 'ACTIVE';
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save();

        return user;
    }
}

module.exports = new AuthService();
