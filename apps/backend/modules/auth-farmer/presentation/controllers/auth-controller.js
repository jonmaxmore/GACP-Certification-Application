const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('auth-farmer-auth');

/**
 * Auth Controller
 * Presentation Layer - Clean Architecture
 *
 * Purpose: HTTP request handlers for farmer authentication
 * - Register new farmer
 * - Login farmer
 * - Verify email
 * - Password reset flow
 * - Profile management
 */

class AuthController {
  constructor({
    registerUserUseCase,
    loginUserUseCase,
    verifyEmailUseCase,
    requestPasswordResetUseCase,
    resetPasswordUseCase,
    getUserProfileUseCase,
    updateUserProfileUseCase,
  }) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.verifyEmailUseCase = verifyEmailUseCase;
    this.requestPasswordResetUseCase = requestPasswordResetUseCase;
    this.resetPasswordUseCase = resetPasswordUseCase;
    this.getUserProfileUseCase = getUserProfileUseCase;
    this.updateUserProfileUseCase = updateUserProfileUseCase;
  }

  /**
   * Register new farmer
   * POST /api/auth/farmer/register
   */
  async register(req, res) {
    try {
      console.log('Register Request Body:', JSON.stringify(req.body, null, 2));
      console.log('Register Request File:', req.file);

      const result = await this.registerUserUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        idCard: req.body.idCard,
        idCardImage: req.file ? req.file.path : null,
        laserCode: req.body.laserCode,
        address: req.body.address,
        province: req.body.province,
        district: req.body.district,
        subdistrict: req.body.subDistrict,
        zipCode: req.body.postalCode || req.body.zipCode,
        metadata: req.body.metadata,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            status: result.user.status,
            isEmailVerified: result.user.isEmailVerified,
          },
        },
        verificationToken: result.verificationToken,
      });
    } catch (error) {
      console.error('FULL ERROR:', error);
      logger.error('Registration error:', error);

      if (
        error.message.includes('already exists') ||
        error.message.includes('already registered')
      ) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.',
      });
    }
  }

  /**
   * Login farmer
   * POST /api/auth/farmer/login
   */
  async login(req, res) {
    try {
      const result = await this.loginUserUseCase.execute({
        email: req.body.email,
        password: req.body.password,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token: result.token,
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            status: result.user.status,
            role: result.user.role,
          },
        },
      });
    } catch (error) {
      logger.error('Login error:', error);

      if (
        error.message.includes('Invalid email or password') ||
        error.message.includes('Invalid credentials')
      ) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      if (error.message.includes('locked')) {
        return res.status(403).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes('verify your email')) {
        return res.status(403).json({
          success: false,
          error: 'Please verify your email before logging in',
        });
      }

      if (error.message.includes('suspended') || error.message.includes('inactive')) {
        return res.status(403).json({
          success: false,
          error: 'Your account is not active. Please contact support.',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.',
      });
    }
  }

  /**
   * Verify email
   * GET /api/auth/farmer/verify-email/:token
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const result = await this.verifyEmailUseCase.execute({ token });

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          userId: result.user.id,
          email: result.user.email,
        },
      });
    } catch (error) {
      logger.error('Email verification error:', error);

      if (error.message.includes('not found') || error.message.includes('Invalid')) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or expired verification token',
        });
      }

      if (error.message.includes('already verified')) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Email verification failed. Please try again.',
      });
    }
  }

  /**
   * Request password reset
   * POST /api/auth/farmer/request-password-reset
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      await this.requestPasswordResetUseCase.execute({ email });

      // Always return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Password reset request error:', error);

      // Always return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }
  }

  /**
   * Reset password
   * POST /api/auth/farmer/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      await this.resetPasswordUseCase.execute({
        token,
        newPassword,
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      });
    } catch (error) {
      logger.error('Password reset error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('Invalid') ||
        error.message.includes('expired')
      ) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }

      if (error.message.includes('weak') || error.message.includes('requirements')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Password reset failed. Please try again.',
      });
    }
  }

  /**
   * Get user profile
   * GET /api/auth/farmer/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware

      const user = await this.getUserProfileUseCase.execute({ userId });

      return res.status(200).json({
        ...user,
        success: true,
      });
    } catch (error) {
      logger.error('Get profile error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/farmer/profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId; // From auth middleware

      const user = await this.updateUserProfileUseCase.execute({
        userId,
        profileData: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          farmName: req.body.farmName,
          farmSize: req.body.farmSize,
          farmingExperience: req.body.farmingExperience,
          province: req.body.province,
          district: req.body.district,
          subdistrict: req.body.subDistrict,
          zipCode: req.body.postalCode || req.body.zipCode,
          address: req.body.address,
        },
      });

      return res.status(200).json({
        ...user,
        success: true,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      logger.error('Update profile error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (error.message.includes('not active')) {
        return res.status(403).json({
          success: false,
          message: 'Cannot update profile. Account is not active.',
        });
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Profile update failed. Please try again.',
      });
    }
  }
}

module.exports = AuthController;
