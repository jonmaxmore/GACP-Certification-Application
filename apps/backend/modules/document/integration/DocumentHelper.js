/**
 * Document Module Helper
 *
 * Utility functions for document operations from other modules.
 * Simplifies document integration across the platform.
 * Part of Clean Architecture - Integration Layer
 */

const { getDocumentModuleContainer } = require('./container');
const Document = require('../domain/entities/Document');

class DocumentHelper {
  static getContainer() {
    return getDocumentModuleContainer();
  }

  /**
   * Upload a document for a specific entity (farm, survey, certificate, etc.)
   */
  static async uploadDocument(fileData, metadata, uploadedBy, uploadedByType = 'farmer') {
    const container = this.getContainer();
    const uploadUseCase = container.getUploadDocumentUseCase();

    return await uploadUseCase.execute({
      ...fileData,
      name: metadata.name,
      description: metadata.description,
      type: metadata.type,
      uploadedBy,
      uploadedByType,
      relatedEntity: metadata.relatedEntity,
      tags: metadata.tags,
      expiresAt: metadata.expiresAt,
      issuedDate: metadata.issuedDate,
      accessLevel: metadata.accessLevel || Document.ACCESS_LEVEL.INTERNAL,
    });
  }

  /**
   * Get all documents for a specific entity (farm, survey, certificate, etc.)
   */
  static async getDocumentsByEntity(entityType, entityId, userId, userRole) {
    const container = this.getContainer();
    const getByEntityUseCase = container.getGetDocumentsByRelatedEntityUseCase();

    return await getByEntityUseCase.execute(entityType, entityId, userId, userRole);
  }

  /**
   * Get a specific document by ID
   */
  static async getDocument(documentId, userId, userRole) {
    const container = this.getContainer();
    const getUseCase = container.getGetDocumentUseCase();

    return await getUseCase.execute(documentId, userId, userRole);
  }

  /**
   * Download a document by ID
   */
  static async downloadDocument(documentId, userId, userRole) {
    const container = this.getContainer();
    const downloadUseCase = container.getDownloadDocumentUseCase();

    return await downloadUseCase.execute(documentId, userId, userRole);
  }

  /**
   * Delete (archive) a document
   */
  static async deleteDocument(documentId, userId, userRole, hardDelete = false) {
    const container = this.getContainer();
    const deleteUseCase = container.getDeleteDocumentUseCase();

    return await deleteUseCase.execute(documentId, userId, userRole, hardDelete);
  }

  /**
   * Approve a document (DTAM only)
   */
  static async approveDocument(documentId, reviewerId, reviewNotes = '') {
    const container = this.getContainer();
    const approveUseCase = container.getApproveDocumentUseCase();

    return await approveUseCase.execute(documentId, reviewerId, reviewNotes);
  }

  /**
   * Reject a document (DTAM only)
   */
  static async rejectDocument(documentId, reviewerId, rejectionReason) {
    const container = this.getContainer();
    const rejectUseCase = container.getRejectDocumentUseCase();

    return await rejectUseCase.execute(documentId, reviewerId, rejectionReason);
  }

  /**
   * List documents with filters
   */
  static async listDocuments(filters, userId, userRole, page = 1, limit = 20) {
    const container = this.getContainer();
    const listUseCase = container.getListDocumentsUseCase();

    return await listUseCase.execute(filters, userId, userRole, page, limit);
  }

  /**
   * Get pending documents for review (DTAM only)
   */
  static async getPendingDocuments(page = 1, limit = 20) {
    const container = this.getContainer();
    const pendingUseCase = container.getGetPendingDocumentsUseCase();

    return await pendingUseCase.execute(page, limit);
  }

  /**
   * Get document statistics (DTAM only)
   */
  static async getDocumentStatistics(filters = {}) {
    const container = this.getContainer();
    const statsUseCase = container.getGetDocumentStatisticsUseCase();

    return await statsUseCase.execute(filters);
  }

  /**
   * Update document metadata
   */
  static async updateDocumentMetadata(documentId, updates, userId, userRole) {
    const container = this.getContainer();
    const updateUseCase = container.getUpdateDocumentMetadataUseCase();

    return await updateUseCase.execute(documentId, updates, userId, userRole);
  }

  /**
   * Check if user has access to document
   */
  static async canAccessDocument(documentId, userId, userRole) {
    try {
      const document = await this.getDocument(documentId, userId, userRole);
      return !!document;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count documents for an entity
   */
  static async countDocumentsByEntity(entityType, entityId) {
    const container = this.getContainer();
    const repository = container.getDocumentRepository();

    return await repository.count({
      'relatedEntity.type': entityType,
      'relatedEntity.id': entityId,
    });
  }

  /**
   * Get approved documents for an entity
   */
  static async getApprovedDocumentsByEntity(entityType, entityId, userId, userRole) {
    const container = this.getContainer();
    const listUseCase = container.getListDocumentsUseCase();

    return await listUseCase.execute(
      {
        status: Document.STATUS.APPROVED,
        'relatedEntity.type': entityType,
        'relatedEntity.id': entityId,
      },
      userId,
      userRole,
    );
  }

  /**
   * Attach document to an entity (create reference)
   */
  static async attachDocumentToEntity(documentId, entityType, entityId, userId, userRole) {
    return await this.updateDocumentMetadata(
      documentId,
      {
        relatedEntity: {
          type: entityType,
          id: entityId,
        },
      },
      userId,
      userRole,
    );
  }

  /**
   * Detach document from entity (remove reference)
   */
  static async detachDocumentFromEntity(documentId, userId, userRole) {
    return await this.updateDocumentMetadata(
      documentId,
      {
        relatedEntity: null,
      },
      userId,
      userRole,
    );
  }

  /**
   * Get document types available
   */
  static getDocumentTypes() {
    return Document.TYPE;
  }

  /**
   * Get document statuses available
   */
  static getDocumentStatuses() {
    return Document.STATUS;
  }

  /**
   * Get document categories available
   */
  static getDocumentCategories() {
    return Document.CATEGORY;
  }

  /**
   * Get document access levels available
   */
  static getDocumentAccessLevels() {
    return Document.ACCESS_LEVEL;
  }
}

module.exports = DocumentHelper;
