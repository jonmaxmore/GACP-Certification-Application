/**
 * Document Requirement Model
 * Dynamic configuration for required documents per plant type
 */

const mongoose = require('mongoose');

const documentRequirementSchema = new mongoose.Schema(
    {
        // Reference to plant type
        plantId: {
            type: String,
            required: true,
            uppercase: true,
            index: true,
        },

        // Request types this requirement applies to
        requestTypes: [{
            type: String,
            enum: ['NEW', 'RENEW', 'AMEND'],
        }],

        // Document details
        documentName: {
            type: String,
            required: true,
            trim: true,
        },
        documentNameTH: {
            type: String,
            required: true,
            trim: true,
        },

        // Description/Instructions for the user
        description: {
            type: String,
        },
        descriptionTH: {
            type: String,
        },

        // Whether this document is required or optional
        isRequired: {
            type: Boolean,
            default: true,
        },

        // Allowed file types
        allowedFileTypes: [{
            type: String,
            default: ['pdf', 'jpg', 'png'],
        }],

        // Maximum file size in MB
        maxFileSizeMB: {
            type: Number,
            default: 10,
        },

        // Category for grouping
        category: {
            type: String,
            enum: ['IDENTITY', 'LICENSE', 'PROPERTY', 'FINANCIAL', 'COMPLIANCE', 'OTHER'],
            default: 'OTHER',
        },

        // Sort order within category
        sortOrder: {
            type: Number,
            default: 0,
        },

        // Is this requirement active?
        isActive: {
            type: Boolean,
            default: true,
        },

        // Help text or tips for users
        helpText: {
            type: String,
        },
        helpTextTH: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
documentRequirementSchema.index({ plantId: 1, isActive: 1 });
documentRequirementSchema.index({ category: 1, sortOrder: 1 });

// Static method to get requirements for a plant
documentRequirementSchema.statics.getRequirementsForPlant = async function (plantId, requestType = 'NEW') {
    return await this.find({
        plantId: plantId.toUpperCase(),
        requestTypes: { $in: [requestType] },
        isActive: true,
    }).sort({ category: 1, sortOrder: 1 });
};

// Static method to get all active requirements
documentRequirementSchema.statics.getAllActive = async function () {
    return await this.find({ isActive: true }).sort({ plantId: 1, category: 1, sortOrder: 1 });
};

let DocumentRequirement;
try {
    DocumentRequirement = mongoose.model('DocumentRequirement');
} catch {
    DocumentRequirement = mongoose.model('DocumentRequirement', documentRequirementSchema);
}

module.exports = DocumentRequirement;
