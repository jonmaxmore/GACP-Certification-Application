/**
 * Database Migration Runner
 * Execute all database migrations in order
 *
 * @module database/migrate
 * @date 2025-10-16
 * @version 1.0.0
 *
 * @usage
 * node database/migrate.js up          # Run all migrations
 * node database/migrate.js down        # Rollback last migration
 * node database/migrate.js down-all    # Rollback all migrations
 */

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// ========================================
// CONFIGURATION
// ========================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gacp_development';
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_COLLECTION = 'migrations';

// ========================================
// MIGRATION TRACKING
// ========================================

/**
 * Get executed migrations
 */
async function getExecutedMigrations(db) {
  const migrations = await db
    .collection(MIGRATIONS_COLLECTION)
    .find({})
    .sort({ executedAt: 1 })
    .toArray();

  return migrations.map(m => m.name);
}

/**
 * Record migration execution
 */
async function recordMigration(db, name) {
  await db.collection(MIGRATIONS_COLLECTION).insertOne({
    name,
    executedAt: new Date()
  });
}

/**
 * Remove migration record
 */
async function removeMigration(db, name) {
  await db.collection(MIGRATIONS_COLLECTION).deleteOne({ name });
}

// ========================================
// MIGRATION DISCOVERY
// ========================================

/**
 * Get all migration files
 */
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  return files.filter(f => f.endsWith('.js')).sort();
}

/**
 * Load migration module
 */
function loadMigration(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  return require(filepath);
}

// ========================================
// MIGRATION EXECUTION
// ========================================

/**
 * Run migrations (up)
 */
async function runMigrationsUp(db) {
  console.log('🚀 Running database migrations...\n');

  const allMigrations = getMigrationFiles();
  const executedMigrations = await getExecutedMigrations(db);
  const pendingMigrations = allMigrations.filter(m => !executedMigrations.includes(m));

  if (pendingMigrations.length === 0) {
    console.log('✅ No pending migrations. Database is up to date.\n');
    return;
  }

  console.log(`📊 Found ${pendingMigrations.length} pending migration(s):\n`);
  pendingMigrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m}`);
  });
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const filename of pendingMigrations) {
    try {
      console.log(`▶️  Executing: ${filename}`);
      const migration = loadMigration(filename);

      const startTime = Date.now();
      await migration.up(db);
      const duration = Date.now() - startTime;

      await recordMigration(db, filename);

      console.log(`✅ Completed: ${filename} (${duration}ms)\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${filename}`);
      console.error(`   Error: ${error.message}\n`);
      failCount++;
      break; // Stop on first error
    }
  }

  console.log('═'.repeat(60));
  console.log(`📊 Migration Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed:  ${failCount}`);
  console.log(`   Total:   ${pendingMigrations.length}`);
  console.log('═'.repeat(60) + '\n');

  if (failCount > 0) {
    throw new Error('Migration failed. See errors above.');
  }
}

/**
 * Rollback last migration (down)
 */
async function rollbackLastMigration(db) {
  console.log('🔄 Rolling back last migration...\n');

  const executedMigrations = await getExecutedMigrations(db);

  if (executedMigrations.length === 0) {
    console.log('⚠️  No migrations to rollback.\n');
    return;
  }

  const lastMigration = executedMigrations[executedMigrations.length - 1];

  try {
    console.log(`▶️  Rolling back: ${lastMigration}`);
    const migration = loadMigration(lastMigration);

    const startTime = Date.now();
    await migration.down(db);
    const duration = Date.now() - startTime;

    await removeMigration(db, lastMigration);

    console.log(`✅ Rolled back: ${lastMigration} (${duration}ms)\n`);
  } catch (error) {
    console.error(`❌ Rollback failed: ${lastMigration}`);
    console.error(`   Error: ${error.message}\n`);
    throw error;
  }
}

/**
 * Rollback all migrations (down-all)
 */
async function rollbackAllMigrations(db) {
  console.log('🔄 Rolling back ALL migrations...\n');
  console.log('⚠️  WARNING: This will remove all data and drop all collections!\n');

  const executedMigrations = await getExecutedMigrations(db);

  if (executedMigrations.length === 0) {
    console.log('⚠️  No migrations to rollback.\n');
    return;
  }

  console.log(`📊 Found ${executedMigrations.length} executed migration(s):\n`);
  executedMigrations.reverse().forEach((m, i) => {
    console.log(`   ${i + 1}. ${m}`);
  });
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const filename of executedMigrations) {
    try {
      console.log(`▶️  Rolling back: ${filename}`);
      const migration = loadMigration(filename);

      const startTime = Date.now();
      await migration.down(db);
      const duration = Date.now() - startTime;

      await removeMigration(db, filename);

      console.log(`✅ Rolled back: ${filename} (${duration}ms)\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Rollback failed: ${filename}`);
      console.error(`   Error: ${error.message}\n`);
      failCount++;
      // Continue rolling back even on error
    }
  }

  console.log('═'.repeat(60));
  console.log(`📊 Rollback Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed:  ${failCount}`);
  console.log(`   Total:   ${executedMigrations.length}`);
  console.log('═'.repeat(60) + '\n');

  if (failCount > 0) {
    throw new Error('Some rollbacks failed. See errors above.');
  }
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
  const command = process.argv[2];

  if (!command || !['up', 'down', 'down-all'].includes(command)) {
    console.log('Usage:');
    console.log('  node database/migrate.js up          # Run all pending migrations');
    console.log('  node database/migrate.js down        # Rollback last migration');
    console.log('  node database/migrate.js down-all    # Rollback all migrations\n');
    process.exit(1);
  }

  console.log('');
  console.log('═'.repeat(60));
  console.log('  GACP Platform - Database Migration');
  console.log('═'.repeat(60));
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, '//*****@')}`);
  console.log('═'.repeat(60) + '\n');

  let connection;

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Execute command
    if (command === 'up') {
      await runMigrationsUp(db);
    } else if (command === 'down') {
      await rollbackLastMigration(db);
    } else if (command === 'down-all') {
      await rollbackAllMigrations(db);
    }

    console.log('✅ Migration command completed successfully\n');
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.connection.close();
      console.log('🔌 Disconnected from MongoDB\n');
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runMigrationsUp,
  rollbackLastMigration,
  rollbackAllMigrations
};
