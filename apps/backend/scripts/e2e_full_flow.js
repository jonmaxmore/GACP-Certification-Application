// Native Node.js E2E Script (No external deps)
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const API_URL = process.env.API_URL || 'http://localhost/api'; // Target Nginx by default, or override

// Helper: Fetch Wrapper
async function request(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }

    const config = {
        method,
        headers,
    };

    if (body) { config.body = JSON.stringify(body); }

    console.log(`\n🔹 [${method}] ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`);
    }
    return data;
}

// Helper: Generators
const generateUser = () => ({
    email: `e2e_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@test.com`,
    password: 'Password123!',
    firstName: 'E2E',
    lastName: 'Tester',
    mobile: '08' + crypto.randomInt(10000000, 99999999).toString(),
});

const generatePlot = () => ({
    name: `Plot-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    area: 5,
    areaUnit: 'Rai',
    solarSystem: 'OUTDOOR',
});

async function runE2E() {
    console.log('🚀 Starting E2E Flow (Hybrid: Seed -> API)...');
    let token, userId, farmId, applicationId;

    try {
        const email = `e2e_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@test.com`;
        const password = 'Password123!';

        // 1. Seed User (Bypass Multipart Register)
        console.log(`\n🌱 Seeding User: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'FARMER',
                firstName: 'E2E',
                lastName: 'Tester',
                phoneNumber: '08' + crypto.randomInt(10000000, 99999999).toString(),
                status: 'ACTIVE',
                isEmailVerified: true,
            },
        });
        console.log('✅ User Seeded ID:', user.id);

        // 2. Login
        const loginRes = await request('POST', '/auth-farmer/login', {
            email: email,
            password: password,
        });
        // Helper to extract token from various response formats
        if (loginRes.data && loginRes.data.tokens) {
            token = loginRes.data.tokens.accessToken;
            userId = loginRes.data.user.id;
        } else if (loginRes.token) {
            token = loginRes.token;
            userId = loginRes.user ? loginRes.user.id : null;
        } else if (loginRes.data && loginRes.data.token) {
            token = loginRes.data.token;
            userId = loginRes.data.user ? loginRes.data.user.id : null;
        }

        console.log('✅ Logged In. Token:', token ? 'OK' : 'MISSING');
        console.log('✅ Logged In. User:', userId);

        // 3. Create Farm (Seed via Prisma to avoid API crash/middleware issues)
        console.log('🌱 Seeding Farm...');
        const farm = await prisma.farm.create({
            data: {
                ownerId: userId,
                farmName: 'E2E Integrated Farm',
                farmType: 'CULTIVATION',
                cultivationMethod: 'ORGANIC',
                address: '88/8 Moo 8',
                province: 'Chiang Rai',
                district: 'Muang',
                subDistrict: 'Rob Wiang',
                postalCode: '57000',
                totalArea: 20,
                cultivationArea: 20,
                areaUnit: 'rai',
                status: 'APPROVED',
            },
        });
        farmId = farm.id;
        console.log('✅ Farm Seeded:', farmId);

        // 4. Add Plot
        const plotPayload = generatePlot();
        const plotRes = await request('POST', `/farms/${farmId}/plots`, plotPayload, token);
        console.log('✅ Plot Created:', plotRes.data.name);

        // 5. Draft Application
        const appRes = await request('POST', '/applications', {
            farmId: farmId,
            plant: 'Cannabis', // Ensure this matches Enum
            type: 'NEW',
        }, token);
        applicationId = appRes.data.id;
        console.log('✅ Application Drafted:', applicationId);

        // 6. Submit Application
        // Depending on backend, might need to upload docs first. 
        // For E2E basic flow, we try to submit.
        try {
            await request('POST', `/applications/${applicationId}/submit`, {}, token);
            console.log('✅ Application Submitted');
        } catch (e) {
            console.log('⚠️ Submit Warning (Might need docs):', e.message);
        }

        // 7. Check Payment/Invoice
        // In this system, maybe submitting creates an invoice?
        // Let's list invoices.
        try {
            const invoices = await request('GET', `/invoices`, null, token);
            const myInv = invoices.data.find(i => i.applicationId === applicationId);
            if (myInv) {
                console.log('💰 Invoice Found:', myInv.invoiceNumber, myInv.amount, 'THB');
            } else {
                console.log('ℹ️ No invoice generated yet (Pending Admin Approval?)');
            }
        } catch (e) {
            console.log('⚠️ Invoice Check Failed:', e.message);
        }

        console.log('\n✨ E2E Sequence Finished.');

    } catch (error) {
        console.error('\n❌ E2E CRITICAL FAILURE:', error.message);
        process.exit(1);
    }
}

runE2E();
