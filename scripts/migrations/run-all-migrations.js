/**
 * Run All Migrations Script
 *
 * Executes all migration scripts in order
 * Usage: node run-all-migrations.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Run migrations
 */
async function runMigrations() {
  console.log(colors.bright + colors.cyan);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║     GACP Platform - Database Migration Runner           ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(colors.reset + '\n');

  const migrationsDir = __dirname;

  // Get all migration files (format: NNN-*.js)
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(file => /^\d{3}-.*\.js$/.test(file))
    .sort();

  console.log(colors.bright + `📋 Found ${migrationFiles.length} migration(s):\n` + colors.reset);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('');

  // Confirm execution
  console.log(colors.yellow + '⚠️  This will modify your database!' + colors.reset);
  console.log(colors.yellow + '⚠️  Make sure you have a backup!' + colors.reset);
  console.log('');

  // Run each migration
  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);

    try {
      console.log(colors.bright + colors.blue);
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  Running: ${file}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log(colors.reset);

      const migration = require(migrationPath);

      if (typeof migration.up !== 'function') {
        throw new Error('Migration file does not export "up" function');
      }

      const result = await migration.up();

      if (result && result.success) {
        successCount++;
        console.log(colors.green + `✅ ${file} completed successfully!\n` + colors.reset);
      } else {
        throw new Error('Migration returned unsuccessful result');
      }

    } catch (error) {
      failCount++;
      console.error(colors.red + `❌ ${file} failed:` + colors.reset);
      console.error(colors.red + error.message + colors.reset);
      console.log('');

      // Ask if should continue
      console.log(colors.yellow + 'Continue with remaining migrations? (y/n)' + colors.reset);
      // For now, stop on error
      break;
    }
  }

  // Summary
  console.log(colors.bright + colors.cyan);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                   Migration Summary                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  console.log(`Total migrations: ${migrationFiles.length}`);
  console.log(colors.green + `✅ Successful: ${successCount}` + colors.reset);

  if (failCount > 0) {
    console.log(colors.red + `❌ Failed: ${failCount}` + colors.reset);
    process.exit(1);
  } else {
    console.log('');
    console.log(colors.bright + colors.green + '🎉 All migrations completed successfully!' + colors.reset);
    console.log('');
    process.exit(0);
  }
}

/**
 * Rollback all migrations
 */
async function rollbackMigrations() {
  console.log(colors.bright + colors.cyan);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║     GACP Platform - Migration Rollback                   ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(colors.reset + '\n');

  const migrationsDir = __dirname;

  // Get all migration files (reverse order for rollback)
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter(file => /^\d{3}-.*\.js$/.test(file))
    .sort()
    .reverse();

  console.log(colors.bright + `📋 Found ${migrationFiles.length} migration(s) to rollback:\n` + colors.reset);
  migrationFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('');

  console.log(colors.red + '🚨 WARNING: This will ROLLBACK all migrations!' + colors.reset);
  console.log(colors.red + '🚨 Your database will be reverted to original state!' + colors.reset);
  console.log('');

  // Run each migration rollback
  let successCount = 0;
  let failCount = 0;

  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);

    try {
      console.log(colors.bright + colors.blue);
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  Rolling back: ${file}`);
      console.log('═══════════════════════════════════════════════════════');
      console.log(colors.reset);

      const migration = require(migrationPath);

      if (typeof migration.down !== 'function') {
        throw new Error('Migration file does not export "down" function');
      }

      const result = await migration.down();

      if (result && result.success) {
        successCount++;
        console.log(colors.green + `✅ ${file} rolled back successfully!\n` + colors.reset);
      } else {
        throw new Error('Rollback returned unsuccessful result');
      }

    } catch (error) {
      failCount++;
      console.error(colors.red + `❌ ${file} rollback failed:` + colors.reset);
      console.error(colors.red + error.message + colors.reset);
      console.log('');
      break;
    }
  }

  // Summary
  console.log(colors.bright + colors.cyan);
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                   Rollback Summary                       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  console.log(`Total rollbacks: ${migrationFiles.length}`);
  console.log(colors.green + `✅ Successful: ${successCount}` + colors.reset);

  if (failCount > 0) {
    console.log(colors.red + `❌ Failed: ${failCount}` + colors.reset);
    process.exit(1);
  } else {
    console.log('');
    console.log(colors.bright + colors.green + '✅ All migrations rolled back successfully!' + colors.reset);
    console.log('');
    process.exit(0);
  }
}

// CLI
const command = process.argv[2];

if (command === 'up') {
  runMigrations();
} else if (command === 'down') {
  rollbackMigrations();
} else {
  console.log('Usage:');
  console.log('  node run-all-migrations.js up    - Run all migrations');
  console.log('  node run-all-migrations.js down  - Rollback all migrations');
  process.exit(1);
}
