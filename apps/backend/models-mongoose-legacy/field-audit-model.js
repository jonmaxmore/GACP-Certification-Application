/**
 * Field Audit Model
 * Records actual field inspection/audit for applications
 * Implements 3-Strikes Rule and Scoring System
 * Based on field_audit_system_design.md
 */

const mongoose = require('mongoose');

/**
 * Audit Response Schema
 * Records auditor's response for each checklist item
 */
const AuditResponseSchema = new mongoose.Schema({
    itemCode: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    // Response data
    response: {
        type: String,
        enum: ['PASS', 'FAIL', 'NA', 'PENDING'],
        default: 'PENDING',
    },
    score: {
        type: Number,
        min: 0,
        max: 5,
    },
    textResponse: {
        type: String,
    },
    // Evidence
    photos: [{
        url: String,
        caption: String,
        timestamp: Date,
        gps: {
            lat: Number,
            lng: Number,
            accuracy: Number,
        },
    }],
    gpsLocation: {
        lat: Number,
        lng: Number,
        accuracy: Number,
        timestamp: Date,
    },
    // Notes
    notes: {
        type: String,
    },
    finding: {
        type: String,
        // Description of issue found
    },
    recommendation: {
        type: String,
        // Recommended action
    },
    // CAR Reference if created
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CorrectiveActionRequest',
    },
    // Timestamps
    respondedAt: {
        type: Date,
    },
});

/**
 * Category Score Schema
 */
const CategoryScoreSchema = new mongoose.Schema({
    categoryCode: {
        type: String,
        required: true,
    },
    categoryName: {
        type: String,
    },
    totalItems: {
        type: Number,
        default: 0,
    },
    passedItems: {
        type: Number,
        default: 0,
    },
    failedItems: {
        type: Number,
        default: 0,
    },
    naItems: {
        type: Number,
        default: 0,
    },
    score: {
        type: Number,
        default: 0,
        // Percentage score for this category
    },
    isZeroTolerance: {
        type: Boolean,
        default: false,
    },
    meetsZeroToleranceThreshold: {
        type: Boolean,
        default: true,
        // Must be ≥ 80% for zero tolerance categories
    },
});

/**
 * Field Audit Schema
 */
