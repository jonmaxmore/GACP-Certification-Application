# MongoDB Models Documentation

## Overview

The Botanical Audit Framework uses 7 MongoDB collections with Mongoose ODM for cannabis traceability and audit compliance.

## Collections

### 1. **records** - Main Traceability Collection

**Purpose**: Stores all cannabis cultivation activity records with hash chains and digital signatures.

**Model**: `Record.js`

**Schema**:
```javascript
{
  recordId: String (unique, indexed),
  type: Enum (PLANTING, WATERING, FERTILIZING, PEST_CONTROL, PRUNING, FLOWERING, 
              HARVEST, DRYING, CURING, TESTING, PACKAGING, SHIPPING, DISPOSAL, 
              INSPECTION, OTHER),
  farmId: ObjectId (ref: Farm, indexed),
  data: Mixed (activity-specific data),
  location: { type: "Point", coordinates: [longitude, latitude] }, // 2dsphere indexed
  hash: String (64-char hex, unique, indexed),
  signature: String (hex),
  previousHash: String (64-char hex, indexed),
  timestamp: {
    timestamp: Date,
    token: String (RFC 3161 token),
    provider: Enum (FreeTSA, DigiCert, GlobalSign, fallback),
    algorithm: String
  },
  userId: ObjectId (ref: User, indexed),
  metadata: { device, ipAddress, userAgent, notes },
  verified: Boolean (indexed),
  verifiedAt: Date,
  verifiedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ farmId: 1, createdAt: -1 }` - Farm timeline
- `{ userId: 1, createdAt: -1 }` - User activity
- `{ type: 1, createdAt: -1 }` - Type filter
- `{ location: '2dsphere' }` - Geospatial queries
- `{ hash: 1, previousHash: 1 }` - Chain verification
- `{ verified: 1, createdAt: -1 }` - Verification status

**Key Features**:
- **Hash Chain**: Every record links to previous via `previousHash` (blockchain-inspired)
- **Digital Signature**: RSA-2048 signature for authenticity
- **RFC 3161 Timestamp**: Trusted timestamp authority integration (optional)
- **Geospatial**: 2dsphere index for location-based queries
- **Immutability**: `hash`, `signature`, `previousHash`, `recordId` cannot be updated
- **Auto-signing**: Use `Record.createRecord()` to auto-generate hash and signature

**Static Methods**:
- `createRecord(recordData, previousHash)` - Create signed record with hash chain
- `verifyChain(farmId, limit)` - Verify entire chain integrity
- `getGenesisRecords()` - Find genesis records (previousHash = "000...000")
- `findByLocation(lon, lat, maxDistance)` - Geospatial query
- `getStatsByType(farmId)` - Activity statistics

**Instance Methods**:
- `verify(previousHash)` - Verify hash chain and signature
- `getPreviousRecord()` - Get previous record in chain
- `getNextRecord()` - Get next record in chain
- `getChain(direction, limit)` - Get chain (backward/forward)
- `markVerified(verifiedBy)` - Mark as verified

---

### 2. **audit_log** - Audit Trail Collection (Capped)

**Purpose**: Stores all database changes for compliance and forensics.

**Model**: `AuditLog.js`

**Schema**:
```javascript
{
  action: Enum (CREATE, UPDATE, DELETE, READ, LOGIN, LOGOUT, VERIFY, APPROVE, REJECT),
  collection: String (collection name),
  documentId: Mixed (document _id),
  userId: ObjectId (ref: User, indexed),
  oldData: Mixed (before state),
  newData: Mixed (after state),
  changes: Mixed (diff),
  metadata: { ipAddress, userAgent, requestId, sessionId, method, path, status },
  timestamp: Date (indexed)
}
```

**Collection Options**:
- **Capped**: Yes
- **Size**: 5GB
- **Max Documents**: 10 million
- **Auto-delete**: Oldest records deleted when limits reached

**Indexes**:
- `{ userId: 1, timestamp: -1 }` - User activity
- `{ collection: 1, documentId: 1, timestamp: -1 }` - Document history
- `{ action: 1, timestamp: -1 }` - Action filter
- `{ timestamp: -1 }` - Recent activity

