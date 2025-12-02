# 🚀 MongoDB Atlas Production Setup Guide

Complete guide for setting up MongoDB Atlas for Botanical Audit Framework in production.

---

## 📋 Prerequisites

1. **MongoDB Atlas Account**
   - Sign up at: https://cloud.mongodb.com
   - Create a new Project or use existing one
   - Note down your Project ID (Group ID)

2. **Atlas API Keys**
   - Go to: Organization Settings → Access Manager → API Keys
   - Create new API key with "Project Owner" permissions
   - Save Public Key and Private Key securely

3. **Environment Variables**
   ```bash
   # Required for setup script
   export MONGODB_ATLAS_PUBLIC_KEY="your-public-key"
   export MONGODB_ATLAS_PRIVATE_KEY="your-private-key"
   export MONGODB_ATLAS_GROUP_ID="your-project-id"
   ```

---

## 🎯 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# 1. Set environment variables
export MONGODB_ATLAS_PUBLIC_KEY="abcd1234"
export MONGODB_ATLAS_PRIVATE_KEY="xxxx-yyyy-zzzz"
export MONGODB_ATLAS_GROUP_ID="507f1f77bcf86cd799439011"

# 2. Install dependencies
cd apps/backend
npm install mongodb

# 3. Run setup script
node setup-mongodb-atlas-production.js
```

**What it does:**
- ✅ Creates M10 cluster in Bangkok (AWS ap-southeast-1)
- ✅ Configures 3 database users (app, readonly, admin)
- ✅ Sets up 7 collections with proper indexes
- ✅ Enables backup and auto-scaling
- ✅ Generates secure passwords
- ✅ Saves credentials to `.env.mongodb.production`

**Expected output:**
```
🌿 Botanical Audit Framework - MongoDB Atlas Setup
============================================================

🔐 Step 1: Validating Atlas credentials...
   ✓ Connected to Atlas project: Botanical Audit Production

🔍 Step 2: Checking if cluster exists...
   ℹ Cluster "botanical-audit-prod" does not exist

🚀 Step 3: Creating production cluster...
   ✓ Cluster creation initiated: botanical-audit-prod
   ⏳ Waiting for cluster to be ready (this may take 7-10 minutes)...
   ✓ Cluster is ready!

🔒 Step 4: Configuring IP whitelist...
   ✓ Added IP whitelist: 0.0.0.0/0

👤 Step 5: Creating database users...
   ✓ Created user: botanical_app
   ✓ Created user: botanical_readonly
   ✓ Created user: botanical_admin

🔗 Step 6: Getting connection string...
   ✓ Connection string: mongodb+srv://botanical-audit-prod.xxxxx.mongodb.net

🗄️  Step 7: Setting up database and collections...
   ✓ Connected to MongoDB Atlas
   ✓ Created collection: records
      ✓ Created index: idx_recordId
      ✓ Created index: idx_hash
      ✓ Created index: idx_previousHash
   ... (more collections)

💾 Step 8: Saving credentials...
   ✓ Credentials saved to: .env.mongodb.production
   ⚠️  IMPORTANT: Keep this file secure and never commit to git!

============================================================
✅ Setup completed successfully!
============================================================
```

---

### Option 2: Manual Setup

If you prefer manual setup or the script fails:

#### Step 1: Create Cluster
1. Go to Atlas Dashboard → Clusters
2. Click "Build a Cluster"
3. Select AWS, Bangkok (ap-southeast-1)
4. Choose M10 tier (2GB RAM, 10GB Storage)
5. Name: `botanical-audit-prod`
6. Enable Backup
7. Click "Create Cluster" (wait 7-10 minutes)

#### Step 2: Network Access
1. Go to Network Access
2. Add IP Address: `0.0.0.0/0` (temporary, change to specific IPs later)

#### Step 3: Database Users
Create 3 users with these roles:

```
User 1: botanical_app
- Database: botanical_audit
- Role: readWrite
- Password: <generate secure 32-char password>

User 2: botanical_readonly
- Database: botanical_audit
- Role: read
- Password: <generate secure 32-char password>

User 3: botanical_admin
- Database: botanical_audit
- Role: dbAdmin, readWrite
- Password: <generate secure 32-char password>
```

#### Step 4: Get Connection String
1. Click "Connect" → "Connect your application"
2. Driver: Node.js, Version: 5.5 or later
3. Copy connection string
4. Replace `<username>` and `<password>`

#### Step 5: Create Collections & Indexes
```bash
mongosh "mongodb+srv://botanical_app:<password>@botanical-audit-prod.xxxxx.mongodb.net/botanical_audit"

# Create collections
use botanical_audit

