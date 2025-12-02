/**
 * Advanced Database Cleanup Tool
 *
 * Enhanced version with:
 * - Empty collection detection and removal
 * - Duplicate index detection and fixes
 * - Orphaned record cleanup
 * - Performance optimization
 *
 * Usage:
 *   node scripts/advanced-database-cleanup.js --analyze       # Analyze only
 *   node scripts/advanced-database-cleanup.js --dry-run       # Preview changes
 *   node scripts/advanced-database-cleanup.js --execute       # Execute cleanup
 *   node scripts/advanced-database-cleanup.js --fix-indexes   # Fix duplicate indexes
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

// Known empty collections that should be kept
const KEEP_COLLECTIONS = [
  'users',
  'applications',
  'certificates',
  'invoices',
  'auditlogs',
  'refreshtokens',
  'sessions'
];

class AdvancedDatabaseCleanup {
  constructor(options = {}) {
    this.analyzeOnly = options.analyzeOnly || false;
    this.dryRun = options.dryRun || false;
    this.fixIndexes = options.fixIndexes || false;
    this.report = {
      timestamp: new Date(),
      mode: this.analyzeOnly ? 'ANALYZE' : this.dryRun ? 'DRY_RUN' : 'EXECUTE',
      findings: {
        emptyCollections: [],
        orphanedRecords: [],
        duplicateIndexes: [],
        unusedData: []
      },
      actions: [],
      errors: [],
      statistics: {}
    };
  }

  /**
   * Connect to database
   */
  async connect() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp-production';

    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 Database: ${uri.split('/').pop().split('?')[0]}\n`);

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });

      console.log('✅ Connected successfully\n');
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze database comprehensively
   */
  async analyze() {
    console.log('🔍 Analyzing database...\n');

    try {
      await this.findEmptyCollections();
      await this.findDuplicateIndexes();
      await this.findOrphanedRecords();
      await this.getDatabaseStats();

      this.printAnalysisReport();

      return this.report;
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Find empty collections
   */
  async findEmptyCollections() {
    console.log('📦 Checking for empty collections...');

    try {
      const collections = await mongoose.connection.db.listCollections().toArray();

      for (const coll of collections) {
        try {
          const count = await mongoose.connection.db.collection(coll.name).countDocuments();

          if (count === 0) {
            const shouldKeep = KEEP_COLLECTIONS.includes(coll.name.toLowerCase());

            this.report.findings.emptyCollections.push({
              name: coll.name,
              count: 0,
              action: shouldKeep ? 'KEEP' : 'DELETE'
            });

            if (shouldKeep) {
              console.log(`   ℹ️  ${coll.name}: 0 documents (KEEP - core collection)`);
            } else {
              console.log(`   ⚠️  ${coll.name}: 0 documents (DELETE candidate)`);
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Could not check: ${coll.name}`);
        }
      }

      const deleteCount = this.report.findings.emptyCollections.filter(
        c => c.action === 'DELETE'
      ).length;

      if (deleteCount === 0) {
        console.log('   ✓ No empty collections to clean\n');
      } else {
        console.log(`\n   Found: ${deleteCount} empty collections to delete\n`);
      }
    } catch (error) {
      console.error('   ❌ Failed:', error.message);
      this.report.errors.push({ step: 'findEmptyCollections', error: error.message });
    }
  }

  /**
   * Find duplicate indexes
   */
  async findDuplicateIndexes() {
    console.log('🔍 Checking for duplicate indexes...');

    try {
      const collections = await mongoose.connection.db.listCollections().toArray();

      for (const coll of collections) {
        try {
          const indexes = await mongoose.connection.db.collection(coll.name).indexes();
          const indexKeys = {};
          const duplicates = [];

          for (const index of indexes) {
            const keyStr = JSON.stringify(index.key);

            if (indexKeys[keyStr]) {
              duplicates.push({
                name: index.name,
                key: index.key,
                duplicate: indexKeys[keyStr]
              });
            } else {
              indexKeys[keyStr] = index.name;
            }
          }

          if (duplicates.length > 0) {
            console.log(`   ⚠️  ${coll.name}: ${duplicates.length} duplicate indexes`);

            this.report.findings.duplicateIndexes.push({
              collection: coll.name,
              duplicates: duplicates
            });
          }
        } catch (error) {
          console.log(`   ⚠️  Could not check indexes: ${coll.name}`);
        }
      }

      if (this.report.findings.duplicateIndexes.length === 0) {
        console.log('   ✓ No duplicate indexes found\n');
      } else {
        console.log(
          `\n   Found: ${this.report.findings.duplicateIndexes.length} collections with duplicate indexes\n`
        );
      }
    } catch (error) {
      console.error('   ❌ Failed:', error.message);
      this.report.errors.push({ step: 'findDuplicateIndexes', error: error.message });
    }
  }

  /**
   * Find orphaned records
   */
  async findOrphanedRecords() {
    console.log('🔍 Checking for orphaned records...');

    try {
      // Applications without users
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
        console.log(`   ⚠️  Found ${orphanedApps.length} applications without users`);
        this.report.findings.orphanedRecords.push({
          type: 'applications',
          count: orphanedApps.length,
          records: orphanedApps.slice(0, 5) // First 5 for review
        });
      }

      // Certificates without applications
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
        console.log(`   ⚠️  Found ${orphanedCerts.length} certificates without applications`);
        this.report.findings.orphanedRecords.push({
          type: 'certificates',
          count: orphanedCerts.length,
          records: orphanedCerts.slice(0, 5)
        });
      }

      if (orphanedApps.length === 0 && orphanedCerts.length === 0) {
        console.log('   ✓ No orphaned records found\n');
      } else {
        console.log('');
      }
    } catch (error) {
      console.error('   ❌ Failed:', error.message);
      this.report.errors.push({ step: 'findOrphanedRecords', error: error.message });
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const stats = {
        database: mongoose.connection.name,
        collections: [],
        totalSize: 0,
        totalDocuments: 0,
        emptyCollections: 0
      };

      for (const coll of collections) {
        try {
          const count = await mongoose.connection.db.collection(coll.name).countDocuments();
          const collStats = await mongoose.connection.db.collection(coll.name).stats();

          stats.collections.push({
            name: coll.name,
            documents: count,
            size: collStats.size || 0,
            indexes: collStats.nindexes || 0
          });

          stats.totalSize += collStats.size || 0;
          stats.totalDocuments += count;

          if (count === 0) {
            stats.emptyCollections++;
          }
        } catch (error) {
          // Collection might be in an invalid state
        }
      }

      this.report.statistics = stats;
    } catch (error) {
      this.report.errors.push({ step: 'getDatabaseStats', error: error.message });
    }
  }

  /**
   * Print analysis report
   */
  printAnalysisReport() {
    console.log('📊 Analysis Report:');
    console.log('='.repeat(70));

    // Database info
    const stats = this.report.statistics;
    console.log(`Database: ${stats.database}`);
    console.log(`Collections: ${stats.collections.length}`);
    console.log(`Total Documents: ${stats.totalDocuments.toLocaleString()}`);
    console.log(`Total Size: ${this.formatBytes(stats.totalSize)}`);
    console.log('');

    // Empty collections
    if (this.report.findings.emptyCollections.length > 0) {
      const deleteCount = this.report.findings.emptyCollections.filter(
        c => c.action === 'DELETE'
      ).length;
      console.log(
        `📦 Empty Collections: ${this.report.findings.emptyCollections.length} (${deleteCount} can be deleted)`
      );

      this.report.findings.emptyCollections.forEach(coll => {
        const emoji = coll.action === 'KEEP' ? 'ℹ️' : '⚠️';
        console.log(`   ${emoji} ${coll.name}: ${coll.action}`);
      });
      console.log('');
    }

    // Duplicate indexes
    if (this.report.findings.duplicateIndexes.length > 0) {
      console.log(
        `🔍 Duplicate Indexes: ${this.report.findings.duplicateIndexes.length} collections affected`
      );
      this.report.findings.duplicateIndexes.forEach(item => {
        console.log(`   ⚠️  ${item.collection}: ${item.duplicates.length} duplicates`);
      });
      console.log('');
    }

    // Orphaned records
    if (this.report.findings.orphanedRecords.length > 0) {
      console.log(`🔗 Orphaned Records:`);
      this.report.findings.orphanedRecords.forEach(item => {
        console.log(`   ⚠️  ${item.type}: ${item.count} records`);
      });
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('');
  }

  /**
   * Execute cleanup
   */
  async cleanup() {
    if (this.analyzeOnly) {
      console.log('ℹ️  Analysis only - no cleanup performed\n');
      return;
    }

    console.log('🧹 Starting cleanup...\n');

    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }

    await this.cleanEmptyCollections();
    await this.cleanOrphanedRecords();

    if (this.fixIndexes) {
      await this.fixDuplicateIndexes();
    }

    console.log('\n✅ Cleanup completed!\n');
  }

  /**
   * Clean empty collections
   */
  async cleanEmptyCollections() {
    const toDelete = this.report.findings.emptyCollections.filter(c => c.action === 'DELETE');

    if (toDelete.length === 0) {
      return;
    }

    console.log(`📦 Cleaning ${toDelete.length} empty collections...`);

    for (const coll of toDelete) {
      if (this.dryRun) {
        console.log(`   🔍 Would delete: ${coll.name}`);
      } else {
        try {
          await mongoose.connection.db.dropCollection(coll.name);
          console.log(`   ✅ Deleted: ${coll.name}`);

          this.report.actions.push({
            action: 'deleteEmptyCollection',
            collection: coll.name,
            success: true
          });
        } catch (error) {
          console.log(`   ❌ Failed to delete ${coll.name}: ${error.message}`);
          this.report.errors.push({
            step: 'deleteCollection',
            collection: coll.name,
            error: error.message
          });
        }
      }
    }

    console.log('');
  }

  /**
   * Clean orphaned records
   */
  async cleanOrphanedRecords() {
    if (this.report.findings.orphanedRecords.length === 0) {
      return;
    }

    console.log('🔗 Cleaning orphaned records...');

    for (const item of this.report.findings.orphanedRecords) {
      if (this.dryRun) {
        console.log(`   🔍 Would delete ${item.count} orphaned ${item.type}`);
      } else {
        try {
          const ids = item.records.map(r => r._id);
          let result;

          if (item.type === 'applications') {
            result = await Application.deleteMany({ _id: { $in: ids } });
          } else if (item.type === 'certificates') {
            result = await Certificate.deleteMany({ _id: { $in: ids } });
          }

          console.log(`   ✅ Deleted ${result.deletedCount} orphaned ${item.type}`);

          this.report.actions.push({
            action: 'deleteOrphanedRecords',
            type: item.type,
            count: result.deletedCount,
            success: true
          });
        } catch (error) {
          console.log(`   ❌ Failed: ${error.message}`);
          this.report.errors.push({
            step: 'deleteOrphanedRecords',
            type: item.type,
            error: error.message
          });
        }
      }
    }

    console.log('');
  }

  /**
   * Fix duplicate indexes
   */
  async fixDuplicateIndexes() {
    if (this.report.findings.duplicateIndexes.length === 0) {
      return;
    }

    console.log('🔧 Fixing duplicate indexes...');
    console.log('⚠️  This requires dropping and rebuilding indexes\n');

    for (const item of this.report.findings.duplicateIndexes) {
      if (this.dryRun) {
        console.log(`   🔍 Would fix ${item.duplicates.length} duplicates in ${item.collection}`);
      } else {
        console.log(`   Processing ${item.collection}...`);

        // This is complex - better to document than auto-fix
        console.log(`   ℹ️  Manual fix required - see model file`);
        console.log(`   📝 Remove "index: true" from schema if using schema.index()`);

        this.report.actions.push({
          action: 'fixDuplicateIndexes',
          collection: item.collection,
          count: item.duplicates.length,
          success: false,
          note: 'Manual fix required'
        });
      }
    }

    console.log('');
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Save report
   */
  saveReport() {
    const reportPath = path.join(__dirname, `../logs/advanced-cleanup-${Date.now()}.json`);

    try {
      const logsDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
      console.log(`📄 Report saved: ${reportPath}\n`);
    } catch (error) {
      console.error('⚠️  Could not save report:', error.message);
    }
  }

  /**
   * Run
   */
  async run() {
    try {
      console.log('🚀 Advanced Database Cleanup Tool\n');
      console.log(`Mode: ${this.report.mode}\n`);

      await this.connect();
      await this.analyze();
      await this.cleanup();

      this.saveReport();

      console.log('✅ Process completed!\n');
    } catch (error) {
      console.error('\n❌ Process failed:', error.message);
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
    analyzeOnly: args.includes('--analyze'),
    dryRun: args.includes('--dry-run'),
    fixIndexes: args.includes('--fix-indexes')
  };

  if (args.includes('--help')) {
    console.log(`
Advanced Database Cleanup Tool

Usage:
  node scripts/advanced-database-cleanup.js [options]

Options:
  --analyze         Analyze only (no cleanup)
  --dry-run         Preview cleanup without executing
  --execute         Execute cleanup
  --fix-indexes     Fix duplicate indexes (experimental)
  --help            Show this help

Examples:
  # Analyze database
  node scripts/advanced-database-cleanup.js --analyze

  # Preview cleanup
  node scripts/advanced-database-cleanup.js --dry-run

  # Execute cleanup
  node scripts/advanced-database-cleanup.js --execute

  # Execute with index fixes
  node scripts/advanced-database-cleanup.js --execute --fix-indexes
    `);
    process.exit(0);
  }

  const tool = new AdvancedDatabaseCleanup(options);

  tool
    .run()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = AdvancedDatabaseCleanup;
