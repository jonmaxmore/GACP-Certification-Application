#!/usr/bin/env node
/**
 * File Naming Convention Standardization Script
 * Converts all files and folders to kebab-case
 * 
 * Safety Features:
 * - Dry-run mode (default)
 * - Detailed report of changes
 * - Backup recommendations
 * - Git-aware renaming
 * 
 * Usage:
 *   node scripts/rename-to-kebab.js --dry-run  (preview only)
 *   node scripts/rename-to-kebab.js --execute  (actual rename)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  rootDirs: [
    'apps/backend/services',
    'apps/backend/modules',
    'apps/backend/config',
    'apps/backend/middleware',
    'apps/backend/utils',
    'apps/backend/controllers',
    'apps/backend/models',
    'apps/backend/routes',
    'apps/backend/shared',
    'apps/backend/system'
  ],
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /dist/,
    /build/,
    /coverage/,
    /__tests__/,
    /\.next/,
    /\.env/,
    /package\.json/,
    /package-lock\.json/,
    /pnpm-lock\.yaml/,
    /tsconfig\.json/,
    /jest\.config\.js/,
    /\.eslintrc/,
    /\.prettierrc/,
    /README\.md/,
    /CHANGELOG\.md/,
    /LICENSE/
  ],
  // Files that should keep their current naming
  keepAsIs: [
    'index.js',
    'index.ts',
    'server.js',
    'app.js',
    'main.js',
    'container.js' // DI containers
  ]
};

// Statistics
const stats = {
  scanned: 0,
  renamed: 0,
  skipped: 0,
  errors: 0,
  changes: []
};

/**
 * Convert string to kebab-case
 * Examples:
 *   AuthService.js → auth-service.js
 *   userRepo.js → user-repo.js
 *   database_helper.js → database-helper.js
 *   MongoDBManager.ts → mongodb-manager.ts
 */
function toKebabCase(str) {
  return str
    // Handle PascalCase and camelCase
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Handle consecutive capitals (like MongoDB)
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    // Replace underscores and spaces with hyphens
    .replace(/[_\s]+/g, '-')
    // Convert to lowercase
    .toLowerCase()
    // Remove duplicate hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '');
}

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
  return config.excludePatterns.some(pattern => pattern.test(filePath));
}

/**
 * Check if file should keep its name
 */
function shouldKeepName(fileName) {
  return config.keepAsIs.includes(fileName);
}

/**
 * Get new name for file/folder
 */
function getNewName(oldName) {
  // Keep file extension
  const ext = path.extname(oldName);
  const nameWithoutExt = path.basename(oldName, ext);
  
  // Check if should keep as-is
  if (shouldKeepName(oldName)) {
    return oldName;
  }
  
  // Convert to kebab-case
  const kebabName = toKebabCase(nameWithoutExt);
  
  return ext ? `${kebabName}${ext}` : kebabName;
}

/**
 * Traverse directory and collect rename operations
 */
function collectRenameOperations(dir, operations = []) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return operations;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);
    
    // Skip excluded paths
    if (shouldExclude(oldPath)) {
      stats.skipped++;
      continue;
    }

    stats.scanned++;

    // Get new name
    const newName = getNewName(entry.name);
    const newPath = path.join(dir, newName);

    // Check if rename needed
    if (entry.name !== newName) {
      operations.push({
        type: entry.isDirectory() ? 'folder' : 'file',
        oldPath,
        newPath,
        oldName: entry.name,
        newName
      });
    }

    // Recurse into directories
    if (entry.isDirectory()) {
      collectRenameOperations(oldPath, operations);
    }
  }

  return operations;
}

/**
 * Execute rename operations
 */
