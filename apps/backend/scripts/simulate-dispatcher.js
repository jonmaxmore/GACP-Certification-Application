const fetch = require('node-fetch');
const BASE_URL = 'http://127.0.0.1:5000/api';

const ADMIN_CREDS = {
    email: 'admin@gacp.com',
    password: 'password123'
};

const OFFICER_EMAIL = 'inspector@gacp.com'; // From seed-auditor.js

async function runDispatcherUAT() {
    try {
        console.log('[UAT-3] Dispatcher Journey Starting...');

        // 1. Logic
        console.log('🔑 Logging in as Dispatcher (Admin)...');
        let loginRes = await fetch(`${BASE_URL}/auth-farmer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ADMIN_CREDS)
        });
        if (!loginRes.ok) {
            loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ADMIN_CREDS)
            });
        }

        if (!loginRes.ok) throw new Error('Login failed');
        const loginData = await loginRes.json();
        const token = loginData.token || loginData.data?.token;

        // 2. Fetch Inspection Queue (Debug Mode)
        console.log('📋 Fetching ALL Applications...');
        const listRes = await fetch(`${BASE_URL}/v2/applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        const apps = listData.data.applications || listData.data;

        console.log(`Found ${apps.length} total apps.`);
        apps.forEach(a => console.log(` - ID: ${a._id || a.id} | Status: ${a.status}`));

        const targetApp = apps.find(a =>
            (a.status && a.status.toLowerCase() === 'inspection_scheduled') ||
            (a.currentStatus && a.currentStatus.toLowerCase() === 'inspection_scheduled')
        );

        if (!targetApp) {
            console.warn('⚠️ No applications ready for dispatch.');
            return;
        }

        console.log(`📝 managing Application: ${targetApp._id || targetApp.id}`);

        let assignedId = targetApp.assignedOfficer ||
            (targetApp.inspection && targetApp.inspection.inspectorId) ||
            (typeof targetApp.inspection === 'string' ? targetApp.inspection : null);

        console.log('   Current Assignment:', assignedId || 'Unassigned');

        if (assignedId) {
            console.log('✅ Officer ALREADY Assigned (Auto-Dispatch successful).');
            return;
        }

        // 3. Manual Assignment (If needed)
        console.log('⚠️ Manual Assignment Required. Fetching Auditors...');

        const auditorRes = await fetch(`${BASE_URL}/v2/officer/auditors`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!auditorRes.ok) throw new Error(`Fetch Auditors Failed: ${await auditorRes.text()}`);

        const auditorData = await auditorRes.json();
        const auditors = auditorData.data || [];

        if (!auditors || auditors.length === 0) throw new Error('No auditors found in system (Check seed-auditor.js).');

        const officer = auditors.find(a => a.email === OFFICER_EMAIL) || auditors[0];

        if (!officer) throw new Error('Officer/Auditor not found in system.');

        console.log(`✅ Assigning Officer: ${officer.firstName} (${officer.id})`);

        // FIX: Removed extra /api
        const assignRes = await fetch(`${BASE_URL}/v2/officer/applications/${targetApp._id || targetApp.id}/assign-auditor`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ auditorId: officer.id || officer._id })
        });

        if (!assignRes.ok) throw new Error(`Assignment failed: ${await assignRes.text()}`);
        console.log('🎉 Dispatch Complete (Officer Assigned)!');

    } catch (e) {
        console.error('❌ UAT-3 Failed:', e.message);
    }
}

runDispatcherUAT();
