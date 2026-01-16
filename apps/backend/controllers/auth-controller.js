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
                idCardImage, // Add image path to body
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
                if (req.file && req.file.path) { fs.unlink(req.file.path, () => { }); }
                return res.status(400).json({
                    success: false,
                    error: errorMessage,
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
                { accountType },
            );

            res.status(201).json({
                success: true,
                message: 'ลงทะเบียนสำเร็จ',
                data: { user },
            });

        } catch (error) {
            console.error('[AuthController] Register Error:', error.message);

            // Cleanup Orphan File
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) { console.error('[AuthController] Cleanup Failed:', err.message); }
                });
            }

            // Handle Prisma duplicate key error (P2002)
            let errorMessage = error.message;
            let statusCode = 500;
            
            if (error.code === 'P2002') {
                const target = error.meta?.target || [];
                const targetField = Array.isArray(target) ? target[0] : target;
                statusCode = 400;

                console.log('[AuthController] Duplicate Key Target:', targetField);

                if (targetField === 'idCardHash' || targetField.includes('idCardHash')) {
                    errorMessage = 'เลขบัตรประชาชนนี้ถูกลงทะเบียนแล้ว กรุณาตรวจสอบข้อมูลหรือติดต่อผู้ดูแลระบบ';
                } else if (targetField === 'taxIdHash' || targetField.includes('taxIdHash')) {
                    errorMessage = 'เลขทะเบียนนิติบุคคลนี้ถูกลงทะเบียนแล้ว กรุณาตรวจสอบข้อมูลหรือติดต่อผู้ดูแลระบบ';
                } else if (targetField === 'communityRegistrationNoHash' || targetField.includes('communityRegistrationNoHash')) {
                    errorMessage = 'เลขทะเบียนวิสาหกิจชุมชนนี้ถูกลงทะเบียนแล้ว กรุณาตรวจสอบข้อมูลหรือติดต่อผู้ดูแลระบบ';
                } else if (targetField === 'phoneNumber' || targetField.includes('phoneNumber')) {
                    errorMessage = 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว กรุณาใช้เบอร์อื่นหรือติดต่อผู้ดูแลระบบ';
                } else if (targetField === 'email' || targetField.includes('email')) {
                    errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือติดต่อผู้ดูแลระบบ';
                } else {
                    errorMessage = 'ข้อมูลนี้ถูกลงทะเบียนในระบบแล้ว กรุณาตรวจสอบข้อมูลหรือติดต่อผู้ดูแลระบบ';
                }
            } else if (error.message.includes('Invalid file format')) {
                statusCode = 400;
                errorMessage = 'รูปแบบไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์รูปภาพ (JPG, PNG) ที่มีขนาดไม่เกิน 5MB';
            } else if (error.message.includes('File too large')) {
                statusCode = 400;
                errorMessage = 'ไฟล์มีขนาดใหญ่เกินไป กรุณาอัปโหลดไฟล์ที่มีขนาดไม่เกิน 5MB';
            } else if (error.message.includes('Database connection')) {
                errorMessage = 'เซิร์ฟเวอร์มีปัญหาในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่ในภายหลัง';
            } else if (error.message.includes('Network')) {
                errorMessage = 'เครือข่ายมีปัญหา กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่';
            } else {
                errorMessage = 'การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง หากยังไม่สำเร็จกรุณาติดต่อผู้ดูแลระบบ';
            }

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                requestId: req.id || 'unknown'
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
                    error: 'Identifier and password are required',
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
                        refreshToken: result.refreshToken,
                    },
                    user: result.user,
                },
            });

            // 🔒 ISO 27799: Log successful authentication
            await auditLogger.logAuth(
                'LOGIN_SUCCESS',
                result.user.id,
                result.user.role,
                'SUCCESS',
                req.ip || req.connection?.remoteAddress,
                req.headers['user-agent'],
                { accountType, identifier: loginId?.substring(0, 4) + '****' },
            );

        } catch (error) {
            console.error('[AuthController] Login Error:', error.message);

            // Audit Log (Failed Login - System Error or Auth Failure)
            // Wrapped in try-catch to prevent crash if audit logging fails
            try {
                await auditLogger.logAuth(
                    'LOGIN_FAILURE',
                    'ANONYMOUS',
                    'GUEST',
                    'FAILURE',
                    req.ip || req.connection?.remoteAddress,
                    req.headers['user-agent'],
                    { error: error.message, identifier: req.body.identifier || req.body.email },
                );
            } catch (auditError) {
                console.error('[AuthController] Audit Log Error:', auditError.message);
            }

            // Enhanced error messages
            let errorMessage = 'ระบบเกิดข้อผิดพลาด กรุณาลองใหม่';
            let statusCode = 500;

            if (error.message === 'ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง' ||
                error.message === 'บัญชีถูกระงับการใช้งาน' ||
                error.message === 'Identifier and password are required' ||
                error.message === 'Invalid credentials') {
                statusCode = 401;
                errorMessage = 'ไม่พบผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูลและลองใหม่';
            } else if (error.message.includes('Account locked')) {
                statusCode = 423;
                errorMessage = 'บัญชีถูกระงับการใช้งานชั่วคราว เนื่องจากพยายามเข้าสู่ระบบหลายครั้ง กรุณารอ 15 นาทีแล้วลองใหม่';
            } else if (error.message.includes('Database connection')) {
                errorMessage = 'เซิร์ฟเวอร์มีปัญหาในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่ในภายหลัง';
            } else if (error.message.includes('Network')) {
                errorMessage = 'เครือข่ายมีปัญหา กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่';
            } else if (error.message.includes('Rate limit')) {
                statusCode = 429;
                errorMessage = 'คุณพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่';
            } else if (error.message.includes('Service unavailable')) {
                statusCode = 503;
                errorMessage = 'บริการชั่วคราวไม่สามารถใช้งานได้ กรุณาลองใหม่ในภายหลัง';
            }

            res.status(statusCode).json({
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                requestId: req.id || 'unknown'
            });
        }
    }

    async getMe(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'ไม่ได้รับอนุญาตให้เข้าใช้งาน กรุณาเข้าสู่ระบบใหม่',
                    code: 'UNAUTHORIZED'
                });
            }
            const user = await AuthService.getProfile(req.user.id);
            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            console.error('[AuthController] Get Profile Error:', error.message);
            let errorMessage = 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้ กรุณาลองใหม่';
            let statusCode = 500;
            
            if (error.message.includes('User not found')) {
                statusCode = 404;
                errorMessage = 'ไม่พบข้อมูลผู้ใช้งานนี้ในระบบ';
            } else if (error.message.includes('Database connection')) {
                errorMessage = 'เซิร์ฟเวอร์มีปัญหาในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่ในภายหลัง';
            } else if (error.message.includes('Token expired')) {
                statusCode = 401;
                errorMessage = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
            }
            
            res.status(statusCode).json({ 
                success: false, 
                error: errorMessage,
                timestamp: new Date().toISOString(),
                requestId: req.id || 'unknown'
            });
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
                    available: false,
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
                        available: false,
                    });
                }
                if (!/^\d+$/.test(cleanId)) {
                    return res.status(400).json({
                        success: false,
                        error: 'ต้องเป็นตัวเลขเท่านั้น',
                        available: false,
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
                    error: errorMessage,
                });
            }

            // Identifier is valid and available
            res.status(200).json({
                success: true,
                available: true,
                message: 'หมายเลขนี้สามารถใช้ลงทะเบียนได้',
            });

        } catch (error) {
            console.error('[AuthController] Check Identifier Error:', error.message);
            let errorMessage = 'เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่';
            let statusCode = 500;
            
            if (error.message.includes('Database connection')) {
                errorMessage = 'เซิร์ฟเวอร์มีปัญหาในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่ในภายหลัง';
            } else if (error.message.includes('Network')) {
                errorMessage = 'เครือข่ายมีปัญหา กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่';
            } else if (error.message.includes('Rate limit')) {
                statusCode = 429;
                errorMessage = 'คุณตรวจสอบข้อมูลหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่';
            }
            
            res.status(statusCode).json({
                success: false,
                error: errorMessage,
                available: false,
                timestamp: new Date().toISOString(),
                requestId: req.id || 'unknown'
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const data = req.body;

            // Allow updating valid fields
            const updateData = {};
            if (data.firstName) { updateData.firstName = data.firstName; }
            if (data.lastName) { updateData.lastName = data.lastName; }
            if (data.phoneNumber) { updateData.phoneNumber = data.phoneNumber; }

            const user = await AuthService.updateProfile(userId, updateData);

            res.json({ 
                success: true, 
                data: user,
                message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ'
            });
        } catch (error) {
            console.error('[AuthController] Update Profile Error:', error.message);
            let errorMessage = 'ไม่สามารถอัปเดตข้อมูลส่วนตัวได้ กรุณาลองใหม่';
            let statusCode = 500;
            
            if (error.message.includes('User not found')) {
                statusCode = 404;
                errorMessage = 'ไม่พบข้อมูลผู้ใช้งานนี้ในระบบ';
            } else if (error.message.includes('Database connection')) {
                errorMessage = 'เซิร์ฟเวอร์มีปัญหาในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่ในภายหลัง';
            } else if (error.message.includes('Invalid phone number')) {
                statusCode = 400;
                errorMessage = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกเบอร์โทรศัพท์ 10 หลัก';
            } else if (error.message.includes('Unauthorized')) {
                statusCode = 401;
                errorMessage = 'ไม่ได้รับอนุญาตให้แก้ไขข้อมูลนี้ กรุณาเข้าสู่ระบบใหม่';
            }
            
            res.status(statusCode).json({ 
                success: false, 
                error: errorMessage,
                timestamp: new Date().toISOString(),
                requestId: req.id || 'unknown'
            });
        }
    }
}

module.exports = new AuthController();

