/**
 * Encryption Utility Unit Tests
 */

const { encrypt, decrypt } = require('../../shared/encryption');

describe('🔐 Encryption Utility', () => {
    const testCases = [
        { input: 'ME0123456789', description: 'Standard Laser Code' },
        { input: 'AB9999999999', description: 'Edge Case Laser Code' },
        { input: 'Hello World!', description: 'Generic String' },
        { input: '1234567890123', description: 'ID Card Number' },
    ];

    test.each(testCases)('should encrypt and decrypt $description correctly', ({ input }) => {
        const encrypted = encrypt(input);

        // Encrypted should be different from original
        expect(encrypted).not.toBe(input);

        // Encrypted should contain IV separator
        expect(encrypted).toContain(':');

        // Decrypted should match original
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(input);
    });

    test('should return null/empty for null input', () => {
        expect(encrypt(null)).toBeNull();
        expect(decrypt(null)).toBeNull();
    });

    test('should return original if decrypt receives non-encrypted string', () => {
        const plainText = 'ME0123456789';
        // No colon = not encrypted, decrypt returns original
        expect(decrypt(plainText)).toBe(plainText);
    });

    test('should produce different ciphertexts for same input (random IV)', () => {
        const input = 'ME0123456789';
        const encrypted1 = encrypt(input);
        const encrypted2 = encrypt(input);

        // Different IVs = different ciphertexts
        expect(encrypted1).not.toBe(encrypted2);

        // But both should decrypt to same value
        expect(decrypt(encrypted1)).toBe(input);
        expect(decrypt(encrypted2)).toBe(input);
    });
});
