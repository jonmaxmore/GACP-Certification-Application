/**
 * Field Audit Service
 * Business logic for field audit operations
 * Based on field_audit_system_design.md
 */

const FieldAudit = require('../models-mongoose-legacy/FieldAudit-model');
const AuditChecklistTemplate = require('../models-mongoose-legacy/AuditChecklistTemplate-model');
const Application = require('../models-mongoose-legacy/application-model');
const ZoomService = require('./integrations/ZoomService');
const { createLogger } = require('../shared/logger');
const logger = createLogger('field-audit-service');

class FieldAuditService {
    /**
     * Create a new field audit for an application
     */
    async createAudit(data) {
        const {
            applicationId,
            templateType = 'FULL',
            auditType = 'INITIAL',
            auditMode = 'ONSITE',
            auditorId,
            scheduledDate,
            scheduledTime,
            createdBy,
        } = data;

        // Get application
        const application = await Application.findById(applicationId);
        if (!application) {
            throw new Error('Application not found');
        }

        // Check 3-strikes
        const strikesInfo = await FieldAudit.checkThreeStrikes(applicationId);
        if (strikesInfo.isThreeStrikes) {
            throw new Error('APPLICATION_CANCELLED_3_STRIKES');
        }

        // Get active checklist template
        const template = await AuditChecklistTemplate.getActiveTemplate(templateType);
        if (!template) {
            throw new Error('No active checklist template found');
        }

        // Generate audit number
        const auditNumber = await FieldAudit.generateAuditNumber();

        // Create online session if audit mode is ONLINE
        let onlineSession = null;
        if (auditMode === 'ONLINE' || auditMode === 'HYBRID') {
            try {
                const meeting = await ZoomService.createMeetingOrMock({
                    auditNumber,
                    farmerName: `${application.firstName} ${application.lastName}`,
                    scheduledDate,
                    scheduledTime,
                });
                onlineSession = {
                    provider: meeting.isMock ? 'GOOGLE_MEET' : 'ZOOM',
                    meetingId: meeting.meetingId,
                    meetingUrl: meeting.meetingUrl,
                    hostUrl: meeting.startUrl,
                    password: meeting.password,
                };
                logger.info(`Meeting created for audit ${auditNumber}: ${meeting.meetingUrl}`);
            } catch (error) {
                logger.warn('Failed to create meeting, audit will be created without link:', error.message);
            }
        }

        // Create audit
        const audit = new FieldAudit({
            applicationId,
            applicationNumber: application.applicationNumber,
            auditNumber,
            auditType,
            auditMode,
            templateId: template._id,
            templateCode: template.templateCode,
            farmerId: application.userId,
            farmerName: `${application.firstName} ${application.lastName}`,
            auditorId,
            scheduledDate,
            scheduledTime,
            attemptNumber: strikesInfo.failedAttempts + 1,
            status: 'SCHEDULED',
            createdBy,
            onlineSession,
            // Initialize empty responses from template
            responses: this._initializeResponses(template),
        });

        await audit.save();

        logger.info(`Field Audit created: ${auditNumber} for ${application.applicationNumber}`);

        return {
            audit,
            strikesInfo,
            template: {
                templateCode: template.templateCode,
                name: template.nameTh,
                totalItems: template.totalItems,
            },
            onlineSession,
        };
    }

    /**
     * Initialize responses from template
     */
    _initializeResponses(template) {
        const responses = [];

        template.categories.forEach(category => {
            category.items.forEach(item => {
                responses.push({
                    itemCode: item.itemCode,
                    category: category.categoryCode,
                    response: 'PENDING',
                });
            });
        });

        return responses;
    }

    /**
     * Get audit by ID
     */
    async getAuditById(auditId) {
        const audit = await FieldAudit.findById(auditId)
            .populate('templateId', 'templateCode nameTh categories')
            .populate('auditorId', 'firstName lastName email')
            .populate('farmerId', 'firstName lastName email phone');

        if (!audit) {
            throw new Error('Audit not found');
        }

        return audit;
    }

    /**
     * Get audits by application
     */
    async getAuditsByApplication(applicationId) {
        const audits = await FieldAudit.find({ applicationId })
            .sort({ createdAt: -1 })
            .select('-responses');

        const strikesInfo = await FieldAudit.checkThreeStrikes(applicationId);

        return {
            audits,
            strikesInfo,
        };
    }

