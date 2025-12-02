/**
 * Mongoose Models Validation Test
 * Tests all 7 models for schema validation, virtuals, methods, and hooks
 */

const mongoose = require('mongoose');

// Import all models
const Record = require('../models/Record');
const AuditLog = require('../models/AuditLog');
const IotReading = require('../models/IotReading');
const IotProvider = require('../models/IotProvider');
const SignatureStore = require('../models/SignatureStore');
const Farm = require('../models/Farm');
const User = require('../models/User');

describe('Mongoose Models Validation', () => {
  // Mock MongoDB connection for testing
  beforeAll(() => {
    // Models are already loaded, no need to connect for validation tests
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Record Model', () => {
    test('should have correct schema fields', () => {
      const paths = Object.keys(Record.schema.paths);

      expect(paths).toContain('recordId');
      expect(paths).toContain('type');
      expect(paths).toContain('farmId');
      expect(paths).toContain('data');
      expect(paths).toContain('hash');
      expect(paths).toContain('signature');
      expect(paths).toContain('previousHash');
      expect(paths).toContain('userId');
    });

    test('should have required fields', () => {
      const requiredPaths = Object.keys(Record.schema.paths).filter(
        path => Record.schema.paths[path].isRequired,
      );

      expect(requiredPaths).toContain('recordId');
      expect(requiredPaths).toContain('type');
      expect(requiredPaths).toContain('farmId');
      expect(requiredPaths).toContain('hash');
      expect(requiredPaths).toContain('signature');
    });

    test('should have correct enum values for type', () => {
      const typeField = Record.schema.path('type');
      const enumValues = typeField.enumValues;

      expect(enumValues).toContain('PLANTING');
      expect(enumValues).toContain('WATERING');
      expect(enumValues).toContain('FERTILIZING');
      expect(enumValues).toContain('HARVEST'); // ไม่ใช่ HARVESTING
      expect(enumValues.length).toBeGreaterThan(10);
    });

    test('should have geospatial index', () => {
      const indexes = Record.schema.indexes();
      const hasGeoIndex = indexes.some(
        index => index[0].location && index[0].location === '2dsphere',
      );

      expect(hasGeoIndex).toBe(true);
    });

    test('should have static methods', () => {
      expect(typeof Record.createRecord).toBe('function');
      expect(typeof Record.verifyChain).toBe('function');
      expect(typeof Record.getGenesisRecords).toBe('function');
      expect(typeof Record.findByLocation).toBe('function');
    });

    test('should validate record type enum', () => {
      const record = new Record({
        recordId: 'test-001',
        type: 'INVALID_TYPE', // Invalid type
        farmId: new mongoose.Types.ObjectId(),
        data: {},
        hash: 'a'.repeat(64),
        signature: 'b'.repeat(128),
      });

      const error = record.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.type).toBeDefined();
    });

    test('should require hash to be 64 characters', () => {
      const record = new Record({
        recordId: 'test-001',
        type: 'PLANTING',
        farmId: new mongoose.Types.ObjectId(),
        data: {},
        hash: 'short', // Too short
        signature: 'b'.repeat(128),
      });

      const error = record.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.hash).toBeDefined();
    });
  });

  describe('AuditLog Model', () => {
    test('should have correct schema fields', () => {
      const paths = Object.keys(AuditLog.schema.paths);

      expect(paths).toContain('action');
      expect(paths).toContain('collection');
      expect(paths).toContain('documentId');
      expect(paths).toContain('userId');
      expect(paths).toContain('oldData');
      expect(paths).toContain('newData');
      expect(paths).toContain('changes');
    });

    test('should have capped collection options', () => {
      const options = AuditLog.schema.options;

      expect(options.capped).toBeDefined();
      expect(options.capped.size).toBe(5 * 1024 * 1024 * 1024); // 5GB
      expect(options.capped.max).toBe(10000000); // 10M documents
    });

    test('should have correct enum values for action', () => {
      const actionField = AuditLog.schema.path('action');
      const enumValues = actionField.enumValues;

      expect(enumValues).toContain('CREATE');
      expect(enumValues).toContain('UPDATE');
      expect(enumValues).toContain('DELETE');
      expect(enumValues).toContain('LOGIN'); // ไม่มี ACCESS ใน schema
    });

    test('should have static methods', () => {
      expect(typeof AuditLog.log).toBe('function');
      expect(typeof AuditLog.logCreate).toBe('function');
      expect(typeof AuditLog.logUpdate).toBe('function');
      expect(typeof AuditLog.logDelete).toBe('function');
      expect(typeof AuditLog.getDocumentHistory).toBe('function');
    });

    test('should validate action enum', () => {
      const log = new AuditLog({
        action: 'INVALID_ACTION', // Invalid
        collection: 'farms',
        documentId: 'farm-001',
        userId: new mongoose.Types.ObjectId(),
      });

      const error = log.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.action).toBeDefined();
    });
  });

  describe('IotReading Model', () => {
    test('should have correct schema fields', () => {
      const paths = Object.keys(IotReading.schema.paths);

      expect(paths).toContain('metadata.farmId'); // metadata เป็น nested object
      expect(paths).toContain('timestamp');
      expect(paths).toContain('value');
      expect(paths).toContain('unit');
      expect(paths).toContain('location.type');
      expect(paths).toContain('quality');
    });

    test('should have timeseries collection options', () => {
      const options = IotReading.schema.options;

      expect(options.timeseries).toBeDefined();
      expect(options.timeseries.timeField).toBe('timestamp');
      expect(options.timeseries.metaField).toBe('metadata');
      expect(options.timeseries.granularity).toBe('minutes');
    });

    test('should have TTL index for 1 year', () => {
      // expireAfterSeconds อยู่ใน schema options ไม่ใช่ใน index
      const options = IotReading.schema.options;

      expect(options.expireAfterSeconds).toBe(31536000); // 1 year
    });

    test('should have static methods', () => {
      expect(typeof IotReading.record).toBe('function');
      expect(typeof IotReading.recordBatch).toBe('function');
      expect(typeof IotReading.getLatest).toBe('function');
      expect(typeof IotReading.getTimeSeries).toBe('function');
      expect(typeof IotReading.checkThresholds).toBe('function');
    });

    test('should require timestamp', () => {
      const reading = new IotReading({
        metadata: {
          farmId: new mongoose.Types.ObjectId(),
          deviceId: 'device-001',
          sensorType: 'temperature',
        },
        value: 25.5,
        unit: '°C',
        // Missing timestamp
      });

      const error = reading.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.timestamp).toBeDefined();
    });
  });

  describe('IotProvider Model', () => {
    test('should have correct schema fields', () => {
      const paths = Object.keys(IotProvider.schema.paths);

      expect(paths).toContain('providerId');
      expect(paths).toContain('name');
      expect(paths).toContain('farmId');
      expect(paths).toContain('config.apiEndpoint'); // config เป็น nested object
      expect(paths).toContain('devices');
      expect(paths).toContain('thresholds');
      expect(paths).toContain('status');
    });

    test('should have correct enum values for name', () => {
      const nameField = IotProvider.schema.path('name');
      const enumValues = nameField.enumValues;

      expect(enumValues).toContain('dygis'); // เป็น lowercase
      expect(enumValues).toContain('thaismartfarm');
      expect(enumValues).toContain('sensecap');
      expect(enumValues).toContain('malin');
      expect(enumValues).toContain('custom');
    });

    test('should have correct enum values for status', () => {
      const statusField = IotProvider.schema.paths.status;
      const enumValues = statusField.enumValues;

      expect(enumValues).toContain('ACTIVE');
      expect(enumValues).toContain('INACTIVE');
      expect(enumValues).toContain('ERROR');
    });

    test('should have instance methods', () => {
      const provider = new IotProvider({
        providerId: 'prov-001',
        name: 'DYGIS',
        farmId: new mongoose.Types.ObjectId(),
      });

      expect(typeof provider.activate).toBe('function');
      expect(typeof provider.deactivate).toBe('function');
      expect(typeof provider.addDevice).toBe('function');
      expect(typeof provider.removeDevice).toBe('function');
    });

    test('should have static methods', () => {
      expect(typeof IotProvider.findByFarm).toBe('function');
      expect(typeof IotProvider.findActive).toBe('function');
      expect(typeof IotProvider.findByDevice).toBe('function');
    });

    test('should default status to TESTING', () => {
      const provider = new IotProvider({
        providerId: 'IOT-TEST-001',
        name: 'dygis',
        farmId: new mongoose.Types.ObjectId(),
      });

      expect(provider.status).toBe('TESTING'); // default คือ TESTING
    });
  });

  describe('SignatureStore Model', () => {
    test('should have correct schema fields', () => {
      const paths = Object.keys(SignatureStore.schema.paths);

      expect(paths).toContain('version');
      expect(paths).toContain('publicKey');
      expect(paths).toContain('algorithm');
      expect(paths).toContain('keySize');
      expect(paths).toContain('keySource');
      expect(paths).toContain('status');
      expect(paths).toContain('validFrom');
      expect(paths).toContain('validUntil');
    });

    test('should have correct enum values for status', () => {
      const statusField = SignatureStore.schema.paths.status;
      const enumValues = statusField.enumValues;

      expect(enumValues).toContain('ACTIVE');
      expect(enumValues).toContain('ROTATED');
      expect(enumValues).toContain('REVOKED');
    });

    test('should have correct enum values for keySource', () => {
      const keySourceField = SignatureStore.schema.paths.keySource;
      const enumValues = keySourceField.enumValues;

      expect(enumValues).toContain('local');
      expect(enumValues).toContain('kms');
    });

    test('should have unique version constraint', () => {
      const indexes = SignatureStore.schema.indexes();
      const hasUniqueVersion = indexes.some(
        index => index[0].version && index[1] && index[1].unique === true,
      );

      expect(hasUniqueVersion).toBe(true);
    });

    test('should have instance methods', () => {
      const store = new SignatureStore({
        version: 1,
        publicKey: '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----',
        algorithm: 'RSA-SHA256',
        keySize: 2048,
      });

      expect(typeof store.rotate).toBe('function');
      expect(typeof store.revoke).toBe('function');
      expect(typeof store.recordSignature).toBe('function');
    });

    test('should have static methods', () => {
      expect(typeof SignatureStore.getActive).toBe('function');
      expect(typeof SignatureStore.getByVersion).toBe('function');
      expect(typeof SignatureStore.createInitial).toBe('function');
    });

    test('should default status to ACTIVE', () => {
      const store = new SignatureStore({
        version: 1,
        publicKey: '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----',
        algorithm: 'RSA-SHA256',
        keySize: 2048,
      });

      expect(store.status).toBe('ACTIVE');
    });

    test('should validate PEM format for publicKey', () => {
      const store = new SignatureStore({
        version: 1,
        publicKey: 'invalid-key-format', // Invalid PEM
        algorithm: 'RSA-SHA256',
        keySize: 2048,
      });

      const error = store.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.publicKey).toBeDefined();
    });
  });

  describe('Farm Model', () => {
    test('should have correct schema fields', () => {
      const paths = Object.keys(Farm.schema.paths);

      // เช็คแค่ fields หลักที่มีแน่นอน
      expect(paths).toContain('name');
      expect(paths).toContain('owner');
      expect(paths).toContain('registrationNumber');
      expect(paths.some(p => p.startsWith('location'))).toBe(true); // มี location field
    });

    test('should have geospatial fields', () => {
      const locationPaths = Object.keys(Farm.schema.paths).filter(path =>
        path.startsWith('location'),
      );

      expect(locationPaths.length).toBeGreaterThan(0);
    });
  });

  describe('User Model', () => {
    test('should have correct schema fields', () => {
      const paths = Object.keys(User.schema.paths);

      expect(paths).toContain('email'); // ไม่มี userId
      expect(paths).toContain('password');
      expect(paths).toContain('role');
      expect(paths).toContain('fullName');
      expect(paths).toContain('nationalId');
    });

    test('should have unique email constraint', () => {
      const indexes = User.schema.indexes();
      const hasUniqueEmail = indexes.some(
        index => index[0].email && index[1] && index[1].unique === true,
      );

      expect(hasUniqueEmail).toBe(true);
    });
  });

  describe('Cross-Model Relationships', () => {
    test('Record should reference Farm', () => {
      const farmIdPath = Record.schema.path('farmId');

      expect(farmIdPath.options.ref).toBe('Farm');
      expect(farmIdPath.instance).toBe('ObjectId'); // ไม่ใช่ ObjectID
    });

    test('Record should reference User', () => {
      const userIdPath = Record.schema.path('userId');

      expect(userIdPath.options.ref).toBe('User');
      expect(userIdPath.instance).toBe('ObjectId');
    });

    test('IotProvider should reference Farm', () => {
      const farmIdPath = IotProvider.schema.path('farmId');

      expect(farmIdPath.options.ref).toBe('Farm');
      expect(farmIdPath.instance).toBe('ObjectId');
    });

    test('AuditLog should reference User', () => {
      const userIdPath = AuditLog.schema.path('userId');

      expect(userIdPath.options.ref).toBe('User');
      expect(userIdPath.instance).toBe('ObjectId');
    });
  });

  describe('Model Indexes', () => {
    test('Record should have compound indexes', () => {
      const indexes = Record.schema.indexes();

      // Should have at least 6 indexes (as documented)
      expect(indexes.length).toBeGreaterThanOrEqual(6);
    });

    test('AuditLog should have compound indexes', () => {
      const indexes = AuditLog.schema.indexes();

      // Should have at least 4 indexes
      expect(indexes.length).toBeGreaterThanOrEqual(4);
    });

    test('IotReading should have compound indexes', () => {
      const indexes = IotReading.schema.indexes();

      // Should have at least 5 indexes
      expect(indexes.length).toBeGreaterThanOrEqual(5);
    });
  });
});
