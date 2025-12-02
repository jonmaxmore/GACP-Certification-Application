const mongoose = require('mongoose');

const InspectionChecklistSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: [
            'qa', 'hygiene', 'document', 'equipment', 'site',
            'water', 'fertilizer', 'seeds', 'cultivation', 'harvest',
            'processing', 'facility', 'packaging', 'storage'
        ],
        required: true
    },
    items: [{
        questionId: String,
        requirement: String,
        compliant: Boolean,
        observation: String,
        photoEvidence: [String]
    }],
    score: Number,
    maxScore: Number
}, { _id: false });

const InspectionSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduledDate: Date,
    inspectionDate: Date,

    // Results
    checklist: [InspectionChecklistSchema],

    summary: String,
    result: {
        type: String,
        enum: ['pass', 'fail', 'conditional_pass'],
        default: 'pass'
    },

    conditions: [String], // If conditional pass

    signatureUrl: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inspection', InspectionSchema);
