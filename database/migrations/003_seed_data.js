/**
 * Migration 003 - Seed Data
 * Create initial test users and data
 *
 * @module database/migrations/003_seed_data
 * @date 2025-10-16
 * @version 1.0.0
 */

const bcrypt = require('bcrypt');

module.exports = {
  /**
   * Run migration (up)
   */
  async up(db) {
    console.log('🚀 Running Migration 003: Seed Data...');

    try {
      // ========================================
      // 1. CREATE ADMIN USER
      // ========================================

      console.log('  👤 Creating admin user...');

      const adminPasswordHash = await bcrypt.hash('Admin@GACP2025', 12);

      await db.collection('users').insertOne({
        userId: 'USR-2025-ADMIN001',
        email: 'admin@gacp.platform',
        passwordHash: adminPasswordHash,
        thaiId: null,
        thaiIdVerified: false,
        passwordChangedAt: null,
        loginAttempts: 0,
        accountLocked: false,
        accountLockedUntil: null,
        fullName: 'System Administrator',
        phoneNumber: null,
        phoneVerified: false,
        role: 'ADMIN',
        permissions: ['*'],
        status: 'ACTIVE',
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        lastLoginAt: null,
        lastLoginIp: null,
        loginHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      });

      console.log('    ✅ Admin user created');
      console.log('       Email: admin@gacp.platform');
      console.log('       Password: Admin@GACP2025\n');

      // ========================================
      // 2. CREATE DTAM TEST USERS
      // ========================================

      console.log('  👥 Creating DTAM test users...');

      const dtamUsers = [
        {
          userId: 'USR-2025-DTAM001',
          email: 'dtam.reviewer1@gacp.platform',
          fullName: 'วิชัย ทีมงาน',
          phoneNumber: '0821234567'
        },
        {
          userId: 'USR-2025-DTAM002',
          email: 'dtam.reviewer2@gacp.platform',
          fullName: 'สมหญิง ตรวจสอบ',
          phoneNumber: '0821234568'
        },
        {
          userId: 'USR-2025-DTAM003',
          email: 'dtam.inspector@gacp.platform',
          fullName: 'ประเสริฐ ตรวจเยี่ยม',
          phoneNumber: '0821234569'
        }
      ];

      const dtamPasswordHash = await bcrypt.hash('DTAM@GACP2025', 12);

      for (const dtamUser of dtamUsers) {
        await db.collection('users').insertOne({
          userId: dtamUser.userId,
          email: dtamUser.email,
          passwordHash: dtamPasswordHash,
          thaiId: null,
          thaiIdVerified: false,
          passwordChangedAt: null,
          loginAttempts: 0,
          accountLocked: false,
          accountLockedUntil: null,
          fullName: dtamUser.fullName,
          phoneNumber: dtamUser.phoneNumber,
          phoneVerified: true,
          role: 'DTAM',
          permissions: [
            'application:read:all',
            'application:review',
            'application:approve',
            'certificate:issue',
            'certificate:revoke'
          ],
          status: 'ACTIVE',
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          lastLoginAt: null,
          lastLoginIp: null,
          loginHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        });

        console.log(`    ✅ DTAM user created: ${dtamUser.email}`);
      }

      console.log('       Password (all DTAM): DTAM@GACP2025\n');

      // ========================================
      // 3. CREATE FARMER TEST USERS
      // ========================================

      console.log('  🌱 Creating farmer test users...');

      const farmerUsers = [
        {
          userId: 'USR-2025-FARMER01',
          email: 'farmer1@example.com',
          fullName: 'สมชาย ใจดี',
          phoneNumber: '0812345678',
          thaiId: '1234567890123'
        },
        {
          userId: 'USR-2025-FARMER02',
          email: 'farmer2@example.com',
          fullName: 'สมหมาย รักษ์สวน',
          phoneNumber: '0812345679',
          thaiId: '1234567890124'
        }
      ];

      const farmerPasswordHash = await bcrypt.hash('Farmer@123', 12);

      for (const farmerUser of farmerUsers) {
        await db.collection('users').insertOne({
          userId: farmerUser.userId,
          email: farmerUser.email,
          passwordHash: farmerPasswordHash,
          thaiId: farmerUser.thaiId,
          thaiIdVerified: true,
          passwordChangedAt: null,
          loginAttempts: 0,
          accountLocked: false,
          accountLockedUntil: null,
          fullName: farmerUser.fullName,
          phoneNumber: farmerUser.phoneNumber,
          phoneVerified: true,
          role: 'FARMER',
          permissions: [
            'application:create',
            'application:read:own',
            'application:update:own',
            'document:upload:own',
            'certificate:read:own'
          ],
          status: 'ACTIVE',
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          lastLoginAt: null,
          lastLoginIp: null,
          loginHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        });

        console.log(`    ✅ Farmer user created: ${farmerUser.email}`);
      }

      console.log('       Password (all farmers): Farmer@123\n');

      // ========================================
      // 4. CREATE AUDIT LOG GENESIS ENTRY
      // ========================================

      console.log('  📝 Creating audit log genesis entry...');

      const crypto = require('crypto');

      const genesisLog = {
        logId: 'LOG-2025-GENESIS01',
        sequenceNumber: 1,
        category: 'SYSTEM',
        action: 'SYSTEM_INITIALIZED',
        severity: 'INFO',
        actorId: 'SYSTEM',
        actorType: 'SYSTEM',
        actorEmail: null,
        actorRole: 'SYSTEM',
        resourceType: 'SYSTEM',
        resourceId: 'GACP-PLATFORM',
        ipAddress: '127.0.0.1',
        userAgent: 'MongoDB Migration Script',
        metadata: {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          message: 'GACP Platform initialized successfully'
        },
        result: 'SUCCESS',
        errorCode: null,
        errorMessage: null,
        previousHash: '0'.repeat(64), // Genesis block
        currentHash: '',
        hashAlgorithm: 'SHA-256',
        timestamp: new Date()
      };

      // Calculate genesis hash
      const genesisData = {
        logId: genesisLog.logId,
        sequenceNumber: genesisLog.sequenceNumber,
        category: genesisLog.category,
        action: genesisLog.action,
        actorId: genesisLog.actorId,
        resourceType: genesisLog.resourceType,
        resourceId: genesisLog.resourceId,
        timestamp: genesisLog.timestamp.toISOString(),
        previousHash: genesisLog.previousHash,
        result: genesisLog.result
      };

      genesisLog.currentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(genesisData))
        .digest('hex');

      await db.collection('audit_logs').insertOne(genesisLog);

      console.log('    ✅ Genesis audit log created');
      console.log(`       Hash: ${genesisLog.currentHash}\n`);

      // ========================================
      // 5. SUCCESS MESSAGE
      // ========================================

      console.log('✅ Migration 003 completed successfully');
      console.log('📊 Data seeded:');
      console.log('   - 1 Admin user');
      console.log('   - 3 DTAM users');
      console.log('   - 2 Farmer users');
      console.log('   - 1 Genesis audit log\n');
      console.log('🔐 Test Credentials:');
      console.log('   Admin:   admin@gacp.platform / Admin@GACP2025');
      console.log('   DTAM:    dtam.reviewer1@gacp.platform / DTAM@GACP2025');
      console.log('   Farmer:  farmer1@example.com / Farmer@123\n');
    } catch (error) {
      console.error('❌ Migration 003 failed:', error.message);
      throw error;
    }
  },

  /**
   * Rollback migration (down)
   */
  async down(db) {
    console.log('🔄 Rolling back Migration 003: Seed Data...');

    try {
      // Delete seed users
      const userIds = [
        'USR-2025-ADMIN001',
        'USR-2025-DTAM001',
        'USR-2025-DTAM002',
        'USR-2025-DTAM003',
        'USR-2025-FARMER01',
        'USR-2025-FARMER02'
      ];

      const deleteResult = await db.collection('users').deleteMany({
        userId: { $in: userIds }
      });

      console.log(`  ✅ Deleted ${deleteResult.deletedCount} seed users`);

      // Delete genesis audit log
      await db.collection('audit_logs').deleteOne({
        logId: 'LOG-2025-GENESIS01'
      });

      console.log('  ✅ Deleted genesis audit log');
      console.log('✅ Rollback completed successfully\n');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }
};
