const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  },
});

router.post('/inspections/:id/snapshots', upload.array('snapshots', 20), async (req, res) => {
  try {
    const { id: inspectionId } = req.params;
    const { captions, timestamps } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No snapshots provided' });
    }

    const snapshots = files.map((file, index) => ({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      caption: Array.isArray(captions) ? captions[index] : captions,
      timestamp: Array.isArray(timestamps) ? timestamps[index] : timestamps,
      buffer: file.buffer,
    }));

    // TODO: Upload to S3 and save to database
    // For now, just return success
    res.json({
      success: true,
      message: 'Snapshots uploaded successfully',
      count: snapshots.length,
      inspectionId,
    });
  } catch (error) {
    console.error('Error uploading snapshots:', error);
    res.status(500).json({ error: 'Failed to upload snapshots' });
  }
});

router.get('/inspections/:id/snapshots', async (req, res) => {
  try {
    const { id: inspectionId } = req.params;

    // TODO: Fetch from database
    res.json({
      success: true,
      snapshots: [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch snapshots' });
  }
});

module.exports = router;
