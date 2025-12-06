const ApplicationWorkflowService = require('../services/ApplicationWorkflowService');
const User = require('../models/UserModel');
const Application = require('../models/ApplicationModel');
const logger = require('../shared/logger');

class OfficerController {
    /**
     * Review Documents
     * PATCH /api/v2/officer/applications/:id/review-docs
     */
    async reviewDocs(req, res) {
        try {
            const { id } = req.params;
            const { status, comment } = req.body; // status: 'approved' | 'rejected' (lowercase from frontend)
            const officerId = req.user ? req.user.id : null;

            if (status === 'approved') {
                // Move to inspection_scheduled? Or keep in under_review?
                // For simplified flow: Approve Docs -> Ready for Inspection.
                // Using 'inspection_scheduled' as the state for "Waiting for Audit/Inspection"
                await ApplicationWorkflowService.updateApplicationStatus(
                    id,
                    'inspection_scheduled',
                    comment || 'Documents approved by officer',
                    officerId
                );

                // We might also want to mark specific documents as verified?
                // Keeping it simple as per "Golden Loop".
            } else if (status === 'rejected') {
                // Return to revision_required or rejected?
                // If doc issues, usually revision_required.
                await ApplicationWorkflowService.updateApplicationStatus(
                    id,
                    'revision_required',
                    comment || 'Please revise documents',
                    officerId
                );
            } else {
                return res.status(400).json({ success: false, error: 'Invalid status' });
            }

            const application = await ApplicationWorkflowService.getApplicationById(id);
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
            const officerId = req.user ? req.user.id : null;

            const application = await Application.findOne({ $or: [{ _id: id }, { id: id }] });
            if (!application) {
                return res.status(404).json({ success: false, error: 'Application not found' });
            }

            // Validate Auditor
            const auditor = await User.findOne({ $or: [{ _id: auditorId }, { id: auditorId }], role: 'auditor' });
            if (!auditor) {
                return res.status(400).json({ success: false, error: 'Invalid auditor ID' });
            }

            // Update V2 Schema Fields
            // Use 'inspection.inspectorId'
            if (!application.inspection) application.inspection = {};
            application.inspection.inspectorId = auditor.id || auditor._id;

            // Log history
            await ApplicationWorkflowService.updateApplicationStatus(
                id,
                'inspection_scheduled', // Re-affirm status or move to next?
                `Auditor assigned: ${auditor.firstName} ${auditor.lastName}`,
                officerId
            );

            // Need to save the inspectorId explicitly if updateStatus didn't (it accepts notes but not arbitrary fields)
            // ApplicationWorkflowService.updateApplicationStatus saves the doc, but we modified execution flow.
            // Let's modify app then use service for status update.
            await application.save();

            res.json({ success: true, data: application });

        } catch (error) {
            logger.error('Assign auditor error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new OfficerController();
