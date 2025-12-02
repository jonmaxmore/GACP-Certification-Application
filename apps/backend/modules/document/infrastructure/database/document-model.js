/**
 * MongoDB Document Repository Implementation
 *
 * Implements IDocumentRepository interface using MongoDB/Mongoose.
 * Part of Clean Architecture - Infrastructure Layer
 */

const mongoose = require('mongoose');
const Document = require('../../domain/entities/Document');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('document-document');

// Mongoose Schema
const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: {
      type: String,
      enum: Object.values(Document.TYPE),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(Document.CATEGORY),
      required: true,
    },

    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    fileExtension: String,
    fileUrl: String,

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    uploadedByType: { type: String, enum: ['FARMER', 'DTAM_STAFF'], required: true },
    relatedEntity: {
      type: String,
      id: String,
    },

    status: {
      type: String,
      enum: Object.values(Document.STATUS),
      default: Document.STATUS.PENDING,
    },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedAt: Date,
    reviewNotes: String,
    rejectionReason: String,

    accessLevel: {
      type: String,
      enum: Object.values(Document.ACCESS_LEVEL),
      default: Document.ACCESS_LEVEL.INTERNAL,
    },
    allowedRoles: [String],

    version: { type: Number, default: 1 },
    previousVersionId: mongoose.Schema.Types.ObjectId,
    isLatestVersion: { type: Boolean, default: true },

    expiresAt: Date,
    issuedDate: Date,

    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
    checksum: String,

    thumbnailUrl: String,
    previewUrl: String,

    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    lastAccessedAt: Date,

    uploadedAt: { type: Date, default: Date.now },
    archivedAt: Date,
  },
  {
    timestamps: true,
    collection: 'documents',
  },
);

// Indexes
documentSchema.index({ uploadedBy: 1, status: 1, uploadedAt: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ type: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });
documentSchema.index({ expiresAt: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ name: 'text', description: 'text' });

class MongoDBDocumentRepository {
  constructor(database) {
    this.DocumentModel = database.model('Document', documentSchema);
  }

