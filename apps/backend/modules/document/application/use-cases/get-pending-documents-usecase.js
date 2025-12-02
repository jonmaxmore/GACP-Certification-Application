const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-get-pending-documents');

/**
 * Get Pending Documents Use Case
 *
 * Retrieves documents pending review (for DTAM staff).
 * Part of Clean Architecture - Application Layer
 */

class GetPendingDocumentsUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(options = {}) {
    try {
      const result = await this.documentRepository.findPendingReview(options);
      return result;
    } catch (error) {
      logger.error('Error getting pending documents:', error);
      throw error;
    }
  }
}

module.exports = GetPendingDocumentsUseCase;
