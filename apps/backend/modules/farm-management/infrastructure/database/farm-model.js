/**
 * MongoDBFarmRepository (Infrastructure Layer)
 *
 * MongoDB implementation of IFarmRepository
 * - Uses Mongoose for data persistence
 * - Converts between domain entities and MongoDB documents
 */

const mongoose = require('mongoose');
const Farm = require('../../domain/entities/Farm');
const IFarmRepository = require('../../domain/interfaces/IFarmRepository');
const { createLogger } = require('../../../../shared/logger');
const logger = createLogger('farm-management-farm');

// Mongoose Schema
const farmSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true, index: true },
    farmName: { type: String, required: true },
    farmType: {
      type: String,
      required: true,
      enum: Object.values(Farm.FARM_TYPE),
    },
    // Location
    address: { type: String, required: true },
    subDistrict: { type: String, required: true },
    district: { type: String, required: true, index: true },
    province: { type: String, required: true, index: true },
    postalCode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    // Area
    totalArea: { type: Number, required: true },
    cultivationArea: { type: Number, required: true },
    areaUnit: { type: String, default: 'rai' },
    // Cultivation Details
    cultivationMethod: { type: String, required: true },
    irrigationType: {
      type: String,
      enum: [...Object.values(Farm.IRRIGATION_TYPE), null],
    },
    soilType: { type: String },
    waterSource: { type: String },
    // Verification
    status: {
      type: String,
      required: true,
      enum: Object.values(Farm.STATUS),
      default: Farm.STATUS.DRAFT,
      index: true,
    },
    verificationNotes: { type: String },
    verifiedBy: { type: String, index: true },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
    // Metadata
    submittedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'farms',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

// Compound indexes
farmSchema.index({ ownerId: 1, farmName: 1 });
farmSchema.index({ status: 1, submittedAt: -1 });
farmSchema.index({ province: 1, district: 1 });
farmSchema.index({ location: '2dsphere' }); // For geospatial queries

// Geospatial index for coordinates
farmSchema.index({ latitude: 1, longitude: 1 });

class MongoDBFarmRepository extends IFarmRepository {
  constructor(database) {
    super();
    this.FarmModel = database.model('Farm', farmSchema);
  }

