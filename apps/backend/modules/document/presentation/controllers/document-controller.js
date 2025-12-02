/**
 * Document Controller
 *
 * HTTP request handlers for document endpoints.
 * Part of Clean Architecture - Presentation Layer
 */

const multer = require('multer');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-document');

class DocumentController {
  constructor({
    uploadDocumentUseCase,
    getDocumentUseCase,
    downloadDocumentUseCase,
    listDocumentsUseCase,
    approveDocumentUseCase,
    rejectDocumentUseCase,
    deleteDocumentUseCase,
    updateDocumentMetadataUseCase,
    getDocumentsByRelatedEntityUseCase,
    getPendingDocumentsUseCase,
    getDocumentStatisticsUseCase,
  }) {
    this.uploadDocumentUseCase = uploadDocumentUseCase;
    this.getDocumentUseCase = getDocumentUseCase;
    this.downloadDocumentUseCase = downloadDocumentUseCase;
    this.listDocumentsUseCase = listDocumentsUseCase;
    this.approveDocumentUseCase = approveDocumentUseCase;
    this.rejectDocumentUseCase = rejectDocumentUseCase;
    this.deleteDocumentUseCase = deleteDocumentUseCase;
    this.updateDocumentMetadataUseCase = updateDocumentMetadataUseCase;
    this.getDocumentsByRelatedEntityUseCase = getDocumentsByRelatedEntityUseCase;
    this.getPendingDocumentsUseCase = getPendingDocumentsUseCase;
    this.getDocumentStatisticsUseCase = getDocumentStatisticsUseCase;

    // Configure multer for memory storage
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    });
  }

  // Upload document
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const uploadData = {
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        category: req.body.category,
        uploadedBy: req.user.id,
        uploadedByType: req.user.role === 'DTAM_STAFF' ? 'DTAM_STAFF' : 'FARMER',
        relatedEntity: req.body.relatedEntity ? JSON.parse(req.body.relatedEntity) : null,
        accessLevel: req.body.accessLevel,
        allowedRoles: req.body.allowedRoles ? JSON.parse(req.body.allowedRoles) : [],
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
        expiresAt: req.body.expiresAt,
        issuedDate: req.body.issuedDate,
      };

      const document = await this.uploadDocumentUseCase.execute(uploadData, req.file);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      });
    } catch (error) {
      logger.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error.message,
      });
    }
  }

  // Get document by ID
  async getDocument(req, res) {
    try {
      const documentId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const document = await this.getDocumentUseCase.execute(documentId, userId, userRole);

      res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      logger.error('Error getting document:', error);
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Access denied')
          ? 403
          : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to get document',
        error: error.message,
      });
    }
  }

  // Download document
  async downloadDocument(req, res) {
    try {
      const documentId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await this.downloadDocumentUseCase.execute(documentId, userId, userRole);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      res.send(result.buffer);
    } catch (error) {
      logger.error('Error downloading document:', error);
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Access denied')
          ? 403
          : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to download document',
        error: error.message,
      });
    }
  }

  // List documents
  async listDocuments(req, res) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { uploadedAt: -1 },
      };

      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await this.listDocumentsUseCase.execute(filters, options, userId, userRole);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error listing documents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list documents',
        error: error.message,
      });
    }
  }

  // Get documents by related entity
  async getDocumentsByEntity(req, res) {
    try {
      const entityType = req.params.entityType;
      const entityId = req.params.entityId;
      const userId = req.user.id;
      const userRole = req.user.role;

      const options = {
        type: req.query.type,
        status: req.query.status,
      };

      const documents = await this.getDocumentsByRelatedEntityUseCase.execute(
        entityType,
        entityId,
        userId,
        userRole,
        options,
      );

      res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      logger.error('Error getting documents by entity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get documents',
        error: error.message,
      });
    }
  }

  // Approve document (DTAM only)
  async approveDocument(req, res) {
    try {
      const documentId = req.params.id;
      const reviewerId = req.user.id;
      const notes = req.body.notes || '';

      const document = await this.approveDocumentUseCase.execute(documentId, reviewerId, notes);

      res.status(200).json({
        success: true,
        message: 'Document approved successfully',
        data: document,
      });
    } catch (error) {
      logger.error('Error approving document:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to approve document',
        error: error.message,
      });
    }
  }

  // Reject document (DTAM only)
  async rejectDocument(req, res) {
    try {
      const documentId = req.params.id;
      const reviewerId = req.user.id;
      const reason = req.body.reason;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }

      const document = await this.rejectDocumentUseCase.execute(documentId, reviewerId, reason);

      res.status(200).json({
        success: true,
        message: 'Document rejected successfully',
        data: document,
      });
    } catch (error) {
      logger.error('Error rejecting document:', error);
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to reject document',
        error: error.message,
      });
    }
  }

  // Update document metadata
  async updateMetadata(req, res) {
    try {
      const documentId = req.params.id;
      const updates = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const document = await this.updateDocumentMetadataUseCase.execute(
        documentId,
        updates,
        userId,
        userRole,
      );

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: document,
      });
    } catch (error) {
      logger.error('Error updating document:', error);
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Access denied')
          ? 403
          : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to update document',
        error: error.message,
      });
    }
  }

  // Delete document
  async deleteDocument(req, res) {
    try {
      const documentId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;
      const hardDelete = req.query.hard === 'true' && userRole === 'admin';

      const result = await this.deleteDocumentUseCase.execute(
        documentId,
        userId,
        userRole,
        hardDelete,
      );

      res.status(200).json({
        success: true,
        message: hardDelete ? 'Document deleted permanently' : 'Document archived successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error deleting document:', error);
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Access denied')
          ? 403
          : 500;
      res.status(status).json({
        success: false,
        message: 'Failed to delete document',
        error: error.message,
      });
    }
  }

  // Get pending documents (DTAM only)
  async getPendingDocuments(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { uploadedAt: 1 },
      };

      const result = await this.getPendingDocumentsUseCase.execute(options);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error getting pending documents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pending documents',
        error: error.message,
      });
    }
  }

  // Get document statistics (DTAM only)
  async getStatistics(req, res) {
    try {
      const filters = {
        uploadedBy: req.query.uploadedBy,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const statistics = await this.getDocumentStatisticsUseCase.execute(filters);

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('Error getting statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get document statistics',
        error: error.message,
      });
    }
  }
}

module.exports = DocumentController;
