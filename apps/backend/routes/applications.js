/**
 * GACP Application API Routes
 * RESTful API endpoints for GACP certification workflow
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Application = require('../models/Application');
const GACPApplicationService = require('../services/gacp-application');
const GACPInspectionService = require('../services/gacp-inspection');
const GACPCertificateService = require('../services/gacp-certificate');

const { authenticate, authorize } = require('../middleware/auth-middleware');
const { validateRequest } = require('../middleware/validation-middleware');
const { handleAsync } = require('../middleware/error-handler-middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'storage', 'documents'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// === APPLICATION MANAGEMENT ROUTES ===

/**
 * POST /api/applications
 * Create new GACP application
 */
router.post(
  '/',
  authenticate,
  authorize(['farmer']),
  validateRequest({
    farmInformation: 'required|object',
    cropInformation: 'required|array|min:1',
  }),
  handleAsync(async (req, res) => {
    // Enforce KYC Verification
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user || user.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Identity verification required. Please wait for admin approval.',
        error: 'KYC_REQUIRED'
      });
    }

    const application = await GACPApplicationService.createApplication(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: {
        application,
        nextSteps: [
          'Upload required documents',
          'Pay application fee',
          'Submit application for review',
        ],
      },
    });
  }),
);

/**
 * GET /api/applications
 * Get applications list with filtering and pagination
 */
router.get(
  '/',
  authenticate,
  handleAsync(async (req, res) => {
    const {
      status,
      province,
      cropType,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter based on user role
    const filter = {};

    if (req.user.role === 'farmer') {
      filter.applicant = req.user.id;
    } else if (req.user.role === 'dtam_officer') {
      filter['farmInformation.location.province'] = req.user.workLocation.provinces[0];
    }

    if (status) {
      filter.currentStatus = status;
    }
    if (province) {
      filter['farmInformation.location.province'] = province;
    }
    if (cropType) {
      filter['cropInformation.cropType'] = cropType;
    }

    const applications = await Application.find(filter)
      .populate('applicant', 'fullName email phone')
      .populate('assignedOfficer', 'fullName email')
      .populate('assignedInspector', 'fullName email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: applications.length,
          totalRecords: total,
        },
      },
    });
  }),
);

/**
 * GET /api/applications/:id
 * Get specific application details
 */
router.get(
  '/:id',
  authenticate,
  handleAsync(async (req, res) => {
    const application = await Application.findById(req.params.id)
      .populate('applicant')
      .populate('assignedOfficer')
      .populate('assignedInspector');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check access permissions
    if (req.user.role === 'farmer' && application.applicant._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: { application },
    });
  }),
);

/**
 * PUT /api/applications/:id
 * Update application (draft only)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['farmer']),
  handleAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (application.currentStatus !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft applications can be updated',
      });
    }

    // Update allowed fields
    const allowedFields = ['farmInformation', 'cropInformation'];
    allowedFields.forEach(field => {
      if (req.body[field]) {
        application[field] = req.body[field];
      }
    });

    // Recalculate risk assessment
    application.assessRisk();

    await application.save();

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application },
    });
  }),
);

/**
 * POST /api/applications/:id/documents
 * Upload documents for application
 */
router.post(
  '/:id/documents',
  authenticate,
  authorize(['farmer']),
  upload.array('documents', 10),
  handleAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Process uploaded files
    const documents = req.files.map(file => ({
      documentType: req.body.documentType || 'general',
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: req.user.id,
      verificationStatus: 'pending',
    }));

    application.documents.push(...documents);
    await application.save();

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        uploadedDocuments: documents.length,
        totalDocuments: application.documents.length,
      },
    });
  }),
);

/**
 * POST /api/applications/:id/submit
 * Submit application for review
 */
router.post(
  '/:id/submit',
  authenticate,
  authorize(['farmer']),
  handleAsync(async (req, res) => {
    const application = await GACPApplicationService.submitApplication(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application,
        estimatedReviewTime: '7-14 working days',
      },
    });
  }),
);

