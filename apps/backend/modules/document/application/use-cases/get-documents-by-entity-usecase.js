const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-get-documents-by-entity');

/**
 * Get Documents By Related Entity Use Case
 *
 * Retrieves all documents related to a specific entity (farm, survey, etc.).
 * Part of Clean Architecture - Application Layer
 */

class GetDocumentsByRelatedEntityUseCase {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  async execute(entityType, entityId, userId, userRole, options = {}) {
    try {
      const documents = await this.documentRepository.findByRelatedEntity(
        entityType,
        entityId,
        options,
      );

      // Filter by access permission
      const accessibleDocuments = documents.filter(doc => doc.canAccess(userId, userRole));

      return accessibleDocuments;
    } catch (error) {
      logger.error('Error getting documents by related entity:', error);
      throw error;
    }
  }
}

module.exports = GetDocumentsByRelatedEntityUseCase;
