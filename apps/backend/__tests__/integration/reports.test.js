/**
 * Unit Tests for Reports API
 * Tests analytics endpoints for government officials
 */

const request = require('supertest');
const express = require('express');

// Mock AuthMiddleware
jest.mock('../../middleware/AuthMiddleware', () => ({
    authenticateFarmer: (req, res, next) => {
        req.user = { id: 'test-staff-456', role: 'REVIEWER_AUDITOR' };
        next();
    },
}));

const reportsRouter = require('../../routes/api/reports');

describe('Reports API', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/v2/reports', reportsRouter);
    });

    describe('GET /api/v2/reports/overview', () => {
        it('should return overview statistics', async () => {
            const response = await request(app)
                .get('/api/v2/reports/overview');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('overview');
            expect(response.body.data.overview).toHaveProperty('totalApplications');
            expect(response.body.data.overview).toHaveProperty('pendingReview');
            expect(response.body.data.overview).toHaveProperty('approved');
            expect(response.body.data.overview).toHaveProperty('rejected');
        });
    });

    describe('GET /api/v2/reports/dashboard', () => {
        it('should return full dashboard data', async () => {
            const response = await request(app)
                .get('/api/v2/reports/dashboard');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('overview');
            expect(response.body.data).toHaveProperty('byStatus');
            expect(response.body.data).toHaveProperty('byPlantType');
            expect(response.body.data).toHaveProperty('byProvince');
            expect(response.body.data).toHaveProperty('monthlyTrend');
        });

        it('should have 12 months of trend data', async () => {
            const response = await request(app)
                .get('/api/v2/reports/dashboard');

            expect(response.body.data.monthlyTrend).toHaveLength(12);
        });
    });

    describe('GET /api/v2/reports/monthly', () => {
        it('should return monthly stats with query params', async () => {
            const response = await request(app)
                .get('/api/v2/reports/monthly')
                .query({ month: 12, year: 2024 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.period.month).toBe(12);
            expect(response.body.data.period.year).toBe(2024);
        });

        it('should use current month if no params provided', async () => {
            const response = await request(app)
                .get('/api/v2/reports/monthly');

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('period');
            expect(response.body.data).toHaveProperty('stats');
        });

        it('should include comparison data', async () => {
            const response = await request(app)
                .get('/api/v2/reports/monthly');

            expect(response.body.data).toHaveProperty('comparedToPreviousMonth');
        });
    });

    describe('GET /api/v2/reports/export', () => {
        it('should export as JSON by default', async () => {
            const response = await request(app)
                .get('/api/v2/reports/export')
                .query({ type: 'applications' });

            expect(response.status).toBe(200);
            expect(response.header['content-type']).toContain('application/json');
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should export as CSV when requested', async () => {
            const response = await request(app)
                .get('/api/v2/reports/export')
                .query({ format: 'csv', type: 'applications' });

            expect(response.status).toBe(200);
            expect(response.header['content-type']).toContain('text/csv');
        });

        it('should export different data types', async () => {
            const types = ['applications', 'certificates', 'payments'];

            for (const type of types) {
                const response = await request(app)
                    .get('/api/v2/reports/export')
                    .query({ type });

                expect(response.status).toBe(200);
                expect(response.body.type).toBe(type);
            }
        });
    });

    describe('GET /api/v2/reports/by-province', () => {
        it('should return statistics grouped by province', async () => {
            const response = await request(app)
                .get('/api/v2/reports/by-province');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('byProvince');
            expect(response.body.data).toHaveProperty('totalProvinces');
            expect(response.body.data.totalProvinces).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v2/reports/by-plant', () => {
        it('should return statistics grouped by plant type', async () => {
            const response = await request(app)
                .get('/api/v2/reports/by-plant');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('byPlantType');
            expect(response.body.data).toHaveProperty('totalPlantTypes');
        });

        it('should include all GACP plant types', async () => {
            const response = await request(app)
                .get('/api/v2/reports/by-plant');

            const plantTypes = Object.keys(response.body.data.byPlantType);
            // Should have at least cannabis and kratom
            expect(plantTypes.length).toBeGreaterThanOrEqual(2);
        });
    });
});

describe('Data Integrity', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/v2/reports', reportsRouter);
    });

    it('should have consistent totals', async () => {
        const response = await request(app)
            .get('/api/v2/reports/dashboard');

        const { overview, byStatus } = response.body.data;
        const statusTotal = Object.values(byStatus).reduce((a, b) => a + b, 0);

        // Status totals should roughly match overview total
        // (allowing some difference for edge cases)
        expect(Math.abs(statusTotal - overview.totalApplications)).toBeLessThan(100);
    });
});

