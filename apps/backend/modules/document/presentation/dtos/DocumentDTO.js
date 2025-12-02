/**
 * Document Data Transfer Objects (DTOs)
 *
 * Format document data for API responses.
 * Part of Clean Architecture - Presentation Layer
 */

class DocumentDTO {
  static toResponse(document) {
    if (!document) {
      return null;
    }

    return {
      id: document.id,
      name: document.name,
      description: document.description,
      type: document.type,
      category: document.category,

      fileName: document.fileName,
      originalFileName: document.originalFileName,
      fileSize: document.fileSize,
      fileSizeFormatted: document.getFileSizeFormatted(),
      mimeType: document.mimeType,
      fileExtension: document.fileExtension,
      fileUrl: document.fileUrl,

      uploadedBy: document.uploadedBy,
      uploadedByType: document.uploadedByType,
      relatedEntity: document.relatedEntity,

      status: document.status,
      reviewedBy: document.reviewedBy,
      reviewedAt: document.reviewedAt,
      reviewNotes: document.reviewNotes,
      rejectionReason: document.rejectionReason,

      accessLevel: document.accessLevel,
      allowedRoles: document.allowedRoles,

      version: document.version,
      previousVersionId: document.previousVersionId,
      isLatestVersion: document.isLatestVersion,

      expiresAt: document.expiresAt,
      daysUntilExpiration: document.getDaysUntilExpiration(),
      issuedDate: document.issuedDate,

      tags: document.tags,
      metadata: document.metadata,

      thumbnailUrl: document.thumbnailUrl,
      previewUrl: document.previewUrl,

      downloadCount: document.downloadCount,
      viewCount: document.viewCount,
      lastAccessedAt: document.lastAccessedAt,

      uploadedAt: document.uploadedAt,
      updatedAt: document.updatedAt,
      archivedAt: document.archivedAt,

      // Computed fields
      isPending: document.isPending(),
      isUnderReview: document.isUnderReview(),
      isApproved: document.isApproved(),
      isRejected: document.isRejected(),
      isExpired: document.isExpired(),
      isArchived: document.isArchived(),
      isLatest: document.isLatest(),
      requiresReview: document.requiresReview(),
      isImage: document.isImage(),
      isPDF: document.isPDF(),
      isPreviewSupported: document.isPreviewSupported(),
    };
  }

  static toListResponse(documents) {
    return documents.map(document => this.toResponse(document));
  }

  static toPaginatedResponse(result) {
    return {
      documents: this.toListResponse(result.documents),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  static toSummaryResponse(document) {
    if (!document) {
      return null;
    }

    return {
      id: document.id,
      name: document.name,
      type: document.type,
      category: document.category,
      fileName: document.fileName,
      fileSize: document.fileSize,
      fileSizeFormatted: document.getFileSizeFormatted(),
      mimeType: document.mimeType,
      status: document.status,
      uploadedAt: document.uploadedAt,
      thumbnailUrl: document.thumbnailUrl,
      isImage: document.isImage(),
      isPDF: document.isPDF(),
    };
  }

  static toStatisticsResponse(statistics) {
    return {
      totalDocuments: statistics.totalDocuments,
      byStatus: statistics.byStatus,
      byType: statistics.byType,
      byCategory: statistics.byCategory,
      totalSizeBytes: statistics.totalSizeBytes,
      totalSizeMB: (statistics.totalSizeBytes / 1024 / 1024).toFixed(2),
      totalSizeGB: (statistics.totalSizeBytes / 1024 / 1024 / 1024).toFixed(2),

      // Approval rates
      pendingCount: statistics.byStatus?.PENDING || 0,
      approvedCount: statistics.byStatus?.APPROVED || 0,
      rejectedCount: statistics.byStatus?.REJECTED || 0,
      approvalRate:
        statistics.totalDocuments > 0
          ? (((statistics.byStatus?.APPROVED || 0) / statistics.totalDocuments) * 100).toFixed(2) +
            '%'
          : '0%',
      rejectionRate:
        statistics.totalDocuments > 0
          ? (((statistics.byStatus?.REJECTED || 0) / statistics.totalDocuments) * 100).toFixed(2) +
            '%'
          : '0%',
    };
  }
}

module.exports = DocumentDTO;
