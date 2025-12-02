/**
 * GACP Platform - Production Database Setup
 * Purpose: Initialize MongoDB Atlas production database with collections and indexes
 * Version: 2.0.0
 * Created: October 15, 2025
 *
 * PRODUCTION REQUIREMENTS:
 * - MongoDB Atlas M10 cluster or higher
 * - IP whitelist configured
 * - Database user with readWrite permissions
 * - Connection string in .env file
 */

const logger = require('shared/logger/logger');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// Production-grade collection definitions
const collections = [
  {
    name: 'users',
    indexes: [
      { key: { email: 1 }, unique: true, name: 'idx_users_email' },
      { key: { nationalId: 1 }, unique: true, sparse: true, name: 'idx_users_nationalId' },
      { key: { phoneNumber: 1 }, name: 'idx_users_phone' },
      { key: { role: 1, isActive: 1 }, name: 'idx_users_role_active' },
      { key: { createdAt: -1 }, name: 'idx_users_created' },
    ],
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'password', 'role'],
        properties: {
          email: {
            bsonType: 'string',
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          },
          role: { enum: ['farmer', 'inspector', 'admin', 'super_admin'] },
        },
      },
    },
  },
  {
    name: 'applications',
    indexes: [
      { key: { applicationNumber: 1 }, unique: true, name: 'idx_applications_number' },
      { key: { farmerId: 1, status: 1 }, name: 'idx_applications_farmer_status' },
      { key: { status: 1, createdAt: -1 }, name: 'idx_applications_status_date' },
      { key: { 'farm.province': 1 }, name: 'idx_applications_province' },
    ],
  },
  {
    name: 'certificates',
    indexes: [
      { key: { certificateNumber: 1 }, unique: true, name: 'idx_certificates_number' },
      { key: { applicationId: 1 }, unique: true, name: 'idx_certificates_application' },
      { key: { farmerId: 1, status: 1 }, name: 'idx_certificates_farmer_status' },
      { key: { expiryDate: 1 }, name: 'idx_certificates_expiry' },
      { key: { status: 1, issueDate: -1 }, name: 'idx_certificates_status_date' },
    ],
  },
  {
    name: 'qrCodes',
    indexes: [
      { key: { qrCode: 1 }, unique: true, name: 'idx_qr_code' },
      { key: { certificateId: 1 }, name: 'idx_qr_certificate' },
      { key: { scannedCount: -1 }, name: 'idx_qr_scanned' },
      { key: { createdAt: -1 }, name: 'idx_qr_created' },
    ],
  },
  {
    name: 'farms',
    indexes: [
      { key: { farmCode: 1 }, unique: true, sparse: true, name: 'idx_farms_code' },
      { key: { ownerId: 1 }, name: 'idx_farms_owner' },
      { key: { 'address.province': 1, 'address.district': 1 }, name: 'idx_farms_location' },
      { key: { status: 1 }, name: 'idx_farms_status' },
    ],
  },
  {
    name: 'inspections',
    indexes: [
      { key: { applicationId: 1 }, name: 'idx_inspections_application' },
      { key: { inspectorId: 1, scheduledDate: -1 }, name: 'idx_inspections_inspector_date' },
      { key: { status: 1, scheduledDate: 1 }, name: 'idx_inspections_status_date' },
    ],
  },
  {
    name: 'payments',
    indexes: [
      { key: { paymentNumber: 1 }, unique: true, name: 'idx_payments_number' },
      { key: { applicationId: 1 }, name: 'idx_payments_application' },
      { key: { status: 1, createdAt: -1 }, name: 'idx_payments_status_date' },
      { key: { userId: 1 }, name: 'idx_payments_user' },
    ],
  },
  {
    name: 'documents',
    indexes: [
      { key: { entityType: 1, entityId: 1 }, name: 'idx_documents_entity' },
      { key: { uploadedBy: 1, createdAt: -1 }, name: 'idx_documents_uploader' },
      { key: { status: 1 }, name: 'idx_documents_status' },
    ],
  },
  {
    name: 'auditLogs',
    indexes: [
      { key: { userId: 1, timestamp: -1 }, name: 'idx_audit_user_time' },
      { key: { action: 1, timestamp: -1 }, name: 'idx_audit_action_time' },
      { key: { entityType: 1, entityId: 1 }, name: 'idx_audit_entity' },
      { key: { timestamp: -1 }, name: 'idx_audit_time', expireAfterSeconds: 7776000 }, // 90 days
    ],
  },
  {
    name: 'notifications',
    indexes: [
      { key: { userId: 1, read: 1, createdAt: -1 }, name: 'idx_notifications_user' },
      { key: { type: 1, createdAt: -1 }, name: 'idx_notifications_type' },
      { key: { createdAt: -1 }, name: 'idx_notifications_cleanup', expireAfterSeconds: 2592000 }, // 30 days
    ],
  },
  {
    name: 'sessions',
    indexes: [
      { key: { sessionId: 1 }, unique: true, name: 'idx_sessions_id' },
      { key: { userId: 1 }, name: 'idx_sessions_user' },
      { key: { expiresAt: 1 }, name: 'idx_sessions_ttl', expireAfterSeconds: 0 },
    ],
  },
  {
    name: 'otpRecords',
    indexes: [
      { key: { identifier: 1, type: 1 }, name: 'idx_otp_identifier' },
      { key: { createdAt: 1 }, name: 'idx_otp_ttl', expireAfterSeconds: 600 }, // 10 minutes
    ],
  },
];

