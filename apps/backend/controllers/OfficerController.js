const Application = require('../models/Application'); // Assuming Model exists
const User = require('../models/User'); // Assuming Model exists
const logger = require('../utils/logger'); // Assuming logger exists

class OfficerController {
    /**
     * Review Documents
     * PATCH /api/v2/officer/applications/:id/review-docs
     */
    async reviewDocs(req, res) {
        try {
            const { id } = req.params;
            const { status, comment } = req.body; // status: 'APPROVED' | 'REJECTED'

            const application = await Application.findOne({ $or: [{ _id: id }, { id: id }] });
            if (!application) {
                return res.status(404).json({ success: false, error: 'Application not found' });
            }

            if (status === 'APPROVED') {
                application.workflowState = 'WAITING_PAYMENT_2';
                application.logs.push({
                    action: 'DOCS_APPROVED',
                    note: comment || 'Documents approved by officer',
                    timestamp: new Date()
                });
            } else if (status === 'REJECTED') {
                application.workflowState = 'DOCS_REJECTED';
                application.officerNote = comment;
                application.logs.push({
                    action: 'DOCS_REJECTED',
                    note: comment,
                    timestamp: new Date()
                });
            } else {
                return res.status(400).json({ success: false, error: 'Invalid status' });
            }

            await application.save();
            res.json({ success: true, data: application });

        } catch (error) {
            logger.error('Review docs error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get Auditors
     * GET /api/v2/officer/auditors
     */
    async getAuditors(req, res) {
        try {
            const auditors = await User.find({ role: 'auditor' })
                .select('id firstName lastName email phoneNumber');

            res.json({ success: true, data: auditors });
        } catch (error) {
            logger.error('Get auditors error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Assign Auditor
     * PATCH /api/v2/officer/applications/:id/assign-auditor
     */
    async assignAuditor(req, res) {
        try {
            const { id } = req.params;
            const { auditorId } = req.body;

            const application = await Application.findOne({ $or: [{ _id: id }, { id: id }] });
            if (!application) {
                return res.status(404).json({ success: false, error: 'Application not found' });
            }

            const auditor = await User.findOne({ $or: [{ _id: auditorId }, { id: auditorId }], role: 'auditor' });
            if (!auditor) {
                return res.status(400).json({ success: false, error: 'Invalid auditor ID' });
            }

            application.auditorId = auditor.id || auditor._id; // Store consistent ID
            application.workflowState = 'AUDIT_IN_PROGRESS';
            application.logs.push({
                action: 'AUDITOR_ASSIGNED',
                note: `Assigned to ${auditor.firstName} ${auditor.lastName}`,
                timestamp: new Date()
            });

            await application.save();
            res.json({ success: true, data: application });

        } catch (error) {
            logger.error('Assign auditor error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new OfficerController();
