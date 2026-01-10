// Comprehensive E2E Lifecycle Test (Farmer -> Staff -> Public)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// --- Helpers ---
async function request(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) { headers['Authorization'] = `Bearer ${token}`; }

    const config = { method, headers };
    if (body) { config.body = JSON.stringify(body); }

    console.log(`\n🔹 [${method}] ${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`); }
    return data;
}

async function loginStaff(username, password) {
    console.log(`🔑 Logging in Staff: ${username}`);
    const res = await request('POST', '/auth-dtam/login', { username, password });
    return res.data.token;
}

// --- Main Flow ---
async function runLifecycle() {
    console.log('🚀 Starting Comprehensive Lifecycle E2E Test...');

    // 0. Seed Staff (Ensure Staff Exist for Phases 2, 4, 5)
    async function seedStaff() {
        const staffRoles = [
            { id: 'mock-reviewer-001', username: 'reviewer', role: 'reviewer' },
            { id: 'mock-scheduler-001', username: 'scheduler', role: 'scheduler' },
            { id: 'mock-auditor-001', username: 'auditor', role: 'auditor' },
        ];

        const password = await bcrypt.hash('Test@12345', 10);

        for (const s of staffRoles) {
            try {
                const exists = await prisma.dTAMStaff.findUnique({ where: { username: s.username } });
                if (!exists) {
                    await prisma.dTAMStaff.create({
                        data: {
                            id: s.id,
                            username: s.username,
                            password,
                            email: `${s.username}@dtam.go.th`,
                            role: s.role,
                            firstName: s.username,
                            lastName: 'Test',
                            employeeId: s.username.toUpperCase(),
                            isActive: true,
                        },
                    });
                    console.log(`✅ Staff Seeded: ${s.username}`);
                } else {
                    console.log(`ℹ️ Staff Exists: ${s.username}`);
                }
            } catch (err) {
                console.error(`⚠️ Failed to seed ${s.username}: ${err.message}`);
            }
        }
    }
    await seedStaff();

    let farmerToken, farmerId, farmId, applicationId, cycleId, qrCode;
    let reviewerToken, schedulerToken, auditorToken;

    try {
        // ==========================================
        // PHASE 1: FARMER REGISTRATION & SUBMISSION
        // ==========================================
        console.log('\n--- PHASE 1: FARMER ---');
        const email = `cycle_${Date.now()}@test.com`;
        const password = 'Password123!';

        // 1. Seed Farmer
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'FARMER',
                firstName: 'Lifecycle',
                lastName: 'Farmer',
                phoneNumber: '08' + crypto.randomInt(10000000, 99999999).toString(),
                status: 'ACTIVE',
                isEmailVerified: true,
            },
        });
        farmerId = user.id;
        console.log(`✅ Farmer Seeded: ${email}`);

        // 2. Login Farmer
        const loginRes = await request('POST', '/auth-farmer/login', { email, password });
        console.log('DEBUG: Login Response:', JSON.stringify(loginRes, null, 2));

        if (loginRes.data && loginRes.data.tokens) {
            farmerToken = loginRes.data.tokens.accessToken;
        } else if (loginRes.token) {
            farmerToken = loginRes.token;
        }

        console.log('DEBUG: Extracted Token:', farmerToken ? 'FOUND' : 'MISSING');
        console.log('DEBUG: Token Value:', farmerToken);
        if (!farmerToken) { throw new Error('Farmer Login Failed: No Token'); }

        // 3. Seed Farm (Simulate existing approved Land)
        const farm = await prisma.farm.create({
            data: {
                ownerId: farmerId,
                farmName: 'Lifecycle Organic Farm',
                farmType: 'CULTIVATION',
                cultivationMethod: 'ORGANIC',
                address: '123 Test Road',
                province: 'Chiang Mai',
                district: 'Mae Rim',
                subDistrict: 'Mae Sa',
                postalCode: '50180',
                totalArea: 10,
                cultivationArea: 5,
                areaUnit: 'rai',
                status: 'APPROVED',
            },
        });
        farmId = farm.id;
        console.log(`✅ Farm Seeded: ${farm.farmName}`);

        // 4. Submit Application (GACP Certification)
        const appRes = await request('POST', '/applications/draft', {
            plantId: 'cannabis-sativa',
            plantName: 'Cannabis Sativa',
            serviceType: 'GACP',
            areaType: 'OUTDOOR',
            reqestInspectionDate: new Date().toISOString(),
            // Mock mandatory sections
            applicantData: { type: 'New' },
            locationData: { farmId: farmId },
            productionData: { method: 'Organic' },
            documents: [],
        }, farmerToken);

        // Note: The /draft endpoint logic currently force-sets status to 'SUBMITTED' based on code analysis
        applicationId = appRes.data._id || appRes.data.id;
        console.log(`✅ Application Submitted: ${appRes.data.applicationNumber}`);


        // ==========================================
        // PHASE 2: REVIEWER (DOCUMENT CHECK)
        // ==========================================
        console.log('\n--- PHASE 2: REVIEWER ---');

        // 1. Login
        reviewerToken = await loginStaff('reviewer', 'Test@12345');

        // 2. Review & Approve
        await request('POST', `/applications/${applicationId}/review`, {
            action: 'APPROVE',
            comment: 'Documents look perfect.',
        }, reviewerToken);
        console.log('✅ Documents Approved');


        // ==========================================
        // PHASE 3: PAYMENT (SIMULATED)
        // ==========================================
        console.log('\n--- PHASE 3: PAYMENT ---');
        // Manually bump status to PENDING_AUDIT to simulate Payment success -> System transition
        // In real system, Payment Gateway Webhook would do this.
        await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'PENDING_AUDIT' },
        });
        console.log('✅ Payment Simulated -> Status: PENDING_AUDIT');


        // ==========================================
        // PHASE 4: SCHEDULER (ASSIGN AUDITOR)
        // ==========================================
        console.log('\n--- PHASE 4: SCHEDULER ---');

        // 1. Login
        schedulerToken = await loginStaff('scheduler', 'Test@12345');

        // 2. Schedule Audit
        // Find an auditor first (mock auditor id)
        const auditorUser = await prisma.dTAMStaff.findFirst({ where: { username: 'auditor' } });
        if (!auditorUser) {
            throw new Error('Auditor not found in DB');
        }

        await request('POST', `/audits/schedule`, {
            applicationId: applicationId,
            scheduledDate: new Date().toISOString().split('T')[0], // Today
            scheduledTime: '10:00',
            auditorId: auditorUser.id,
            auditMode: 'ONSITE',
        }, schedulerToken);
        console.log('✅ Audit Scheduled');


        // ==========================================
        // PHASE 5: AUDITOR (ONSITE CHECK)
        // ==========================================
        console.log('\n--- PHASE 5: AUDITOR ---');

        // 1. Login
        auditorToken = await loginStaff('auditor', 'Test@12345');

        // 2. Submit Audit Result (PASS)
        const auditRes = await request('POST', `/audits/${applicationId}/result`, {
            result: 'PASS',
            notes: 'Farm is in excellent condition.',
            auditMode: 'ONSITE',
        }, auditorToken);

        if (auditRes.data.status !== 'APPROVED') {
            throw new Error(`Audit Failed to transition status. Got: ${auditRes.data.status}`);
        }
        console.log('✅ Audit Passed -> Application APPROVED');

        // 3. System Side Effect: Farm should be ACTIVE
        // Backend now handles this automatically on Audit Approval
        // We verify it by fetching the farm status
        const farmRes = await prisma.farm.findUnique({ where: { id: farmId } });
        if (farmRes.status !== 'ACTIVE') {
            // Small wait likely not needed if concurrent database, but good for safety
            throw new Error(`Farm failed to activate. Status: ${farmRes.status}`);
        }
        console.log('✅ Farm Activated (Auto)');


        // ==========================================
        // PHASE 6: FARMER (TRACEABILITY)
        // ==========================================
        console.log('\n--- PHASE 6: FARMER TRACEABILITY ---');

        // 1. Create Planting Cycle
        // Check if plant exists
        let plant = await prisma.plantSpecies.findUnique({ where: { code: 'CAN' } });
        if (!plant) {
            plant = await prisma.plantSpecies.create({
                data: {
                    code: 'CAN',
                    nameTH: 'กัญชา',
                    nameEN: 'Cannabis',
                    scientificName: 'Cannabis sativa',
                    group: 'HIGH_CONTROL',
                },
            });
        }

        const cycleRes = await request('POST', '/planting-cycles', {
            farmId,
            cycleName: 'Cycle 1/2026',
            plantSpeciesId: plant.id,
            startDate: new Date().toISOString(),
            status: 'PLANTED',
            plotName: 'Plot A1',
            plotArea: 1,
            areaUnit: 'rai',
        }, farmerToken);

        cycleId = cycleRes.data.id || cycleRes.data.data.id; // handle wrapper
        console.log('✅ Planting Cycle Created (via API)');

        // 2. Generate QR
        // POST /api/trace/generate { type: 'CYCLE', id: cycleId }
        const qrRes = await request('POST', '/trace/generate', {
            type: 'CYCLE',
            id: cycleId,
        }, farmerToken);

        qrCode = qrRes.data.qrCode;
        console.log(`✅ QR Code Generated: ${qrCode}`);


        // ==========================================
        // PHASE 7: PUBLIC (SCAN QR)
        // ==========================================
        console.log('\n--- PHASE 7: PUBLIC SCAN ---');

        const publicRes = await request('GET', `/trace/${qrCode}`);
        if (!publicRes.success) { throw new Error('Public Trace Failed'); }

        console.log('✅ Public Trace Data Retrieved:');
        console.log(`   - Farm: ${publicRes.data.farm.name}`);
        console.log(`   - Plant: ${publicRes.data.plant.nameEN}`);
        console.log(`   - Status: ${publicRes.data.status}`);

        console.log('\n✨ LIFECYCLE TEST COMPLETE ✨');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        // Clean exit despite error
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runLifecycle();
