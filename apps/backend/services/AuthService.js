const UserModel = require('../models/UserModel');
const jwtSecurity = require('../config/JwtSecurity');
const { validateThaiID, validateLaserCode } = require('../utils/validators');
const { hash } = require('../shared/encryption');

class AuthService {
    /**
     * V2 Registration Logic
     * strict validation, clear error messages
     */
    async register(data) {
        console.log('[AuthService] Registering:', data.email);

        // 1. Validate ID Card Format
        if (!validateThaiID(data.idCard)) {
            throw new Error('Invalid ID Card Number (Checksum Failed)');
        }

        // 2. Validate Laser Code Format
        if (!validateLaserCode(data.laserCode)) {
            throw new Error('Invalid Laser Code Format (Must be 2 letters + 10 digits)');
        }

        // 3. Check Duplicates
        const existingEmail = await UserModel.findOne({ email: data.email.toLowerCase() });
        if (existingEmail) throw new Error('Email is already registered');

        // Check idCard by hash (since idCard is encrypted in DB)
        const idCardHashValue = hash(data.idCard);
        const existingID = await UserModel.findOne({ idCardHash: idCardHashValue });
        if (existingID) throw new Error('ID Card is already registered');

        // 4. Create User
        const user = new UserModel({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            idCard: data.idCard,
            laserCode: data.laserCode,
            idCardImage: data.idCardImage, // Optional
            role: 'FARMER',
            status: 'PENDING_VERIFICATION'
        });

        await user.save();
        console.log('[AuthService] Use Created:', user._id);

        return user;
    }

    /**
     * V2 Login Logic
     */
    async login(email, password) {
        const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) throw new Error('Invalid Credentials');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) throw new Error('Invalid Credentials');

        const token = jwtSecurity.generateToken({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return { user, token };
    }

    /**
     * V2 Profile Logic
     */
    async getProfile(userId) {
        return await UserModel.findById(userId);
    }
}

module.exports = new AuthService();
