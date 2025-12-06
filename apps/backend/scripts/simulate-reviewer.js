const fetch = require('node-fetch'); // or native
const BASE_URL = 'http://127.0.0.1:5000/api';

const REVIEWER_CREDS = {
    email: 'admin@gacp.com',
    password: 'password123'
};

async function runReviewerUAT() {
    try {
        console.log('[UAT-2] Reviewer Journey Starting...');

        // 1. Login
        console.log('🔑 Logging in as Reviewer (Admin)...');
        let loginRes = await fetch(`${BASE_URL}/auth-farmer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(REVIEWER_CREDS)
        });
        if (!loginRes.ok) {
            loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(REVIEWER_CREDS)
            });
        }

        if (!loginRes.ok) throw new Error('Login failed');
        const loginData = await loginRes.json();
        const token = loginData.token || loginData.data?.token;

        // 2. Fetch Queue (Fetch ALL to debug)
        console.log('📋 Fetching ALL Applications...');
        const listRes = await fetch(`${BASE_URL}/v2/applications`, { // Remove filter
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        const apps = listData.data.applications || listData.data;

        console.log(`Found ${apps.length} apps total.`);
        apps.forEach(a => console.log(` - ID: ${a._id || a.id} | Status: ${a.status}`));

        // Find match case-insensitive
        const targetApp = apps.find(a =>
            (a.status && a.status.toLowerCase() === 'submitted') ||
            (a.currentStatus && a.currentStatus.toLowerCase() === 'submitted')
        );

        if (!targetApp) {
            console.warn('⚠️ No submitted applications found for review.');
            return;
        }

        const appId = targetApp._id || targetApp.id;
        console.log(`📝 Reviewing Application: ${appId}`);

        // 3. Approve Documents
        // Endpoint: PATCH /v2/officer/applications/:id/review-docs
        // Payload: { status: 'approved', comment: 'UAT Verified' }
        console.log('✅ Approving Documents...');
        const reviewRes = await fetch(`${BASE_URL}/v2/officer/applications/${appId}/review-docs`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'approved',
                comment: 'UAT Auto-Approved via Script'
            })
        });

        if (!reviewRes.ok) throw new Error(`Review failed: ${await reviewRes.text()}`);

        const result = await reviewRes.json();
        console.log('🎉 Document Review Complete!');
        console.log(`   New Status: ${result.data?.status || 'Unknown'}`);

    } catch (e) {
        console.error('❌ UAT-2 Failed:', e.message);
    }
}

runReviewerUAT();