**Static Methods**:
- `log(entry)` - Generic audit log
- `logCreate(collection, document, userId, metadata)` - Log document creation
- `logUpdate(collection, documentId, oldData, newData, userId, metadata)` - Log update with diff
- `logDelete(collection, document, userId, metadata)` - Log deletion
- `logAccess(collection, documentId, userId, metadata)` - Log read access
- `getDocumentHistory(collection, documentId, limit)` - Get document audit trail
- `getUserActivity(userId, limit)` - Get user activity log
- `getRecentActivity(limit)` - Get recent system activity
- `getStatsByAction(startDate, endDate)` - Statistics by action type
- `getStatsByUser(startDate, endDate, limit)` - Statistics by user

---

### 3. **iot_readings** - IoT Sensor Data Collection (Timeseries)

**Purpose**: Stores high-volume IoT sensor readings with timeseries optimization.

**Model**: `IotReading.js`

**Schema**:
```javascript
{
  metadata: {
    farmId: ObjectId (ref: Farm),
    deviceId: String,
    provider: Enum (dygis, malin, sensecap, thaismartfarm, custom),
    sensorType: Enum (temperature, humidity, soil_moisture, soil_temperature, light,
                      co2, ph, ec, water_level, wind_speed, rain, pressure, battery, custom)
  },
  timestamp: Date (required for timeseries),
  value: Number,
  unit: String,
  location: { type: "Point", coordinates: [lon, lat] },
  quality: Enum (good, fair, poor, unknown),
  raw: Mixed (original provider data),
  processed: Boolean,
  alert: {
    triggered: Boolean,
    type: Enum (high, low, critical),
    notified: Boolean
  }
}
```

**Collection Options**:
- **Timeseries**: Yes
- **Time Field**: `timestamp`
- **Meta Field**: `metadata`
- **Granularity**: minutes
- **TTL**: 1 year (expireAfterSeconds: 31536000)

**Indexes**:
- `{ 'metadata.farmId': 1, timestamp: -1 }` - Farm timeline
- `{ 'metadata.deviceId': 1, timestamp: -1 }` - Device timeline
- `{ 'metadata.sensorType': 1, timestamp: -1 }` - Sensor type
- `{ timestamp: -1 }` - Recent readings
- `{ 'alert.triggered': 1, 'alert.notified': 1 }` - Pending alerts

**Static Methods**:
- `record(reading)` - Record single sensor reading
- `recordBatch(readings)` - Bulk insert sensor readings
- `getLatest(farmId, deviceId, sensorType)` - Get latest reading
- `getTimeSeries(farmId, sensorType, startDate, endDate, limit)` - Get time series data
- `getAggregates(farmId, sensorType, startDate, endDate, interval)` - Get aggregates (hour/day/month)
- `checkThresholds(farmId, rules)` - Check threshold violations
- `getPendingAlerts(farmId)` - Get unnotified alerts
- `markAlertsNotified(readingIds)` - Mark alerts as notified

**Performance**:
- Optimized for write-heavy workload (sensor data every 5 minutes)
- Automatic downsampling for older data
- Efficient aggregation queries

---

### 4. **iot_providers** - IoT Provider Configuration

**Purpose**: Stores IoT provider configurations, API credentials, and device management.

**Model**: `IotProvider.js`

**Schema**:
```javascript
{
  providerId: String (unique, indexed),
  name: Enum (dygis, malin, sensecap, thaismartfarm, custom),
  farmId: ObjectId (ref: Farm, indexed),
  config: {
    apiEndpoint: String,
    apiKey: String (hidden in JSON),
    apiSecret: String (hidden in JSON),
    webhookUrl: String,
    webhookSecret: String (hidden in JSON),
    mqtt: { broker, port, username, password (hidden), clientId, topics }
  },
  devices: [{
    deviceId: String,
    name: String,
    type: String,
    location: String,
    sensors: [{ sensorType, unit, min, max, critical }],
    lastSeen: Date,
    status: Enum (online, offline, error, unknown),
    metadata: Mixed
  }],
  thresholds: [{
    sensorType: String,
    min: Number,
    max: Number,
    critical: Number,
    alertEmail: [String],
    alertPhone: [String]
  }],
  status: Enum (ACTIVE, INACTIVE, ERROR, TESTING),
  lastSync: Date,
  statistics: { totalReadings, lastReading, errors, uptime },
  metadata: { notes, supportContact, documentationUrl },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ farmId: 1, name: 1 }` - Farm providers
