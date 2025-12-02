const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-download-document');

/**
 * Download Document Use Case
 *
 * Handles document download with access control.
 * Part of Clean Architecture - Application Layer
 */

class DownloadDocumentUseCase {
  constructor(documentRepository, fileStorageService) {
    this.documentRepository = documentRepository;
    this.fileStorageService = fileStorageService;
  }

  async execute(documentId, userId, userRole) {
    try {
      const document = await this.documentRepository.findById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      // Check access permission
      if (!document.canAccess(userId, userRole)) {
        throw new Error('Access denied: You do not have permission to download this document');
      }

      // Get file from storage
      const fileBuffer = await this.fileStorageService.downloadFile(document.filePath);

      // Increment download count
      document.incrementDownloadCount();
      await this.documentRepository.save(document);

      return {
        buffer: fileBuffer,
        fileName: document.originalFileName,
        mimeType: document.mimeType,
      };
    } catch (error) {
      logger.error('Error downloading document:', error);
      throw error;
    }
  }
}

module.exports = DownloadDocumentUseCase;
