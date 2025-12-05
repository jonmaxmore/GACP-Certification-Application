/**
 * ComplianceController.js
 * Controller for GACP Mandatory Reporting
 */

const ComplianceService = require('../../domain/services/ComplianceService');

class ComplianceController {

    async submitReport(req, res) {
        try {
            const report = await ComplianceService.submitReport(req.body, req.user.id);
            res.status(201).json({ success: true, data: report });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getMyReports(req, res) {
        try {
            const reports = await ComplianceService.getReports(req.user.id);
            res.json({ success: true, data: reports });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async acknowledgeReport(req, res) {
        try {
            if (!['dtam_officer', 'admin'].includes(req.user.role)) {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }
            const { comments } = req.body;
            const report = await ComplianceService.acknowledgeReport(req.params.id, req.user.id, comments);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ComplianceController();
