const UserModel = require('../models-mongoose-legacy/user-model');
const jwtSecurity = require('../config/jwt-security');
const { validateThaiID, validateLaserCode } = require('../utils/validators');
const { hash } = require('../shared/encryption');

class AuthService {
    /**
     * V2 Registration Logic (Multi-Account Type Support)
     * Supports: INDIVIDUAL, JURISTIC, COMMUNITY_ENTERPRISE
     */
    async register(data) {
        const { accountType = 'INDIVIDUAL' } = data;
        console.log('[AuthService] Registering:', accountType, data.firstName || data.companyName || data.communityName);

        let userData = {
            accountType: accountType,
            password: data.password,
            phoneNumber: data.phoneNumber,
            role: 'FARMER',
            status: 'PENDING_VERIFICATION'
        };

        // Only add email if provided (sparse index requires undefined, not null)
        if (data.email && data.email.trim()) {
            userData.email = data.email.toLowerCase();
            const existingEmail = await UserModel.findOne({ email: userData.email });
            if (existingEmail) throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
        }

        switch (accountType) {
            case 'INDIVIDUAL':
                // Validate Thai ID (optional strict validation)
                const idCard = data.idCard || data.identifier;
                if (idCard && !validateThaiID(idCard)) {
                    throw new Error('เลขบัตรประชาชนไม่ถูกต้อง (Invalid Thai ID checksum)');
                }

                // Validate Laser Code if provided
                if (data.laserCode && !validateLaserCode(data.laserCode)) {
                    throw new Error('เลข Laser Code ไม่ถูกต้อง');
                }

                // Check ID duplicate
                const idCardHashValue = hash(idCard);
                const existingID = await UserModel.findOne({ idCardHash: idCardHashValue });
                if (existingID) throw new Error('เลขบัตรประชาชนนี้ถูกลงทะเบียนแล้ว');

                userData = {
                    ...userData,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    idCard: idCard,
                    laserCode: data.laserCode,
                    idCardImage: data.idCardImage,
                    farmerType: 'INDIVIDUAL',
                    address: data.address,
                    province: data.province,
                    district: data.district,
                    subdistrict: data.subdistrict,
                    zipCode: data.zipCode,
                };
                break;

            case 'JURISTIC':
                const taxId = data.taxId || data.identifier;

                // Check Tax ID format (13 digits)
                if (!/^\d{13}$/.test(taxId)) {
                    throw new Error('เลขทะเบียนนิติบุคคลต้องมี 13 หลัก');
                }

                // Check Tax ID duplicate
                const taxIdHashValue = hash(taxId);
                const existingTax = await UserModel.findOne({ taxIdHash: taxIdHashValue });
                if (existingTax) throw new Error('เลขทะเบียนนิติบุคคลนี้ถูกลงทะเบียนแล้ว');

                userData = {
                    ...userData,
                    companyName: data.companyName,
                    taxId: taxId,
                    representativeName: data.representativeName,
                    representativePosition: data.representativePosition,
                    farmerType: 'CORPORATE',
                    address: data.address,
                    province: data.province,
                };
                break;

            case 'COMMUNITY_ENTERPRISE':
                const ceNo = data.communityRegistrationNo || data.identifier;

                // Check CE No duplicate
                const ceHashValue = hash(ceNo);
                const existingCE = await UserModel.findOne({ communityRegistrationNoHash: ceHashValue });
                if (existingCE) throw new Error('เลขทะเบียนวิสาหกิจชุมชนนี้ถูกลงทะเบียนแล้ว');

                userData = {
                    ...userData,
                    communityName: data.communityName,
                    communityRegistrationNo: ceNo,
                    representativeName: data.representativeName,
                    farmerType: 'COMMUNITY_ENTERPRISE',
                    address: data.address,
                    province: data.province,
                };
                break;

            default:
                throw new Error('ประเภทบัญชีไม่ถูกต้อง');
        }

        // Create User
        const user = new UserModel(userData);
        await user.save();
        console.log('[AuthService] User Created:', user._id);

        return user;
    }

    /**
     * V2 Login Logic (Multi-Account Type Support)
     */
    async login(identifier, password, accountType = null) {
        console.log('[AuthService] Login attempt:', { identifier, accountType });
        let user;

        // Determine lookup method based on identifier format or accountType
        if (accountType === 'STAFF' || identifier.includes('@')) {
            // Email login
            user = await UserModel.findOne({ email: identifier.toLowerCase() }).select('+password');
        } else if (accountType === 'JURISTIC') {
            // Tax ID lookup
            const taxIdHashValue = hash(identifier);
            user = await UserModel.findOne({ taxIdHash: taxIdHashValue }).select('+password');
        } else if (accountType === 'COMMUNITY_ENTERPRISE') {
            // CE No lookup
            const ceHashValue = hash(identifier);
            user = await UserModel.findOne({ communityRegistrationNoHash: ceHashValue }).select('+password');
        } else {
            // Thai ID lookup (INDIVIDUAL or auto-detect)
            const idCardHashValue = hash(identifier);
            user = await UserModel.findOne({ idCardHash: idCardHashValue }).select('+password');
        }

        if (!user) {
            const error = new Error('ไม่พบบัญชีผู้ใช้นี้ในระบบ');
            error.code = 'USER_NOT_FOUND';
            throw error;
        }

        // Check account status
        if (user.status === 'SUSPENDED') {
            const error = new Error('บัญชีถูกระงับการใช้งาน กรุณาติดต่อเจ้าหน้าที่');
            error.code = 'ACCOUNT_SUSPENDED';
            throw error;
        }

        if (user.status === 'LOCKED') {
            const error = new Error('บัญชีถูกล็อค กรุณารอ 15 นาทีหรือติดต่อเจ้าหน้าที่');
            error.code = 'ACCOUNT_LOCKED';
            throw error;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            const error = new Error('รหัสผ่านไม่ถูกต้อง');
            error.code = 'INVALID_PASSWORD';
            throw error;
        }

        // Update last login
        user.lastLoginAt = new Date();
        user.loginAttempts = 0;
        await user.save();

        // Generate token
        const token = jwtSecurity.generateToken({
            id: user._id,
            accountType: user.accountType,
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

    /**
     * Check if identifier already exists in database
     * Used for real-time validation at registration Step 2
     */
    async checkIdentifierExists(identifier, accountType) {
        const { hash } = require('../shared/encryption');
        const identifierHash = hash(identifier);

        switch (accountType) {
            case 'INDIVIDUAL':
                const existingIdCard = await UserModel.findOne({ idCardHash: identifierHash });
                return !!existingIdCard;

            case 'JURISTIC':
                const existingTaxId = await UserModel.findOne({ taxIdHash: identifierHash });
                return !!existingTaxId;

            case 'COMMUNITY_ENTERPRISE':
                const existingCE = await UserModel.findOne({ communityRegistrationNoHash: identifierHash });
                return !!existingCE;

            default:
                return false;
        }
    }
}

module.exports = new AuthService();