// === REVIEW WORKFLOW ROUTES ===

/**
 * POST /api/applications/:id/review
 * Review application (DTAM Officer)
 */
router.post(
  '/:id/review',
  authenticate,
  authorize(['dtam_officer', 'admin']),
  validateRequest({
    decision: 'required|in:approved_for_inspection,revision_required,rejected',
    notes: 'required|string|min:10',
  }),
  handleAsync(async (req, res) => {
    const result = await GACPApplicationService.reviewApplication(
      req.params.id,
      req.user.id,
      req.body,
    );

    res.json({
      success: true,
      message: 'Application review completed',
      data: result,
    });
  }),
);

/**
 * POST /api/applications/:id/schedule-inspection
 * Schedule field inspection
 */
router.post(
  '/:id/schedule-inspection',
  authenticate,
  authorize(['dtam_officer', 'admin']),
  handleAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const inspectionDetails = await GACPApplicationService.scheduleInspection(
      application,
      req.body.preferredDate,
    );

    res.json({
      success: true,
      message: 'Inspection scheduled successfully',
      data: inspectionDetails,
    });
  }),
);

// === INSPECTION ROUTES ===

/**
 * POST /api/inspections/:applicationId/start
 * Initialize field inspection
 */
router.post(
  '/inspections/:applicationId/start',
  authenticate,
  authorize(['inspector', 'admin']),
  handleAsync(async (req, res) => {
    const inspectionData = await GACPInspectionService.initializeInspection(
      req.params.applicationId,
      req.user.id,
    );

    res.json({
      success: true,
      message: 'Inspection initialized',
      data: inspectionData,
    });
  }),
);

/**
 * POST /api/inspections/:applicationId/assess
 * Assess Critical Control Point
 */
router.post(
  '/inspections/:applicationId/assess',
  authenticate,
  authorize(['inspector', 'admin']),
  validateRequest({
    category: 'required|string',
    criterionId: 'required|string',
    compliance: 'required|in:compliant,minor_issue,major_issue,critical_issue',
    notes: 'required|string|min:5',
  }),
  handleAsync(async (req, res) => {
    const assessment = await GACPInspectionService.assessControlPoint(
      req.params.applicationId,
      req.user.id,
      req.body.category,
      req.body.criterionId,
      req.body,
    );

    res.json({
      success: true,
      message: 'Control point assessed',
      data: assessment,
    });
  }),
);

/**
 * POST /api/inspections/:applicationId/complete
 * Complete field inspection
 */
router.post(
  '/inspections/:applicationId/complete',
  authenticate,
  authorize(['inspector', 'admin']),
  validateRequest({
    finalNotes: 'required|string|min:20',
  }),
  handleAsync(async (req, res) => {
    const inspectionResult = await GACPInspectionService.completeInspection(
      req.params.applicationId,
      req.user.id,
      req.body,
    );

    res.json({
      success: true,
      message: 'Inspection completed',
      data: inspectionResult,
    });
  }),
);

// === CERTIFICATE ROUTES ===

/**
 * POST /api/applications/:id/certificate
 * Generate certificate (approved applications)
 */
router.post(
  '/:id/certificate',
  authenticate,
  authorize(['dtam_officer', 'admin']),
  handleAsync(async (req, res) => {
    const certificateData = await GACPCertificateService.generateCertificate(
      req.params.id,
      req.user.id,
    );

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificateData,
    });
  }),
);

/**
 * GET /api/certificates/:certificateNumber/verify
 * Verify certificate (public endpoint)
 */
router.get(
  '/certificates/:certificateNumber/verify',
  handleAsync(async (req, res) => {
    const verification = await GACPCertificateService.verifyCertificate(
      req.params.certificateNumber,
      req.query.code,
    );

    res.json({
      success: true,
      data: verification,
    });
  }),
);

