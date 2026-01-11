/**
 * Document Verification Routes
 * Handles AI/OCR verification of uploaded documents
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const documentAnalysisService = require('../../services/document-analysis-service');
const authModule = require('../../middleware/auth-middleware');

// Helper to resolve file path safe-ish
const UPLOADS_DIR = path.join(__dirname, '../../../../uploads'); // Assuming apps/backend/uploads or root/uploads? wrapper needed.
// Better: use the same logic as upload-middleware or config.
// For now, allow relative path from project root or absolute if sensible.

// Use upload middleware to handle file from FormData
const upload = require('../../middleware/upload-middleware');

/**
 * POST /api/documents/verify
 * Verify an uploaded document
 * Accepts multipart/form-data: { file, expectedType }
 */
router.post('/verify', authModule.authenticateFarmer, upload.single('file'), async (req, res) => {
    try {
        const { expectedType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'File is required' });
        }

        console.log(`[AI] Verifying document: ${file.filename} as ${expectedType}`);

        // Call the AI Service with the absolute path from multer
        const result = await documentAnalysisService.verifyUploadedDocument(file.path, expectedType || 'UNKNOWN');

        // Map service response to frontend expectation
        const responseData = {
            verification: {
                isMatch: result.valid,
                confidence: result.confidencePercent,
                message: result.valid ? 'Document Verified' : (result.issues?.[0] || 'Verification failed'),
            },
            extractedData: result.extractedData,
            raw: result,
        };

        res.json({
            success: true,
            data: responseData,
        });

    } catch (error) {
        console.error('[AI] Verification Failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
