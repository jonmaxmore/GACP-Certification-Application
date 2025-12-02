/**
 * Local File Storage Service Implementation
 *
 * Implements IFileStorageService interface using local file system.
 * Part of Clean Architecture - Infrastructure Layer
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp'); // For image processing

// Simple logger fallback
const logger = {
  error: (msg, err) => console.error(msg, err),
  info: msg => console.log(msg),
  warn: msg => console.warn(msg),
};

class LocalFileStorageService {
  constructor(config = {}) {
    this.config = {
      uploadDir: config.uploadDir || path.join(process.cwd(), 'uploads'),
      baseUrl: config.baseUrl || '/uploads',
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedTypes: config.allowedTypes || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
    };

    // Ensure upload directory exists
    this._ensureUploadDir();
  }

  async _ensureUploadDir() {
    try {
      await fs.mkdir(this.config.uploadDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create upload directory:', error);
    }
  }

  async uploadFile(fileData, options = {}) {
    try {
      const { buffer, originalName, mimeType } = fileData;
      const folder = options.folder || 'documents';

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(originalName);
      const fileName = `${timestamp}-${randomString}${ext}`;

      // Create folder path
      const folderPath = path.join(this.config.uploadDir, folder);
      await fs.mkdir(folderPath, { recursive: true });

      // Full file path
      const filePath = path.join(folder, fileName);
      const fullPath = path.join(this.config.uploadDir, filePath);

      // Write file
      await fs.writeFile(fullPath, buffer);

      // Calculate checksum
      const checksum = await this.calculateChecksum(buffer);

      // Generate file URL
      const fileUrl = `${this.config.baseUrl}/${filePath.replace(/\\/g, '/')}`;

      return {
        filePath,
        fileUrl,
        fileName,
        checksum,
      };
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async downloadFile(filePath) {
    try {
      const fullPath = path.join(this.config.uploadDir, filePath);
      const buffer = await fs.readFile(fullPath);
      return buffer;
    } catch (error) {
      logger.error('Error downloading file:', error);
      throw error;
    }
  }

  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.config.uploadDir, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      logger.error('Error deleting file:', error);
      return false;
    }
  }

  async fileExists(filePath) {
    try {
      const fullPath = path.join(this.config.uploadDir, filePath);
      await fs.access(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getFileUrl(filePath, options = {}) {
    try {
      // For local storage, just return the static URL
      return `${this.config.baseUrl}/${filePath.replace(/\\/g, '/')}`;
    } catch (error) {
      logger.error('Error getting file URL:', error);
      throw error;
    }
  }

  async generateThumbnail(filePath, options = {}) {
    try {
      const fullPath = path.join(this.config.uploadDir, filePath);
      const width = options.width || 300;
      const height = options.height || 300;

      // Create thumbnail filename
      const ext = path.extname(filePath);
      const thumbnailPath = filePath.replace(ext, `_thumb${ext}`);
      const thumbnailFullPath = path.join(this.config.uploadDir, thumbnailPath);

      // Generate thumbnail using sharp
      await sharp(fullPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(thumbnailFullPath);

      const thumbnailUrl = `${this.config.baseUrl}/${thumbnailPath.replace(/\\/g, '/')}`;

      return {
        thumbnailPath,
        thumbnailUrl,
      };
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  async calculateChecksum(buffer) {
    try {
      const hash = crypto.createHash('md5');
      hash.update(buffer);
      return hash.digest('hex');
    } catch (error) {
      logger.error('Error calculating checksum:', error);
      throw error;
    }
  }

  async validateFile(buffer, mimeType, options = {}) {
    const errors = [];

    // Check file size
    const maxSize = options.maxSize || this.config.maxFileSize;
    if (buffer.length > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Check MIME type
    const allowedTypes = options.allowedTypes || this.config.allowedTypes;
    if (!allowedTypes.includes(mimeType)) {
      errors.push(`File type ${mimeType} is not allowed`);
    }

    // Check for malicious content (basic check)
    const bufferString = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    const suspiciousPatterns = ['<script', 'javascript:', 'onerror=', 'onclick='];
    for (const pattern of suspiciousPatterns) {
      if (bufferString.toLowerCase().includes(pattern)) {
        errors.push('File contains potentially malicious content');
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get storage statistics
  async getStorageStatistics() {
    try {
      let totalSize = 0;
      let fileCount = 0;

      const calculateSize = async dir => {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            await calculateSize(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            fileCount++;
          }
        }
      };

      await calculateSize(this.config.uploadDir);

      return {
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        fileCount,
      };
    } catch (error) {
      logger.error('Error getting storage statistics:', error);
      return {
        totalSizeBytes: 0,
        totalSizeMB: '0.00',
        fileCount: 0,
      };
    }
  }

  // Clean up old files (optional)
  async cleanupOldFiles(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let deletedCount = 0;

      const cleanup = async dir => {
        const items = await fs.readdir(dir, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(dir, item.name);

          if (item.isDirectory()) {
            await cleanup(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            if (stats.mtime < cutoffDate) {
              await fs.unlink(fullPath);
              deletedCount++;
            }
          }
        }
      };

      await cleanup(this.config.uploadDir);

      return {
        deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      };
    } catch (error) {
      logger.error('Error cleaning up old files:', error);
      return {
        deletedCount: 0,
        error: error.message,
      };
    }
  }
}

module.exports = LocalFileStorageService;
