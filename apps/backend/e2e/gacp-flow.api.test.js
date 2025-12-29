/**
 * E2E API Tests for GACP Platform
 * Tests the complete API flow from registration to certification
 *
 * @playwright/test - API Testing
 */

const { test, expect } = require('@playwright/test');

// Base URL from config
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// API helper functions
async function apiRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    const data = await response.json();
    return { status: response.status, data };
}

// ============================================================================
// API HEALTH TESTS
// ============================================================================

test.describe('API Health Checks', () => {

    test('GET /api/v2/health should return 200', async ({ request }) => {
        const response = await request.get('/api/v2/health');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.version).toBe('2.0.0');
        expect(data.database).toBe('postgresql');
    });

    test('GET /api/v2/version should return feature list', async ({ request }) => {
        const response = await request.get('/api/v2/version');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.features).toContain('plants');
        expect(data.features).toContain('harvest-batches');
        expect(data.features).toContain('validation');
    });

});

// ============================================================================
// CONFIG API TESTS
// ============================================================================

test.describe('Config API', () => {

    test('GET /api/v2/config/document-slots should return slots', async ({ request }) => {
        const response = await request.get('/api/v2/config/document-slots');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.slots).toBeDefined();
        expect(data.totalSlots).toBeGreaterThan(0);
    });

    test('GET /api/v2/config/standards should return GACP standards', async ({ request }) => {
        const response = await request.get('/api/v2/config/standards');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.standards).toBeDefined();
    });

    test('GET /api/v2/config/pricing should return fee structure', async ({ request }) => {
        const response = await request.get('/api/v2/config/pricing');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.pricing).toBeDefined();
    });

});

// ============================================================================
// PLANTS API TESTS
// ============================================================================

test.describe('Plants API', () => {

    test('GET /api/v2/plants should return plant list', async ({ request }) => {
        const response = await request.get('/api/v2/plants');

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data || data.plants)).toBeTruthy();
    });

    test('GET /api/v2/plants/categories/list should return categories', async ({ request }) => {
        const response = await request.get('/api/v2/plants/categories/list');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.categories).toContain('CONTROLLED');
        expect(data.categories).toContain('MEDICINAL');
    });

});

// ============================================================================
// VALIDATION API TESTS
// ============================================================================

test.describe('Validation API', () => {

    test('GET /api/v2/validation/checklist should return checklist', async ({ request }) => {
        const response = await request.get('/api/v2/validation/checklist?plantType=cannabis');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.sections).toBeDefined();
    });

    test('POST /api/v2/validation/pre-submission with empty docs', async ({ request }) => {
        const response = await request.post('/api/v2/validation/pre-submission', {
            data: {
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL',
                objectives: [],
                landOwnership: 'owned',
                applicationType: 'NEW',
                uploadedDocuments: [],
            },
        });
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.isReady).toBe(false);
        expect(data.data.completionPercentage).toBeLessThan(100);
        expect(data.data.missingRequired.length).toBeGreaterThan(0);
    });

    test('POST /api/v2/validation/pre-submission with some docs', async ({ request }) => {
        const response = await request.post('/api/v2/validation/pre-submission', {
            data: {
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL',
                objectives: [],
                landOwnership: 'owned',
                applicationType: 'NEW',
                uploadedDocuments: ['id_card', 'house_reg', 'criminal_bg'],
            },
        });
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.completionPercentage).toBeGreaterThan(0);
    });

});

// ============================================================================
// HARVEST BATCHES API TESTS
// ============================================================================

test.describe('Harvest Batches API', () => {

    test('GET /api/v2/harvest-batches should return batch list', async ({ request }) => {
        const response = await request.get('/api/v2/harvest-batches');

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data || data.batches)).toBeTruthy();
    });

});

// ============================================================================
// AUDIT API TESTS
// ============================================================================

test.describe('Audit API', () => {

    test('GET /api/v2/audit should return audit logs', async ({ request }) => {
        const response = await request.get('/api/v2/audit');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
    });

    test('GET /api/v2/audit/stats should return statistics', async ({ request }) => {
        const response = await request.get('/api/v2/audit/stats');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
    });

});

// ============================================================================
// FULL GACP FLOW TEST
// ============================================================================

test.describe('GACP Full Flow', () => {

    test('Complete pre-submission validation flow', async ({ request }) => {
        // Step 1: Get checklist
        const checklistRes = await request.get('/api/v2/validation/checklist?plantType=cannabis&applicantType=INDIVIDUAL');
        expect(checklistRes.ok()).toBeTruthy();
        const checklist = await checklistRes.json();
        expect(checklist.data.sections.length).toBeGreaterThan(0);

        // Step 2: Validate with no documents
        const emptyValidation = await request.post('/api/v2/validation/pre-submission', {
            data: {
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL',
                objectives: [],
                landOwnership: 'owned',
                applicationType: 'NEW',
                uploadedDocuments: [],
            },
        });
        const emptyResult = await emptyValidation.json();
        expect(emptyResult.data.isReady).toBe(false);

        // Step 3: Validate with all required documents
        const fullValidation = await request.post('/api/v2/validation/pre-submission', {
            data: {
                plantType: 'cannabis',
                applicantType: 'INDIVIDUAL',
                objectives: [],
                landOwnership: 'owned',
                applicationType: 'NEW',
                uploadedDocuments: [
                    'id_card',
                    'house_reg',
                    'criminal_bg',
                    'land_deed',
                    'license_bt11',
                    'sop_cultivation',
                    'sop_harvest',
                    'sop_storage',
                    'sop_pest',
                    'photos_exterior',
                    'photos_signage',
                    'site_map',
                    'form_09',
                    'form_10',
                ],
            },
        });
        const fullResult = await fullValidation.json();
        expect(fullResult.data.completionPercentage).toBeGreaterThan(80);
    });

});
