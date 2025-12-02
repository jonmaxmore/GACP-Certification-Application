/**
 * Integration Test
 * Tests complete workflow: Crypto Service + Mongoose Models + MongoDB
 * End-to-end testing of digital signature traceability system
 */

const mongoose = require('mongoose');
const CryptoService = require('../services/crypto-utils');
const Record = require('../models/Record');
const AuditLog = require('../models/AuditLog');
const SignatureStore = require('../models/SignatureStore');

const MONGODB_URI =
  process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/botanical-audit-test';

describe('Integration Tests - Full System', () => {
  let cryptoService;
  let testFarmId;
  let testUserId;

  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Initialize crypto service
    cryptoService = CryptoService;
    await cryptoService.initialize();
    console.log('✓ Initialized Crypto Service');

    // Setup test data
    testFarmId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
  }, 60000);

  afterAll(async () => {
    // Cleanup
    await Record.deleteMany({ 'data.test': true });
    await AuditLog.deleteMany({ 'metadata.test': true });

    await mongoose.connection.close();
    console.log('✓ Cleaned up and disconnected');
  }, 30000);

  describe('End-to-End Record Creation with Digital Signature', () => {
    let genesisRecord;
    let secondRecord;

    test('should create genesis record (first record in chain)', async () => {
      // Step 1: Prepare record data
      const recordData = {
        id: `record-${Date.now()}-1`,
        type: 'PLANTING',
        data: {
          plant: 'Cannabis Sativa',
          strain: 'OG Kush',
          quantity: 100,
          location: 'Field A',
          test: true,
        },
        timestamp: new Date().toISOString(),
        userId: testUserId.toString(),
      };

      // Step 2: Sign record with crypto service
      const signedRecord = await cryptoService.signRecord(recordData, null, false);

      expect(signedRecord).toBeDefined();
      expect(signedRecord.hash).toBeDefined();
      expect(signedRecord.hash).toHaveLength(64); // SHA-256 hash
      expect(signedRecord.signature).toBeDefined();
      expect(signedRecord.previousHash).toBe('0'.repeat(64)); // Genesis

      console.log('✓ Signed genesis record');
      console.log(`  Hash: ${signedRecord.hash.substring(0, 16)}...`);
      console.log(`  Signature: ${signedRecord.signature.substring(0, 32)}...`);

      // Step 3: Save to MongoDB
      const record = await Record.create({
        recordId: signedRecord.id,
        type: signedRecord.type,
        farmId: testFarmId,
        data: signedRecord.data,
        hash: signedRecord.hash,
        signature: signedRecord.signature,
        previousHash: signedRecord.previousHash,
        userId: testUserId,
        verified: false,
      });

      expect(record).toBeDefined();
      expect(record._id).toBeDefined();
      genesisRecord = record;

      console.log('✓ Saved genesis record to MongoDB');

      // Step 4: Create audit log
      await AuditLog.logCreate('records', record._id.toString(), testUserId, record.toObject(), {
        test: true,
        ip: '127.0.0.1',
      });

      console.log('✓ Created audit log entry');
    }, 30000);

    test('should verify genesis record signature', async () => {
      // Load record from MongoDB
      const record = await Record.findById(genesisRecord._id);

      // Verify signature using crypto service
      const verification = await cryptoService.verifyRecord(record.toObject(), null);

      expect(verification.valid).toBe(true);
      expect(verification.signature.valid).toBe(true);
      expect(verification.signature.hash.valid).toBe(true);
      expect(verification.signature.signature.valid).toBe(true);

      console.log('✓ Genesis record signature verified');

      // Mark as verified in MongoDB
      record.verified = true;
      await record.save();

      console.log('✓ Updated verified status in MongoDB');
    }, 30000);

    test('should create second record linked to first (chain)', async () => {
      // Step 1: Prepare second record
      const recordData = {
        id: `record-${Date.now()}-2`,
        type: 'WATERING',
        data: {
          amount: '5L',
          method: 'drip irrigation',
          test: true,
        },
        timestamp: new Date().toISOString(),
        userId: testUserId.toString(),
      };

      // Step 2: Sign with previous hash (create chain)
      const signedRecord = await cryptoService.signRecord(
        recordData,
        genesisRecord.hash, // Link to previous
        false,
      );

      expect(signedRecord.previousHash).toBe(genesisRecord.hash);

      console.log('✓ Signed second record');
      console.log(`  Previous Hash: ${signedRecord.previousHash.substring(0, 16)}...`);
      console.log(`  Current Hash: ${signedRecord.hash.substring(0, 16)}...`);

      // Step 3: Save to MongoDB
      const record = await Record.create({
        recordId: signedRecord.id,
        type: signedRecord.type,
        farmId: testFarmId,
        data: signedRecord.data,
        hash: signedRecord.hash,
        signature: signedRecord.signature,
        previousHash: signedRecord.previousHash,
        userId: testUserId,
        verified: false,
      });

      secondRecord = record;
      console.log('✓ Saved second record to MongoDB');

      // Step 4: Create audit log
      await AuditLog.logCreate('records', record._id.toString(), testUserId, record.toObject(), {
        test: true,
        ip: '127.0.0.1',
      });
    }, 30000);

    test('should verify complete chain (genesis + second)', async () => {
      // Load both records
      const records = await Record.find({
        _id: { $in: [genesisRecord._id, secondRecord._id] },
      }).sort({ createdAt: 1 });

      expect(records.length).toBe(2);

      // Verify chain using crypto service
      const recordObjects = records.map(r => r.toObject());
      const chainVerification = await cryptoService.verifyRecordChain(recordObjects);

      expect(chainVerification.valid).toBe(true);
      expect(chainVerification.totalRecords).toBe(2);
      expect(chainVerification.validRecords).toBe(2);
      expect(chainVerification.invalidRecords).toBe(0);

      console.log('✓ Complete chain verified');
      console.log(`  Total records: ${chainVerification.totalRecords}`);
      console.log(`  Valid records: ${chainVerification.validRecords}`);
      console.log(`  Chain integrity: ${chainVerification.chainIntegrity ? '✓' : '✗'}`);

      // Mark all as verified
      await Record.updateMany(
        { _id: { $in: [genesisRecord._id, secondRecord._id] } },
        { verified: true },
      );
    }, 30000);

    test('should detect tampered record in chain', async () => {
      // Load second record
      const record = await Record.findById(secondRecord._id);

      // Tamper with data
      const tamperedRecord = record.toObject();
      tamperedRecord.data.amount = '10L'; // Changed from 5L

      // Try to verify tampered record
      const verification = await cryptoService.verifyRecord(tamperedRecord, genesisRecord.hash);

      expect(verification.valid).toBe(false);
      expect(verification.signature.hash.valid).toBe(false);

      console.log('✓ Tampered record detected');
      console.log('  Hash validation: FAILED (as expected)');
    }, 30000);
  });

  describe('Batch Operations Integration', () => {
    test('should create and verify batch of 10 records', async () => {
      const batchSize = 10;
      const records = [];

      // Prepare batch data
      for (let i = 0; i < batchSize; i++) {
        records.push({
          id: `batch-${Date.now()}-${i}`,
          type: i % 2 === 0 ? 'FERTILIZING' : 'WATERING',
          data: {
            batch: i,
            test: true,
          },
          timestamp: new Date().toISOString(),
          userId: testUserId.toString(),
        });
      }

      // Sign batch with crypto service
      const startTime = Date.now();
      const signedRecords = await cryptoService.signRecordsBatch(records, false);
      const signingDuration = Date.now() - startTime;

      expect(signedRecords.length).toBe(batchSize);
      console.log(
        `✓ Signed ${batchSize} records in ${signingDuration}ms (${(signingDuration / batchSize).toFixed(2)}ms/record)`,
      );

      // Save to MongoDB
      const mongoRecords = signedRecords.map(sr => ({
        recordId: sr.id,
        type: sr.type,
        farmId: testFarmId,
        data: sr.data,
        hash: sr.hash,
        signature: sr.signature,
        previousHash: sr.previousHash,
        userId: testUserId,
        verified: false,
      }));

      await Record.insertMany(mongoRecords);
      console.log(`✓ Saved ${batchSize} records to MongoDB`);

      // Verify chain
      const verification = await cryptoService.verifyRecordChain(signedRecords);
      expect(verification.valid).toBe(true);
      expect(verification.validRecords).toBe(batchSize);

      console.log('✓ Batch chain verified');
    }, 60000);
  });

  describe('Audit Trail Integration', () => {
    test('should track complete audit trail for record lifecycle', async () => {
      // Create record
      const recordData = {
        id: `audit-test-${Date.now()}`,
        type: 'HARVESTING',
        data: {
          quantity: 50,
          quality: 'A',
          test: true,
        },
        timestamp: new Date().toISOString(),
        userId: testUserId.toString(),
      };

      const signedRecord = await cryptoService.signRecord(recordData, null, false);

      const record = await Record.create({
        recordId: signedRecord.id,
        type: signedRecord.type,
        farmId: testFarmId,
        data: signedRecord.data,
        hash: signedRecord.hash,
        signature: signedRecord.signature,
        previousHash: signedRecord.previousHash,
        userId: testUserId,
      });

      // Log CREATE
      await AuditLog.logCreate('records', record._id.toString(), testUserId, record.toObject(), {
        test: true,
        action: 'integration-test',
      });

      // Update record
      const oldData = record.toObject();
      record.data.quantity = 60;
      await record.save();

      // Log UPDATE
      await AuditLog.logUpdate(
        'records',
        record._id.toString(),
        testUserId,
        oldData,
        record.toObject(),
        { test: true, action: 'integration-test' },
      );

      // Get audit trail
      const auditTrail = await AuditLog.getDocumentHistory('records', record._id.toString());

      expect(auditTrail.length).toBeGreaterThanOrEqual(2);
      expect(auditTrail.some(log => log.action === 'CREATE')).toBe(true);
      expect(auditTrail.some(log => log.action === 'UPDATE')).toBe(true);

      console.log('✓ Complete audit trail tracked');
      console.log(`  Total audit entries: ${auditTrail.length}`);
      auditTrail.forEach(log => {
        console.log(`  - ${log.action} at ${log.timestamp.toISOString()}`);
      });
    }, 30000);
  });

  describe('Key Rotation Integration', () => {
    test('should store public key in SignatureStore', async () => {
      const publicKey = await cryptoService.getPublicKey();

      expect(publicKey).toBeDefined();
      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');

      // Check if key is already in store
      let keyStore = await SignatureStore.findOne({ status: 'ACTIVE' });

      if (!keyStore) {
        // Store public key
        keyStore = await SignatureStore.create({
          version: 1,
          publicKey: publicKey,
          algorithm: 'RSA-SHA256',
          keySize: 2048,
          keySource: 'local',
          status: 'ACTIVE',
          validFrom: new Date(),
        });

        console.log('✓ Stored public key in SignatureStore');
      } else {
        console.log('✓ Public key already in SignatureStore');
      }

      expect(keyStore.version).toBeDefined();
      expect(keyStore.status).toBe('ACTIVE');
    }, 30000);

    test('should retrieve active public key from store', async () => {
      const activeKey = await SignatureStore.findOne({ status: 'ACTIVE' });

      expect(activeKey).toBeDefined();
      expect(activeKey.publicKey).toContain('-----BEGIN PUBLIC KEY-----');

      console.log('✓ Retrieved active public key');
      console.log(`  Version: ${activeKey.version}`);
      console.log(`  Algorithm: ${activeKey.algorithm}`);
      console.log(`  Key Size: ${activeKey.keySize}`);
    }, 30000);
  });

  describe('Performance Integration Test', () => {
    test('should handle end-to-end workflow for 100 records efficiently', async () => {
      const recordCount = 100;
      const startTime = Date.now();

      // Step 1: Generate records
      const records = [];
      for (let i = 0; i < recordCount; i++) {
        records.push({
          id: `perf-test-${Date.now()}-${i}`,
          type: 'WATERING',
          data: {
            amount: '5L',
            test: true,
            performanceTest: true,
          },
          timestamp: new Date().toISOString(),
          userId: testUserId.toString(),
        });
      }
      const generateTime = Date.now() - startTime;

      // Step 2: Sign batch
      const signStartTime = Date.now();
      const signedRecords = await cryptoService.signRecordsBatch(records, false);
      const signTime = Date.now() - signStartTime;

      // Step 3: Save to MongoDB
      const saveStartTime = Date.now();
      const mongoRecords = signedRecords.map(sr => ({
        recordId: sr.id,
        type: sr.type,
        farmId: testFarmId,
        data: sr.data,
        hash: sr.hash,
        signature: sr.signature,
        previousHash: sr.previousHash,
        userId: testUserId,
      }));
      await Record.insertMany(mongoRecords);
      const saveTime = Date.now() - saveStartTime;

      // Step 4: Verify chain
      const verifyStartTime = Date.now();
      const verification = await cryptoService.verifyRecordChain(signedRecords);
      const verifyTime = Date.now() - verifyStartTime;

      const totalTime = Date.now() - startTime;

      expect(verification.valid).toBe(true);

      console.log('\n✓ Performance Test Results:');
      console.log(`  Records: ${recordCount}`);
      console.log(
        `  Generate: ${generateTime}ms (${(generateTime / recordCount).toFixed(2)}ms/record)`,
      );
      console.log(`  Sign: ${signTime}ms (${(signTime / recordCount).toFixed(2)}ms/record)`);
      console.log(`  Save: ${saveTime}ms (${(saveTime / recordCount).toFixed(2)}ms/record)`);
      console.log(`  Verify: ${verifyTime}ms (${(verifyTime / recordCount).toFixed(2)}ms/record)`);
      console.log(`  Total: ${totalTime}ms (${(totalTime / recordCount).toFixed(2)}ms/record)`);

      // Performance assertions
      expect(signTime / recordCount).toBeLessThan(10); // < 10ms per record
      expect(saveTime / recordCount).toBeLessThan(5); // < 5ms per record
      expect(totalTime).toBeLessThan(10000); // < 10 seconds total
    }, 60000);
  });

  describe('Error Handling Integration', () => {
    test('should handle invalid record data gracefully', async () => {
      const invalidRecord = {
        recordId: 'invalid-test',
        type: 'INVALID_TYPE', // Invalid enum value
        farmId: testFarmId,
        data: {},
        hash: 'short', // Too short
        signature: 'invalid',
        previousHash: '0'.repeat(64),
        userId: testUserId,
      };

      try {
        await Record.create(invalidRecord);
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        console.log('✓ Invalid record rejected by Mongoose validation');
      }
    });

    test('should handle MongoDB connection issues', async () => {
      // Simulate connection check
      const connectionState = mongoose.connection.readyState;

      expect(connectionState).toBe(1); // 1 = connected
      console.log('✓ MongoDB connection healthy');
    });
  });

  describe('Query Performance', () => {
    test('should efficiently query records by farm', async () => {
      const startTime = Date.now();

      const records = await Record.find({
        farmId: testFarmId,
        'data.test': true,
      })
        .limit(100)
        .select('recordId type hash createdAt')
        .lean();

      const duration = Date.now() - startTime;

      console.log(`✓ Queried ${records.length} records in ${duration}ms`);
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });

    test('should efficiently query audit logs by user', async () => {
      const startTime = Date.now();

      const logs = await AuditLog.find({
        userId: testUserId,
        'metadata.test': true,
      })
        .limit(100)
        .sort({ timestamp: -1 })
        .lean();

      const duration = Date.now() - startTime;

      console.log(`✓ Queried ${logs.length} audit logs in ${duration}ms`);
      expect(duration).toBeLessThan(500); // Should complete in < 500ms
    });
  });
});