function executeRenames(operations, dryRun = true) {
  console.log('\n' + '='.repeat(80));
  console.log(`${dryRun ? '🔍 DRY RUN' : '🔧 EXECUTING'}: File Naming Standardization`);
  console.log('='.repeat(80) + '\n');

  if (operations.length === 0) {
    console.log('✅ All files already follow kebab-case convention!\n');
    return;
  }

  // Sort by depth (deepest first) to avoid conflicts
  operations.sort((a, b) => {
    const depthA = a.oldPath.split(path.sep).length;
    const depthB = b.oldPath.split(path.sep).length;
    return depthB - depthA;
  });

  console.log(`Found ${operations.length} files/folders to rename:\n`);

  // Group by type for better readability
  const folders = operations.filter(op => op.type === 'folder');
  const files = operations.filter(op => op.type === 'file');

  if (folders.length > 0) {
    console.log('📁 FOLDERS:');
    folders.forEach((op, i) => {
      console.log(`  ${i + 1}. ${op.oldName} → ${op.newName}`);
      console.log(`     ${op.oldPath}`);
    });
    console.log('');
  }

  if (files.length > 0) {
    console.log('📄 FILES:');
    files.forEach((op, i) => {
      console.log(`  ${i + 1}. ${op.oldName} → ${op.newName}`);
      console.log(`     ${op.oldPath}`);
    });
    console.log('');
  }

  if (dryRun) {
    console.log('ℹ️  This was a DRY RUN. No files were actually renamed.');
    console.log('ℹ️  To execute the rename, run: node scripts/rename-to-kebab.js --execute\n');
    console.log('⚠️  IMPORTANT: Commit your changes or create a backup before executing!\n');
    return;
  }

  // Execute renames
  console.log('🚀 Executing renames...\n');

  for (const op of operations) {
    try {
      // Check if target already exists
      if (fs.existsSync(op.newPath)) {
        console.log(`⚠️  Skipped (target exists): ${op.oldName}`);
        stats.skipped++;
        continue;
      }

      // Rename using git mv if in git repo
      const isGitRepo = fs.existsSync('.git');
      
      if (isGitRepo) {
        const { execSync } = require('child_process');
        try {
          execSync(`git mv "${op.oldPath}" "${op.newPath}"`, { stdio: 'pipe' });
          console.log(`✅ ${op.oldName} → ${op.newName}`);
        } catch (gitError) {
          // Fallback to fs rename if git mv fails
          fs.renameSync(op.oldPath, op.newPath);
          console.log(`✅ ${op.oldName} → ${op.newName} (fs)`);
        }
      } else {
        fs.renameSync(op.oldPath, op.newPath);
        console.log(`✅ ${op.oldName} → ${op.newName}`);
      }

      stats.renamed++;
      stats.changes.push(op);
    } catch (error) {
      console.error(`❌ Error renaming ${op.oldName}: ${error.message}`);
      stats.errors++;
    }
  }

  console.log('');
}

/**
 * Print statistics
 */
function printStats() {
  console.log('='.repeat(80));
  console.log('📊 STATISTICS');
  console.log('='.repeat(80));
  console.log(`Files scanned:  ${stats.scanned}`);
  console.log(`Files renamed:  ${stats.renamed}`);
  console.log(`Files skipped:  ${stats.skipped}`);
  console.log(`Errors:         ${stats.errors}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Generate report file
 */
function generateReport(operations) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `rename-report-${timestamp}.md`;

  let report = `# File Rename Report\n\n`;
  report += `**Date:** ${new Date().toLocaleString()}\n`;
  report += `**Total Changes:** ${operations.length}\n\n`;

  report += `## Changes\n\n`;
  operations.forEach((op, i) => {
    report += `${i + 1}. **${op.type}**: \`${op.oldName}\` → \`${op.newName}\`\n`;
    report += `   - Path: \`${op.oldPath}\`\n\n`;
  });

  fs.writeFileSync(reportPath, report);
  console.log(`📄 Report saved: ${reportPath}\n`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');

  console.log('\n🔧 Botanical Audit Framework - File Naming Standardization\n');

  if (dryRun) {
    console.log('ℹ️  Running in DRY RUN mode (no changes will be made)\n');
  } else {
    console.log('⚠️  EXECUTE mode - Files will be renamed!\n');
    console.log('🔍 Make sure you have:');
    console.log('   1. Committed all your changes, OR');
    console.log('   2. Created a backup of your project\n');
    
    // Wait for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Continue? (yes/no): ', (answer) => {
      readline.close();
      
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled.\n');
        process.exit(0);
      }

      proceed(dryRun);
    });
    return;
  }

  proceed(dryRun);
}

function proceed(dryRun) {
  // Collect all rename operations
  const operations = [];
  
  for (const dir of config.rootDirs) {
    collectRenameOperations(dir, operations);
  }

  // Execute or preview
  executeRenames(operations, dryRun);

  // Print statistics
  printStats();

  // Generate report if executing
  if (!dryRun && operations.length > 0) {
    generateReport(stats.changes);
  }

  // Next steps
  if (!dryRun && stats.renamed > 0) {
    console.log('✅ NEXT STEPS:\n');
    console.log('1. Run tests to verify nothing broke:');
    console.log('   npm test\n');
    console.log('2. Update any hardcoded import paths if needed\n');
    console.log('3. Commit the changes:');
    console.log('   git add -A');
    console.log('   git commit -m "refactor: Standardize file naming to kebab-case"\n');
  }
}

// Run
if (require.main === module) {
  main();
}

module.exports = { toKebabCase, getNewName };
