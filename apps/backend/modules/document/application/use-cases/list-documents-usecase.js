const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-list-documents');

/**
 * List Documents Use Case
 *
 * Lists documents with filtering and pagination.
 * Part of Clean Architecture - Application Layer
 */

class ListDocumentsUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(filters = {}, options = {}, userId = null, userRole = null) {
    try {
      // If user is specified, filter by uploader or accessible documents
      if (userId && userRole !== 'DTAM_STAFF' && userRole !== 'admin') {
        filters.uploadedBy = userId;
      }

      const result = await this.documentRepository.findWithFilters(filters, options);

      // Filter out documents user cannot access
      if (userId && userRole) {
        result.documents = result.documents.filter(doc => doc.canAccess(userId, userRole));
        result.total = result.documents.length;
      }

      return result;
    } catch (error) {
      logger.error('Error listing documents:', error);
      throw error;
    }
  }
}

module.exports = ListDocumentsUseCase;
