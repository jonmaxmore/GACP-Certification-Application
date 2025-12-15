/**
 * k6 Stress Test - Find System Breaking Point
 * 
 * Gradually increases load until system fails or reaches target
 * 
 * Run:
 * k6 run load-tests/stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  // Stress test: gradually increase load
  stages: [
    { duration: '2m', target: 50 },    // Ramp to 50 users
    { duration: '3m', target: 100 },   // Ramp to 100 users
    { duration: '2m', target: 200 },   // Ramp to 200 users
    { duration: '2m', target: 300 },   // Ramp to 300 users
    { duration: '2m', target: 400 },   // Ramp to 400 users
    { duration: '2m', target: 500 },   // Ramp to 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  
  thresholds: {
    'http_req_duration': ['p(99)<3000'],  // 99% under 3s
    'http_req_failed': ['rate<0.1'],      // Error rate < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function() {
  // Test most common endpoint
  const res = http.get(`${BASE_URL}/api/health`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  responseTime.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  
  sleep(1);
}
