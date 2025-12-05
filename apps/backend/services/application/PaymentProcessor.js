const { ValidationError, BusinessLogicError } = require('../../shared/errors');
const logger = require('../../shared/logger');

class PaymentProcessor {
    /**
     * Calculate fees for application phases
     * @param {Object} application - Application object (modified in place)
     */
    calculateFees(application) {
        // Fee calculation for 5-Stage Workflow
        const phase1Fee = 5000; // Application Fee
        const phase2Fee = 30000; // Inspection & Certification Fee

        // Initialize payment structures if they don't exist
        if (!application.payment) application.payment = {};

        application.payment.phase1 = {
            amount: phase1Fee,
            currency: 'THB',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days to pay
        };

        application.payment.phase2 = {
            amount: phase2Fee,
            currency: 'THB',
            status: 'pending',
            dueDate: null // Will be set when Phase 1 is approved
        };
    }

    /**
     * Process payment for a specific phase
     * @param {Object} repository - Application repository instance
     * @param {string} applicationId - Application ID
     * @param {string} phase - 'phase1' or 'phase2'
     * @param {Object} paymentDetails - Payment transaction details
     * @returns {Object} Updated application
     */
    async processPayment(repository, applicationId, phase, paymentDetails) {
        const session = await repository.startSession();
        session.startTransaction();

        try {
            const application = await repository.findById(applicationId);
            if (!application) {
                throw new ValidationError('Application not found');
            }

            if (!['phase1', 'phase2'].includes(phase)) {
                throw new ValidationError('Invalid payment phase');
            }

            if (application.payment && application.payment[phase].status === 'completed') {
                throw new BusinessLogicError(`Payment for ${phase} is already completed`);
            }

            // In a real system, verify with payment gateway here
            // For now, assume payment is successful if details are provided

            application.payment[phase].status = 'completed';
            application.payment[phase].paidAt = new Date();
            application.payment[phase].transactionId = paymentDetails.transactionId || `TXN-${Date.now()}`;
            application.payment[phase].method = paymentDetails.method || 'QR_CODE';

            await repository.save(application);

            logger.info(`Payment processed for application ${applicationId} phase ${phase}`, {
                transactionId: application.payment[phase].transactionId
            });

            await session.commitTransaction();
            return application;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

module.exports = new PaymentProcessor();
