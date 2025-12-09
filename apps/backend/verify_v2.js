const BASE_URL = 'http://localhost:3000/api/auth-farmer';

async function runGoldenLoop() {
    console.log('🚀 Starting Golden Loop Verification (V2 System - Login Only)...');
    console.log('---------------------------------------------------');

    try {
        // SKIPPED REGISTER (Using Pre-seeded User)

        // 2. LOGIN
        console.log(`[1] Attempting Login (farmer@gacp.com)...`);
        let res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'farmer@gacp.com', password: 'password123' })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Login Failed: ${res.status} - ${JSON.stringify(err)}`);
        }

        const loginData = await res.json();
        console.log('✅ Login Success:', res.status);
        const { token, user } = loginData.data;
        console.log('   Token Recieved:', token ? 'YES (Verified)' : 'NO');

        if (!token) throw new Error('Token missing in Login Response');

        // 3. RESTORE SESSION (/me)
        console.log(`\n[2] Verifying Session (/me)...`);
        res = await fetch(`${BASE_URL}/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Session Failed: ${res.status} - ${JSON.stringify(err)}`);
        }

        const meData = await res.json();
        console.log('✅ Session Restore Success:', res.status);
        console.log(`   Hello ${meData.data.user.firstName}!`);

        console.log('---------------------------------------------------');
        console.log('🎉 GOLDEN LOOP COMPLETED - SYSTEM IS GREEN');

    } catch (error) {
        console.error('\n❌ GOLDEN LOOP FAILED');
        console.error('   Error:', error.message);
        process.exit(1);
    }
}

runGoldenLoop();
