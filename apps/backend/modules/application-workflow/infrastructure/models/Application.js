/**
 * Application Model (Mongoose Schema)
 *
 * MongoDB schema for GACP certification applications.
 * Includes comprehensive validation, indexing, and business logic.
 *
 * Features:
 * - Complete state machine implementation
 * - Document validation and requirements
 * - Audit trail with workflow history
 * - Payment tracking for both phases
 * - Inspection and approval workflows
 * - Performance optimized indexes
 * - Data integrity constraints
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

const logger = require('../../../../shared/logger/logger');
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ==============================================
// SUBDOCUMENT SCHEMAS
// ==============================================

// Workflow History Entry Schema
const WorkflowHistorySchema = new Schema(
  {
    state: {
      type: String,
      required: true,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'revision_required',
        'payment_pending',
        'payment_verified',
        'inspection_scheduled',
        'inspection_completed',
        'phase2_payment_pending',
        'phase2_payment_verified',
        'approved',
        'certificate_issued',
        'rejected',
        'expired',
      ],
    },
    enteredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    exitedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // milliseconds
      default: null,
    },
    actor: {
      type: String,
      required: true,
      description: 'User ID who triggered this state change',
    },
    actorRole: {
      type: String,
      required: true,
      enum: ['FARMER', 'DTAM_REVIEWER', 'DTAM_INSPECTOR', 'DTAM_ADMIN', 'ADMIN', 'SYSTEM'],
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: '',
    },
  },
  { _id: false },
);

// Document Schema
const DocumentSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'farm_license',
        'land_deed',
        'farmer_id',
        'farm_photos',
        'water_test',
        'soil_test',
        'business_license',
        'other',
      ],
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
      max: 10 * 1024 * 1024, // 10MB limit
    },
    uploadPath: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false },
);

// Farm Information Schema
const FarmSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    registrationNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    address: {
      street: { type: String, required: true, maxlength: 200 },
      district: { type: String, required: true, maxlength: 100 },
      province: { type: String, required: true, maxlength: 100 },
      postalCode: { type: String, required: true, match: /^\d{5}$/ },
      country: { type: String, default: 'Thailand' },
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
    area: {
      total: { type: Number, required: true, min: 0 }, // in rai
      cultivated: { type: Number, required: true, min: 0 },
    },
    soilType: {
      type: String,
      enum: ['clay', 'sandy', 'loamy', 'silt', 'rocky', 'other'],
    },
    waterSource: {
      type: String,
      enum: ['well', 'river', 'irrigation', 'rainwater', 'other'],
    },
    facilities: [
      {
        type: String,
        enum: ['greenhouse', 'storage', 'processing', 'irrigation', 'other'],
      },
    ],
  },
  { _id: false },
);

// Payment Schema
const PaymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'THB',
    },
    paymentMethod: {
      type: String,
      enum: ['promptpay', 'bank_transfer', 'credit_card', 'cash'],
      default: 'promptpay',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentRef: {
      type: String,
      default: null,
    },
    qrCode: {
      type: String,
      default: null,
    },
    paymentUrl: {
      type: String,
      default: null,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

// Review Schema
const ReviewSchema = new Schema(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    approved: {
      type: Boolean,
      default: null,
    },
    findings: [
      {
        type: String,
        maxlength: 500,
      },
    ],
    notes: {
      type: String,
      maxlength: 2000,
    },
    revisionRequested: {
      type: Boolean,
      default: false,
    },
    revisionReasons: [
      {
        type: String,
        maxlength: 500,
      },
    ],
    revisionNotes: {
      type: String,
      maxlength: 2000,
    },
  },
  { _id: false },
);

// Inspection Schema
const InspectionSchema = new Schema(
  {
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['onsite', 'virtual'],
      default: 'onsite',
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    passed: {
      type: Boolean,
      default: null,
    },
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    findings: [
      {
        category: String,
        item: String,
        status: { type: String, enum: ['pass', 'fail', 'na'] },
        notes: String,
      },
    ],
    photos: [
      {
        fileName: String,
        uploadPath: String,
        caption: String,
        takenAt: { type: Date, default: Date.now },
      },
    ],
    checklist: {
      siteSelection: { passed: Boolean, notes: String },
      waterQuality: { passed: Boolean, notes: String },
      soilTesting: { passed: Boolean, notes: String },
      seedCertification: { passed: Boolean, notes: String },
      inputMaterials: { passed: Boolean, notes: String },
      pestManagement: { passed: Boolean, notes: String },
      harvestTiming: { passed: Boolean, notes: String },
      postHarvestHandling: { passed: Boolean, notes: String },
      storageConditions: { passed: Boolean, notes: String },
      recordKeeping: { passed: Boolean, notes: String },
    },
    inspectorNotes: {
      type: String,
      maxlength: 3000,
    },
  },
  { _id: false },
);

// Approval Schema
const ApprovalSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    signature: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    certificateTemplate: {
      type: String,
      enum: ['standard', 'organic', 'premium'],
      default: 'standard',
    },
  },
  { _id: false },
);

// Rejection Schema
const RejectionSchema = new Schema(
  {
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    reason: {
      type: String,
      required: function () {
        return this.parent().status === 'rejected';
      },
      maxlength: 1000,
    },
    stage: {
      type: String,
      enum: [
        'under_review',
        'inspection_scheduled',
        'inspection_completed',
        'phase2_payment_verified',
      ],
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    complianceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    autoRejection: {
      type: Boolean,
      default: false,
    },
    canReapply: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

// ==============================================
// MAIN APPLICATION SCHEMA
// ==============================================

const ApplicationSchema = new Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^APP-\d{8}-\d{4}$/,
      index: true,
    },

    // Farmer Information
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Farm Information
    farm: {
      type: FarmSchema,
      required: true,
    },

    // Workflow State
    status: {
      type: String,
      required: true,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'revision_required',
        'payment_pending',
        'payment_verified',
        'inspection_scheduled',
        'inspection_completed',
        'phase2_payment_pending',
        'phase2_payment_verified',
        'approved',
        'certificate_issued',
        'rejected',
        'expired',
      ],
      default: 'draft',
      index: true,
    },

    // Workflow History
    workflowHistory: [WorkflowHistorySchema],

    // Revision Tracking
    revisionCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },

    // Documents
    documents: [DocumentSchema],

    // Payment Information
    payment: {
      phase1: PaymentSchema,
      phase2: PaymentSchema,
    },

    // Process Stages
    review: ReviewSchema,
    inspection: InspectionSchema,
    approval: ApprovalSchema,
    rejection: RejectionSchema,

    // Certificate Information
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
      default: null,
    },
    certificateNumber: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    certificateIssuedAt: {
      type: Date,
      default: null,
    },

    // Expiration and SLA
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    slaDeadline: {
      type: Date,
      default: null,
    },

    // Metadata
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    tags: [
      {
        type: String,
        maxlength: 50,
      },
    ],
    notes: {
      type: String,
      maxlength: 2000,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'applications',
  },
);

// ==============================================
// INDEXES FOR PERFORMANCE
// ==============================================

// Compound indexes for common queries
ApplicationSchema.index({ farmerId: 1, status: 1 });
ApplicationSchema.index({ status: 1, createdAt: -1 });
ApplicationSchema.index({ status: 1, expiresAt: 1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ 'review.reviewerId': 1, status: 1 });
ApplicationSchema.index({ 'inspection.inspectorId': 1, status: 1 });
ApplicationSchema.index({ 'approval.adminId': 1, status: 1 });

// Text search index
ApplicationSchema.index({
  applicationNumber: 'text',
  farmerEmail: 'text',
  'farm.name': 'text',
});

// Geospatial index for farm locations
ApplicationSchema.index({ 'farm.coordinates': '2dsphere' });

// ==============================================
// SCHEMA METHODS
// ==============================================

// Instance Methods
ApplicationSchema.methods.isInState = function (state) {
  return this.status === state;
};

ApplicationSchema.methods.canTransitionTo = function (newState) {
  const ApplicationStateMachine = require('../domain/StateMachine');
  const stateMachine = new ApplicationStateMachine();
  return stateMachine.isValidTransition(this.status, newState);
};

ApplicationSchema.methods.getCurrentStateMetadata = function () {
  const ApplicationStateMachine = require('../domain/StateMachine');
  const stateMachine = new ApplicationStateMachine();
  return stateMachine.getStateMetadata(this.status);
};

ApplicationSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

ApplicationSchema.methods.getProgress = function () {
  const stateOrder = [
    'draft',
    'submitted',
    'under_review',
    'payment_pending',
    'payment_verified',
    'inspection_scheduled',
    'inspection_completed',
    'phase2_payment_pending',
    'phase2_payment_verified',
    'approved',
    'certificate_issued',
  ];

  const currentIndex = stateOrder.indexOf(this.status);
  return currentIndex >= 0 ? Math.round(((currentIndex + 1) / stateOrder.length) * 100) : 0;
};

ApplicationSchema.methods.getRequiredDocuments = function () {
  return [
    { type: 'farm_license', required: true, description: 'Farm license document' },
    { type: 'land_deed', required: true, description: 'Land ownership or lease agreement' },
    { type: 'farmer_id', required: true, description: 'Farmer identification document' },
    { type: 'farm_photos', required: true, description: 'Farm location photos' },
  ];
};

ApplicationSchema.methods.getMissingDocuments = function () {
  const required = this.getRequiredDocuments();
  const uploaded = this.documents.map(doc => doc.type);

  return required.filter(req => req.required && !uploaded.includes(req.type));
};

ApplicationSchema.methods.isReadyForSubmission = function () {
  return (
    this.getMissingDocuments().length === 0 &&
    this.farm &&
    this.farm.address &&
    this.farm.coordinates
  );
};

// Static Methods
ApplicationSchema.statics.findByApplicationNumber = function (applicationNumber) {
  return this.findOne({ applicationNumber, isDeleted: { $ne: true } });
};

ApplicationSchema.statics.findByFarmer = function (farmerId) {
  return this.find({ farmerId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
};

ApplicationSchema.statics.findRequiringAction = function (role) {
  let statusFilters = [];

  switch (role) {
    case 'DTAM_REVIEWER':
      statusFilters = ['under_review'];
      break;
    case 'DTAM_INSPECTOR':
      statusFilters = ['payment_verified', 'inspection_scheduled'];
      break;
    case 'DTAM_ADMIN':
      statusFilters = ['phase2_payment_verified'];
      break;
  }

  return this.find({
    status: { $in: statusFilters },
    isDeleted: { $ne: true },
  }).sort({ createdAt: 1 });
};

ApplicationSchema.statics.findExpired = function () {
  return this.find({
    expiresAt: { $lt: new Date() },
    status: { $nin: ['certificate_issued', 'rejected', 'expired'] },
    isDeleted: { $ne: true },
  });
};

// ==============================================
// MIDDLEWARE (PRE/POST HOOKS)
// ==============================================

// Pre-save middleware
ApplicationSchema.pre('save', function (next) {
  // Update timestamp
  this.updatedAt = new Date();

  // Set submittedAt when transitioning to submitted
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  // Validate state transitions
  if (this.isModified('status') && this.isNew === false) {
    const ApplicationStateMachine = require('../domain/StateMachine');
    const stateMachine = new ApplicationStateMachine();

    const originalStatus = this._original ? this._original.status : null;
    if (originalStatus && !stateMachine.isValidTransition(originalStatus, this.status)) {
      return next(new Error(`Invalid state transition from ${originalStatus} to ${this.status}`));
    }
  }

  next();
});

// Pre-find middleware to exclude deleted documents
ApplicationSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

// Post-save middleware for audit logging
ApplicationSchema.post('save', function (doc) {
  // Emit events for external systems
  if (doc.isModified('status')) {
    // Could emit to event bus here
    logger.info(`Application ${doc.applicationNumber} status changed to ${doc.status}`);
  }
});

// ==============================================
// VIRTUAL FIELDS
// ==============================================

ApplicationSchema.virtual('progress').get(function () {
  return this.getProgress();
});

ApplicationSchema.virtual('isExpiredVirtual').get(function () {
  return this.isExpired();
});

ApplicationSchema.virtual('currentStateMetadata').get(function () {
  return this.getCurrentStateMetadata();
});

ApplicationSchema.virtual('missingDocuments').get(function () {
  return this.getMissingDocuments();
});

ApplicationSchema.virtual('readyForSubmission').get(function () {
  return this.isReadyForSubmission();
});

// ==============================================
// EXPORT MODEL
// ==============================================

const Application = mongoose.model('Application', ApplicationSchema);
module.exports = Application;