    /**
     * Get audits for auditor (today's schedule)
     */
    async getAuditorSchedule(auditorId, date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const audits = await FieldAudit.find({
            auditorId,
            scheduledDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            status: { $nin: ['CANCELLED', 'REPORT_APPROVED'] },
        })
            .populate('farmerId', 'firstName lastName phone')
            .sort({ scheduledDate: 1 });

        return audits;
    }

    /**
     * Start audit (check-in)
     */
    async startAudit(auditId, auditorId, location) {
        const audit = await FieldAudit.findById(auditId);

        if (!audit) {
            throw new Error('Audit not found');
        }

        if (audit.auditorId.toString() !== auditorId.toString()) {
            throw new Error('Not authorized to start this audit');
        }

        if (audit.status !== 'SCHEDULED' && audit.status !== 'CONFIRMED') {
            throw new Error('Audit cannot be started in current status');
        }

        audit.status = 'IN_PROGRESS';
        audit.actualStartTime = new Date();
        audit.checkInLocation = {
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy,
            timestamp: new Date(),
        };

        await audit.save();

        logger.info(`Audit started: ${audit.auditNumber}`);

        return audit;
    }

    /**
     * Submit audit response
     */
    async submitResponse(auditId, auditorId, itemCode, responseData) {
        const audit = await FieldAudit.findById(auditId);

        if (!audit) {
            throw new Error('Audit not found');
        }

        if (audit.auditorId.toString() !== auditorId.toString()) {
            throw new Error('Not authorized');
        }

        if (audit.status !== 'IN_PROGRESS') {
            throw new Error('Audit is not in progress');
        }

        // Find and update response
        const responseIndex = audit.responses.findIndex(r => r.itemCode === itemCode);
        if (responseIndex === -1) {
            throw new Error('Item not found in audit');
        }

        audit.responses[responseIndex] = {
            ...audit.responses[responseIndex].toObject(),
            ...responseData,
            respondedAt: new Date(),
        };

        await audit.save();

        return audit.responses[responseIndex];
    }

    /**
     * Submit all responses (batch)
     */
    async submitAllResponses(auditId, auditorId, responses) {
        const audit = await FieldAudit.findById(auditId);

        if (!audit) {
            throw new Error('Audit not found');
        }

        if (audit.auditorId.toString() !== auditorId.toString()) {
            throw new Error('Not authorized');
        }

        // Update all responses
        responses.forEach(newResponse => {
            const idx = audit.responses.findIndex(r => r.itemCode === newResponse.itemCode);
            if (idx !== -1) {
                audit.responses[idx] = {
                    ...audit.responses[idx].toObject(),
                    ...newResponse,
                    respondedAt: new Date(),
                };
            }
        });

        await audit.save();

        return audit;
    }

    /**
     * Complete audit (check-out)
     */
    async completeAudit(auditId, auditorId, data) {
        const audit = await FieldAudit.findById(auditId);

        if (!audit) {
            throw new Error('Audit not found');
        }

        if (audit.auditorId.toString() !== auditorId.toString()) {
            throw new Error('Not authorized');
        }

        // Validate all responses submitted
        const pendingCount = audit.responses.filter(r => r.response === 'PENDING').length;
        if (pendingCount > 0) {
            throw new Error(`${pendingCount} items still pending`);
        }

        // Calculate score
        audit.calculateScore();

        // Determine result
        audit.determineResult();

        // Set completion data
        audit.status = 'COMPLETED';
        audit.actualEndTime = new Date();

        if (data.location) {
            audit.checkOutLocation = {
                lat: data.location.lat,
                lng: data.location.lng,
                accuracy: data.location.accuracy,
                timestamp: new Date(),
            };
        }

        if (data.auditorNotes) {
            audit.auditorNotes = data.auditorNotes;
        }

        // Signatures
        if (data.farmerSignature) {
            audit.farmerSignature = {
                image: data.farmerSignature,
                signedAt: new Date(),
                signedBy: audit.farmerName,
            };
        }

        if (data.auditorSignature) {
            audit.auditorSignature = {
                image: data.auditorSignature,
                signedAt: new Date(),
                signedBy: audit.auditorName,
            };
        }

        await audit.save();

        // Handle 3-strikes
        if (audit.result === 'MAJOR' || audit.result === 'CRITICAL_FAIL') {
            await this._handleFailedAudit(audit);
        }

        logger.info(`Audit completed: ${audit.auditNumber} - Result: ${audit.result} (${audit.overallScore}%)`);

        return {
            audit,
            result: audit.result,
            score: audit.overallScore,
            categoryScores: audit.categoryScores,
            carRequired: audit.carRequired,
            carDeadline: audit.carDeadline,
        };
    }