/**
 * GET /api/certificates/:certificateNumber/page
 * Generate public verification page
 */
router.get(
  '/certificates/:certificateNumber/page',
  handleAsync(async (req, res) => {
    const verificationPage = await GACPCertificateService.generateVerificationPage(
      req.params.certificateNumber,
    );

    res.json({
      success: true,
      data: verificationPage,
    });
  }),
);

/**
 * POST /api/certificates/:certificateNumber/renew
 * Renew certificate
 */
router.post(
  '/certificates/:certificateNumber/renew',
  authenticate,
  authorize(['dtam_officer', 'admin']),
  handleAsync(async (req, res) => {
    const renewalResult = await GACPCertificateService.renewCertificate(
      req.params.certificateNumber,
      req.user.id,
      req.body,
    );

    res.json({
      success: true,
      message: 'Certificate renewed successfully',
      data: renewalResult,
    });
  }),
);

/**
 * POST /api/certificates/:certificateNumber/revoke
 * Revoke certificate
 */
router.post(
  '/certificates/:certificateNumber/revoke',
  authenticate,
  authorize(['dtam_officer', 'admin']),
  validateRequest({
    reason: 'required|string|min:10',
  }),
  handleAsync(async (req, res) => {
    const revocationResult = await GACPCertificateService.revokeCertificate(
      req.params.certificateNumber,
      req.user.id,
      req.body.reason,
    );

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: revocationResult,
    });
  }),
);

// === DASHBOARD & ANALYTICS ROUTES ===

/**
 * GET /api/applications/dashboard/stats
 * Get dashboard statistics
 */
router.get(
  '/dashboard/stats',
  authenticate,
  handleAsync(async (req, res) => {
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'farmer') {
      filter.applicant = req.user.id;
    } else if (req.user.role === 'dtam_officer') {
      filter.assignedOfficer = req.user.id;
    } else if (req.user.role === 'inspector') {
      filter.assignedInspector = req.user.id;
    }

    const stats = await Promise.all([
      Application.countDocuments({ ...filter, currentStatus: 'draft' }),
      Application.countDocuments({ ...filter, currentStatus: 'submitted' }),
      Application.countDocuments({ ...filter, currentStatus: 'under_review' }),
      Application.countDocuments({
        ...filter,
        currentStatus: 'inspection_scheduled',
      }),
      Application.countDocuments({
        ...filter,
        currentStatus: 'inspection_completed',
      }),
      Application.countDocuments({ ...filter, currentStatus: 'approved' }),
      Application.countDocuments({
        ...filter,
        currentStatus: 'certificate_issued',
      }),
      Application.countDocuments({ ...filter, currentStatus: 'rejected' }),
    ]);

    res.json({
      success: true,
      data: {
        draft: stats[0],
        submitted: stats[1],
        under_review: stats[2],
        inspection_scheduled: stats[3],
        inspection_completed: stats[4],
        approved: stats[5],
        certificate_issued: stats[6],
        rejected: stats[7],
        total: stats.reduce((sum, count) => sum + count, 0),
      },
    });
  }),
);

/**
 * GET /api/applications/dashboard/recent
 * Get recent applications activity
 */
router.get(
  '/dashboard/recent',
  authenticate,
  handleAsync(async (req, res) => {
    const filter = {};

    if (req.user.role === 'farmer') {
      filter.applicant = req.user.id;
    } else if (req.user.role === 'dtam_officer') {
      filter.assignedOfficer = req.user.id;
    } else if (req.user.role === 'inspector') {
      filter.assignedInspector = req.user.id;
    }

    const recentApplications = await Application.find(filter)
      .populate('applicant', 'fullName')
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('applicationNumber farmInformation.farmName currentStatus updatedAt');

    res.json({
      success: true,
      data: { recentApplications },
    });
  }),
);

module.exports = router;
