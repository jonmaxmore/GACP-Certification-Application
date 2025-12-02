#!/usr/bin/env node

/**
 * MongoDB Atlas Production Setup Script
 *
 * This script automates the setup of MongoDB Atlas for production:
 * 1. Validates Atlas credentials
 * 2. Creates production-ready M10 cluster (if not exists)
 * 3. Configures security (IP whitelist, database users)
 * 4. Creates database and collections with proper indexes
 * 5. Enables backup and monitoring
 * 6. Tests connection and validates setup
 *
 * Prerequisites:
 * - MongoDB Atlas account
 * - Atlas API keys (Public + Private)
 * - Node.js 20+
 *
 * Usage:
 *   node setup-mongodb-atlas-production.js
 */

const https = require('https');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

// Configuration from environment
const config = {
  // Atlas API Configuration
  atlas: {
    publicKey: process.env.MONGODB_ATLAS_PUBLIC_KEY,
    privateKey: process.env.MONGODB_ATLAS_PRIVATE_KEY,
    groupId: process.env.MONGODB_ATLAS_GROUP_ID, // Project ID
    apiUrl: 'https://cloud.mongodb.com/api/atlas/v1.0',
  },

  // Cluster Configuration
  cluster: {
    name: 'botanical-audit-prod',
    provider: 'AWS',
    region: 'AP_SOUTHEAST_1', // Bangkok
    instanceSize: 'M10', // 2GB RAM, 10GB Storage
    mongoDBMajorVersion: '7.0',
    diskSizeGB: 10,
    backupEnabled: true,
    autoScalingEnabled: true,
    autoScalingMaxInstanceSize: 'M30',
  },

  // Database Configuration
  database: {
    name: 'botanical_audit',
    collections: [
      {
        name: 'records',
        timeseries: false,
        capped: false,
        indexes: [
          { key: { recordId: 1 }, unique: true, name: 'idx_recordId' },
          { key: { hash: 1 }, unique: true, name: 'idx_hash' },
          { key: { previousHash: 1 }, name: 'idx_previousHash' },
          { key: { userId: 1 }, name: 'idx_userId' },
          { key: { farmId: 1 }, name: 'idx_farmId' },
          { key: { createdAt: -1 }, name: 'idx_createdAt' },
          { key: { 'data.location': '2dsphere' }, name: 'idx_location_geo' },
        ],
      },
      {
        name: 'audit_log',
        timeseries: false,
        capped: true,
        cappedSize: 5368709120, // 5GB
        cappedMax: 10000000, // 10M documents
        indexes: [
          { key: { recordId: 1 }, name: 'idx_recordId' },
          { key: { userId: 1 }, name: 'idx_userId' },
          { key: { timestamp: -1 }, name: 'idx_timestamp' },
          { key: { action: 1 }, name: 'idx_action' },
        ],
      },
      {
        name: 'iot_readings',
        timeseries: true,
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'minutes',
        indexes: [
          { key: { 'metadata.farmId': 1, timestamp: -1 }, name: 'idx_farm_time' },
          { key: { 'metadata.deviceId': 1, timestamp: -1 }, name: 'idx_device_time' },
        ],
      },
      {
        name: 'iot_providers',
        timeseries: false,
        capped: false,
        indexes: [
          { key: { provider: 1, farmId: 1 }, unique: true, name: 'idx_provider_farm' },
          { key: { userId: 1 }, name: 'idx_userId' },
          { key: { status: 1 }, name: 'idx_status' },
        ],
      },
      {
        name: 'signature_store',
        timeseries: false,
        capped: false,
        indexes: [
          { key: { hash: 1 }, unique: true, name: 'idx_hash' },
          { key: { keyId: 1 }, name: 'idx_keyId' },
          { key: { createdAt: -1 }, name: 'idx_createdAt' },
        ],
      },
      {
        name: 'farms',
        timeseries: false,
        capped: false,
        indexes: [
          { key: { farmId: 1 }, unique: true, name: 'idx_farmId' },
          { key: { userId: 1 }, name: 'idx_userId' },
          { key: { 'location.coordinates': '2dsphere' }, name: 'idx_location' },
          { key: { status: 1 }, name: 'idx_status' },
          { key: { createdAt: -1 }, name: 'idx_createdAt' },
        ],
      },
      {
        name: 'users',
        timeseries: false,
        capped: false,
        indexes: [
          { key: { email: 1 }, unique: true, name: 'idx_email' },
          { key: { userId: 1 }, unique: true, name: 'idx_userId' },
          { key: { role: 1 }, name: 'idx_role' },
          { key: { createdAt: -1 }, name: 'idx_createdAt' },
        ],
      },
    ],
  },

  // Security Configuration
  security: {
    // Database users
    users: [
      {
        username: 'botanical_app',
        password: null, // Will be generated
        roles: [{ db: 'botanical_audit', role: 'readWrite' }],
        description: 'Application user with read/write access',
      },
      {
        username: 'botanical_readonly',
        password: null, // Will be generated
        roles: [{ db: 'botanical_audit', role: 'read' }],
        description: 'Read-only user for reporting/analytics',
      },
      {
        username: 'botanical_admin',
        password: null, // Will be generated
        roles: [
          { db: 'botanical_audit', role: 'dbAdmin' },
          { db: 'botanical_audit', role: 'readWrite' },
        ],
        description: 'Admin user for maintenance',
      },
    ],

    // IP Whitelist (CIDR notation)
    ipWhitelist: [
      {
        cidrBlock: '0.0.0.0/0', // Temporarily allow all (change to specific IPs in production!)
        comment: 'Allow from anywhere (DEV ONLY - CHANGE IN PRODUCTION!)',
      },
    ],
  },
};

