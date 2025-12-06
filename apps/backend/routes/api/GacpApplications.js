/**
 * GACP Application API Routes
 * API endpoints for farmer application demo
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const gacpService = require('../../services/ApplicationWorkflowService');
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

const router = express.Router();

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
/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         formType:
 *           type: string
 *           enum: ['09', '10', '11']
 *           description: Form 9, 10, or 11
 *         applicantType:
 *           type: string
 *           description: Individual or Corporate
 *         establishmentId:
 *           type: string
 *           description: ID of related establishment
 *         serviceType:
 *           type: string
 *           enum: [NEW, RENEW]
 *           description: New application or renewal
 *         status:
 *           type: string
 *           readOnly: true
 *
 * /api/v2/applications/submit:
 *   post:
 *     summary: "Submit a new application (Note: Maps to /applications in current API)"
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Application'
 *     responses:
 *       201:
 *         description: Application created/submitted successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/applications',
  authenticate,
  checkPermission('application.create', 'application'),
  async (req, res) => {
    try {
      const farmerId = req.user.id || req.user._id;
      const applicationData = req.body;
      const application = await gacpService.createApplication(farmerId, applicationData);

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
  }
);

// Update farmer data
router.put(
  '/applications/:applicationId/farmer-data',
  authenticate,
  checkPermission('application.update', 'application'),
  async (req, res) => {
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
  }
);

// List all applications (Admin/Officer)
router.get(
  '/applications',
  authenticate,
  checkPermission('application.read', 'application'),
  async (req, res) => {
    try {
      // Officers/Admins can see all (or filtered by province if we implement strict scopes)
      // For now, allow filtering via query params
      const filters = {
        status: req.query.status,
        farmerId: req.query.farmerId,
        assignedOfficer: req.query.assignedOfficer
      };

      const result = await gacpService.getApplications(filters, {
        page: req.query.page,
        limit: req.query.limit
      });

      res.json({
        success: true,
        data: result // result { applications, pagination }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Upload document
router.post(
  '/applications/:applicationId/documents/:documentType',
  authenticate,
  checkPermission('application.update', 'application'),
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
  }
);

// Get application details
router.get(
  '/applications/:applicationId',
  authenticate,
  checkPermission('application.read', 'application'),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const application = await gacpService.getApplicationById(applicationId);

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
  }
);

// Get SOP validation status
router.get(
  '/applications/:applicationId/sop-validation',
  authenticate,
  checkPermission('application.read', 'application'),
  async (req, res) => {
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
  }
);

// Submit application
router.post(
  '/applications/:applicationId/submit',
  authenticate,
  checkPermission('application.update', 'application'),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const receipt = await gacpService.submitApplication(applicationId, req.user.id || req.user._id);

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
  }
);

// Get application status
router.get(
  '/applications/:applicationId/status',
  authenticate,
  checkPermission('application.read', 'application'),
  async (req, res) => {
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
  }
);

// Generate SOP compliance report
router.get(
  '/applications/:applicationId/sop-report',
  authenticate,
  checkPermission('application.read', 'application'),
  async (req, res) => {
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
  }
);

// Update application status
router.patch(
  '/applications/:applicationId/status',
  authenticate,
  checkPermission('application.update', 'application'),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.id || req.user._id;

      const application = await gacpService.updateApplicationStatus(
        applicationId,
        status,
        notes,
        userId
      );

      res.json({
        success: true,
        data: {
          applicationId: application.id,
          status: application.status,
          updatedAt: application.updatedAt,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
);

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

/**
 * @swagger
 * /api/v2/applications/my-applications:
 *   get:
 *     summary: View my application status (List)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of my applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 */
router.get('/my-applications', authenticate, async (req, res) => {
  try {
    const farmerId = req.user.id || req.user._id;
    const result = await gacpService.getApplications({ farmerId });
    res.json({ success: true, data: result.applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/v2/applications/{id}/cancel:
 *   post:
 *     summary: Cancel an application
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application cancelled
 */
router.post('/:id/cancel', authenticate, async (req, res) => {
  // Stub
  res.json({ success: true, message: 'Application cancelled' });
});

module.exports = router;
