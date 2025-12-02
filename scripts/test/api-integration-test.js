/**
 * API Integration Test Suite
 *
 * Test all API endpoints for the new modules:
 * - AI Pre-Check
 * - Smart Router
 * - QA Verification
 *
 * Usage:
 *   # Start backend first
 *   cd apps/backend && npm run dev
 *
 *   # Then run tests
 *   node scripts/test/api-integration-test.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_KEY = process.env.TEST_API_KEY || 'test-key-12345';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test a single API endpoint
 */
async function testEndpoint(name, method, url, data = null, expectedStatus = 200) {
  try {
    print(`\n📡 Testing: ${name}`, 'yellow');
    print(`   ${method} ${url}`, 'cyan');

    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    if (data) {
      config.data = data;
      print(`   Payload: ${JSON.stringify(data)}`, 'cyan');
    }

    const response = await axios(config);

    if (response.status === expectedStatus) {
      print(`✅ ${name} - PASSED`, 'green');
      print(`   Status: ${response.status}`, 'green');
      print(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`, 'cyan');
      return { success: true, name, response: response.data };
    } else {
      print(`❌ ${name} - FAILED (unexpected status)`, 'red');
      print(`   Expected: ${expectedStatus}, Got: ${response.status}`, 'red');
      return { success: false, name, error: 'Unexpected status code' };
    }

  } catch (error) {
    print(`❌ ${name} - FAILED`, 'red');
    print(`   Error: ${error.message}`, 'red');
    if (error.response) {
      print(`   Status: ${error.response.status}`, 'red');
      print(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return { success: false, name, error: error.message };
  }
}

/**
 * AI Pre-Check Module Tests
 */
async function testAIPreCheck() {
  print('\n' + '='.repeat(60), 'cyan');
  print('🤖 AI PRE-CHECK MODULE TESTS', 'bright');
  print('='.repeat(60), 'cyan');

  const results = [];

  // Test 1: Validate Application
  results.push(await testEndpoint(
    'AI Pre-Check: Validate Application',
    'POST',
    '/api/ai-precheck/validate',
    { applicationId: 'APP-2024-001' },
    200
  ));

  // Test 2: Get AI Config
  results.push(await testEndpoint(
    'AI Pre-Check: Get Configuration',
    'GET',
    '/api/ai-precheck/config',
    null,
    200
  ));

  // Test 3: Update AI Config
  results.push(await testEndpoint(
    'AI Pre-Check: Update Configuration',
    'PUT',
    '/api/ai-precheck/config',
    {
      thresholds: {
        autoReject: 50,
        fastTrack: 90
      }
    },
    200
  ));

  // Test 4: Get Statistics
  results.push(await testEndpoint(
    'AI Pre-Check: Get Statistics',
    'GET',
    '/api/ai-precheck/statistics',
    null,
    200
  ));

  // Test 5: Validate Single Document
  results.push(await testEndpoint(
    'AI Pre-Check: Validate Document',
    'POST',
    '/api/ai-precheck/validate-document',
    {
      document: { path: '/test/doc.pdf' },
      documentType: 'nationalId'
    },
    200
  ));

  return results;
}

/**
 * Smart Router Module Tests
 */
async function testSmartRouter() {
  print('\n' + '='.repeat(60), 'cyan');
  print('🧭 SMART ROUTER MODULE TESTS', 'bright');
  print('='.repeat(60), 'cyan');

  const results = [];

  // Test 1: Route Application
  results.push(await testEndpoint(
    'Smart Router: Route Application',
    'POST',
    '/api/routing/route/APP-2024-001',
    null,
    200
  ));

  // Test 2: Get Inspector Workload
  results.push(await testEndpoint(
    'Smart Router: Get Inspector Workload',
    'GET',
    '/api/routing/inspector-workload',
    null,
    200
  ));

  // Test 3: Rebalance Workload
  results.push(await testEndpoint(
    'Smart Router: Rebalance Workload',
    'POST',
    '/api/routing/rebalance',
    null,
    200
  ));

  // Test 4: Reassign Application
  results.push(await testEndpoint(
    'Smart Router: Reassign Application',
    'PUT',
    '/api/routing/reassign/APP-2024-001',
    {
      inspectorId: 'inspector-456',
      reason: 'Better expertise match'
    },
    200
  ));

  return results;
}

/**
 * QA Verification Module Tests
 */
async function testQAVerification() {
  print('\n' + '='.repeat(60), 'cyan');
  print('✅ QA VERIFICATION MODULE TESTS', 'bright');
  print('='.repeat(60), 'cyan');

  const results = [];

  // Test 1: Get Sampling Queue
  results.push(await testEndpoint(
    'QA Verification: Get Sampling Queue',
    'GET',
    '/api/qa/sampling-queue',
    null,
    200
  ));

  // Test 2: Get Application for QA
  results.push(await testEndpoint(
    'QA Verification: Get Application',
    'GET',
    '/api/qa/application/APP-2024-001',
    null,
    200
  ));

  // Test 3: Submit QA Verification
  results.push(await testEndpoint(
    'QA Verification: Verify Application',
    'POST',
    '/api/qa/verify/APP-2024-001',
    {
      documents: { quality: 'good' },
      photos: { quality: 'good' },
      report: { clarity: 'good' },
      compliance: { decisionJustified: true },
      comments: 'All checks passed'
    },
    200
  ));

  // Test 4: Request Re-inspection
  results.push(await testEndpoint(
    'QA Verification: Request Re-inspection',
    'POST',
    '/api/qa/request-reinspection/APP-2024-001',
    {
      reason: 'Missing required photos',
      severity: 'HIGH'
    },
    200
  ));

  // Test 5: Get QA Statistics
  results.push(await testEndpoint(
    'QA Verification: Get Statistics',
    'GET',
    '/api/qa/statistics',
    null,
    200
  ));

  // Test 6: Get Verifier Performance
  results.push(await testEndpoint(
    'QA Verification: Get Verifier Performance',
    'GET',
    '/api/qa/verifier-performance',
    null,
    200
  ));

  return results;
}

/**
 * Test backend health
 */
async function testHealth() {
  try {
    print('\n📡 Checking backend health...', 'yellow');
    const response = await axios.get(`${BASE_URL}/health`);
    print('✅ Backend is healthy', 'green');
    return true;
  } catch (error) {
    print('❌ Backend is not responding', 'red');
    print(`   Error: ${error.message}`, 'red');
    print('\n💡 Make sure backend is running:', 'yellow');
    print('   cd apps/backend && npm run dev', 'cyan');
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  print('\n╔════════════════════════════════════════════════════════╗', 'bright');
  print('║          API INTEGRATION TEST SUITE                    ║', 'bright');
  print('╚════════════════════════════════════════════════════════╝', 'bright');

  print(`\n🔗 Base URL: ${BASE_URL}`, 'cyan');

  const startTime = Date.now();

  // Check backend health first
  const isHealthy = await testHealth();
  if (!isHealthy) {
    print('\n❌ Cannot proceed with tests - backend is not running', 'red');
    process.exit(1);
  }

  // Run all test suites
  const allResults = [];

  // AI Pre-Check tests
  const aiPreCheckResults = await testAIPreCheck();
  allResults.push(...aiPreCheckResults);

  // Smart Router tests
  const smartRouterResults = await testSmartRouter();
  allResults.push(...smartRouterResults);

  // QA Verification tests
  const qaVerificationResults = await testQAVerification();
  allResults.push(...qaVerificationResults);

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  print('\n' + '='.repeat(60), 'cyan');
  print('TEST SUMMARY', 'bright');
  print('='.repeat(60), 'cyan');

  const passed = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  const total = allResults.length;

  print(`\n📊 Results:`, 'bright');
  print(`   Total: ${total}`, 'cyan');
  print(`   ✅ Passed: ${passed}`, 'green');
  print(`   ❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  print(`   ⏱️  Duration: ${duration}s`, 'cyan');

  if (failed > 0) {
    print('\n❌ FAILED TESTS:', 'red');
    allResults.filter(r => !r.success).forEach(r => {
      print(`   - ${r.name}: ${r.error}`, 'red');
    });
  }

  // Module breakdown
  print('\n📦 By Module:', 'bright');
  const aiPreCheckPassed = aiPreCheckResults.filter(r => r.success).length;
  const smartRouterPassed = smartRouterResults.filter(r => r.success).length;
  const qaPassed = qaVerificationResults.filter(r => r.success).length;

  print(`   🤖 AI Pre-Check: ${aiPreCheckPassed}/${aiPreCheckResults.length}`,
        aiPreCheckPassed === aiPreCheckResults.length ? 'green' : 'yellow');
  print(`   🧭 Smart Router: ${smartRouterPassed}/${smartRouterResults.length}`,
        smartRouterPassed === smartRouterResults.length ? 'green' : 'yellow');
  print(`   ✅ QA Verification: ${qaPassed}/${qaVerificationResults.length}`,
        qaPassed === qaVerificationResults.length ? 'green' : 'yellow');

  if (failed === 0) {
    print('\n✅ ALL TESTS PASSED!', 'green');
    process.exit(0);
  } else {
    print('\n❌ SOME TESTS FAILED', 'red');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testAIPreCheck, testSmartRouter, testQAVerification };
