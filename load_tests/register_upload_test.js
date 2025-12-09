import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import exec from 'k6/execution';

/**
 * GACP "All-Hands" Registration Stress Test
 * Scenario: 1,000 Concurrent Users Registering + Uploading ID Card
 * Target: http://localhost:3000/api/auth-farmer/register
 *
 * Commander: Senior Performance Engineer
 */

export const options = {
    stages: [
        { duration: '1m', target: 1000 }, // Ramp up to 1000 users over 1 minute
        { duration: '2m', target: 1000 }, // Hold load for 2 minutes
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests < 2000ms (accounting for upload)
        http_req_failed: ['rate<0.01'],    // Error rate < 1%
    },
};

// Load file once at startup
const binFile = open('./test_id_card.jpg', 'b');

// Helper: Generate a valid Thai ID Checksum
function generateThaiID() {
    let id = '';
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = Math.floor(Math.random() * 10);
        id += digit;
        sum += digit * (13 - i);
    }
    const check = (11 - (sum % 11)) % 10;
    return id + check;
}

export default function () {
    const vu = exec.vu.idInTest;
    const iter = exec.vu.iterationInScenario;
    const uniqueId = \`\${vu}_\${iter}_\${Date.now()}\`;

  // 1. Generate Dynamic User Data
  const idCard = generateThaiID();
  const laserCode = 'ME4' + randomString(10, '0123456789'); // Matches ^[A-Z]{2}[0-9]{10}$
  const email = \`stress_\${uniqueId}@test.com\`;
  const password = 'password123';
  const firstName = \`Stress_\${vu}\`;
  const lastName = \`User_\${iter}\`;
  const phoneNumber = '08' + randomString(8, '0123456789');

  // 2. Prepare Payload (Multipart)
  const data = {
    email: email,
    password: password,
    firstName: firstName,
    lastName: lastName,
    phoneNumber: phoneNumber,
    idCard: idCard, // Must be unique and valid checksum
    laserCode: laserCode,
    farmerType: 'INDIVIDUAL',
    idCardImage: http.file(binFile, 'test_id_card.jpg', 'image/jpeg'),
  };

  // 3. Execute Request
  // Target corrected to actual backend V2 mount point (/api/auth-farmer handles V2 logic)
  const res = http.post('http://localhost:3000/api/auth-farmer/register', data);

  // 4. Verification
  check(res, {
    'is created (201)': (r) => r.status === 201,
  });

  // Short sleep to prevent instant flooding if response is very fast
  sleep(1);
}
