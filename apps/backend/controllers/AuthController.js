const AuthService = require('../services/AuthService');

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

            const user = await AuthService.register(userData);

            res.status(201).json({
                success: true,
                message: 'Registration Successful',
                data: { user }
            });

        } catch (error) {
            console.error('[AuthController] Register Error:', error.message);
            // Log stack trace only if strictly needed, keeping logs clean for now
            // console.error(error.stack);

            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);

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
