/**
 * Token Rotation Service
 * Per Apple Audit: Token refresh with rotation for security
 *
 * Features:
 * - Short-lived access tokens (1 hour)
 * - Long-lived refresh tokens (7 days)
 * - Token rotation on refresh (new refresh token each time)
 * - Automatic session invalidation on token compromise
 *
 * @version 1.0.0
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configuration
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'refresh-secret';

// In-memory refresh token store (in production, use Redis/database)
const refreshTokenStore = new Map();

/**
 * Generate access token and refresh token pair
 * @param {Object} user - User object with id, role, email
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
function generateTokenPair(user) {
    const payload = {
        id: user.id || user.uuid,
        role: user.role,
        email: user.email,
        type: 'access',
    };

    // Short-lived access token
    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        issuer: 'gacp-backend',
        audience: 'gacp-users',
    });

    // Long-lived refresh token with unique ID
    const refreshTokenId = crypto.randomUUID();
    const refreshPayload = {
        id: user.id || user.uuid,
        tokenId: refreshTokenId,
        type: 'refresh',
    };

    const refreshToken = jwt.sign(refreshPayload, REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        issuer: 'gacp-backend',
        audience: 'gacp-refresh',
    });

    // Store refresh token metadata
    refreshTokenStore.set(refreshTokenId, {
        userId: user.id || user.uuid,
        createdAt: Date.now(),
        rotatedAt: null,
        valid: true,
    });

    return {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY,
        tokenType: 'Bearer',
    };
}

/**
 * Refresh access token with rotation
 * @param {string} refreshToken - Current refresh token
 * @returns {Object} { accessToken, refreshToken, expiresIn } or throws error
 */
async function refreshAccessToken(refreshToken) {
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        // Check if token is in store and valid
        const tokenMeta = refreshTokenStore.get(decoded.tokenId);
        if (!tokenMeta || !tokenMeta.valid) {
            // Token reuse detected - possible token theft
            // Invalidate all tokens for this user
            invalidateUserTokens(decoded.id);
            throw new Error('Token has been revoked - please login again');
        }

        // Invalidate old refresh token (rotation)
        tokenMeta.valid = false;
        tokenMeta.rotatedAt = Date.now();
        refreshTokenStore.set(decoded.tokenId, tokenMeta);

        // Generate new token pair
        const user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        };

        // Need to fetch fresh user data from database in production
        return generateTokenPair(user);

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token expired - please login again');
        }
        throw error;
    }
}

/**
 * Invalidate all refresh tokens for a user
 * @param {string} userId
 */
function invalidateUserTokens(userId) {
    for (const [tokenId, meta] of refreshTokenStore.entries()) {
        if (meta.userId === userId) {
            meta.valid = false;
            refreshTokenStore.set(tokenId, meta);
        }
    }
}

/**
 * Invalidate specific refresh token (logout)
 * @param {string} refreshToken
 */
function revokeRefreshToken(refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET, {
            ignoreExpiration: true,
        });

        const tokenMeta = refreshTokenStore.get(decoded.tokenId);
        if (tokenMeta) {
            tokenMeta.valid = false;
            refreshTokenStore.set(decoded.tokenId, tokenMeta);
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Cleanup expired tokens
 */
function cleanupExpiredTokens() {
    const now = Date.now();
    const maxAge = 8 * 24 * 60 * 60 * 1000; // 8 days

    for (const [tokenId, meta] of refreshTokenStore.entries()) {
        if (now - meta.createdAt > maxAge) {
            refreshTokenStore.delete(tokenId);
        }
    }
}

// Run cleanup periodically
setInterval(cleanupExpiredTokens, 60 * 60 * 1000); // Every hour

module.exports = {
    generateTokenPair,
    refreshAccessToken,
    invalidateUserTokens,
    revokeRefreshToken,
    cleanupExpiredTokens,
    // For testing
    _refreshTokenStore: refreshTokenStore,
};
