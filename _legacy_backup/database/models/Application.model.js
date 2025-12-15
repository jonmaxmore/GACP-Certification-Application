/**
 * Application Model - GACP Platform
 * MongoDB schema for GACP certification application management
 *
 * @module database/models/Application
 * @version 2.0.0
 * @date 2025-10-16
 *
 * @standards
 * - OpenAPI 3.0.3 specification compliance
 * - 12-state FSM (Finite State Machine)
 * - GeoJSON for GPS coordinates
 * - Thai address validation
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Farm Address Subdocument Schema
 * Embedded document with Thai address format + GPS
 */
const FarmAddressSchema = new Schema(
  {
    houseNo: {
      type: String,
      required: true,
      trim: true
    },
    moo: {
      type: String,
      trim: true,
      default: null
    },
    tambon: {
      type: String,
      required: true,
      trim: true
    },
    amphoe: {
      type: String,
      required: true,
      trim: true
    },
    province: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    postalCode: {
      type: String,
      required: true,
      match: /^[0-9]{5}$/
    },
    gpsCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (v) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 && // longitude
              v[1] >= -90 &&
              v[1] <= 90
            ); // latitude
          },
          message: 'Invalid GPS coordinates'
        }
      }
    }
  },
  { _id: false }
);

/**
 * State History Subdocument Schema
 * Track all state transitions for audit
 */
const StateHistorySchema = new Schema(
  {
    state: {
      type: String,
      required: true,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'PAYMENT_PENDING',
        'PAYMENT_VERIFIED',
        'INSPECTION_SCHEDULED',
        'INSPECTION_COMPLETED',
        'PHASE2_PAYMENT_PENDING',
        'PHASE2_PAYMENT_VERIFIED',
        'APPROVED',
        'CERTIFICATE_ISSUED',
        'REJECTED',
        'REVISION_REQUIRED',
        'EXPIRED'
      ]
    },
    enteredAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    exitedAt: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // milliseconds
      default: null
    },
    actor: {
      type: String,
      required: true,
      description: 'userId who triggered this state change'
    },
    actorRole: {
      type: String,
      required: true,
      enum: ['FARMER', 'DTAM', 'ADMIN', 'SYSTEM']
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: null
    }
  },
  { _id: false }
);

/**
 * DTAM Review Subdocument Schema
 * Embedded review information
 */
const DTAMReviewSchema = new Schema(
  {
    reviewerId: {
      type: String,
      required: true
    },
    reviewerName: {
      type: String,
      required: true
    },
    assignedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    reviewStartedAt: {
      type: Date,
      default: null
    },
    reviewCompletedAt: {
      type: Date,
      default: null
    },
    reviewNotes: {
      type: String,
      maxlength: 2000,
      default: null
    },
    reviewDecision: {
      type: String,
      enum: [null, 'APPROVE_PHASE1', 'REJECT', 'REQUEST_REVISION'],
      default: null
    },
    rejectionReason: {
      type: String,
      maxlength: 1000,
      default: null
    },
    revisionNotes: {
      type: String,
      maxlength: 1000,
      default: null
    }
  },
  { _id: false }
);

/**
 * Application Schema
 * Main collection for certification applications
 */
