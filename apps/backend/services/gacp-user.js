/**
 * GACPUserService
 * Business logic for user management and authentication
 *
 * @module services/gacp-user
 */

const logger = require('../shared/logger');
const UserRepository = require('../repositories/UserRepository');
const EmailService = require('./email/EmailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class GACPUserService {
  constructor() {
    this.repository = new UserRepository();
    this.emailService = new EmailService();
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and tokens
   */
  async registerUser(userData) {
    try {
      const { email, nationalId } = userData;

      // Check if user already exists
      const existingUser = await this.repository.model.findOne({
        $or: [{ email: email.toLowerCase() }, { nationalId }],
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const user = await this.repository.create({
        ...userData,
        email: email.toLowerCase(),
        registrationSource: 'web',
      });

      // Generate verification token
      user.generateEmailVerificationToken();
      await this.repository.save(user);

      // Generate tokens
      const accessToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info('User registered', {
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        user: user.toPublicProfile(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '24h',
        },
      };
    } catch (error) {
      logger.error('[GACPUserService] registerUser error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember me flag
   * @param {Object} requestInfo - IP and User-Agent info
   * @returns {Promise<Object>} User and tokens
   */
  async login(email, password, rememberMe, requestInfo) {
    try {
      const user = await this.repository.findByEmailWithPassword(email);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.isLocked) {
        throw new Error('Account locked');
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        throw new Error('Invalid credentials');
      }

      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update login history
      await this.repository.updateLoginHistory(user._id, {
        timestamp: new Date(),
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        location: requestInfo.location,
      });

      const accessToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);
      const expiresIn = rememberMe ? '7d' : '24h';

      return {
        user: user.toPublicProfile(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn,
        },
      };
    } catch (error) {
      logger.error('[GACPUserService] login error:', error);
      throw error;
    }
  }

  /**
   * Authenticate DTAM staff
   * @param {string} identifier - Username or Email
   * @param {string} password - Password
   * @param {Object} requestInfo - IP and User-Agent info
   * @returns {Promise<Object>} User and tokens
   */
  async loginDtam(identifier, password, requestInfo) {
    try {
      const user = await this.repository.findByUsernameOrEmail(identifier);

      if (!user || !['admin', 'officer', 'auditor'].includes(user.role)) {
        throw new Error('Invalid credentials or unauthorized');
      }

      if (user.isLocked) {
        throw new Error('Account locked');
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        throw new Error('Invalid credentials');
      }

      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      await this.repository.updateLoginHistory(user._id, {
        timestamp: new Date(),
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        location: requestInfo.location,
      });

      const accessToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: user.toPublicProfile(),
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '24h',
        },
      };
    } catch (error) {
      logger.error('[GACPUserService] loginDtam error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'default-refresh-secret'
      );

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await this.repository.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const accessToken = this.generateToken(user);

      return {
        accessToken,
        expiresIn: '24h',
      };
    } catch (error) {
      logger.error('[GACPUserService] refreshToken error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        user: user.toPublicProfile(),
        permissions: user.permissions,
        profileCompleteness: user.profileCompleteness,
      };
    } catch (error) {
      logger.error('[GACPUserService] getProfile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Filter allowed fields
      const allowedFields = ['fullName', 'phone', 'notifications', 'farmingExperience', 'expertise'];
      const filteredData = {};

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      // Handle role-specific logic
      if (user.role === 'auditor' && updateData.expertise) {
        filteredData.expertise = { ...user.expertise, ...updateData.expertise };
      }

      const updatedUser = await this.repository.update(userId, filteredData);

      return {
        user: updatedUser.toPublicProfile(),
      };
    } catch (error) {
      logger.error('[GACPUserService] updateProfile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.repository.findByIdWithPassword(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        throw new Error('Invalid current password');
      }

      user.password = newPassword;
      await this.repository.save(user);
    } catch (error) {
      logger.error('[GACPUserService] changePassword error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async requestPasswordReset(email) {
    try {
      const user = await this.repository.findByEmail(email);
      if (user) {
        const resetToken = user.generatePasswordResetToken();
        await this.repository.save(user);

        // Send password reset email
        try {
          await this.emailService.sendPasswordResetEmail(user, resetToken);
          logger.info('[GACPUserService] Password reset email sent', { email: user.email });
        } catch (emailError) {
          logger.error('[GACPUserService] Failed to send password reset email:', emailError);
          // Don't throw - we still want to allow password reset even if email fails
        }
      }
      // Always return success (security: don't reveal if email exists)
    } catch (error) {
      logger.error('[GACPUserService] requestPasswordReset error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await this.repository.findByToken(hashedToken, 'password');

      if (!user) {
        throw new Error('Invalid or expired token');
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = undefined;
      user.lockUntil = undefined;

      await this.repository.save(user);
    } catch (error) {
      logger.error('[GACPUserService] resetPassword error:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   * @param {string} token - Verification token
   * @returns {Promise<void>}
   */
  async verifyEmail(token) {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await this.repository.findByToken(hashedToken, 'email');

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await this.repository.save(user);
    } catch (error) {
      logger.error('[GACPUserService] verifyEmail error:', error);
      throw error;
    }
  }

  /**
   * Resend verification email
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async resendVerification(userId) {
    try {
      const user = await this.repository.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      const verificationToken = user.generateEmailVerificationToken();
      await this.repository.save(user);

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(user, verificationToken);
        logger.info('[GACPUserService] Verification email sent', { userId: user._id, email: user.email });
      } catch (emailError) {
        logger.error('[GACPUserService] Failed to send verification email:', emailError);
        throw new Error('Failed to send verification email. Please try again later.');
      }
    } catch (error) {
      logger.error('[GACPUserService] resendVerification error:', error);
      throw error;
    }
  }

  // Helper methods
  generateToken(user) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured');
    }
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'gacp-platform',
        audience: 'gacp-users',
      }
    );
  }

  generateRefreshToken(user) {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    return jwt.sign(
      {
        userId: user._id,
        type: 'refresh',
      },
      secret,
      {
        expiresIn: '7d',
        issuer: 'gacp-platform',
      }
    );
  }
}

module.exports = GACPUserService;
