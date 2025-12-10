const AuthService = require('../services/AuthService');

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

            res.status(400).json({
                success: false,
                error: error.message
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

            res.status(200).json({
                success: true,
                data: {
                    token: result.token,
                    user: result.user
                }
            });

        } catch (error) {
            console.error('[AuthController] Login Error:', error.message);
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
}

module.exports = new AuthController();
