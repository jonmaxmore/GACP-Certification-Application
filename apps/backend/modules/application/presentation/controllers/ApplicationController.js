/**
 * ApplicationController.js
 * Controller for GACP Application Workflow
 */

const ApplicationService = require('../../domain/services/ApplicationService');

class ApplicationController {

    async create(req, res) {
        try {
            const application = await ApplicationService.createApplication(req.body, req.user.id);
            res.status(201).json({ success: true, data: application });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const application = await ApplicationService.getApplication(req.params.id);
            if (!application) return res.status(404).json({ success: false, error: 'Not found' });
            res.json({ success: true, data: application });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateSelfAssessment(req, res) {
        try {
            const application = await ApplicationService.updateSelfAssessment(req.params.id, req.body);
            res.json({ success: true, data: application });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async submit(req, res) {
        try {
            const application = await ApplicationService.submitApplication(req.params.id, req.user.id);
            res.json({ success: true, data: application });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async review(req, res) {
        try {
            const { status, comments } = req.body;
            if (!['dtam_officer', 'admin'].includes(req.user.role)) {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }

            const application = await ApplicationService.reviewApplication(req.params.id, req.user.id, status, comments);
            res.json({ success: true, data: application });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // -- Dashboard Endpoints --

    async getDashboard(req, res) {
        try {
            const stats = await ApplicationService.getDashboardStats(req.user.id, req.user.role);
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getMyApplications(req, res) {
        try {
            const applications = await ApplicationService.getFarmerApplications(req.user.id);
            res.json({ success: true, data: applications });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getOfficerQueue(req, res) {
        try {
            if (!['dtam_officer', 'admin'].includes(req.user.role)) {
                return res.status(403).json({ success: false, error: 'Unauthorized' });
            }
            const applications = await ApplicationService.getOfficerQueue();
            res.json({ success: true, data: applications });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ApplicationController();
