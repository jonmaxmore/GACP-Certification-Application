/**
 * 🧪 GACP E3 Stress Test Script (k6 Compatible)
 * 
 * 100 Concurrent Users - Zero-Crash Validation
 * Tests I/O performance on new /var/www/gacp-platform structure
 * 
 * Usage: k6 run stress-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// =============================================================================
// CONFIGURATION
// =============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://47.129.167.71';
const API_BASE = `${BASE_URL}/api/v2`;

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

// Test configuration - 100 VU stages
export const options = {
    stages: [
        // Warmup
        { duration: '30s', target: 10 },

        // Ramp up
        { duration: '1m', target: 25 },
        { duration: '1m', target: 50 },

        // Peak load - 100 concurrent users
        { duration: '2m', target: 100 },

        // Sustained peak
        { duration: '3m', target: 100 },

        // Ramp down
        { duration: '30s', target: 10 },
        { duration: '30s', target: 0 },
    ],

    thresholds: {
        // 95% of requests should be below 200ms
        http_req_duration: ['p(95)<200', 'p(99)<500'],

        // Error rate should be less than 1%
        http_req_failed: ['rate<0.01'],

        // Custom error rate
        errors: ['rate<0.01'],
    },
};

// =============================================================================
// TEST DATA
// =============================================================================

// Generate valid Thai ID with checksum
function generateThaiId() {
    const prefix = Math.floor(Math.random() * 8) + 1; // 1-8
    let digits = [prefix];

    for (let i = 0; i < 11; i++) {
        digits.push(Math.floor(Math.random() * 10));
    }

    // Calculate checksum
    const weights = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += digits[i] * weights[i];
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    digits.push(checkDigit);

    return digits.join('');
}

// Generate random user data
function generateUserData() {
    const id = Math.floor(Math.random() * 100000);
    return {
        idCard: generateThaiId(),
        laserCode: `JT${id.toString().padStart(10, '0')}`,
        firstName: `TestUser${id}`,
        lastName: `Stress${id}`,
        phoneNumber: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        password: 'StressTest@123',
        accountType: 'INDIVIDUAL',
    };
}

// =============================================================================
// TEST SCENARIOS
// =============================================================================

export default function () {
    const userData = generateUserData();

    group('Health Checks', () => {
        // Frontend health
        let res = http.get(`${BASE_URL}/`);
        check(res, {
            'Frontend OK': (r) => r.status === 200,
        }) ? successfulRequests.add(1) : failedRequests.add(1);

        // Backend health
        res = http.get(`${BASE_URL}/health`);
        const healthOk = check(res, {
            'Backend Health OK': (r) => r.status === 200,
            'Backend Response Time < 100ms': (r) => r.timings.duration < 100,
        });

        errorRate.add(!healthOk);
        apiDuration.add(res.timings.duration);

        if (healthOk) successfulRequests.add(1);
        else failedRequests.add(1);
    });

    sleep(0.5);

    group('Authentication Flow', () => {
        // Registration attempt (will likely fail on duplicates - that's ok)
        const registerPayload = JSON.stringify({
            idCard: userData.idCard,
            laserCode: userData.laserCode,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            accountType: userData.accountType,
        });

        let res = http.post(`${API_BASE}/auth/register`, registerPayload, {
            headers: { 'Content-Type': 'application/json' },
        });

        apiDuration.add(res.timings.duration);

        // Login
        const loginPayload = JSON.stringify({
            identifier: userData.idCard,
            password: userData.password,
        });

        res = http.post(`${API_BASE}/auth/login`, loginPayload, {
            headers: { 'Content-Type': 'application/json' },
        });

        apiDuration.add(res.timings.duration);

        check(res, {
            'Login Response': (r) => r.status === 200 || r.status === 401,
        }) ? successfulRequests.add(1) : failedRequests.add(1);
    });

    sleep(0.5);

    group('API Endpoints', () => {
        // Health check API
        let res = http.get(`${API_BASE}/health`);
        check(res, {
            'API Health OK': (r) => r.status === 200,
        }) ? successfulRequests.add(1) : failedRequests.add(1);

        apiDuration.add(res.timings.duration);
    });

    sleep(1);
}

// =============================================================================
// LIFECYCLE HOOKS
// =============================================================================

export function setup() {
    console.log('🧪 GACP E3 Stress Test Starting...');
    console.log(`Target: ${BASE_URL}`);
    console.log('Max VUs: 100');

    // Verify target is reachable
    const res = http.get(`${BASE_URL}/health`);
    if (res.status !== 200) {
        throw new Error(`Target not reachable: ${BASE_URL}`);
    }

    return { startTime: Date.now() };
}

export function teardown(data) {
    const duration = (Date.now() - data.startTime) / 1000;
    console.log(`🏁 Test completed in ${duration.toFixed(2)}s`);
}

// =============================================================================
// CUSTOM SUMMARY
// =============================================================================

export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        test: 'GACP E3 Stress Test',
        target: BASE_URL,
        metrics: {
            total_requests: data.metrics.http_reqs.values.count,
            successful: data.metrics.successful_requests?.values?.count || 0,
            failed: data.metrics.failed_requests?.values?.count || 0,
            avg_duration_ms: data.metrics.http_req_duration.values.avg.toFixed(2),
            p95_duration_ms: data.metrics.http_req_duration.values['p(95)'].toFixed(2),
            error_rate_pct: (data.metrics.http_req_failed.values.rate * 100).toFixed(2),
        },
        thresholds_passed: Object.values(data.thresholds).every(t => t.ok),
    };

    return {
        'stress-test-results.json': JSON.stringify(summary, null, 2),
        stdout: `
🧪 GACP E3 Stress Test Results
==============================
Total Requests: ${summary.metrics.total_requests}
Error Rate: ${summary.metrics.error_rate_pct}%
Avg Response: ${summary.metrics.avg_duration_ms}ms
P95 Response: ${summary.metrics.p95_duration_ms}ms
Thresholds: ${summary.thresholds_passed ? '✅ PASSED' : '❌ FAILED'}
`,
    };
}