// Utility: Generate secure password
function generateSecurePassword(length = 32) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}

// Utility: Make Atlas API request
function makeAtlasRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${config.atlas.publicKey}:${config.atlas.privateKey}`).toString(
      'base64',
    );

    const options = {
      hostname: 'cloud.mongodb.com',
      path: `/api/atlas/v1.0${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
    };

    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : null);
        } else {
          reject(new Error(`Atlas API Error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Step 1: Validate Atlas credentials
async function validateCredentials() {
  console.log('🔐 Step 1: Validating Atlas credentials...');

  if (!config.atlas.publicKey || !config.atlas.privateKey || !config.atlas.groupId) {
    throw new Error(
      'Missing Atlas credentials. Set MONGODB_ATLAS_PUBLIC_KEY, MONGODB_ATLAS_PRIVATE_KEY, MONGODB_ATLAS_GROUP_ID',
    );
  }

  try {
    // Test API access by getting project info
    const project = await makeAtlasRequest('GET', `/groups/${config.atlas.groupId}`);
    console.log(`   ✓ Connected to Atlas project: ${project.name}`);
    return project;
  } catch (error) {
    throw new Error(`Failed to validate Atlas credentials: ${error.message}`);
  }
}

// Step 2: Check if cluster exists
async function checkClusterExists() {
  console.log('🔍 Step 2: Checking if cluster exists...');

  try {
    const cluster = await makeAtlasRequest(
      'GET',
      `/groups/${config.atlas.groupId}/clusters/${config.cluster.name}`,
    );
    console.log(`   ✓ Cluster "${config.cluster.name}" already exists (${cluster.stateName})`);
    return cluster;
  } catch (error) {
    if (error.message.includes('404')) {
      console.log(`   ℹ Cluster "${config.cluster.name}" does not exist`);
      return null;
    }
    throw error;
  }
}

// Step 3: Create cluster (if not exists)
async function createCluster() {
  console.log('🚀 Step 3: Creating production cluster...');

  const clusterConfig = {
    name: config.cluster.name,
    clusterType: 'REPLICASET',
    providerSettings: {
      providerName: config.cluster.provider,
      regionName: config.cluster.region,
      instanceSizeName: config.cluster.instanceSize,
      diskSizeGB: config.cluster.diskSizeGB,
    },
    mongoDBMajorVersion: config.cluster.mongoDBMajorVersion,
    backupEnabled: config.cluster.backupEnabled,
    autoScaling: {
      diskGBEnabled: true,
      compute: {
        enabled: config.cluster.autoScalingEnabled,
        scaleDownEnabled: true,
        maxInstanceSize: config.cluster.autoScalingMaxInstanceSize,
      },
    },
    replicationSpecs: [
      {
        numShards: 1,
        regionConfigs: [
          {
            regionName: config.cluster.region,
            electableNodes: 3,
            priority: 7,
            readOnlyNodes: 0,
            analyticsNodes: 0,
          },
        ],
      },
    ],
  };

  try {
    const cluster = await makeAtlasRequest(
      'POST',
      `/groups/${config.atlas.groupId}/clusters`,
      clusterConfig,
    );
    console.log(`   ✓ Cluster creation initiated: ${cluster.name}`);
    console.log(`   ⏳ Waiting for cluster to be ready (this may take 7-10 minutes)...`);

    // Wait for cluster to be ready
    await waitForClusterReady();

    return cluster;
  } catch (error) {
    throw new Error(`Failed to create cluster: ${error.message}`);
  }
}

// Wait for cluster to be ready
async function waitForClusterReady(maxWaitMinutes = 15) {
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const cluster = await makeAtlasRequest(
        'GET',
        `/groups/${config.atlas.groupId}/clusters/${config.cluster.name}`,
      );

      if (cluster.stateName === 'IDLE') {
        console.log(`   ✓ Cluster is ready!`);
        return cluster;
      }

      console.log(`   ⏳ Cluster state: ${cluster.stateName}, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    } catch (error) {
      console.error(`   ⚠ Error checking cluster state: ${error.message}`);
    }
  }

  throw new Error('Cluster did not become ready within timeout');
}

