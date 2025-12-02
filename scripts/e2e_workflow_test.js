const http = require('http');

const BASE_URL = 'http://localhost:3004/api';

// Test Data
const newFarmer = {
    email: `farmer_${Date.now()}@example.com`,
    password: 'password',
    name: 'New Farmer',
    role: 'farmer'
};
const officerCreds = { email: 'officer@dtam.go.th', password: 'password' };
const auditorCreds = { email: 'auditor@dtam.go.th', password: 'password' };

let farmerToken, officerToken, auditorToken;
let applicationId, auditorId;

function request(url, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = data ? JSON.parse(data) : {};
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsedData);
                    } else {
                        reject(new Error(parsedData.message || `Request failed with status ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${e.message}\nResponse body: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            console.error('Request error event:', e);
            reject(new Error(`Request error: ${e.message}`));
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function runTest() {
    console.log('🚀 Starting Full GACP System Verification (Register -> Certificate)...\n');

    try {
        // 0. Register New Farmer
        console.log('0️⃣  Registering New Farmer...');
        const registerRes = await request(`${BASE_URL}/auth/register`, 'POST', newFarmer);
        console.log('   ✅ Registration Successful:', registerRes.user.email);

        // 1. Login as Farmer
        console.log('\n1️⃣  Logging in as New Farmer...');
        const farmerLogin = await request(`${BASE_URL}/auth/login`, 'POST', { email: newFarmer.email, password: newFarmer.password });
        farmerToken = farmerLogin.token;
        console.log('   ✅ Farmer Logged In.');

        // 2. Create Application
        console.log('\n2️⃣  Creating New Application...');
        const appData = {
            farmInformation: {
                farmName: 'Verified E2E Farm',
                location: { province: 'Chiang Mai' }
            },
            cropInformation: { crops: [{ name: 'Cannabis' }] }
        };
        const appRes = await request(`${BASE_URL}/applications`, 'POST', appData, farmerToken);
        applicationId = appRes.data._id;
        console.log('   ✅ Application Created. ID:', applicationId);

        // 3. Login as Officer
        console.log('\n3️⃣  Logging in as Officer...');
        const officerLogin = await request(`${BASE_URL}/auth/login`, 'POST', officerCreds);
        officerToken = officerLogin.token;
        console.log('   ✅ Officer Logged In.');

        // 4. Get Unassigned Jobs
        console.log('\n4️⃣  Fetching Unassigned Jobs...');
        const unassignedRes = await request(`${BASE_URL}/job-assignment/unassigned`, 'GET', null, officerToken);
        const jobs = unassignedRes.data;
        const targetJob = jobs.find(j => j._id === applicationId || j.id === applicationId);

        if (targetJob) {
            console.log('   ✅ Found Unassigned Job:', targetJob.applicationNumber);
        } else {
            throw new Error('Job not found in unassigned list!');
        }

        // 5. Login as Auditor (to get ID)
        console.log('\n5️⃣  Logging in as Auditor...');
        const auditorLogin = await request(`${BASE_URL}/auth/login`, 'POST', auditorCreds);
        console.log('   🔍 Auditor Login Response:', JSON.stringify(auditorLogin));

        if (!auditorLogin.user) {
            throw new Error('Auditor login response missing user object');
        }

        auditorToken = auditorLogin.token;
        auditorId = auditorLogin.user.id;
        console.log('   ✅ Auditor Logged In. ID:', auditorId);

        // 6. Assign Job to Auditor
        console.log('\n6️⃣  Assigning Job to Auditor...');
        await request(`${BASE_URL}/job-assignment/assign`, 'POST', {
            applicationId: applicationId,
            auditorId: auditorId
        }, officerToken);
        console.log('   ✅ Job Assigned Successfully.');

        // 7. Auditor Checks Assignments
        console.log('\n7️⃣  Auditor Checking Assignments...');
        const myAssignmentsRes = await request(`${BASE_URL}/job-assignment/my-assignments`, 'GET', null, auditorToken);
        const myJobs = myAssignmentsRes.data;
        console.log('   🔍 My Assignments:', JSON.stringify(myJobs));
        const assignedJob = myJobs.find(j => j.applicationId === applicationId);

        if (assignedJob) {
            console.log('   ✅ Found Assigned Job:', assignedJob.applicationNumber);
        } else {
            throw new Error('Assigned job not found in auditor list!');
        }

        // 8. Accept Job
        console.log('\n8️⃣  Auditor Accepting Job...');
        await request(`${BASE_URL}/job-assignment/${applicationId}/accept`, 'POST', {}, auditorToken);
        console.log('   ✅ Job Accepted.');

        // 9. Start Job
        console.log('\n9️⃣  Auditor Starting Job...');
        await request(`${BASE_URL}/job-assignment/${applicationId}/start`, 'POST', {}, auditorToken);
        console.log('   ✅ Job Started.');

        // 10. Complete Job (Pass)
        console.log('\n🔟 Auditor Completing Job (Pass)...');
        await request(`${BASE_URL}/job-assignment/${applicationId}/complete`, 'POST', {
            result: 'pass',
            checklist: { 'item1': true },
            comments: 'Full System Verification Passed'
        }, auditorToken);
        console.log('   ✅ Job Completed.');

        // 11. Verify Certificate
        console.log('\n1️⃣1️⃣ Verifying Certificate Issuance...');
        const certRes = await request(`${BASE_URL}/certificates`, 'GET', null, farmerToken);
        const certificates = certRes.data;
        const myCert = certificates.find(c => c.applicationId === applicationId);

        if (myCert) {
            console.log('   ✅ Certificate Found!');
            console.log('      Number:', myCert.certificateNumber);
            console.log('      Status:', myCert.status);
            console.log('      Expiry:', myCert.expiryDate);
        } else {
            throw new Error('Certificate NOT found for completed application!');
        }

        console.log('\n🎉 FULL SYSTEM VERIFICATION PASSED! (Register -> Certificate)');

    } catch (error) {
        console.error('\n❌ Verification FAILED:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

runTest();