- `{ status: 1 }` - Active providers
- `{ 'devices.deviceId': 1 }` - Device lookup

**Instance Methods**:
- `activate()` - Activate provider
- `deactivate()` - Deactivate provider
- `addDevice(device)` - Add new device
- `removeDevice(deviceId)` - Remove device
- `updateDeviceStatus(deviceId, status)` - Update device status
- `recordReading()` - Increment reading counter
- `recordError()` - Increment error counter
- `getDevice(deviceId)` - Get device config
- `getThreshold(sensorType)` - Get sensor threshold

**Static Methods**:
- `findByFarm(farmId)` - Get all providers for farm
- `findActive()` - Get all active providers
- `findByDevice(deviceId)` - Find provider by device ID
- `getStatsByProvider()` - Statistics by provider type

---

### 5. **signature_store** - Cryptographic Keys Storage

**Purpose**: Stores public keys and signature metadata for audit trail.

**Model**: `SignatureStore.js`

**Schema**:
```javascript
{
  version: Number (unique, indexed),
  publicKey: String (PEM format),
  algorithm: Enum (RSA-SHA256, ECDSA-SHA256),
  keySize: Enum (2048, 4096),
  keySource: Enum (local, kms),
  kmsKeyId: String,
  status: Enum (ACTIVE, ROTATED, REVOKED),
  validFrom: Date,
  validUntil: Date,
  rotatedAt: Date,
  revokedAt: Date,
  revokedReason: String,
  statistics: { signaturesCreated, signaturesVerified, lastUsed },
  metadata: { environment (development/staging/production), createdBy, notes },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ status: 1, version: -1 }` - Active keys
- `{ validFrom: 1, validUntil: 1 }` - Validity period

**Instance Methods**:
- `rotate(newPublicKey, newVersion)` - Rotate to new key
- `revoke(reason)` - Revoke key
- `recordSignature()` - Increment signature counter
- `recordVerification()` - Increment verification counter

**Static Methods**:
- `getActive()` - Get current active key
- `getByVersion(version)` - Get key by version
- `getAll()` - Get all keys
- `createInitial(publicKey, environment, createdBy)` - Initialize first key
- `getStats()` - Get key statistics

**Security**:
- Only one active key at a time
- Old keys retained for verification
- Private keys NEVER stored (only public keys)
- AWS KMS integration for production

---

### 6. **farms** - Farm Master Data

**Purpose**: Stores farm information and cultivation licenses.

**Model**: `Farm.js` (existing, may need enhancements)

**Key Fields**:
- Basic info: name, description, owner
- Location: address, province, GPS coordinates (2dsphere indexed)
- License: number, type (MEDICAL/RESEARCH/INDUSTRIAL), expiry date
- Area: value + unit (rai/sqm/hectare)
- Contact: phone, email, website
- Status: ACTIVE, INACTIVE, SUSPENDED, PENDING_APPROVAL
- Team: members with roles (OWNER, MANAGER, WORKER, INSPECTOR)
- IoT: enabled, providers, devices
- Cultivation: types (INDOOR/OUTDOOR/GREENHOUSE/HYDROPONIC), capacity, strains

---

### 7. **users** - User Accounts

**Purpose**: Stores user accounts with authentication and authorization.

**Model**: `User.js` (existing, may need enhancements)

**Key Fields**:
- Authentication: email (unique), password (hashed with bcrypt)
- Profile: firstName, lastName, phone, avatar, nationalId
- Role: ADMIN, INSPECTOR, FARMER, MANAGER, WORKER, AUDITOR
- Permissions: array of permission strings
- Farms: array of { farmId, role, joinedAt }
- Status: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- Verified: email, phone, identity
- Security: lastLogin, loginAttempts, lockUntil
- Metadata: timezone, language, preferences

---

## Usage Examples

### Create Signed Record