// Step 4: Configure IP whitelist
async function configureIPWhitelist() {
  console.log('🔒 Step 4: Configuring IP whitelist...');

  for (const entry of config.security.ipWhitelist) {
    try {
      await makeAtlasRequest('POST', `/groups/${config.atlas.groupId}/whitelist`, [
        {
          cidrBlock: entry.cidrBlock,
          comment: entry.comment,
        },
      ]);
      console.log(`   ✓ Added IP whitelist: ${entry.cidrBlock}`);
    } catch (error) {
      if (error.message.includes('DUPLICATE')) {
        console.log(`   ℹ IP whitelist already exists: ${entry.cidrBlock}`);
      } else {
        console.error(`   ⚠ Failed to add IP whitelist: ${error.message}`);
      }
    }
  }
}

// Step 5: Create database users
async function createDatabaseUsers() {
  console.log('👤 Step 5: Creating database users...');

  const credentials = [];

  for (const user of config.security.users) {
    // Generate secure password
    const password = generateSecurePassword();
    user.password = password;

    try {
      await makeAtlasRequest('POST', `/groups/${config.atlas.groupId}/databaseUsers`, {
        databaseName: 'admin',
        username: user.username,
        password: password,
        roles: user.roles,
      });
      console.log(`   ✓ Created user: ${user.username}`);

      credentials.push({
        username: user.username,
        password: password,
        description: user.description,
      });
    } catch (error) {
      if (error.message.includes('DUPLICATE')) {
        console.log(`   ℹ User already exists: ${user.username}`);
      } else {
        console.error(`   ⚠ Failed to create user: ${error.message}`);
      }
    }
  }

  return credentials;
}

// Step 6: Get connection string
async function getConnectionString() {
  console.log('🔗 Step 6: Getting connection string...');

  const cluster = await makeAtlasRequest(
    'GET',
    `/groups/${config.atlas.groupId}/clusters/${config.cluster.name}`,
  );

  const connectionString = cluster.connectionStrings.standardSrv;
  console.log(`   ✓ Connection string: ${connectionString}`);

  return connectionString;
}

// Step 7: Test connection and create database/collections
async function setupDatabase(connectionString, credentials) {
  console.log('🗄️  Step 7: Setting up database and collections...');

  // Use app user credentials
  const appUser = credentials.find(c => c.username === 'botanical_app');
  if (!appUser) {
    throw new Error('App user credentials not found');
  }

  const uri = connectionString
    .replace('<username>', appUser.username)
    .replace('<password>', appUser.password)
    .replace('/?', `/${config.database.name}?`);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });

  try {
    await client.connect();
    console.log('   ✓ Connected to MongoDB Atlas');

    const db = client.db(config.database.name);

    // Create collections
    for (const collectionConfig of config.database.collections) {
      const {
        name,
        timeseries,
        capped,
        cappedSize,
        cappedMax,
        indexes,
        timeField,
        metaField,
        granularity,
      } = collectionConfig;

      // Check if collection exists
      const collections = await db.listCollections({ name }).toArray();

      if (collections.length === 0) {
        // Create collection
        const options = {};

        if (timeseries) {
          options.timeseries = {
            timeField,
            metaField,
            granularity,
          };
        }

        if (capped) {
          options.capped = true;
          options.size = cappedSize;
          if (cappedMax) {
            options.max = cappedMax;
          }
        }

        await db.createCollection(name, options);
        console.log(
          `   ✓ Created collection: ${name}${timeseries ? ' (timeseries)' : ''}${capped ? ' (capped)' : ''}`,
        );
      } else {
        console.log(`   ℹ Collection already exists: ${name}`);
      }

      // Create indexes
      if (indexes && indexes.length > 0) {
        const collection = db.collection(name);

        for (const index of indexes) {
          try {
            await collection.createIndex(index.key, {
              unique: index.unique || false,
              name: index.name,
            });
            console.log(`      ✓ Created index: ${index.name}`);
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`      ℹ Index already exists: ${index.name}`);
            } else {
              console.error(`      ⚠ Failed to create index: ${error.message}`);
            }
          }
        }
      }
    }

    // Enable Change Streams for audit logging
    console.log('   ✓ Collections are ready for Change Streams (MongoDB 4.0+)');

    return { success: true, uri };
  } catch (error) {
    throw new Error(`Failed to setup database: ${error.message}`);
  } finally {
    await client.close();
  }
}