const ApplicationSchema = new Schema(
  {
    // === PRIMARY KEY ===
    _id: {
      type: Schema.Types.ObjectId,
      auto: true
    },

    // === UNIQUE IDENTIFIERS ===
    applicationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^APP-\d{4}-[A-Z0-9]{8}$/,
      description: 'Format: APP-YYYY-XXXXXXXX'
    },

    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^GACP-\d{4}-\d{6}$/,
      description: 'Public-facing number: GACP-YYYY-NNNNNN'
    },

    // === USER REFERENCE ===
    userId: {
      type: String,
      required: true,
      index: true,
      ref: 'User'
    },

    // Denormalized for performance
    farmerName: {
      type: String,
      required: true,
      trim: true
    },

    farmerEmail: {
      type: String,
      required: true,
      lowercase: true
    },

    farmerPhone: {
      type: String,
      required: true,
      match: /^0[0-9]{9}$/
    },

    // === FARM INFORMATION ===
    farmName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
      index: 'text' // Full-text search
    },

    farmAddress: {
      type: FarmAddressSchema,
      required: true
    },

    farmSize: {
      type: Number,
      required: true,
      min: 0.1,
      max: 10000,
      description: 'Farm size in specified unit'
    },

    farmSizeUnit: {
      type: String,
      required: true,
      enum: ['rai', 'sqm', 'hectare'],
      default: 'rai'
    },

    // === CULTIVATION DETAILS ===
    cultivationType: {
      type: String,
      required: true,
      enum: ['INDOOR', 'OUTDOOR', 'GREENHOUSE']
    },

    cannabisVariety: {
      type: String,
      required: true,
      enum: ['CBD', 'THC', 'MIXED']
    },

    // === APPLICATION WORKFLOW (12-State FSM) ===
    state: {
      type: String,
      required: true,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'PAYMENT_PENDING',
        'PAYMENT_VERIFIED',
        'INSPECTION_SCHEDULED',
        'INSPECTION_COMPLETED',
        'PHASE2_PAYMENT_PENDING',
        'PHASE2_PAYMENT_VERIFIED',
        'APPROVED',
        'CERTIFICATE_ISSUED',
        'REJECTED',
        'REVISION_REQUIRED',
        'EXPIRED'
      ],
      default: 'DRAFT',
      index: true
    },

    previousState: {
      type: String,
      enum: [
        null,
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'PAYMENT_PENDING',
        'PAYMENT_VERIFIED',
        'INSPECTION_SCHEDULED',
        'INSPECTION_COMPLETED',
        'PHASE2_PAYMENT_PENDING',
        'PHASE2_PAYMENT_VERIFIED',
        'APPROVED',
        'CERTIFICATE_ISSUED',
        'REJECTED',
        'REVISION_REQUIRED',
        'EXPIRED'
      ],
      default: null
    },

    stateChangedAt: {
      type: Date,
      required: true,
      default: Date.now
    },

    // State history (embedded array, max ~20 entries)
    stateHistory: {
      type: [StateHistorySchema],
      default: []
    },

    // === DTAM REVIEW ===
    dtamReview: {
      type: DTAMReviewSchema,
      default: null
    },

    // === DOCUMENTS (Referenced) ===
    // Stored in separate 'application_documents' collection
    documentsCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    requiredDocumentsComplete: {
      type: Boolean,
      required: true,
      default: false
    },

    // === PAYMENT REFERENCES ===
    phase1PaymentId: {
      type: String,
      default: null,
      description: 'Reference to invoices collection'
    },

    phase1PaidAt: {
      type: Date,
      default: null
    },

    phase2PaymentId: {
      type: String,
      default: null
    },

    phase2PaidAt: {
      type: Date,
      default: null
    },

    totalFeePaid: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    totalFeeExpected: {
      type: Number,
      required: true,
      default: 30000, // ฿5,000 + ฿25,000
      description: 'Phase 1 (฿5,000) + Phase 2 (฿25,000)'
    },

    // === INSPECTION ===
    inspectionScheduledAt: {
      type: Date,
      default: null
    },

    inspectionCompletedAt: {
      type: Date,
      default: null
    },

    inspectionResult: {
      type: String,
      enum: [null, 'PASS', 'FAIL', 'CONDITIONAL'],
      default: null
    },

    inspectionNotes: {
      type: String,
      maxlength: 2000,
      default: null
    },

    // === CERTIFICATE REFERENCE ===
    certificateId: {
      type: String,
      default: null,
      description: 'Reference to certificates collection'
    },

    certificateIssuedAt: {
      type: Date,
      default: null
    },

    // === TIMELINE ESTIMATION ===
    estimatedCompletionDate: {
      type: Date,
      default: null
    },

    estimatedReviewDays: {
      type: Number,
      default: 14,
      description: 'Estimated days for DTAM review'
    },

    estimatedInspectionDays: {
      type: Number,
      default: 7,
      description: 'Estimated days for inspection'
    },

    estimatedTotalDays: {
      type: Number,
      default: 30,
      description: 'Total estimated days to completion'
    },

    // === METADATA ===
    submittedAt: {
      type: Date,
      default: null,
      index: true
    },

    completedAt: {
      type: Date,
      default: null
    },

    // === STATUS FLAGS ===
    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true
    },

    isDeleted: {
      type: Boolean,
      required: true,
      default: false
    },

    deletedAt: {
      type: Date,
      default: null
    },

    // === TIMESTAMPS ===
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
      index: true
    },

    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'applications',
    versionKey: false
  }
);

// ========================================
// INDEXES
// ========================================

// Unique indexes
ApplicationSchema.index({ applicationId: 1 }, { unique: true });
ApplicationSchema.index({ applicationNumber: 1 }, { unique: true });

// Query indexes (ESR Rule: Equality, Sort, Range)
ApplicationSchema.index({ userId: 1, state: 1, createdAt: -1 });
ApplicationSchema.index({ state: 1, submittedAt: -1 }); // DTAM queue
ApplicationSchema.index({ 'farmAddress.province': 1, state: 1 });

