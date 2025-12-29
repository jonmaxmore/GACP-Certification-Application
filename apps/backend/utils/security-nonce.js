/**
 * Security Nonce Utility
 * Per Apple Audit: Required for preventing CSRF/Replay Attacks
 *
 * @version 1.0.0
 */

const crypto = require('crypto');

// In-memory nonce storage (in production, use Redis)
const nonceStore = new Map();
const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a cryptographically secure nonce
 * @returns {string} UUID-based nonce
 */
function generateNonce() {
    const nonce = crypto.randomUUID();
    const timestamp = Date.now();

    // Store with expiry
    nonceStore.set(nonce, { timestamp, used: false });

    // Cleanup expired nonces periodically
    cleanupExpiredNonces();

    return nonce;
}

/**
 * Verify a nonce is valid and unused
 * @param {string} nonce - The nonce to verify
 * @returns {boolean} True if valid
 */
function verifyNonce(nonce) {
    const entry = nonceStore.get(nonce);

    if (!entry) {
        return false;
    }

    const isExpired = Date.now() - entry.timestamp > NONCE_EXPIRY_MS;
    const isUsed = entry.used;

    if (isExpired || isUsed) {
        nonceStore.delete(nonce);
        return false;
    }

    // Mark as used (one-time use)
    entry.used = true;
    nonceStore.set(nonce, entry);

    return true;
}

/**
 * Consume a nonce (verify and delete)
 * @param {string} nonce
 * @returns {boolean}
 */
function consumeNonce(nonce) {
    const isValid = verifyNonce(nonce);
    if (isValid) {
        nonceStore.delete(nonce);
    }
    return isValid;
}

/**
 * Cleanup expired nonces
 */
function cleanupExpiredNonces() {
    const now = Date.now();
    for (const [nonce, entry] of nonceStore.entries()) {
        if (now - entry.timestamp > NONCE_EXPIRY_MS) {
            nonceStore.delete(nonce);
        }
    }
}

/**
 * Generate state for OAuth (contains nonce + redirect info)
 * @param {string} redirectUri
 * @returns {Object} { state, nonce }
 */
function generateOAuthState(redirectUri = '/') {
    const nonce = generateNonce();
    const state = Buffer.from(JSON.stringify({
        nonce,
        redirectUri,
        timestamp: Date.now(),
    })).toString('base64url');

    return { state, nonce };
}

/**
 * Verify OAuth state
 * @param {string} state
 * @returns {Object|null} Parsed state or null if invalid
 */
function verifyOAuthState(state) {
    try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());

        if (!decoded.nonce || !consumeNonce(decoded.nonce)) {
            return null;
        }

        // Check timestamp (5 min max)
        if (Date.now() - decoded.timestamp > NONCE_EXPIRY_MS) {
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
}

/**
 * PKCE Code Verifier and Challenge Generator
 * Per Apple requirements for secure OAuth
 */
function generatePKCE() {
    // Generate code verifier (43-128 characters)
    const codeVerifier = crypto.randomBytes(32).toString('base64url');

    // Generate code challenge (SHA256 of verifier)
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256',
    };
}

/**
 * Verify PKCE code
 * @param {string} codeVerifier
 * @param {string} codeChallenge
 * @returns {boolean}
 */
function verifyPKCE(codeVerifier, codeChallenge) {
    const expectedChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

    return expectedChallenge === codeChallenge;
}

module.exports = {
    generateNonce,
    verifyNonce,
    consumeNonce,
    generateOAuthState,
    verifyOAuthState,
    generatePKCE,
    verifyPKCE,
    // For testing
    _nonceStore: nonceStore,
};
