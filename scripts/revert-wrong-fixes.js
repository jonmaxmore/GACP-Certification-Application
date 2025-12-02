/**
 * Revert wrong import fixes (middleware files)
 */

const fs = require('fs');
const path = require('path');

const BACKEND = path.join(__dirname, '..', 'apps', 'backend');

// Revert wrong changes
const REVERTS = {
  "'../middleware/auth'": "'../middleware/auth-middleware'",
  "'../../middleware/auth'": "'../../middleware/auth-middleware'",
  "'../../../middleware/auth'": "'../../../middleware/auth-middleware'",
  "'../../../../middleware/auth'": "'../../../../middleware/auth-middleware'",
  "'../middleware/admin-auth'": "'../middleware/admin-auth-middleware'",
  "'../middleware/inspector-auth'": "'../middleware/inspector-auth-middleware'",
  "'../middleware/dtam-auth'": "'../middleware/dtam-auth-middleware'",
};

let total = 0;

function fixFile(filePath) {
  if (!filePath.endsWith('.js')) return 0;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  for (const [wrong, correct] of Object.entries(REVERTS)) {
    if (content.includes(wrong)) {
      content = content.split(wrong).join(correct);
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return 1;
  }
  
  return 0;
}

function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (['node_modules', '.git'].includes(item.name)) continue;
      walkDir(fullPath);
    } else if (item.isFile()) {
      if (fixFile(fullPath)) total++;
    }
  }
}

console.log('🔄 Reverting wrong middleware path changes...\n');
walkDir(BACKEND);
console.log(`✅ Reverted ${total} files\n`);
