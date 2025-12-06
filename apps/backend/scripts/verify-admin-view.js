
const BASE_URL = 'http://127.0.0.1:5000/api'; // ipv4 to be safe 
const ADMIN_CREDS = {
    email: 'admin@gacp.com',
    password: 'password123'
};

async function verifyAdminDashboard() {
    try {
        console.log('🔍 verifying Admin Dashboard Data...');

        // 1. Login as Admin
        // The project seems to use /api/auth-farmer/login for all users based on previous context, 
        // OR /api/auth/login. Let's try auth-farmer first as the User model is consistent.
        console.log('🔑 Logging in as Admin...');
        let loginRes = await fetch(`${BASE_URL}/auth-farmer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ADMIN_CREDS)
        });

        if (!loginRes.ok) {
            console.log('   (Trying fallback /auth/login...)');
            loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ADMIN_CREDS)
            });
        }

        if (!loginRes.ok) {
            const text = await loginRes.text();
            throw new Error(`Login Failed: ${text}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token || (loginData.data && loginData.data.token);

        if (!token) throw new Error('No token received');
        console.log('✅ Admin Logged In');

        // 2. Fetch All Applications (Dashboard View)
        console.log('📋 Fetching ALL Applications...');
        const appsRes = await fetch(`${BASE_URL}/v2/applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!appsRes.ok) throw new Error(`Fetch Failed: ${await appsRes.text()}`);

        const appsResult = await appsRes.json();
        const apps = appsResult.data.applications || appsResult.data;

        console.log(`✅ Retrieved ${apps.length} Total Applications`);

        apps.forEach(app => {
            console.log(`   - ID: ${app._id || app.id} | Status: ${app.currentStatus || app.status} | Farmer: ${app.farmerEmail}`);
        });

        if (apps.length > 0) {
            console.log('📝 Latest Application details:');
            // Assuming sorted by new
            const latest = apps[0];
            console.log(`   - ID: ${latest._id || latest.id}`);
            console.log(`   - Farm: ${latest.farm?.name || latest.farmInformation?.name}`);
            console.log(`   - Status: ${latest.currentStatus || latest.status}`);
            console.log(`   - Submitted By: ${latest.farmerEmail}`);
        } else {
            console.warn('⚠️ No submitted applications found. Did the simulation run?');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
    }
}

verifyAdminDashboard();
