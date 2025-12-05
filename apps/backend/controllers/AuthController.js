const AuthService = require('../services/AuthService');

class AuthController {
    async register(req, res) {
        try {
            const result = await AuthService.register({
                ...req.body,
                idCardImage: req.file ? req.file.path : null
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully. Please verify your email.',
                data: {
                    user: {
                        id: result.user._id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        status: result.user.status,
                        isEmailVerified: result.user.isEmailVerified,
                    }
                },
                verificationToken: result.verificationToken
            });
        } catch (error) {
            console.error('Registration Error:', error);
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
                message: 'Login successful',
                data: {
                    token: result.token,
                    user: {
                        id: result.user._id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        status: result.user.status,
                        role: result.user.role,
                    }
                }
            });
        } catch (error) {
            console.error('Login Error:', error);
            const status = error.message === 'Invalid email or password' ? 401 : 400;
            res.status(status).json({
                success: false,
                error: error.message
            });
        }
    }

    async verifyEmail(req, res) {
        try {
            const { token } = req.params;
            const user = await AuthService.verifyEmail(token);

            res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                data: {
                    userId: user._id,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Verify Email Error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();
