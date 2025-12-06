// Configuration
const PORTS = [5000, 3000];

// Credentials from seed-v2-dev.js
const SEEDED_FARMER = {
    email: 'farmer@gacp.com',
    password: 'password123'
};

// Utils
const log = (step, msg, data) => {
    console.log(`\n[${step}] ${msg}`);
    if (data) console.log(JSON.stringify(data, null, 2));
};

async function checkPort(port) {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 1000);
        const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: controller.signal });
        return res.ok;
    } catch {
        return false;
    }
}

async function findActiveBaseUrl() {
    for (const port of PORTS) {
        log('SETUP', `Checking port ${port}...`);
        if (await checkPort(port)) {
            log('SETUP', `✅ Found active server on port ${port}`);
            return `http://127.0.0.1:${port}`;
        }
    }
    throw new Error('Could not find active server on ports ' + PORTS.join(', '));
}

// Helper to replace axios
async function post(endpoint, body, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });

    return handleResponse(response);
}

async function get(endpoint, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers
    });

    return handleResponse(response);
}

async function handleResponse(response) {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got ${contentType}: ${text.substring(0, 100)}...`);
    }

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || response.statusText);
        error.response = { status: response.status, data };
        throw error;
    }

    return { data };
}

async function runSimulation() {
    try {
        const BASE_URL = await findActiveBaseUrl();
        const AUTH_URL = `${BASE_URL}/api/auth-farmer`;
        const API_V2_URL = `${BASE_URL}/api/v2`;

        log('SETUP', 'Starting Mobile User Journey Simulation (Seeded User Flow)...');

        // 1. Login (Skip Register)
        log('STEP 1', 'Logging in as Seeded Farmer...');
        const loginRes = await post(`${AUTH_URL}/login`, {
            email: SEEDED_FARMER.email,
            password: SEEDED_FARMER.password
        });
        const token = loginRes.data.token || loginRes.data.data.token;
        if (!token) throw new Error('No token received');
        const userId = loginRes.data.user?.id || loginRes.data.data?.user?.id;
        log('STEP 1', '✅ Login Successful', { userId: userId });

        // 2. Get Establishments
        log('STEP 2', 'Fetching Establishments...');
        const establishRes = await get(`${API_V2_URL}/establishments`, token);
        const establishments = establishRes.data.data;

        if (!establishments || establishments.length === 0) {
            throw new Error('No establishments found for seeded user. Please check seed script.');
        }

        const targetEstablishment = establishments[0];
        log('STEP 2', '✅ Found Establishment', { id: targetEstablishment.id, name: targetEstablishment.name });

        // 3. Create Application
        log('STEP 3', 'Creating Application...');

        // Schema Requirement: street, district, province, postalCode
        const validAddress = {
            street: targetEstablishment.address?.street || '999 Cloud Avenue',
            district: targetEstablishment.address?.district || 'Mae Rim',
            province: targetEstablishment.address?.province || 'Chiang Mai',
            postalCode: targetEstablishment.address?.zipCode || '50000',
            country: 'Thailand'
        };

        // Schema Requirement: latitude, longitude (not lat, lng)
        const validCoordinates = {
            latitude: targetEstablishment.coordinates?.lat || targetEstablishment.coordinates?.latitude || 18.9083,
            longitude: targetEstablishment.coordinates?.lng || targetEstablishment.coordinates?.longitude || 98.9182
        };

        const applicationPayload = {
            type: 'NEW',
            formType: 'FORM_09',
            applicantType: 'individual',
            establishmentId: targetEstablishment.id,
            farmInformation: {
                name: targetEstablishment.name,
                owner: 'Kasem Farmer',
                address: validAddress,
                coordinates: validCoordinates,
                area: { total: 10, cultivated: 8, unit: 'rai' },
                farmType: 'ORGANIC',
                waterSource: 'well',
                soilType: 'loamy',
            },
            cropInformation: [{
                name: 'Cannabis Sativa',
                variety: 'Charlotte Web',
                source: 'Imported',
                plantingDate: '2025-01-01',
                harvestDate: '2025-04-01'
            }],
            // Required Documents for Submission (Full Mongoose Schema Compliance)
            documents: [
                {
                    id: 'DOC-MOCK-001',
                    type: 'application_form',
                    fileName: 'form.pdf',
                    originalName: 'form.pdf',
                    mimeType: 'application/pdf',
                    size: 1024,
                    uploadPath: '/uploads/mock/form.pdf',
                    uploadedBy: userId,
                    verified: false
                },
                {
                    id: 'DOC-MOCK-002',
                    type: 'farm_management_plan',
                    fileName: 'plan.pdf',
                    originalName: 'plan.pdf',
                    mimeType: 'application/pdf',
                    size: 1024,
                    uploadPath: '/uploads/mock/plan.pdf',
                    uploadedBy: userId,
                    verified: false
                },
                {
                    id: 'DOC-MOCK-003',
                    type: 'cultivation_records',
                    fileName: 'records.pdf',
                    originalName: 'records.pdf',
                    mimeType: 'application/pdf',
                    size: 1024,
                    uploadPath: '/uploads/mock/records.pdf',
                    uploadedBy: userId,
                    verified: false
                },
                {
                    id: 'DOC-MOCK-004',
                    type: 'land_rights_certificate',
                    fileName: 'cert.pdf',
                    originalName: 'cert.pdf',
                    mimeType: 'application/pdf',
                    size: 1024,
                    uploadPath: '/uploads/mock/cert.pdf',
                    uploadedBy: userId,
                    verified: false
                }
            ],
            farmerId: userId
        };

        let applicationId;
        try {
            const createRes = await post(`${API_V2_URL}/applications`, applicationPayload, token);
            applicationId = createRes.data.data._id || createRes.data.data.applicationId || createRes.data.data.id;
            log('STEP 3', '✅ Application Created', { applicationId });
        } catch (e) {
            if (e.response && (e.response.status === 400 || e.response.status === 409) && JSON.stringify(e.response.data).includes('active application')) {
                log('STEP 3', '⚠️ Active Application exists. Fetching existing application...');
                // FIXED URL: /my-applications
                const listRes = await get(`${API_V2_URL}/my-applications`, token);
                const apps = listRes.data.data || listRes.data;
                if (apps && apps.length > 0) {
                    applicationId = apps[0]._id || apps[0].id;
                    log('STEP 3', '✅ Found Existing Application', { applicationId, status: apps[0].status });
                } else {
                    throw new Error('Could not find the conflict application in the list. Is it assigned to another user?');
                }
            } else {
                throw e;
            }
        }

        if (!applicationId) throw new Error(`Failed to get Application ID`);

        // 3.5 Payment Phase 1
        log('STEP 3.5', 'Processing Phase 1 Payment...');
        try {
            await post(`${API_V2_URL}/payments`, {
                applicationId,
                phase: 'phase1',
                amount: 5000
            }, token);
            log('STEP 3.5', '✅ Payment Successful');
        } catch (e) {
            // If payment already made, it might error or succeed. 
            log('STEP 3.5', 'Payment status check / processed: ' + (e.message || 'OK'));
        }

        // 4. Submit
        log('STEP 4', 'Submitting Application...');
        try {
            await post(`${API_V2_URL}/applications/${applicationId}/submit`, {}, token);
            log('STEP 4', '✅ Application Submitted Successfully');
        } catch (e) {
            if (e.response && e.response.status === 400 && JSON.stringify(e.response.data).includes('transition')) {
                log('STEP 4', '⚠️ Application likely already submitted (Invalid Transition). Checking status...');
            } else {
                throw e;
            }
        }

        log('INFO', 'Officer Assignment should have triggered automatically.');

        log('SUCCESS', 'Simulation Complete!');
        console.log('\n---------------------------------------------------');
        console.log(`🔎 Please check the Admin Dashboard now.`);
        console.log(`🔗 URL: http://localhost:3000/admin/applications/review`);
        console.log(`📝 Look for Application ID: ${applicationId}`);
        console.log(`📍 Farm Name: ${targetEstablishment.name}`);
        console.log('---------------------------------------------------\n');

    } catch (error) {
        if (error.response) {
            log('FAILED', `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            log('FAILED', `Script Error: ${error.message}`);
        }
    }
}

runSimulation();
