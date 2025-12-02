const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-delete-document');

/**
 * Delete Document Use Case
 *
 * Handles document deletion (archive or hard delete).
 * Part of Clean Architecture - Application Layer
 */

class DeleteDocumentUseCase {
  constructor(documentRepository, fileStorageService) {
    this.documentRepository = documentRepository;
    this.fileStorageService = fileStorageService;
  }

  async execute(documentId, userId, userRole, hardDelete = false) {
    try {
      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      // Check if user is owner or admin
      if (document.uploadedBy !== userId && userRole !== 'admin' && userRole !== 'DTAM_STAFF') {
        throw new Error('Access denied: You can only delete your own documents');
      }

      if (hardDelete && userRole === 'admin') {
        // Hard delete - remove from storage and database
        await this.fileStorageService.deleteFile(document.filePath);

        // Delete thumbnail if exists
        if (document.thumbnailUrl) {
          try {
            const thumbnailPath = document.thumbnailUrl.split('/').pop();
            await this.fileStorageService.deleteFile(thumbnailPath);
          } catch (error) {
            logger.error('Failed to delete thumbnail:', error);
          }
        }

        await this.documentRepository.delete(documentId);
        return { deleted: true, documentId };
      } else {
        // Soft delete - archive
        document.archive();
        const archivedDocument = await this.documentRepository.save(document);
        return archivedDocument;
      }
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw error;
    }
  }
}

module.exports = DeleteDocumentUseCase;
