/**
 * Automated Database Backup Service
 * Performs regular backups of MongoDB data
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const cron = require('node-cron');
const logger = require('../shared').logger;
const mongoManager = require('../config/mongodb-manager');

const backupLogger = logger.createLogger('backup-service');

class BackupService {
  constructor() {
    this.backupSchedule = '0 3 * * *'; // Every day at 3 AM
    this.backupDir = path.join(__dirname, '../backups');
    this.maxBackups = 7; // Keep only 7 latest backups
    this.backupTask = null;
  }

  async init() {
    try {
      // Create backup directory if it doesn't exist
      await fs.mkdir(this.backupDir, { recursive: true });
      backupLogger.info(`Backup service initialized, directory: ${this.backupDir}`);
      return true;
    } catch (error) {
      backupLogger.error('Failed to initialize backup service:', error);
      return false;
    }
  }

  start() {
    if (this.backupTask) {
      backupLogger.warn('Backup service already started');
      return;
    }

    backupLogger.info(`Starting backup service, schedule: ${this.backupSchedule}`);

    // Schedule backup task
    this.backupTask = cron.schedule(this.backupSchedule, () => {
      this.performBackup();
    });

    backupLogger.info('Backup service started');
  }

  async performBackup() {
    backupLogger.info('Starting database backup...');

    const mongoStatus = mongoManager.getStatus();
    if (!mongoStatus.isConnected) {
      backupLogger.error('Cannot perform backup: MongoDB is not connected');
      return false;
    }

    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const backupFilename = `botanical-audit-${timestamp}.gz`;
      const backupPath = path.join(this.backupDir, backupFilename);

      // Get MongoDB connection string
      const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

      if (!uri) {
        backupLogger.error('Cannot perform backup: No MongoDB URI found');
        return false;
      }

      // Parse connection string to get credentials and database
      const parsedUri = new URL(uri);
      // const database = parsedUri.pathname.substring(1);

      // Build mongodump command
      const cmd = 'mongodump';
      const args = [`--uri=${uri}`, `--archive=${backupPath}`, '--gzip'];

      backupLogger.info(`Running backup: ${cmd} ${args.join(' ').replace(uri, '***')}`);

      // Execute mongodump command
      return new Promise((resolve, reject) => {
        const process = spawn(cmd, args);

        let stdoutData = '';
        let stderrData = '';

        process.stdout.on('data', data => {
          stdoutData += data.toString();
        });

        process.stderr.on('data', data => {
          stderrData += data.toString();
        });

        process.on('close', async code => {
          if (code === 0) {
            backupLogger.info(`Backup successful: ${backupPath}`);

            // Cleanup old backups
            await this.cleanupOldBackups();

            resolve(true);
          } else {
            backupLogger.error(`Backup failed with code ${code}: ${stderrData}`);
            resolve(false);
          }
        });

        process.on('error', err => {
          backupLogger.error(`Failed to start backup process: ${err.message}`);
          reject(err);
        });
      });
    } catch (error) {
      backupLogger.error('Backup process error:', error);
      return false;
    }
  }

  async cleanupOldBackups() {
    try {
      // Get list of backup files
      const files = await fs.readdir(this.backupDir);

      // Filter for backup files and sort by date (newest first)
      const backupFiles = files
        .filter(file => file.startsWith('botanical-audit-') && file.endsWith('.gz'))
        .sort()
        .reverse();

      // If we have more files than our limit, delete the oldest ones
      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);

        for (const file of filesToDelete) {
          const filePath = path.join(this.backupDir, file);
          await fs.unlink(filePath);
          backupLogger.info(`Deleted old backup: ${filePath}`);
        }

        backupLogger.info(`Cleaned up ${filesToDelete.length} old backups`);
      }
    } catch (error) {
      backupLogger.error('Error during backup cleanup:', error);
    }
  }

  stop() {
    if (this.backupTask) {
      this.backupTask.stop();
      this.backupTask = null;
      backupLogger.info('Backup service stopped');
    }
  }

  async manualBackup() {
    backupLogger.info('Starting manual backup...');
    return this.performBackup();
  }
}

// Create singleton instance
const backupService = new BackupService();

module.exports = backupService;
