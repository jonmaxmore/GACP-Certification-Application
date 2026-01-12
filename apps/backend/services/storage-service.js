const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../shared/logger');

// Environment variables
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local'; // 'local' or 's3'
const BASE_UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

/**
 * Ensure directory exists (Local Storage)
 */
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Get Storage Engine
 * @param {string} folder - Subfolder name (e.g., 'identity', 'verification')
 */
const getStorage = (folder = '') => {
    if (STORAGE_PROVIDER === 's3') {
        // [TODO] Implement S3 Storage
        // const s3 = new S3Client({ ... });
        // return multerS3({ s3, bucket: ..., key: ... });
        logger.warn('S3 Provider selected but not implemented. Falling back to Local.');
    }

    // Local Storage (Default)
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const finalPath = path.join(BASE_UPLOAD_DIR, folder);
            ensureDir(finalPath);
            cb(null, finalPath);
        },
        filename: (req, file, cb) => {
            // Standardized Cleanup: UUID + Timestamp + Ext
            const ext = path.extname(file.originalname);
            const filename = `${Date.now()}-${uuidv4()}${ext}`;
            cb(null, filename);
        },
    });
};

/**
 * Create Multer Instance
 * @param {string} folder - Target subfolder
 * @param {string[]} allowedMimeTypes - Array of allowed mime types
 * @param {number} maxFileSizeMB - Max size in MB
 */
const createUploader = (folder = '', allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'], maxFileSizeMB = 5) => {
    return multer({
        storage: getStorage(folder),
        limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`));
            }
        },
    });
};

module.exports = {
    createUploader,
    getStorage, // Exported for direct usage if needed
};
