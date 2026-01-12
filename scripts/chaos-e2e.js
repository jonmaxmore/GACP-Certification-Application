const axiosLib = require('../apps/backend/node_modules/axios');
const axios = axiosLib.default || axiosLib;
const FormData = require('../apps/backend/node_modules/form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const ITERATIONS = 5; // Run 5 times for "Chaos" / Load check
const MOCK_ID_PATH = path.join(__dirname, '../apps/backend/__tests__/fixtures/test-id-card.jpg');

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runIteration(i) {
    const email = `chaos_${Date.now()}_${i}@example.com`;
    const password = 'password123';
    console.log(`\n[${i}/${ITERATIONS}] Starting flow for ${email}...`);

    try {
        // 1. Register
        console.log(`  Registering...`);
        const regRes = await axios.post(`${API_URL}/auth-farmer/register`, {
            email,
            password,
            firstName: `Chaos${i}`,
            lastName: 'Tester',
            idCard: `11000${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            phoneNumber: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            accountType: 'INDIVIDUAL'
        });
        if (!regRes.data.success) throw new Error('Registration failed');

        // 2. Login
        console.log(`  Logging in...`);
        const loginRes = await axios.post(`${API_URL}/auth-farmer/login`, { email, password });
        const token = loginRes.data.data.tokens.accessToken;
        if (!token) throw new Error('No access token returned');

        // 3. Verify Identity (Upload)
        console.log(`  Uploading ID for Verification...`);
        const form = new FormData();
        form.append('idCardImage', fs.createReadStream(MOCK_ID_PATH));

        const verifyRes = await axios.post(`${API_URL}/identity/verify`, form, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...form.getHeaders()
            }
        });

        console.log(`  AI Analysis: ${verifyRes.data.aiAnalysis?.confidence ?? 'N/A'}`);

        // 4. Check Status (Poll /me)
        console.log(`  Checking Status...`);
        let status = 'PENDING';
        for (let attempt = 0; attempt < 5; attempt++) {
            const meRes = await axios.get(`${API_URL}/auth-farmer/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            status = meRes.data.data.verificationStatus;
            if (status === 'APPROVED') break;
            await sleep(1000);
        }

        if (status === 'APPROVED') {
            console.log(`✅ [${i}] Success! User Verified.`);
        } else {
            console.error(`❌ [${i}] Failed. Final Status: ${status}`);
        }

    } catch (e) {
        console.error(`❌ [${i}] ERROR:`, e.message);
        if (e.response) console.error('   Data:', JSON.stringify(e.response.data));
    }
}

async function main() {
    console.log(`🔥 STARTING CHAOS TEST: ${ITERATIONS} Iterations 🔥`);
    console.log(`Target: ${API_URL}`);
    console.log(`Mock ID: ${MOCK_ID_PATH}`);

    for (let i = 1; i <= ITERATIONS; i++) {
        await runIteration(i);
        await sleep(500); // Slight delay between users
    }
    console.log('\n✅ Chaos Test Complete.');
}

main();
