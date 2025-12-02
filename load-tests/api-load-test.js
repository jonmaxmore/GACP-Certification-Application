/**
 * k6 Load Test - API Endpoints
 * 
 * Tests API performance under various load conditions
 * 
 * Install k6:
 * Windows: choco install k6
 * Mac: brew install k6
 * Linux: sudo apt install k6
 * 
 * Run tests:
 * k6 run load-tests/api-load-test.js
 * k6 run --vus 100 --duration 60s load-tests/api-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const requestCount = new Counter('request_count');

// Test configuration
export const options = {
  // Stages: ramp up, steady, ramp down
  stages: [
    { duration: '30s', target: 10 },   // Warm up: 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '3m', target: 100 },   // Stay at 100 users
    { duration: '1m', target: 200 },   // Spike to 200 users
    { duration: '2m', target: 100 },   // Back to 100 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  
  // Thresholds - test will fail if these are not met
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    'http_req_failed': ['rate<0.05'],                 // Error rate < 5%
    'errors': ['rate<0.05'],                          // Custom error rate < 5%
    'api_response_time': ['p(95)<500'],               // API p95 < 500ms
  },
};

// Base URL - change this to your server
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test data
let authToken = '';
const testUsers = [
  { email: 'inspector1@test.com', password: 'Test1234!', role: 'inspector' },
  { email: 'approver1@test.com', password: 'Test1234!', role: 'approver' },
  { email: 'farmer1@test.com', password: 'Test1234!', role: 'farmer' },
];

/**
 * Setup function - runs once before tests
 */
export function setup() {
  console.log('🚀 Starting load test setup...');
  
  // Login as admin to get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'admin@test.com',
    password: 'Admin1234!'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (loginRes.status === 200) {
    const token = JSON.parse(loginRes.body).data.token;
    console.log('✅ Admin login successful');
    return { token };
  } else {
    console.error('❌ Admin login failed:', loginRes.status);
    return { token: null };
  }
}

/**
 * Main test function - runs for each VU iteration
 */
export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Test 1: Health Check (no auth required)
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/health`);
    
    check(res, {
      'health check status 200': (r) => r.status === 200,
      'health check response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    apiResponseTime.add(res.timings.duration);
    requestCount.add(1);
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  // Test 2: Get Applications (authenticated)
  group('Get Applications', () => {
    const res = http.get(`${BASE_URL}/api/applications?page=1&limit=10`, {
      headers,
    });
    
    check(res, {
      'applications status 200': (r) => r.status === 200,
      'applications response time < 300ms': (r) => r.timings.duration < 300,
      'applications has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true;
        } catch (e) {
          return false;
        }
      },
    });
    
    apiResponseTime.add(res.timings.duration);
    requestCount.add(1);
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  // Test 3: Get Dashboard Statistics
  group('Dashboard Statistics', () => {
    const res = http.get(`${BASE_URL}/api/dashboard/inspector`, {
      headers,
    });
    
    check(res, {
      'dashboard status 200 or 404': (r) => r.status === 200 || r.status === 404,
      'dashboard response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    apiResponseTime.add(res.timings.duration);
    requestCount.add(1);
    errorRate.add(![200, 404].includes(res.status));
  });

  sleep(1);

  // Test 4: Cache Performance (monitoring endpoint)
  if (data.token) {
    group('Cache Metrics', () => {
      const res = http.get(`${BASE_URL}/api/v1/monitoring/cache?timeWindow=realtime`, {
        headers,
      });
      
      check(res, {
        'cache metrics status 200 or 403': (r) => r.status === 200 || r.status === 403,
        'cache metrics response time < 200ms': (r) => r.timings.duration < 200,
      });
      
      apiResponseTime.add(res.timings.duration);
      requestCount.add(1);
      errorRate.add(![200, 403].includes(res.status));
    });

    sleep(1);
  }

  // Test 5: Queue Status (if admin)
  if (data.token) {
    group('Queue Metrics', () => {
      const res = http.get(`${BASE_URL}/api/v1/monitoring/queue`, {
        headers,
      });
      
      check(res, {
        'queue status 200 or 403': (r) => r.status === 200 || r.status === 403,
        'queue response time < 200ms': (r) => r.timings.duration < 200,
      });
      
      apiResponseTime.add(res.timings.duration);
      requestCount.add(1);
      errorRate.add(![200, 403].includes(res.status));
    });

    sleep(1);
  }

  // Test 6: Create Application (write operation)
  group('Create Application', () => {
    const payload = JSON.stringify({
      lotId: `TEST-${Date.now()}-${__VU}`,
      farmer: {
        name: 'Test Farmer',
        idCard: `1234567890${__VU}`,
        phone: '0812345678',
        email: `farmer${__VU}@test.com`,
        farmName: 'Test Farm',
        farmSize: 5.5,
        farmLocation: {
          address: '123 Test St',
          district: 'Test District',
          province: 'Test Province',
          postalCode: '12345',
          coordinates: { lat: 13.7563, lng: 100.5018 }
        }
      },
      inspectionType: 'INITIAL',
      products: ['Organic Vegetables'],
      certificationStandard: 'IFOAM',
      requestedDate: new Date().toISOString()
    });
    
    const res = http.post(`${BASE_URL}/api/applications`, payload, {
      headers,
    });
    
    check(res, {
      'create application status 201 or 403': (r) => [201, 400, 403].includes(r.status),
      'create application response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    
    apiResponseTime.add(res.timings.duration);
    requestCount.add(1);
    errorRate.add(![201, 400, 403].includes(res.status));
  });

  sleep(2);
}

/**
 * Teardown function - runs once after all tests
 */
export function teardown(data) {
  console.log('🏁 Load test completed');
  console.log(`📊 Total requests: ${requestCount.value}`);
}

/**
 * Handle summary - custom output
 */
export function handleSummary(data) {
  console.log('📈 Test Summary:');
  console.log(`  Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`  Failed Requests: ${data.metrics.http_req_failed.values.passes}`);
  console.log(`  Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`  P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`  P99 Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);
  
  return {
    'load-tests/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

// Helper function for text summary
function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors !== false;
  
  let summary = '\n';
  summary += `${indent}Test Results:\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  // HTTP metrics
  if (data.metrics.http_reqs) {
    summary += `${indent}HTTP Requests:\n`;
    summary += `${indent}  Total: ${data.metrics.http_reqs.values.count}\n`;
    summary += `${indent}  Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n`;
  }
  
  // Response time
  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    summary += `${indent}Response Time:\n`;
    summary += `${indent}  Avg: ${duration.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Min: ${duration.min.toFixed(2)}ms\n`;
    summary += `${indent}  Max: ${duration.max.toFixed(2)}ms\n`;
    summary += `${indent}  P95: ${duration['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}  P99: ${duration['p(99)'].toFixed(2)}ms\n`;
  }
  
  // Error rate
  if (data.metrics.http_req_failed) {
    const errorRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `${indent}Error Rate: ${errorRate}%\n`;
  }
  
  // Thresholds
  if (data.metrics.http_req_duration && data.metrics.http_req_duration.thresholds) {
    summary += `${indent}Thresholds:\n`;
    for (const [name, result] of Object.entries(data.metrics.http_req_duration.thresholds)) {
      const status = result.ok ? '✓' : '✗';
      summary += `${indent}  ${status} ${name}\n`;
    }
  }
  
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  return summary;
}
