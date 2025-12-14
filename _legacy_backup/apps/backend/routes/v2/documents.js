const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ============================================
// SECURITY: Rate Limiting
// ============================================
const rateLimit = {};
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_UPLOADS_PER_WINDOW = 10;

const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    if (!rateLimit[ip]) {
        rateLimit[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    }

    if (now > rateLimit[ip].resetTime) {
        rateLimit[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    }

    rateLimit[ip].count++;

    if (rateLimit[ip].count > MAX_UPLOADS_PER_WINDOW) {
        return res.status(429).json({
            success: false,
            message: 'คำขอมากเกินไป กรุณาลองใหม่ภายหลัง',
            retryAfter: Math.ceil((rateLimit[ip].resetTime - now) / 1000),
        });
    }

    next();
};

// ============================================
// SECURITY: Input Sanitization
// ============================================
const sanitizeFilename = (filename) => {
    if (!filename) return 'document';
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');
    // Remove special characters
    sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
    // Limit length
    sanitized = sanitized.substring(0, 200);
    return sanitized || 'document';
};

// ============================================
// SECURITY: Magic Bytes Validation
// ============================================
const MAGIC_BYTES = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47], // PNG
};

const validateMagicBytes = (buffer, mimeType) => {
    const expected = MAGIC_BYTES[mimeType];
    if (!expected) return true; // Unknown type, pass through

    for (let i = 0; i < expected.length; i++) {
        if (buffer[i] !== expected[i]) return false;
    }
    return true;
};

