/**
 * Application Snapshot Model
 * Stores immutable JSON snapshot of application at submission time
 * Legal Requirement: Forms change, but submitted applications must remain unchanged
 */

const mongoose = require('mongoose');

const applicationSnapshotSchema = new mongoose.Schema(
    {
        // Reference to original application
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
            index: true,
        },

        // Snapshot version (increments each time application is re-submitted after revision)
        version: {
            type: Number,
            required: true,
            default: 1,
        },

        // Full application data at time of submission (immutable JSON)
        data: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        // Form schema version used (for future migrations)
        schemaVersion: {
            type: String,
            required: true,
            default: '1.0.0',
        },

        // Submission metadata
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        submittedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },

        // Plant type at submission time
        plantType: {
            type: String,
            required: true,
        },

        // Request type at submission time
        requestType: {
            type: String,
            enum: ['NEW', 'RENEW', 'AMEND'],
            required: true,
        },

        // Checksum for integrity verification
        checksum: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
applicationSnapshotSchema.index({ applicationId: 1, version: -1 });
applicationSnapshotSchema.index({ submittedBy: 1, submittedAt: -1 });

// Prevent modification of snapshots (immutable)
applicationSnapshotSchema.pre('findOneAndUpdate', function () {
    throw new Error('Application snapshots cannot be modified');
});

applicationSnapshotSchema.pre('updateOne', function () {
    throw new Error('Application snapshots cannot be modified');
});

applicationSnapshotSchema.pre('updateMany', function () {
    throw new Error('Application snapshots cannot be modified');
});

// Static method to create snapshot
applicationSnapshotSchema.statics.createSnapshot = async function (applicationId, data, userId, plantType, requestType, schemaVersion = '1.0.0') {
    // Calculate checksum for integrity
    const crypto = require('crypto');
    const checksum = crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex');

    // Find latest version for this application
    const latestSnapshot = await this.findOne({ applicationId }).sort({ version: -1 });
    const nextVersion = latestSnapshot ? latestSnapshot.version + 1 : 1;

    return await this.create({
        applicationId,
        version: nextVersion,
        data,
        schemaVersion,
        submittedBy: userId,
        submittedAt: new Date(),
        plantType,
        requestType,
        checksum,
    });
};

// Static method to get latest snapshot
applicationSnapshotSchema.statics.getLatestSnapshot = async function (applicationId) {
    return await this.findOne({ applicationId }).sort({ version: -1 });
};

// Static method to get all versions
applicationSnapshotSchema.statics.getAllVersions = async function (applicationId) {
    return await this.find({ applicationId }).sort({ version: -1 });
};

let ApplicationSnapshot;
try {
    ApplicationSnapshot = mongoose.model('ApplicationSnapshot');
} catch {
    ApplicationSnapshot = mongoose.model('ApplicationSnapshot', applicationSnapshotSchema);
}

module.exports = ApplicationSnapshot;
