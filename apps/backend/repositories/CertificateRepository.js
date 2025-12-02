/**
 * CertificateRepository
 * Data access layer for Certificate collection using Mongoose
 */

const logger = require('../shared/logger');
const Certificate = require('../models/Certificate');

class CertificateRepository {
  constructor() {
    this.model = Certificate;
  }

  /**
   * Create a new certificate
   * @param {Object} certificateData
   * @param {Object} session - Optional Mongoose session
   */
  async create(certificateData, session = null) {
    try {
      const certificate = new this.model(certificateData);
      if (session) {
        await certificate.save({ session });
      } else {
        await certificate.save();
      }
      return certificate;
    } catch (error) {
      logger.error('[CertificateRepository] create error:', error);
      throw error;
    }
  }

  /**
   * Find certificate by ID
   * @param {string} id
   */
  async findById(id) {
    try {
      return await this.model.findById(id).populate('applicationId');
    } catch (error) {
      logger.error('[CertificateRepository] findById error:', error);
      throw error;
    }
  }

  /**
   * Find certificate by Certificate Number
   * @param {string} certificateNumber
   */
  async findByCertificateNumber(certificateNumber) {
    try {
      return await this.model.findOne({ certificateNumber }).populate('applicationId');
    } catch (error) {
      logger.error('[CertificateRepository] findByCertificateNumber error:', error);
      throw error;
    }
  }

  /**
   * Find certificates by Farmer ID
   * @param {string} farmerId
   */
  async findByFarmerId(farmerId) {
    try {
      return await this.model.find({ farmerId }).sort({ issueDate: -1 });
    } catch (error) {
      logger.error('[CertificateRepository] findByFarmerId error:', error);
      throw error;
    }
  }

  /**
   * Find active certificate for an application
   * @param {string} applicationId
   */
  async findActiveByApplicationId(applicationId) {
    try {
      return await this.model.findOne({
        applicationId,
        status: 'active'
      }).sort({ issueDate: -1 });
    } catch (error) {
      logger.error('[CertificateRepository] findActiveByApplicationId error:', error);
      throw error;
    }
  }

  /**
   * Update certificate status
   * @param {string} id
   * @param {string} status
   * @param {Object} additionalData
   */
  async updateStatus(id, status, additionalData = {}) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        {
          $set: {
            status,
            ...additionalData
          }
        },
        { new: true }
      );
    } catch (error) {
      logger.error('[CertificateRepository] updateStatus error:', error);
      throw error;
    }
  }

  /**
   * Save certificate instance
   * @param {Object} certificate
   */
  async save(certificate) {
    try {
      return await certificate.save();
    } catch (error) {
      logger.error('[CertificateRepository] save error:', error);
      throw error;
    }
  }

  /**
   * Count documents
   * @param {Object} query
   */
  async count(query = {}) {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      logger.error('[CertificateRepository] count error:', error);
      throw error;
    }
  }
}

module.exports = CertificateRepository;
