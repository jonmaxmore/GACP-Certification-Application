/**
 * Field Audit Routes
 * API endpoints for field audit operations
 */

const express = require('express');
const router = express.Router();
const fieldAuditController = require('../../controllers/FieldAuditController');
const { authenticate, checkPermission } = require('../../middleware/AuthMiddleware');

// All routes require authentication
router.use(authenticate);

// ==================== Templates ====================

/**
 * @route GET /api/v2/field-audits/templates
 * @desc Get all active checklist templates
 * @access Authenticated
 */
router.get('/templates', fieldAuditController.getTemplates.bind(fieldAuditController));

/**
 * @route GET /api/v2/field-audits/templates/:code
 * @desc Get template by code
 * @access Authenticated
 */
router.get('/templates/:code', fieldAuditController.getTemplateByCode.bind(fieldAuditController));

// ==================== Auditor Routes ====================

/**
 * @route GET /api/v2/field-audits/my-schedule
 * @desc Get auditor's schedule for a specific date
 * @access Auditor
 */
router.get(
    '/my-schedule',
    checkPermission('audit.conduct'),
    fieldAuditController.getMySchedule.bind(fieldAuditController)
);

/**
 * @route GET /api/v2/field-audits/stats
 * @desc Get audit statistics
 * @access Admin, Manager
 */
router.get(
    '/stats',
    checkPermission('report.all'),
    fieldAuditController.getStats.bind(fieldAuditController)
);

// ==================== CRUD Routes ====================

/**
 * @route POST /api/v2/field-audits
 * @desc Create new audit
 * @access Scheduler, Admin
 */
router.post(
    '/',
    checkPermission('schedule.create'),
    fieldAuditController.createAudit.bind(fieldAuditController)
);

/**
 * @route GET /api/v2/field-audits/application/:applicationId
 * @desc Get all audits for an application
 * @access Authenticated
 */
router.get(
    '/application/:applicationId',
    fieldAuditController.getAuditsByApplication.bind(fieldAuditController)
);

/**
 * @route GET /api/v2/field-audits/:id
 * @desc Get audit by ID
 * @access Authenticated
 */
router.get('/:id', fieldAuditController.getAuditById.bind(fieldAuditController));

// ==================== Audit Flow Routes ====================

/**
 * @route POST /api/v2/field-audits/:id/start
 * @desc Start audit (check-in)
 * @access Auditor (assigned)
 */
router.post(
    '/:id/start',
    checkPermission('audit.conduct'),
    fieldAuditController.startAudit.bind(fieldAuditController)
);

/**
 * @route POST /api/v2/field-audits/:id/responses/:itemCode
 * @desc Submit single response
 * @access Auditor (assigned)
 */
router.post(
    '/:id/responses/:itemCode',
    checkPermission('audit.conduct'),
    fieldAuditController.submitResponse.bind(fieldAuditController)
);

/**
 * @route POST /api/v2/field-audits/:id/responses
 * @desc Submit all responses (batch)
 * @access Auditor (assigned)
 */
router.post(
    '/:id/responses',
    checkPermission('audit.conduct'),
    fieldAuditController.submitAllResponses.bind(fieldAuditController)
);

/**
 * @route POST /api/v2/field-audits/:id/complete
 * @desc Complete audit (check-out with score calculation)
 * @access Auditor (assigned)
 */
router.post(
    '/:id/complete',
    checkPermission('audit.conduct'),
    fieldAuditController.completeAudit.bind(fieldAuditController)
);

/**
 * @route POST /api/v2/field-audits/:id/sync
 * @desc Sync offline audit data
 * @access Auditor (assigned)
 */
router.post(
    '/:id/sync',
    checkPermission('audit.conduct'),
    fieldAuditController.syncOfflineAudit.bind(fieldAuditController)
);

// ==================== Report Routes ====================

/**
 * @route GET /api/v2/field-audits/:id/report
 * @desc Download audit report as PDF
 * @access Authenticated (staff)
 */
router.get(
    '/:id/report',
    fieldAuditController.downloadReport.bind(fieldAuditController)
);

/**
 * @route GET /api/v2/field-audits/:id/report/preview
 * @desc Preview audit report as HTML
 * @access Authenticated (staff)
 */
router.get(
    '/:id/report/preview',
    fieldAuditController.previewReport.bind(fieldAuditController)
);

// ==================== Photo Upload Routes ====================

/**
 * @route POST /api/v2/field-audits/:id/photos
 * @desc Upload photo with GPS geotag
 * @access Auditor (assigned)
 */
router.post(
    '/:id/photos',
    checkPermission('audit.conduct'),
    fieldAuditController.uploadPhoto.bind(fieldAuditController)
);

/**
 * @route GET /api/v2/field-audits/:id/photos
 * @desc Get all photos for audit
 * @access Authenticated
 */
router.get(
    '/:id/photos',
    fieldAuditController.getAuditPhotos.bind(fieldAuditController)
);

// ==================== Signature Routes ====================

/**
 * @route POST /api/v2/field-audits/:id/signature
 * @desc Submit digital signature
 * @access Authenticated
 */
router.post(
    '/:id/signature',
    fieldAuditController.submitSignature.bind(fieldAuditController)
);

// ==================== CAR Routes ====================

/**
 * @route GET /api/v2/field-audits/:id/car
 * @desc Generate CAR PDF for failed items
 * @access Authenticated (staff)
 */
router.get(
    '/:id/car',
    fieldAuditController.downloadCAR.bind(fieldAuditController)
);

module.exports = router;