```javascript
const Record = require('./models/Record');

const record = await Record.createRecord({
  recordId: 'REC-001',
  type: 'PLANTING',
  farmId: '507f1f77bcf86cd799439011',
  data: {
    plantType: 'Cannabis Sativa',
    quantity: 100,
    plotId: 'PLOT-A1'
  },
  location: {
    type: 'Point',
    coordinates: [100.5018, 13.7563] // [lon, lat]
  },
  userId: '507f191e810c19729de860ea',
  metadata: {
    device: 'Mobile App v1.2',
    ipAddress: '203.113.45.67'
  }
});
// Returns: { recordId, type, hash, signature, previousHash, timestamp, ... }
```

### Verify Record Chain

```javascript
const verification = await Record.verifyChain('507f1f77bcf86cd799439011', 100);

if (verification.valid) {
  console.log(`Chain valid: ${verification.validRecords}/${verification.totalRecords}`);
} else {
  console.error('Chain broken:', verification.details);
}
```

### Record IoT Sensor Data

```javascript
const IotReading = require('./models/IotReading');

await IotReading.record({
  farmId: '507f1f77bcf86cd799439011',
  deviceId: 'DYGIS-001',
  provider: 'dygis',
  sensorType: 'temperature',
  value: 28.5,
  unit: '°C',
  timestamp: new Date(),
  quality: 'good'
});
```

### Check Threshold Violations

```javascript
const alerts = await IotReading.checkThresholds('507f1f77bcf86cd799439011', [
  { deviceId: 'DYGIS-001', sensorType: 'temperature', max: 35, critical: 40 },
  { deviceId: 'DYGIS-001', sensorType: 'soil_moisture', min: 30, critical: 20 }
]);

// Send notifications for alerts
for (const alert of alerts) {
  await sendAlert(alert);
}
```

### Audit Logging

```javascript
const AuditLog = require('./models/AuditLog');

// Automatic logging (in middleware)
await AuditLog.logUpdate(
  'farms',
  farm._id,
  oldFarm,
  updatedFarm,
  req.user._id,
  { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
);

// Get document history
const history = await AuditLog.getDocumentHistory('farms', farm._id, 50);
```

## Best Practices

1. **Always use `Record.createRecord()`** - Never manually create records, use the static method for auto-signing
2. **Verify chains periodically** - Run `Record.verifyChain()` as a scheduled job
3. **Enable timestamps** - For production, enable RFC 3161 timestamps (disable for development/testing)
4. **Use lean() for read-only queries** - Improves performance by skipping Mongoose hydration
5. **Index foreign keys** - All `farmId`, `userId` fields are indexed
6. **Audit everything** - Use `AuditLog` for all CREATE/UPDATE/DELETE operations
7. **Batch IoT writes** - Use `IotReading.recordBatch()` for bulk sensor data
8. **Monitor capped collections** - `audit_log` is capped at 5GB, ensure monitoring
9. **Rotate keys annually** - Use `SignatureStore.rotate()` for key rotation
10. **Use transactions** - For multi-document operations, use MongoDB transactions

## Performance Tips

- **Compound indexes**: Most queries use compound indexes (`{ farmId: 1, createdAt: -1 }`)
- **Timeseries optimization**: `iot_readings` uses timeseries collection for efficient storage
- **Capped collections**: `audit_log` uses capped collection for automatic cleanup
- **Lean queries**: Use `.lean()` for read-only operations
- **Projection**: Select only needed fields with `.select()`
- **Pagination**: Use `.skip()` and `.limit()` for large result sets
- **Connection pooling**: Configure MongoDB connection pool size (default: 10)

## Migration Guide

### From Existing Models

If you have existing `Farm.js` or `User.js` models, you may need to add these fields:

**Farm.js enhancements**:
```javascript
// Add to existing schema
equipment: {
  iot: {
    enabled: Boolean,
    providers: [{ name, apiKey, devices }]
  }
}
```

**User.js enhancements**:
```javascript
// Add to existing schema
farms: [{
  farmId: ObjectId,
  role: Enum,
  joinedAt: Date
}]
```

## Testing

See `__tests__/crypto-service.test.js` for test examples covering:
- Record creation with signing
- Hash chain verification
- Signature verification
- IoT data ingestion
- Audit logging

## License

This documentation is part of the Botanical Audit Framework and is proprietary software.
