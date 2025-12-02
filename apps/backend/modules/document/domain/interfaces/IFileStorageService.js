/**
 * File Storage Service Interface
 *
 * Defines the contract for file storage operations.
 * Part of Clean Architecture - Domain Layer (Dependency Inversion Principle)
 */

class IFileStorageService {
  /**
   * Upload file to storage
   * @param {Object} fileData - File data
   * @param {Buffer} fileData.buffer - File buffer
   * @param {string} fileData.originalName - Original file name
   * @param {string} fileData.mimeType - MIME type
   * @param {Object} options - Upload options (folder, access level, etc.)
   * @returns {Promise<Object>} { filePath, fileUrl, fileName, checksum }
   */
  async uploadFile(_fileData, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Download file from storage
   * @param {string} filePath - File path in storage
   * @returns {Promise<Buffer>} File buffer
   */
  async downloadFile(_filePath) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete file from storage
   * @param {string} filePath - File path in storage
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(_filePath) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path in storage
   * @returns {Promise<boolean>} Exists status
   */
  async fileExists(_filePath) {
    throw new Error('Method not implemented');
  }

  /**
   * Get file URL (for download/preview)
   * @param {string} filePath - File path in storage
   * @param {Object} options - URL options (expiration, etc.)
   * @returns {Promise<string>} File URL
   */
  async getFileUrl(_filePath, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Generate thumbnail for image
   * @param {string} filePath - Original file path
   * @param {Object} options - Thumbnail options (width, height)
   * @returns {Promise<Object>} { thumbnailPath, thumbnailUrl }
   */
  async generateThumbnail(_filePath, _options) {
    throw new Error('Method not implemented');
  }

  /**
   * Calculate file checksum (MD5 or SHA256)
   * @param {Buffer} buffer - File buffer
   * @returns {Promise<string>} Checksum
   */
  async calculateChecksum(_buffer) {
    throw new Error('Method not implemented');
  }

  /**
   * Validate file (type, size, virus scan)
   * @param {Buffer} buffer - File buffer
   * @param {string} mimeType - MIME type
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} { valid, errors }
   */
  async validateFile(_buffer, _mimeType, _options) {
    throw new Error('Method not implemented');
  }
}

module.exports = IFileStorageService;
