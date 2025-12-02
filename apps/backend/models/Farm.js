const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

const PlotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  size: {
    value: Number,
    unit: {
      type: String,
      enum: ['rai', 'acre', 'hectare', 'sqm'],
      default: 'rai',
    },
  },
  location: LocationSchema,
  boundary: {
    type: [[Number]], // Array of [longitude, latitude] points forming polygon
    default: [],
  },
  soilType: String,
  crops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
    },
  ],
  status: {
    type: String,
    enum: ['active', 'fallow', 'preparing', 'harvested'],
    default: 'active',
  },
});

const CertificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  issuingBody: String,
  certificateNumber: String,
  issueDate: Date,
  expiryDate: Date,
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'pending'],
    default: 'active',
  },
  documents: [
    {
      title: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const FarmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    contactDetails: {
      phone: String,
      email: String,
      address: {
        line1: String,
        line2: String,
        subdistrict: String,
        district: String,
        province: String,
        postalCode: String,
        country: {
          type: String,
          default: 'Thailand',
        },
      },
    },
    location: LocationSchema,
    region: {
      type: String,
      enum: ['north', 'northeast', 'central', 'east', 'west', 'south'],
      required: true,
    },
    totalArea: {
      value: Number,
      unit: {
        type: String,
        enum: ['rai', 'acre', 'hectare', 'sqm'],
        default: 'rai',
      },
    },
    plots: [PlotSchema],
    farmingType: {
      type: String,
      enum: ['conventional', 'organic', 'gapHybrid', 'hydroponic', 'mixed'],
      default: 'conventional',
    },
    certifications: [CertificationSchema],
    waterSources: [
      {
        type: String,
        enum: ['river', 'reservoir', 'groundwater', 'rainfall', 'irrigation', 'other'],
      },
    ],
    founded: Date,
    images: [
      {
        url: String,
        caption: String,
        isPrimary: Boolean,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active',
    },

    // === Membership & Feature Access Control ===
    subscription: {
      tier: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free',
      },
      startDate: Date,
      expiryDate: Date,
      autoRenew: {
        type: Boolean,
        default: false,
      },
      paymentStatus: {
        type: String,
        enum: ['active', 'pending', 'overdue', 'cancelled'],
        default: 'active',
      },
    },

    // === GACP Compliance Master Data ===

    // Equipment List (For Calibration & Maintenance)
    equipment: [{
      name: String,
      type: String,
      serialNumber: String,
      purchaseDate: Date,
      lastCalibrationDate: Date,
      nextCalibrationDate: Date,
      status: { type: String, enum: ['active', 'maintenance', 'retired'] }
    }],

    // Personnel (For Hygiene & Training)
    personnel: [{
      name: String,
      role: String,
      idCard: String,
      healthCheckDate: Date,
      trainingRecords: [{
        courseName: String,
        date: Date,
        certificateUrl: String
      }]
    }],

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Create geo-spatial index for location
FarmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', FarmSchema);
