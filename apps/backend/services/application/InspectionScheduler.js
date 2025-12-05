const { BusinessLogicError } = require('../../shared/errors');
const logger = require('../../shared/logger');
let User;
try {
    User = require('../../models/UserModel');
} catch (error) {
    logger.warn('[InspectionScheduler] User model not available:', error.message);
}

const SystemConfig = require('../../config/SystemConfig');

class InspectionScheduler {
    /**
     * Schedule field inspection
     * @param {Object} repository - Application repository
     * @param {Object} application - Application object
     * @param {string} preferredDate - Preferred inspection date
     * @returns {Object} Inspection details
     */
    async scheduleInspection(repository, application, preferredDate = null) {
        try {
            // 1. Check Phase 2 payment status
            if (application.payment.phase2.status !== 'completed') {
                throw new BusinessLogicError(`Phase 2 inspection fee (${SystemConfig.FEES.PHASE2_INSPECTION} ${SystemConfig.FEES.CURRENCY}) must be paid before auditor assignment`);
            }

            // 2. Find available auditor based on location and expertise
            const availableAuditor = await this.findAvailableAuditor(
                application.farmInformation.location.province,
                application.cropInformation.map(crop => crop.cropType),
            );

            if (!availableAuditor) {
                throw new BusinessLogicError(
                    'No available auditor found for this location and crop type',
                );
            }

            // 2. Calculate inspection date (minimum notice)
            const minDate = new Date(Date.now() + SystemConfig.SCHEDULING.NOTICE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
            const inspectionDate =
                preferredDate && new Date(preferredDate) > minDate ? new Date(preferredDate) : minDate;

            // 3. Update application
            application.assignedAuditor = availableAuditor._id;
            application.inspectionScheduled = inspectionDate;
            await repository.save(application);

            // 4. Block auditor's calendar (Mock implementation)
            // await this.blockAuditorCalendar(availableAuditor._id, inspectionDate);

            logger.info('Inspection scheduled', {
                applicationId: application._id,
                auditorId: availableAuditor._id,
                inspectionDate,
            });

            return {
                auditor: availableAuditor,
                inspectionDate,
                estimatedDuration: this.calculateInspectionDuration(application),
            };
        } catch (error) {
            logger.error('Error scheduling inspection', {
                applicationId: application._id,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Find auditor with appropriate expertise and availability
     */
    async findAvailableAuditor(province, cropTypes) {
        if (!User) return null;

        // Find auditor with appropriate expertise and availability
        const auditors = await User.find({
            role: 'auditor',
            'expertise.provinces': province,
            'expertise.cropTypes': { $in: cropTypes },
            isActive: true,
        }).sort({ 'workload.scheduledInspections': 1 });

        return auditors[0] || null;
    }

    /**
     * Calculate estimated inspection duration
     */
    calculateInspectionDuration(application) {
        // Calculate estimated inspection duration based on farm size and crops
        const baseHours = SystemConfig.SCHEDULING.ESTIMATION.BASE_HOURS;
        const sizeHours = Math.ceil(application.farmInformation.farmSize.totalArea / 5) * SystemConfig.SCHEDULING.ESTIMATION.HOURS_PER_5_AREA_UNIT;
        const cropHours = application.cropInformation.length * SystemConfig.SCHEDULING.ESTIMATION.HOURS_PER_CROP;

        return baseHours + sizeHours + cropHours;
    }

    /**
     * Schedule annual surveillance visits
     */
    async scheduleSurveillance(application) {
        // Placeholder for scheduling surveillance logic
        // const surveillanceDates = [];
        logger.info(`Surveillance scheduled for application ${application._id}`);
    }
}

module.exports = new InspectionScheduler();