# 1. Records collection
db.createCollection("records")
db.records.createIndex({ "recordId": 1 }, { unique: true, name: "idx_recordId" })
db.records.createIndex({ "hash": 1 }, { unique: true, name: "idx_hash" })
db.records.createIndex({ "previousHash": 1 }, { name: "idx_previousHash" })
db.records.createIndex({ "userId": 1 }, { name: "idx_userId" })
db.records.createIndex({ "farmId": 1 }, { name: "idx_farmId" })
db.records.createIndex({ "createdAt": -1 }, { name: "idx_createdAt" })
db.records.createIndex({ "data.location": "2dsphere" }, { name: "idx_location_geo" })

# 2. Audit log (capped collection)
db.createCollection("audit_log", { 
  capped: true, 
  size: 5368709120, 
  max: 10000000 
})
db.audit_log.createIndex({ "recordId": 1 }, { name: "idx_recordId" })
db.audit_log.createIndex({ "userId": 1 }, { name: "idx_userId" })
db.audit_log.createIndex({ "timestamp": -1 }, { name: "idx_timestamp" })
db.audit_log.createIndex({ "action": 1 }, { name: "idx_action" })

# 3. IoT readings (timeseries collection)
db.createCollection("iot_readings", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "minutes"
  }
})
db.iot_readings.createIndex({ "metadata.farmId": 1, "timestamp": -1 }, { name: "idx_farm_time" })
db.iot_readings.createIndex({ "metadata.deviceId": 1, "timestamp": -1 }, { name: "idx_device_time" })

# 4. IoT providers
db.createCollection("iot_providers")
db.iot_providers.createIndex({ "provider": 1, "farmId": 1 }, { unique: true, name: "idx_provider_farm" })
db.iot_providers.createIndex({ "userId": 1 }, { name: "idx_userId" })
db.iot_providers.createIndex({ "status": 1 }, { name: "idx_status" })

# 5. Signature store
db.createCollection("signature_store")
db.signature_store.createIndex({ "hash": 1 }, { unique: true, name: "idx_hash" })
db.signature_store.createIndex({ "keyId": 1 }, { name: "idx_keyId" })
db.signature_store.createIndex({ "createdAt": -1 }, { name: "idx_createdAt" })

# 6. Farms
db.createCollection("farms")
db.farms.createIndex({ "farmId": 1 }, { unique: true, name: "idx_farmId" })
db.farms.createIndex({ "userId": 1 }, { name: "idx_userId" })
db.farms.createIndex({ "location.coordinates": "2dsphere" }, { name: "idx_location" })
db.farms.createIndex({ "status": 1 }, { name: "idx_status" })
db.farms.createIndex({ "createdAt": -1 }, { name: "idx_createdAt" })

# 7. Users
db.createCollection("users")
db.users.createIndex({ "email": 1 }, { unique: true, name: "idx_email" })
db.users.createIndex({ "userId": 1 }, { unique: true, name: "idx_userId" })
db.users.createIndex({ "role": 1 }, { name: "idx_role" })
db.users.createIndex({ "createdAt": -1 }, { name: "idx_createdAt" })
```

---

## 🗄️ Database Schema

### Collections Overview

| Collection | Type | Purpose | Size Limit |
|------------|------|---------|------------|
| `records` | Standard | Main traceability records with digital signatures | Unlimited |
| `audit_log` | Capped | Append-only audit trail (5GB / 10M docs) | 5GB |
| `iot_readings` | Timeseries | Sensor data (optimized for time-based queries) | Unlimited |
| `iot_providers` | Standard | IoT provider configurations | Small |
| `signature_store` | Standard | Cryptographic signatures and keys | Small |
| `farms` | Standard | Farm master data | Medium |
| `users` | Standard | User accounts | Small |

### Records Collection Schema

```javascript
{
  _id: ObjectId("..."),
  recordId: "FARM-001-CROP-2025-001",  // Business ID
  type: "harvest",  // farm, crop, activity, harvest, lab_test
  
  data: {
    weight: 15.5,
    quality: "A",
    cbd_percent: 12.3,
    location: {
      type: "Point",
      coordinates: [100.5234, 13.7563]  // [lng, lat]
    }
  },
  
  // Cryptographic proof
  hash: "abc123...",  // SHA-256
  signature: "789xyz...",  // RSA-2048
  previousHash: "000000...",  // Hash chain
  timestampToken: "MIIEr...",  // RFC 3161 (optional)
  
  // Metadata
  userId: "farmer@example.com",
  farmId: "FARM-001",
  createdAt: ISODate("2025-11-03T10:30:00Z"),
  updatedAt: ISODate("2025-11-03T10:30:00Z")
}
```

### Audit Log Collection Schema

```javascript
{
  _id: ObjectId("..."),
  recordId: "FARM-001-CROP-2025-001",
  action: "CREATE",  // CREATE, UPDATE, DELETE, VERIFY
  
  oldData: null,  // For UPDATE only
  newData: { weight: 15.5, quality: "A" },
  oldHash: null,
  newHash: "abc123...",
  
  userId: "farmer@example.com",
  ipAddress: "203.154.123.45",
  userAgent: "Mozilla/5.0...",
  reason: "Initial harvest record",
  
  timestamp: ISODate("2025-11-03T10:30:00Z")
}
```

### IoT Readings Collection Schema (Timeseries)

```javascript
{
  _id: ObjectId("..."),
  timestamp: ISODate("2025-11-03T10:30:00Z"),
  
  metadata: {
    farmId: "FARM-001",
    plotId: "PLOT-A-01",
    deviceId: "SENSOR-12345",
    provider: "dygis",
    sensorType: "soil_moisture"
  },
  
  value: 65.5,
  unit: "%",
  batteryLevel: 85,
  signalStrength: -45
}
```

---

## 🔐 Security Configuration

### 1. Network Access (IP Whitelist)

**Development:**
```
0.0.0.0/0  # Allow from anywhere (CHANGE IN PRODUCTION!)
```

**Production (recommended):**
```
# EC2/ECS instances
52.74.123.45/32
52.74.123.46/32

