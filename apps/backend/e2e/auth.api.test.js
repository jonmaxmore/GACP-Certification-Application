/**
 * E2E Tests for Authentication Flow
 * Tests registration, login, token refresh, and logout
 */

const { test, expect } = require('@playwright/test');
const crypto = require('crypto');

// Generate unique test data
const testId = crypto.randomBytes(4).toString('hex');
const testUser = {
    identifier: `1234567890${testId.slice(0, 3)}`, // Unique 13-digit ID
    password: 'TestPass123!',
    firstName: 'ทดสอบ',
    lastName: 'อีทูอี',
    phoneNumber: `08${testId}12345`.slice(0, 10),
    accountType: 'INDIVIDUAL',
};

// ============================================================================
// AUTHENTICATION API TESTS
// ============================================================================

test.describe('Authentication API', () => {

    test('POST /auth/check-identifier with new ID should return available', async ({ request }) => {
        const response = await request.post('/auth/check-identifier', {
            data: {
                identifier: '9999999999999',
                accountType: 'INDIVIDUAL',
            },
        });

        const data = await response.json();
        expect(data.success).toBe(true);
        // Either available or already exists is a valid response
        expect(typeof data.available).toBe('boolean');
    });

    test('POST /auth/check-identifier with invalid format should return error', async ({ request }) => {
        const response = await request.post('/auth/check-identifier', {
            data: {
                identifier: '123',  // Too short
                accountType: 'INDIVIDUAL',
            },
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.available).toBe(false);
    });

    test('POST /auth/login with wrong credentials should return 401', async ({ request }) => {
        const response = await request.post('/auth/login', {
            data: {
                identifier: '1234567890123',
                password: 'wrongpassword',
                accountType: 'INDIVIDUAL',
            },
        });

        expect(response.status()).toBe(401);
        const data = await response.json();
        expect(data.success).toBe(false);
    });

    test('GET /auth/me without token should return 401', async ({ request }) => {
        const response = await request.get('/auth/me');
        expect(response.status()).toBe(401);
    });

});

// ============================================================================
// SECURITY ENDPOINT TESTS
// ============================================================================

test.describe('Security Endpoints', () => {

    test('API should require Bearer token format', async ({ request }) => {
        // Test with malformed token
        const response = await request.get('/auth/me', {
            headers: {
                'Authorization': 'InvalidToken',
            },
        });

        expect(response.status()).toBe(401);
    });

    test('API should reject expired tokens gracefully', async ({ request }) => {
        // Use a clearly fake but properly formatted token
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImV4cCI6MTYwMDAwMDAwMH0.fake';

        const response = await request.get('/auth/me', {
            headers: {
                'Authorization': `Bearer ${fakeToken}`,
            },
        });

        expect(response.status()).toBeGreaterThanOrEqual(401);
        expect(response.status()).toBeLessThanOrEqual(403);
    });

});

// ============================================================================
// TOKEN VALIDATION TESTS
// ============================================================================

test.describe('Token Validation', () => {

    test('Protected routes should return proper error codes', async ({ request }) => {
        const protectedRoutes = [
            { method: 'GET', path: '/auth/me' },
            { method: 'GET', path: '/api/v2/notifications' },
        ];

        for (const route of protectedRoutes) {
            const response = route.method === 'GET'
                ? await request.get(route.path)
                : await request.post(route.path);

            // Should be 401 (Unauthorized) without token
            expect(response.status()).toBe(401);
        }
    });

});

// ============================================================================
// PUBLIC ENDPOINTS TESTS (No Auth Required)
// ============================================================================

test.describe('Public Endpoints (No Auth)', () => {

    test('GET /api/v2/health should be accessible without auth', async ({ request }) => {
        const response = await request.get('/api/v2/health');
        expect(response.ok()).toBeTruthy();
    });

    test('GET /api/v2/config/document-slots should be accessible', async ({ request }) => {
        const response = await request.get('/api/v2/config/document-slots');
        expect(response.ok()).toBeTruthy();
    });

    test('POST /auth/check-identifier should be accessible', async ({ request }) => {
        const response = await request.post('/auth/check-identifier', {
            data: {
                identifier: '1234567890123',
                accountType: 'INDIVIDUAL',
            },
        });
        expect(response.ok()).toBeTruthy();
    });

});
