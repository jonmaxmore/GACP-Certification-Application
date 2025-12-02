/**
 * Remove Blockchain References Script
 * Removes all blockchain mentions from documentation
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_UPDATE = [
  'README.md',
  'FINAL_VERIFICATION_REPORT.md',
  'PRODUCTION_DEPLOYMENT_READY.md',
  'docs/EXISTING_MODULES_INVENTORY.md',
  'docs/ARCHITECTURE.md'
];

const REPLACEMENTS = [
  { find: /blockchain-ready/gi, replace: 'database-backed' },
  { find: /blockchain integration/gi, replace: 'advanced database features' },
  { find: /immutable record/gi, replace: 'audit trail' },
  { find: /Blockchain/g, replace: 'Database' },
  { find: /blockchain/g, replace: 'database' }
];

console.log('🔍 Removing blockchain references...\n');

let totalChanges = 0;

FILES_TO_UPDATE.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  REPLACEMENTS.forEach(({ find, replace }) => {
    const matches = content.match(find);
    if (matches) {
      fileChanges += matches.length;
      content = content.replace(find, replace);
    }
  });

  if (fileChanges > 0) {
    console.log(`✅ ${file}: ${fileChanges} changes`);
    totalChanges += fileChanges;
    // Uncomment to actually write changes:
    // fs.writeFileSync(filePath, content, 'utf8');
  } else {
    console.log(`✓  ${file}: No changes needed`);
  }
});

console.log(`\n📊 Total changes: ${totalChanges}`);
console.log('\n⚠️  This is a DRY RUN - uncomment write lines to apply changes.');

process.exit(0);
