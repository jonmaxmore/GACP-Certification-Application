import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

/**
 * GACP "All-Hands" Login Stress Test
 * Scenario: 1,000 Concurrent Users (Wave Attack)
 * Target Endpoint: http://localhost:3000/api/auth-farmer/login
 * (Serves as the main V2 Auth Endpoint for all roles in this stress test)
 * 
 * Commander: Senior Performance Engineer
 */

export const options = {
    stages: [
        { duration: '30s', target: 200 },  // Wave 1: Warm-up (Dev Team)
        { duration: '1m', target: 1000 },  // Wave 2: Peak Load (All Hands)
        { duration: '30s', target: 0 },    // Wave 3: Cool Down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% < 500ms
        http_req_failed: ['rate<0.01'],   // Error rate < 1%
    },
};

// Test Data
// NOTE: These users must exist in the DB (Seeded via seed_stress_users.js)
const USERS = {
    farmer: { email: 'farmer@gacp.com', password: 'password123', role: 'FARMER' },
    officer: { email: 'officer@gacp.com', password: 'password123', role: 'INSPECTOR' }, // Using 'INSPECTOR' for officer
    admin: { email: 'admin@gacp.com', password: 'password123', role: 'SUPER_ADMIN' },
    chaos: { email: 'chaos@gacp.com', password: 'wrongpassword' }
};

// User Agents
const AGENTS = {
    mobile: [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
    ],
    tablet: [
        'Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.77 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ],
    desktop: [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    ]
};

export default function () {
    const rand = Math.random();
    let userType, payload, userAgent;

    // 1. Distribute Roles
    if (rand < 0.6) {
        // Group A: Farmers (60%)
        userType = 'FARMER';
        payload = USERS.farmer;
        userAgent = randomItem(AGENTS.mobile);
    } else if (rand < 0.9) {
        // Group B: Officers (30%)
        userType = 'OFFICER';
        payload = USERS.officer;
        userAgent = randomItem(AGENTS.tablet);
    } else {
        // Group C: Admins (10%)
        userType = 'ADMIN';
        payload = USERS.admin;
        userAgent = randomItem(AGENTS.desktop);
    }

    // 2. Chaos Monkey (10% chance for ANY group)
    // We override the payload to be invalid
    let expectedStatus = 200;
    if (Math.random() < 0.1) {
        payload = USERS.chaos;
        expectedStatus = 401; // Expecting failure
    }

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
        },
    };

    // 3. Execute Request
    const res = http.post('http://localhost:3000/api/auth-farmer/login', JSON.stringify(payload), params);

    // 4. Verification
    check(res, {
        'status is correct': (r) => r.status === expectedStatus || (expectedStatus === 401 && r.status === 400),
    });

    if (expectedStatus === 200) {
        try {
            const body = res.json();
            check(body, {
                'has token': (b) => b.data && b.data.token !== undefined,
                'has user': (b) => b.data && b.data.user !== undefined,
                // Optional: verify role if your endpoint returns it
            });
        } catch (e) {
            // JSON parse failed
        }
    }

    // Pacing
    if (userType === 'ADMIN') {
        sleep(0.5); // Admins click faster
    } else {
        sleep(1); // Normal pacing
    }
}