// ============================================
// Setup Upload Directory
// ============================================
const uploadDir = path.join(__dirname, '../../uploads/documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================
// Multer Configuration
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use crypto for secure random filename
        const randomBytes = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

        if (!allowedExtensions.includes(ext)) {
            return cb(new Error('นามสกุลไฟล์ไม่รองรับ'));
        }

        cb(null, `${randomBytes}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('ประเภทไฟล์ไม่รองรับ'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10, // Max 10 files at once
    }
});

// In-memory document store (replace with MongoDB in production)
const documents = new Map();

// ============================================
// SECURITY: Auth Middleware Placeholder
// ============================================
const authMiddleware = (req, res, next) => {
    // In production, verify JWT token and attach user
    // For now, allow anonymous but log it
    if (!req.user) {
        req.user = { id: 'anonymous', role: 'guest' };
    }
    next();
};

// ============================================
// SECURITY: Ownership Check
// ============================================
const checkOwnership = (document, userId) => {
    // In production, check if user owns the document
    // For now, always return true (to be implemented with real auth)
    return document.uploadedBy === userId || document.uploadedBy === 'anonymous';
};

// ============================================
// Routes
// ============================================

/**
 * @route POST /api/v2/files/upload
 * @desc Upload a document with security checks
 * @access Private
 */
router.post('/upload', rateLimitMiddleware, authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { applicationId, documentType, name } = req.body;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาเลือกไฟล์',
            });
        }

        // SECURITY: Validate magic bytes
        const fileBuffer = fs.readFileSync(file.path, { start: 0, end: 8 });
        if (!validateMagicBytes(fileBuffer, file.mimetype)) {
            // Delete the suspicious file
            fs.unlinkSync(file.path);
            return res.status(400).json({
                success: false,
                message: 'ไฟล์ไม่ถูกต้อง (content mismatch)',
            });
        }

        // SECURITY: Sanitize filename
        const safeName = sanitizeFilename(name || file.originalname);

        const docId = crypto.randomBytes(16).toString('hex');
        const document = {
            _id: docId,
            name: safeName,
            type: file.mimetype,
            filename: file.filename,
            size: file.size,
            path: file.path,
            url: `/api/v2/files/${docId}/file`,
            applicationId: applicationId || null,
            documentType: documentType || 'OTHER',
            uploadedAt: new Date().toISOString(),
            uploadedBy: req.user?.id || 'anonymous',
        };

        documents.set(docId, document);

        // SECURITY: Don't expose internal path
        res.status(201).json({
            success: true,
            message: 'อัปโหลดเอกสารสำเร็จ',
            data: {
                _id: document._id,
                name: document.name,
                type: document.type,
                size: document.size,
                url: document.url,
                uploadedAt: document.uploadedAt,
            },
        });
    } catch (error) {
        console.error('Upload error:', error.message);
        // SECURITY: Don't expose internal error details
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปโหลด',
        });
    }
});

/**
 * @route POST /api/v2/files/upload-multiple
 * @desc Upload multiple documents with rate limiting
 * @access Private
 */
router.post('/upload-multiple', rateLimitMiddleware, authMiddleware, upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        const { applicationId, documentType } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาเลือกไฟล์',
            });
        }

        const uploadedDocs = [];
        const failedFiles = [];

        for (const file of files) {
            try {
                // SECURITY: Validate magic bytes
                const fileBuffer = fs.readFileSync(file.path, { start: 0, end: 8 });
                if (!validateMagicBytes(fileBuffer, file.mimetype)) {
                    fs.unlinkSync(file.path);
                    failedFiles.push({ name: file.originalname, reason: 'invalid content' });
                    continue;
                }

                const docId = crypto.randomBytes(16).toString('hex');
                const document = {
                    _id: docId,
                    name: sanitizeFilename(file.originalname),
                    type: file.mimetype,
                    filename: file.filename,
                    size: file.size,
                    path: file.path,
                    url: `/api/v2/files/${docId}/file`,
                    applicationId: applicationId || null,
                    documentType: documentType || 'OTHER',
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: req.user?.id || 'anonymous',
                };
                documents.set(docId, document);
                uploadedDocs.push({
                    _id: document._id,
                    name: document.name,
                    type: document.type,
                    size: document.size,
                    url: document.url,
                });
            } catch {
                failedFiles.push({ name: file.originalname, reason: 'processing error' });
            }
        }

        res.status(201).json({
            success: true,
            message: `อัปโหลด ${uploadedDocs.length} ไฟล์สำเร็จ`,
            data: uploadedDocs,
            failed: failedFiles.length > 0 ? failedFiles : undefined,
        });
    } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปโหลด',
        });
    }
});

/**
 * @route GET /api/v2/files/:id
 * @desc Get document info by ID
 * @access Private
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // SECURITY: Validate ID format
        if (!/^[a-f0-9]{32}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'รูปแบบ ID ไม่ถูกต้อง',
            });
        }

        const document = documents.get(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบเอกสาร',
            });
        }

        res.json({
            success: true,
            data: {
                _id: document._id,
                name: document.name,
                type: document.type,
                size: document.size,
                url: document.url,
                applicationId: document.applicationId,
                documentType: document.documentType,
                uploadedAt: document.uploadedAt,
            },
        });
    } catch (error) {
        console.error('Get document error:', error.message);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาด',
        });
    }
});

/**
 * @route GET /api/v2/files/:id/file
 * @desc Download/stream document file
 * @access Private
 */
router.get('/:id/file', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // SECURITY: Validate ID format
        if (!/^[a-f0-9]{32}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'รูปแบบ ID ไม่ถูกต้อง',
            });
        }

        const document = documents.get(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบเอกสาร',
            });
        }

        if (!fs.existsSync(document.path)) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบไฟล์',
            });
        }

        // SECURITY: Set security headers
        res.setHeader('Content-Type', document.type);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.name)}"`);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "default-src 'none'");

        const stream = fs.createReadStream(document.path);
        stream.pipe(res);
    } catch (error) {
        console.error('Get file error:', error.message);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาด',
        });
    }
});

/**
 * @route GET /api/v2/files/application/:appId
 * @desc Get all documents for an application
 * @access Private
 */
