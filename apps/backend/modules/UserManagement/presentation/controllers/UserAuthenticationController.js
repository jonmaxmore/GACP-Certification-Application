/**
 * User Authentication Controller
 *
 * RESTful API endpoints for user authentication and management.
 * Implements secure authentication flow with comprehensive error handling.
 *
 * Endpoints:
 * POST   /auth/login           - User authentication
 * POST   /auth/refresh         - Token refresh
 * POST   /auth/logout          - User logout
 * POST   /auth/change-password - Password change
 * GET    /auth/profile         - Get user profile
 * PUT    /auth/profile         - Update user profile
 * POST   /auth/forgot-password - Password reset request
 * POST   /auth/reset-password  - Password reset confirmation
 *
 * Security Features:
 * - Input validation and sanitization
 * - Rate limiting per endpoint
 * - Request/response logging
 * - Error handling with security considerations
 * - Session management
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const { body, validationResult } = require('express-validator');

class UserAuthenticationController {
  constructor(dependencies = {}) {
    this.authService = dependencies.userAuthenticationService;
    this.userRepository = dependencies.userRepository;
    this.auditService = dependencies.auditService;
    this.notificationService = dependencies.notificationService;

    logger.info('[UserAuthenticationController] Initialized successfully');
  }

  /**
   * User login endpoint
   * POST /auth/login
   */
  async login(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Build request context
      const context = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
      };

      // Authenticate user
      const result = await this.authService.authenticateUser(email, password, context);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.requirePasswordChange ? 'PASSWORD_EXPIRED' : 'AUTHENTICATION_FAILED',
          message: result.message,
          requirePasswordChange: result.requirePasswordChange || false,
        });
      }

      // Successful login
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      logger.error('[UserAuthController] Login error:', error);

      // Don't expose internal errors for security
      res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_FAILED',
        message: 'Invalid credentials',
      });
    }
  }

  /**
   * Token refresh endpoint
   * POST /auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        });
      }

      const { refreshToken } = req.body;

      const context = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
      };

      const result = await this.authService.refreshToken(refreshToken, context);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      logger.error('[UserAuthController] Token refresh error:', error);

      res.status(401).json({
        success: false,
        error: 'TOKEN_REFRESH_FAILED',
        message: 'Invalid or expired refresh token',
      });
    }
  }

  /**
   * User logout endpoint
   * POST /auth/logout
   */
  async logout(req, res) {
    try {
      const userId = req.userId;
      const sessionId = req.sessionId;

      const context = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
      };

      await this.authService.logout(userId, sessionId, context);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('[UserAuthController] Logout error:', error);

      res.status(500).json({
        success: false,
        error: 'LOGOUT_ERROR',
        message: 'Error during logout',
      });
    }
  }

  /**
   * Change password endpoint
   * POST /auth/change-password
   */
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      const context = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        sessionId: req.sessionId,
      };

      await this.authService.changePassword(userId, currentPassword, newPassword, context);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('[UserAuthController] Password change error:', error);

      if (error.message.includes('Current password is incorrect')) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect',
        });
      }

      if (error.message.includes('Password validation')) {
        return res.status(400).json({
          success: false,
          error: 'PASSWORD_VALIDATION_ERROR',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'PASSWORD_CHANGE_ERROR',
        message: 'Error changing password',
      });
    }
  }

  /**
   * Get user profile endpoint
   * GET /auth/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.userId;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      // Return user profile without sensitive data
      const profile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profile: user.profile || {},
      };

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user: profile },
      });
    } catch (error) {
      logger.error('[UserAuthController] Get profile error:', error);

      res.status(500).json({
        success: false,
        error: 'PROFILE_FETCH_ERROR',
        message: 'Error retrieving profile',
      });
    }
  }

  /**
   * Update user profile endpoint
   * PUT /auth/profile
   */
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        });
      }

      const userId = req.userId;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.email;
      delete updateData.role;
      delete updateData.passwordHash;
      delete updateData.isActive;

      // Update user profile
      const updatedUser = await this.userRepository.update(userId, updateData);

      // Log profile update
      if (this.auditService) {
        await this.auditService.log({
          type: 'PROFILE_UPDATED',
          userId,
          changes: Object.keys(updateData),
          timestamp: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            profile: updatedUser.profile,
          },
        },
      });
    } catch (error) {
      logger.error('[UserAuthController] Update profile error:', error);

      res.status(500).json({
        success: false,
        error: 'PROFILE_UPDATE_ERROR',
        message: 'Error updating profile',
      });
    }
  }

  /**
   * Forgot password endpoint
   * POST /auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        });
      }

      const { email } = req.body;

      // Find user
      const user = await this.userRepository.findByEmail(email.toLowerCase());

      // Always return success to prevent email enumeration attacks
      const response = {
        success: true,
        message:
          'If an account with this email exists, password reset instructions have been sent.',
      };

      if (user && user.isActive) {
        // Generate password reset token
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save reset token
        await this.userRepository.update(user.id, {
          passwordResetToken: resetToken,
          passwordResetExpiry: resetExpiry,
        });

        // Send reset email
        if (this.notificationService) {
          await this.notificationService.send(user.email, 'PASSWORD_RESET', {
            resetToken,
            resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
            expiryTime: resetExpiry,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
          });
        }

        // Log password reset request
        if (this.auditService) {
          await this.auditService.log({
            type: 'PASSWORD_RESET_REQUESTED',
            userId: user.id,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date(),
          });
        }
      }

      res.status(200).json(response);
    } catch (error) {
      logger.error('[UserAuthController] Forgot password error:', error);

      res.status(500).json({
        success: false,
        error: 'PASSWORD_RESET_ERROR',
        message: 'Error processing password reset request',
      });
    }
  }

  /**
   * Reset password endpoint
   * POST /auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        });
      }

      const { token, newPassword } = req.body;

      // Find user by reset token
      const user = await this.userRepository.findOne({
        passwordResetToken: token,
        passwordResetExpiry: { $gt: new Date() },
        isActive: true,
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_RESET_TOKEN',
          message: 'Invalid or expired reset token',
        });
      }

      // Validate new password (reuse from auth service)
      const passwordValidation = this.authService._validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          error: 'PASSWORD_VALIDATION_ERROR',
          message: passwordValidation.message,
        });
      }

      // Hash new password
      const bcrypt = require('bcrypt');
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await this.userRepository.update(user.id, {
        passwordHash: newPasswordHash,
        passwordUpdatedAt: new Date(),
        passwordResetToken: null,
        passwordResetExpiry: null,
        requirePasswordChange: false,
      });

      // Log password reset
      if (this.auditService) {
        await this.auditService.log({
          type: 'PASSWORD_RESET_COMPLETED',
          userId: user.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date(),
        });
      }

      // Send confirmation email
      if (this.notificationService) {
        await this.notificationService.send(user.email, 'PASSWORD_RESET_CONFIRMED', {
          timestamp: new Date(),
          ip: req.ip,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('[UserAuthController] Reset password error:', error);

      res.status(500).json({
        success: false,
        error: 'PASSWORD_RESET_ERROR',
        message: 'Error resetting password',
      });
    }
  }

  /**
   * Validation rules for different endpoints
   */
  static getValidationRules() {
    return {
      login: [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 1 }).withMessage('Password is required'),
      ],

      refreshToken: [
        body('refreshToken').isLength({ min: 1 }).withMessage('Refresh token is required'),
      ],

      changePassword: [
        body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
        body('newPassword')
          .isLength({ min: 8 })
          .withMessage('New password must be at least 8 characters')
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
          .withMessage(
            'New password must contain uppercase, lowercase, number and special character',
          ),
      ],

      updateProfile: [
        body('firstName')
          .optional()
          .isLength({ min: 1, max: 50 })
          .withMessage('First name must be 1-50 characters'),
        body('lastName')
          .optional()
          .isLength({ min: 1, max: 50 })
          .withMessage('Last name must be 1-50 characters'),
        body('profile.phone')
          .optional()
          .isMobilePhone('th-TH')
          .withMessage('Valid Thai phone number is required'),
        body('profile.address')
          .optional()
          .isLength({ max: 500 })
          .withMessage('Address must not exceed 500 characters'),
      ],

      forgotPassword: [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
      ],

      resetPassword: [
        body('token').isLength({ min: 1 }).withMessage('Reset token is required'),
        body('newPassword')
          .isLength({ min: 8 })
          .withMessage('New password must be at least 8 characters')
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
          .withMessage(
            'New password must contain uppercase, lowercase, number and special character',
          ),
      ],
    };
  }
}

module.exports = UserAuthenticationController;