  /**
   * Convert MongoDB document to Domain entity
   */
  toDomain(doc) {
    if (!doc) {
      return null;
    }

    return new Farm({
      id: doc._id.toString(),
      ownerId: doc.ownerId,
      farmName: doc.farmName,
      farmType: doc.farmType,
      address: doc.address,
      subDistrict: doc.subDistrict,
      district: doc.district,
      province: doc.province,
      postalCode: doc.postalCode,
      latitude: doc.latitude,
      longitude: doc.longitude,
      totalArea: doc.totalArea,
      cultivationArea: doc.cultivationArea,
      areaUnit: doc.areaUnit,
      cultivationMethod: doc.cultivationMethod,
      irrigationType: doc.irrigationType,
      soilType: doc.soilType,
      waterSource: doc.waterSource,
      status: doc.status,
      verificationNotes: doc.verificationNotes,
      verifiedBy: doc.verifiedBy,
      verifiedAt: doc.verifiedAt,
      rejectionReason: doc.rejectionReason,
      submittedAt: doc.submittedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /**
   * Convert Domain entity to MongoDB document
   */
  toMongoDB(farm) {
    const doc = {
      ownerId: farm.ownerId,
      farmName: farm.farmName,
      farmType: farm.farmType,
      address: farm.address,
      subDistrict: farm.subDistrict,
      district: farm.district,
      province: farm.province,
      postalCode: farm.postalCode,
      latitude: farm.latitude,
      longitude: farm.longitude,
      totalArea: farm.totalArea,
      cultivationArea: farm.cultivationArea,
      areaUnit: farm.areaUnit,
      cultivationMethod: farm.cultivationMethod,
      irrigationType: farm.irrigationType,
      soilType: farm.soilType,
      waterSource: farm.waterSource,
      status: farm.status,
      verificationNotes: farm.verificationNotes,
      verifiedBy: farm.verifiedBy,
      verifiedAt: farm.verifiedAt,
      rejectionReason: farm.rejectionReason,
      submittedAt: farm.submittedAt,
      updatedAt: farm.updatedAt,
    };

    if (farm.id) {
      doc._id = farm.id;
    }
    if (farm.createdAt) {
      doc.createdAt = farm.createdAt;
    }

    return doc;
  }

  async findById(id) {
    try {
      const doc = await this.FarmModel.findById(id);
      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error finding farm by ID:', error);
      throw error;
    }
  }

  async findByOwnerId(ownerId, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

      const docs = await this.FarmModel.find({ ownerId }).limit(limit).skip(skip).sort(sort);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding farms by owner:', error);
      throw error;
    }
  }

  async findByStatus(status, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

      const docs = await this.FarmModel.find({ status }).limit(limit).skip(skip).sort(sort);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding farms by status:', error);
      throw error;
    }
  }

  async findWithFilters(filters = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.ownerId) {
        query.ownerId = filters.ownerId;
      }
      if (filters.province) {
        query.province = filters.province;
      }
      if (filters.district) {
        query.district = filters.district;
      }
      if (filters.farmType) {
        query.farmType = filters.farmType;
      }
      if (filters.verifiedBy) {
        query.verifiedBy = filters.verifiedBy;
      }

      // Date range filters
      if (filters.createdFrom || filters.createdTo) {
        query.createdAt = {};
        if (filters.createdFrom) {
          query.createdAt.$gte = new Date(filters.createdFrom);
        }
        if (filters.createdTo) {
          query.createdAt.$lte = new Date(filters.createdTo);
        }
      }

      // Search by farm name
      if (filters.search) {
        query.farmName = { $regex: filters.search, $options: 'i' };
      }

      const [docs, total] = await Promise.all([
        this.FarmModel.find(query).limit(limit).skip(skip).sort(sort),
        this.FarmModel.countDocuments(query),
      ]);

      return {
        farms: docs.map(doc => this.toDomain(doc)),
        total,
      };
    } catch (error) {
      logger.error('Error finding farms with filters:', error);
      throw error;
    }
  }

  async findByLocation(province, district = null, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

      const query = { province };
      if (district) {
        query.district = district;
      }

      const docs = await this.FarmModel.find(query).limit(limit).skip(skip).sort(sort);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding farms by location:', error);
      throw error;
    }
  }

  async findNearLocation(latitude, longitude, radiusKm, options = {}) {
    try {
      const { limit = 10, skip = 0 } = options;

      // Convert radius to radians (Earth radius = 6378.1 km)
      const radiusInRadians = radiusKm / 6378.1;

      const docs = await this.FarmModel.find({
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null },
        $where: function () {
          const lat1 = this.latitude;
          const lon1 = this.longitude;
          const lat2 = latitude;
          const lon2 = longitude;

          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;

          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = c;

          return distance <= radiusInRadians;
        },
      })
        .limit(limit)
        .skip(skip);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding farms near location:', error);
      throw error;
    }
  }

  async save(farm) {
    try {
      const data = this.toMongoDB(farm);

      let doc;
      if (farm.id) {
        doc = await this.FarmModel.findByIdAndUpdate(farm.id, data, { new: true, upsert: true });
      } else {
        doc = await this.FarmModel.create(data);
      }

      return this.toDomain(doc);
    } catch (error) {
      logger.error('Error saving farm:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.FarmModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error('Error deleting farm:', error);
      throw error;
    }
  }

  async countByStatus(status) {
    try {
      return await this.FarmModel.countDocuments({ status });
    } catch (error) {
      logger.error('Error counting farms by status:', error);
      throw error;
    }
  }

  async countByOwner(ownerId) {
    try {
      return await this.FarmModel.countDocuments({ ownerId });
    } catch (error) {
      logger.error('Error counting farms by owner:', error);
      throw error;
    }
  }

  async getStatisticsByProvince() {
    try {
      const result = await this.FarmModel.aggregate([
        { $group: { _id: '$province', count: { $sum: 1 } } },
        { $project: { province: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]);

      return result;
    } catch (error) {
      logger.error('Error getting statistics by province:', error);
      throw error;
    }
  }

  async getStatisticsByStatus() {
    try {
      const result = await this.FarmModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]);

      return result;
    } catch (error) {
      logger.error('Error getting statistics by status:', error);
      throw error;
    }
  }

  async farmNameExists(ownerId, farmName, excludeId = null) {
    try {
      const query = { ownerId, farmName };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const count = await this.FarmModel.countDocuments(query);
      return count > 0;
    } catch (error) {
      logger.error('Error checking farm name existence:', error);
      throw error;
    }
  }

  async findRecentlySubmitted(limit = 10) {
    try {
      const docs = await this.FarmModel.find({ status: Farm.STATUS.PENDING_REVIEW })
        .sort({ submittedAt: 1 }) // Oldest first (FIFO)
        .limit(limit);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding recently submitted farms:', error);
      throw error;
    }
  }

  async findVerifiedByStaff(staffId, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { verifiedAt: -1 } } = options;

      const docs = await this.FarmModel.find({ verifiedBy: staffId })
        .limit(limit)
        .skip(skip)
        .sort(sort);

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      logger.error('Error finding farms verified by staff:', error);
      throw error;
    }
  }
}

module.exports = MongoDBFarmRepository;
