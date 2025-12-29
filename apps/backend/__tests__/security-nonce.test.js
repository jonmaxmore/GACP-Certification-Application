/**
 * Unit Tests for Security Nonce Utility
 */

const {
    generateNonce,
    verifyNonce,
    consumeNonce,
    generateOAuthState,
    verifyOAuthState,
    generatePKCE,
    verifyPKCE,
    _nonceStore,
} = require('../utils/security-nonce');

describe('Security Nonce Utility', () => {
    beforeEach(() => {
        // Clear nonce store before each test
        _nonceStore.clear();
    });

    describe('generateNonce', () => {
        it('should generate a valid UUID nonce', () => {
            const nonce = generateNonce();
            expect(nonce).toBeDefined();
            expect(nonce).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        });

        it('should store nonce in store', () => {
            const nonce = generateNonce();
            expect(_nonceStore.has(nonce)).toBe(true);
        });

        it('should generate unique nonces', () => {
            const nonces = new Set();
            for (let i = 0; i < 100; i++) {
                nonces.add(generateNonce());
            }
            expect(nonces.size).toBe(100);
        });
    });

    describe('verifyNonce', () => {
        it('should return true for valid unused nonce', () => {
            const nonce = generateNonce();
            expect(verifyNonce(nonce)).toBe(true);
        });

        it('should return false for invalid nonce', () => {
            expect(verifyNonce('invalid-nonce')).toBe(false);
        });

        it('should return false for used nonce', () => {
            const nonce = generateNonce();
            verifyNonce(nonce); // First use
            expect(verifyNonce(nonce)).toBe(false); // Second use should fail
        });
    });

    describe('consumeNonce', () => {
        it('should consume and delete nonce', () => {
            const nonce = generateNonce();
            expect(consumeNonce(nonce)).toBe(true);
            expect(_nonceStore.has(nonce)).toBe(false);
        });

        it('should return false for already consumed nonce', () => {
            const nonce = generateNonce();
            consumeNonce(nonce);
            expect(consumeNonce(nonce)).toBe(false);
        });
    });

    describe('generatePKCE', () => {
        it('should generate valid PKCE pair', () => {
            const { codeVerifier, codeChallenge, codeChallengeMethod } = generatePKCE();

            expect(codeVerifier).toBeDefined();
            expect(codeChallenge).toBeDefined();
            expect(codeChallengeMethod).toBe('S256');
        });

        it('should generate different PKCE pairs each time', () => {
            const pkce1 = generatePKCE();
            const pkce2 = generatePKCE();

            expect(pkce1.codeVerifier).not.toBe(pkce2.codeVerifier);
            expect(pkce1.codeChallenge).not.toBe(pkce2.codeChallenge);
        });
    });

    describe('verifyPKCE', () => {
        it('should verify valid PKCE pair', () => {
            const { codeVerifier, codeChallenge } = generatePKCE();
            expect(verifyPKCE(codeVerifier, codeChallenge)).toBe(true);
        });

        it('should reject invalid PKCE pair', () => {
            const { codeVerifier } = generatePKCE();
            const invalidChallenge = 'invalid-challenge';
            expect(verifyPKCE(codeVerifier, invalidChallenge)).toBe(false);
        });
    });

    describe('OAuth State', () => {
        it('should generate and verify OAuth state', () => {
            const { state, nonce } = generateOAuthState('/dashboard');
            expect(state).toBeDefined();
            expect(nonce).toBeDefined();
        });

        it('should verify valid OAuth state', () => {
            const { state } = generateOAuthState('/dashboard');
            const decoded = verifyOAuthState(state);

            expect(decoded).not.toBeNull();
            expect(decoded.redirectUri).toBe('/dashboard');
        });

        it('should reject invalid OAuth state', () => {
            const decoded = verifyOAuthState('invalid-state');
            expect(decoded).toBeNull();
        });

        it('should reject reused OAuth state (replay attack prevention)', () => {
            const { state } = generateOAuthState('/dashboard');

            // First verification should succeed
            expect(verifyOAuthState(state)).not.toBeNull();

            // Second verification should fail (replay attack)
            expect(verifyOAuthState(state)).toBeNull();
        });
    });
});
