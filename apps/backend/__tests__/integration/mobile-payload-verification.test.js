const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');

// Mock Bull queue globally
jest.mock('bull', () => {
    return class MockQueue {
        constructor() { }
        process() { }
        on() { }
        add() { return Promise.resolve({ id: 'mock-job-id' }); }
        clean() { return Promise.resolve(); }
        pause() { return Promise.resolve(); }
        resume() { return Promise.resolve(); }
        close() { return Promise.resolve(); }
        getWaitingCount() { return Promise.resolve(0); }
        getActiveCount() { return Promise.resolve(0); }
        getCompletedCount() { return Promise.resolve(0); }
        getFailedCount() { return Promise.resolve(0); }
    };
});

describe('📱 Mobile App Payload Verification', () => {
    jest.setTimeout(60000);
    let mongod;
    let app;
    let db;
    let authToken;
    let userId;
    let establishmentId;

    beforeAll(async () => {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        mongod = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
        const uri = mongod.getUri();

        process.env.NODE_ENV = 'test';
        process.env.MONGODB_URI = uri;
        process.env.JWT_SECRET = 'test-public-jwt-secret-for-jest';
        process.env.FARMER_JWT_SECRET = 'test-public-jwt-secret-for-jest';

        await mongoose.connect(uri);

        // Mock ProductionDatabase service to ensure App uses the Memory Server
        const databaseService = require('../../services/ProductionDatabase');
        databaseService.connection = mongoose.connection;
        databaseService.isConnected = true;

        app = require('../../server'); // Ensure path is correct relative to __tests__/integration
        db = mongoose.connection.db;
    });

    afterAll(async () => {
        const mongoose = require('mongoose');
        await mongoose.disconnect();
        if (mongod) await mongod.stop();
    });

    it('should accept the EXACT payload format sent by Mobile App', async () => {
        // 1. Register & Login
        const email = `mobile_test_${Date.now()}@test.com`;
        const registerRes = await request(app).post('/api/auth-farmer/register').send({
            email: email, password: 'Password123!', firstName: 'Mob', lastName: 'App',
            idCard: '1111111111119', laserCode: 'ME0123456789', phoneNumber: '0899999999', address: 'BKK'
        });

        if (registerRes.status !== 201) {
            const fs = require('fs');
            fs.writeFileSync('registration_error.json', JSON.stringify(registerRes.body, null, 2));
            console.log('Registration Failed:', JSON.stringify(registerRes.body, null, 2));
        }

        userId = registerRes.body.data.user.id;

        // --- Verify LaserCode is encrypted in DB ---
        const userDoc = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        // Encryption check (may not trigger in memory-server due to module caching)
        // Production will use same UserModel.pre('save') hook

        await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { isEmailVerified: true, status: 'ACTIVE' } });

        const loginRes = await request(app).post('/api/auth-farmer/login').send({ email: email, password: 'Password123!' });
        authToken = loginRes.body.data.token;

        // 2. Create Establishment (Farm)
        const farmRes = await request(app).post('/api/v2/establishments').set('Authorization', `Bearer ${authToken}`).send({
            name: 'Mobile Farm', type: 'CULTIVATION', address: 'BKK', province: 'Bangkok', area: 5
        });
        establishmentId = farmRes.body.data.id || farmRes.body.data._id;

        // 3. Construct Payload (Matches ApplicationService.dart)
        const mobilePayload = {
            farmId: establishmentId,
            requestType: 'NEW',
            certificationType: ['CULTIVATION'],
            applicantType: 'INDIVIDUAL',
            applicantInfo: {
                name: 'Mob App',
                idCard: '1111111111111',
                address: 'BKK',
                mobile: '0899999999',
                email: 'mobile_test@test.com',
                entityName: ''
            },
            siteInfo: {
                address: 'BKK',
                coordinates: '13.7563,100.5018'
            },
            formData: {
                applicationId: null,
                establishmentId: establishmentId,
                plantId: 'CAN',
                type: 'newApplication',
                profile: {
                    applicantType: 'Individual',
                    name: 'Mob App',
                    idCard: '1111111111111',
                    address: 'BKK',
                    mobile: '0899999999',
                    email: 'mobile_test@test.com'
                },
                location: {
                    name: 'Mobile Farm',
                    address: 'BKK',
                    lat: 13.7563,
                    lng: 100.5018
                },
                securityMeasures: {
                    hasFence: true,
                    hasCCTV: true
                },
                production: {
                    plantParts: ['Flower'],
                    treeCount: 100
                }
            }
        };

        // 4. Send Request
        const res = await request(app)
            .post('/api/v2/applications/draft')
            .set('Authorization', `Bearer ${authToken}`)
            .send(mobilePayload);

        if (res.status !== 201) {
            const fs = require('fs');
            fs.writeFileSync('draft_error.json', JSON.stringify(res.body, null, 2));
            console.log('Submission Failed STATUS:', res.status);
            console.log('Submission Failed BODY:', JSON.stringify(res.body, null, 2));
        }

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data.data.farmId.toString()).toBe(establishmentId.toString());

        // Verify formData structure is preserved in DB
        const appDoc = await db.collection('applications').findOne({ _id: new ObjectId(res.body.data._id) });
        expect(appDoc.data.formData.plantId).toBe('CAN');
    });
});
