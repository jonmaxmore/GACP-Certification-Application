// Using Prisma (PostgreSQL) instead of MongoDB
const AuthService = require('../services/prisma-auth-service');
const { auditLogger, AuditCategory, AuditSeverity } = require('../middleware/audit-logger');

const fs = require('fs');

class AuthController {

    async register(req, res) {
        try {
            console.log('[AuthController] Register Request Recieved');

            // Extract file path if present
            const idCardImage = req.file ? req.file.path : null;

            const userData = {
                ...req.body,
                idCardImage // Add image path to body
            };

            const { accountType = 'INDIVIDUAL' } = req.body;

            // Basic Validation based on account type
            let isValid = false;
            let errorMessage = 'Missing required fields';

            switch (accountType) {
                case 'INDIVIDUAL':
                    isValid = req.body.password && req.body.phoneNumber &&
                        (req.body.idCard || req.body.identifier) &&
                        req.body.firstName && req.body.lastName;
                    errorMessage = 'INDIVIDUAL requires: idCard/identifier, password, phoneNumber, firstName, lastName';
                    break;
                case 'JURISTIC':
                    isValid = req.body.password && req.body.phoneNumber &&
                        (req.body.taxId || req.body.identifier) &&
                        req.body.companyName;
                    errorMessage = 'JURISTIC requires: taxId/identifier, password, phoneNumber, companyName';
                    break;
                case 'COMMUNITY_ENTERPRISE':
                    isValid = req.body.password && req.body.phoneNumber &&
                        (req.body.communityRegistrationNo || req.body.identifier) &&
                        req.body.communityName;
                    errorMessage = 'COMMUNITY_ENTERPRISE requires: communityRegistrationNo/identifier, password, phoneNumber, communityName';
                    break;
                default:
                    errorMessage = 'Invalid accountType: must be INDIVIDUAL, JURISTIC, or COMMUNITY_ENTERPRISE';
            }

            if (!isValid) {
                // Cleanup file if validation fails early
                if (req.file && req.file.path) fs.unlink(req.file.path, () => { });
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const user = await AuthService.register(userData);

            // 🔒 ISO 27799: Log successful registration
            await auditLogger.logAuth(
                'REGISTER_SUCCESS',
                user.id,
                'FARMER',
                'SUCCESS',
                req.ip || req.connection?.remoteAddress,
                req.headers['user-agent'],
                { accountType }
            );

            res.status(201).json({
                success: true,
                message: 'ลงทะเบียนสำเร็จ',
                data: { user }
            });

        } catch (error) {
            console.error('[AuthController] Register Error:', error.message);

            // Cleanup Orphan File
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('[AuthController] Cleanup Failed:', err.message);
                });
            }

            // Handle MongoDB duplicate key error
            let errorMessage = error.message;
            if (error.code === 11000 || error.message.includes('E11000')) {
                // Parse which field caused the duplicate - use regex for actual index name
                const indexMatch = error.message.match(/index: (\w+)/);
                const indexName = indexMatch ? indexMatch[1] : '';

                console.log('[AuthController] Duplicate Key Index:', indexName, 'KeyValue:', error.keyValue);

                if (indexName.includes('idCardHash') || error.keyValue?.idCardHash) {
                    errorMessage = 'เลขบัตรประชาชนนี้ถูกลงทะเบียนแล้ว';
                } else if (indexName.includes('taxIdHash') || error.keyValue?.taxIdHash) {
                    errorMessage = 'เลขทะเบียนนิติบุคคลนี้ถูกลงทะเบียนแล้ว';
                } else if (indexName.includes('communityRegistrationNoHash') || error.keyValue?.communityRegistrationNoHash) {
                    errorMessage = 'เลขทะเบียนวิสาหกิจชุมชนนี้ถูกลงทะเบียนแล้ว';
                } else if (indexName.includes('phoneNumber') || error.keyValue?.phoneNumber) {
                    errorMessage = 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว';
                } else if (indexName.includes('email') || error.keyValue?.email) {
                    errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
                } else {
                    errorMessage = 'ข้อมูลนี้ถูกลงทะเบียนในระบบแล้ว';
                }
            }

