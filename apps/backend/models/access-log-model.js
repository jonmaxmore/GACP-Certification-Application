/**
 * Access Log Model - Tracks who viewed/edited sensitive data
 * Security Requirement: Privacy & Traceability
 */

const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema(
    {
        // Who performed the action
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        actorEmail: {
            type: String,
            required: true,
        },
        actorRole: {
            type: String,
            required: true,
        },

        // What resource was accessed
        resourceType: {
            type: String,
            required: true,
            enum: ['USER', 'APPLICATION', 'ESTABLISHMENT', 'DOCUMENT', 'PAYMENT'],
            index: true,
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        // What action was performed
        action: {
            type: String,
            required: true,
            enum: ['VIEW', 'VIEW_SENSITIVE', 'EDIT', 'DELETE', 'EXPORT', 'APPROVE', 'REJECT'],
        },

        // Sensitive fields accessed (for VIEW_SENSITIVE)
        fieldsAccessed: [{
            type: String,
        }],

        // Request context
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },

        // Additional metadata
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
accessLogSchema.index({ createdAt: -1 });
accessLogSchema.index({ actorId: 1, createdAt: -1 });
accessLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

// Prevent modification of access logs (immutable for audit purposes)
accessLogSchema.pre('findOneAndUpdate', function () {
    throw new Error('Access logs cannot be modified');
});

accessLogSchema.pre('updateOne', function () {
    throw new Error('Access logs cannot be modified');
});

accessLogSchema.pre('updateMany', function () {
    throw new Error('Access logs cannot be modified');
});

// Static method to log access
accessLogSchema.statics.logAccess = async function (data) {
    return await this.create(data);
};

// Static method to get access history for a resource
accessLogSchema.statics.getResourceHistory = async function (resourceType, resourceId, limit = 50) {
    return await this.find({ resourceType, resourceId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('actorId', 'firstName lastName email');
};

// Static method to get user's access history
accessLogSchema.statics.getActorHistory = async function (actorId, limit = 100) {
    return await this.find({ actorId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

let AccessLog;
try {
    AccessLog = mongoose.model('AccessLog');
} catch {
    AccessLog = mongoose.model('AccessLog', accessLogSchema);
}

module.exports = AccessLog;
