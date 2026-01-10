/**
 * 🔐 Field-Level Encryption Utility
 * Apple Security Standards - PII Data Protection
 * 
 * Features:
 * - AES-256-GCM encryption for Thai ID and sensitive data
 * - Unique IV per encryption
 * - PDPA compliance ready
 * 
 * Usage:
 * ```
 * const { encrypt, decrypt, maskThaiId } = require('./field-encryption');
 * const encrypted = encrypt('1234567890123');
 * const decrypted = decrypt(encrypted);
 * const masked = maskThaiId('1234567890123'); // 1-xxxx-xxxxx-xx-3
 * ```
 */

const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get encryption key from environment (32 bytes for AES-256)
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!key) {
        console.warn('[FieldEncryption] No ENCRYPTION_KEY set, using fallback');
        return crypto.scryptSync('default-dev-key', 'salt', 32);
    }
    return crypto.scryptSync(key, 'gacp-salt', 32);
};

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @returns {string} Encrypted data in format: iv:authTag:ciphertext (hex)
 */
function encrypt(plaintext) {
    if (!plaintext) {return null;}

    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Format: iv:authTag:ciphertext
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('[FieldEncryption] Encrypt error:', error.message);
        return null;
    }
}

/**
 * Decrypt encrypted data
 * @param {string} encryptedData - Data in format: iv:authTag:ciphertext
 * @returns {string|null} Decrypted plaintext or null if failed
 */
function decrypt(encryptedData) {
    if (!encryptedData) {return null;}

    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }

        const [ivHex, authTagHex, ciphertext] = parts;
        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('[FieldEncryption] Decrypt error:', error.message);
        return null;
    }
}

/**
 * Mask Thai ID for display (PDPA compliant)
 * @param {string} thaiId - 13-digit Thai ID
 * @returns {string} Masked ID: X-XXXX-XXXXX-XX-X
 */
function maskThaiId(thaiId) {
    if (!thaiId || thaiId.length !== 13) {return '***';}

    // Show first and last digit only: 1-xxxx-xxxxx-xx-3
    return `${thaiId[0]}-xxxx-xxxxx-xx-${thaiId[12]}`;
}

/**
 * Mask email for display
 * @param {string} email 
 * @returns {string} Masked email: j***@example.com
 */
function maskEmail(email) {
    if (!email || !email.includes('@')) {return '***';}

    const [local, domain] = email.split('@');
    if (local.length <= 1) {return `*@${domain}`;}

    return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 3))}@${domain}`;
}

/**
 * Mask phone number
 * @param {string} phone 
 * @returns {string} Masked: 08X-XXX-1234
 */
function maskPhone(phone) {
    if (!phone || phone.length < 4) {return '***';}

    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {return `${'*'.repeat(clean.length - 4)}${clean.slice(-4)}`;}

    return `${clean.slice(0, 2)}X-XXX-${clean.slice(-4)}`;
}

/**
 * Hash sensitive data for comparison (one-way)
 * @param {string} data 
 * @returns {string} SHA-256 hash
 */
function hashData(data) {
    return crypto
        .createHash('sha256')
        .update(data + 'gacp-pepper')
        .digest('hex');
}

/**
 * Check if data matches hash
 * @param {string} data - Plain data
 * @param {string} hash - Hash to compare
 * @returns {boolean}
 */
function verifyHash(data, hash) {
    return hashData(data) === hash;
}

/**
 * Encrypt object fields (for bulk encryption)
 * @param {Object} data - Object with fields to encrypt
 * @param {string[]} fields - Field names to encrypt
 * @returns {Object} Object with encrypted fields
 */
function encryptFields(data, fields) {
    const result = { ...data };
    fields.forEach(field => {
        if (result[field]) {
            result[field] = encrypt(result[field]);
        }
    });
    return result;
}

/**
 * Decrypt object fields
 * @param {Object} data - Object with encrypted fields
 * @param {string[]} fields - Field names to decrypt
 * @returns {Object} Object with decrypted fields
 */
function decryptFields(data, fields) {
    const result = { ...data };
    fields.forEach(field => {
        if (result[field]) {
            result[field] = decrypt(result[field]);
        }
    });
    return result;
}

module.exports = {
    encrypt,
    decrypt,
    maskThaiId,
    maskEmail,
    maskPhone,
    hashData,
    verifyHash,
    encryptFields,
    decryptFields,
    ALGORITHM,
};
