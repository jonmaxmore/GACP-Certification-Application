/**
 * File Upload Validation Middleware
 *
 * Comprehensive file upload security validation.
 * Implements magic byte verification, MIME type checking,
 * file size limits, and extension validation.
 *
 * Security Features:
 * - Magic byte (file signature) verification
 * - MIME type validation against whitelist
 * - File extension validation
 * - File size limits (configurable per type)
 * - Filename sanitization
 * - Malware scanning hooks (integration ready)
 *
 * Supported File Types:
 * - Documents: PDF
 * - Images: JPEG, PNG, WebP
 * - Archives: ZIP (for batch uploads)
 *
 * @module middleware/file-upload-validator
 * @author GACP Platform Team
 * @date 2025-10-26
 */

const path = require('path');
const logger = require('../shared/logger');

/**
 * Magic bytes (file signatures) for supported file types
 * These are the first few bytes of valid files
 */
const MAGIC_BYTES = {
  // PDF: %PDF-
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  // JPEG: FF D8 FF
  jpeg: [
    [0xff, 0xd8, 0xff, 0xdb], // JPEG raw
    [0xff, 0xd8, 0xff, 0xe0], // JPEG/JFIF
    [0xff, 0xd8, 0xff, 0xe1], // JPEG/Exif
  ],
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  png: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // WebP: RIFF....WEBP
  webp: [
    [0x52, 0x49, 0x46, 0x46], // Check first 4 bytes (RIFF), then check bytes 8-11 for WEBP
  ],
  // ZIP: PK (50 4B)
  zip: [
    [0x50, 0x4b, 0x03, 0x04], // ZIP local file header
    [0x50, 0x4b, 0x05, 0x06], // ZIP empty archive
    [0x50, 0x4b, 0x07, 0x08], // ZIP spanned archive
  ],
};

/**
 * File type whitelist with MIME types and extensions
 */
const ALLOWED_FILE_TYPES = {
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    maxSize: 10 * 1024 * 1024, // 10 MB
    category: 'document',
  },
  jpeg: {
    mimeTypes: ['image/jpeg', 'image/jpg'],
    extensions: ['.jpg', '.jpeg'],
    maxSize: 5 * 1024 * 1024, // 5 MB
    category: 'image',
  },
  png: {
    mimeTypes: ['image/png'],
    extensions: ['.png'],
    maxSize: 5 * 1024 * 1024, // 5 MB
    category: 'image',
  },
  webp: {
    mimeTypes: ['image/webp'],
    extensions: ['.webp'],
    maxSize: 5 * 1024 * 1024, // 5 MB
    category: 'image',
  },
  zip: {
    mimeTypes: ['application/zip', 'application/x-zip-compressed'],
    extensions: ['.zip'],
    maxSize: 50 * 1024 * 1024, // 50 MB
    category: 'archive',
  },
};

/**
 * Check if buffer starts with any of the magic byte sequences
 * @param {Buffer} buffer - File buffer
 * @param {Array} magicBytesList - List of magic byte sequences
 * @returns {boolean}
 */
