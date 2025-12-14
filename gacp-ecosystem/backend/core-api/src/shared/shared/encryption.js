/**
 * Encryption Utilities
 * Uses AES-256-CBC for reversible encryption
 * Uses SHA-256 for deterministic hashing (for lookups)
 */

const crypto = require('crypto');
const logger = require('./logger');

const ALGORITHM = 'aes-256-cbc';
// ENCRYPTION_KEY must be 32 bytes (256 bits)
// In detailed implementation, derive this from a secret using PBKDF2
const SECRET = process.env.ENCRYPTION_KEY || 'default_secr_32_bytes_key_123456';
// Ensure secret is 32 chars if using raw string, or hash it to get 32 bytes
const KEY = crypto.createHash('sha256').update(String(SECRET)).digest();

/**
 * Encrypt text (reversible)
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format iv:encryptedData
 */
function encrypt(text) {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        logger.error('Encryption error:', error);
        throw error;
    }
}

/**
 * Decrypt text
 * @param {string} text - Encrypted text in format iv:encryptedData
 * @returns {string} Decrypted text
 */
function decrypt(text) {
    if (!text) return text;
    // Check if text format is valid (iv:content)
    const parts = text.split(':');
    if (parts.length !== 2) {
        // Return custom or throw? For now assume it might be plain text during migration
        return text;
    }

    try {
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        logger.error('Decryption error:', error);
        // If decryption fails (e.g. wrong key/iv), return original text or error
        return text;
    }
}

/**
 * Hash text (deterministic, non-reversible)
 * Used for duplicate detection where we need to compare without decryption
 * @param {string} text - Text to hash
 * @returns {string} SHA-256 hash of the text
 */
function hash(text) {
    if (!text) return null;
    return crypto.createHash('sha256').update(String(text)).digest('hex');
}

module.exports = {
    encrypt,
    decrypt,
    hash,
};

