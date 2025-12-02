/**
 * Rename files based on their responsibility (Senior Engineer Style)
 * 
 * Rules:
 * - Controllers: *-controller.js
 * - Use Cases: *-usecase.js
 * - Services: *-service.js
 * - Routes: *.routes.js
 * - Middleware: *-middleware.js
 * - Models: *-model.js (Mongoose schemas)
 * - Repositories: *-repository.js
 * - Utils: *-utils.js
 * - Domain entities: kebab-case.js (pure, no suffix)
 * - Value objects: kebab-case.js (pure, no suffix)
 * 
 * Usage:
 *   node scripts/rename-by-responsibility.js --dry-run   (preview only)
 *   node scripts/rename-by-responsibility.js --execute   (rename files)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'apps', 'backend');

// Naming rules based on directory structure
const NAMING_RULES = {
  // Controllers
  'presentation/controllers': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('-controller.js') || filename.endsWith('Controller.js')) return null;
    // Skip index files
    if (filename === 'index.js') return null;
    return filename.replace('.js', '-controller.js');
  },
  
  // Use Cases
  'application/use-cases': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('-usecase.js') || filename.endsWith('.use-case.js') || filename.endsWith('UseCase.js')) return null;
    // Skip index files
    if (filename === 'index.js') return null;
    return filename.replace('.js', '-usecase.js');
  },
  
  // Services
  'infrastructure/services': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('-service.js') || filename.endsWith('Service.js')) return null;
    // Skip index files
    if (filename === 'index.js') return null;
    return filename.replace('.js', '-service.js');
  },
  
  // Routes
  'presentation/routes': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('.routes.js') || filename.endsWith('-routes.js')) return null;
    // Skip index files
    if (filename === 'index.js') return null;
    return filename.replace('.js', '.routes.js');
  },
  
  // Middleware
  'middleware': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('-middleware.js') || filename.endsWith('Middleware.js') || filename.endsWith('.middleware.js')) return null;
    // Skip index files
    if (filename === 'index.js') return null;
    return filename.replace('.js', '-middleware.js');
  },
  
  // Models (Mongoose schemas)
  'infrastructure/database': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('-model.js') || filename.endsWith('Model.js')) return null;
    // Skip special files
    if (filename === 'index.js' || filename === 'connection.js' || filename.endsWith('-schema.js')) return null;
    return filename.replace('.js', '-model.js');
  },
  
  // Repositories
  'infrastructure/repositories': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('-repository.js') || filename.endsWith('Repository.js')) return null;
    // Skip index files
    if (filename === 'index.js') return null;
    return filename.replace('.js', '-repository.js');
  },
  
  // Domain entities - keep as kebab-case (no suffix)
  'domain/entities': null,
  
  // Value objects - keep as kebab-case (no suffix)
  'domain/value-objects': null,
  
  // Utils
  'utils': (filename) => {
    // Skip if already has suffix
    if (filename.endsWith('-utils.js') || filename.endsWith('-helper.js') || filename.endsWith('Utils.js') || filename.endsWith('.utils.js')) return null;
    // Skip index files
    if (filename === 'index.js') return null;
    return filename.replace('.js', '-utils.js');
  }
};

// Convert to kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// Check if file should be renamed based on directory
function shouldRename(filePath) {
  // Normalize path separators for cross-platform compatibility
  const relativePath = path.relative(BACKEND_DIR, filePath).replace(/\\/g, '/');
  
  for (const [dirPattern, renamer] of Object.entries(NAMING_RULES)) {
    if (relativePath.includes(dirPattern)) {
      return { pattern: dirPattern, renamer };
    }
  }
  
  return null;
}

// Collect all files that need renaming
function collectRenameOperations(dir, operations = []) {
  if (!fs.existsSync(dir)) return operations;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    // Skip excluded directories
    if (item.isDirectory()) {
      const dirname = item.name;
      if (['node_modules', '.git', 'dist', 'build', 'coverage', '__tests__'].includes(dirname)) {
        continue;
      }
      collectRenameOperations(fullPath, operations);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      const renameRule = shouldRename(fullPath);
      
      if (renameRule && renameRule.renamer) {
        const newName = renameRule.renamer(item.name);
        
        if (newName && newName !== item.name) {
          // Convert to kebab-case first
          const kebabName = toKebabCase(newName);
          
          operations.push({
            oldPath: fullPath,
            newPath: path.join(path.dirname(fullPath), kebabName),
            oldName: item.name,
            newName: kebabName,
            reason: renameRule.pattern
          });
        }
      }
    }
  }
  
  return operations;
}

// Update import statements in a file
function updateImports(filePath, renameMap) {
  if (!fs.existsSync(filePath) || !filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  for (const { oldPath, newPath } of renameMap) {
    const oldBasename = path.basename(oldPath, '.js');
    const newBasename = path.basename(newPath, '.js');
    
    // Match various import patterns
    const patterns = [
      new RegExp(`require\\(['"](.*/)?${oldBasename}['"]\\)`, 'g'),
      new RegExp(`from ['"](.*/)?${oldBasename}['"]`, 'g'),
      new RegExp(`require\\(['"](.*/)?${oldBasename}\\.js['"]\\)`, 'g'),
      new RegExp(`from ['"](.*/)?${oldBasename}\\.js['"]`, 'g')
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match, pathPrefix) => {
          const prefix = pathPrefix || '';
          if (match.includes('require')) {
            return `require('${prefix}${newBasename}')`;
          } else {
            return `from '${prefix}${newBasename}'`;
          }
        });
        updated = true;
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// Execute rename operations
function executeRenames(operations, dryRun = true) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔄 File Rename Operation - ${dryRun ? 'DRY RUN' : 'EXECUTING'}`);
  console.log(`${'='.repeat(80)}\n`);
  
  if (operations.length === 0) {
    console.log('✅ No files need renaming - all follow naming conventions!\n');
    return;
  }
  
  console.log(`Found ${operations.length} files to rename:\n`);
  
  // Group by reason
  const grouped = {};
  for (const op of operations) {
    if (!grouped[op.reason]) grouped[op.reason] = [];
    grouped[op.reason].push(op);
  }
  
  for (const [reason, ops] of Object.entries(grouped)) {
    console.log(`\n📁 ${reason}/ (${ops.length} files)`);
    console.log('-'.repeat(80));
    
    for (const op of ops) {
      console.log(`  ${op.oldName} → ${op.newName}`);
    }
  }
  
  if (dryRun) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📋 This was a DRY RUN - no files were changed');
    console.log('To execute: node scripts/rename-by-responsibility.js --execute');
    console.log(`${'='.repeat(80)}\n`);
    return;
  }
  
  // Ask for confirmation
  console.log(`\n${'='.repeat(80)}`);
  console.log('⚠️  You are about to rename', operations.length, 'files');
  console.log('This will also update all import statements automatically');
  console.log(`${'='.repeat(80)}\n`);
  
  // Check if git is available
  const isGitRepo = fs.existsSync(path.join(ROOT_DIR, '.git'));
  
  console.log('Renaming files...\n');
  
  for (const op of operations) {
    try {
      // Use git mv if in git repo
      if (isGitRepo) {
        execSync(`git mv "${op.oldPath}" "${op.newPath}"`, { stdio: 'inherit' });
      } else {
        fs.renameSync(op.oldPath, op.newPath);
      }
      console.log(`✅ ${op.oldName} → ${op.newName}`);
    } catch (error) {
      console.error(`❌ Failed to rename ${op.oldName}:`, error.message);
    }
  }
  
  // Update imports
  console.log('\n📝 Updating import statements...\n');
  
  function updateAllImports(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item.name)) {
          updateAllImports(fullPath);
        }
      } else if (item.isFile() && item.name.endsWith('.js')) {
        updateImports(fullPath, operations);
      }
    }
  }
  
  updateAllImports(BACKEND_DIR);
  
  console.log('✅ All import statements updated\n');
  console.log(`${'='.repeat(80)}`);
  console.log('✅ Rename operation completed successfully!');
  console.log(`${'='.repeat(80)}\n`);
  
  // Generate report
  const reportPath = path.join(ROOT_DIR, `rename-report-${Date.now()}.md`);
  const report = generateReport(operations);
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Report saved to: ${reportPath}\n`);
}

// Generate markdown report
function generateReport(operations) {
  let report = `# File Rename Report\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Total files renamed:** ${operations.length}\n\n`;
  
  const grouped = {};
  for (const op of operations) {
    if (!grouped[op.reason]) grouped[op.reason] = [];
    grouped[op.reason].push(op);
  }
  
  for (const [reason, ops] of Object.entries(grouped)) {
    report += `## ${reason}/\n\n`;
    report += `| Old Name | New Name |\n`;
    report += `|----------|----------|\n`;
    
    for (const op of ops) {
      report += `| ${op.oldName} | ${op.newName} |\n`;
    }
    
    report += `\n`;
  }
  
  return report;
}

// Main
function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');
  
  console.log('🔍 Scanning for files that need renaming...\n');
  
  const operations = collectRenameOperations(BACKEND_DIR);
  
  executeRenames(operations, isDryRun);
}

main();