router.get('/application/:appId', authMiddleware, async (req, res) => {
    try {
        const { appId } = req.params;

        // SECURITY: Validate appId format (basic)
        if (!appId || appId.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'รูปแบบ Application ID ไม่ถูกต้อง',
            });
        }

        const docs = Array.from(documents.values())
            .filter(d => d.applicationId === appId)
            .map(d => ({
                _id: d._id,
                name: d.name,
                type: d.type,
                size: d.size,
                url: d.url,
                documentType: d.documentType,
                uploadedAt: d.uploadedAt,
            }));

        res.json({
            success: true,
            data: docs,
        });
    } catch (error) {
        console.error('Get documents error:', error.message);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาด',
        });
    }
});

/**
 * @route DELETE /api/v2/files/:id
 * @desc Delete a document
 * @access Private
 */
router.delete('/:id', rateLimitMiddleware, authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // SECURITY: Validate ID format
        if (!/^[a-f0-9]{32}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'รูปแบบ ID ไม่ถูกต้อง',
            });
        }

        const document = documents.get(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบเอกสาร',
            });
        }

        // SECURITY: Check ownership
        if (!checkOwnership(document, req.user?.id)) {
            return res.status(403).json({
                success: false,
                message: 'ไม่มีสิทธิ์ลบเอกสารนี้',
            });
        }

        // Delete file from disk
        if (fs.existsSync(document.path)) {
            fs.unlinkSync(document.path);
        }

        documents.delete(id);

        res.json({
            success: true,
            message: 'ลบเอกสารสำเร็จ',
        });
    } catch (error) {
        console.error('Delete document error:', error.message);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาด',
        });
    }
});

// ============================================
// Document Requirements API
// ============================================
const {
    DOCUMENT_SLOTS,
    getRequiredDocuments,
    getObjectiveWarnings,
    canProceedWithObjectives
} = require('../../constants/DocumentSlots');

/**
 * @route GET /api/v2/files/requirements
 * @desc Get all document slot definitions
 * @access Public
 */
router.get('/requirements', (req, res) => {
    res.json({
        success: true,
        data: {
            slots: DOCUMENT_SLOTS,
            note: 'Use /requirements/validate to check conditional requirements'
        }
    });
});

/**
 * @route POST /api/v2/files/requirements/validate
 * @desc Validate document requirements based on user selections
 * @body { plantType, objectives, applicantType }
 * @access Public
 */
router.post('/requirements/validate', (req, res) => {
    try {
        const { plantType, objectives = [], applicantType = 'INDIVIDUAL' } = req.body;

        // Get required documents for these selections
        const requiredDocs = getRequiredDocuments({ plantType, objectives, applicantType });

        // Get warnings for objective selections
        const warnings = getObjectiveWarnings(objectives);

        res.json({
            success: true,
            data: {
                requiredDocuments: requiredDocs,
                warnings,
                summary: {
                    totalRequired: requiredDocs.length,
                    hasConditionalWarnings: warnings.length > 0,
                    conditionalDocs: warnings.map(w => ({
                        slotId: w.slotId,
                        warning: w.text
                    }))
                }
            }
        });
    } catch (error) {
        console.error('Validate requirements error:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
});

/**
 * @route POST /api/v2/files/requirements/check-proceed
 * @desc Check if user can proceed with their selections
 * @body { objectives, uploadedSlots }
 * @access Public
 */
router.post('/requirements/check-proceed', (req, res) => {
    try {
        const { objectives = [], uploadedSlots = [] } = req.body;

        const result = canProceedWithObjectives(objectives, uploadedSlots);

        res.json({
            success: true,
            data: {
                canProceed: result.canProceed,
                missingDocuments: result.missingDocs,
                message: result.canProceed
                    ? 'สามารถดำเนินการต่อได้'
                    : `ยังขาดเอกสารที่จำเป็น: ${result.missingDocs.map(d => d.slotId).join(', ')}`
            }
        });
    } catch (error) {
        console.error('Check proceed error:', error);
        res.status(500).json({
            success: false,
            error: 'เกิดข้อผิดพลาด'
        });
    }
});

module.exports = router;
