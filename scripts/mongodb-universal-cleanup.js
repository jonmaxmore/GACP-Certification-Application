/**
 * MongoDB Universal Cleanup Tool
 *
 * Cleans BOTH local MongoDB and MongoDB Atlas:
 * 1. Remove empty collections
 * 2. Remove orphaned records
 * 3. Fix duplicate indexes in code
 *
 * Usage:
 *   node scripts/mongodb-universal-cleanup.js --local       # Clean local only
 *   node scripts/mongodb-universal-cleanup.js --atlas       # Clean Atlas only
 *   node scripts/mongodb-universal-cleanup.js --both        # Clean both
 *   node scripts/mongodb-universal-cleanup.js --dry-run     # Preview only
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Database configurations
const DATABASES = {
  local: {
    name: 'Local MongoDB',
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_production',
    color: '\x1b[36m' // Cyan
  },
  atlas: {
    name: 'MongoDB Atlas',
    uri: process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI_ATLAS || null,
    color: '\x1b[35m' // Magenta
  }
};

// Core collections to keep (even if empty)
const KEEP_COLLECTIONS = [
  'users',
  'applications',
  'certificates',
  'invoices',
  'auditlogs',
  'refreshtokens',
  'sessions'
];

// Models with duplicate indexes to fix
const MODELS_TO_FIX = [
  {
    file: 'database/models/User.model.js',
    fields: ['userId', 'email', 'thaiId', 'phoneNumber']
  },
  {
    file: 'database/models/Certificate.model.js',
    fields: ['certificateId', 'certificateNumber', 'applicationId']
  },
  {
    file: 'database/models/Invoice.model.js',
    fields: ['invoiceId', 'invoiceNumber', 'sequenceNumber']
  }
];

class MongoDBUniversalCleanup {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.targets = options.targets || ['local'];
    this.report = {
      timestamp: new Date(),
      results: {}
    };
  }

  /**
   * Main execution
   */
  async run() {
    console.log('\n🚀 MongoDB Universal Cleanup Tool\n');
    console.log(`Mode: ${this.dryRun ? '🔍 DRY RUN' : '⚡ EXECUTION'}`);
    console.log(`Targets: ${this.targets.join(', ')}\n`);

    try {
      // Step 1: Clean databases
      for (const target of this.targets) {
        if (DATABASES[target]) {
          await this.cleanDatabase(target);
        }
      }

      // Step 2: Fix duplicate indexes in code
      if (!this.dryRun && this.targets.length > 0) {
        console.log('\n🔧 Fixing duplicate indexes in model files...\n');
        await this.fixDuplicateIndexes();
      }

      // Step 3: Generate report
      this.generateReport();

      console.log('\n✅ Cleanup completed!\n');
    } catch (error) {
      console.error('\n❌ Cleanup failed:', error.message);
      throw error;
    }
  }

  /**
   * Clean a specific database
   */
  async cleanDatabase(target) {
    const db = DATABASES[target];

    if (!db.uri) {
      console.log(`${db.color}⚠️  ${db.name}: No URI configured, skipping...\x1b[0m\n`);
      return;
    }

    console.log(`${db.color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
    console.log(`${db.color}📦 ${db.name}\x1b[0m`);
    console.log(`${db.color}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n`);

    const result = {
      connected: false,
      emptyCollections: [],
      orphanedRecords: [],
      errors: []
    };

    try {
      // Connect
      console.log('🔌 Connecting...');
      await mongoose.connect(db.uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000
      });

      result.connected = true;
      const dbName = mongoose.connection.name;
      console.log(`✅ Connected to: ${dbName}\n`);

      // Get collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📋 Found ${collections.length} collections\n`);

      // Step 1: Find and remove empty collections
      console.log('🔍 Checking empty collections...');

      for (const coll of collections) {
        try {
          const count = await mongoose.connection.db.collection(coll.name).countDocuments();

          if (count === 0) {
            const shouldKeep = KEEP_COLLECTIONS.includes(coll.name.toLowerCase());

            if (shouldKeep) {
              console.log(`   ℹ️  ${coll.name}: 0 documents (KEEP - core collection)`);
            } else {
              console.log(`   ⚠️  ${coll.name}: 0 documents`);

              result.emptyCollections.push({
                name: coll.name,
                action: shouldKeep ? 'KEEP' : 'DELETE'
              });

              if (!this.dryRun && !shouldKeep) {
                await mongoose.connection.db.dropCollection(coll.name);
                console.log(`   ✅ Deleted: ${coll.name}`);
              } else if (this.dryRun && !shouldKeep) {
                console.log(`   🔍 Would delete: ${coll.name}`);
              }
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Could not check: ${coll.name}`);
        }
      }

      const deleteCount = result.emptyCollections.filter(c => c.action === 'DELETE').length;
      if (deleteCount === 0) {
        console.log('   ✓ No empty collections to clean');
      }
      console.log('');

      // Step 2: Remove orphaned records
      console.log('🔍 Checking orphaned records...');

      // Check if we have required collections
      const hasUsers = collections.some(c => c.name === 'users');
      const hasApplications = collections.some(c => c.name === 'applications');
      const hasCertificates = collections.some(c => c.name === 'certificates');

      if (hasUsers && hasApplications) {
        try {
          // Load models dynamically
          const User = require('../database/models/User.model');
          const Application = require('../database/models/Application.model');

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
              $project: { _id: 1, applicationId: 1 }
            }
          ]);

          if (orphanedApps.length > 0) {
            console.log(`   ⚠️  Found ${orphanedApps.length} applications without users`);

            result.orphanedRecords.push({
              type: 'applications',
              count: orphanedApps.length
            });

            if (!this.dryRun) {
              const ids = orphanedApps.map(app => app._id);
              const deleteResult = await Application.deleteMany({ _id: { $in: ids } });
              console.log(`   ✅ Deleted: ${deleteResult.deletedCount} orphaned applications`);
            } else {
              console.log(`   🔍 Would delete: ${orphanedApps.length} orphaned applications`);
            }
          } else {
            console.log('   ✓ No orphaned applications found');
          }
        } catch (error) {
          console.log(`   ⚠️  Could not check applications: ${error.message}`);
        }
      }

      if (hasApplications && hasCertificates) {
        try {
          const Certificate = require('../database/models/Certificate.model');
          const Application = require('../database/models/Application.model');

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
              $project: { _id: 1, certificateNumber: 1 }
            }
          ]);

          if (orphanedCerts.length > 0) {
            console.log(`   ⚠️  Found ${orphanedCerts.length} certificates without applications`);

            result.orphanedRecords.push({
              type: 'certificates',
              count: orphanedCerts.length
            });

            if (!this.dryRun) {
              const ids = orphanedCerts.map(cert => cert._id);
              const deleteResult = await Certificate.deleteMany({ _id: { $in: ids } });
              console.log(`   ✅ Deleted: ${deleteResult.deletedCount} orphaned certificates`);
            } else {
              console.log(`   🔍 Would delete: ${orphanedCerts.length} orphaned certificates`);
            }
          } else {
            console.log('   ✓ No orphaned certificates found');
          }
        } catch (error) {
          console.log(`   ⚠️  Could not check certificates: ${error.message}`);
        }
      }

      if (result.orphanedRecords.length === 0) {
        console.log('   ✓ No orphaned records found');
      }
      console.log('');

      // Summary
      console.log(`${db.color}📊 Summary for ${db.name}:\x1b[0m`);
      console.log(
        `   Empty collections: ${deleteCount} ${this.dryRun ? 'would be' : 'were'} deleted`
      );
      console.log(
        `   Orphaned records: ${result.orphanedRecords.reduce((sum, r) => sum + r.count, 0)} ${this.dryRun ? 'would be' : 'were'} deleted`
      );
      console.log('');
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
      result.errors.push(error.message);
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('🔌 Disconnected\n');
      }
    }

    this.report.results[target] = result;
  }

  /**
   * Fix duplicate indexes in model files
   */
  async fixDuplicateIndexes() {
    console.log('🔧 Fixing duplicate index definitions in models...\n');

    for (const model of MODELS_TO_FIX) {
      const filePath = path.join(__dirname, '..', model.file);

      if (!fs.existsSync(filePath)) {
        console.log(`   ⚠️  File not found: ${model.file}`);
        continue;
      }

      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changes = 0;

        // Pattern to find: fieldName: { ... index: true ... }
        const indexPattern = /(\w+):\s*\{\s*([^}]*)\s*index:\s*true\s*([^}]*)\}/g;

        content = content.replace(indexPattern, (match, fieldName, before, after) => {
          if (model.fields.includes(fieldName)) {
            changes++;
            // Remove index: true and clean up extra commas
            let cleaned = before + after;
            cleaned = cleaned.replace(/,\s*,/g, ','); // Remove double commas
            cleaned = cleaned.replace(/,\s*$/g, ''); // Remove trailing comma

            return `${fieldName}: { ${cleaned} }`;
          }
          return match;
        });

        if (changes > 0) {
          if (!this.dryRun) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`   ✅ Fixed ${model.file}: ${changes} fields updated`);
          } else {
            console.log(`   🔍 Would fix ${model.file}: ${changes} fields`);
          }
        } else {
          console.log(`   ℹ️  ${model.file}: No changes needed`);
        }
      } catch (error) {
        console.log(`   ❌ Error fixing ${model.file}: ${error.message}`);
      }
    }

    console.log('');
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 CLEANUP REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Timestamp: ${this.report.timestamp}`);
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'EXECUTION'}\n`);

    for (const [target, result] of Object.entries(this.report.results)) {
      const db = DATABASES[target];
      console.log(`${db.color}${db.name}:\x1b[0m`);

      if (!result.connected) {
        console.log('   ⚠️  Not connected\n');
        continue;
      }

      console.log(
        `   Empty collections deleted: ${result.emptyCollections.filter(c => c.action === 'DELETE').length}`
      );
      console.log(
        `   Orphaned records deleted: ${result.orphanedRecords.reduce((sum, r) => sum + r.count, 0)}`
      );

      if (result.errors.length > 0) {
        console.log(`   ❌ Errors: ${result.errors.length}`);
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Save report
    const reportPath = path.join(__dirname, '../logs', `universal-cleanup-${Date.now()}.json`);
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
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
MongoDB Universal Cleanup Tool

Usage:
  node scripts/mongodb-universal-cleanup.js [options]

Options:
  --local       Clean local MongoDB only
  --atlas       Clean MongoDB Atlas only
  --both        Clean both local and Atlas
  --dry-run     Preview changes without executing
  --help        Show this help message

Examples:
  # Preview cleanup on local
  node scripts/mongodb-universal-cleanup.js --local --dry-run

  # Execute cleanup on local
  node scripts/mongodb-universal-cleanup.js --local

  # Execute cleanup on both
  node scripts/mongodb-universal-cleanup.js --both

Environment Variables:
  MONGODB_URI              Local MongoDB URI
  MONGODB_ATLAS_URI        MongoDB Atlas URI
  MONGODB_URI_ATLAS        Alternative Atlas URI

What it does:
  1. Removes empty collections (except core collections)
  2. Removes orphaned records (applications without users, etc.)
  3. Fixes duplicate index definitions in model files
    `);
    process.exit(0);
  }

  const options = {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    targets: []
  };

  if (args.includes('--local')) {
    options.targets.push('local');
  }
  if (args.includes('--atlas')) {
    options.targets.push('atlas');
  }
  if (args.includes('--both')) {
    options.targets = ['local', 'atlas'];
  }

  if (options.targets.length === 0) {
    console.error('❌ Error: Must specify --local, --atlas, or --both\n');
    console.log('Use --help for more information\n');
    process.exit(1);
  }

  const tool = new MongoDBUniversalCleanup(options);

  tool
    .run()
    .then(() => {
      console.log('✅ Process completed successfully!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = MongoDBUniversalCleanup;
