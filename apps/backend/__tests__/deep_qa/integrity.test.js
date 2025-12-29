const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const mongoose = require('mongoose');

// MOCK the Application Model to avoid DB Setup issues
jest.mock('../../models/ApplicationModel');
const Application = require('../../models/ApplicationModel');

describe('Deep QA: 1.2 Data Integrity (Controller Logic)', () => {
    const SECRET = process.env.JWT_SECRET || 'gacp_secret_2024';
    let officerToken;
    let farmerToken;

    beforeAll(() => {
        officerToken = jwt.sign(
            { id: new mongoose.Types.ObjectId(), role: 'OFFICER', email: 'officer@test.com' },
            SECRET, { expiresIn: '1h' }
        );
        farmerToken = jwt.sign(
            { id: new mongoose.Types.ObjectId(), role: 'FARMER', email: 'farmer@test.com' },
            SECRET, { expiresIn: '1h' }
        );
    });

    // 1. Invalid Status Transition
    describe('Status Integrity', () => {
        it('should NOT allow Officer to Certify a DRAFT application', async () => {
            // Mock findById to return a DRAFT application
            Application.findById.mockResolvedValue({
                _id: 'mock-app-id',
                status: 'DRAFT',
                save: jest.fn()
            });

            const res = await request(app)
                .post('/api/v2/applications/mock-app-id/audit-result')
                .set('Authorization', `Bearer ${officerToken}`)
                .send({ result: 'PASS', notes: 'Hacked it' });

            expect(res.status).toBe(400);
        });

        it('should NOT allow Payment 2 when status is DRAFT', async () => {
            Application.findById.mockResolvedValue({
                _id: 'mock-app-id',
                status: 'DRAFT',
                save: jest.fn()
            });

            const res = await request(app)
                .post('/api/v2/applications/mock-app-id/pay-phase2')
                .set('Authorization', `Bearer ${farmerToken}`)
                .send({});

            expect(res.status).toBe(400);
        });

        it('should NOT allow Auditor Assignment on DRAFT', async () => {
            Application.findById.mockResolvedValue({
                _id: 'mock-app-id',
                status: 'DRAFT',
                save: jest.fn()
            });

            const res = await request(app)
                .post('/api/v2/applications/mock-app-id/assign-auditor')
                .set('Authorization', `Bearer ${officerToken}`)
                .send({ auditorId: '123', date: '2025-01-01' });

            expect(res.status).toBe(400);
        });
    });

});

