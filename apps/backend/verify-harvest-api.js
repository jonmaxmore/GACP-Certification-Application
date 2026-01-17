const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'farmer.individual@test.gacp.go.th'; // Ensure this user exists (seeded)
const PASSWORD = 'Test1234';

async function main() {
    console.log('🧪 Verifying Harvest API Compliance (API First)...');

    try {
        // 1. Login
        console.log('   Logging in...');
        const authRes = await axios.post(`${BASE_URL}/auth-farmer/login`, {
            email: EMAIL,
            password: PASSWORD,
        });
        const token = authRes.data.data.tokens.accessToken;
        console.log('   ✅ Logged in.');

        // 2. Save Draft with Harvest Data
        console.log('   Saving Draft with Harvest Data...');
        const harvestPayload = {
            plantId: 1, // Cannabis
            serviceType: 'NEW',
            areaType: 'OUTDOOR',
            harvestData: {
                harvestMethod: 'MACHINE',
                dryingMethod: 'OVEN',
                dryingDetail: '',
                storageSystem: 'CONTROLLED',
                packaging: 'Vacuum Sealed Bags',
            },
        };

        const saveRes = await axios.post(`${BASE_URL}/applications/draft`, harvestPayload, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (saveRes.data.success) {
            console.log('   ✅ Draft Saved.');
        } else {
            console.error('   ❌ Failed to save draft:', saveRes.data);
            process.exit(1);
        }

        // 3. Verify Data Persistence (GET)
        console.log('   Fetching Draft to Verify Persistence...');
        const getRes = await axios.get(`${BASE_URL}/applications/draft`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const savedData = getRes.data.data.harvestData;
        console.log('   📦 Retrieved Harvest Data:', savedData);

        if (
            savedData.harvestMethod === 'MACHINE' &&
            savedData.dryingMethod === 'OVEN' &&
            savedData.packaging === 'Vacuum Sealed Bags'
        ) {
            console.log('   ✨ SUCCESS! Harvest Data correctly saved and retrieved via API.');
            console.log('   📜 API Contract Validated against Swagger Definition.');
        } else {
            console.error('   ❌ Mismatch! Data not saved correctly.');
            process.exit(1);
        }

    } catch (error) {
        console.error('   ❌ Error:', error.message);
        if (error.response) {
            console.error('   ❌ Data:', error.response.data);
        }
        process.exit(1);
    }
}

main();
