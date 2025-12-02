/**
 * Document Management Routes
 *
 * Express router configuration for document management endpoints.
 * Handles routing for document upload, download, metadata management,
 * and search functionality with proper authentication and authorization.
 *
 * Routes:
 * POST   /upload                        - Upload new document
 * GET    /:id                           - Get document metadata
 * GET    /:id/download                  - Download document file
 * GET    /:id/thumbnail                 - Get document thumbnail
 * PUT    /:id                           - Update document metadata
 * DELETE /:id                           - Delete document
 * POST   /:id/share                     - Share document with others
 * GET    /application/:id               - Get all documents for application
 * GET    /search                        - Search documents
 * GET    /types                         - Get document type definitions
 * GET    /stats                         - Get document statistics
 *
 * Security:
 * - JWT authentication required for all routes
 * - Role-based authorization for specific operations
 * - Rate limiting on upload endpoints
 * - Request validation and sanitization
 * - File upload size and type restrictions
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const express = require('express');
const rateLimit = require('express-rate-limit');
const DocumentController = require('../controllers/DocumentController');
const AuthenticationMiddleware = require('../../../user-management/presentation/middleware/AuthenticationMiddleware-middleware');

class DocumentRoutes {
  constructor(dependencies = {}) {
    this.router = express.Router();
    this.documentController = new DocumentController(dependencies);
    this.authMiddleware = new AuthenticationMiddleware(dependencies);

    // Configure rate limiting
    this.uploadLimiter = this._configureUploadRateLimit();
    this.downloadLimiter = this._configureDownloadRateLimit();

    this._setupRoutes();
    logger.info('[DocumentRoutes] Initialized successfully');
  }

  /**
   * Setup all document management routes
   * @private
   */
  _setupRoutes() {
    const router = this.router;
    const controller = this.documentController;
    const auth = this.authMiddleware;
    const validationRules = DocumentController.getValidationRules();

    // Apply authentication to all routes
    router.use(auth.authenticateJWT.bind(auth));

    // Document upload route with rate limiting
    router.post(
      '/upload',
      this.uploadLimiter,
      controller.uploadConfig.single('document'),
      validationRules.upload,
      this._handleMulterErrors.bind(this),
      controller.uploadDocument.bind(controller),
    );

    // Document metadata route
    router.get(
      '/:id',
      validationRules.getDocument,
      controller.getDocumentMetadata.bind(controller),
    );

    // Document download route with rate limiting
    router.get(
      '/:id/download',
      this.downloadLimiter,
      validationRules.getDocument,
      controller.downloadDocument.bind(controller),
    );

    // Document thumbnail route
    router.get('/:id/thumbnail', validationRules.getDocument, this._getThumbnail.bind(this));

    // Update document metadata route
    router.put(
      '/:id',
      validationRules.updateDocument,
      controller.updateDocumentMetadata.bind(controller),
    );

    // Delete document route
    router.delete('/:id', validationRules.getDocument, controller.deleteDocument.bind(controller));

    // Share document route
    router.post('/:id/share', validationRules.getDocument, this._shareDocument.bind(this));

    // Get application documents route
    router.get(
      '/application/:id',
      [
        require('express-validator')
          .param('id')
          .isMongoId()
          .withMessage('Valid application ID is required'),
      ],
      controller.getApplicationDocuments.bind(controller),
    );

    // Search documents route
    router.get('/search', validationRules.search, controller.searchDocuments.bind(controller));

    // Get document types route
    router.get('/types', controller.getDocumentTypes.bind(controller));

    // Get document statistics route
    router.get(
      '/stats',
      auth.requireRole(['DTAM_ADMIN', 'DTAM_REVIEWER']),
      this._getDocumentStats.bind(this),
    );

    // Error handling middleware
    router.use(this._handleErrors.bind(this));
  }

  /**
   * Configure upload rate limiting
   * @private
   */
  _configureUploadRateLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // limit each IP to 20 uploads per windowMs
      message: {
        success: false,
        error: 'UPLOAD_RATE_LIMIT',
        message: 'Too many upload requests, please try again later',
        retryAfter: 15 * 60, // seconds
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: req => {
        // Rate limit per user, not IP for authenticated requests
        return req.userId || req.ip;
      },
    });
  }

  /**
   * Configure download rate limiting
   * @private
   */
  _configureDownloadRateLimit() {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100, // limit each user to 100 downloads per windowMs
      message: {
        success: false,
        error: 'DOWNLOAD_RATE_LIMIT',
        message: 'Too many download requests, please try again later',
        retryAfter: 5 * 60, // seconds
      },
      keyGenerator: req => {
        return req.userId || req.ip;
      },
      skip: req => {
        // Skip rate limiting for admins
        return req.userRole === 'DTAM_ADMIN';
      },
    });
  }

  /**
   * Handle multer upload errors
   * @private
   */
  _handleMulterErrors(error, req, res, next) {
    if (error) {
      logger.error('[DocumentRoutes] Multer error:', error);

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'FILE_TOO_LARGE',
          message: 'File size exceeds the maximum limit of 50MB',
        });
      }

      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'TOO_MANY_FILES',
          message: 'Only one file can be uploaded at a time',
        });
      }

      if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: error.message,
        });
      }

      return res.status(400).json({
        success: false,
        error: 'UPLOAD_ERROR',
        message: 'Error uploading file',
      });
    }

    next();
  }

  /**
   * Get document thumbnail
   * @private
   */
  async _getThumbnail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const userRole = req.userRole;

      // Get document
      const document = await this.documentController.documentRepository.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Check access permissions
      const hasAccess = await this.documentController._checkDocumentAccess(
        document,
        userId,
        userRole,
      );
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'ACCESS_DENIED',
          message: 'You do not have permission to access this document',
        });
      }

      // Return thumbnail URL or generate one
      if (document.thumbnailUrl) {
        res.redirect(document.thumbnailUrl);
      } else {
        // Generate default thumbnail based on file type
        const defaultThumbnail = this._getDefaultThumbnail(document.mimeType);
        res.redirect(defaultThumbnail);
      }
    } catch (error) {
      logger.error('[DocumentRoutes] Thumbnail error:', error);
      res.status(500).json({
        success: false,
        error: 'THUMBNAIL_ERROR',
        message: 'Error retrieving thumbnail',
      });
    }
  }

  /**
   * Share document with other users
   * @private
   */
  async _shareDocument(req, res) {
    try {
      const { id } = req.params;
      const { emails, permissions, expiryHours = 24 } = req.body;
      const userId = req.userId;

      // Validate input
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_EMAILS',
          message: 'Valid email addresses are required',
        });
      }

      // Get document
      const document = await this.documentController.documentRepository.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'DOCUMENT_NOT_FOUND',
          message: 'Document not found',
        });
      }

      // Check if user can share this document
      if (document.uploadedBy.toString() !== userId && req.userRole !== 'DTAM_ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'SHARE_PERMISSION_DENIED',
          message: 'You can only share documents you uploaded',
        });
      }

      // Create sharing tokens
      const shareTokens = await Promise.all(
        emails.map(async email => {
          const token = await this.documentController.documentService._generateShareToken({
            documentId: id,
            sharedBy: userId,
            sharedWith: email,
            permissions: permissions || ['view'],
            expiryDate: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
          });
          return { email, token };
        }),
      );

      // Send sharing notifications
      if (this.documentController.notificationService) {
        await this.documentController.notificationService.sendDocumentShare({
          document,
          sharedBy: userId,
          shareTokens,
          message: req.body.message,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Document shared successfully',
        data: {
          sharedWith: emails,
          expiryDate: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
          shareCount: shareTokens.length,
        },
      });
    } catch (error) {
      logger.error('[DocumentRoutes] Share error:', error);
      res.status(500).json({
        success: false,
        error: 'SHARE_ERROR',
        message: 'Error sharing document',
      });
    }
  }

  /**
   * Get document statistics
   * @private
   */
  async _getDocumentStats(req, res) {
    try {
      const { period = '30d', type } = req.query;

      // Calculate date range
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get statistics from repository
      const stats = await this.documentController.documentRepository.getStatistics({
        startDate,
        endDate: new Date(),
        documentType: type,
      });

      res.status(200).json({
        success: true,
        data: {
          period,
          statistics: stats,
        },
      });
    } catch (error) {
      logger.error('[DocumentRoutes] Stats error:', error);
      res.status(500).json({
        success: false,
        error: 'STATS_ERROR',
        message: 'Error retrieving document statistics',
      });
    }
  }

  /**
   * Get default thumbnail for file type
   * @private
   */
  _getDefaultThumbnail(mimeType) {
    const thumbnailMap = {
      'application/pdf': '/assets/thumbnails/pdf.svg',
      'image/jpeg': '/assets/thumbnails/image.svg',
      'image/jpg': '/assets/thumbnails/image.svg',
      'image/png': '/assets/thumbnails/image.svg',
      'application/msword': '/assets/thumbnails/doc.svg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '/assets/thumbnails/doc.svg',
    };

    return thumbnailMap[mimeType] || '/assets/thumbnails/file.svg';
  }

  /**
   * Error handling middleware
   * @private
   */
  _handleErrors(error, req, res, _next) {
    logger.error('[DocumentRoutes] Unhandled error:', error);

    // Don't log stack trace in production
    const stack = process.env.NODE_ENV === 'development' ? error.stack : undefined;

    res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(stack && { stack }),
    });
  }

  /**
   * Get the configured router
   */
  getRouter() {
    return this.router;
  }
}

module.exports = DocumentRoutes;
