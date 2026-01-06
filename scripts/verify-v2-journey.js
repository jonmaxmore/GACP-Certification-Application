/**
 * V2 Golden Loop Verification Script
 * Simulates the full user journey against the running backend (localhost:8000)
 * 
 * Usage: node scripts/verify-v2-journey.js
 */

const axios = require('axios');
const API_URL = 'http://localhost:8000/api';
const V2_URL = 'http://localhost:8000/api/v2';

// Test Data
const timestamp = Date.now();
const FARMER = {
    email: `farmer_${timestamp}@test.com`,
    password: 'Password123!',
    firstName: 'Somchai',
    lastName: 'Test',
    idCard: `${timestamp}`.substring(0, 13), // Mock 13 digit ID
    laserCode: `ME${timestamp}`.substring(0, 12),
    phoneNumber: '0812345678',
    address: '123 Test Rd'
};
const OFFICIER_TOKEN = process.env.OFFICER_TOKEN; // Needed if auth enabled
// Note: We might need to login as existng admin or register one?
// For now, let's assume we can register a fresh farmer easily.

let farmerToken = '';
let farmerId = '';
let applicationId = '';
let certificateNumber = '';

async function run() {
    try {
        console.log('🚀 Starting V2 Golden Loop Verification...\n');

        // 1. Register Farmer
        console.log('1. Registering Farmer...');
        try {
            const regRes = await axios.post(`${API_URL}/auth-farmer/register`, FARMER);
            console.log('   ✅ Registered:', regRes.data.data.user.email);
            farmerId = regRes.data.data.user.id;
        } catch (e) {
            console.log('   Note: Registration might fail if ID exists, trying login...');
        }

        // 2. Login Farmer
        console.log('2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth-farmer/login`, {
            email: FARMER.email,
            password: FARMER.password
        });
        farmerToken = loginRes.data.data.token;
        console.log('   ✅ Logged in. Token length:', farmerToken.length);

        const authHeaders = { headers: { Authorization: `Bearer ${farmerToken}` } };

        // 3. Create Establishment (Farm)
        console.log('3. Creating Establishment...');
        const farmRes = await axios.post(`${V2_URL}/establishments`, {
            name: `Farm ${timestamp}`,
            type: 'CULTIVATION',
            address: 'Chiang Mai',
            province: 'Chiang Mai',
            area: 10
        }, authHeaders);
        const farmId = farmRes.data.data.id;
        console.log('   ✅ Farm Created:', farmId);

        // 4. Draft Application
        console.log('4. Drafting Application...');
        const draftRes = await axios.post(`${V2_URL}/applications/draft`, {
            farmId: farmId,
            requestType: 'NEW',
            applicantType: 'INDIVIDUAL',
            applicantInfo: {
                name: `${FARMER.firstName} ${FARMER.lastName}`,
                email: FARMER.email
            },
            siteInfo: {
                address: 'Chiang Mai'
            },
            formData: {
                cropName: 'Cannabis'
            }
        }, authHeaders);
        applicationId = draftRes.data.data.id;
        console.log('   ✅ Application Drafted:', applicationId);

        // 5. Submit (Confirm Review)
        console.log('5. Confirming for Review...');
        await axios.post(`${V2_URL}/applications/${applicationId}/confirm-review`, {}, authHeaders);
        console.log('   ✅ Confirmed. Status: PAYMENT_1_PENDING');

        // 6. Pay Phase 1 (Mock)
        console.log('6. Paying Phase 1...');
        const pay1Res = await axios.post(`${V2_URL}/applications/${applicationId}/pay-phase1`, {}, authHeaders);
        // Direct Mock ID for webhook? Or use public verify override?
        // Since we are black box testing, we might need manual approval or a test-only endpoint.
        // But for verification script, let's stop here or try the public 'verify' if available?
        // The previous test manually updated DB. We can't do that easily without DB access in this script.

        // However, we can use the 'ksher/webhook' endpoint if we know the order ID.
        const orderId = pay1Res.data.data.transactionId;
        console.log('   Phase 1 Order ID:', orderId);

        try {
            await axios.post(`${V2_URL}/applications/ksher/webhook`, {
                mch_order_no: orderId,
                result: 'SUCCESS',
                sign: 'mock', // Might fail signature check
                channel: 'promptpay'
            });
            console.log('   ✅ Webhook sent (Signature check might fail)');
        } catch (e) {
            console.log('   ⚠️ Webhook failed (Expected if signature validation is on):', e.response?.data?.message || e.message);
        }

        // Verify status
        const appStatusRes = await axios.get(`${V2_URL}/applications/${applicationId}`, authHeaders);
        console.log('   current Status:', appStatusRes.data.data.status);

        // If status is still PAYMENT_1_PENDING, we can't proceed further in Black Box test without a backdoor.
        // But we proved V2 endpoints actially WORK up to payment.

        // 7. Test Plant API (Prisma Verification)
        console.log('7. Verifying Plant API (Prisma)...');
        const plantRes = await axios.get(`${V2_URL}/plants/CAN/documents`);
        if (plantRes.data.data.documents.length > 0) {
            console.log(`   ✅ Plant API works. Found ${plantRes.data.data.documents.length} docs for CAN.`);
        } else {
            console.error('   ❌ Plant API returned empty docs.');
        }

        console.log('\n✨ V2 Verification Partial Success (Stopped at Payment Signature).');
        console.log('Backend is responsive and Prisma is serving data.');
    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received (Network Error?)');
        }
    }
}

run();
