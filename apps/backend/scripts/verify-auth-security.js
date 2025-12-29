/**
 * Verify Authentication & Security Implementation
 * Tests RBAC, JWT, and Route Security
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set test environment to prevent server from connecting to real DB
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DTAM_JWT_SECRET = 'test-dtam-secret';

const app = require('../server'); // Import app
const User = require('../models/UserModel');
const { RBACService } = require('../services/security-compliance');

let mongoServer;
let server;
let baseUrl;

async function setup() {
    console.log('Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('MongoMemoryServer started at:', mongoUri);

    console.log('Connecting to Mongoose...');
    await mongoose.connect(mongoUri);
    console.log('Connected to Mongoose');

    // Start server
    console.log('Starting Express Server...');
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

async function runTests() {
    try {
        await setup();

        console.log('\n--- Starting Security Verification ---\n');

        // 1. Register Farmer
        console.log('1. Testing Registration...');
        const farmerData = {
            email: 'farmer@test.com',
            password: 'password123',
            firstName: 'Somchai',
            lastName: 'Farmer',
            phoneNumber: '0812345678',
            idCard: '1234567890123',
            laserCode: 'ME1234567890',
            address: '123 Farm Rd',
            province: 'Chiang Mai',
            zipCode: '50000'
        };

        const regRes = await fetch(`${baseUrl}/auth-farmer/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(farmerData)
        });

        if (regRes.status === 201) {
            console.log('✅ Registration successful');
        } else {
            const data = await regRes.json();
            console.error('❌ Registration failed:', data);
        }

        // Verify email manually in DB
        await User.updateOne({ email: farmerData.email }, { isEmailVerified: true, status: 'ACTIVE' });

        // 2. Login Farmer
        console.log('\n2. Testing Login (Farmer)...');
        const loginRes = await fetch(`${baseUrl}/auth-farmer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: farmerData.email,
                password: farmerData.password
            })
        });

        const loginData = await loginRes.json();
        const farmerToken = loginData.data?.token;

        if (farmerToken) {
            console.log('✅ Login successful, Token received');
        } else {
            console.error('❌ Login failed:', loginData);
        }

        // 3. Test Protected Route (Farmer Access)
        console.log('\n3. Testing Farmer Access to Protected Route...');
        try {
            const res = await fetch(`${baseUrl}/gacp-applications`, {
                headers: { Authorization: `Bearer ${farmerToken}` }
            });
            if (res.ok) {
                console.log('✅ Farmer can access /gacp-applications');
            } else {
                const data = await res.json();
                console.error('❌ Farmer access failed:', data);
            }
        } catch (error) {
            console.error('❌ Farmer access error:', error.message);
        }

        // 4. Test RBAC - Farmer accessing Admin Route
        console.log('\n4. Testing Farmer Access to Admin Route (Should Fail)...');
        try {
            // Try to access KYC pending (Admin/Officer only)
            const res = await fetch(`${baseUrl}/v2/kyc/pending`, {
                headers: { Authorization: `Bearer ${farmerToken}` }
            });

            if (res.status === 403) {
                console.log('✅ Farmer correctly denied access (403 Forbidden)');
            } else {
                console.error('❌ Unexpected status:', res.status);
            }
        } catch (error) {
            console.error('❌ Unexpected error:', error.message);
        }

        // 5. Create Admin User
        console.log('\n5. Creating Admin User...');
        const adminUser = new User({
            email: 'admin@dtam.go.th',
            password: 'adminpassword',
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '021234567',
            idCard: '9999999999999',
            laserCode: 'ME9999999999',
            role: 'DTAM_ADMIN', // Now mapped to dtam_admin in RBAC
            status: 'ACTIVE',
            isEmailVerified: true
        });

        await adminUser.save();

        // Login Admin
        const adminLoginRes = await fetch(`${baseUrl}/auth-farmer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@dtam.go.th',
                password: 'adminpassword'
            })
        });

        const adminLoginData = await adminLoginRes.json();
        const adminToken = adminLoginData.data?.token;

        // 6. Test Admin Access
        console.log('\n6. Testing Admin Access...');
        try {
            // Admin should access KYC pending
            const res = await fetch(`${baseUrl}/v2/kyc/pending`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            if (res.ok) {
                console.log('✅ Admin access successful');
            } else {
                const data = await res.json();
                console.error('❌ Admin access failed:', data);
            }
        } catch (error) {
            console.error('❌ Admin access error:', error.message);
        }

        console.log('\n--- Security Verification Complete ---');

    } catch (error) {
        console.error('\n!!! TEST SUITE ERROR !!!');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n')); // Print first 5 lines of stack
        process.exit(1);
    } finally {
        await teardown();
    }
}

runTests();