const FieldAuditSchema = new mongoose.Schema(
    {
        // Reference to application
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
        },
        applicationNumber: {
            type: String,
            required: true,
        },
        // Audit info
        auditNumber: {
            type: String,
            required: true,
            unique: true,
            // Format: AUD-YYYY-NNNNN
        },
        auditType: {
            type: String,
            required: true,
            enum: ['INITIAL', 'RENEWAL', 'SURVEILLANCE', 'RE_AUDIT', 'SPECIAL'],
            default: 'INITIAL',
        },
        auditMode: {
            type: String,
            required: true,
            enum: ['ONLINE', 'ONSITE', 'HYBRID'],
            default: 'ONSITE',
        },
        // Template used
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AuditChecklistTemplate',
            required: true,
        },
        templateCode: {
            type: String,
        },
        // Farm/Establishment info
        establishmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Establishment',
        },
        farmName: {
            type: String,
        },
        farmLocation: {
            address: String,
            province: String,
            district: String,
            subdistrict: String,
            postalCode: String,
            gps: {
                lat: Number,
                lng: Number,
            },
        },
        // Farmer info
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        farmerName: {
            type: String,
        },
        // Auditor info
        auditorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        auditorName: {
            type: String,
        },
        auditorTeam: {
            type: String,
        },
        // Schedule
        scheduledDate: {
            type: Date,
            required: true,
        },
        scheduledTime: {
            type: String,
            // e.g., "09:00-12:00"
        },
        actualStartTime: {
            type: Date,
        },
        actualEndTime: {
            type: Date,
        },
        // Check-in
        checkInLocation: {
            lat: Number,
            lng: Number,
            accuracy: Number,
            timestamp: Date,
        },
        checkOutLocation: {
            lat: Number,
            lng: Number,
            accuracy: Number,
            timestamp: Date,
        },
        // Audit responses
        responses: [AuditResponseSchema],

        // Scoring
        categoryScores: [CategoryScoreSchema],
        overallScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        // Calculated fields
        totalItems: {
            type: Number,
            default: 0,
        },
        passedItems: {
            type: Number,
            default: 0,
        },
        failedItems: {
            type: Number,
            default: 0,
        },
        naItems: {
            type: Number,
            default: 0,
        },
        criticalFailures: {
            type: Number,
            default: 0,
        },

        // Result
        result: {
            type: String,
            enum: ['PENDING', 'PASS', 'MINOR', 'MAJOR', 'CRITICAL_FAIL'],
            default: 'PENDING',
            /*
             * PASS: ≥ 90% and no critical failures
             * MINOR: 70-89% (requires CAR)
             * MAJOR: < 70% (counts toward 3-strikes)
             * CRITICAL_FAIL: Critical item failed
             */
        },

        // 3-Strikes tracking
        attemptNumber: {
            type: Number,
            default: 1,
            min: 1,
            max: 3,
        },
        previousAuditId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FieldAudit',
        },

        // CAR (Corrective Action Request)
        carRequired: {
            type: Boolean,
            default: false,
        },
        carCount: {
            type: Number,
            default: 0,
        },
        carDeadline: {
            type: Date,
        },
        carStatus: {
            type: String,
            enum: ['NONE', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'OVERDUE'],
            default: 'NONE',
        },

        // Status
        status: {
            type: String,
            required: true,
            enum: [
                'SCHEDULED',       // นัดหมายแล้ว
                'CONFIRMED',       // ยืนยันแล้ว
                'IN_PROGRESS',     // กำลังตรวจ
                'COMPLETED',       // ตรวจเสร็จ
                'UNDER_REVIEW',    // รอตรวจสอบรายงาน
                'REPORT_APPROVED', // รายงานผ่าน
                'CAR_PENDING',     // รอ CAR
                'CAR_SUBMITTED',   // ส่ง CAR แล้ว
                'CAR_APPROVED',    // CAR ผ่าน
                'CAR_REJECTED',    // CAR ไม่ผ่าน
                'CANCELLED',       // ยกเลิก
            ],
            default: 'SCHEDULED',
        },

        // Signatures
        farmerSignature: {
            image: String,
            signedAt: Date,
            signedBy: String,
        },
        auditorSignature: {
            image: String,
            signedAt: Date,
            signedBy: String,
        },

        // Reports
        preliminaryReportUrl: {
            type: String,
        },
        preliminaryReportDate: {
            type: Date,
        },
        finalReportUrl: {
            type: String,
        },
        finalReportDate: {
            type: Date,
        },

        // Online audit (Zoom)
        onlineSession: {
            platform: {
                type: String,
                enum: ['ZOOM', 'GOOGLE_MEET', 'TEAMS'],
                default: 'ZOOM',
            },
            meetingUrl: String,
            meetingId: String,
            password: String,
            recordingUrl: String,
            screenshots: [{
                url: String,
                timestamp: Date,
                description: String,
            }],
        },

        // Notes
        auditorNotes: {
            type: String,
        },
        farmerComments: {
            type: String,
        },
        internalNotes: {
            type: String,
        },

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        offlineCreated: {
            type: Boolean,
            default: false,
        },
        syncedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
FieldAuditSchema.index({ auditNumber: 1 });
FieldAuditSchema.index({ applicationId: 1 });
FieldAuditSchema.index({ auditorId: 1, scheduledDate: 1 });
FieldAuditSchema.index({ status: 1 });
FieldAuditSchema.index({ scheduledDate: 1 });
FieldAuditSchema.index({ farmerId: 1 });

/**
 * Calculate score from responses
 */
