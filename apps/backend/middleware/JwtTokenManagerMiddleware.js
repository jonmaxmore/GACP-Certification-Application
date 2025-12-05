/**
 * JWT Token Management System
 *
 * Implements token versioning, blacklisting, and automatic rotation
 * for enhanced security and session management.
 *
 * Features:
 * - Token blacklisting (revoked tokens)
 * - Token versioning
 * - Automatic rotation on security events
 * - Family-based token tracking
 * - Replay attack prevention
 *
 * @module middleware/jwt-token-manager
 * @author GACP Platform Team
 * @date 2025-10-26
 */

const crypto = require('crypto');
const logger = require('../shared/logger');

/**
 * JWT Token Manager Class
 */
class JWTTokenManager {
  constructor(cacheService) {
    this.cacheService = cacheService;
    this.BLACKLIST_PREFIX = 'token:blacklist:';
    this.VERSION_PREFIX = 'token:version:';
    this.FAMILY_PREFIX = 'token:family:';
  }

  /**
   * Blacklist a token (revoke it)
   * @param {string} token - JWT token to blacklist
   * @param {number} expiresIn - Time until token expires (seconds)
   * @param {string} reason - Reason for blacklisting
   * @returns {Promise<void>}
   */
  async blacklistToken(token, expiresIn, reason = 'MANUAL_REVOCATION') {
    const tokenHash = this._hashToken(token);
    const key = `${this.BLACKLIST_PREFIX}${tokenHash}`;

    await this.cacheService.set(
      key,
      {
        blacklistedAt: new Date(),
        reason,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
      expiresIn,
    );

    logger.info('[JWTTokenManager] Token blacklisted:', {
      tokenHash: tokenHash.substring(0, 16),
      reason,
      expiresIn,
    });
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token to check
   * @returns {Promise<boolean>}
   */
  async isTokenBlacklisted(token) {
    const tokenHash = this._hashToken(token);
    const key = `${this.BLACKLIST_PREFIX}${tokenHash}`;

    const blacklistEntry = await this.cacheService.get(key);
    return !!blacklistEntry;
  }

  /**
   * Get token version for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getTokenVersion(userId) {
    const key = `${this.VERSION_PREFIX}${userId}`;
    const version = await this.cacheService.get(key);
    return version || 1;
  }

  /**
   * Increment token version (invalidates all existing tokens)
   * @param {string} userId - User ID
   * @param {string} reason - Reason for version increment
   * @returns {Promise<number>} New version number
   */
  async incrementTokenVersion(userId, reason = 'SECURITY_EVENT') {
    const key = `${this.VERSION_PREFIX}${userId}`;
    const currentVersion = await this.getTokenVersion(userId);
    const newVersion = currentVersion + 1;

    // Store version with 90 days expiry (long enough for password max age)
    await this.cacheService.set(key, newVersion, 90 * 24 * 60 * 60);

    logger.warn('[JWTTokenManager] Token version incremented:', {
      userId,
      oldVersion: currentVersion,
      newVersion,
      reason,
    });

    return newVersion;
  }

  /**
   * Create token family ID
   * Used to track token chains (access + refresh tokens)
   * @returns {string} Family ID
   */
  createTokenFamily() {
    return crypto.randomUUID();
  }

  /**
   * Store token family information
   * @param {string} familyId - Token family ID
   * @param {Object} data - Family data
   * @param {number} expiresIn - Expiry time in seconds
   * @returns {Promise<void>}
   */
  async storeTokenFamily(familyId, data, expiresIn) {
    const key = `${this.FAMILY_PREFIX}${familyId}`;

    await this.cacheService.set(
      key,
      {
        ...data,
        createdAt: new Date(),
        lastUsed: new Date(),
      },
      expiresIn,
    );
  }

  /**
   * Get token family information
   * @param {string} familyId - Token family ID
   * @returns {Promise<Object|null>}
   */
  async getTokenFamily(familyId) {
    const key = `${this.FAMILY_PREFIX}${familyId}`;
    return await this.cacheService.get(key);
  }

  /**
   * Update token family last used timestamp
   * @param {string} familyId - Token family ID
   * @returns {Promise<void>}
   */
  async updateTokenFamilyUsage(familyId) {
    const family = await this.getTokenFamily(familyId);

    if (family) {
      family.lastUsed = new Date();
      family.useCount = (family.useCount || 0) + 1;

      const key = `${this.FAMILY_PREFIX}${familyId}`;
      // Re-store with original TTL
      await this.cacheService.set(key, family, 7 * 24 * 60 * 60); // 7 days
    }
  }

  /**
   * Invalidate entire token family (e.g., on suspicious activity)
   * @param {string} familyId - Token family ID
   * @param {string} reason - Reason for invalidation
   * @returns {Promise<void>}
   */
  async invalidateTokenFamily(familyId, reason = 'SUSPICIOUS_ACTIVITY') {
    const family = await this.getTokenFamily(familyId);

    if (family) {
      // Mark family as compromised
      family.compromised = true;
      family.compromisedAt = new Date();
      family.compromisedReason = reason;

      const key = `${this.FAMILY_PREFIX}${familyId}`;
      await this.cacheService.set(key, family, 7 * 24 * 60 * 60);

      logger.warn('[JWTTokenManager] Token family invalidated:', {
        familyId,
        reason,
        userId: family.userId,
      });
    }
  }

  /**
   * Check if token family is compromised
   * @param {string} familyId - Token family ID
   * @returns {Promise<boolean>}
   */
  async isTokenFamilyCompromised(familyId) {
    const family = await this.getTokenFamily(familyId);
    return !!(family && family.compromised);
  }

  /**
   * Rotate token automatically on security events
   * @param {string} userId - User ID
   * @param {string} event - Security event type
   * @returns {Promise<boolean>} Whether rotation was triggered
   */
  async shouldRotateToken(userId, event) {
    const rotationTriggers = [
      'PASSWORD_CHANGED',
      'PASSWORD_RESET',
      'EMAIL_CHANGED',
      'ROLE_CHANGED',
      'SUSPICIOUS_ACTIVITY',
      'ACCOUNT_COMPROMISED',
      'MULTIPLE_FAILED_LOGINS',
    ];

    if (rotationTriggers.includes(event)) {
      await this.incrementTokenVersion(userId, event);
      return true;
    }

    return false;
  }

  /**
   * Clean up expired blacklist entries
   * (Called periodically by background job)
   * @returns {Promise<number>} Number of entries cleaned
   */
  async cleanupBlacklist() {
    // This would require scanning keys in Redis
    // Implementation depends on cache service capabilities
    logger.info('[JWTTokenManager] Blacklist cleanup triggered');
    return 0; // Placeholder
  }

  /**
   * Hash token for storage (to avoid storing actual tokens)
   * @private
   */
  _hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get statistics about token management
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    // This would require aggregating data from cache
    return {
      blacklistedTokens: 0, // Would need to count keys
      activeVersions: 0,
      activeFamilies: 0,
      timestamp: new Date(),
    };
  }
}

/**
 * Express middleware to check token blacklist
 * @param {JWTTokenManager} tokenManager - Token manager instance
 * @returns {Function} Express middleware
 */
function checkTokenBlacklist(tokenManager) {
  return async (req, res, next) => {
    const token = req.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    try {
      const isBlacklisted = await tokenManager.isTokenBlacklisted(token);

      if (isBlacklisted) {
        logger.warn('[JWTTokenManager] Blacklisted token used:', {
          ip: req.ip,
          path: req.path,
        });

        return res.status(401).json({
          success: false,
          error: 'TOKEN_REVOKED',
          message: 'This token has been revoked',
        });
      }

      next();
    } catch (error) {
      logger.error('[JWTTokenManager] Error checking blacklist:', error);
      next(); // Fail open to avoid blocking all requests
    }
  };
}

/**
 * Express middleware to check token version
 * @param {JWTTokenManager} tokenManager - Token manager instance
 * @returns {Function} Express middleware
 */
function checkTokenVersion(tokenManager) {
  return async (req, res, next) => {
    if (!req.user || !req.user.userId) {
      return next();
    }

    try {
      const tokenVersion = req.user.version || 1;
      const currentVersion = await tokenManager.getTokenVersion(req.user.userId);

      if (tokenVersion < currentVersion) {
        logger.warn('[JWTTokenManager] Outdated token version used:', {
          userId: req.user.userId,
          tokenVersion,
          currentVersion,
          ip: req.ip,
        });

        return res.status(401).json({
          success: false,
          error: 'TOKEN_OUTDATED',
          message: 'Please log in again',
        });
      }

      next();
    } catch (error) {
      logger.error('[JWTTokenManager] Error checking token version:', error);
      next(); // Fail open
    }
  };
}

module.exports = {
  JWTTokenManager,
  checkTokenBlacklist,
  checkTokenVersion,
};
