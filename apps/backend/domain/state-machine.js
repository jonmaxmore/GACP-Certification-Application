
/**
 * Application State Machine
 * Defines valid state transitions for the application workflow
 */
class ApplicationStateMachine {
    constructor() {
        this.transitions = {
            draft: ['submitted', 'deleted'],
            submitted: ['under_review', 'rejected', 'draft'],
            under_review: ['revision_required', 'payment_pending', 'rejected', 'approved'],
            revision_required: ['submitted', 'draft'],
            payment_pending: ['payment_verified', 'rejected', 'expired'],
            payment_verified: ['inspection_scheduled', 'rejected'],
            inspection_scheduled: ['inspection_completed', 'rejected'],
            inspection_completed: ['phase2_payment_pending', 'revision_required', 'rejected', 'approved'],
            phase2_payment_pending: ['phase2_payment_verified', 'rejected', 'expired'],
            phase2_payment_verified: ['certificate_issued', 'approved', 'rejected'],
            approved: ['certificate_issued', 'expired'],
            certificate_issued: ['expired', 'revoked'],
            rejected: ['draft'], // Allow restart?
            expired: ['draft'], // Allow restart?
            revoked: ['draft'],
            deleted: []
        };
    }

    /**
     * Check if a transition is valid
     * @param {string} fromState Current state
     * @param {string} toState Target state
     * @returns {boolean} True if transition is valid
     */
    isValidTransition(fromState, toState) {
        // Allow staying in same state (updates)
        if (fromState === toState) return true;

        // Allow admin override or force updates (simplified for now)
        // In a real system, we might want stricter rules

        // Check defined transitions
        const validNextStates = this.transitions[fromState] || [];

        // For testing/debugging, we might want to be permissive if state is unknown
        if (!this.transitions[fromState]) return true;

        return validNextStates.includes(toState);
    }

    /**
     * Get allowed next states
     * @param {string} currentState 
     * @returns {string[]} List of valid next states
     */
    getNextStates(currentState) {
        return this.transitions[currentState] || [];
    }
}

module.exports = ApplicationStateMachine;

