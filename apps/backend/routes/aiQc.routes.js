/**
 * AI QC Routes
 * API endpoints for AI Quality Control operations
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const aiQcController = require('../controllers/aiQcController');
const { protect, requireRole } = require('../middleware/auth-middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ai-qc/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
    }
  },
});

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/v1/ai-qc/applications/:applicationId/run
 * @desc    Run AI QC on an application
 * @access  ADMIN, REVIEWER
 */
router.post(
  '/applications/:applicationId/run',
  requireRole(['ADMIN', 'REVIEWER']),
  aiQcController.runAIQC,
);

/**
 * @route   GET /api/v1/ai-qc/applications/:applicationId/results
 * @desc    Get AI QC results for an application
 * @access  ADMIN, REVIEWER, INSPECTOR, APPROVER
 */
router.get(
  '/applications/:applicationId/results',
  requireRole(['ADMIN', 'REVIEWER', 'INSPECTOR', 'APPROVER']),
  aiQcController.getAIQCResults,
);

/**
 * @route   POST /api/v1/ai-qc/ocr
 * @desc    Extract text from image (OCR)
 * @access  ADMIN, REVIEWER
 */
router.post(
  '/ocr',
  requireRole(['ADMIN', 'REVIEWER']),
  upload.single('image'),
  aiQcController.extractText,
);

/**
 * @route   POST /api/v1/ai-qc/validate-document
 * @desc    Validate a GACP document
 * @access  ADMIN, REVIEWER
 */
router.post(
  '/validate-document',
  requireRole(['ADMIN', 'REVIEWER']),
  upload.single('document'),
  aiQcController.validateDocument,
);

/**
 * @route   POST /api/v1/ai-qc/analyze-image
 * @desc    Analyze image quality
 * @access  ADMIN, REVIEWER, INSPECTOR
 */
router.post(
  '/analyze-image',
  requireRole(['ADMIN', 'REVIEWER', 'INSPECTOR']),
  upload.single('image'),
  aiQcController.analyzeImageQuality,
);

/**
 * @route   POST /api/v1/ai-qc/compare-documents
 * @desc    Compare two documents for consistency
 * @access  ADMIN, REVIEWER
 */
router.post(
  '/compare-documents',
  requireRole(['ADMIN', 'REVIEWER']),
  upload.array('documents', 2),
  aiQcController.compareDocuments,
);

/**
 * @route   POST /api/v1/ai-qc/batch-ocr
 * @desc    Batch OCR processing for multiple images
 * @access  ADMIN, REVIEWER
 */
router.post(
  '/batch-ocr',
  requireRole(['ADMIN', 'REVIEWER']),
  upload.array('images', 10),
  aiQcController.batchOCR,
);

/**
 * @route   GET /api/v1/ai-qc/stats
 * @desc    Get AI QC statistics
 * @access  ADMIN
 */
router.get('/stats', requireRole(['ADMIN']), aiQcController.getAIQCStats);

module.exports = router;
