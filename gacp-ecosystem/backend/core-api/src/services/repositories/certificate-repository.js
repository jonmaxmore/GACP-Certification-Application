/**
 * Certificate Repository Stub
 * Provides database operations for certificates
 * TODO: Implement full repository pattern
 */

const mongoose = require('mongoose');

// Simple Certificate Model (inline if CertificateModel doesn't exist)
let CertificateModel;
try {
    CertificateModel = require('../../database/models/certificate-model');
} catch {
    // Create inline model if not found
    const certificateSchema = new mongoose.Schema({
        certificateNumber: { type: String, required: true, unique: true },
        applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
        farmerId: String,
        farmName: String,
        farmerName: String,
        location: Object,
        farmSize: Number,
        cropTypes: [String],
        farmingSystem: String,
        certificationStandards: [String],
        issueDate: Date,
        expiryDate: Date,
        validityPeriod: Number,
        status: { type: String, default: 'active' },
        verificationCode: String,
        digitalSignature: String,
        qrCode: String,
        pdfFilename: String,
        pdfSize: Number,
        pdfUrl: String,
        issuedBy: String,
        renewalHistory: [Object],
        revokedBy: String,
        revocationDate: Date,
        revocationReason: String,
    }, { timestamps: true });

    CertificateModel = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
}

class CertificateRepository {
    constructor() {
        this.model = CertificateModel;
    }

    async create(data) {
        const cert = new this.model(data);
        return await cert.save();
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async findByCertificateNumber(certNumber) {
        return await this.model.findOne({ certificateNumber: certNumber });
    }

    async save(certificate) {
        return await certificate.save();
    }

    async findAll(filter = {}) {
        return await this.model.find(filter);
    }
}

module.exports = CertificateRepository;
