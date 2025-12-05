/**
 * ComplianceService.js
 * Service for GACP Mandatory Reporting
 */

const ComplianceReport = require('../models/ComplianceReport');
const Application = require('../../../application/domain/models/Application'); // Assuming Application model is exported here or we use mongoose.model

class ComplianceService {

    async submitReport(data, userId) {
        // Verify License Exists and Belongs to User
        const license = await Application.findOne({
            _id: data.licenseId,
            applicantId: userId,
            status: 'approved'
        });

        if (!license) {
            throw new Error('Valid license not found for this user');
        }

        // Check for duplicate report for same period/type
        const existing = await ComplianceReport.findOne({
            licenseId: data.licenseId,
            reportType: data.reportType,
            'period.month': data.period.month,
            'period.year': data.period.year
        });

        if (existing && existing.status !== 'rejected') {
            throw new Error('Report for this period already exists');
        }

        const report = new ComplianceReport({
            ...data,
            farmerId: userId,
            status: 'submitted',
            submittedAt: new Date()
        });

        return await report.save();
    }

    async getReports(userId, filters = {}) {
        const query = { farmerId: userId, ...filters };
        return await ComplianceReport.find(query).sort({ 'period.year': -1, 'period.month': -1 });
    }

    async acknowledgeReport(reportId, officerId, comments) {
        const report = await ComplianceReport.findById(reportId);
        if (!report) throw new Error('Report not found');

        report.status = 'acknowledged';
        report.acknowledgedAt = new Date();
        report.officerComments = comments;

        return await report.save();
    }
}

module.exports = new ComplianceService();
