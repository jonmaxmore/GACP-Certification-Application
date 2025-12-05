/**
 * JWT Service
 * Infrastructure Layer - Clean Architecture
 *
 * Purpose: JWT token generation and validation
 * - Sign JWT tokens
 * - Verify JWT tokens
 * - Token payload management
 */

const jwt = require('jsonwebtoken');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('auth-farmer-token');

class JWTService {
  constructor(secret, expiresIn = '24h', metadata = {}) {
    if (!secret) {
      throw new Error('JWT secret is required');
    }
    this.secret = secret;
    this.expiresIn = expiresIn;
    this.metadata = {
      issuer: metadata?.issuer,
      audience: metadata?.audience,
      algorithm: metadata?.algorithm || 'HS256',
    };
  }

  /**
   * Sign a JWT token
   * @param {Object} payload - Token payload
   * @param {Object} options - JWT options (optional)
   * @returns {string} - Signed JWT token
   */
  sign(payload, options = {}) {
    try {
      const defaultOptions = {
        expiresIn: this.expiresIn,
      };

      if (this.metadata.issuer) {
        defaultOptions.issuer = this.metadata.issuer;
      }

      if (this.metadata.audience) {
        defaultOptions.audience = this.metadata.audience;
      }

      if (this.metadata.algorithm) {
        defaultOptions.algorithm = this.metadata.algorithm;
      }

      const jwtOptions = {
        ...defaultOptions,
        ...options,
      };

      return jwt.sign(payload, this.secret, jwtOptions);
    } catch (error) {
      logger.error('Error signing JWT:', error);
      throw new Error('Failed to sign JWT token');
    }
  }

  /**
   * Verify a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} - Decoded token payload
   * @throws {Error} - If token is invalid or expired
   */
  verify(token) {
    try {
      const verifyOptions = {};

      if (this.metadata.issuer) {
        verifyOptions.issuer = this.metadata.issuer;
      }

      if (this.metadata.audience) {
        verifyOptions.audience = this.metadata.audience;
      }

      if (this.metadata.algorithm) {
        verifyOptions.algorithms = [this.metadata.algorithm];
      }

      return jwt.verify(token, this.secret, verifyOptions);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        logger.error('Error verifying JWT:', error);
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Decode a JWT token without verification
   * @param {string} token - JWT token to decode
   * @returns {Object|null} - Decoded token payload or null
   */
  decode(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Generate a token for user authentication
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateAuthToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'farmer',
      role: user.role || 'farmer',
    };

    return this.sign(payload);
  }

  /**
   * Generate a refresh token
   * @param {Object} user - User object
   * @returns {string} - JWT refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      type: 'refresh',
    };

    return this.sign(payload, { expiresIn: '7d' });
  }

  /**
   * Generate email verification token
   * @param {Object} user - User object
   * @returns {string} - Verification token
   */
  generateVerificationToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'verification',
    };

    return this.sign(payload, { expiresIn: '24h' });
  }

  /**
   * Generate password reset token
   * @param {Object} user - User object
   * @returns {string} - Reset token
   */
  generatePasswordResetToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'password-reset',
    };

    return this.sign(payload, { expiresIn: '1h' });
  }

  /**
   * Verify token type
   * @param {string} token - JWT token
   * @param {string} expectedType - Expected token type
   * @returns {Object} - Decoded token payload
   * @throws {Error} - If token type doesn't match
   */
  verifyTokenType(token, expectedType) {
    const payload = this.verify(token);

    if (payload.type !== expectedType) {
      throw new Error(`Invalid token type. Expected: ${expectedType}, Got: ${payload.type}`);
    }

    return payload;
  }
}

module.exports = JWTService;
