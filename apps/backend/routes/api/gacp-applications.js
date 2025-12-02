/**
 * GACP Application API Routes
 * API endpoints for farmer application demo
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const GACPApplicationService = require('../../services/gacp-application');

const router = express.Router();
const gacpService = new GACPApplicationService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'));
    }
  },
});

// Create new application
router.post('/applications', async (req, res) => {
  try {
    const { farmerData } = req.body;
    const application = await gacpService.createApplication(farmerData);

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        farmerData: application.farmerData,
        complianceScore: application.complianceScore,
        sopValidation: application.sopValidation,
        submissionReady: application.submissionReady,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Update farmer data
router.put('/applications/:applicationId/farmer-data', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { farmerData } = req.body;

    const application = await gacpService.updateFarmerData(applicationId, farmerData);

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        farmerData: application.farmerData,
        complianceScore: application.complianceScore,
        sopValidation: application.sopValidation,
        submissionReady: application.submissionReady,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Upload document
router.post(
  '/applications/:applicationId/documents/:documentType',
  upload.single('document'),
  async (req, res) => {
    try {
      const { applicationId, documentType } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      // Analyze document with AI
      const analysisResult = await gacpService.analyzeDocument(req.file, documentType);

      // Add document to application
      const fileInfo = {
        name: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date(),
      };

      const application = await gacpService.addDocument(
        applicationId,
        documentType,
        fileInfo,
        analysisResult,
      );

      res.json({
        success: true,
        data: {
          documentType,
          fileInfo,
          analysis: analysisResult,
          complianceScore: application.complianceScore,
          sopValidation: application.sopValidation,
          submissionReady: application.submissionReady,
          coaAnalysis: application.coaAnalysis,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

// Get application details
router.get('/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = gacpService.getApplication(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: {
        applicationId: application.id,
        farmerData: application.farmerData,
        documents: Object.keys(application.documents),
        documentAnalyses: application.documentAnalyses,
        sopValidation: application.sopValidation,
        complianceScore: application.complianceScore,
        submissionReady: application.submissionReady,
        coaAnalysis: application.coaAnalysis,
        status: application.status,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get SOP validation status
router.get('/applications/:applicationId/sop-validation', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const validationResult = await gacpService.validateSOP(applicationId);

    res.json({
      success: true,
      data: validationResult,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Submit application
router.post('/applications/:applicationId/submit', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const receipt = await gacpService.submitApplication(applicationId);

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get application status
router.get('/applications/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const status = gacpService.getApplicationStatus(applicationId);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Generate SOP compliance report
router.get('/applications/:applicationId/sop-report', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const report = gacpService.generateSOPReport(applicationId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Simulate document analysis (for demo purposes)
router.post('/demo/analyze-document', upload.single('document'), async (req, res) => {
  try {
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const analysisResult = await gacpService.analyzeDocument(req.file, documentType);

    res.json({
      success: true,
      data: {
        fileInfo: {
          name: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        analysis: analysisResult,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Generate demo COA analysis
router.post('/demo/analyze-coa', upload.single('coa'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No COA file uploaded',
      });
    }

    const fileInfo = {
      name: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };

    const coaAnalysis = await gacpService.analyzeCoA(fileInfo);

    res.json({
      success: true,
      data: {
        fileInfo,
        coaAnalysis,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
router.use((error, req, res, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.',
      });
    }
  }

  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error',
  });
});

module.exports = router;