// Geospatial index (2dsphere for GPS queries)
ApplicationSchema.index({ 'farmAddress.gpsCoordinates': '2dsphere' });

// Text search index
ApplicationSchema.index({
  farmName: 'text',
  farmerName: 'text',
  'farmAddress.province': 'text'
});

// Partial index (active applications only)
ApplicationSchema.index(
  { state: 1, submittedAt: -1 },
  {
    partialFilterExpression: {
      isActive: true,
      isDeleted: false
    },
    name: 'active_applications_queue'
  }
);

// ========================================
// VIRTUAL PROPERTIES
// ========================================

/**
 * Check if application is in terminal state
 */
ApplicationSchema.virtual('isTerminalState').get(function () {
  return ['CERTIFICATE_ISSUED', 'REJECTED', 'EXPIRED'].includes(this.state);
});

/**
 * Check if payment is required
 */
ApplicationSchema.virtual('isPaymentPending').get(function () {
  return ['PAYMENT_PENDING', 'PHASE2_PAYMENT_PENDING'].includes(this.state);
});

/**
 * Get current state duration (milliseconds)
 */
ApplicationSchema.virtual('currentStateDuration').get(function () {
  return Date.now() - this.stateChangedAt.getTime();
});

/**
 * Get current state duration in days
 */
ApplicationSchema.virtual('currentStateDurationDays').get(function () {
  return Math.floor(this.currentStateDuration / (1000 * 60 * 60 * 24));
});

/**
 * Check if Phase 1 is paid
 */
ApplicationSchema.virtual('isPhase1Paid').get(function () {
  return this.phase1PaidAt !== null;
});

/**
 * Check if Phase 2 is paid
 */
ApplicationSchema.virtual('isPhase2Paid').get(function () {
  return this.phase2PaidAt !== null;
});

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Transition to new state with validation
 * @param {String} newState - Target state
 * @param {String} actorId - User ID who triggered transition
 * @param {String} actorRole - User role
 * @param {String} notes - Optional notes
 * @returns {Promise<Application>}
 */
ApplicationSchema.methods.transitionTo = async function (
  newState,
  actorId,
  actorRole,
  notes = null
) {
  // Validate state transition
  if (!this.isValidTransition(newState)) {
    throw new Error(`Invalid transition from ${this.state} to ${newState}`);
  }

  // Close current state in history
  if (this.stateHistory.length > 0) {
    const currentHistoryEntry = this.stateHistory[this.stateHistory.length - 1];
    if (!currentHistoryEntry.exitedAt) {
      currentHistoryEntry.exitedAt = new Date();
      currentHistoryEntry.duration = currentHistoryEntry.exitedAt - currentHistoryEntry.enteredAt;
    }
  }

  // Add new state to history
  this.stateHistory.push({
    state: newState,
    enteredAt: new Date(),
    exitedAt: null,
    duration: null,
    actor: actorId,
    actorRole: actorRole,
    notes: notes
  });

  // Update state
  this.previousState = this.state;
  this.state = newState;
  this.stateChangedAt = new Date();

  // Set submittedAt when transitioning to SUBMITTED
  if (newState === 'SUBMITTED' && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  // Set completedAt for terminal states
  if (this.isTerminalState && !this.completedAt) {
    this.completedAt = new Date();
  }

  await this.save();
  return this;
};

/**
 * Validate if state transition is allowed (12-State FSM)
 * @param {String} targetState - Target state
 * @returns {Boolean}
 */
ApplicationSchema.methods.isValidTransition = function (targetState) {
  const validTransitions = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['PAYMENT_PENDING', 'REVISION_REQUIRED', 'REJECTED'],
    REVISION_REQUIRED: ['SUBMITTED', 'EXPIRED'],
    PAYMENT_PENDING: ['PAYMENT_VERIFIED', 'EXPIRED'],
    PAYMENT_VERIFIED: ['INSPECTION_SCHEDULED'],
    INSPECTION_SCHEDULED: ['INSPECTION_COMPLETED'],
    INSPECTION_COMPLETED: ['PHASE2_PAYMENT_PENDING', 'REJECTED'],
    PHASE2_PAYMENT_PENDING: ['PHASE2_PAYMENT_VERIFIED', 'EXPIRED'],
    PHASE2_PAYMENT_VERIFIED: ['APPROVED'],
    APPROVED: ['CERTIFICATE_ISSUED'],
    CERTIFICATE_ISSUED: [], // Terminal state
    REJECTED: [], // Terminal state
    EXPIRED: [] // Terminal state
  };

  const allowedTransitions = validTransitions[this.state] || [];
  return allowedTransitions.includes(targetState);
};

