/**
 * k6 Spike Test - Test System Recovery
 * 
 * Sudden spike in traffic to test system resilience
 * 
 * Run:
 * k6 run load-tests/spike-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Spike test: sudden traffic surge
  stages: [
    { duration: '1m', target: 50 },     // Normal load
    { duration: '10s', target: 500 },   // SPIKE!
    { duration: '3m', target: 500 },    // Stay at spike
    { duration: '10s', target: 50 },    // Back to normal
    { duration: '2m', target: 50 },     // Recovery period
    { duration: '10s', target: 0 },     // Ramp down
  ],
  
  thresholds: {
    'http_req_duration': ['p(99)<2000'],  // Even during spike
    'http_req_failed': ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function() {
  const res = http.get(`${BASE_URL}/api/health`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}