async function setupProductionDatabase() {
  let client;
  const startTime = Date.now();

  logger.info('\n' + '='.repeat(70));
  logger.info('🚀 GACP Platform - Production Database Setup');
  logger.info('='.repeat(70) + '\n');

  try {
    // Validate environment
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not configured in .env file');
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.warn('⚠️  WARNING: NODE_ENV is not set to "production"');
      logger.warn('   Current environment:', process.env.NODE_ENV || 'undefined');
      logger.warn('   Continue? (Press Ctrl+C to cancel);\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Connect to MongoDB Atlas
    logger.info('📡 Connecting to MongoDB Atlas...');
    logger.info('   Database:', process.env.MONGODB_DATABASE);

    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 120000,
    });

    await client.connect();
    logger.info('✅ Connected to MongoDB Atlas\n');

    const db = client.db(process.env.MONGODB_DATABASE);

    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = new Set(existingCollections.map(c => c.name));

    logger.info('📊 Database Statistics:');
    const stats = await db.stats();
    logger.info(`   Collections: ${stats.collections}`);
    logger.info(`   Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`   Indexes: ${stats.indexes}\n`);

    logger.info('📋 Setting up collections and indexes...\n');

    let created = 0;
    let updated = 0;
    let totalIndexes = 0;

    for (const collectionDef of collections) {
      const { name, indexes, validator } = collectionDef;

      try {
        // Create or modify collection
        if (!existingNames.has(name)) {
          const options = {};
          if (validator) {
            options.validator = validator;
          }

          await db.createCollection(name, options);
          logger.info(`  ✅ Created collection: ${name}`);
          created++;
        } else {
          logger.info(`  ℹ️  Collection exists: ${name}`);
          updated++;

          // Update validator if provided
          if (validator) {
            await db.command({
              collMod: name,
              validator: validator,
              validationLevel: 'moderate',
            });
            logger.info('     📝 Updated validator');
          }
        }

        // Create indexes
        const collection = db.collection(name);

        for (const indexDef of indexes) {
          try {
            const { key, ...options } = indexDef;
            await collection.createIndex(key, options);
            totalIndexes++;
          } catch (err) {
            if (err.code !== 85 && err.code !== 86) {
              logger.warn(`     ⚠️  Index warning: ${err.message}`);
            }
          }
        }

        logger.info(`     📊 ${indexes.length} indexes configured\n`);
      } catch (err) {
        logger.error(`  ❌ Error with collection ${name}:`, err.message);
      }
    }

    // Create default admin user if users collection is empty
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();

    if (userCount === 0) {
      logger.info('👤 Creating default admin user...');

      const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@2025';
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await usersCollection.insertOne({
        email: 'admin@gacp-platform.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'super_admin',
        phoneNumber: '+66000000000',
        isActive: true,
        isVerified: true,
        mustChangePassword: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info('   ✅ Admin user created');
      logger.info('   Email: admin@gacp-platform.com');
      logger.info('   Password:', adminPassword);
      logger.info('   ⚠️  IMPORTANT: Change this password immediately!\n');
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.info('='.repeat(70));
    logger.info('🎉 Database setup completed successfully!');
    logger.info('='.repeat(70));
    logger.info('\n📊 Summary:');
    logger.info(`   Collections created: ${created}`);
    logger.info(`   Collections updated: ${updated}`);
    logger.info(`   Total indexes: ${totalIndexes}`);
    logger.info(`   Execution time: ${duration}s`);
    logger.info('\n✨ Your production database is ready!');
    logger.info('🚀 Next: Start the application with production settings\n');
  } catch (error) {
    logger.error('\n' + '='.repeat(70));
    logger.error('❌ Setup failed:', error.message);
    logger.error('='.repeat(70));
    logger.error('\n💡 Troubleshooting:');
    logger.error('   1. Verify MONGODB_URI in .env file');
    logger.error('   2. Check IP whitelist in MongoDB Atlas');
    logger.error('   3. Verify database user permissions');
    logger.error('   4. Ensure cluster is running\n');
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      logger.info('👋 Connection closed.\n');
    }
  }
}

// Run setup
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = { setupProductionDatabase };
