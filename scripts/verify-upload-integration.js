
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log('Starting Upload Flow Test...');

        // 0. Check Health
        try {
            await axios.get(`${API_URL}/health`);
            console.log('Health check passed');
        } catch (e) {
            console.error('Health check failed:', e.message);
            throw new Error('Server is not healthy or accessible');
        }

        // 1. Register
        const randomStr = Math.random().toString(36).substring(7);
        const email = `testuser_${randomStr}@example.com`;
        const password = 'password123';
        const idCard = Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');

        console.log(`Registering user: ${email}`);
        await axios.post(`${API_URL}/auth/farmer/register`, {
            email,
            password,
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0812345678',
            idCard,
            accountType: 'individual'
        });
        console.log('Registration successful');

        // 2. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/farmer/login`, {
            identifier: email,
            password
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        // 3. Upload File
        console.log('Uploading file...');
        const dummyFilePath = path.join(__dirname, 'dummy.png');
        // Create a dummy file if it doesn't exist
        fs.writeFileSync(dummyFilePath, 'dummy image content');

        const formData = new FormData();
        formData.append('file', fs.createReadStream(dummyFilePath), {
            filename: 'dummy.png',
            contentType: 'image/png'
        });

        const uploadRes = await axios.post(`${API_URL}/uploads`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        if (!uploadRes.data.success) throw new Error('Upload failed: ' + JSON.stringify(uploadRes.data));
        const fileUrl = uploadRes.data.data.url;
        console.log(`File uploaded: ${fileUrl}`);

        // 4. Submit Application Draft
        console.log('Submitting application draft...');
        const draftData = {
            plantId: 'cannabis',
            serviceType: 'NEW',
            areaType: 'OUTDOOR',
            documents: [
                {
                    id: 'doc_1',
                    uploaded: true,
                    url: fileUrl,
                    name: 'dummy.png',
                    type: 'image/png'
                }
            ]
        };

        const draftRes = await axios.post(`${API_URL}/applications/draft`, draftData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!draftRes.data.success) throw new Error('Draft submission failed');
        console.log('Draft submitted successfully');

        // 5. Verify Data
        console.log('Verifying application data...');
        // get my applications
        const myAppsRes = await axios.get(`${API_URL}/applications/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const myApp = myAppsRes.data.data[0];
        if (!myApp) throw new Error('No application found');

        // Check formData
        const storedDocs = myApp.formData.documents;
        console.log('Stored Documents:', JSON.stringify(storedDocs, null, 2));

        if (storedDocs && storedDocs.some(d => d.url === fileUrl)) {
            console.log('SUCCESS: Document URL verified in application data!');
        } else {
            console.error('FAILURE: Document URL not found in application data');
            throw new Error('Verification failed');
        }

        // Cleanup
        fs.unlinkSync(dummyFilePath);

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.code) {
            console.error('Error Code:', error.code);
        }
    }
}

runTest();
