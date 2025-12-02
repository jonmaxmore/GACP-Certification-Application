/**
 * Fix Remaining Import Issues - Phase 2
 * 
 * More careful fixes based on file location context
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'apps', 'backend');

// Files that should NOT be renamed (routes, not middleware)
const ROUTE_FILES = [
  'dtam-auth.js',           // routes file, not middleware
  'inspector.routes.js',    // already correctly named
  'approver.routes.js',     // already correctly named
  'dtam.routes.js'          // already correctly named
];

const FIXES = [
  // 1. Fix atlas-server.js specific imports
  {
    file: 'atlas-server.js',
    fixes: [
      {
        from: "require('./modules/auth-dtam/routes/dtam-auth-middleware')",
        to: "require('./modules/auth-dtam/routes/dtam-auth')",
        description: 'dtam-auth is a route file, not middleware'
      }
    ]
  },
  
  // 2. Fix auth-farmer index.js
  {
    file: 'modules/auth-farmer/index.js',
    fixes: [
      {
        from: /require\(['"]\.\/presentation\/routes\/auth-middleware['"]\)/g,
        to: "require('./presentation/routes/auth.routes')",
        description: 'auth.routes.js is the routes file'
      }
    ]
  },
  
  // 3. Fix training container
  {
    file: 'modules/training/container.js',
    fixes: [
      {
        from: /require\(['"]\.\/infrastructure\/database\/course-model['"]\)/g,
        to: "require('./infrastructure/database/course')",
        description: 'course.js was not renamed (database file)'
      },
      {
        from: /require\(['"]\.\/infrastructure\/database\/enrollment-model['"]\)/g,
        to: "require('./infrastructure/database/enrollment')",
        description: 'enrollment.js was not renamed (database file)'
      },
      {
        from: /require\(['"]\.\/presentation\/controllers\/training-controller['"]\)/g,
        to: "require('./presentation/controllers/training')",
        description: 'training.js was not renamed (controller)'
      }
    ]
  },
  
  // 4. Fix UserRepository (user model path)
  {
    file: 'modules/user-management/infrastructure/repositories/UserRepository.js',
    fixes: [
      {
        from: /require\(['"]\.\.\/models\/user-model['"]\)/g,
        to: "require('../models/User')",
        description: 'User.js (capitalized) is the model file'
      }
    ]
  },
  
  // 5. Fix payment service crypto
  {
    file: 'modules/payment-service/application/services/PaymentService.js',
    fixes: [
      {
        from: /const crypto = require\(['"]crypto-utils['"]\);/g,
        to: "const crypto = require('crypto');",
        description: 'Use Node.js built-in crypto'
      }
    ]
  },
  
  // 6. Fix index.js files that export utils/middleware
  {
    file: 'modules/shared/index.js',
    fixes: [
      {
        from: /require\(['"]\.\/utils\/validation-middleware['"]\)/g,
        to: "require('./utils/validation-utils')",
        description: 'validation-utils in shared/utils'
      }
    ]
  },
  
  // 7. Fix src/routes/index.js
  {
    file: 'src/routes/index.js',
    fixes: [
      {
        from: /require\(['"]\.\/auth-middleware['"]\)/g,
        to: "require('./auth')",
        description: 'auth.js is the routes file in src/routes'
      }
    ]
  }
];

let totalFixes = 0;

for (const { file, fixes } of FIXES) {
  const filePath = path.join(BACKEND_DIR, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped: ${file} (not found)`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let changesInFile = 0;
  
  for (const fix of fixes) {
    const before = content;
    
    if (fix.from instanceof RegExp) {
      content = content.replace(fix.from, fix.to);
    } else {
      content = content.split(fix.from).join(fix.to);
    }
    
    if (content !== before) {
      changesInFile++;
      console.log(`  ✓ ${fix.description}`);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixes += changesInFile;
    console.log(`✅ ${file} (${changesInFile} fixes)\n`);
  }
}

console.log(`\n${'='.repeat(80)}`);
console.log(`✅ Applied ${totalFixes} targeted fixes`);
console.log(`${'='.repeat(80)}\n`);

if (totalFixes > 0) {
  console.log('Next: Run tests to verify fixes worked');
  console.log('  npm test --prefix apps/backend\n');
}
