/**
 * Fix Import Paths After File Rename
 * 
 * Fixes common import path issues after mass rename:
 * 1. crypto-utils → crypto (Node.js built-in)
 * 2. validation-middleware → validation-utils
 * 3. error-handler-middleware → error-handler-utils
 * 4. Correct relative paths
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'apps', 'backend');

// Fix patterns (order matters - specific to generic)
const FIX_PATTERNS = [
  // 1. Fix crypto-utils back to crypto (Node.js built-in)
  {
    pattern: /require\(['"]crypto-utils['"]\)/g,
    replacement: "require('crypto')",
    description: 'crypto-utils → crypto (Node.js built-in)'
  },
  
  // 2. Fix validation-middleware in utils/ folder
  {
    pattern: /require\(['"](.*)\/utils\/validation-middleware['"]\)/g,
    replacement: "require('$1/utils/validation-utils')",
    description: 'validation-middleware → validation-utils (in utils/)'
  },
  {
    pattern: /require\(['"]\.\/validation-middleware['"]\)/g,
    replacement: "require('./validation-utils')",
    description: './validation-middleware → ./validation-utils'
  },
  
  // 3. Fix error-handler-middleware in utils/ folder
  {
    pattern: /require\(['"](.*)\/utils\/error-handler-middleware['"]\)/g,
    replacement: "require('$1/utils/error-handler-utils')",
    description: 'error-handler-middleware → error-handler-utils (in utils/)'
  },
  {
    pattern: /require\(['"](.*)\/utils\/errorHandler['"]\)/g,
    replacement: "require('$1/utils/error-handler-utils')",
    description: 'errorHandler → error-handler-utils'
  },
  {
    pattern: /require\(['"]\.\/errorHandler['"]\)/g,
    replacement: "require('./error-handler-utils')",
    description: './errorHandler → ./error-handler-utils'
  },
  
  // 4. Fix auth.routes → auth-routes.routes
  {
    pattern: /require\(['"](.*)\/routes\/auth['"]\)/g,
    replacement: "require('$1/routes/auth-middleware')",
    description: 'routes/auth → routes/auth-middleware (catch-all)'
  },
  
  // 5. Fix models/user → models/user-model
  {
    pattern: /require\(['"](.*)\/models\/user['"]\)/g,
    replacement: "require('$1/models/user-model')",
    description: 'models/user → models/user-model'
  },
  
  // 6. Fix presentation/routes/*Routes.js → *-routes.routes.js
  {
    pattern: /require\(['"](.*)\/routes\/(\w+)Routes['"]\)/g,
    replacement: (match, path, name) => {
      const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1);
      return `require('${path}/routes/${kebabName}-routes.routes')`;
    },
    description: 'DocumentRoutes → document-routes.routes'
  },
  
  // 7. Fix shared/auth → shared/auth-middleware
  {
    pattern: /require\(['"]\.\.\/\.\.\/\.\.\/shared\/auth['"]\)/g,
    replacement: "require('../../../shared/auth-middleware')",
    description: '../../../shared/auth → ../../../shared/auth-middleware'
  },
  {
    pattern: /require\(['"]\.\.\/shared\/auth['"]\)/g,
    replacement: "require('../shared/auth-middleware')",
    description: '../shared/auth → ../shared/auth-middleware'
  },
  {
    pattern: /require\(['"]\.\/shared\/auth['"]\)/g,
    replacement: "require('./shared/auth-middleware')",
    description: './shared/auth → ./shared/auth-middleware'
  },
  
  // 8. Fix middleware imports (generic catch-all - after specific rules)
  {
    pattern: /require\(['"](.*)\/middleware\/(?!.*-middleware\.js)(\w+)['"]\)/g,
    replacement: "require('$1/middleware/$2-middleware')",
    description: 'middleware/* → middleware/*-middleware'
  }
];

let totalFiles = 0;
let totalChanges = 0;

function fixImportsInFile(filePath) {
  if (!fs.existsSync(filePath) || !filePath.endsWith('.js')) return 0;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changesInFile = 0;
  
  for (const { pattern, replacement, description } of FIX_PATTERNS) {
    const before = content;
    
    if (typeof replacement === 'function') {
      content = content.replace(pattern, replacement);
    } else {
      content = content.replace(pattern, replacement);
    }
    
    if (content !== before) {
      changesInFile++;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return changesInFile;
  }
  
  return 0;
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item.name)) {
        continue;
      }
      processDirectory(fullPath);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      const changes = fixImportsInFile(fullPath);
      if (changes > 0) {
        totalFiles++;
        totalChanges += changes;
        const relativePath = path.relative(BACKEND_DIR, fullPath);
        console.log(`✅ ${relativePath} (${changes} fixes)`);
      }
    }
  }
}

console.log('🔧 Fixing import paths after file rename...\n');
console.log('Patterns to fix:');
FIX_PATTERNS.forEach((p, i) => {
  console.log(`  ${i + 1}. ${p.description}`);
});
console.log();

processDirectory(BACKEND_DIR);

console.log(`\n${'='.repeat(80)}`);
console.log(`✅ Fixed ${totalChanges} import statements in ${totalFiles} files`);
console.log(`${'='.repeat(80)}\n`);

if (totalFiles > 0) {
  console.log('💡 Next steps:');
  console.log('  1. Run tests: npm test');
  console.log('  2. Review changes: git diff');
  console.log('  3. Stage: git add -A');
  console.log('  4. Commit: git commit -m "fix: Correct import paths after file rename"');
  console.log();
}
