/**
 * Upload Document Use Case
 *
 * Handles document upload with file storage and validation.
 * Part of Clean Architecture - Application Layer
 */

const Document = require('../../domain/entities/Document');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-upload-document');

class UploadDocumentUseCase {
  constructor(documentRepository, fileStorageService) {
    this.documentRepository = documentRepository;
    this.fileStorageService = fileStorageService;
  }

  async execute(uploadData, fileData) {
    try {
      // Validate file
      const validation = await this.fileStorageService.validateFile(
        fileData.buffer,
        fileData.mimetype,
        {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ],
        },
      );

      if (!validation.valid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Upload file to storage
      const uploadResult = await this.fileStorageService.uploadFile(
        {
          buffer: fileData.buffer,
          originalName: fileData.originalname,
          mimeType: fileData.mimetype,
        },
        {
          folder: `documents/${uploadData.category || 'other'}`,
          accessLevel: uploadData.accessLevel || Document.ACCESS_LEVEL.INTERNAL,
        },
      );

      // Create document entity
      const document = Document.create({
        name: uploadData.name || fileData.originalname,
        description: uploadData.description,
        type: uploadData.type,
        category: uploadData.category,
        fileName: uploadResult.fileName,
        originalFileName: fileData.originalname,
        filePath: uploadResult.filePath,
        fileSize: fileData.size,
        mimeType: fileData.mimetype,
        fileExtension: Document._getFileExtension(fileData.originalname),
        fileUrl: uploadResult.fileUrl,
        checksum: uploadResult.checksum,
        uploadedBy: uploadData.uploadedBy,
        uploadedByType: uploadData.uploadedByType || 'FARMER',
        relatedEntity: uploadData.relatedEntity,
        accessLevel: uploadData.accessLevel,
        allowedRoles: uploadData.allowedRoles || [],
        tags: uploadData.tags || [],
        metadata: uploadData.metadata || {},
        expiresAt: uploadData.expiresAt,
        issuedDate: uploadData.issuedDate,
      });

      // Generate thumbnail for images
      if (document.isImage()) {
        try {
          const thumbnail = await this.fileStorageService.generateThumbnail(uploadResult.filePath, {
            width: 300,
            height: 300,
          });
          document.thumbnailUrl = thumbnail.thumbnailUrl;
        } catch (error) {
          logger.error('Failed to generate thumbnail:', error);
          // Continue without thumbnail
        }
      }

      // Save to repository
      const savedDocument = await this.documentRepository.save(document);

      return savedDocument;
    } catch (error) {
      logger.error('Error uploading document:', error);
      throw error;
    }
  }
}

module.exports = UploadDocumentUseCase;
