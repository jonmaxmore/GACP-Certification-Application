/**
 * Comprehensive Import Path Fixer
 * Fixes all import path issues after mass file rename
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKEND = path.join(ROOT, 'apps', 'backend');

// Map of wrong paths → correct paths
const IMPORT_FIXES = {
  // Shared module files (in shared/ - NO suffixes)
  "'../shared/auth-middleware'": "'../shared/auth'",
  "'../../shared/auth-middleware'": "'../../shared/auth'",
  "'../../../shared/auth-middleware'": "'../../../shared/auth'",
  "'../shared/validation-utils'": "'../shared/validation'",
  "'../../shared/validation-utils'": "'../../shared/validation'",
  "'../shared/response-utils'": "'../shared/response'",
  "'../../shared/utils/response-utils'": "'../../shared/response'",
  "'../../shared/utils/response-utils'": "'../../shared/response'",
  "'../../../shared/utils/response-utils'": "'../../../shared/response'",
  
  // Middleware folder files (KEEP -middleware suffix - files were renamed!)
  // These are correct as-is, NO changes needed
  
  // Modules auth-dtam middleware
  "'../modules/auth-dtam/middleware/dtam-auth-middleware'": "'../modules/auth-dtam/middleware/dtam-auth'",
  "'../middleware/dtam-auth-middleware'": "'../middleware/dtam-auth'",
  
  // Services
  "'../services/database-health-monitor'": "'../services/health-monitoring'",
  
  // Utils in shared/ (no -utils suffix)
  "'../utils/validation-utils'": "'../utils/validation'",
  "'../../utils/validation-utils'": "'../../utils/validation'",
};

let totalFiles = 0;
let totalFixes = 0;

function fixFile(filePath) {
  if (!filePath.endsWith('.js')) return 0;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let fixes = 0;
  
  for (const [wrong, correct] of Object.entries(IMPORT_FIXES)) {
    if (content.includes(wrong)) {
      content = content.split(wrong).join(correct);
      fixes++;
    }
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return fixes;
  }
  
  return 0;
}

function walkDir(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item.name)) {
        continue;
      }
      walkDir(fullPath);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      const fixes = fixFile(fullPath);
      if (fixes > 0) {
        totalFiles++;
        totalFixes += fixes;
        const rel = path.relative(BACKEND, fullPath);
        console.log(`✅ ${rel} (${fixes} fixes)`);
      }
    }
  }
}

console.log('🔧 Comprehensive Import Path Fix\n');
console.log('Fixing patterns:');
Object.entries(IMPORT_FIXES).slice(0, 10).forEach(([w, c]) => {
  console.log(`  ${w} → ${c}`);
});
console.log(`  ... and ${Object.keys(IMPORT_FIXES).length - 10} more\n`);

walkDir(BACKEND);

console.log(`\n${'='.repeat(80)}`);
console.log(`✅ Fixed ${totalFixes} imports in ${totalFiles} files`);
console.log(`${'='.repeat(80)}\n`);