FieldAuditSchema.methods.calculateScore = function () {
    const categoryMap = new Map();

    // Group responses by category
    this.responses.forEach(response => {
        if (!categoryMap.has(response.category)) {
            categoryMap.set(response.category, {
                total: 0,
                passed: 0,
                failed: 0,
                na: 0,
            });
        }

        const cat = categoryMap.get(response.category);
        if (response.response === 'NA') {
            cat.na++;
        } else {
            cat.total++;
            if (response.response === 'PASS') {
                cat.passed++;
            } else if (response.response === 'FAIL') {
                cat.failed++;
            }
        }
    });

    // Calculate category scores
    this.categoryScores = [];
    let totalWeight = 0;
    let weightedScore = 0;

    categoryMap.forEach((data, categoryCode) => {
        const effectiveTotal = data.total; // Exclude NA
        const score = effectiveTotal > 0 ? (data.passed / effectiveTotal) * 100 : 0;

        const categoryScore = {
            categoryCode,
            totalItems: data.total + data.na,
            passedItems: data.passed,
            failedItems: data.failed,
            naItems: data.na,
            score: Math.round(score * 100) / 100,
        };

        this.categoryScores.push(categoryScore);

        // Weighted calculation
        const weight = 1; // Can be customized per category
        totalWeight += weight * effectiveTotal;
        weightedScore += weight * data.passed;
    });

    // Overall score
    this.totalItems = this.responses.filter(r => r.response !== 'NA').length;
    this.passedItems = this.responses.filter(r => r.response === 'PASS').length;
    this.failedItems = this.responses.filter(r => r.response === 'FAIL').length;
    this.naItems = this.responses.filter(r => r.response === 'NA').length;

    this.overallScore = this.totalItems > 0
        ? Math.round((this.passedItems / this.totalItems) * 10000) / 100
        : 0;

    return this.overallScore;
};

/**
 * Determine audit result based on score
 */
FieldAuditSchema.methods.determineResult = function () {
    // Check for critical failures first
    if (this.criticalFailures > 0) {
        this.result = 'CRITICAL_FAIL';
        return this.result;
    }

    // Check zero tolerance categories
    const zeroToleranceCategories = ['QUALITY_ASSURANCE', 'CULTIVATION_SITE'];
    const failsZeroTolerance = this.categoryScores.some(cat =>
        zeroToleranceCategories.includes(cat.categoryCode) && cat.score < 80
    );

    if (failsZeroTolerance) {
        this.result = 'MAJOR';
        return this.result;
    }

    // Standard scoring
    if (this.overallScore >= 90) {
        this.result = 'PASS';
        this.carRequired = false;
    } else if (this.overallScore >= 70) {
        this.result = 'MINOR';
        this.carRequired = true;
        // Set CAR deadline to 14 days
        this.carDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        this.carStatus = 'PENDING';
    } else {
        this.result = 'MAJOR';
        // MAJOR counts toward 3-strikes
    }

    return this.result;
};

/**
 * Generate audit number
 */
FieldAuditSchema.statics.generateAuditNumber = async function () {
    const year = new Date().getFullYear();
    const prefix = `AUD-${year}-`;

    const lastAudit = await this.findOne({
        auditNumber: { $regex: `^${prefix}` }
    }).sort({ auditNumber: -1 });

    let sequence = 1;
    if (lastAudit) {
        const lastSeq = parseInt(lastAudit.auditNumber.split('-')[2], 10);
        sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(5, '0')}`;
};

/**
 * Check 3-Strikes for application
 */
FieldAuditSchema.statics.checkThreeStrikes = async function (applicationId) {
    const failedAudits = await this.countDocuments({
        applicationId,
        result: { $in: ['MAJOR', 'CRITICAL_FAIL'] },
    });

    return {
        failedAttempts: failedAudits,
        isThreeStrikes: failedAudits >= 3,
        remainingAttempts: Math.max(0, 3 - failedAudits),
    };
};

const FieldAudit = mongoose.model('FieldAudit', FieldAuditSchema);

module.exports = FieldAudit;