function checkMagicBytes(buffer, magicBytesList) {
  return magicBytesList.some(magicBytes => {
    for (let i = 0; i < magicBytes.length; i++) {
      if (buffer[i] !== magicBytes[i]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Detect file type from magic bytes
 * @param {Buffer} buffer - File buffer (at least first 12 bytes)
 * @returns {string|null} - Detected file type or null
 */
function detectFileType(buffer) {
  // Check each file type's magic bytes
  for (const [fileType, magicBytesList] of Object.entries(MAGIC_BYTES)) {
    if (fileType === 'webp') {
      // WebP has special check: RIFF at start, WEBP at bytes 8-11
      if (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      ) {
        return 'webp';
      }
    } else if (checkMagicBytes(buffer, magicBytesList)) {
      return fileType;
    }
  }
  return null;
}

/**
 * Sanitize filename to prevent directory traversal and injection attacks
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  // Remove path separators and special characters
  let sanitized = filename.replace(/[/\\]/g, '_');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 255 - ext.length) + ext;
  }

  // Ensure no leading dots (hidden files)
  if (sanitized.startsWith('.')) {
    sanitized = '_' + sanitized;
  }

  return sanitized;
}

/**
 * Validate uploaded file
 * @param {Object} file - Multer file object
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result { valid: boolean, error: string }
 */
function validateFile(file, options = {}) {
  const {
    allowedTypes = Object.keys(ALLOWED_FILE_TYPES),
    maxSize = null,
    requireMagicByteCheck = true,
  } = options;

  try {
    // 1. Check if file exists
    if (!file || !file.buffer) {
      return { valid: false, error: 'No file provided' };
    }

    // 2. Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.originalname);
    file.sanitizedFilename = sanitizedFilename;

    // 3. Check file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    const fileTypeEntry = Object.entries(ALLOWED_FILE_TYPES).find(([, config]) =>
      config.extensions.includes(ext),
    );

    if (!fileTypeEntry) {
      return {
        valid: false,
        error: `File extension ${ext} is not allowed`,
      };
    }

    const [detectedType, typeConfig] = fileTypeEntry;

    // Check if this type is allowed
    if (!allowedTypes.includes(detectedType)) {
      return {
        valid: false,
        error: `File type ${detectedType} is not allowed in this context`,
      };
    }

    // 4. Check MIME type
    if (!typeConfig.mimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `MIME type ${file.mimetype} does not match extension ${ext}`,
      };
    }

    // 5. Check file size
    const sizeLimit = maxSize || typeConfig.maxSize;
    if (file.size > sizeLimit) {
      return {
        valid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit ${(sizeLimit / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // 6. Magic byte verification (file signature)
    if (requireMagicByteCheck) {
      const fileTypeFromMagicBytes = detectFileType(file.buffer);

      if (!fileTypeFromMagicBytes) {
        return {
          valid: false,
          error: 'Unable to verify file type from content (invalid file signature)',
        };
      }

      if (fileTypeFromMagicBytes !== detectedType) {
        return {
          valid: false,
          error: `File content (${fileTypeFromMagicBytes}) does not match extension (${ext})`,
        };
      }
    }

    // 7. Additional checks can be added here:
    // - Malware scanning
    // - Image dimension checks
    // - PDF page count limits
    // - Archive content validation

    return {
      valid: true,
      fileType: detectedType,
      category: typeConfig.category,
      sanitizedFilename,
    };
  } catch (error) {
    logger.error('[FileUploadValidator] Validation error:', error);
    return {
      valid: false,
      error: 'File validation failed',
    };
  }
}

/**
 * Express middleware for file upload validation
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
function validateFileUpload(options = {}) {
  return (req, res, next) => {
    // Check if file was uploaded
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        error: 'FILE_REQUIRED',
        message: 'No file uploaded',
      });
    }

    // Handle single file upload
    if (req.file) {
      const validation = validateFile(req.file, options);

      if (!validation.valid) {
        logger.warn('[FileUploadValidator] File validation failed:', {
          filename: req.file.originalname,
          error: validation.error,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          error: 'FILE_VALIDATION_FAILED',
          message: validation.error,
        });
      }

      // Attach validation result to request
      req.fileValidation = validation;
      logger.info('[FileUploadValidator] File validated successfully:', {
        filename: req.file.sanitizedFilename,
        type: validation.fileType,
        size: req.file.size,
      });
    }

    // Handle multiple file uploads
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const validations = [];

      for (const file of files) {
        const validation = validateFile(file, options);

        if (!validation.valid) {
          logger.warn('[FileUploadValidator] File validation failed:', {
            filename: file.originalname,
            error: validation.error,
            ip: req.ip,
          });

          return res.status(400).json({
            success: false,
            error: 'FILE_VALIDATION_FAILED',
            message: `${file.originalname}: ${validation.error}`,
          });
        }

        validations.push(validation);
      }

      req.fileValidations = validations;
      logger.info('[FileUploadValidator] Multiple files validated:', {
        count: files.length,
        types: validations.map(v => v.fileType),
      });
    }

    next();
  };
}

/**
 * Get allowed file types configuration
 * @returns {Object} Allowed file types
 */
function getAllowedFileTypes() {
  return ALLOWED_FILE_TYPES;
}

module.exports = {
  validateFileUpload,
  validateFile,
  sanitizeFilename,
  getAllowedFileTypes,
  ALLOWED_FILE_TYPES,
};
