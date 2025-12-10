/**
 * Plant Master Model - Dynamic Configuration for Plant Types
 * Allows Admin to add/modify plant configurations without code changes
 */

const mongoose = require('mongoose');

const plantMasterSchema = new mongoose.Schema(
    {
        // Plant identifier (e.g., 'CAN', 'TUR', 'GIN')
        plantId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // Display names
        nameEN: {
            type: String,
            required: true,
            trim: true,
        },
        nameTH: {
            type: String,
            required: true,
            trim: true,
        },

        // Plant group classification
        group: {
            type: String,
            required: true,
            enum: ['HIGH_CONTROL', 'GENERAL'],
        },

        // Whether this plant requires strict licensing (FDA, etc.)
        requiresStrictLicense: {
            type: Boolean,
            default: false,
        },

        // Available units for this plant
        units: [{
            type: String,
        }],

        // Plant parts available for this plant type
        plantParts: [{
            type: String,
        }],

        // Security requirements specific to this plant
        securityRequirements: [{
            label: String,
            required: Boolean,
            description: String,
        }],

        // Production-specific inputs for this plant
        productionInputs: [{
            fieldName: String,
            fieldType: { type: String, enum: ['text', 'number', 'select', 'checkbox'] },
            label: String,
            required: Boolean,
            options: [String], // For select fields
        }],

        // Icon or image URL
        iconUrl: {
            type: String,
        },

        // Sort order for display
        sortOrder: {
            type: Number,
            default: 0,
        },

        // Whether this plant is active/visible
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
plantMasterSchema.index({ plantId: 1 }, { unique: true });
plantMasterSchema.index({ group: 1, isActive: 1 });
plantMasterSchema.index({ sortOrder: 1 });

// Static method to get all active plants
plantMasterSchema.statics.getActivePlants = async function () {
    return await this.find({ isActive: true }).sort({ sortOrder: 1 });
};

// Static method to get plant by ID
plantMasterSchema.statics.getPlantById = async function (plantId) {
    return await this.findOne({ plantId: plantId.toUpperCase(), isActive: true });
};

// Static method to get plants by group
plantMasterSchema.statics.getPlantsByGroup = async function (group) {
    return await this.find({ group, isActive: true }).sort({ sortOrder: 1 });
};

let PlantMaster;
try {
    PlantMaster = mongoose.model('PlantMaster');
} catch {
    PlantMaster = mongoose.model('PlantMaster', plantMasterSchema);
}

module.exports = PlantMaster;
