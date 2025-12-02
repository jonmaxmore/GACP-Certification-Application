#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  {
    pattern: /JWT_SECRET\s*=\s*['"]([^'"]+)['"]/g,
    replacement: "JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME'"
  },
  {
    pattern: /FARMER_JWT_SECRET\s*=\s*['"]([^'"]+)['"]/g,
    replacement: "FARMER_JWT_SECRET = process.env.FARMER_JWT_SECRET || 'CHANGE_ME'"
  },
  {
    pattern: /DTAM_JWT_SECRET\s*=\s*['"]([^'"]+)['"]/g,
    replacement: "DTAM_JWT_SECRET = process.env.DTAM_JWT_SECRET || 'CHANGE_ME'"
  },
  {
    pattern: /mongodb:\/\/localhost:27017\/([a-zA-Z0-9_-]+)/g,
    replacement: "process.env.MONGODB_URI || 'mongodb://localhost:27017/$1'"
  },
  {
    pattern: /redis:\/\/localhost:6379/g,
    replacement: "process.env.REDIS_URL || 'redis://localhost:6379'"
  }
];

const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', 'archive'];
const EXCLUDE_PATTERNS = ['test', 'spec', 'mock', '.example'];

function shouldProcess(filePath) {
  return !EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function fixFile(filePath) {
  if (!shouldProcess(filePath)) return 0;

  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  REPLACEMENTS.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      changes += matches.length;
    }
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${changes} issues in ${filePath}`);
  }

  return changes;
}

function processDirectory(dir) {
  let totalChanges = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !EXCLUDE_DIRS.includes(entry.name)) {
      totalChanges += processDirectory(fullPath);
    } else if (entry.isFile() && /\.(js|ts|tsx|jsx)$/.test(entry.name)) {
      totalChanges += fixFile(fullPath);
    }
  });

  return totalChanges;
}

const rootDir = process.argv[2] || process.cwd();
console.log(`🔧 Fixing hardcoded secrets in ${rootDir}...\n`);

const totalChanges = processDirectory(rootDir);

if (totalChanges === 0) {
  console.log('\n✅ No changes needed');
} else {
  console.log(`\n✅ Fixed ${totalChanges} hardcoded secrets`);
  console.log('⚠️  Review changes before committing');
  console.log('💡 Update .env files with actual values');
}
