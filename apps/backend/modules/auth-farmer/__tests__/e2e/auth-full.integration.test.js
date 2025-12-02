/**
 * E2E Integration Tests for Auth Farmer Module
 * Tests full HTTP flow: register → login → verify token
 * Uses supertest + mongodb-memory-server for isolated testing
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');

describe('Auth Farmer E2E Integration Tests', () => {
  let mongod;
  let client;
  let app;
  let db;
  let baseURL;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('botanical_test');

    // Set environment variables for test
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = uri;
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing';
    process.env.FARMER_JWT_SECRET = 'test-farmer-jwt-secret-for-e2e';

    // Import app after setting env vars
    // Adjust path based on your app structure
    app = require('../../../../atlas-server');
    baseURL = '/api/auth/farmer';
  });

  afterAll(async () => {
    // Close MongoDB client
    if (client) {
      await client.close();
    }

    // Stop MongoDB Memory Server
    if (mongod) {
      await mongod.stop();
    }

    // Close mongoose connection if any
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Give time for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  beforeEach(async () => {
    // Clear users collection before each test
  await db.collection('users_farmer').deleteMany({});
  });

  describe('POST /register → POST /login flow', () => {
    it('should register new farmer and then login successfully', async () => {
      // Step 1: Register new user
      const registerPayload = {
        email: 'farmer.e2e@example.com',
        password: 'Str0ngE2EPass!123',
        firstName: 'E2E',
        lastName: 'Farmer',
        idCard: '1234567890123',
        phoneNumber: '+66812345678',
        address: '123 E2E Test Street',
        province: 'Bangkok',
        district: 'Bang Khen',
        subDistrict: 'Anusawari',
        postalCode: '10220',
      };

      const registerRes = await request(app)
        .post(`${baseURL}/register`)
        .send(registerPayload)
        .expect('Content-Type', /json/);

      // Assert registration response
      expect(registerRes.status).toBe(201);
      expect(registerRes.body).toHaveProperty('id');
      expect(registerRes.body).toHaveProperty('email', registerPayload.email);
      expect(registerRes.body).toHaveProperty('status', 'PENDING_VERIFICATION');
      expect(registerRes.body).not.toHaveProperty('password'); // Password should not be returned

      const userId = registerRes.body.id;

      // Step 2: Manually verify email (skip email verification for testing)
      await db.collection('users_farmer').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isEmailVerified: true, status: 'ACTIVE' } },
      );

      // Step 3: Login with registered credentials
      const loginRes = await request(app)
        .post(`${baseURL}/login`)
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        })
        .expect('Content-Type', /json/);

      // Assert login response
      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
      expect(loginRes.body).toHaveProperty('user');
      expect(loginRes.body.user).toHaveProperty('id', userId);
      expect(loginRes.body.user).toHaveProperty('email', registerPayload.email);
      expect(loginRes.body.user).not.toHaveProperty('password');

      // Step 4: Verify token structure (JWT should have 3 parts)
      const token = loginRes.body.token;
      expect(token.split('.')).toHaveLength(3);
    });

    it('should reject login with incorrect password', async () => {
      // Step 1: Register user
      const registerPayload = {
        email: 'wrongpass@example.com',
        password: 'CorrectP@ss123',
        firstName: 'Wrong',
        lastName: 'Pass',
        idCard: '9876543210987',
        phoneNumber: '+66876543210',
      };

      await request(app).post(`${baseURL}/register`).send(registerPayload).expect(201);

      // Manually verify email
      await db.collection('users_farmer').updateOne(
        { email: registerPayload.email.toLowerCase() },
        { $set: { isEmailVerified: true, status: 'ACTIVE' } },
      );

      // Step 2: Attempt login with wrong password
      const loginRes = await request(app)
        .post(`${baseURL}/login`)
        .send({
          email: registerPayload.email,
          password: 'WrongP@ssword123',
        })
        .expect('Content-Type', /json/);

      expect(loginRes.status).toBe(401);
      expect(loginRes.body).toHaveProperty('error');
      expect(loginRes.body.error).toMatch(/invalid|credentials/i);
    });

    it('should reject login for non-existent user', async () => {
      const loginRes = await request(app)
        .post(`${baseURL}/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'SomeP@ssword123',
        })
        .expect('Content-Type', /json/);

      expect(loginRes.status).toBe(401);
      expect(loginRes.body).toHaveProperty('error');
    });

    it('should reject duplicate email registration', async () => {
      const registerPayload = {
        email: 'duplicate@example.com',
        password: 'Str0ngPass!123',
        firstName: 'Duplicate',
        lastName: 'User',
        idCard: '1111111111111',
        phoneNumber: '+66811111111',
      };

      // First registration
      await request(app).post(`${baseURL}/register`).send(registerPayload).expect(201);

      // Second registration with same email
      const duplicateRes = await request(app)
        .post(`${baseURL}/register`)
        .send({
          ...registerPayload,
          idCard: '2222222222222', // Different ID card
          phoneNumber: '+66822222222',
        })
        .expect('Content-Type', /json/);

      expect(duplicateRes.status).toBe(409); // Conflict
      expect(duplicateRes.body).toHaveProperty('error');
      expect(duplicateRes.body.error).toMatch(/email.*exists|already registered/i);
    });

    it('should reject duplicate ID card registration', async () => {
      const registerPayload = {
        email: 'idcard1@example.com',
        password: 'Str0ngPass!123',
        firstName: 'IDCard',
        lastName: 'User',
        idCard: '3333333333333',
        phoneNumber: '+66833333333',
      };

      // First registration
      await request(app).post(`${baseURL}/register`).send(registerPayload).expect(201);

      // Second registration with same ID card
      const duplicateRes = await request(app)
        .post(`${baseURL}/register`)
        .send({
          ...registerPayload,
          email: 'idcard2@example.com', // Different email
          phoneNumber: '+66844444444',
        })
        .expect('Content-Type', /json/);

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body).toHaveProperty('error');
      expect(duplicateRes.body.error).toMatch(/id.*card.*exists|already registered/i);
    });
  });

  describe('GET /profile (authenticated)', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Register and login to get auth token
      const registerPayload = {
        email: 'profile@example.com',
        password: 'Pr0filePass!123',
        firstName: 'Profile',
        lastName: 'User',
        idCard: '5555555555555',
        phoneNumber: '+66855555555',
      };

      const registerRes = await request(app).post(`${baseURL}/register`).send(registerPayload);

      userId = registerRes.body.id;

      // Verify email
      await db.collection('users_farmer').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isEmailVerified: true, status: 'ACTIVE' } },
      );

      // Login
      const loginRes = await request(app).post(`${baseURL}/login`).send({
        email: registerPayload.email,
        password: registerPayload.password,
      });

      authToken = loginRes.body.token;
    });

    it('should retrieve user profile with valid token', async () => {
      const profileRes = await request(app)
        .get(`${baseURL}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body).toHaveProperty('id', userId);
      expect(profileRes.body).toHaveProperty('email', 'profile@example.com');
      expect(profileRes.body).toHaveProperty('firstName', 'Profile');
      expect(profileRes.body).not.toHaveProperty('password');
    });

    it('should reject profile request without token', async () => {
      const profileRes = await request(app)
        .get(`${baseURL}/profile`)
        .expect('Content-Type', /json/);

      expect(profileRes.status).toBe(401);
      expect(profileRes.body).toHaveProperty('error');
    });

    it('should reject profile request with invalid token', async () => {
      const profileRes = await request(app)
        .get(`${baseURL}/profile`)
        .set('Authorization', 'Bearer invalid.token.here')
        .expect('Content-Type', /json/);

      expect(profileRes.status).toBe(401);
      expect(profileRes.body).toHaveProperty('error');
    });
  });

  describe('PUT /profile (update profile)', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      const registerPayload = {
        email: 'update@example.com',
        password: 'Upd@tePass123',
        firstName: 'Update',
        lastName: 'User',
        idCard: '6666666666666',
        phoneNumber: '+66866666666',
      };

      const registerRes = await request(app).post(`${baseURL}/register`).send(registerPayload);

      userId = registerRes.body.id;

      await db.collection('users_farmer').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isEmailVerified: true, status: 'ACTIVE' } },
      );

      const loginRes = await request(app).post(`${baseURL}/login`).send({
        email: registerPayload.email,
        password: registerPayload.password,
      });

      authToken = loginRes.body.token;
    });

    it('should update user profile with valid data', async () => {
      const updatePayload = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+66899999999',
        address: '999 New Address',
      };

      const updateRes = await request(app)
        .put(`${baseURL}/profile`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload)
        .expect('Content-Type', /json/);

      expect(updateRes.status).toBe(200);
      expect(updateRes.body).toHaveProperty('firstName', 'Updated');
      expect(updateRes.body).toHaveProperty('lastName', 'Name');
      expect(updateRes.body).toHaveProperty('phoneNumber', '+66899999999');
    });

    it('should reject profile update without authentication', async () => {
      const updateRes = await request(app)
        .put(`${baseURL}/profile`)
        .send({ firstName: 'Hacker' })
        .expect('Content-Type', /json/);

      expect(updateRes.status).toBe(401);
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset for existing email', async () => {
      // Register user first
      await request(app).post(`${baseURL}/register`).send({
        email: 'reset@example.com',
        password: 'OldP@ss123',
        firstName: 'Reset',
        lastName: 'User',
        idCard: '7777777777777',
        phoneNumber: '+66877777777',
      });

      // Request password reset
      const resetRes = await request(app)
        .post(`${baseURL}/request-password-reset`)
        .send({ email: 'reset@example.com' })
        .expect('Content-Type', /json/);

      expect(resetRes.status).toBe(200);
      expect(resetRes.body).toHaveProperty('message');
    });

    it('should not reveal if email does not exist (security)', async () => {
      const resetRes = await request(app)
        .post(`${baseURL}/request-password-reset`)
        .send({ email: 'nonexistent@example.com' })
        .expect('Content-Type', /json/);

      // Should return 200 even if email doesn't exist (prevent email enumeration)
      expect(resetRes.status).toBe(200);
    });
  });
});
