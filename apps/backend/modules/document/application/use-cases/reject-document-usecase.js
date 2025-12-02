const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-reject-document');

/**
 * Reject Document Use Case
 *
 * Handles document rejection by DTAM staff.
 * Part of Clean Architecture - Application Layer
 */

class RejectDocumentUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(documentId, reviewerId, reason) {
    try {
      if (!reason) {
        throw new Error('Rejection reason is required');
      }

      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      // Reject the document
      document.reject(reviewerId, reason);

      // Save updated document
      const updatedDocument = await this.documentRepository.save(document);

      return updatedDocument;
    } catch (error) {
      logger.error('Error rejecting document:', error);
      throw error;
    }
  }
}

module.exports = RejectDocumentUseCase;
