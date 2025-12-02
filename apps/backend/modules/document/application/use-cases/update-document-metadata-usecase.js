const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-update-document-metadata');

/**
 * Update Document Metadata Use Case
 *
 * Updates document metadata and properties.
 * Part of Clean Architecture - Application Layer
 */

class UpdateDocumentMetadataUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(documentId, updates, userId, userRole) {
    try {
      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      // Check if user is owner or admin
      if (document.uploadedBy !== userId && userRole !== 'admin' && userRole !== 'DTAM_STAFF') {
        throw new Error('Access denied: You can only update your own documents');
      }

      // Update allowed fields
      if (updates.name) {
        document.name = updates.name;
      }
      if (updates.description !== undefined) {
        document.description = updates.description;
      }
      if (updates.tags) {
        document.tags = updates.tags;
      }
      if (updates.metadata) {
        document.updateMetadata(updates.metadata);
      }
      if (updates.expiresAt) {
        document.setExpiration(new Date(updates.expiresAt));
      }
      if (updates.issuedDate) {
        document.issuedDate = new Date(updates.issuedDate);
      }

      // Only admin/DTAM can update access level
      if (updates.accessLevel && (userRole === 'admin' || userRole === 'DTAM_STAFF')) {
        document.updateAccessLevel(updates.accessLevel, updates.allowedRoles || []);
      }

      document.updatedAt = new Date();

      const updatedDocument = await this.documentRepository.save(document);
      return updatedDocument;
    } catch (error) {
      logger.error('Error updating document metadata:', error);
      throw error;
    }
  }
}

module.exports = UpdateDocumentMetadataUseCase;
