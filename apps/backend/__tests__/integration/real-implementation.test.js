/**
 * Real Implementation Integration Tests
 * Verifies:
 * 1. Real Identity Verification (Mod 13, Laser Code)
 * 2. KYC Workflow (Admin Approval)
 * 3. Video Room Creation
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const createAuthFarmerModule = require('../../modules/auth-farmer/container');
const KYCController = require('../../modules/user-management/presentation/controllers/KYCController');
const User = require('../../models/User');
const videoService = require('../../services/videoService');

// Mock Video Service
jest.mock('../../services/videoService');

describe('Real Implementation Integration Tests', () => {
  let app;
  let mongoServer;
  let farmerAuthModule;
  let kycController;

  // Valid Thai ID Generator (Mod 13)
  const generateThaiID = () => {
    let id = '';
    for (let i = 0; i < 12; i++) id += Math.floor(Math.random() * 10);
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(id.charAt(i)) * (13 - i);
    const check = (11 - (sum % 11)) % 10;
    return id + check;
  };

  const validID = generateThaiID();
  const validLaser = 'ME0123456789';

  const testUser = {
    email: 'real.farmer@example.com',
    password: 'SecureP@ssw0rd123',
    firstName: 'Real',
    lastName: 'Farmer',
    idCard: validID,
    laserCode: validLaser,
    phoneNumber: '0812345678',
    address: '123 Real Farm',
    province: 'Chiang Mai',
    district: 'Mae Rim',
    subDistrict: 'Mae Raem',
    postalCode: '50180',
    farmerType: 'individual',
    farmingExperience: 5,
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app = express();
    app.use(express.json());

    // Setup Auth Module
    farmerAuthModule = createAuthFarmerModule({
      database: mongoose.connection,
      jwtSecret: 'test-secret',
      jwtExpiresIn: '1h',
      bcryptSaltRounds: 10,
    });

    // Setup KYC Controller
    // Use the repository from the auth module which connects to users_farmer collection
    kycController = new KYCController({ userRepository: farmerAuthModule.services.userRepository });

    // Mount Routes
    app.use('/api/auth/farmer', farmerAuthModule.router);

    // Mount KYC Routes (Simplified for test)
    app.post('/api/admin/kyc/verify', (req, res) => kycController.verifyUser(req, res));

    // Mount Video Route (Simplified)
    app.post('/api/inspections/:id/video-room', async (req, res) => {
      try {
        const result = await videoService.createRoom(req.params.id, req.body.title);
        res.json({ success: true, data: result });
      } catch (e) {
        res.status(500).json({ success: false, error: e.message });
      }
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('1. Identity Verification', () => {
    it('should reject invalid Thai ID', async () => {
      const res = await request(app)
        .post('/api/auth/farmer/register')
        .send({ ...testUser, idCard: '1234567890123' }); // Invalid Check Digit

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid Thai ID/);
    });

    it('should reject invalid Laser Code format', async () => {
      const res = await request(app)
        .post('/api/auth/farmer/register')
        .send({ ...testUser, laserCode: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid Laser Code/);
    });

    it('should register successfully with valid ID and Laser Code', async () => {
      const res = await request(app)
        .post('/api/auth/farmer/register')
        .field('email', testUser.email)
        .field('password', testUser.password)
        .field('firstName', testUser.firstName)
        .field('lastName', testUser.lastName)
        .field('phoneNumber', testUser.phoneNumber)
        .field('idCard', testUser.idCard)
        .field('laserCode', testUser.laserCode)
        .field('address', testUser.address)
        .field('province', testUser.province)
        .field('district', testUser.district)
        .field('subDistrict', testUser.subDistrict)
        .field('zipCode', testUser.zipCode)
        .field('farmerType', testUser.farmerType)
        .field('farmingExperience', testUser.farmingExperience)
        // .attach('idCardImage', path.resolve(__dirname, '../fixtures/test-id-card.jpg'));

      console.log('Register Response:', JSON.stringify(res.body, null, 2));

      if (res.status !== 201) {
        console.log('Register Error:', JSON.stringify(res.body, null, 2));
      }
      expect(res.status).toBe(201);
      expect(res.body.data.user.verificationStatus).toBe('pending');
    });
  });

  describe('2. KYC Workflow', () => {
    let userId;

    beforeAll(async () => {
      const user = await User.findOne({ email: testUser.email });
      userId = user._id;
    });

    it('should verify user via Admin API', async () => {
      const res = await request(app)
        .post('/api/admin/kyc/verify')
        .send({ userId, action: 'APPROVE' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('verified');

      const updatedUser = await User.findById(userId);
      expect(updatedUser.verificationStatus).toBe('verified');
    });
  });

  describe('3. Video Call Integration (Daily.co)', () => {
    it('should create video room using service', async () => {
      videoService.createRoom.mockResolvedValue({
        roomId: 'inspection-123',
        roomUrl: 'https://test.daily.co/inspection-123'
      });

      const res = await request(app)
        .post('/api/inspections/123/video-room')
        .send({ title: 'Test Audit' });

      expect(res.status).toBe(200);
      expect(res.body.data.roomUrl).toBe('https://test.daily.co/inspection-123');
      expect(videoService.createRoom).toHaveBeenCalledWith('123', 'Test Audit');
    });
  });
});
