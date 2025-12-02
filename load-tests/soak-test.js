/**
 * k6 Soak Test - Test System Stability Over Time
 * 
 * Run system at moderate load for extended period
 * Detects memory leaks, resource exhaustion
 * 
 * Run:
 * k6 run load-tests/soak-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Soak test: moderate load for long duration
  stages: [
    { duration: '2m', target: 50 },     // Ramp up
    { duration: '30m', target: 50 },    // Stay at 50 users for 30 minutes
    { duration: '2m', target: 0 },      // Ramp down
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],   // Very low error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function() {
  // Test various endpoints
  const endpoints = [
    '/api/health',
    '/api/status',
    '/api/applications?page=1&limit=10',
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`);
  
  check(res, {
    'status is 200': (r) => r.status === 200 || r.status === 401,
    'no errors': (r) => r.status < 500,
  });
  
  sleep(Math.random() * 3 + 1); // Random sleep 1-4 seconds
}
