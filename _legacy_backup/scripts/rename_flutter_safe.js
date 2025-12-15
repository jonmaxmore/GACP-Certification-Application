const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../apps/mobile_app/lib');
const EXCLUDES = ['.dart_tool', 'build', 'generated'];

function toPascalCase(str) {
    const ext = path.extname(str);
    const name = path.basename(str, ext);
    const parts = name.split('_');
    const pascalName = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    return pascalName + ext;
}

function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (EXCLUDES.includes(file)) return;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList);
        } else {
            if (file.endsWith('.dart')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

// 1. Rename Files
const allFiles = getAllFiles(TARGET_DIR);
const renameMap = new Map();

allFiles.forEach(filePath => {
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    if (fileName.includes('_')) {
        const newFileName = toPascalCase(fileName);
        if (fileName !== newFileName) {
            const newPath = path.join(dir, newFileName);
            renameMap.set(filePath, newPath);
        }
    }
});

console.log(`Found ${renameMap.size} Flutter files to rename.`);

renameMap.forEach((newPath, oldPath) => {
    try {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${path.basename(oldPath)} -> ${path.basename(newPath)}`);
    } catch (e) {
        console.error(`Failed to rename ${oldPath}: ${e.message}`);
    }
});

// 2. Update CONTENT (Imports, parts)
const updatedFiles = getAllFiles(TARGET_DIR);

updatedFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Helper to transform a path string (import path or part path)
    const transformPath = (p) => {
        const parts = p.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('_')) {
            const pascalLast = toPascalCase(lastPart);
            const newParts = [...parts];
            newParts[newParts.length - 1] = pascalLast;
            return newParts.join('/');
        }
        return p;
    };

    // Update Imports: import '...';
    content = content.replace(/import\s+['"]([^'"]+)['"]/g, (match, importPath) => {
        // Apply to standard package: imports and relative imports
        if (importPath.includes('_')) {
            const newPath = transformPath(importPath);
            if (newPath !== importPath) {
                modified = true;
                return `import '${newPath}'`;
            }
        }
        return match;
    });

    // Update parts: part '...';
    content = content.replace(/part\s+['"]([^'"]+)['"]/g, (match, partPath) => {
        if (partPath.includes('_')) {
            const newPath = transformPath(partPath);
            if (newPath !== partPath) {
                modified = true;
                return `part '${newPath}'`;
            }
        }
        return match;
    });

    // Update part of: part of '...';
    content = content.replace(/part of\s+['"]([^'"]+)['"]/g, (match, partOfPath) => {
        if (partOfPath.includes('_')) {
            const newPath = transformPath(partOfPath);
            if (newPath !== partOfPath) {
                modified = true;
                return `part of '${newPath}'`;
            }
        }
        return match;
    });

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated content in: ${path.basename(filePath)}`);
    }
});
