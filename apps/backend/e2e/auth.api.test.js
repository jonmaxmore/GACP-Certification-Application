/**
 * E2E Tests for Authentication Flow
 * Tests registration, login, token refresh, and logout
 * 
 * Routes: /api/auth-farmer/*
 */

const { test, expect } = require('@playwright/test');
const crypto = require('crypto');

// Generate unique test data
const testId = crypto.randomBytes(4).toString('hex');

// ============================================================================
// AUTHENTICATION API TESTS
// ============================================================================

test.describe('Authentication API', () => {

    test('POST /api/auth-farmer/check-identifier with valid format', async ({ request }) => {
        const response = await request.post('/api/auth-farmer/check-identifier', {
            data: {
                identifier: '1234567890123',
                accountType: 'INDIVIDUAL',
            },
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(typeof data.available).toBe('boolean');
    });

    test('POST /api/auth-farmer/check-identifier with short ID should fail', async ({ request }) => {
        const response = await request.post('/api/auth-farmer/check-identifier', {
            data: {
                identifier: '123',
                accountType: 'INDIVIDUAL',
            },
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.available).toBe(false);
    });

    test('POST /api/auth-farmer/login with wrong credentials', async ({ request }) => {
        const response = await request.post('/api/auth-farmer/login', {
            data: {
                identifier: '1234567890123',
                password: 'wrongpassword123',
                accountType: 'INDIVIDUAL',
            },
        });

        expect(response.status()).toBe(401);
        const data = await response.json();
        expect(data.success).toBe(false);
    });

    test('GET /api/auth-farmer/me without token should return 401', async ({ request }) => {
        const response = await request.get('/api/auth-farmer/me');
        expect(response.status()).toBe(401);
    });

});

// ============================================================================
// SECURITY TESTS
// ============================================================================

test.describe('Security Tests', () => {

    test('Should reject expired/invalid JWT tokens', async ({ request }) => {
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImV4cCI6MTYwMDAwMDAwMH0.signature';

        const response = await request.get('/api/auth-farmer/me', {
            headers: {
                'Authorization': `Bearer ${fakeToken}`,
            },
        });

        expect(response.status()).toBeGreaterThanOrEqual(401);
        expect(response.status()).toBeLessThanOrEqual(403);
    });

    test('Should reject malformed Authorization header', async ({ request }) => {
        const response = await request.get('/api/auth-farmer/me', {
            headers: {
                'Authorization': 'NotBearerToken',
            },
        });

        expect(response.status()).toBeGreaterThanOrEqual(401);
    });

});

// ============================================================================
// PUBLIC ENDPOINTS (NO AUTH REQUIRED)
// ============================================================================

test.describe('Public Endpoints', () => {

    test('GET /api/v2/health should work without auth', async ({ request }) => {
        const response = await request.get('/api/v2/health');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
    });

    test('GET /api/v2/config/document-slots should work without auth', async ({ request }) => {
        const response = await request.get('/api/v2/config/document-slots');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.totalSlots).toBeGreaterThan(0);
    });

    test('POST /api/auth-farmer/check-identifier should work without auth', async ({ request }) => {
        const response = await request.post('/api/auth-farmer/check-identifier', {
            data: {
                identifier: '9876543210123',
                accountType: 'INDIVIDUAL',
            },
        });

        expect(response.ok()).toBeTruthy();
    });

    test('GET /api/v2/config/standards should work without auth', async ({ request }) => {
        const response = await request.get('/api/v2/config/standards');
        expect(response.ok()).toBeTruthy();
    });

    test('GET /api/v2/config/pricing should work without auth', async ({ request }) => {
        const response = await request.get('/api/v2/config/pricing');
        expect(response.ok()).toBeTruthy();
    });

});

// ============================================================================
// PROTECTED ENDPOINTS (AUTH REQUIRED)
// ============================================================================

test.describe('Protected Endpoints', () => {

    test('GET /api/v2/notifications should require auth', async ({ request }) => {
        const response = await request.get('/api/v2/notifications');
        expect(response.status()).toBe(401);
    });

});
