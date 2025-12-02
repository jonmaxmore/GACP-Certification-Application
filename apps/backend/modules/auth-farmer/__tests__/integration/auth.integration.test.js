/**
 * Auth Farmer Integration Tests
 * Tests the full authentication flow through HTTP endpoints
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createAuthFarmerModule = require('../../container');

describe('Auth Farmer Integration Tests', () => {
  let app;
  let mongoServer;
  let farmerAuthModule;

  // Test data
  const testUser = {
    email: 'test.farmer@example.com',
    password: 'SecureP@ssw0rd123',
    firstName: 'Test',
    lastName: 'Farmer',
    idCard: '1234567890123',
    phoneNumber: '0812345678',
    address: '123 Test Street',
    province: 'Bangkok',
    district: 'Bang Khen',
    subDistrict: 'Anusawari',
    postalCode: '10220',
  };

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);

    // Setup Express app with auth module
    app = express();
    app.use(express.json());

    farmerAuthModule = createAuthFarmerModule({
      database: mongoose.connection,
      jwtSecret: 'test-jwt-secret-key-for-integration-tests',
      jwtExpiresIn: '1h',
      bcryptSaltRounds: 10,
    });

    app.use('/api/auth/farmer', farmerAuthModule.router);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/auth/farmer/register', () => {
    it('should register a new farmer successfully', async () => {
      const response = await request(app)
        .post('/api/auth/farmer/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('registered'),
      });
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toMatchObject({
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        status: 'PENDING_VERIFICATION',
      });
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app)
        .post('/api/auth/farmer/register')
        .send(testUser)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringMatching(/already (exists|registered)/i),
      });
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/farmer/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
      });
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/farmer/register')
        .send({
          ...testUser,
          email: 'another.farmer@example.com',
          password: 'weak',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
      });
    });
  });

  describe('POST /api/auth/farmer/login', () => {
    it('should reject login for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/farmer/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(403);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('verify'),
      });
    });

    it('should reject invalid credentials', async () => {
      // Use non-existent email to test invalid credentials (not email verification)
      const response = await request(app)
        .post('/api/auth/farmer/login')
        .send({
          email: 'another.user@example.com',
          password: 'WrongPassword123',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid'),
      });
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/farmer/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
      });
    });
  });

  describe('GET /api/auth/farmer/profile', () => {
    it('should reject unauthorized access', async () => {
      await request(app).get('/api/auth/farmer/profile').expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/auth/farmer/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/auth/farmer/request-password-reset', () => {
    it('should accept password reset request for existing email', async () => {
      const response = await request(app)
        .post('/api/auth/farmer/request-password-reset')
        .send({
          email: testUser.email,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('reset'),
      });
    });

    it('should accept request for non-existent email (security)', async () => {
      // Should not reveal whether email exists
      const response = await request(app)
        .post('/api/auth/farmer/request-password-reset')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
      });
    });
  });
});
