/**
 * ApplicationService.js
 * Core service for managing GACP applications
 */

const Application = require('../../../../../models/Application');
const ScoringService = require('./ScoringService');
const LicenseGenerator = require('../../../certificate-management/domain/services/LicenseGenerator');

class ApplicationService {

    async createApplication(data, userId) {
        const application = new Application({
            ...data,
            applicantId: userId,
            status: 'draft',
            history: [{
                status: 'draft',
                changedBy: userId,
                comments: 'Application created'
            }]
        });
        return await application.save();
    }

    async getApplication(id) {
        return await Application.findById(id)
            .populate('applicantId', 'fullName email phone')
            .populate('farmId');
    }

    async updateSelfAssessment(id, assessmentData) {
        const application = await Application.findById(id);
        if (!application) throw new Error('Application not found');

        // Update assessment data
        application.selfAssessment = assessmentData;

        // Calculate score
        const scoreResult = ScoringService.calculateSelfAssessmentScore(assessmentData);
        application.selfAssessment.score = scoreResult.totalScore;
        application.selfAssessment.result = scoreResult.result;

        return await application.save();
    }

    async submitApplication(id, userId) {
        const application = await Application.findById(id);
        if (!application) throw new Error('Application not found');

        if (application.status !== 'draft') {
            throw new Error('Application is not in draft status');
        }

        // Validate required fields (Basic validation)
        if (!application.selfAssessment || !application.documents || application.documents.length === 0) {
            throw new Error('Self-assessment and documents are required');
        }

        // Validate Form Specific Data (Forms 9-11)
        if (application.certificationScope === 'cultivation') {
            // Form 9 Requirement: Security Measures
            if (!application.formSpecificData?.production?.securityMeasures?.fenceDescription) {
                throw new Error('Form 9: Security measures (Fence Description) are required');
            }
        }
        // TODO: Add more specific checks for Form 10/11 based on requestType or purpose

        application.status = 'submitted';
        application.submittedAt = new Date();
        application.history.push({
            status: 'submitted',
            changedBy: userId,
            comments: 'Application submitted for review'
        });

        return await application.save();
    }

    async reviewApplication(id, userId, status, comments) {
        const application = await Application.findById(id);
        if (!application) throw new Error('Application not found');

        // Allowed transitions: submitted -> reviewing, reviewing -> approved/rejected
        application.status = status;
        application.history.push({
            status: status,
            changedBy: userId,
            comments: comments
        });

        // If Approved, Generate License
        if (status === 'approved') {
            // Generate License Number
            const provinceCode = 'CMI'; // TODO: Get from Farm Address
            const runningNo = await Application.countDocuments({ status: 'approved' }) + 1;
            const licenseNo = LicenseGenerator.generateLicenseNumber(provinceCode, runningNo);

            application.licenseNumber = licenseNo;
            application.approvedAt = new Date();

            // TODO: Generate PDF and save URL
            // const pdfBuffer = await LicenseGenerator.generateLicensePDF(application, { ... });
        }

        return await application.save();
    }

    // -- Dashboard Aggregation Methods --

    async getFarmerApplications(userId) {
        return await Application.find({ applicantId: userId })
            .sort({ updatedAt: -1 })
            .select('farmName status submittedAt licenseNumber');
    }

    async getOfficerQueue() {
        return await Application.find({
            status: { $in: ['submitted', 'reviewing'] }
        })
            .populate('applicantId', 'fullName')
            .sort({ submittedAt: 1 });
    }

    async getInspectorQueue(inspectorId) {
        // For Phase 1, return all applications in 'reviewing' status as a simple queue
        // In future, filter by assigned inspector from InspectionSchedule
        return await Application.find({
            status: 'reviewing'
        })
            .populate('applicantId', 'fullName farmName')
            .sort({ submittedAt: 1 });
    }

    async getDashboardStats(userId, role) {
        if (role === 'farmer') {
            const total = await Application.countDocuments({ applicantId: userId });
            const approved = await Application.countDocuments({ applicantId: userId, status: 'approved' });
            const pending = await Application.countDocuments({ applicantId: userId, status: { $in: ['submitted', 'reviewing'] } });
            return { total, approved, pending };
        } else if (role === 'dtam_officer') {
            const pendingReview = await Application.countDocuments({ status: 'submitted' });
            const reviewing = await Application.countDocuments({ status: 'reviewing' });
            const approvedToday = await Application.countDocuments({
                status: 'approved',
                approvedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            });
            return { pendingReview, reviewing, approvedToday };
        }
        return {};
    }
}

module.exports = new ApplicationService();
