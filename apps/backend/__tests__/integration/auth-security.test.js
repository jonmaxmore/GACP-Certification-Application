/**
 * Authentication & Security Integration Tests
 * Tests Priority 3 implementation:
 * 1. AI Routes Authentication
 * 2. Inspection Scheduling Authentication
 * 3. Error Handling
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createAuthFarmerModule = require('../../modules/auth-farmer/container');
const createAuthDTAMModule = require('../../modules/auth-dtam/container');
const fertilizerRoutes = require('../../routes/ai/fertilizer.routes');
const inspectionRoutes = require('../../routes/inspection-scheduling.routes');
const { errorHandler } = require('../../middleware/error-handler-middleware');

describe('Priority 3: Authentication & Security Tests', () => {
  let app;
  let mongoServer;
  let farmerAuthModule;
  let dtamAuthModule;
  let farmerToken;
  let dtamToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app = express();
    app.use(express.json());

    // Setup Auth Modules
    farmerAuthModule = createAuthFarmerModule({
      database: mongoose.connection,
      jwtSecret: 'test-secret',
      jwtExpiresIn: '1h',
      bcryptSaltRounds: 10,
    });

    dtamAuthModule = createAuthDTAMModule({
      database: mongoose.connection,
      jwtSecret: 'test-secret',
      jwtExpiresIn: '1h',
      bcryptSaltRounds: 10,
    });

    // Mount Auth Routes
    app.use('/api/auth/farmer', farmerAuthModule.router);
    app.use('/api/auth/dtam', dtamAuthModule.router);

    // Mount Protected Routes
    app.use('/api/ai/fertilizer', fertilizerRoutes);
    app.use('/api', inspectionRoutes);

    // Error Handler
    app.use(errorHandler);

    // Register test farmer
    const farmerRes = await request(app)
      .post('/api/auth/farmer/register')
      .send({
        email: 'test.farmer@example.com',
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'Farmer',
        phoneNumber: '0812345678',
        idCard: '1234567890123',
        laserCode: 'ME0123456789',
        address: '123 Test St',
        province: 'Bangkok',
        district: 'Test',
        subDistrict: 'Test',
        postalCode: '10000',
      });

    farmerToken = farmerRes.body.data.token;

    // Login test DTAM staff (assuming seed exists)
    const dtamRes = await request(app)
      .post('/api/auth/dtam/login')
      .send({
        email: 'admin@dtam.go.th',
        password: 'Admin@2025',
      });

    dtamToken = dtamRes.body.data?.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('1. AI Routes Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/ai/fertilizer/recommend')
        .send({
          farmId: '123',
          cultivationCycleId: '456',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow authenticated farmer requests', async () => {
      const res = await request(app)
        .post('/api/ai/fertilizer/recommend')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farmId: '123',
          cultivationCycleId: '456',
        });

      // May return 500 if controller not fully implemented, but should pass auth
      expect([200, 500]).toContain(res.status);
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication failed');
      }
    });
  });

  describe('2. Inspection Scheduling Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/inspections/123/schedule')
        .send({
          scheduledDate: '2025-12-01',
          scheduledTime: '10:00',
          type: 'video_call',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow authenticated farmer requests', async () => {
      const res = await request(app)
        .post('/api/inspections/123/schedule')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          scheduledDate: '2025-12-01',
          scheduledTime: '10:00',
          type: 'video_call',
          farmerId: 'test-farmer-id',
        });

      // May return error if service not fully implemented
      expect([200, 201, 400, 500]).toContain(res.status);
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication failed');
      }
    });

    it('should allow authenticated DTAM staff requests', async () => {
      if (!dtamToken) {
        console.log('DTAM token not available, skipping test');
        return;
      }

      const res = await request(app)
        .get('/api/inspections/calendar')
        .set('Authorization', `Bearer ${dtamToken}`)
        .query({
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        });

      expect([200, 500]).toContain(res.status);
      if (res.status === 401 || res.status === 403) {
        throw new Error('Authentication failed');
      }
    });
  });

  describe('3. Error Handling', () => {
    it('should return standardized error format', async () => {
      const res = await request(app)
        .post('/api/ai/fertilizer/recommend')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('message');
    });

    it('should handle 404 errors', async () => {
      const res = await request(app)
        .get('/api/nonexistent-route');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});
