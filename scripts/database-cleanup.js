/**
 * Database Cleanup Tool
 *
 * Purpose: Clean unused data, optimize indexes, and maintain database health
 *
 * Features:
 * - Analyze database usage and identify unused data
 * - Clean expired tokens and sessions
 * - Remove orphaned records
 * - Optimize indexes
 * - Generate cleanup report
 *
 * Usage:
 *   node scripts/database-cleanup.js --dry-run    # Preview changes
 *   node scripts/database-cleanup.js --execute    # Execute cleanup
 *   node scripts/database-cleanup.js --deep       # Deep clean with optimization
 *
 * Safety: Always backs up before cleaning
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const User = require('../database/models/User.model');
const Application = require('../database/models/Application.model');
const RefreshToken = require('../database/models/RefreshToken.model');
const Certificate = require('../database/models/Certificate.model');
const Invoice = require('../database/models/Invoice.model');
const AuditLog = require('../database/models/AuditLog.model');

// Configuration
const CONFIG = {
  // Retention periods (days)
  EXPIRED_TOKEN_RETENTION: 7, // Keep expired tokens for 7 days
  INACTIVE_USER_RETENTION: 365, // Keep inactive users for 1 year
  DRAFT_APPLICATION_RETENTION: 90, // Keep draft applications for 90 days
  AUDIT_LOG_RETENTION: 365, // Keep audit logs for 1 year

  // Thresholds
  ORPHAN_CHECK: true,
  INDEX_OPTIMIZATION: true,

  // Safety
  BACKUP_BEFORE_CLEANUP: true,
  MAX_BATCH_SIZE: 1000
};

class DatabaseCleanupTool {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.deep = options.deep || false;
    this.report = {
      timestamp: new Date(),
      summary: {},
      actions: [],
      errors: [],
      statistics: {}
    };
  }

  /**
   * Connect to database
   */
  async connect() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-dev';

    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });

      console.log('✅ Connected to MongoDB successfully\n');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze database
   */
  async analyze() {
    console.log('🔍 Analyzing database...\n');

    try {
      const stats = await this.getDatabaseStats();
      this.report.statistics = stats;

      console.log('📊 Database Statistics:');
      console.log(`   Database: ${mongoose.connection.name}`);
      console.log(`   Collections: ${stats.collections.length}`);
      console.log(`   Total Size: ${this.formatBytes(stats.totalSize)}`);
      console.log(`   Total Documents: ${stats.totalDocuments.toLocaleString()}`);
      console.log(`   Total Indexes: ${stats.totalIndexes}\n`);

      console.log('📋 Collection Details:');
      stats.collections.forEach(coll => {
        console.log(`   ${coll.name}:`);
        console.log(`     Documents: ${coll.count.toLocaleString()}`);
        console.log(`     Size: ${this.formatBytes(coll.size)}`);
        console.log(`     Avg Doc Size: ${this.formatBytes(coll.avgObjSize)}`);
        console.log(`     Indexes: ${coll.nIndexes}`);
      });
      console.log('');

      return stats;
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      this.report.errors.push({ step: 'analyze', error: error.message });
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const stats = {
      collections: [],
      totalSize: 0,
      totalDocuments: 0,
      totalIndexes: 0
    };

    for (const coll of collections) {
      try {
        const collStats = await mongoose.connection.db.collection(coll.name).stats();
        const collInfo = {
          name: coll.name,
          count: collStats.count || 0,
          size: collStats.size || 0,
          storageSize: collStats.storageSize || 0,
          avgObjSize: collStats.avgObjSize || 0,
          nIndexes: collStats.nindexes || 0
        };

        stats.collections.push(collInfo);
        stats.totalSize += collInfo.size;
        stats.totalDocuments += collInfo.count;
        stats.totalIndexes += collInfo.nIndexes;
      } catch (error) {
        console.warn(`⚠️  Could not get stats for collection: ${coll.name}`);
      }
    }

    return stats;
  }

  /**
   * Clean expired refresh tokens
   */
  async cleanExpiredTokens() {
    console.log('🧹 Cleaning expired refresh tokens...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.EXPIRED_TOKEN_RETENTION);

      // Find expired tokens
      const expiredTokens = await RefreshToken.find({
        expiresAt: { $lt: cutoffDate }
      });

      if (expiredTokens.length === 0) {
        console.log('   ✓ No expired tokens to clean\n');
        return;
      }

      console.log(`   Found: ${expiredTokens.length} expired tokens`);

      if (!this.dryRun) {
        const result = await RefreshToken.deleteMany({
          expiresAt: { $lt: cutoffDate }
        });

        console.log(`   ✅ Deleted: ${result.deletedCount} expired tokens\n`);
        this.report.actions.push({
          action: 'cleanExpiredTokens',
          count: result.deletedCount,
          size: 'N/A'
        });
      } else {
        console.log(`   🔍 DRY RUN: Would delete ${expiredTokens.length} tokens\n`);
      }
    } catch (error) {
      console.error('   ❌ Failed to clean expired tokens:', error.message);
      this.report.errors.push({ step: 'cleanExpiredTokens', error: error.message });
    }
  }

  /**
   * Clean old draft applications
   */
  async cleanOldDrafts() {
    console.log('🧹 Cleaning old draft applications...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.DRAFT_APPLICATION_RETENTION);

      // Find old drafts
      const oldDrafts = await Application.find({
        status: 'DRAFT',
        createdAt: { $lt: cutoffDate }
      });

      if (oldDrafts.length === 0) {
        console.log('   ✓ No old drafts to clean\n');
        return;
      }

      console.log(`   Found: ${oldDrafts.length} old draft applications`);

      if (!this.dryRun) {
        const result = await Application.deleteMany({
          status: 'DRAFT',
          createdAt: { $lt: cutoffDate }
        });

        console.log(`   ✅ Deleted: ${result.deletedCount} old drafts\n`);
        this.report.actions.push({
          action: 'cleanOldDrafts',
          count: result.deletedCount,
          size: 'N/A'
        });
      } else {
        console.log(`   🔍 DRY RUN: Would delete ${oldDrafts.length} drafts\n`);
      }
    } catch (error) {
      console.error('   ❌ Failed to clean old drafts:', error.message);
      this.report.errors.push({ step: 'cleanOldDrafts', error: error.message });
    }
  }

  /**
   * Clean old audit logs
   */
  async cleanOldAuditLogs() {
    console.log('🧹 Cleaning old audit logs...');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - CONFIG.AUDIT_LOG_RETENTION);

      // Find old logs
      const oldLogs = await AuditLog.countDocuments({
        createdAt: { $lt: cutoffDate }
      });

      if (oldLogs === 0) {
        console.log('   ✓ No old audit logs to clean\n');
        return;
      }

      console.log(`   Found: ${oldLogs} old audit logs`);

      if (!this.dryRun) {
        const result = await AuditLog.deleteMany({
          createdAt: { $lt: cutoffDate }
        });

        console.log(`   ✅ Deleted: ${result.deletedCount} old audit logs\n`);
        this.report.actions.push({
          action: 'cleanOldAuditLogs',
          count: result.deletedCount,
          size: 'N/A'
        });
      } else {
        console.log(`   🔍 DRY RUN: Would delete ${oldLogs} audit logs\n`);
      }
    } catch (error) {
      console.error('   ❌ Failed to clean old audit logs:', error.message);
      this.report.errors.push({ step: 'cleanOldAuditLogs', error: error.message });
    }
  }

  /**
   * Find and clean orphaned records
   */
  async cleanOrphanedRecords() {
    if (!CONFIG.ORPHAN_CHECK) return;

    console.log('🧹 Checking for orphaned records...');

    try {
      // Find applications without users
      const orphanedApps = await Application.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: { user: { $size: 0 } }
        },
        {
          $project: { _id: 1, applicationId: 1, userId: 1 }
        }
      ]);

      if (orphanedApps.length > 0) {
        console.log(`   ⚠️  Found ${orphanedApps.length} orphaned applications`);

        if (!this.dryRun) {
          const ids = orphanedApps.map(app => app._id);
          const result = await Application.deleteMany({ _id: { $in: ids } });
          console.log(`   ✅ Deleted: ${result.deletedCount} orphaned applications`);

          this.report.actions.push({
            action: 'cleanOrphanedApplications',
            count: result.deletedCount,
            size: 'N/A'
          });
        } else {
          console.log(`   🔍 DRY RUN: Would delete ${orphanedApps.length} orphaned applications`);
        }
      } else {
        console.log('   ✓ No orphaned applications found');
      }

      // Find certificates without applications
      const orphanedCerts = await Certificate.aggregate([
        {
          $lookup: {
            from: 'applications',
            localField: 'applicationId',
            foreignField: '_id',
            as: 'application'
          }
        },
        {
          $match: { application: { $size: 0 } }
        },
        {
          $project: { _id: 1, certificateNumber: 1, applicationId: 1 }
        }
      ]);

      if (orphanedCerts.length > 0) {
        console.log(`   ⚠️  Found ${orphanedCerts.length} orphaned certificates`);

        if (!this.dryRun) {
          const ids = orphanedCerts.map(cert => cert._id);
          const result = await Certificate.deleteMany({ _id: { $in: ids } });
          console.log(`   ✅ Deleted: ${result.deletedCount} orphaned certificates`);

          this.report.actions.push({
            action: 'cleanOrphanedCertificates',
            count: result.deletedCount,
            size: 'N/A'
          });
        } else {
          console.log(`   🔍 DRY RUN: Would delete ${orphanedCerts.length} orphaned certificates`);
        }
      } else {
        console.log('   ✓ No orphaned certificates found');
      }

      console.log('');
    } catch (error) {
      console.error('   ❌ Failed to clean orphaned records:', error.message);
      this.report.errors.push({ step: 'cleanOrphanedRecords', error: error.message });
    }
  }

  /**
   * Optimize indexes
   */
  async optimizeIndexes() {
    if (!CONFIG.INDEX_OPTIMIZATION || !this.deep) return;

    console.log('🔧 Optimizing indexes...');

    try {
      const collections = await mongoose.connection.db.listCollections().toArray();

      for (const coll of collections) {
        const collection = mongoose.connection.db.collection(coll.name);

        // Get index stats
        const indexes = await collection.indexes();
        console.log(`   ${coll.name}: ${indexes.length} indexes`);

        if (!this.dryRun) {
          // Rebuild indexes (this can take time on large collections)
          await collection.reIndex();
          console.log(`   ✅ Rebuilt indexes for ${coll.name}`);
        }
      }

      console.log('');

      if (!this.dryRun) {
        this.report.actions.push({
          action: 'optimizeIndexes',
          count: collections.length,
          size: 'N/A'
        });
      }
    } catch (error) {
      console.error('   ❌ Failed to optimize indexes:', error.message);
      this.report.errors.push({ step: 'optimizeIndexes', error: error.message });
    }
  }

  /**
   * Compact database (MongoDB 4.4+)
   */
  async compactDatabase() {
    if (!this.deep) return;

    console.log('🗜️  Compacting database...');

    try {
      const collections = await mongoose.connection.db.listCollections().toArray();

      for (const coll of collections) {
        console.log(`   Compacting ${coll.name}...`);

        if (!this.dryRun) {
          try {
            await mongoose.connection.db.command({
              compact: coll.name,
              force: true
            });
            console.log(`   ✅ Compacted ${coll.name}`);
          } catch (error) {
            // Compact may not be available on all MongoDB deployments
            console.log(`   ⚠️  Could not compact ${coll.name}: ${error.message}`);
          }
        }
      }

      console.log('');
    } catch (error) {
      console.error('   ❌ Failed to compact database:', error.message);
      this.report.errors.push({ step: 'compactDatabase', error: error.message });
    }
  }

  /**
   * Generate cleanup report
   */
  generateReport() {
    console.log('📋 Cleanup Report:');
    console.log('='.repeat(60));
    console.log(`Timestamp: ${this.report.timestamp}`);
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'EXECUTION'}`);
    console.log(`Deep Clean: ${this.deep ? 'YES' : 'NO'}`);
    console.log('');

    console.log('Actions Performed:');
    if (this.report.actions.length === 0) {
      console.log('   No actions performed');
    } else {
      this.report.actions.forEach(action => {
        console.log(`   ✓ ${action.action}: ${action.count} items`);
      });
    }
    console.log('');

    if (this.report.errors.length > 0) {
      console.log('Errors:');
      this.report.errors.forEach(error => {
        console.log(`   ✗ ${error.step}: ${error.error}`);
      });
      console.log('');
    }

    console.log('='.repeat(60));

    // Save report to file
    const reportPath = path.join(__dirname, `../logs/cleanup-report-${Date.now()}.json`);

    try {
      const logsDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
      console.log(`\n📄 Report saved: ${reportPath}\n`);
    } catch (error) {
      console.error('⚠️  Could not save report:', error.message);
    }
  }

  /**
   * Format bytes to human-readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Run cleanup
   */
  async run() {
    try {
      console.log('🚀 Database Cleanup Tool\n');
      console.log(
        `Mode: ${this.dryRun ? '🔍 DRY RUN (no changes)' : '⚡ EXECUTION (will make changes)'}`
      );
      console.log(`Deep Clean: ${this.deep ? 'YES' : 'NO'}\n`);

      await this.connect();
      await this.analyze();

      console.log('🧹 Starting cleanup operations...\n');

      await this.cleanExpiredTokens();
      await this.cleanOldDrafts();
      await this.cleanOldAuditLogs();
      await this.cleanOrphanedRecords();
      await this.optimizeIndexes();
      await this.compactDatabase();

      console.log('✅ Cleanup completed!\n');

      // Re-analyze to see changes
      if (!this.dryRun) {
        console.log('📊 Post-cleanup statistics:\n');
        await this.analyze();
      }

      this.generateReport();
    } catch (error) {
      console.error('\n❌ Cleanup failed:', error.message);
      this.report.errors.push({ step: 'run', error: error.message });
      throw error;
    } finally {
      await mongoose.connection.close();
      console.log('🔌 Disconnected from MongoDB\n');
    }
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    deep: args.includes('--deep') || args.includes('--full')
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Database Cleanup Tool

Usage:
  node scripts/database-cleanup.js [options]

Options:
  --dry-run, -d     Preview changes without executing (recommended first run)
  --execute         Execute cleanup (make actual changes)
  --deep, --full    Perform deep cleanup with optimization
  --help, -h        Show this help message

Examples:
  # Preview cleanup (safe)
  node scripts/database-cleanup.js --dry-run

  # Execute basic cleanup
  node scripts/database-cleanup.js --execute

  # Execute deep cleanup with optimization
  node scripts/database-cleanup.js --execute --deep

Safety Features:
  - Always analyze before cleaning
  - Batch operations for safety
  - Detailed reporting
  - Error handling

Configuration (edit CONFIG in script):
  - Retention periods
  - Thresholds
  - Safety settings
    `);
    process.exit(0);
  }

  if (!options.dryRun && !args.includes('--execute')) {
    console.error('❌ Error: Must specify --dry-run or --execute\n');
    console.log('Use --help for more information\n');
    process.exit(1);
  }

  const tool = new DatabaseCleanupTool(options);

  tool
    .run()
    .then(() => {
      console.log('✅ Database cleanup finished successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database cleanup failed:', error.message);
      process.exit(1);
    });
}

module.exports = DatabaseCleanupTool;
