const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-approve-document');

/**
 * Approve Document Use Case
 *
 * Handles document approval by DTAM staff.
 * Part of Clean Architecture - Application Layer
 */

class ApproveDocumentUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(documentId, reviewerId, notes = '') {
    try {
      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      // Approve the document
      document.approve(reviewerId, notes);

      // Save updated document
      const updatedDocument = await this.documentRepository.save(document);

      return updatedDocument;
    } catch (error) {
      logger.error('Error approving document:', error);
      throw error;
    }
  }
}

module.exports = ApproveDocumentUseCase;
