const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-get-document');

/**
 * Get Document Use Case
 *
 * Retrieves document with access control check.
 * Part of Clean Architecture - Application Layer
 */

class GetDocumentUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(documentId, userId, userRole) {
    try {
      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      // Check access permission
      if (!document.canAccess(userId, userRole)) {
        throw new Error('Access denied: You do not have permission to view this document');
      }

      // Increment view count
      document.incrementViewCount();
      await this.documentRepository.save(document);

      return document;
    } catch (error) {
      logger.error('Error getting document:', error);
      throw error;
    }
  }
}

module.exports = GetDocumentUseCase;
