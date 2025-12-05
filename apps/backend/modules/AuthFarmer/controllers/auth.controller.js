const { createLogger } = require('../../../shared/logger');
const logger = createLogger('auth-farmer-auth');
const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
} = require('../../../shared/errors');

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
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async register(req, res) {
    try {
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
      this._handleError(res, error, 'Registration error');
    }
  }

  /**
   * Login farmer
   * POST /api/auth/farmer/login
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
      this._handleError(res, error, 'Login error');
    }
  }

  /**
   * Verify email
   * GET /api/auth/farmer/verify-email/:token
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
      this._handleError(res, error, 'Email verification error');
    }
  }

  /**
   * Request password reset
   * POST /api/auth/farmer/request-password-reset
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
      this._handleError(res, error, 'Password reset error');
    }
  }

  /**
   * Get user profile
   * GET /api/auth/farmer/profile
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
      this._handleError(res, error, 'Get profile error');
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/farmer/profile
   * @param {import('express').Request} req
   * @param {import('express').Response} res
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
      this._handleError(res, error, 'Update profile error');
    }
  }

  /**
   * Standardized error handler
   * @private
   * @param {import('express').Response} res
   * @param {Error} error
   * @param {string} contextMessage
   */
  _handleError(res, error, contextMessage) {
    logger.error(`${contextMessage}:`, error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details,
      });
    }

    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof AuthorizationError) {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof ConflictError || error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    // Fallback for generic errors
    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
}

module.exports = AuthController;
