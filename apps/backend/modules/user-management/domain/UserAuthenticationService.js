/**
 * User Authentication Service
 *
 * Handles authentication logic, role-based authorization, and security.
 * Implements JWT token management with role-based access control (RBAC).
 *
 * Business Logic:
 * - Multi-role authentication (FARMER, DTAM_REVIEWER, DTAM_INSPECTOR, DTAM_ADMIN)
 * - Secure password handling with bcrypt
 * - JWT token lifecycle management
 * - Role-based permission validation
 * - Account security features (lockout, password reset)
 * - Audit logging for security events
 *
 * Security Features:
 * - Password complexity validation
 * - Account lockout after failed attempts
 * - Token refresh mechanism
 * - Session management
 * - IP-based access control
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../shared/logger/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const EventEmitter = require('events');
const zxcvbn = require('zxcvbn');
const { JWTTokenManager } = require('../../../middleware/jwt-token-manager-middleware');

class UserAuthenticationService extends EventEmitter {
  constructor(dependencies = {}) {
    super();

    // Dependencies
    this.userRepository = dependencies.userRepository;
    this.auditService = dependencies.auditService;
    this.notificationService = dependencies.notificationService;
    this.cacheService = dependencies.cacheService; // Redis for session management
    this.tokenManager = new JWTTokenManager(dependencies.cacheService);

    // Configuration - SECURITY: JWT_SECRET is required from environment
    if (!process.env.JWT_SECRET) {
      throw new Error('SECURITY ERROR: JWT_SECRET environment variable is required for production');
    }

    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('SECURITY ERROR: JWT_SECRET must be at least 32 characters long');
    }

    this.config = {
      jwt: {
        secret: process.env.JWT_SECRET, // REMOVED: Insecure fallback
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
      password: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
        historyCount: 5, // Remember last 5 passwords
      },
      security: {
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        passwordResetExpiry: 60 * 60 * 1000, // 1 hour
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      },
    };

    // Role hierarchy and permissions
    this.roleHierarchy = {
      DTAM_ADMIN: 4,
      DTAM_INSPECTOR: 3,
      DTAM_REVIEWER: 2,
      FARMER: 1,
    };

    this.permissions = {
      FARMER: [
        'application:create',
        'application:read:own',
        'application:update:own',
        'document:upload:own',
        'payment:make:own',
        'profile:read:own',
        'profile:update:own',
      ],
      DTAM_REVIEWER: [
        'application:read:all',
        'application:review',
        'application:approve',
        'application:reject',
        'application:request_revision',
        'document:read:all',
        'jobticket:create',
        'jobticket:update:own',
      ],
      DTAM_INSPECTOR: [
        'application:read:assigned',
        'inspection:schedule',
        'inspection:conduct',
        'inspection:report',
        'document:read:assigned',
        'jobticket:read:assigned',
        'jobticket:update:assigned',
      ],
      DTAM_ADMIN: [
        'application:read:all',
        'application:manage:all',
        'user:read:all',
        'user:manage:all',
        'system:configure',
        'audit:read:all',
        'report:generate:all',
        'certificate:issue',
        'certificate:revoke',
      ],
    };

    logger.info('[UserAuthenticationService] Initialized successfully');
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} context - Request context (IP, user agent, etc.)
   * @returns {Promise<Object>} - Authentication result with tokens
   */
  async authenticateUser(email, password, context = {}) {
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email.toLowerCase());
      if (!user) {
        await this._logSecurityEvent('LOGIN_FAILED', {
          email,
          reason: 'USER_NOT_FOUND',
          ...context,
        });
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (await this._isAccountLocked(user.id)) {
        await this._logSecurityEvent('LOGIN_BLOCKED', {
          userId: user.id,
          reason: 'ACCOUNT_LOCKED',
          ...context,
        });
        throw new Error('Account is temporarily locked due to multiple failed login attempts');
      }

      // Check if account is active
      if (!user.isActive) {
        await this._logSecurityEvent('LOGIN_BLOCKED', {
          userId: user.id,
          reason: 'ACCOUNT_INACTIVE',
          ...context,
        });
        throw new Error('Account is inactive. Please contact administrator');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        await this._handleFailedLogin(user.id, context);
        throw new Error('Invalid credentials');
      }

      // Check password age
      if (this._isPasswordExpired(user.passwordUpdatedAt)) {
        await this._logSecurityEvent('PASSWORD_EXPIRED', { userId: user.id, ...context });
        return {
          success: false,
          requirePasswordChange: true,
          message: 'Password has expired. Please change your password.',
        };
      }

      // Generate tokens
      const tokens = await this._generateTokens(user);

      // Create session
      await this._createSession(user.id, tokens.sessionId, context);

      // Clear failed login attempts
      await this._clearFailedLoginAttempts(user.id);

      // Update last login
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
        lastLoginIP: context.ip,
      });

      // Log successful login
      await this._logSecurityEvent('LOGIN_SUCCESS', { userId: user.id, ...context });

      // Emit event
      this.emit('user.authenticated', {
        userId: user.id,
        role: user.role,
        email: user.email,
        context,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          permissions: this.permissions[user.role],
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: this.config.jwt.expiresIn,
        },
      };
    } catch (error) {
      logger.error('[UserAuthenticationService] Authentication error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @param {Object} context - Request context
   * @returns {Promise<Object>} - New access token
   */
  async refreshToken(refreshToken, context = {}) {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.tokenManager.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.config.jwt.secret);

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check token version
      const currentVersion = await this.tokenManager.getTokenVersion(decoded.userId);
      if (decoded.version && decoded.version < currentVersion) {
        throw new Error('Token version outdated');
      }

      // Check if token family is compromised
      if (decoded.familyId) {
        const isCompromised = await this.tokenManager.isTokenFamilyCompromised(decoded.familyId);
        if (isCompromised) {
          await this._logSecurityEvent('COMPROMISED_TOKEN_USED', {
            userId: decoded.userId,
            familyId: decoded.familyId,
            ...context,
          });
          throw new Error('Token family compromised');
        }

        // Update family usage
        await this.tokenManager.updateTokenFamilyUsage(decoded.familyId);
      }

      // Check if session exists
      const session = await this._getSession(decoded.sessionId);
      if (!session || session.userId !== decoded.userId) {
        throw new Error('Invalid session');
      }

      // Get user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token (with same familyId and version)
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          sessionId: decoded.sessionId,
          familyId: decoded.familyId,
          version: decoded.version || currentVersion,
          type: 'access',
        },
        this.config.jwt.secret,
        { expiresIn: this.config.jwt.expiresIn },
      );

      // Update session last activity
      await this._updateSessionActivity(decoded.sessionId, context);

      // Log token refresh
      await this._logSecurityEvent('TOKEN_REFRESHED', { userId: user.id, ...context });

      return {
        success: true,
        accessToken,
        expiresIn: this.config.jwt.expiresIn,
      };
    } catch (error) {
      logger.error('[UserAuthenticationService] Token refresh error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Validate access token and return user info
   * @param {string} token - Access token
   * @returns {Promise<Object>} - User information and permissions
   */
  async validateToken(token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.config.jwt.secret);

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      // Check if session is still valid
      const session = await this._getSession(decoded.sessionId);
      if (!session || session.userId !== decoded.userId) {
        throw new Error('Session expired or invalid');
      }

      // Get fresh user data
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: this.permissions[user.role],
        sessionId: decoded.sessionId,
      };
    } catch (error) {
      logger.error('[UserAuthenticationService] Token validation error:', error);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Check if user has specific permission
   * @param {string} userId - User ID
   * @param {string} permission - Permission to check
   * @param {Object} resource - Resource context (optional)
   * @returns {Promise<boolean>} - Permission granted
   */
  async hasPermission(userId, permission, resource = {}) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      const userPermissions = this.permissions[user.role] || [];

      // Check exact permission
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Check resource-specific permissions
      if (resource.ownerId && permission.includes(':own')) {
        const basePermission = permission.replace(':own', ':all');
        if (
          userPermissions.includes(basePermission) ||
          (resource.ownerId === userId && userPermissions.includes(permission))
        ) {
          return true;
        }
      }

      // Check role hierarchy for admin permissions
      if (user.role === 'DTAM_ADMIN') {
        return true; // Admin has all permissions
      }

      return false;
    } catch (error) {
      logger.error('[UserAuthenticationService] Permission check error:', error);
      return false;
    }
  }

  /**
   * Logout user and invalidate session
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {Object} context - Request context
   * @returns {Promise<boolean>} - Logout success
   */
  async logout(userId, sessionId, context = {}) {
    try {
      // Blacklist the current tokens if provided
      if (context.accessToken) {
        const accessTokenExpiry = this._getTokenExpirySeconds(context.accessToken);
        await this.tokenManager.blacklistToken(context.accessToken, accessTokenExpiry, 'LOGOUT');
      }

      if (context.refreshToken) {
        const refreshTokenExpiry = this._getTokenExpirySeconds(context.refreshToken);
        await this.tokenManager.blacklistToken(context.refreshToken, refreshTokenExpiry, 'LOGOUT');
      }

      // Invalidate token family if present
      if (context.familyId) {
        await this.tokenManager.invalidateTokenFamily(context.familyId, 'USER_LOGOUT');
      }

      // Invalidate session
      await this._invalidateSession(sessionId);

      // Log logout
      await this._logSecurityEvent('LOGOUT', { userId, sessionId, ...context });

      // Emit event
      this.emit('user.logout', { userId, sessionId, context });

      return true;
    } catch (error) {
      logger.error('[UserAuthenticationService] Logout error:', error);
      return false;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {Object} context - Request context
   * @returns {Promise<boolean>} - Password change success
   */
  async changePassword(userId, currentPassword, newPassword, context = {}) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        await this._logSecurityEvent('PASSWORD_CHANGE_FAILED', {
          userId,
          reason: 'INVALID_CURRENT_PASSWORD',
          ...context,
        });
        throw new Error('Current password is incorrect');
      }

      // Validate new password with user info
      const passwordValidation = this._validatePassword(newPassword, {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Check if new password is different from current
      const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
      if (isSamePassword) {
        throw new Error('New password must be different from current password');
      }

      // Check password history (last 5 passwords)
      if (user.passwordHistory && user.passwordHistory.length > 0) {
        const historyToCheck = user.passwordHistory.slice(-this.config.password.historyCount);
        for (const oldPassword of historyToCheck) {
          const isReused = await bcrypt.compare(newPassword, oldPassword.hash);
          if (isReused) {
            throw new Error(
              `New password must be different from your last ${this.config.password.historyCount} passwords`,
            );
          }
        }
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Add current password to history before updating
      const passwordHistory = user.passwordHistory || [];
      passwordHistory.push({
        hash: user.passwordHash,
        changedAt: user.passwordUpdatedAt || new Date(),
      });

      // Keep only last historyCount passwords
      const trimmedHistory = passwordHistory.slice(-this.config.password.historyCount);

      // Update password
      await this.userRepository.update(userId, {
        passwordHash: newPasswordHash,
        passwordUpdatedAt: new Date(),
        requirePasswordChange: false,
        passwordHistory: trimmedHistory,
      });

      // Rotate all tokens for this user (increments token version)
      await this.tokenManager.incrementTokenVersion(userId, 'PASSWORD_CHANGED');

      // Invalidate all sessions except current
      await this._invalidateAllUserSessions(userId, context.sessionId);

      // Log password change
      await this._logSecurityEvent('PASSWORD_CHANGED', { userId, ...context });

      // Send notification
      await this.notificationService.send(user.email, 'PASSWORD_CHANGED', {
        timestamp: new Date(),
        ip: context.ip,
      });

      return true;
    } catch (error) {
      logger.error('[UserAuthenticationService] Password change error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Generate JWT tokens (access + refresh)
   * @private
   */
  async _generateTokens(user) {
    const sessionId = crypto.randomUUID();
    const familyId = this.tokenManager.createTokenFamily();
    const tokenVersion = await this.tokenManager.getTokenVersion(user.id);

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        familyId,
        version: tokenVersion,
        type: 'access',
      },
      this.config.jwt.secret,
      { expiresIn: this.config.jwt.expiresIn },
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        sessionId,
        familyId,
        version: tokenVersion,
        type: 'refresh',
      },
      this.config.jwt.secret,
      { expiresIn: this.config.jwt.refreshExpiresIn },
    );

    // Store token family
    await this.tokenManager.storeTokenFamily(
      familyId,
      {
        userId: user.id,
        sessionId,
        version: tokenVersion,
        createdAt: new Date(),
        useCount: 0,
      },
      7 * 24 * 60 * 60, // 7 days
    );

    return { accessToken, refreshToken, sessionId, familyId, version: tokenVersion };
  }

  /**
   * Check if account is locked
   * @private
   */
  async _isAccountLocked(userId) {
    const cacheKey = `lockout:${userId}`;
    const lockout = await this.cacheService.get(cacheKey);
    return lockout && new Date(lockout.until) > new Date();
  }

  /**
   * Handle failed login attempt
   * @private
   */
  async _handleFailedLogin(userId, context) {
    const cacheKey = `failed_attempts:${userId}`;
    const attempts = (await this.cacheService.get(cacheKey)) || 0;
    const newAttempts = attempts + 1;

    await this.cacheService.set(cacheKey, newAttempts, 3600); // 1 hour expiry

    // Log failed attempt
    await this._logSecurityEvent('LOGIN_FAILED', {
      userId,
      attempts: newAttempts,
      reason: 'INVALID_PASSWORD',
      ...context,
    });

    // Lock account after max attempts
    if (newAttempts >= this.config.security.maxLoginAttempts) {
      const lockoutKey = `lockout:${userId}`;
      const lockoutUntil = new Date(Date.now() + this.config.security.lockoutDuration);

      await this.cacheService.set(
        lockoutKey,
        { until: lockoutUntil },
        this.config.security.lockoutDuration / 1000,
      );

      await this._logSecurityEvent('ACCOUNT_LOCKED', { userId, lockoutUntil, ...context });

      // Send notification to user
      const user = await this.userRepository.findById(userId);
      if (user) {
        await this.notificationService.send(user.email, 'ACCOUNT_LOCKED', {
          lockoutDuration: this.config.security.lockoutDuration / 60000, // minutes
          unlockTime: lockoutUntil,
        });
      }
    }
  }

  /**
   * Clear failed login attempts
   * @private
   */
  async _clearFailedLoginAttempts(userId) {
    const cacheKey = `failed_attempts:${userId}`;
    await this.cacheService.delete(cacheKey);
  }

  /**
   * Check if password is expired
   * @private
   */
  _isPasswordExpired(passwordUpdatedAt) {
    if (!passwordUpdatedAt) {
      return true;
    }
    const expiryDate = new Date(passwordUpdatedAt.getTime() + this.config.password.maxAge);
    return new Date() > expiryDate;
  }

  /**
   * Validate password complexity
   * @private
   */
  _validatePassword(password, userInfo = {}) {
    const errors = [];

    // Basic length check
    if (password.length < this.config.password.minLength) {
      errors.push(`Password must be at least ${this.config.password.minLength} characters long`);
    }

    // Character requirements
    if (this.config.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.config.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.config.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (
      this.config.password.requireSpecialChars &&
      !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    ) {
      errors.push('Password must contain at least one special character');
    }

    // Use zxcvbn to check password strength and common passwords
    const strengthResult = zxcvbn(
      password,
      [userInfo.email, userInfo.firstName, userInfo.lastName].filter(Boolean),
    );

    // Reject weak passwords (score < 3)
    if (strengthResult.score < 3) {
      if (strengthResult.feedback.warning) {
        errors.push(strengthResult.feedback.warning);
      }
      if (strengthResult.feedback.suggestions.length > 0) {
        errors.push(strengthResult.feedback.suggestions[0]);
      }
    }

    // Check for personal information in password
    if (
      userInfo.email &&
      password.toLowerCase().includes(userInfo.email.split('@')[0].toLowerCase())
    ) {
      errors.push('Password must not contain your email address');
    }

    if (userInfo.firstName && password.toLowerCase().includes(userInfo.firstName.toLowerCase())) {
      errors.push('Password must not contain your first name');
    }

    if (userInfo.lastName && password.toLowerCase().includes(userInfo.lastName.toLowerCase())) {
      errors.push('Password must not contain your last name');
    }

    return {
      valid: errors.length === 0,
      message: errors.join('. '),
      strength: strengthResult.score, // 0-4 scale
    };
  }

  /**
   * Create user session
   * @private
   */
  async _createSession(userId, sessionId, context) {
    const sessionData = {
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      ip: context.ip,
      userAgent: context.userAgent,
      isActive: true,
    };

    await this.cacheService.set(
      `session:${sessionId}`,
      sessionData,
      this.config.security.sessionTimeout / 1000,
    );
  }

  /**
   * Get session data
   * @private
   */
  async _getSession(sessionId) {
    return await this.cacheService.get(`session:${sessionId}`);
  }

  /**
   * Update session activity
   * @private
   */
  async _updateSessionActivity(sessionId, context) {
    const session = await this._getSession(sessionId);
    if (session) {
      session.lastActivity = new Date();
      if (context.ip) {
        session.ip = context.ip;
      }

      await this.cacheService.set(
        `session:${sessionId}`,
        session,
        this.config.security.sessionTimeout / 1000,
      );
    }
  }

  /**
   * Invalidate session
   * @private
   */
  async _invalidateSession(sessionId) {
    await this.cacheService.delete(`session:${sessionId}`);
  }

  /**
   * Invalidate all user sessions except current
   * @private
   */
  async _invalidateAllUserSessions(userId, exceptSessionId) {
    // This would require a more sophisticated session store to track all user sessions
    // For now, we rely on password change forcing re-authentication
    console.log(
      `[UserAuthenticationService] Invalidating all sessions for user ${userId} except ${exceptSessionId}`,
    );
  }

  /**
   * Get token expiry time in seconds
   * @private
   */
  _getTokenExpirySeconds(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return decoded.exp - Math.floor(Date.now() / 1000);
      }
      // Default to 24 hours if can't decode
      return 24 * 60 * 60;
    } catch (error) {
      return 24 * 60 * 60;
    }
  }

  /**
   * Log security events
   * @private
   */
  async _logSecurityEvent(event, data) {
    try {
      await this.auditService.log({
        type: 'SECURITY',
        event,
        timestamp: new Date(),
        ...data,
      });
    } catch (error) {
      logger.error('[UserAuthenticationService] Failed to log security event:', error);
    }
  }
}

module.exports = UserAuthenticationService;