            res.status(400).json({
                success: false,
                error: errorMessage
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password, accountType, identifier } = req.body;

            // Support both old email flow and new identifier flow
            const loginId = identifier || email;

            if (!loginId || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Identifier and password are required'
                });
            }

            const result = await AuthService.login(loginId, password, accountType);

            // Set httpOnly cookies for web clients
            res.cookie('auth_token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                path: '/',
            });

            // Set refresh token if available
            if (result.refreshToken) {
                res.cookie('refresh_token', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    path: '/',
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    // Keep tokens for mobile apps
                    tokens: {
                        accessToken: result.token,
                        refreshToken: result.refreshToken
                    },
                    user: result.user
                }
            });

            // 🔒 ISO 27799: Log successful authentication
            await auditLogger.logAuth(
                'LOGIN_SUCCESS',
                result.user.id,
                result.user.role,
                'SUCCESS',
                req.ip || req.connection?.remoteAddress,
                req.headers['user-agent'],
                { accountType, identifier: loginId?.substring(0, 4) + '****' }
            );

        } catch (error) {
            console.error('[AuthController] Login Error:', error.message);

            // 🔒 ISO 27799: Log failed authentication
            await auditLogger.logAuth(
                'LOGIN_FAILURE',
                'ANONYMOUS',
                'UNKNOWN',
                'FAILURE',
                req.ip || req.connection?.remoteAddress,
                req.headers['user-agent'],
                { reason: error.message, accountType }
            );

            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }

    async getMe(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            const user = await AuthService.getProfile(req.user.id);
            res.status(200).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }

    /**
     * Check if identifier (ID Card / Tax ID / CE No) already exists
     * POST /auth/check-identifier
     * Used for real-time validation at registration Step 2
     */
    async checkIdentifier(req, res) {
        try {
            const { identifier, accountType = 'INDIVIDUAL' } = req.body;

            if (!identifier) {
                return res.status(400).json({
                    success: false,
                    error: 'Identifier is required',
                    available: false
                });
            }

            // Clean identifier (remove dashes)
            const cleanId = identifier.replace(/-/g, '');

            // Validate format based on account type
            if (accountType !== 'COMMUNITY_ENTERPRISE') {
                if (cleanId.length !== 13) {
                    return res.status(400).json({
                        success: false,
                        error: 'ต้องมี 13 หลัก',
                        available: false
                    });
                }
                if (!/^\d+$/.test(cleanId)) {
                    return res.status(400).json({
                        success: false,
                        error: 'ต้องเป็นตัวเลขเท่านั้น',
                        available: false
                    });
                }
            }

            // Check for duplicates in database
            const isDuplicate = await AuthService.checkIdentifierExists(cleanId, accountType);

            if (isDuplicate) {
                let errorMessage = 'ข้อมูลนี้ถูกลงทะเบียนแล้ว';
                switch (accountType) {
                    case 'INDIVIDUAL':
                        errorMessage = 'เลขบัตรประชาชนนี้ถูกลงทะเบียนแล้ว';
                        break;
                    case 'JURISTIC':
                        errorMessage = 'เลขทะเบียนนิติบุคคลนี้ถูกลงทะเบียนแล้ว';
                        break;
                    case 'COMMUNITY_ENTERPRISE':
                        errorMessage = 'เลขทะเบียนวิสาหกิจชุมชนนี้ถูกลงทะเบียนแล้ว';
                        break;
                }
                return res.status(200).json({
                    success: true,
                    available: false,
                    error: errorMessage
                });
            }

            // Identifier is valid and available
            res.status(200).json({
                success: true,
                available: true,
                message: 'หมายเลขนี้สามารถใช้ลงทะเบียนได้'
            });

        } catch (error) {
            console.error('[AuthController] Check Identifier Error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Server Error',
                available: false
            });
        }
    }
}

module.exports = new AuthController();

