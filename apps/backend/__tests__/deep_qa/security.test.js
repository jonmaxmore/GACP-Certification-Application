const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../server'); // Relative path to apps/backend/server.js

// Ensure we have a secret to sign tokens. 
// server.js loads dotenv, but if it fails, we default to what might be in common use or fail tests.
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    console.warn('WARNING: JWT_SECRET not set in environment tests. Tests may fail if server uses a different secret.');
}

describe('Deep QA: 1.1 Auth & Security', () => {

    // 1. Token Expiry
    describe('Token Expiry', () => {
        it('should return 401 when accessing protected route with expired token', async () => {
            // Create expired token
            const token = jwt.sign(
                { id: '507f1f77bcf86cd799439011', role: 'farmer' },
                SECRET || 'secret', // Use valid secret if available
                { expiresIn: '-1s' },
            );

            const res = await request(app)
                .get('/api/v2/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(401);
        });
    });

    // 2. Role Protection
    describe('Role Protection', () => {
        it('should return 403 when Farmer tries to access Officer endpoint', async () => {
            // Create valid Farmer token
            const token = jwt.sign(
                { id: '507f1f77bcf86cd799439011', role: 'farmer' },
                SECRET || 'secret',
                { expiresIn: '1h' },
            );

            // /api/v2/officer/auditors requires 'officer' role
            const res = await request(app)
                .get('/api/v2/officer/auditors')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(403);
        });
    });

    // 3. Input Validation
    describe('Input Validation', () => {
        it('should return 400 when Login body is missing password', async () => {
            const res = await request(app)
                .post('/api/v2/auth/login')
                .send({ email: 'test@example.com' }); // Missing password

            expect(res.status).toBe(400);
        });

        it('should return 400 when Register body is empty', async () => {
            const res = await request(app)
                .post('/api/v2/auth/register')
                .send({}); // Empty body

            expect(res.status).toBe(400);
        });
    });
});

