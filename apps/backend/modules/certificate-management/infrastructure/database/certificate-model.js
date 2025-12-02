/**
 * MongoDB Certificate Repository (Infrastructure Layer)
 * Implements ICertificateRepository interface
 */

const ICertificateRepository = require('../../domain/interfaces/ICertificateRepository');
const Certificate = require('../../domain/entities/Certificate');
const mongoose = require('mongoose');

// MongoDB Schema
const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: { type: String, required: true, unique: true, index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    farmId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    certificateType: { type: String, required: true, enum: ['GACP', 'GAP', 'ORGANIC'] },
    standardType: { type: String, required: true },
    issueDate: { type: Date, required: true, index: true },
    expiryDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    qrCode: { type: String },
    pdfUrl: { type: String },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    verificationCount: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
certificateSchema.index({ userId: 1, status: 1 });
certificateSchema.index({ farmId: 1, status: 1 });
certificateSchema.index({ expiryDate: 1, status: 1 });

const CertificateModel = mongoose.model('Certificate', certificateSchema);

class MongoDBCertificateRepository extends ICertificateRepository {
  /**
   * Convert MongoDB document to Domain Entity
   */
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    return new Certificate({
      id: doc._id.toString(),
      certificateNumber: doc.certificateNumber,
      applicationId: doc.applicationId.toString(),
      userId: doc.userId.toString(),
      farmId: doc.farmId.toString(),
      certificateType: doc.certificateType,
      standardType: doc.standardType,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      status: doc.status,
      qrCode: doc.qrCode,
      pdfUrl: doc.pdfUrl,
      issuedBy: doc.issuedBy.toString(),
      verificationCount: doc.verificationCount,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert Domain Entity to MongoDB document
   */
  toMongoDB(certificate) {
    return {
      certificateNumber: certificate.certificateNumber,
      applicationId: certificate.applicationId,
      userId: certificate.userId,
      farmId: certificate.farmId,
      certificateType: certificate.certificateType,
      standardType: certificate.standardType,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate,
      status: certificate.status,
      qrCode: certificate.qrCode,
      pdfUrl: certificate.pdfUrl,
      issuedBy: certificate.issuedBy,
      verificationCount: certificate.verificationCount,
      metadata: certificate.metadata,
    };
  }

  async findById(id) {
    const doc = await CertificateModel.findById(id);
    return this.toDomain(doc);
  }

  async findByCertificateNumber(certificateNumber) {
    const doc = await CertificateModel.findOne({ certificateNumber });
    return this.toDomain(doc);
  }

  async findByUserId(userId) {
    const docs = await CertificateModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findByFarmId(farmId) {
    const docs = await CertificateModel.find({ farmId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async save(certificate) {
    const data = this.toMongoDB(certificate);

    let doc;
    if (certificate.id) {
      // Update existing
      doc = await CertificateModel.findByIdAndUpdate(certificate.id, data, {
        new: true,
        runValidators: true,
      });
    } else {
      // Create new
      doc = await CertificateModel.create(data);
    }

    return this.toDomain(doc);
  }

  async delete(id) {
    const result = await CertificateModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findWithFilters(filters) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.certificateType) {
      query.certificateType = filters.certificateType;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.farmId) {
      query.farmId = filters.farmId;
    }

    if (filters.fromDate) {
      query.issueDate = { $gte: new Date(filters.fromDate) };
    }

    if (filters.toDate) {
      query.issueDate = { ...query.issueDate, $lte: new Date(filters.toDate) };
    }

    const docs = await CertificateModel.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100);

    return docs.map(doc => this.toDomain(doc));
  }

  async countByStatus(status) {
    return await CertificateModel.countDocuments({ status });
  }

  async findExpiringSoon(days = 90) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const docs = await CertificateModel.find({
      status: 'ACTIVE',
      expiryDate: {
        $gte: now,
        $lte: futureDate,
      },
    }).sort({ expiryDate: 1 });

    return docs.map(doc => this.toDomain(doc));
  }
}

module.exports = MongoDBCertificateRepository;
