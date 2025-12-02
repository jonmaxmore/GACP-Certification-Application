/**
 * Document Management Controller
 *
 * RESTful API controller for document upload, management, and access control.
 * Handles file operations with comprehensive security and validation.
 *
 * Endpoints:
 * POST   /documents/upload              - Upload document
 * GET    /documents/:id                 - Get document metadata
 * GET    /documents/:id/download        - Download document
 * GET    /documents/:id/thumbnail       - Get document thumbnail
 * GET    /applications/:id/documents    - Get application documents
 * PUT    /documents/:id                 - Update document metadata
 * DELETE /documents/:id                 - Delete document
 * POST   /documents/:id/share           - Share document
 * GET    /documents/search              - Search documents
 * GET    /documents/types               - Get document types
 *
 * Security Features:
 * - Role-based access control
 * - File type and size validation
 * - Virus scanning integration
 * - Secure download URLs with expiry
 * - Audit logging for all operations
 * - Rate limiting for uploads
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const multer = require('multer');
const { validationResult, param, body, query } = require('express-validator');

class DocumentController {
  constructor(dependencies = {}) {
    this.documentService = dependencies.documentManagementService;
    this.documentRepository = dependencies.documentRepository;
    this.auditService = dependencies.auditService;
    this.notificationService = dependencies.notificationService;

    // Configure multer for file uploads
    this.uploadConfig = this._configureMulter();

    logger.info('[DocumentController] Initialized successfully');
  }

  /**
   * Upload document endpoint
   * POST /documents/upload
   */
  async uploadDocument(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array(),
        });
      }

      const { documentType, applicationId, description, expiryDate } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'FILE_REQUIRED',
          message: 'No file uploaded',
        });
      }

      // Upload document
      const result = await this.documentService.uploadDocument(
        {
          file: req.file,
          documentType,
          applicationId,
          description,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
        userId,
        userRole,
      );

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: result.document,
      });
    } catch (error) {
      logger.error('[DocumentController] Upload error:', error);

      // Handle specific error types
      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          success: false,
          error: 'DOCUMENT_VALIDATION_ERROR',
          message: error.message,
          validationResult: error.validationResult,
        });
      }

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          error: 'UPLOAD_PERMISSION_DENIED',
          message: error.message,
        });
      }

      if (error.message.includes('Security scan failed')) {
        return res.status(400).json({
          success: false,
          error: 'SECURITY_SCAN_FAILED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'UPLOAD_ERROR',
        message: 'Error uploading document',
      });
    }
  }

  /**
   * Get document metadata endpoint
   * GET /documents/:id
   */
  async getDocumentMetadata(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array(),
        });
      }

      const { id } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      // Get document
      const document = await this.documentRepository.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Check access permissions
      const hasAccess = await this._checkDocumentAccess(document, userId, userRole);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: 'You do not have permission to access this document',
        });
      }

      // Generate secure download URL
      const downloadUrl = await this.documentService._generateSecureDownloadUrl(id, userId);

      res.status(200).json({
        success: true,
        data: {
          document: {
            id: document.id,
            documentType: document.documentType,
            originalName: document.originalName,
            fileSize: document.fileSize,
            uploadedAt: document.uploadedAt,
            uploadedBy: document.uploadedBy,
            expiryDate: document.expiryDate,
            status: document.status,
            validationStatus: document.validationStatus,
            downloadUrl: downloadUrl,
            thumbnailUrl: document.thumbnailUrl,
            isExpired: document.isExpired,
            ocrAvailable: !!document.ocrText,
          },
        },
      });
    } catch (error) {
      logger.error('[DocumentController] Get metadata error:', error);
      res.status(500).json({
        success: false,
        error: 'METADATA_ERROR',
        message: 'Error retrieving document metadata',
      });
    }
  }

  /**
   * Download document endpoint
   * GET /documents/:id/download
   */
  async downloadDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      const result = await this.documentService.downloadDocument(id, userId, userRole);

      // Set appropriate headers for download
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${result.document.originalName}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');

      // Redirect to secure download URL
      res.redirect(result.downloadUrl);
    } catch (error) {
      logger.error('[DocumentController] Download error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found',
        });
      }

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          error: 'DOWNLOAD_PERMISSION_DENIED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'DOWNLOAD_ERROR',
        message: 'Error downloading document',
      });
    }
  }

  /**
   * Get application documents endpoint
   * GET /applications/:id/documents
   */
  async getApplicationDocuments(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      const result = await this.documentService.getApplicationDocuments(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: {
          documents: result.documents,
          summary: result.summary,
        },
      });
    } catch (error) {
      logger.error('[DocumentController] Get application documents error:', error);

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'DOCUMENTS_ERROR',
        message: 'Error retrieving application documents',
      });
    }
  }

  /**
   * Update document metadata endpoint
   * PUT /documents/:id
   */
  async updateDocumentMetadata(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          details: errors.array(),
        });
      }

      const { id } = req.params;
      const { description, tags, expiryDate } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      // Get document
      const document = await this.documentRepository.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Check update permissions
      const canUpdate = await this._checkUpdatePermissions(document, userId, userRole);
      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          error: 'UPDATE_PERMISSION_DENIED',
          message: 'You do not have permission to update this document',
        });
      }

      // Update document
      const updateData = {
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        updatedAt: new Date(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const updatedDocument = await this.documentRepository.update(id, updateData);

      // Log update
      if (this.auditService) {
        await this.auditService.log({
          type: 'DOCUMENT_UPDATED',
          documentId: id,
          userId,
          changes: Object.keys(updateData),
          timestamp: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: {
          document: {
            id: updatedDocument.id,
            description: updatedDocument.description,
            tags: updatedDocument.tags,
            expiryDate: updatedDocument.expiryDate,
            updatedAt: updatedDocument.updatedAt,
          },
        },
      });
    } catch (error) {
      logger.error('[DocumentController] Update error:', error);
      res.status(500).json({
        success: false,
        error: 'UPDATE_ERROR',
        message: 'Error updating document',
      });
    }
  }

  /**
   * Delete document endpoint
   * DELETE /documents/:id
   */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.userId;
      const userRole = req.userRole;

      const success = await this.documentService.deleteDocument(id, userId, userRole, reason);

      if (success) {
        res.status(200).json({
          success: true,
          message: 'Document deleted successfully',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'DELETE_FAILED',
          message: 'Failed to delete document',
        });
      }
    } catch (error) {
      logger.error('[DocumentController] Delete error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found',
        });
      }

      if (error.message.includes('permission')) {
        return res.status(403).json({
          success: false,
          error: 'DELETE_PERMISSION_DENIED',
          message: error.message,
        });
      }

      if (error.message.includes('Cannot delete required document')) {
        return res.status(400).json({
          success: false,
          error: 'CANNOT_DELETE_REQUIRED',
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: 'DELETE_ERROR',
        message: 'Error deleting document',
      });
    }
  }

  /**
   * Search documents endpoint
   * GET /documents/search
   */
  async searchDocuments(req, res) {
    try {
      const {
        q: searchTerm,
        type: documentType,
        application: applicationId,
        status,
        page = 1,
        limit = 20,
      } = req.query;

      const userId = req.userId;
      const userRole = req.userRole;

      // Build search filters
      const filters = {
        status: status || 'ACTIVE',
      };

      if (documentType) {
        filters.documentType = documentType;
      }
      if (applicationId) {
        filters.applicationId = applicationId;
      }

      // Role-based filtering
      if (userRole === 'FARMER') {
        filters.uploadedBy = userId;
      }

      // Perform search
      const results = await this.documentRepository.search({
        searchTerm,
        filters,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });

      res.status(200).json({
        success: true,
        data: {
          documents: results.documents,
          pagination: results.pagination,
          searchMetadata: {
            searchTerm,
            filters,
            totalResults: results.total,
          },
        },
      });
    } catch (error) {
      logger.error('[DocumentController] Search error:', error);
      res.status(500).json({
        success: false,
        error: 'SEARCH_ERROR',
        message: 'Error searching documents',
      });
    }
  }

  /**
   * Get document types endpoint
   * GET /documents/types
   */
  async getDocumentTypes(req, res) {
    try {
      const documentTypes = this.documentService.documentTypes;

      // Filter types based on user role
      const userRole = req.userRole;
      const filteredTypes = {};

      for (const [key, config] of Object.entries(documentTypes)) {
        if (!config.uploadedBy || config.uploadedBy.includes(userRole)) {
          filteredTypes[key] = {
            name: config.name,
            required: config.required,
            formats: config.formats,
            maxSize: config.maxSize,
            hasExpiry: config.hasExpiry,
            allowMultiple: config.allowMultiple,
            minimumCount: config.minimumCount,
          };
        }
      }

      res.status(200).json({
        success: true,
        data: {
          documentTypes: filteredTypes,
        },
      });
    } catch (error) {
      logger.error('[DocumentController] Get document types error:', error);
      res.status(500).json({
        success: false,
        error: 'TYPES_ERROR',
        message: 'Error retrieving document types',
      });
    }
  }

  // Private helper methods

  /**
   * Configure multer for file uploads
   * @private
   */
  _configureMulter() {
    const storage = multer.memoryStorage();

    return multer({
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        // Basic file type validation
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Invalid file type: ${file.mimetype}`), false);
        }
      },
    });
  }

  /**
   * Check document access permissions
   * @private
   */
  async _checkDocumentAccess(document, userId, userRole) {
    // Admin has full access
    if (userRole === 'DTAM_ADMIN') {
      return true;
    }

    // Document owner has access
    if (document.uploadedBy.toString() === userId) {
      return true;
    }

    // Role-based access rules
    switch (userRole) {
      case 'FARMER':
        // Farmers can only access their own documents
        return document.uploadedBy.toString() === userId;

      case 'DTAM_REVIEWER':
        // Reviewers can access all application documents
        return ['ACTIVE', 'ARCHIVED'].includes(document.status);

      case 'DTAM_INSPECTOR':
        // Inspectors can access documents for assigned applications
        // This would require checking application assignment
        return ['ACTIVE', 'ARCHIVED'].includes(document.status);

      default:
        return false;
    }
  }

  /**
   * Check document update permissions
   * @private
   */
  async _checkUpdatePermissions(document, userId, userRole) {
    // Admin has full update access
    if (userRole === 'DTAM_ADMIN') {
      return true;
    }

    // Document owner can update (with restrictions)
    if (document.uploadedBy.toString() === userId) {
      // Check if document can be updated based on application status
      return document.status === 'ACTIVE';
    }

    return false;
  }

  /**
   * Validation rules for different endpoints
   */
  static getValidationRules() {
    return {
      upload: [
        body('documentType')
          .isIn([
            'farm_license',
            'land_deed',
            'farmer_id',
            'farm_photos',
            'water_test_report',
            'soil_test_report',
            'inspection_photos',
            'inspection_report',
            'certificate',
            'payment_receipt',
          ])
          .withMessage('Invalid document type'),
        body('applicationId').isMongoId().withMessage('Valid application ID is required'),
        body('description')
          .optional()
          .isLength({ max: 1000 })
          .withMessage('Description cannot exceed 1000 characters'),
        body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
      ],

      getDocument: [param('id').isMongoId().withMessage('Valid document ID is required')],

      updateDocument: [
        param('id').isMongoId().withMessage('Valid document ID is required'),
        body('description')
          .optional()
          .isLength({ max: 1000 })
          .withMessage('Description cannot exceed 1000 characters'),
        body('tags').optional().isString().withMessage('Tags must be a comma-separated string'),
        body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
      ],

      search: [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit')
          .optional()
          .isInt({ min: 1, max: 100 })
          .withMessage('Limit must be between 1 and 100'),
      ],
    };
  }
}

module.exports = DocumentController;
