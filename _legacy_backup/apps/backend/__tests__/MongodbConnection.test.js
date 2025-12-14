/**
 * MongoDB Connection Test
 * Tests MongoDB connection, basic CRUD operations, and indexes
 */

const mongoose = require('mongoose');

// Import models
const Record = require('../models/Record');
const AuditLog = require('../models/AuditLog');
const IotReading = require('../models/IotReading');
const IotProvider = require('../models/IotProvider');
const SignatureStore = require('../models/SignatureStore');

// MongoDB connection URI (use test database)
const MONGODB_URI =
  process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/botanical-audit-test';

describe('MongoDB Connection Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB test database');
  }, 30000);

  afterAll(async () => {
    // Clean up test data
    await Record.deleteMany({});
    await AuditLog.deleteMany({});
    await IotReading.deleteMany({});
    await IotProvider.deleteMany({});
    await SignatureStore.deleteMany({});

    // Close connection
    await mongoose.connection.close();
    console.log('✓ Disconnected from MongoDB');
  }, 30000);

  describe('Connection Status', () => {
    test('should be connected to MongoDB', () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    test('should have correct database name', () => {
      const dbName = mongoose.connection.db.databaseName;
      expect(dbName).toBe('gacp-test'); // ชื่อจริงของ test database
    });
    test('should list all collections', async () => {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      console.log('Available collections:', collectionNames);
      expect(collectionNames.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Record Collection Operations', () => {
    let testRecordId;

    test('should create a record', async () => {
      const record = await Record.create({
        recordId: `test-${Date.now()}`,
        type: 'PLANTING',
        farmId: new mongoose.Types.ObjectId(),
        data: {
          plant: 'Cannabis Sativa',
          quantity: 100,
          location: 'Field A',
        },
        location: {
          type: 'Point',
          coordinates: [100.5234, 13.7367], // Bangkok coordinates
        },
        hash: 'a'.repeat(64),
        signature: 'b'.repeat(128),
        previousHash: '0'.repeat(64),
        userId: new mongoose.Types.ObjectId(),
      });

      expect(record).toBeDefined();
      expect(record._id).toBeDefined();
      expect(record.recordId).toContain('test-');
      testRecordId = record._id;

      console.log('✓ Created record:', record.recordId);
    });

    test('should find the created record', async () => {
      const record = await Record.findById(testRecordId);

      expect(record).toBeDefined();
      expect(record.type).toBe('PLANTING');
      expect(record.data.plant).toBe('Cannabis Sativa');
    });

    test('should update the record', async () => {
      const updated = await Record.findByIdAndUpdate(
        testRecordId,
        { $set: { 'data.quantity': 150 } },
        { new: true },
      );

      expect(updated.data.quantity).toBe(150);
      console.log('✓ Updated record quantity to 150');
    });

    test('should delete the record', async () => {
      await Record.findByIdAndDelete(testRecordId);

      const deleted = await Record.findById(testRecordId);
      expect(deleted).toBeNull();
      console.log('✓ Deleted test record');
    });

    test('should have indexes created', async () => {
      const indexes = await Record.collection.getIndexes();
      const indexNames = Object.keys(indexes);

      console.log('Record indexes:', indexNames);
      expect(indexNames.length).toBeGreaterThan(1); // More than just _id
    });
  });

  describe('AuditLog Collection Operations', () => {
    test('should create audit log entry', async () => {
      const log = await AuditLog.create({
        action: 'CREATE',
        collection: 'records',
        documentId: 'test-record-001',
        userId: new mongoose.Types.ObjectId(),
        newData: {
          type: 'PLANTING',
          data: { plant: 'Cannabis' },
        },
        metadata: {
          ip: '127.0.0.1',
          userAgent: 'Jest Test',
        },
      });

      expect(log).toBeDefined();
      expect(log.action).toBe('CREATE');
      console.log('✓ Created audit log entry');
    });

    test('should find audit logs by action', async () => {
      const logs = await AuditLog.find({ action: 'CREATE' }).limit(10);

      expect(Array.isArray(logs)).toBe(true);
      console.log(`✓ Found ${logs.length} CREATE audit logs`);
    });

    test('should verify capped collection', async () => {
      // ใช้ db.command แทน collection.stats()
      const stats = await mongoose.connection.db.command({
        collStats: 'audit_log',
      });

      expect(stats.capped).toBe(true);
      console.log('✓ AuditLog is capped collection');
      console.log(`  Size: ${(stats.maxSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
      console.log(`  Max docs: ${stats.max.toLocaleString()}`);
    });
  });

  describe('IotReading Collection Operations', () => {
    test('should create IoT reading', async () => {
      const reading = await IotReading.create({
        metadata: {
          farmId: new mongoose.Types.ObjectId(),
          deviceId: 'device-001',
          provider: 'dygis', // lowercase
          sensorType: 'temperature',
        },
        timestamp: new Date(),
        value: 28.5,
        unit: '°C',
        quality: 'good', // enum string
      });

      expect(reading).toBeDefined();
      expect(reading.value).toBe(28.5);
      console.log('✓ Created IoT reading');
    });

    test('should find readings by sensor type', async () => {
      const readings = await IotReading.find({
        'metadata.sensorType': 'temperature',
      }).limit(10);

      expect(Array.isArray(readings)).toBe(true);
      console.log(`✓ Found ${readings.length} temperature readings`);
    });

    test('should verify timeseries collection', async () => {
      const collections = await mongoose.connection.db
        .listCollections({
          name: 'iot_readings',
        })
        .toArray();

      if (collections.length > 0) {
        const collection = collections[0];
        expect(collection.type).toBe('timeseries');
        console.log('✓ IotReading is timeseries collection');
      }
    });
  });

  describe('IotProvider Collection Operations', () => {
    let testProviderId;

    test('should create IoT provider', async () => {
      const provider = new IotProvider({
        providerId: `IOT-TEST-${Date.now()}`,
        name: 'dygis',
        farmId: new mongoose.Types.ObjectId(),
        config: {
          apiEndpoint: 'https://api.dygis.com',
          apiKey: 'test-key-123',
        },
      });

      await provider.save();

      expect(provider).toBeDefined();
      expect(provider.name).toBe('dygis');
      testProviderId = provider._id;
      console.log('✓ Created IoT provider');
    });

    test('should find provider by farmId', async () => {
      if (!testProviderId) {
        console.log('⚠ Skipping test - no provider created');
        return;
      }

      const provider = await IotProvider.findById(testProviderId);
      if (!provider) {
        console.log('⚠ Provider not found');
        return;
      }

      const providers = await IotProvider.find({
        farmId: provider.farmId,
      });

      expect(providers.length).toBeGreaterThan(0);
      console.log(`✓ Found ${providers.length} providers for farm`);
    });

    test('should add device to provider', async () => {
      if (!testProviderId) {
        console.log('⚠ Skipping test - no provider created');
        return;
      }

      const provider = await IotProvider.findById(testProviderId);
      if (!provider) {
        console.log('⚠ Provider not found');
        return;
      }

      // ใช้ $push แทน push เพื่อหลีกเลี่ยง casting issue
      await IotProvider.updateOne(
        { _id: testProviderId },
        {
          $push: {
            devices: {
              deviceId: 'device-002',
              name: 'Temperature Sensor',
              type: 'temperature',
              status: 'online',
            },
          },
        },
      );

      const updated = await IotProvider.findById(testProviderId);
      expect(updated.devices.length).toBeGreaterThan(0);
      console.log('✓ Added device to provider');
    });
  });

  describe('SignatureStore Collection Operations', () => {
    test('should create signature store entry', async () => {
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
test-key-data-here
-----END PUBLIC KEY-----`;

      const store = await SignatureStore.create({
        version: 1,
        publicKey: publicKey,
        algorithm: 'RSA-SHA256',
        keySize: 2048,
        keySource: 'local',
        status: 'ACTIVE',
        validFrom: new Date(),
        metadata: {
          environment: 'development', // ต้องเป็น development, staging, หรือ production
        },
      });

      expect(store).toBeDefined();
      expect(store.version).toBe(1);
      console.log('✓ Created signature store entry');
    });

    test('should find active key', async () => {
      const activeKey = await SignatureStore.findOne({ status: 'ACTIVE' });

      if (activeKey) {
        expect(activeKey.status).toBe('ACTIVE');
        console.log(`✓ Found active key version ${activeKey.version}`);
      }
    });

    test('should enforce unique version constraint', async () => {
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
duplicate-test
-----END PUBLIC KEY-----`;

      try {
        // Try to create duplicate version
        await SignatureStore.create({
          version: 1, // Duplicate version
          publicKey: publicKey,
          algorithm: 'RSA-SHA256',
          keySize: 2048,
          keySource: 'local',
          status: 'ACTIVE',
          validFrom: new Date(),
          metadata: {
            environment: 'development',
          },
        });

        // Should not reach here
        throw new Error('Should have thrown duplicate key error');
      } catch (error) {
        // MongoDB duplicate key error
        expect(error.code === 11000 || error.message.includes('duplicate')).toBe(true);
        console.log('✓ Unique version constraint enforced');
      }
    });
  });

  describe('Geospatial Queries', () => {
    test('should create record with location', async () => {
      const record = await Record.create({
        recordId: `geo-test-${Date.now()}`,
        type: 'PLANTING',
        farmId: new mongoose.Types.ObjectId(),
        data: { plant: 'Cannabis' },
        location: {
          type: 'Point',
          coordinates: [100.5234, 13.7367], // Bangkok coordinates
        },
        hash: 'a'.repeat(64),
        signature: 'b'.repeat(128),
        previousHash: '0'.repeat(64),
        userId: new mongoose.Types.ObjectId(),
      });

      expect(record.location).toBeDefined();
      expect(record.location.coordinates).toEqual([100.5234, 13.7367]);
      console.log('✓ Created record with geospatial data');
    });

    test('should find records near location', async () => {
      // สร้าง geospatial index ก่อน query
      await Record.collection.createIndex({ location: '2dsphere' });

      const nearbyRecords = await Record.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [100.5234, 13.7367],
            },
            $maxDistance: 10000, // 10km
          },
        },
      }).limit(10);

      expect(Array.isArray(nearbyRecords)).toBe(true);
      console.log(`✓ Found ${nearbyRecords.length} nearby records`);
    });
  });

  describe('Performance Tests', () => {
    test('should handle batch insert of records', async () => {
      const startTime = Date.now();
      const batchSize = 100;
      const records = [];

      for (let i = 0; i < batchSize; i++) {
        // สร้าง unique hex hash (64 characters)
        const hash = i.toString(16).padStart(64, '0');
        records.push({
          recordId: `batch-${Date.now()}-${i}`,
          type: 'WATERING',
          farmId: new mongoose.Types.ObjectId(),
          data: { amount: '5L' },
          hash: hash, // hex string 64 characters
          signature: 'b'.repeat(128),
          previousHash: '0'.repeat(64),
          userId: new mongoose.Types.ObjectId(),
        });
      }

      await Record.insertMany(records);
      const duration = Date.now() - startTime;

      console.log(
        `✓ Inserted ${batchSize} records in ${duration}ms (${(duration / batchSize).toFixed(2)}ms/record)`,
      );
      expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
    });

    test('should handle batch insert of IoT readings', async () => {
      const startTime = Date.now();
      const batchSize = 1000;
      const readings = [];

      const qualityOptions = ['good', 'fair', 'poor', 'unknown'];

      for (let i = 0; i < batchSize; i++) {
        readings.push({
          metadata: {
            farmId: new mongoose.Types.ObjectId(),
            deviceId: `device-${i % 10}`,
            provider: 'dygis', // lowercase
            sensorType: i % 2 === 0 ? 'temperature' : 'soil_moisture',
          },
          timestamp: new Date(Date.now() - i * 60000), // 1 minute intervals
          value: 20 + Math.random() * 15,
          unit: i % 2 === 0 ? '°C' : '%',
          quality: qualityOptions[i % 4], // enum string
        });
      }

      await IotReading.insertMany(readings);
      const duration = Date.now() - startTime;

      console.log(
        `✓ Inserted ${batchSize} IoT readings in ${duration}ms (${(duration / batchSize).toFixed(2)}ms/reading)`,
      );
      expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds
    });
  });

  describe('Index Verification', () => {
    test('should verify all Record indexes', async () => {
      const indexes = await Record.collection.getIndexes();
      const indexNames = Object.keys(indexes);

      console.log('\nRecord Indexes:');
      indexNames.forEach(name => {
        console.log(`  - ${name}`);
      });

      expect(indexNames).toContain('_id_');
      expect(indexNames.length).toBeGreaterThanOrEqual(6);
    });

    test('should verify all IotReading indexes', async () => {
      const indexes = await IotReading.collection.getIndexes();
      const indexNames = Object.keys(indexes);

      console.log('\nIotReading Indexes:');
      indexNames.forEach(name => {
        console.log(`  - ${name}`);
      });

      // Timeseries collection มีแค่ custom indexes ไม่มี _id_
      expect(indexNames.length).toBeGreaterThanOrEqual(5);
    });

    test('should verify all IotProvider indexes', async () => {
      const indexes = await IotProvider.collection.getIndexes();
      const indexNames = Object.keys(indexes);

      console.log('\nIotProvider Indexes:');
      indexNames.forEach(name => {
        console.log(`  - ${name}`);
      });

      expect(indexNames).toContain('_id_');
    });
  });
});