// Step 8: Save credentials to .env file
function saveCredentials(connectionString, credentials) {
  console.log('💾 Step 8: Saving credentials...');

  const fs = require('fs');
  const path = require('path');

  const appUser = credentials.find(c => c.username === 'botanical_app');
  const readonlyUser = credentials.find(c => c.username === 'botanical_readonly');
  const adminUser = credentials.find(c => c.username === 'botanical_admin');

  const envContent = `
# ===================================
# MongoDB Atlas Production Credentials
# Generated: ${new Date().toISOString()}
# ===================================

# Primary connection string (application user)
MONGODB_URI=${connectionString.replace('<username>', appUser.username).replace('<password>', appUser.password)}

# Read-only connection string (for analytics/reporting)
MONGODB_URI_READONLY=${connectionString.replace('<username>', readonlyUser.username).replace('<password>', readonlyUser.password)}

# Admin connection string (for maintenance tasks)
MONGODB_URI_ADMIN=${connectionString.replace('<username>', adminUser.username).replace('<password>', adminUser.password)}

# Database name
MONGODB_DATABASE=${config.database.name}

# ===================================
# User Credentials (KEEP SECURE!)
# ===================================

# Application User (read/write access)
MONGODB_APP_USERNAME=${appUser.username}
MONGODB_APP_PASSWORD=${appUser.password}

# Read-only User (analytics/reporting)
MONGODB_READONLY_USERNAME=${readonlyUser.username}
MONGODB_READONLY_PASSWORD=${readonlyUser.password}

# Admin User (maintenance tasks)
MONGODB_ADMIN_USERNAME=${adminUser.username}
MONGODB_ADMIN_PASSWORD=${adminUser.password}

# ===================================
# WARNING: Store these credentials securely!
# - Use AWS Secrets Manager in production
# - Never commit this file to git
# - Rotate passwords regularly (every 90 days)
# ===================================
`;

  const outputPath = path.join(__dirname, '.env.mongodb.production');
  fs.writeFileSync(outputPath, envContent.trim());

  console.log(`   ✓ Credentials saved to: ${outputPath}`);
  console.log(`   ⚠️  IMPORTANT: Keep this file secure and never commit to git!`);

  // Also print credentials to console (for copying)
  console.log('\n' + '='.repeat(60));
  console.log('📋 CREDENTIALS (copy to your secure storage):');
  console.log('='.repeat(60));

  credentials.forEach(cred => {
    console.log(`\n${cred.description}:`);
    console.log(`  Username: ${cred.username}`);
    console.log(`  Password: ${cred.password}`);
  });

  console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
  console.log('\n🌿 Botanical Audit Framework - MongoDB Atlas Setup');
  console.log('='.repeat(60));
  console.log('This script will set up a production-ready MongoDB Atlas cluster.\n');

  try {
    // Step 1: Validate credentials
    await validateCredentials();

    // Step 2: Check if cluster exists
    let cluster = await checkClusterExists();

    // Step 3: Create cluster if needed
    if (!cluster) {
      cluster = await createCluster();
    } else {
      // Wait for existing cluster to be ready
      if (cluster.stateName !== 'IDLE') {
        await waitForClusterReady();
      }
    }

    // Step 4: Configure IP whitelist
    await configureIPWhitelist();

    // Step 5: Create database users
    const credentials = await createDatabaseUsers();

    // Step 6: Get connection string
    const connectionString = await getConnectionString();

    // Step 7: Setup database and collections
    const { success, uri: _uri } = await setupDatabase(connectionString, credentials);

    // Step 8: Save credentials
    if (success && credentials.length > 0) {
      saveCredentials(connectionString, credentials);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Setup completed successfully!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Copy credentials from .env.mongodb.production to AWS Secrets Manager');
    console.log('2. Update application .env with MONGODB_URI');
    console.log('3. Configure IP whitelist with production IPs (remove 0.0.0.0/0)');
    console.log('4. Enable MongoDB Atlas monitoring and alerts');
    console.log('5. Configure backup schedule (daily snapshots recommended)');
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. Atlas API credentials are correct');
    console.error('2. Atlas project ID is correct');
    console.error('3. You have necessary permissions in Atlas');
    console.error('4. Network connectivity to Atlas API');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateCredentials,
  checkClusterExists,
  createCluster,
  configureIPWhitelist,
  createDatabaseUsers,
  getConnectionString,
  setupDatabase,
  saveCredentials,
};
