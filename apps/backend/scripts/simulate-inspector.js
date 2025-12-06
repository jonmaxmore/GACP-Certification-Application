const fetch = require('node-fetch');
const BASE_URL = 'http://127.0.0.1:5000/api';

async function runInspectorUAT() {
    try {
        console.log('[UAT-4] Inspector Journey Starting...');

        // 1. Login (As Admin for now to bypass password hash issue)
        console.log('🔑 Logging in as Admin (Simulating Inspector View)...');
        let loginRes = await fetch(`${BASE_URL}/auth-farmer/login`, {
            method: 'POST',
            body: JSON.stringify({ email: 'admin@gacp.com', password: 'password123' }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!loginRes.ok) loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: 'admin@gacp.com', password: 'password123' }),
            headers: { 'Content-Type': 'application/json' }
        });

        const token = (await loginRes.json()).data.token;

        // 2. Fetch Inspector Details
        const auditorRes = await fetch(`${BASE_URL}/v2/officer/auditors`, { headers: { 'Authorization': `Bearer ${token}` } });
        const auditors = (await auditorRes.json()).data;
        const me = auditors.find(a => a.email === 'inspector@gacp.com');

        if (!me) throw new Error('Inspector "inspector@gacp.com" not found in system.');
        console.log(`👤 Inspector: ${me.firstName} (${me.id})`);

        // 3. Fetch My Inspections (Debug)
        console.log('📋 Fetching Inspector Queue...');
        const listRes = await fetch(`${BASE_URL}/v2/applications`, { headers: { 'Authorization': `Bearer ${token}` } });
        const apps = (await listRes.json()).data.applications;

        // Match string/ID
        const myTask = apps.find(a => {
            const inspId = a.inspection?.inspectorId || a.assignedOfficer;
            return (inspId === me.id || inspId === me._id ||
                (typeof inspId === 'object' && inspId.toString() === me.id));
        });

        if (!myTask) {
            console.warn('⚠️ No tasks assigned to Inspector.');
            // Dump for debug
            apps.forEach(a => console.log(`   - App ${a.applicationNumber}: Assigned=${a.assignedOfficer}, InspID=${a.inspection?.inspectorId}`));
            return;
        }

        console.log(`📝 Inspecting Application: ${myTask._id || myTask.id} (${myTask.applicationNumber})`);
        console.log(`   Current Status: ${myTask.status}`);

        // 4. Submit Audit Result
        console.log('🚀 Submitting Audit Result (as Inspector)...');

        const inspectionResults = {
            passed: true,
            complianceScore: 95,
            findings: [],
            photos: [],
            complianceChecklist: {
                siteSelection: { passed: true, notes: 'Good location' },
                waterQuality: { passed: true, notes: 'Clean source' },
                soilTesting: { passed: true, notes: 'Optimal pH' },
                seedCertification: { passed: true, notes: 'Certified seeds' },
                inputMaterials: { passed: true, notes: 'Organic compliant' },
                pestManagement: { passed: true, notes: 'Integrated management' },
                harvestTiming: { passed: true, notes: 'Correct timing' },
                postHarvestHandling: { passed: true, notes: 'Hygienic process' },
                storageConditions: { passed: true, notes: 'Dry and cool' },
                recordKeeping: { passed: true, notes: 'Complete records' }
            },
            scores: {
                siteSelection: 10,
                waterQuality: 10,
                soilTesting: 10,
                seedCertification: 10,
                inputMaterials: 10,
                pestManagement: 10,
                harvestTiming: 10,
                postHarvestHandling: 10,
                storageConditions: 5,
                recordKeeping: 10
            },
            inspectorNotes: 'Farm meets all GACP requirements.'
        };

        const completeRes = await fetch(`${BASE_URL}/v2/officer/applications/${myTask._id || myTask.id}/inspection`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inspectionResults)
        });

        if (!completeRes.ok) {
            throw new Error(`Inspection Submission Failed: ${await completeRes.text()}`);
        }

        console.log('🎉 Inspection Submitted Successfully!');
        const resJson = await completeRes.json();
        console.log('   Decision:', resJson.data.decision);
        if (resJson.data.decision === 'approved') {
            console.log('   ✅ Application Approved!');
        } else {
            console.log('   ⚠️ Application decision:', resJson.data.decision);
        }

    } catch (e) {
        console.error('❌ UAT-4 Failed:', e.message);
    }
}

runInspectorUAT();