# Office network
203.154.123.0/24

# VPN gateway
10.0.1.0/24
```

### 2. Database Users

| User | Role | Purpose | Access |
|------|------|---------|--------|
| `botanical_app` | readWrite | Application runtime | Full R/W on botanical_audit |
| `botanical_readonly` | read | Analytics/Reporting | Read-only on botanical_audit |
| `botanical_admin` | dbAdmin | Maintenance | Admin + R/W on botanical_audit |

### 3. Connection Strings

```bash
# Application (primary)
mongodb+srv://botanical_app:<password>@botanical-audit-prod.xxxxx.mongodb.net/botanical_audit?retryWrites=true&w=majority

# Read-only (analytics)
mongodb+srv://botanical_readonly:<password>@botanical-audit-prod.xxxxx.mongodb.net/botanical_audit?readPreference=secondaryPreferred

# Admin (maintenance)
mongodb+srv://botanical_admin:<password>@botanical-audit-prod.xxxxx.mongodb.net/botanical_audit?retryWrites=true&w=majority
```

---

## 📊 Monitoring & Alerts

### Enable MongoDB Atlas Monitoring

1. Go to Alerts → Add Alert
2. Configure alerts for:
   - CPU usage > 80% (5 min)
   - Disk usage > 90%
   - Connection count > 1000
   - Query execution time > 1s (P95)
   - Replica set election

3. Set notification channels:
   - Email: devops@botanical-audit.com
   - Slack: #alerts-production
   - PagerDuty (optional)

### Performance Metrics to Track

- **Query Performance**
  - Average query execution time
  - Slow queries (> 100ms)
  - Index hit ratio (target: > 95%)

- **Resource Usage**
  - CPU utilization (target: < 70%)
  - Memory usage (target: < 80%)
  - Disk IOPS
  - Network throughput

- **Connections**
  - Active connections
  - Connection pool size
  - Failed connection attempts

---

## 💾 Backup Configuration

### Atlas Continuous Backup

1. Go to Backup → Enable Continuous Backup
2. Configure snapshot schedule:
   - Hourly: Keep for 24 hours
   - Daily: Keep for 7 days
   - Weekly: Keep for 4 weeks
   - Monthly: Keep for 12 months

3. Configure restore window:
   - Point-in-time restore: Last 24 hours
   - Snapshot restore: Any snapshot

### Backup Testing

```bash
# Test restore monthly
1. Create test cluster: botanical-audit-test
2. Restore latest snapshot
3. Verify data integrity
4. Run test queries
5. Delete test cluster
```

---

## 🔧 Configuration in Application

### Environment Variables (.env)

```bash
# MongoDB Atlas Production
MONGODB_URI=mongodb+srv://botanical_app:<password>@botanical-audit-prod.xxxxx.mongodb.net/botanical_audit?retryWrites=true&w=majority
MONGODB_DATABASE=botanical_audit

# Connection Pool Settings
MONGODB_MIN_POOL_SIZE=10
MONGODB_MAX_POOL_SIZE=100
MONGODB_MAX_IDLE_TIME_MS=60000

# Timeouts
MONGODB_CONNECT_TIMEOUT_MS=10000
MONGODB_SOCKET_TIMEOUT_MS=45000
MONGODB_SERVER_SELECTION_TIMEOUT_MS=30000

