
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DTAM_JWT_SECRET = 'test-dtam-secret';

const app = require('../server');
const User = require('../models/UserModel');

let mongoServer;
let server;
let baseUrl;
let farmerToken = '';
let adminToken = '';
let applicationId = '';

async function setup() {
    console.log('Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create({
        replSet: {
            name: 'rs0',
            count: 1,
            storageEngine: 'wiredTiger',
        }
    });
    const mongoUri = mongoServer.getUri();
    console.log(`Mongo URI: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('Connected to In-Memory DB (Replica Set)');

    // Seed Admin
    const adminUser = new User({
        email: 'admin@gacp.com',
        password: 'Admin123!', // Will be hashed
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '0999999999',
        idCard: '3100501664002',
        laserCode: 'ME9999999999',
        role: 'DTAM_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true
    });
    await adminUser.save();
    console.log('Seeded Admin User');

    // Start Server
    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}/api`;
            console.log(`Test server running at ${baseUrl}`);
            resolve();
        });
    });
}

async function teardown() {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
}

async function request(url, method, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    };

    const res = await fetch(url, options);
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        throw new Error(`Failed to parse JSON: ${text.substring(0, 200)}... Status: ${res.status}`);
    }

    if (!res.ok) {
        const error = new Error(`Request failed: ${res.status} ${res.statusText}`);
        error.response = { data, text };
        throw error;
    }
    return { data, status: res.status };
}

async function runGoldenLoop() {
    console.log('🚀 Starting Golden Loop V2 Verification...');

    try {
        await setup();

        // 1. Register Farmer
        console.log('\n--- Step 1: Farmer Registration ---');
        const farmerData = {
            email: `farmer_${Date.now()}@test.com`,
            password: 'Password123!',
            firstName: 'Test',
            lastName: 'Farmer',
            phoneNumber: '0812345678',
            idCard: '1100702485133',
            laserCode: 'ME1234567890',
            address: '123 Farm Road',
            province: 'Chiang Mai',
            zipCode: '50000'
        };

        await request(`${baseUrl}/auth-farmer/register`, 'POST', farmerData);
        console.log('✅ Farmer Registered');

        // Manually verify email
        await User.updateOne({ email: farmerData.email }, { isEmailVerified: true, status: 'ACTIVE' });

        const loginRes = await request(`${baseUrl}/auth-farmer/login`, 'POST', {
            email: farmerData.email,
            password: farmerData.password
        });
        farmerToken = loginRes.data.data.token;
        console.log('✅ Farmer Logged In');

        // 2. Submit Form 10 (Sale)
        console.log('\n--- Step 2: Submit Form 10 ---');

        // Create Establishment
        const estRes = await request(`${baseUrl}/v2/establishments`, 'POST', {
            name: 'Golden Farm',
            licenseNumber: 'LIC-123',
            address: '123 Farm Lane',
            province: 'Chiang Mai',
            district: 'Mae Rim',
            subDistrict: 'Mae Raem',
            zipCode: '50180'
        }, farmerToken);

        const establishmentId = estRes.data.data.id || estRes.data.data._id;
        console.log('✅ Establishment Created:', establishmentId);

        const formData = {
            establishmentId: establishmentId,
            type: 'NEW',
            formType: 'FORM_10',
            applicantType: 'individual',
            farmInformation: {
                name: 'Golden Farm',
                address: {
                    street: '123 Farm Lane',
                    district: 'Mae Rim',
                    province: 'Chiang Mai',
                    postalCode: '50180'
                },
                coordinates: {
                    latitude: 18.7883,
                    longitude: 98.9853
                },
                location: {
                    province: 'Chiang Mai'
                },
                area: { total: 10, cultivated: 5 },
                landOwnership: { documents: ['doc1'] },
                waterSource: 'well',
                soilType: 'loamy',
                farmType: 'ORGANIC',
                owner: 'Test Farmer'
            },
            cropInformation: [
                { cropType: 'Cannabis', variety: 'Sativa', plantingDate: new Date() }
            ],
            farmerData: {
                formSpecificData: {
                    sale: {
                        dispensingMethod: 'pharmacy',
                        pharmacist: {
                            name: 'Dr. Green',
                            licenseNumber: 'PH-999'
                        },
                        operatingHours: '09:00 - 17:00',
                        commercialRegNumber: 'COM-888'
                    }
                }
            }
        };

        const appRes = await request(`${baseUrl}/v2/applications`, 'POST', formData, farmerToken);
        applicationId = appRes.data.data.applicationId || appRes.data.data._id;
        console.log('✅ Application Submitted (ID: ' + applicationId + ')');

        // 3. Admin Login
        console.log('\n--- Step 3: Admin Login ---');
        const adminLoginRes = await request(`${baseUrl}/auth-farmer/login`, 'POST', {
            email: 'admin@gacp.com',
            password: 'Admin123!'
        });
        adminToken = adminLoginRes.data.data.token;
        console.log('✅ Admin Logged In');

        // 4. Admin View Detail (Fetch by ID)
        console.log('\n--- Step 4: Admin View Detail ---');
        const detailRes = await request(`${baseUrl}/v2/applications/${applicationId}`, 'GET', null, adminToken);
        if (detailRes.data.data.applicationId === applicationId || detailRes.data.data._id === applicationId || detailRes.data.data.id === applicationId) {
            console.log('✅ Admin Fetched Application Details');
        } else {
            throw new Error('Fetched ID mismatch');
        }

        // 5. Admin Approve
        console.log('\n--- Step 5: Admin Approve ---');
        await request(`${baseUrl}/v2/applications/${applicationId}/status`, 'PATCH', {
            status: 'CERTIFIED',
            notes: 'Golden Loop Verified'
        }, adminToken);
        console.log('✅ Application Approved');

        // 6. Verify Status
        console.log('\n--- Step 6: Final Verification ---');
        const finalRes = await request(`${baseUrl}/v2/applications/${applicationId}`, 'GET', null, farmerToken);
        if (finalRes.data.data.status === 'CERTIFIED') {
            console.log('✅ Status Verified as CERTIFIED');
        } else {
            throw new Error('Status mismatch: ' + finalRes.data.data.status);
        }

        console.log('\n🎉 Golden Loop V2 Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Golden Loop Failed:', error.message);
        if (error.response && error.response.data) {
            console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
        }
    } finally {
        await teardown();
    }
}

runGoldenLoop();
