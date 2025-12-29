const mongoose = require('mongoose');

const ProductTimelineSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    stage: {
        type: String,
        enum: ['Planting', 'Growing', 'Harvesting', 'Processing', 'Packaging', 'Distribution', 'Retail'],
        required: true
    },
    location: String,
    description: String,
    verifiedBy: { type: String, default: 'System' }, // Could be User ID or Role name
    images: [String]
});

const ProductBatchSchema = new mongoose.Schema({
    batchCode: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    variety: String,
    quantity: Number,
    unit: String,
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm' // Assuming there is a Farm model or stored in Application
        // If Farm model doesn't exist, we might store farm name string or link to Application
    },
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application' // Link to GACP certification application
    },
    currentStage: {
        type: String,
        default: 'Planting'
    },
    certificationStatus: {
        type: String,
        enum: ['PENDING', 'CERTIFIED', 'EXPIRED', 'REVOKED'],
        default: 'PENDING'
    },
    timeline: [ProductTimelineSchema],
    qrCodeUrl: String
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductBatch', ProductBatchSchema);

