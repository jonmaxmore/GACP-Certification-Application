/**
 * Certificate Service
 *
 * Service for managing GACP certificates
 * Handles generation, verification, renewal, and PDF creation
 */

const logger = require('../../../shared/logger/logger');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

class CertificateService {
  constructor(db) {
    this.db = db;
    this.certificatesCollection = null;
    this.applicationsCollection = null;
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      this.certificatesCollection = this.db.collection('certificates');
      this.applicationsCollection = this.db.collection('applications');

      // Create indexes
      await this.certificatesCollection.createIndex({ certificateNumber: 1 }, { unique: true });
      await this.certificatesCollection.createIndex({ applicationId: 1 });
      await this.certificatesCollection.createIndex({ farmId: 1 });
      await this.certificatesCollection.createIndex({ userId: 1 });
      await this.certificatesCollection.createIndex({ status: 1 });
      await this.certificatesCollection.createIndex({ expiryDate: 1 });
      await this.certificatesCollection.createIndex({ verificationCode: 1 });

      this.initialized = true;
      logger.info('Certificate Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Certificate Service:', error);
      throw error;
    }
  }

  /**
   * Generate unique certificate number
   */
  async generateCertificateNumber() {
    const year = new Date().getFullYear();
    const prefix = `GACP-${year}`;

    // Find the last certificate number for this year
    const lastCert = await this.certificatesCollection
      .find({ certificateNumber: { $regex: `^${prefix}` } })
      .sort({ certificateNumber: -1 })
      .limit(1)
      .toArray();

    let sequence = 1;
    if (lastCert.length > 0) {
      const lastNumber = lastCert[0].certificateNumber;
      const lastSequence = parseInt(lastNumber.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Generate verification code
   */
  generateVerificationCode() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Generate QR code data
   */
  generateQRData(certificateNumber, verificationCode) {
    const baseUrl = process.env.APP_URL || 'https://gacp-certify.go.th';
    return `${baseUrl}/verify/${certificateNumber}?code=${verificationCode}`;
  }

  /**
   * Create certificate
   */
  async createCertificate(data) {
    try {
      const {
        applicationId,
        farmId,
        userId,
        farmName,
        farmerName,
        location,
        cropType,
        farmSize,
        standardId,
        standardName,
        score,
        issuedBy,
        validityYears = 3,
      } = data;

      // Generate certificate details
      const certificateNumber = await this.generateCertificateNumber();
      const verificationCode = this.generateVerificationCode();
      const qrData = this.generateQRData(certificateNumber, verificationCode);

      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setFullYear(expiryDate.getFullYear() + validityYears);

      const certificate = {
        certificateNumber,
        verificationCode,
        qrData,

        // References
        applicationId: new ObjectId(applicationId),
        farmId,
        userId,

        // Farm information
        farmName,
        farmerName,
        location: {
          province: location?.province || '',
          district: location?.district || '',
          subDistrict: location?.subDistrict || '',
          address: location?.address || '',
        },
        cropType,
        farmSize,

        // Standard information
        standardId,
        standardName,
        score,

        // Certificate details
        status: 'active',
        issuedDate: now,
        expiryDate,
        validityYears,
        issuedBy,

        // Metadata
        pdfGenerated: false,
        pdfUrl: null,
        downloadCount: 0,
        verificationCount: 0,

        // Audit trail
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.certificatesCollection.insertOne(certificate);

      // Update application with certificate ID
      await this.applicationsCollection.updateOne(
        { _id: new ObjectId(applicationId) },
        {
          $set: {
            certificateId: result.insertedId,
            certificateNumber,
            certificateIssued: true,
            certificateIssuedAt: now,
          },
        },
      );

      return {
        certificateId: result.insertedId.toString(),
        certificateNumber,
        verificationCode,
        qrData,
        ...certificate,
      };
    } catch (error) {
      logger.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(certificateId) {
    try {
      const certificate = await this.certificatesCollection.findOne({
        _id: new ObjectId(certificateId),
      });

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      return {
        certificateId: certificate._id.toString(),
        ...certificate,
      };
    } catch (error) {
      logger.error('Error getting certificate:', error);
      throw error;
    }
  }

  /**
   * Get certificate by number
   */
  async getCertificateByNumber(certificateNumber) {
    try {
      const certificate = await this.certificatesCollection.findOne({
        certificateNumber,
      });

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      return {
        certificateId: certificate._id.toString(),
        ...certificate,
      };
    } catch (error) {
      logger.error('Error getting certificate:', error);
      throw error;
    }
  }

  /**
   * Get certificates by user
   */
  async getCertificatesByUser(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.standardId) {
        query.standardId = filters.standardId;
      }

      const certificates = await this.certificatesCollection
        .find(query)
        .sort({ issuedDate: -1 })
        .toArray();

      return certificates.map(cert => ({
        certificateId: cert._id.toString(),
        certificateNumber: cert.certificateNumber,
        farmName: cert.farmName,
        standardName: cert.standardName,
        status: cert.status,
        issuedDate: cert.issuedDate,
        expiryDate: cert.expiryDate,
        score: cert.score,
      }));
    } catch (error) {
      logger.error('Error getting certificates by user:', error);
      throw error;
    }
  }

  /**
   * Get all certificates with pagination
   */
  async getAllCertificates(filters = {}, page = 1, limit = 20) {
    try {
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.standardId) {
        query.standardId = filters.standardId;
      }

      if (filters.search) {
        query.$or = [
          { certificateNumber: { $regex: filters.search, $options: 'i' } },
          { farmName: { $regex: filters.search, $options: 'i' } },
          { farmerName: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;

      const [certificates, total] = await Promise.all([
        this.certificatesCollection
          .find(query)
          .sort({ issuedDate: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.certificatesCollection.countDocuments(query),
      ]);

      return {
        certificates: certificates.map(cert => ({
          certificateId: cert._id.toString(),
          ...cert,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error getting all certificates:', error);
      throw error;
    }
  }

  /**
   * Verify certificate
   */
  async verifyCertificate(certificateNumber, verificationCode = null) {
    try {
      const certificate = await this.certificatesCollection.findOne({
        certificateNumber,
      });

      if (!certificate) {
        return {
          valid: false,
          message: 'Certificate not found',
          certificateNumber,
        };
      }

      // Increment verification count
      await this.certificatesCollection.updateOne(
        { _id: certificate._id },
        {
          $inc: { verificationCount: 1 },
          $set: { lastVerifiedAt: new Date() },
        },
      );

      // Check if verification code is provided and matches
      if (verificationCode && certificate.verificationCode !== verificationCode) {
        return {
          valid: false,
          message: 'Invalid verification code',
          certificateNumber,
        };
      }

      // Check if certificate is expired
      const now = new Date();
      if (certificate.expiryDate < now) {
        return {
          valid: false,
          message: 'Certificate has expired',
          certificateNumber,
          expiryDate: certificate.expiryDate,
          certificate: {
            certificateNumber: certificate.certificateNumber,
            farmName: certificate.farmName,
            farmerName: certificate.farmerName,
            standardName: certificate.standardName,
            status: 'expired',
          },
        };
      }

      // Check if certificate is revoked
      if (certificate.status === 'revoked') {
        return {
          valid: false,
          message: 'Certificate has been revoked',
          certificateNumber,
          revokedDate: certificate.revokedDate,
          revokedReason: certificate.revokedReason,
        };
      }

      // Certificate is valid
      return {
        valid: true,
        message: 'Certificate is valid',
        certificate: {
          certificateNumber: certificate.certificateNumber,
          farmName: certificate.farmName,
          farmerName: certificate.farmerName,
          location: certificate.location,
          cropType: certificate.cropType,
          farmSize: certificate.farmSize,
          standardName: certificate.standardName,
          score: certificate.score,
          issuedDate: certificate.issuedDate,
          expiryDate: certificate.expiryDate,
          status: certificate.status,
          qrData: certificate.qrData,
        },
      };
    } catch (error) {
      logger.error('Error verifying certificate:', error);
      throw error;
    }
  }

  /**
   * Renew certificate
   */
  async renewCertificate(certificateId, renewedBy, validityYears = 3) {
    try {
      const oldCertificate = await this.getCertificateById(certificateId);

      // Check if certificate can be renewed
      const now = new Date();
      const daysUntilExpiry = Math.ceil((oldCertificate.expiryDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 90) {
        throw new Error('Certificate can only be renewed within 90 days of expiry');
      }

      // Create new certificate
      const newCertificate = await this.createCertificate({
        applicationId: oldCertificate.applicationId.toString(),
        farmId: oldCertificate.farmId,
        userId: oldCertificate.userId,
        farmName: oldCertificate.farmName,
        farmerName: oldCertificate.farmerName,
        location: oldCertificate.location,
        cropType: oldCertificate.cropType,
        farmSize: oldCertificate.farmSize,
        standardId: oldCertificate.standardId,
        standardName: oldCertificate.standardName,
        score: oldCertificate.score,
        issuedBy: renewedBy,
        validityYears,
      });

      // Update old certificate status
      await this.certificatesCollection.updateOne(
        { _id: new ObjectId(certificateId) },
        {
          $set: {
            status: 'renewed',
            renewedCertificateId: newCertificate.certificateId,
            renewedAt: now,
            updatedAt: now,
          },
        },
      );

      return newCertificate;
    } catch (error) {
      logger.error('Error renewing certificate:', error);
      throw error;
    }
  }

  /**
   * Revoke certificate
   */
  async revokeCertificate(certificateId, reason, revokedBy) {
    try {
      const now = new Date();

      const result = await this.certificatesCollection.updateOne(
        { _id: new ObjectId(certificateId) },
        {
          $set: {
            status: 'revoked',
            revokedDate: now,
            revokedReason: reason,
            revokedBy,
            updatedAt: now,
          },
        },
      );

      if (result.matchedCount === 0) {
        throw new Error('Certificate not found');
      }

      return {
        success: true,
        message: 'Certificate revoked successfully',
      };
    } catch (error) {
      logger.error('Error revoking certificate:', error);
      throw error;
    }
  }

  /**
   * Update certificate PDF info
   */
  async updatePDFInfo(certificateId, pdfUrl) {
    try {
      await this.certificatesCollection.updateOne(
        { _id: new ObjectId(certificateId) },
        {
          $set: {
            pdfGenerated: true,
            pdfUrl,
            updatedAt: new Date(),
          },
        },
      );

      return {
        success: true,
        pdfUrl,
      };
    } catch (error) {
      logger.error('Error updating PDF info:', error);
      throw error;
    }
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(certificateId) {
    try {
      await this.certificatesCollection.updateOne(
        { _id: new ObjectId(certificateId) },
        {
          $inc: { downloadCount: 1 },
          $set: { lastDownloadedAt: new Date() },
        },
      );
    } catch (error) {
      logger.error('Error incrementing download count:', error);
    }
  }

  /**
   * Get certificate statistics
   */
  async getCertificateStats() {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalCertificates,
        activeCertificates,
        expiredCertificates,
        revokedCertificates,
        thisMonthCertificates,
        expiringCertificates,
      ] = await Promise.all([
        this.certificatesCollection.countDocuments({}),
        this.certificatesCollection.countDocuments({ status: 'active' }),
        this.certificatesCollection.countDocuments({
          expiryDate: { $lt: now },
          status: { $ne: 'renewed' },
        }),
        this.certificatesCollection.countDocuments({ status: 'revoked' }),
        this.certificatesCollection.countDocuments({
          issuedDate: { $gte: monthStart },
        }),
        this.certificatesCollection.countDocuments({
          status: 'active',
          expiryDate: {
            $gte: now,
            $lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      // Get certificates by standard
      const byStandard = await this.certificatesCollection
        .aggregate([
          {
            $group: {
              _id: '$standardName',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      return {
        totalCertificates,
        activeCertificates,
        expiredCertificates,
        revokedCertificates,
        thisMonthCertificates,
        expiringCertificates,
        byStandard: byStandard.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('Error getting certificate stats:', error);
      throw error;
    }
  }

  /**
   * Get expiring certificates
   */
  async getExpiringCertificates(days = 90) {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const certificates = await this.certificatesCollection
        .find({
          status: 'active',
          expiryDate: {
            $gte: now,
            $lte: futureDate,
          },
        })
        .sort({ expiryDate: 1 })
        .toArray();

      return certificates.map(cert => ({
        certificateId: cert._id.toString(),
        certificateNumber: cert.certificateNumber,
        farmName: cert.farmName,
        farmerName: cert.farmerName,
        expiryDate: cert.expiryDate,
        daysUntilExpiry: Math.ceil((cert.expiryDate - now) / (1000 * 60 * 60 * 24)),
      }));
    } catch (error) {
      logger.error('Error getting expiring certificates:', error);
      throw error;
    }
  }
}

module.exports = CertificateService;
