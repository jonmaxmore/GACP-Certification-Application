/**
 * Certificate Model
 * Represents a digital GACP certificate issued to a farmer.
 */

const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    farmerId: {
      type: String, // Or ObjectId if referencing User model directly, but keeping flexible as per service usage
      required: true,
    },
    farmName: {
      type: String,
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    location: {
      address: String,
      subdistrict: String,
      district: String,
      province: String,
      postalCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    farmSize: {
      type: Number,
      required: true,
    },
    cropTypes: [String],
    farmingSystem: String,
    certificationStandards: [String],

    // Dates
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    validityPeriod: {
      type: Number, // in months
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked', 'suspended'],
      default: 'active',
    },

    // Verification
    verificationCode: {
      type: String,
      required: true,
    },
    digitalSignature: {
      type: String,
      required: true,
    },
    qrCode: String, // Data URL or path

    // Files
    pdfFilename: String,
    pdfSize: Number,
    pdfUrl: String, // Optional full URL if stored externally

    // History
    issuedBy: String, // Name or ID of approver
    revokedBy: String,
    revocationDate: Date,
    revocationReason: String,

    renewalHistory: [
      {
        renewedDate: Date,
        renewedBy: String,
        previousExpiryDate: Date,
        newExpiryDate: Date,
        renewalNotes: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'certificates',
  }
);

// Indexes
CertificateSchema.index({ certificateNumber: 1 }, { unique: true });
CertificateSchema.index({ applicationId: 1 });
CertificateSchema.index({ farmerId: 1 });
CertificateSchema.index({ status: 1 });
CertificateSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Certificate', CertificateSchema);