    /**
     * Handle failed audit (3-strikes check)
     */
    async _handleFailedAudit(audit) {
        const strikesInfo = await FieldAudit.checkThreeStrikes(audit.applicationId);

        if (strikesInfo.isThreeStrikes) {
            // Cancel application
            await Application.findByIdAndUpdate(audit.applicationId, {
                status: 'APPLICATION_CANCELLED_3_STRIKES',
                cancelledAt: new Date(),
                cancelReason: 'ไม่ผ่านการตรวจประเมิน 3 ครั้ง',
            });

            logger.warn(`Application cancelled (3-strikes): ${audit.applicationNumber}`);

            // TODO: Send notification to farmer
        }

        return strikesInfo;
    }

    /**
     * Get audit statistics for dashboard
     */
    async getAuditStats(filters = {}) {
        const { startDate, endDate, auditorId } = filters;

        const matchStage = {};

        if (startDate && endDate) {
            matchStage.scheduledDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        if (auditorId) {
            matchStage.auditorId = auditorId;
        }

        const stats = await FieldAudit.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $in: ['$status', ['COMPLETED', 'REPORT_APPROVED']] }, 1, 0] }
                    },
                    passed: {
                        $sum: { $cond: [{ $eq: ['$result', 'PASS'] }, 1, 0] }
                    },
                    minor: {
                        $sum: { $cond: [{ $eq: ['$result', 'MINOR'] }, 1, 0] }
                    },
                    major: {
                        $sum: { $cond: [{ $eq: ['$result', 'MAJOR'] }, 1, 0] }
                    },
                    avgScore: { $avg: '$overallScore' },
                },
            },
        ]);

        return stats[0] || {
            total: 0,
            completed: 0,
            passed: 0,
            minor: 0,
            major: 0,
            avgScore: 0,
        };
    }

    /**
     * Sync offline audit data
     */
    async syncOfflineAudit(auditId, offlineData) {
        const audit = await FieldAudit.findById(auditId);

        if (!audit) {
            throw new Error('Audit not found');
        }

        // Merge offline responses
        offlineData.responses.forEach(offlineResponse => {
            const idx = audit.responses.findIndex(r => r.itemCode === offlineResponse.itemCode);
            if (idx !== -1) {
                // Only update if offline response is newer
                const existingTime = audit.responses[idx].respondedAt?.getTime() || 0;
                const offlineTime = new Date(offlineResponse.respondedAt).getTime();

                if (offlineTime > existingTime) {
                    audit.responses[idx] = {
                        ...audit.responses[idx].toObject(),
                        ...offlineResponse,
                    };
                }
            }
        });

        audit.syncedAt = new Date();
        await audit.save();

        logger.info(`Audit synced: ${audit.auditNumber}`);

        return audit;
    }

    // ============ Static Utility Methods (for testing) ============

    /**
     * Calculate category score from responses
     * @param {Array} responses - Array of responses with itemCode and response
     * @returns {number} Score percentage
     */
    static calculateCategoryScore(responses) {
        const validResponses = responses.filter(r => r.response !== 'NA');
        if (validResponses.length === 0) return 0;

        const passCount = validResponses.filter(r => r.response === 'PASS').length;
        return (passCount / validResponses.length) * 100;
    }

    /**
     * Check if score meets passing threshold (90%)
     */
    static isPassingScore(score) {
        return score >= 90;
    }

    /**
     * Count major/critical fails
     */
    static countMajorFails(responses) {
        return responses.filter(r => r.response === 'FAIL' && r.isCritical === true).length;
    }

    /**
     * Check if should auto-cancel (3 strikes rule)
     */
    static shouldAutoCancel(responses) {
        return this.countMajorFails(responses) >= 3;
    }

    /**
     * Generate audit number
     */
    static generateAuditNumber() {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        return `FA-${year}-${random}`;
    }
}

// Export both instance and class
const instance = new FieldAuditService();
instance.calculateCategoryScore = FieldAuditService.calculateCategoryScore;
instance.isPassingScore = FieldAuditService.isPassingScore;
instance.countMajorFails = FieldAuditService.countMajorFails;
instance.shouldAutoCancel = FieldAuditService.shouldAutoCancel;
instance.generateAuditNumber = FieldAuditService.generateAuditNumber;

module.exports = instance;


