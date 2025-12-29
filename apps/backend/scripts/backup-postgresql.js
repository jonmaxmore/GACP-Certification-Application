/**
 * PostgreSQL Backup Script for GACP Platform
 * Cross-platform backup using pg_dump
 * 
 * Usage:
 *   node backup-postgresql.js
 * 
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string
 */

const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const backupDir = path.join(__dirname, '../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFile = path.join(backupDir, `gacp_backup_${timestamp}.sql`);

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${backupDir}`);
}

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error('❌ DATABASE_URL not set. Please check your .env file.');
    process.exit(1);
}

// Extract connection details from DATABASE_URL
// Format: postgres://user:password@host:port/database
const urlMatch = dbUrl.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!urlMatch) {
    console.error('❌ Invalid DATABASE_URL format.');
    process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log(`🔄 Starting PostgreSQL backup...`);
console.log(`   Database: ${database}`);
console.log(`   Host: ${host}:${port}`);

// Set PGPASSWORD for pg_dump
process.env.PGPASSWORD = password;

// Build pg_dump command
const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f "${backupFile}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        console.log('\n💡 Tip: Make sure PostgreSQL client (pg_dump) is installed.');
        console.log('   Windows: Install PostgreSQL or add pg_dump to PATH');
        console.log('   Linux: apt install postgresql-client');
        process.exit(1);
    }

    // Get file size
    const stats = fs.statSync(backupFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup completed!`);
    console.log(`   File: ${backupFile}`);
    console.log(`   Size: ${sizeMB} MB`);

    // Clean up old backups (keep last 7)
    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('gacp_backup_') && f.endsWith('.sql'))
        .sort()
        .reverse();

    if (files.length > 7) {
        const toDelete = files.slice(7);
        toDelete.forEach(file => {
            fs.unlinkSync(path.join(backupDir, file));
            console.log(`🗑️  Deleted old backup: ${file}`);
        });
    }

    console.log(`\n📊 Total backups: ${Math.min(files.length, 7)}`);
});
