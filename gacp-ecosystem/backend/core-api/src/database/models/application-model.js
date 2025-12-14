const mongoose = require('mongoose');
const { Schema } = mongoose;
const { SERVICE_TYPES, APPLICATION_STATUS } = require('../constants/service-type-enum');

/**
 * GACP V2 Application Schema
 * Implements "2-Phase Payment / 3-Strike Penalty" Workflow
 * Updated: Support for 4 service types (New, Renewal, Replacement, Amendment)
 */
const ApplicationSchema = new Schema({
    applicationNumber: { type: String, required: true, unique: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Service Type - 4 เธเธฃเธฐเน€เธ เธ—เธเธฃเธดเธเธฒเธฃ GACP
    serviceType: {
        type: String,
        enum: Object.values(SERVICE_TYPES),
        default: SERVICE_TYPES.NEW_APPLICATION,
        required: true
    },

    // Batch Submission - เธชเธณเธซเธฃเธฑเธ auto-split multi-area applications
    batchId: { type: String, index: true },      // ID เธเธญเธ batch เธ—เธตเนเธเธฃเธญเธเธเธฃเนเธญเธกเธเธฑเธ
    areaTypeIndex: { type: Number, default: 0 }, // เธฅเธณเธ”เธฑเธเนเธ batch
    totalAreaTypes: { type: Number, default: 1 }, // เธเธณเธเธงเธ area types เธ—เธฑเนเธเธซเธกเธ”เนเธ batch

    // Single Area Type - เนเธ•เนเธฅเธฐ application = 1 area type = 1 certificate
    areaType: {
        type: String,
        enum: ['OUTDOOR', 'INDOOR', 'GREENHOUSE'],
        required: true
    },

    // License document is included in attachments (slot: 'license_bt11', 'license_bt13', 'license_bt16')
    // Reviewed together with other documents during Phase 1 (5,000เธฟ per review)
    // licenseId is optional reference for linking purposes
    licenseId: { type: Schema.Types.ObjectId, ref: 'License', default: null },

    // For Amendment/Replacement - reference to original certificate
    originalCertificateId: {
        type: Schema.Types.ObjectId,
        ref: 'Certificate',
        default: null
    },

    // Status Enum - Updated for team review workflow
    status: {
        type: String,
        enum: Object.values(APPLICATION_STATUS),
        default: APPLICATION_STATUS.DRAFT
    },

    // Team Quote - for services requiring team review (replacement, amendment)
    teamQuote: {
        quoteId: { type: Schema.Types.ObjectId, ref: 'Quote' },
        receivedAt: Date,
        acceptedAt: Date,
        amount: Number
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

        // 1. Request Info (Legacy - use serviceType instead)
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
    },

    // Concurrency Control (Apple QA Requirement)
    idempotencyKey: {
        type: String,
        sparse: true,
        unique: true, // Prevents double submission
    },
    lastModifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
    optimisticConcurrency: true, // Mongoose built-in version conflict detection
});

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
