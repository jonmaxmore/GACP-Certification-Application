const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload-middleware');

/**
 * POST /api/uploads
 * Generic file upload endpoint
 */
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }

        // Return the path relative to the server/public
        // Assuming we serve 'uploads' directory statically
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                path: req.file.path,
                url: fileUrl,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'File upload failed',
        });
    }
});

module.exports = router;