  // Convert MongoDB document to Domain Entity
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    const data = doc.toObject ? doc.toObject() : doc;
    return new Document({
      id: data._id.toString(),
      ...data,
      uploadedBy: data.uploadedBy?.toString(),
      reviewedBy: data.reviewedBy?.toString(),
      previousVersionId: data.previousVersionId?.toString(),
    });
  }

  // Convert Domain Entity to MongoDB document
  toMongoDB(document) {
    const data = { ...document };
    if (document.id) {
      data._id = mongoose.Types.ObjectId(document.id);
      delete data.id;
    }
    if (document.uploadedBy) {
      data.uploadedBy = mongoose.Types.ObjectId(document.uploadedBy);
    }
    if (document.reviewedBy) {
      data.reviewedBy = mongoose.Types.ObjectId(document.reviewedBy);
    }
    if (document.previousVersionId) {
      data.previousVersionId = mongoose.Types.ObjectId(document.previousVersionId);
    }
    return data;
  }

  async save(document) {
    try {
      const data = this.toMongoDB(document);

      if (data._id) {
        const updated = await this.DocumentModel.findByIdAndUpdate(data._id, data, {
          new: true,
          runValidators: true,
        });
        return this.toDomain(updated);
      } else {
        const created = await this.DocumentModel.create(data);
        return this.toDomain(created);
      }
    } catch (error) {
      logger.error('Error saving document:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const doc = await this.DocumentModel.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding document by ID:', error);
      return null;
    }
  }

  async findByUploader(uploaderId, filters = {}, options = {}) {
    try {
      const query = { uploadedBy: mongoose.Types.ObjectId(uploaderId) };

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.category) {
        query.category = filters.category;
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { uploadedAt: -1 };

      const [docs, total] = await Promise.all([
        this.DocumentModel.find(query).sort(sort).skip(skip).limit(limit),
        this.DocumentModel.countDocuments(query),
      ]);

      return {
        documents: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding documents by uploader:', error);
      throw error;
    }
  }

  async findByRelatedEntity(entityType, entityId, options = {}) {
    try {
      const query = {
        'relatedEntity.type': entityType,
        'relatedEntity.id': entityId,
        status: { $ne: Document.STATUS.ARCHIVED },
      };

      if (options.type) {
        query.type = options.type;
      }
      if (options.status) {
        query.status = options.status;
      }

      const docs = await this.DocumentModel.find(query).sort({ uploadedAt: -1 });

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding documents by related entity:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { uploadedAt: -1 };

      const [docs, total] = await Promise.all([
        this.DocumentModel.find({ status }).sort(sort).skip(skip).limit(limit),
        this.DocumentModel.countDocuments({ status }),
      ]);

      return {
        documents: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding documents by status:', error);
      throw error;
    }
  }

  async findByType(type, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { uploadedAt: -1 };

      const [docs, total] = await Promise.all([
        this.DocumentModel.find({ type }).sort(sort).skip(skip).limit(limit),
        this.DocumentModel.countDocuments({ type }),
      ]);

      return {
        documents: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding documents by type:', error);
      throw error;
    }
  }

  async findByCategory(category, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { uploadedAt: -1 };

      const [docs, total] = await Promise.all([
        this.DocumentModel.find({ category }).sort(sort).skip(skip).limit(limit),
        this.DocumentModel.countDocuments({ category }),
      ]);

      return {
        documents: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding documents by category:', error);
      throw error;
    }
  }

  async findWithFilters(filters = {}, options = {}) {
    try {
      const query = {};

      if (filters.uploadedBy) {
        query.uploadedBy = mongoose.Types.ObjectId(filters.uploadedBy);
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      if (filters.startDate || filters.endDate) {
        query.uploadedAt = {};
        if (filters.startDate) {
          query.uploadedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.uploadedAt.$lte = new Date(filters.endDate);
        }
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { uploadedAt: -1 };

      const [docs, total] = await Promise.all([
        this.DocumentModel.find(query).sort(sort).skip(skip).limit(limit),
        this.DocumentModel.countDocuments(query),
      ]);

      return {
        documents: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding documents with filters:', error);
      throw error;
    }
  }

  async findPendingReview(options = {}) {
    try {
      const query = {
        status: { $in: [Document.STATUS.PENDING, Document.STATUS.UNDER_REVIEW] },
      };

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;
      const sort = options.sort || { uploadedAt: 1 }; // Oldest first

      const [docs, total] = await Promise.all([
        this.DocumentModel.find(query).sort(sort).skip(skip).limit(limit),
        this.DocumentModel.countDocuments(query),
      ]);

      return {
        documents: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error finding pending documents:', error);
      throw error;
    }
  }

  async findExpired(options = {}) {
    try {
      const query = {
        expiresAt: { $lte: new Date() },
        status: { $ne: Document.STATUS.EXPIRED },
      };

      const docs = await this.DocumentModel.find(query);
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding expired documents:', error);
      throw error;
    }
  }

  async findVersionHistory(documentId) {
    try {
      // Find original document
      const original = await this.DocumentModel.findById(documentId);
      if (!original) {
        return [];
      }

      // Find all versions (including original)
      const versions = await this.DocumentModel.find({
        $or: [
          { _id: mongoose.Types.ObjectId(documentId) },
          { previousVersionId: mongoose.Types.ObjectId(documentId) },
        ],
      }).sort({ version: -1 });

      return versions.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding version history:', error);
      throw error;
    }
  }

  async findLatestVersion(originalDocumentId) {
    try {
      const doc = await this.DocumentModel.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId(originalDocumentId), isLatestVersion: true },
          { previousVersionId: mongoose.Types.ObjectId(originalDocumentId), isLatestVersion: true },
        ],
      });

      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding latest version:', error);
      return null;
    }
  }

  async count(criteria = {}) {
    try {
      return await this.DocumentModel.countDocuments(criteria);
    } catch (error) {
      logger.error('Error counting documents:', error);
      return 0;
    }
  }

  async countByUploader(uploaderId, filters = {}) {
    try {
      const query = { uploadedBy: mongoose.Types.ObjectId(uploaderId) };

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.category) {
        query.category = filters.category;
      }

      return await this.DocumentModel.countDocuments(query);
    } catch (error) {
      logger.error('Error counting documents by uploader:', error);
      return 0;
    }
  }

  async markExpired() {
    try {
      const result = await this.DocumentModel.updateMany(
        {
          expiresAt: { $lte: new Date() },
          status: { $ne: Document.STATUS.EXPIRED },
        },
        {
          $set: { status: Document.STATUS.EXPIRED },
        },
      );
      return result.modifiedCount;
    } catch (error) {
      logger.error('Error marking expired documents:', error);
      return 0;
    }
  }

  async getStatistics(filters = {}) {
    try {
      const matchStage = {};

      if (filters.uploadedBy) {
        matchStage.uploadedBy = mongoose.Types.ObjectId(filters.uploadedBy);
      }
      if (filters.startDate || filters.endDate) {
        matchStage.uploadedAt = {};
        if (filters.startDate) {
          matchStage.uploadedAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          matchStage.uploadedAt.$lte = new Date(filters.endDate);
        }
      }

      const [totalDocuments, byStatus, byType, byCategory, totalSize] = await Promise.all([
        this.DocumentModel.countDocuments(matchStage),
        this.DocumentModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        this.DocumentModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        this.DocumentModel.aggregate([
          { $match: matchStage },
          { $group: { _id: '$category', count: { $sum: 1 } } },
        ]),
        this.DocumentModel.aggregate([
          { $match: matchStage },
          { $group: { _id: null, total: { $sum: '$fileSize' } } },
        ]),
      ]);

      return {
        totalDocuments,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalSizeBytes: totalSize.length > 0 ? totalSize[0].total : 0,
      };
    } catch (error) {
      logger.error('Error getting document statistics:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.DocumentModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      logger.error('Error deleting document:', error);
      return false;
    }
  }

  async searchDocuments(searchText, options = {}) {
    try {
      const query = {
        $text: { $search: searchText },
      };

      if (options.status) {
        query.status = options.status;
      }
      if (options.type) {
        query.type = options.type;
      }
      if (options.category) {
        query.category = options.category;
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [docs, total] = await Promise.all([
        this.DocumentModel.find(query)
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit),
        this.DocumentModel.countDocuments(query),
      ]);

      return {
        documents: docs.map(doc => this.toDomain(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error searching documents:', error);
      throw error;
    }
  }
}

module.exports = MongoDBDocumentRepository;
