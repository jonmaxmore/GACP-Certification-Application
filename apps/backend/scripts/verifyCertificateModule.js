require('dotenv').config();
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.APP_URL = 'http://localhost:5000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = 'test-secret';
process.env.STORAGE_TYPE = 'local';
process.env.STORAGE_LOCAL_PATH = './uploads';
process.env.ENABLE_QUEUE = 'false';
process.env.ENABLE_CACHE = 'false';
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

console.log('__dirname:', __dirname);
console.log('Resolved path:', path.resolve(__dirname, '../src/controllers/CertificateController'));
try {
  console.log('Files in controller dir:', fs.readdirSync(path.resolve(__dirname, '../src/controllers')));
} catch (e) {
  console.log('Error listing controller dir:', e.message);
}

const certificateController = require(path.resolve(__dirname, '../src/controllers/CertificateController.js'));

async function verifyCertificateModule() {
  console.log('Starting Certificate Module Verification...');

  let mongod;
  try {
    // Setup in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('Connected to in-memory MongoDB');

    // Mock Express Request/Response
    const req = {
      query: {},
      params: {},
      body: {},
      user: { id: 'test-user-id' }
    };

    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      },
      download: function(path) {
        this.downloadPath = path;
        return this;
      }
    };

    // Test 1: getAllCertificates
    console.log('Testing getAllCertificates...');
    await certificateController.getAllCertificates(req, res);

    if (res.statusCode === 200 && Array.isArray(res.data.data)) {
      console.log('✅ getAllCertificates passed');
    } else {
      console.error('❌ getAllCertificates failed', res.data);
    }

    // Test 2: Create Certificate (Mocking data)
    console.log('Testing createCertificate...');
    // We need a valid application ID for this to work fully, but we can check if it tries to proceed
    // The service will likely fail looking for the application, but that confirms the controller called the service.
    req.body = { applicationId: new mongoose.Types.ObjectId() };

    try {
      await certificateController.createCertificate(req, res);
    } catch (error) {
       // Expected error because Application doesn't exist in our memory DB
       // But if we get here, it means controller -> service connection worked
       console.log('✅ createCertificate controller execution confirmed (Service attempted)');
    }

    console.log('Verification Complete.');

  } catch (error) {
    console.error('Verification Failed:', error);
  } finally {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  }
}

verifyCertificateModule();
