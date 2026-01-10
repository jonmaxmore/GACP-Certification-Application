/**
 * V2 Documents Route
 * Maps V2 endpoints to DocumentAnalysisController (Prisma Refactored)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const DocumentAnalysisController = require('../../controllers/DocumentAnalysisController');
const authModule = require('../../middleware/auth-middleware');

// Configure multer for memory storage (we pass buffer to OCR)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.'));
        }
    },
});

// Public/Protected endpoints
router.get('/requirements/:plantId', DocumentAnalysisController.getPlantRequirements);
router.post('/analyze', DocumentAnalysisController.analyzeDocuments);
router.post('/validate', DocumentAnalysisController.validateDocuments);
router.get('/plants', DocumentAnalysisController.getAvailablePlants);

// AI-Powered Document Verification (new)
router.post('/verify', upload.single('file'), DocumentAnalysisController.verifyDocument);

module.exports = router;
