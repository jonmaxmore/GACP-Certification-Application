const fs = require('fs');
const path = require('path');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.STORAGE_TYPE = 'local';
process.env.STORAGE_LOCAL_PATH = './uploads';
process.env.ENABLE_QUEUE = 'false';
process.env.ENABLE_CACHE = 'false';

console.log('Attempting to require gacp-certificate service test...');

try {
  const service = require('../__tests__/services/gacp-certificate.service.test.js');
  console.log('Successfully required gacp-certificate service test');
} catch (error) {
  const errorInfo = {
    name: error.name,
    message: error.message,
    code: error.code,
    requireStack: error.requireStack,
    stack: error.stack
  };
  fs.writeFileSync('debug_error.json', JSON.stringify(errorInfo, null, 2));
  console.error('Error written to debug_error.json');
}