/**
 * Assign DTAM reviewer
 * @param {String} reviewerId - DTAM user ID
 * @param {String} reviewerName - DTAM user name
 * @returns {Promise<Application>}
 */
ApplicationSchema.methods.assignReviewer = async function (reviewerId, reviewerName) {
  this.dtamReview = {
    reviewerId: reviewerId,
    reviewerName: reviewerName,
    assignedAt: new Date(),
    reviewStartedAt: null,
    reviewCompletedAt: null,
    reviewNotes: null,
    reviewDecision: null,
    rejectionReason: null,
    revisionNotes: null
  };

  await this.save();
  return this;
};

/**
 * Calculate progress percentage (0-100)
 * @returns {Number}
 */
ApplicationSchema.methods.calculateProgress = function () {
  const stateProgress = {
    DRAFT: 0,
    SUBMITTED: 10,
    UNDER_REVIEW: 20,
    PAYMENT_PENDING: 30,
    PAYMENT_VERIFIED: 40,
    INSPECTION_SCHEDULED: 50,
    INSPECTION_COMPLETED: 60,
    PHASE2_PAYMENT_PENDING: 70,
    PHASE2_PAYMENT_VERIFIED: 80,
    APPROVED: 90,
    CERTIFICATE_ISSUED: 100,
    REJECTED: 0,
    REVISION_REQUIRED: 15,
    EXPIRED: 0
  };

  return stateProgress[this.state] || 0;
};

// ========================================
// STATIC METHODS
// ========================================

/**
 * Generate unique Application ID
 * @returns {Promise<String>} - Format: APP-YYYY-XXXXXXXX
 */
ApplicationSchema.statics.generateApplicationId = async function () {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const applicationId = `APP-${year}-${randomPart}`;

  const existing = await this.findOne({ applicationId });
  if (existing) {
    return this.generateApplicationId();
  }

  return applicationId;
};

/**
 * Generate sequential Application Number
 * @returns {Promise<String>} - Format: GACP-YYYY-NNNNNN
 */
ApplicationSchema.statics.generateApplicationNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `GACP-${year}-`;

  // Find last application number for this year
  const lastApp = await this.findOne({
    applicationNumber: new RegExp(`^${prefix}`)
  }).sort({ applicationNumber: -1 });

  let nextNumber = 1;
  if (lastApp) {
    const lastNumber = parseInt(lastApp.applicationNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(6, '0')}`;
};

/**
 * Find pending DTAM queue (FIFO)
 * @returns {Promise<Application[]>}
 */
ApplicationSchema.statics.findDTAMQueue = function () {
  return this.find({
    state: 'UNDER_REVIEW',
    isActive: true,
    isDeleted: false
  }).sort({ submittedAt: 1 }); // FIFO
};

/**
 * Find applications near location (geospatial query)
 * @param {Number} longitude - GPS longitude
 * @param {Number} latitude - GPS latitude
 * @param {Number} maxDistanceKm - Max distance in kilometers
 * @returns {Promise<Application[]>}
 */
ApplicationSchema.statics.findNearLocation = function (longitude, latitude, maxDistanceKm = 10) {
  return this.find({
    'farmAddress.gpsCoordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000 // Convert to meters
      }
    },
    isActive: true,
    isDeleted: false
  });
};

// ========================================
// MIDDLEWARE (Hooks)
// ========================================

/**
 * Pre-save: Update updatedAt timestamp
 */
ApplicationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Pre-save: Validate GPS coordinates
 */
ApplicationSchema.pre('save', function (next) {
  if (this.farmAddress && this.farmAddress.gpsCoordinates) {
    const coords = this.farmAddress.gpsCoordinates.coordinates;

    // Validate Thailand bounds (approximate)
    // Thailand: 5.61°N to 20.46°N, 97.34°E to 105.64°E
    if (coords[1] < 5.61 || coords[1] > 20.46 || coords[0] < 97.34 || coords[0] > 105.64) {
      return next(new Error('GPS coordinates outside Thailand bounds'));
    }
  }
  next();
});

/**
 * Post-save: Limit state history to 50 entries
 */
ApplicationSchema.post('save', function (doc, next) {
  if (doc.stateHistory.length > 50) {
    doc.stateHistory = doc.stateHistory.slice(-50);
  }
  next();
});

// ========================================
// SCHEMA CONFIGURATION
// ========================================

ApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

ApplicationSchema.set('toObject', {
  virtuals: true
});

// ========================================
// EXPORT MODEL
// ========================================

module.exports = mongoose.model('Application', ApplicationSchema);
