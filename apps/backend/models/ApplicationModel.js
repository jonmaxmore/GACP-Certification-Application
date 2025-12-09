const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * GACP V2 Application Schema
 * Implements "2-Phase Payment / 3-Strike Penalty" Workflow
 */
const ApplicationSchema = new Schema({
    applicationNumber: { type: String, required: true, unique: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Status Enum as per Detailed Brief
    status: {
        type: String,
        enum: [
            'DRAFT',                // Initial State
            'REVIEW_PENDING',       // User checking "Pre-Submission" (Web View)
            'PAYMENT_1_PENDING',    // User confirmed docs, waiting for 5,000 THB
            'SUBMITTED',            // Paid & Submitted, waiting for Officer Review
            'REVISION_REQ',         // Rejected (Count < 3) - Free Fix
            'PAYMENT_1_RETRY',      // Rejected (Count >= 3) - Penalty Triggered
            'PAYMENT_2_PENDING',    // Docs Approved, waiting for 25,000 THB
            'AUDIT_PENDING',        // Paid Phase 2, waiting for Scheduler
            'AUDIT_SCHEDULED',      // Auditor Assigned
            'CERTIFIED',            // Passed Audit
            'REJECTED'              // Failed Audit or Cancelled
        ],
        default: 'DRAFT'
    },

    // Form Selection Logic
    forms: {
        form09: { type: Boolean, default: true }, // Always Required
        form10: { type: Boolean, default: true }, // Always Required
        form11: { type: Boolean, default: false } // Optional Self-Assessment
    },

    // Data payload (GACP Application Details)
    data: {
        farmId: { type: String, ref: 'Establishment' },

        // 1. Request Info
        requestType: {
            type: String,
            enum: ['NEW', 'RENEW', 'SUBSTITUTE'],
            default: 'NEW'
        },
        certificationType: [{
            type: String,
            enum: ['CULTIVATION', 'PROCESSING']
        }],
        objective: [{
            type: String,
            enum: ['RESEARCH', 'COMMERCIAL_DOMESTIC', 'COMMERCIAL_EXPORT', 'OTHER']
        }],

        // 2. Applicant Info (Polymorphic)
        applicantType: {
            type: String,
            enum: ['COMMUNITY', 'INDIVIDUAL', 'JURISTIC'],
            required: true
        },
        applicantInfo: {
            // Common
            name: String, // President Name / Owner Name / Auth Person
            idCard: String,
            address: String,
            mobile: String,
            email: String,
            lineId: String,

            // Enterprise / Juristic Specific
            entityName: String, // Community Name / Company Name
            registrationCode: String, // SorWorChor.01 / Juristic ID
            registrationCode2: String, // ThorWorChor.3
        },

        // 3. Site Info (Merged from Establishment or Overridden)
        siteInfo: {
            areaType: [{ type: String, enum: ['OUTDOOR', 'INDOOR', 'GREENHOUSE', 'OTHER'] }],
            address: String,
            titleDeedNo: String,
            coordinates: String, // GPS
        },

        // Legacy / Flexible
        formData: { type: Map, of: Schema.Types.Mixed }
    },

    // Attachments (22 Slots)
    attachments: [{
        slotId: String, // e.g. "land_deed", "sop_1"
        fileUrl: String,
        fileName: String,
        uploadedAt: { type: Date, default: Date.now }
    }],

    // Logic: 3-Strike Penalty
    rejectCount: {
        type: Number,
        default: 0
    },

    // Logic: 2-Phase Payment (Ksher Integration)
    payment: {
        phase1: {
            amount: { type: Number, default: 5000 },
            status: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
            paidAt: Date,
            transactionId: { type: Schema.Types.ObjectId, ref: 'PaymentTransaction' } // Link to Ksher
        },
        phase2: {
            amount: { type: Number, default: 25000 },
            status: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
            paidAt: Date,
            transactionId: { type: Schema.Types.ObjectId, ref: 'PaymentTransaction' }
        }
    },

    // Audit Info (Stage 5)
    audit: {
        auditorId: { type: Schema.Types.ObjectId, ref: 'User' },
        scheduledDate: Date,
        result: { type: String, enum: ['PASS', 'MINOR', 'MAJOR'], default: null },
        notes: String
    }
}, { timestamps: true });

// Auto-generate App Number
ApplicationSchema.pre('validate', async function (next) {
    if (!this.applicationNumber) {
        const date = new Date();
        const year = date.getFullYear() + 543; // Thai Year
        const run = Math.floor(Math.random() * 9999);
        this.applicationNumber = `REQ-${year}-${run.toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
