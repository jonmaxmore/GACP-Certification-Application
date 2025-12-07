/**
 * Auditor Service
 * Handles auditor-specific operations and inspection management
 */

// const ApplicationWorkflowService = require('./ApplicationWorkflowService');
const ApplicationRepository = require('../repositories/ApplicationRepository');
const logger = require('../shared/logger');
const { ValidationError, BusinessLogicError } = require('../shared/errors');

class AuditorService {
    constructor() {
        this.applicationService = null; // new ApplicationWorkflowService();
        this.repository = new ApplicationRepository();
    }

    /**
     * Get inspections assigned to an auditor
     * @param {string} auditorId 
     * @param {Object} filters 
     */
    async getAssignedInspections(auditorId, filters = {}) {
        try {
            const query = {
                assignedAuditor: auditorId,
                status: { $in: ['inspection_scheduled', 'inspection_completed'] }
            };

            if (filters.status) {
                query.status = filters.status;
            }

            if (filters.dateRange) {
                query.inspectionScheduled = {
                    $gte: new Date(filters.dateRange.start),
                    $lte: new Date(filters.dateRange.end)
                };
            }

            return await this.repository.findAll(query, { sort: { inspectionScheduled: 1 } });
        } catch (error) {
            logger.error('Error fetching assigned inspections', { auditorId, error: error.message });
            throw error;
        }
    }

    /**
     * Submit inspection results
     * @param {string} auditorId 
     * @param {string} applicationId 
     * @param {Object} results 
     */
    async submitInspectionResults(auditorId, applicationId, results) {
        try {
            // Verify auditor assignment
            const application = await this.repository.findById(applicationId);
            if (!application) {
                throw new ValidationError('Application not found');
            }

            if (application.assignedAuditor.toString() !== auditorId) {
                throw new BusinessLogicError('You are not assigned to this inspection');
            }

            if (application.status !== 'inspection_scheduled') {
                throw new BusinessLogicError('Application is not ready for inspection submission');
            }

            // Delegate to workflow service for processing and state transition
            // return await this.applicationService.processInspectionResults(applicationId, results, auditorId);
            throw new Error('ApplicationWorkflowService is missing');
        } catch (error) {
            logger.error('Error submitting inspection results', { auditorId, applicationId, error: error.message });
            throw error;
        }
    }

    /**
     * Update auditor availability/calendar
     * @param {string} auditorId 
     * @param {Object} availabilityData 
     */
    async updateAvailability(auditorId, availabilityData) {
        // Implementation for managing auditor calendar
        // This would interact with User model or a separate Calendar service
        logger.info('Updating auditor availability', { auditorId });
        return { success: true };
    }
}

module.exports = new AuditorService();
