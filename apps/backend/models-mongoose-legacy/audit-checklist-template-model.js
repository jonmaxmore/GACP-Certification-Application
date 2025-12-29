/**
 * Audit Checklist Template Model
 * Contains GACP 14 categories and 88 checklist items
 * Based on field_audit_system_design.md
 */

const mongoose = require('mongoose');

/**
 * Checklist Item Schema
 */
const ChecklistItemSchema = new mongoose.Schema({
    itemCode: {
        type: String,
        required: true,
        // Format: CAT01-001
    },
    title: {
        type: String,
        required: true,
    },
    titleTh: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    descriptionTh: {
        type: String,
    },
    category: {
        type: String,
        required: true,
        enum: [
            'GENERAL_INFO',           // ข้อมูลทั่วไป
            'CULTIVATION_SITE',       // สถานที่เพาะปลูก
            'WATER_SUPPLY',           // แหล่งน้ำ
            'SEEDLING',               // วัสดุเพาะปลูก
            'CULTIVATION',            // การเพาะปลูก
            'PEST_CONTROL',           // การป้องกันศัตรูพืช
            'HARVEST',                // การเก็บเกี่ยว
            'POST_HARVEST',           // หลังการเก็บเกี่ยว
            'STORAGE',                // การเก็บรักษา
            'TRANSPORT',              // การขนส่ง
            'QUALITY_ASSURANCE',      // การประกันคุณภาพ
            'PERSONNEL',              // บุคลากร
            'DOCUMENTATION',          // เอกสาร
            'ENVIRONMENT',            // สิ่งแวดล้อม
        ],
    },
    checkType: {
        type: String,
        required: true,
        enum: ['PASS_FAIL', 'SCORE', 'TEXT', 'PHOTO', 'GPS'],
        default: 'PASS_FAIL',
    },
    maxScore: {
        type: Number,
        default: 1,
        // For SCORE type: 0-5 scale
    },
    weight: {
        type: Number,
        default: 1,
        // Weighted importance
    },
    isCritical: {
        type: Boolean,
        default: false,
        // If critical, must pass to get certificate
    },
    isZeroTolerance: {
        type: Boolean,
        default: false,
        // For Quality Assurance and Cultivation Site: ≥80% required
    },
    requiresPhoto: {
        type: Boolean,
        default: false,
    },
    requiresGPS: {
        type: Boolean,
        default: false,
    },
    guidelineText: {
        type: String,
        // Instructions for auditor
    },
    guidelineTextTh: {
        type: String,
    },
    order: {
        type: Number,
        default: 0,
    },
});

/**
 * Category Schema
 */
const CategorySchema = new mongoose.Schema({
    categoryCode: {
        type: String,
        required: true,
        unique: true,
        // CAT01, CAT02, etc.
    },
    name: {
        type: String,
        required: true,
    },
    nameTh: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    descriptionTh: {
        type: String,
    },
    minimumScore: {
        type: Number,
        default: 0,
        // For Zero Tolerance categories: 80%
    },
    weight: {
        type: Number,
        default: 1,
        // Category weight for overall score
    },
    order: {
        type: Number,
        default: 0,
    },
    items: [ChecklistItemSchema],
});

/**
 * Audit Checklist Template Schema
 */
const AuditChecklistTemplateSchema = new mongoose.Schema(
    {
        templateCode: {
            type: String,
            required: true,
            unique: true,
            // e.g., GACP-FULL-2025, GACP-QUICK-2025
        },
        name: {
            type: String,
            required: true,
        },
        nameTh: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        descriptionTh: {
            type: String,
        },
        version: {
            type: String,
            required: true,
            default: '1.0',
        },
        templateType: {
            type: String,
            required: true,
            enum: ['FULL', 'QUICK', 'RENEWAL', 'SPECIAL'],
            default: 'FULL',
        },
        plantType: {
            type: String,
            enum: ['ALL', 'CANNABIS', 'KRATOM', 'TURMERIC', 'GINGER', 'BLACK_GALINGALE', 'PLAI'],
            default: 'ALL',
        },
        passThreshold: {
            type: Number,
            required: true,
            default: 90,
            // 90% to pass
        },
        zeroToleranceThreshold: {
            type: Number,
            default: 80,
            // 80% for critical categories
        },
        categories: [CategorySchema],
        totalItems: {
            type: Number,
            default: 0,
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
        isActive: {
            type: Boolean,
            default: true,
        },
        effectiveFrom: {
            type: Date,
            default: Date.now,
        },
        effectiveTo: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
AuditChecklistTemplateSchema.index({ templateCode: 1 });
AuditChecklistTemplateSchema.index({ templateType: 1, isActive: 1 });
AuditChecklistTemplateSchema.index({ plantType: 1 });

// Calculate total items before save
AuditChecklistTemplateSchema.pre('save', function (next) {
    this.totalItems = this.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    next();
});

// Static method to get active template
AuditChecklistTemplateSchema.statics.getActiveTemplate = async function (templateType = 'FULL', plantType = 'ALL') {
    return this.findOne({
        templateType,
        plantType: { $in: [plantType, 'ALL'] },
        isActive: true,
        effectiveFrom: { $lte: new Date() },
        $or: [
            { effectiveTo: null },
            { effectiveTo: { $gte: new Date() } },
        ],
    }).sort({ version: -1 });
};

const AuditChecklistTemplate = mongoose.model('AuditChecklistTemplate', AuditChecklistTemplateSchema);

module.exports = AuditChecklistTemplate;

