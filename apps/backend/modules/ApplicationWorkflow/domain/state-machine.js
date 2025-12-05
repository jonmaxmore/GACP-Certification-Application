/**
 * Application State Machine
 *
 * Implements Finite State Machine (FSM) for GACP certification application workflow.
 * Based on real-world government certification processes and business requirements.
 *
 * Business Logic Foundation:
 * - 14 defined states covering complete application lifecycle
 * - State transitions follow Thai FDA and WHO GMP standards
 * - Payment gateways integrated at key checkpoints
 * - Quality assurance through multi-level review process
 * - Audit trail for compliance and transparency
 *
 * @author GACP Platform Team
 * @version 1.0.0
 * @date 2025-10-18
 */

class ApplicationStateMachine {
  constructor() {
    // Application States - Based on real government certification workflow
    this.STATES = {
      // Initial States
      DRAFT: 'draft', // Farmer creating application
      SUBMITTED: 'submitted', // Application submitted for review

      // Review Process States
      UNDER_REVIEW: 'under_review', // DTAM reviewer checking documents
      REVISION_REQUIRED: 'revision_required', // Changes requested by reviewer

      // Payment States
      PAYMENT_PENDING: 'payment_pending', // Awaiting Phase 1 payment (5,000฿)
      PAYMENT_VERIFIED: 'payment_verified', // Payment confirmed

      // Penalty State
      PENALTY_PAYMENT_PENDING: 'penalty_payment_pending', // Awaiting penalty payment (5,000฿) after failed revisions

      // Assignment State
      ASSIGNMENT_PENDING: 'assignment_pending', // Waiting for Officer to assign Auditor

      // Inspection States
      INSPECTION_SCHEDULED: 'inspection_scheduled', // Farm inspection scheduled
      INSPECTION_COMPLETED: 'inspection_completed', // Inspection completed successfully

      // Final Payment & Approval
      PHASE2_PAYMENT_PENDING: 'phase2_payment_pending', // Awaiting Phase 2 payment (25,000฿)
      PHASE2_PAYMENT_VERIFIED: 'phase2_payment_verified', // Final payment confirmed
      APPROVED: 'approved', // Application approved by DTAM

      // Replacement States
      REPLACEMENT_PAYMENT_PENDING: 'replacement_payment_pending', // Awaiting replacement fee
      REPLACEMENT_ADMIN_CHECK: 'replacement_admin_check', // Admin validating replacement request

      // Terminal States
      CERTIFICATE_ISSUED: 'certificate_issued', // Certificate generated and issued
      REJECTED: 'rejected', // Application rejected (with reason)
      EXPIRED: 'expired', // Application expired (180 days timeout)
    };

    // Valid State Transitions - Business Rules Implementation
    this.TRANSITIONS = {
      [this.STATES.DRAFT]: [
        this.STATES.SUBMITTED, // Farmer completes and submits application
        this.STATES.PAYMENT_PENDING, // New/Renewal: Go to payment first
        this.STATES.REPLACEMENT_PAYMENT_PENDING, // Replacement: Go to payment
        this.STATES.EXPIRED, // Draft timeout (30 days)
      ],

      [this.STATES.PAYMENT_PENDING]: [
        this.STATES.PAYMENT_VERIFIED, // Payment webhook confirmation
        this.STATES.EXPIRED, // Payment timeout (7 days)
      ],

      [this.STATES.PAYMENT_VERIFIED]: [
        this.STATES.SUBMITTED, // Auto-transition to submitted after payment (New/Renewal)
        this.STATES.ASSIGNMENT_PENDING, // Legacy/Direct path
        this.STATES.EXPIRED, // Timeout
      ],

      [this.STATES.SUBMITTED]: [
        this.STATES.UNDER_REVIEW, // Auto-transition to review
        this.STATES.REPLACEMENT_PAYMENT_PENDING, // Auto-transition for Replacement
        this.STATES.EXPIRED, // Submission timeout
      ],

      [this.STATES.UNDER_REVIEW]: [
        this.STATES.PAYMENT_PENDING, // (Legacy)
        this.STATES.ASSIGNMENT_PENDING, // Approved -> Assign Auditor (if paid)
        this.STATES.REVISION_REQUIRED, // Auditor requests changes
        this.STATES.REJECTED, // Auditor rejects application
        this.STATES.EXPIRED, // Review timeout (14 days)
      ],

      [this.STATES.REVISION_REQUIRED]: [
        this.STATES.SUBMITTED, // Farmer resubmits with changes
        this.STATES.PENALTY_PAYMENT_PENDING, // Max revisions exceeded -> Pay penalty
        this.STATES.REJECTED, // Max revisions exceeded (if no penalty logic)
        this.STATES.EXPIRED, // Revision timeout (30 days)
      ],

      [this.STATES.PENALTY_PAYMENT_PENDING]: [
        this.STATES.SUBMITTED, // Payment confirmed -> Back to Submitted
        this.STATES.EXPIRED, // Payment timeout
      ],

      [this.STATES.ASSIGNMENT_PENDING]: [
        this.STATES.INSPECTION_SCHEDULED, // Officer assigns Auditor
        this.STATES.EXPIRED, // Assignment timeout
      ],

      [this.STATES.INSPECTION_SCHEDULED]: [
        this.STATES.INSPECTION_COMPLETED, // Auditor completes inspection
        this.STATES.REJECTED, // Auditor fails application
        this.STATES.EXPIRED, // Inspection timeout (30 days)
      ],

      [this.STATES.INSPECTION_COMPLETED]: [
        this.STATES.PHASE2_PAYMENT_PENDING, // Auto-transition after successful inspection
        this.STATES.REJECTED, // Auditor fails application
        this.STATES.EXPIRED, // Report timeout (7 days)
      ],

      [this.STATES.PHASE2_PAYMENT_PENDING]: [
        this.STATES.PHASE2_PAYMENT_VERIFIED, // Final payment confirmed
        this.STATES.EXPIRED, // Payment timeout (7 days)
      ],

      [this.STATES.PHASE2_PAYMENT_VERIFIED]: [
        this.STATES.APPROVED, // Auditor grants final approval
        this.STATES.REJECTED, // Auditor rejects
        this.STATES.EXPIRED, // Approval timeout (14 days)
      ],

      // Replacement Flow
      [this.STATES.REPLACEMENT_PAYMENT_PENDING]: [
        this.STATES.REPLACEMENT_ADMIN_CHECK, // Payment confirmed
        this.STATES.EXPIRED,
      ],

      [this.STATES.REPLACEMENT_ADMIN_CHECK]: [
        this.STATES.APPROVED, // Admin approves replacement
        this.STATES.REJECTED, // Admin rejects
        this.STATES.EXPIRED,
      ],

      [this.STATES.APPROVED]: [
        this.STATES.CERTIFICATE_ISSUED, // Auto-transition when certificate generated
      ],

      // Terminal states - no further transitions
      [this.STATES.CERTIFICATE_ISSUED]: [],
      [this.STATES.REJECTED]: [],
      [this.STATES.EXPIRED]: [],
    };

    // State Metadata - Business Context for Each State
    this.STATE_METADATA = {
      [this.STATES.DRAFT]: {
        description: 'Farmer is creating or editing application',
        owner: 'FARMER',
        timeoutDays: 30,
        nextActions: ['Complete application form', 'Upload required documents'],
        canEdit: true,
        paymentRequired: false,
      },

      [this.STATES.PAYMENT_PENDING]: {
        description: 'Awaiting Phase 1 payment (฿5,000) for application fee',
        owner: 'FARMER',
        timeoutDays: 7,
        nextActions: ['Make payment via PromptPay', 'Wait for confirmation'],
        canEdit: false,
        paymentRequired: true,
        paymentAmount: 5000,
        paymentPhase: 1,
      },

      [this.STATES.PENALTY_PAYMENT_PENDING]: {
        description: 'Awaiting Penalty payment (฿5,000) due to excessive revisions',
        owner: 'FARMER',
        timeoutDays: 7,
        nextActions: ['Make penalty payment', 'Wait for confirmation'],
        canEdit: false,
        paymentRequired: true,
        paymentAmount: 5000,
        paymentPhase: 'PENALTY',
      },

      [this.STATES.PAYMENT_VERIFIED]: {
        description: 'Payment confirmed',
        owner: 'SYSTEM',
        timeoutDays: 1,
        nextActions: ['Auto-transition'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.SUBMITTED]: {
        description: 'Application submitted and waiting for initial review',
        owner: 'SYSTEM',
        timeoutDays: 3,
        nextActions: ['Automatic assignment to auditor'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.UNDER_REVIEW]: {
        description: 'Auditor checking document completeness and accuracy',
        owner: 'AUDITOR',
        timeoutDays: 14,
        nextActions: ['Review documents', 'Approve or request revision'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.REVISION_REQUIRED]: {
        description: 'Farmer must make requested changes and resubmit',
        owner: 'FARMER',
        timeoutDays: 30,
        nextActions: ['Address auditor comments', 'Resubmit application'],
        canEdit: true,
        paymentRequired: false,
      },

      [this.STATES.ASSIGNMENT_PENDING]: {
        description: 'Waiting for Officer to assign an Auditor',
        owner: 'OFFICER',
        timeoutDays: 3,
        nextActions: ['Assign Auditor'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.INSPECTION_SCHEDULED]: {
        description: 'Farm inspection scheduled, waiting for completion',
        owner: 'AUDITOR',
        timeoutDays: 30,
        nextActions: ['Conduct farm inspection', 'Submit inspection report'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.INSPECTION_COMPLETED]: {
        description: 'Inspection completed successfully, awaiting final payment',
        owner: 'FARMER',
        timeoutDays: 7,
        nextActions: ['Automatic transition to payment'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.PHASE2_PAYMENT_PENDING]: {
        description: 'Awaiting Phase 2 payment (฿25,000) for certificate issuance',
        owner: 'FARMER',
        timeoutDays: 7,
        nextActions: ['Make final payment', 'Wait for confirmation'],
        canEdit: false,
        paymentRequired: true,
        paymentAmount: 25000,
        paymentPhase: 2,
      },

      [this.STATES.PHASE2_PAYMENT_VERIFIED]: {
        description: 'Final payment confirmed, awaiting final approval',
        owner: 'AUDITOR',
        timeoutDays: 14,
        nextActions: ['Final review and approval', 'Generate certificate'],
        canEdit: false,
        paymentRequired: false,
      },

      // Replacement Metadata
      [this.STATES.REPLACEMENT_PAYMENT_PENDING]: {
        description: 'Awaiting Replacement Fee payment',
        owner: 'FARMER',
        timeoutDays: 7,
        nextActions: ['Make payment'],
        canEdit: false,
        paymentRequired: true,
        paymentAmount: 500, // Configurable
        paymentPhase: 'REPLACEMENT',
      },

      [this.STATES.REPLACEMENT_ADMIN_CHECK]: {
        description: 'Admin verifying replacement request',
        owner: 'DTAM_ADMIN', // Or Officer? User said Admin check
        timeoutDays: 3,
        nextActions: ['Approve replacement'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.APPROVED]: {
        description: 'Application approved, certificate being generated',
        owner: 'SYSTEM',
        timeoutDays: 1,
        nextActions: ['Automatic certificate generation'],
        canEdit: false,
        paymentRequired: false,
      },

      [this.STATES.CERTIFICATE_ISSUED]: {
        description: 'Certificate issued successfully - process complete',
        owner: 'FARMER',
        timeoutDays: null,
        nextActions: ['Download certificate', 'Start compliance tracking'],
        canEdit: false,
        paymentRequired: false,
        isTerminal: true,
      },

      [this.STATES.REJECTED]: {
        description: 'Application rejected by Auditor',
        owner: 'FARMER',
        timeoutDays: null,
        nextActions: ['Review rejection reason', 'Submit new application'],
        canEdit: false,
        paymentRequired: false,
        isTerminal: true,
      },

      [this.STATES.EXPIRED]: {
        description: 'Application expired due to timeout',
        owner: 'FARMER',
        timeoutDays: null,
        nextActions: ['Submit new application'],
        canEdit: false,
        paymentRequired: false,
        isTerminal: true,
      },
    };

    // Role Permissions - Who can trigger which transitions
    this.ROLE_PERMISSIONS = {
      FARMER: [
        'draft_to_submitted',
        'draft_to_payment_pending',
        'draft_to_replacement_payment_pending',
        'revision_required_to_submitted',
        'revision_required_to_penalty_payment_pending',
        'payment_pending_to_payment_verified',
        'penalty_payment_pending_to_submitted',
        'replacement_payment_pending_to_replacement_admin_check',
        'phase2_payment_pending_to_phase2_payment_verified',
      ],

      AUDITOR: [
        'under_review_to_payment_pending',
        'under_review_to_assignment_pending', // If approved
        'under_review_to_revision_required',
        'under_review_to_penalty_payment_pending',
        'under_review_to_rejected',
        'inspection_scheduled_to_inspection_completed',
        'inspection_scheduled_to_rejected',
        'phase2_payment_verified_to_approved',
        'phase2_payment_verified_to_rejected',
      ],

      OFFICER: [
        'assignment_pending_to_inspection_scheduled',
      ],

      DTAM_ADMIN: [
        'replacement_admin_check_to_approved',
        'replacement_admin_check_to_rejected',
        'phase2_payment_verified_to_approved',
        'phase2_payment_verified_to_rejected',
      ],

      SYSTEM: [
        'submitted_to_under_review',
        'submitted_to_replacement_payment_pending', // Added for Replacement
        'payment_pending_to_payment_verified',
        'phase2_payment_pending_to_phase2_payment_verified',
        'replacement_payment_pending_to_replacement_admin_check', // Added for Replacement
        'payment_verified_to_submitted',
        'payment_verified_to_assignment_pending',
        'inspection_completed_to_phase2_payment_pending',
        'approved_to_certificate_issued',
        '*_to_expired', // System can expire any state
      ],
    };
  }

  /**
   * Check if a state transition is valid
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean} - Whether transition is allowed
   */
  isValidTransition(fromState, toState) {
    if (!this.STATES[fromState.toUpperCase()] || !this.STATES[toState.toUpperCase()]) {
      return false;
    }

    const validTransitions = this.TRANSITIONS[fromState];
    return validTransitions && validTransitions.includes(toState);
  }

  /**
   * Check if user role can perform transition
   * @param {string} role - User role (FARMER, DTAM_REVIEWER, etc.)
   * @param {string} fromState - Current state
   * @param {string} toState - Target state
   * @returns {boolean} - Whether role has permission
   */
  canUserTransition(role, fromState, toState) {
    const permissions = this.ROLE_PERMISSIONS[role] || [];
    const transitionKey = `${fromState}_to_${toState}`;

    return (
      permissions.includes(transitionKey) ||
      (permissions.includes('*_to_expired') && toState === this.STATES.EXPIRED)
    );
  }

  /**
   * Get next valid states from current state
   * @param {string} currentState - Current application state
   * @returns {string[]} - Array of valid next states
   */
  getNextStates(currentState) {
    return this.TRANSITIONS[currentState] || [];
  }

  /**
   * Get state metadata
   * @param {string} state - State to get metadata for
   * @returns {Object} - State metadata object
   */
  getStateMetadata(state) {
    return this.STATE_METADATA[state] || null;
  }

  /**
   * Check if state requires payment
   * @param {string} state - State to check
   * @returns {boolean} - Whether payment is required
   */
  isPaymentState(state) {
    const metadata = this.getStateMetadata(state);
    return metadata ? metadata.paymentRequired : false;
  }

  /**
   * Check if state is terminal (no further transitions)
   * @param {string} state - State to check
   * @returns {boolean} - Whether state is terminal
   */
  isTerminalState(state) {
    const metadata = this.getStateMetadata(state);
    return metadata ? metadata.isTerminal === true : false;
  }

  /**
   * Get timeout days for state
   * @param {string} state - State to check
   * @returns {number|null} - Timeout days or null if no timeout
   */
  getStateTimeout(state) {
    const metadata = this.getStateMetadata(state);
    return metadata ? metadata.timeoutDays : null;
  }

  /**
   * Calculate expiration date for current state
   * @param {string} state - Current state
   * @param {Date} enteredAt - When state was entered
   * @returns {Date|null} - Expiration date or null if no timeout
   */
  calculateExpirationDate(state, enteredAt = new Date()) {
    const timeoutDays = this.getStateTimeout(state);
    if (!timeoutDays) {
      return null;
    }

    const expirationDate = new Date(enteredAt);
    expirationDate.setDate(expirationDate.getDate() + timeoutDays);
    return expirationDate;
  }

  /**
   * Validate state transition with business rules
   * @param {Object} application - Application object
   * @param {string} toState - Target state
   * @param {string} userRole - User performing transition
   * @param {Object} context - Additional context
   * @returns {Object} - Validation result
   */
  validateTransition(application, toState, userRole, context = {}) {
    const fromState = application.status;

    // Check if states exist
    if (!this.STATES[fromState.toUpperCase()] || !this.STATES[toState.toUpperCase()]) {
      return {
        valid: false,
        error: 'INVALID_STATE',
        message: 'Invalid state provided',
      };
    }

    // Check if transition is allowed
    if (!this.isValidTransition(fromState, toState)) {
      return {
        valid: false,
        error: 'INVALID_TRANSITION',
        message: `Cannot transition from ${fromState} to ${toState}`,
      };
    }

    // Check user permissions
    if (!this.canUserTransition(userRole, fromState, toState)) {
      return {
        valid: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: `Role ${userRole} cannot perform this transition`,
      };
    }

    // Business rule validations
    const businessValidation = this._validateBusinessRules(application, toState, context);
    if (!businessValidation.valid) {
      return businessValidation;
    }

    return {
      valid: true,
      message: 'Transition allowed',
    };
  }

  /**
   * Validate business rules for specific transitions
   * @private
   */
  _validateBusinessRules(application, toState, context) {
    switch (toState) {
      case this.STATES.SUBMITTED:
        if (!application.documents || application.documents.length === 0) {
          return {
            valid: false,
            error: 'MISSING_DOCUMENTS',
            message: 'Required documents must be uploaded before submission',
          };
        }
        break;

      case this.STATES.PAYMENT_VERIFIED:
        if (!context.paymentReference) {
          return {
            valid: false,
            error: 'MISSING_PAYMENT_REFERENCE',
            message: 'Payment reference is required',
          };
        }
        break;

      case this.STATES.INSPECTION_COMPLETED:
        if (!context.inspectionReport) {
          return {
            valid: false,
            error: 'MISSING_INSPECTION_REPORT',
            message: 'Inspection report is required',
          };
        }
        break;

      case this.STATES.APPROVED:
        if (!context.approverSignature) {
          return {
            valid: false,
            error: 'MISSING_APPROVER_SIGNATURE',
            message: 'Approver signature is required',
          };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Get all states
   * @returns {Object} - All available states
   */
  getAllStates() {
    return { ...this.STATES };
  }

  /**
   * Get workflow summary for display
   * @returns {Object} - Workflow summary
   */
  getWorkflowSummary() {
    return {
      totalStates: Object.keys(this.STATES).length,
      paymentStates: Object.values(this.STATES).filter(state => this.isPaymentState(state)),
      terminalStates: Object.values(this.STATES).filter(state => this.isTerminalState(state)),
      averageProcessTime: '45-60 days',
      successRate: '85%',
    };
  }
}

module.exports = ApplicationStateMachine;