# Retry Configuration
MONGODB_RETRY_WRITES=true
MONGODB_RETRY_READS=true
MONGODB_MAX_RETRY_TIME_MS=30000
```

### Connection Code (Node.js)

```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI, {
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 10,
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 100,
  maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS) || 60000,
  connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 10000,
  socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,
  serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 30000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  journal: true
});

async function connect() {
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB Atlas');
    
    // Verify connection
    await client.db().admin().ping();
    console.log('✓ MongoDB connection verified');
    
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}
```

---

## 🧪 Testing Connection

### Quick Test

```bash
# Using mongosh
mongosh "mongodb+srv://botanical_app:<password>@botanical-audit-prod.xxxxx.mongodb.net/botanical_audit"

# Test commands
use botanical_audit
db.runCommand({ ping: 1 })  # Should return { ok: 1 }
db.records.countDocuments()  # Should return 0 (initially)
db.getCollectionNames()  # Should list all collections
```

### Connection Test Script

```javascript
// test-mongodb-connection.js
const { MongoClient } = require('mongodb');

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✓ Connected successfully');
    
    const db = client.db('botanical_audit');
    
    // Test ping
    await db.admin().ping();
    console.log('✓ Ping successful');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log(`✓ Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Test write
    const testDoc = { test: true, timestamp: new Date() };
    await db.collection('records').insertOne(testDoc);
    console.log('✓ Write test successful');
    
    // Test read
    const doc = await db.collection('records').findOne({ test: true });
    console.log('✓ Read test successful:', doc);
    
    // Cleanup
    await db.collection('records').deleteOne({ test: true });
    console.log('✓ Cleanup successful');
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
```

Run test:
```bash
MONGODB_URI="mongodb+srv://..." node test-mongodb-connection.js
```

---

## 📈 Cost Estimate

### M10 Cluster (Production)

**Specifications:**
- Instance: M10 (2GB RAM, 10GB Storage)
- Region: AWS ap-southeast-1 (Bangkok)
- Replication: 3-node replica set
- Backup: Continuous backup enabled
- Auto-scaling: Enabled (M10 → M30)

**Monthly Cost:**
- Base M10 cluster: $60/month (~2,100฿)
- Backup storage (10GB): $2.50/month (~90฿)
- Data transfer (50GB): $5/month (~175฿)
- **Total: ~$67.50/month (~2,400฿)**

**Scaling Costs:**
- M20 (4GB RAM): $120/month (~4,200฿)
- M30 (8GB RAM): $240/month (~8,400฿)
- M40 (16GB RAM): $480/month (~16,800฿)

---

## 🚨 Troubleshooting

### Connection Timeout

**Problem:** `MongoServerSelectionError: connection timeout`

**Solutions:**
1. Check IP whitelist (make sure your IP is allowed)
2. Verify connection string is correct
3. Check if cluster is running (Atlas Dashboard)
4. Test with mongosh first

### Authentication Failed

**Problem:** `MongoServerError: Authentication failed`

**Solutions:**
1. Verify username/password are correct
2. Check user has correct roles
3. Ensure database name in connection string matches
4. Try URL-encoding special characters in password

### Slow Queries

**Problem:** Queries taking > 1 second

**Solutions:**
1. Check indexes are created correctly
2. Use `explain()` to analyze query plan
3. Enable profiler to find slow queries
4. Consider upgrading instance size

### Out of Storage

**Problem:** Cluster running out of disk space

**Solutions:**
1. Enable auto-scaling for storage
2. Clean up old data (audit_log is capped)
3. Archive historical data
4. Upgrade to larger instance

---

## ✅ Post-Setup Checklist

- [ ] Cluster created and running (IDLE state)
- [ ] IP whitelist configured (production IPs only)
- [ ] 3 database users created (app, readonly, admin)
- [ ] 7 collections created with indexes
- [ ] Connection string tested from application
- [ ] Credentials saved to AWS Secrets Manager
- [ ] Backup enabled and tested
- [ ] Monitoring alerts configured
- [ ] Security review completed
- [ ] Load testing performed
- [ ] Disaster recovery plan documented

---

## 📞 Support

**MongoDB Atlas Support:**
- Documentation: https://docs.atlas.mongodb.com
- Support Portal: https://support.mongodb.com
- Community: https://community.mongodb.com

**Internal Team:**
- DevOps: devops@botanical-audit.com
- Tech Lead: tech-lead@botanical-audit.com
- Emergency: +66-XXX-XXX-XXXX

---

**Last Updated:** November 3, 2025  
**Version:** 1.0.0  
**Owner:** Tech Lead
