/**
 * Database Backup Script
 * Uses mongodump to create a backup of the current database.
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const backupDir = path.join(__dirname, '../backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `backup-${timestamp}`);

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/botanical-audit';

console.log(`Starting backup to ${backupPath}...`);

// Construct mongodump command
// Note: This assumes mongodump is available in the system PATH
const command = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`mongodump output: ${stderr}`);
  }
  console.log(`Backup completed successfully at ${backupPath}`);
});
