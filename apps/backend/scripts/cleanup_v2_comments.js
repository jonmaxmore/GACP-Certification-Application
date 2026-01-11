const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, '../routes/api');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Replace /api/v2/ with /api/ in comments
    content = content.replace(/(\*\s+.*\/api\/)v2\//g, '$1');
    content = content.replace(/(\/\/\s+.*\/api\/)v2\//g, '$1');

    // Replace "V2" in "V2 API" or similar route descriptions (Case insensitive for V2)
    // Be careful not to break things, just targeting comments like "* V2 Plants Route" -> "* Plants Route"
    // Regex: Start of line comment, optional space, "V2 ", replace with "".
    content = content.replace(/(\*\s+)V2\s+/g, '$1');

    // Specific fix for "Migrated to V2" -> "Migrated" or just remove
    content = content.replace(/\(Migrated to V2\)/g, '');
    content = content.replace(/- V2 Version/g, '');
    content = content.replace(/- Prisma Version/g, ''); // Common pattern seen

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

console.log('Starting V2 cleanup...');
walk(ROUTES_DIR);
console.log('Cleanup complete.');
