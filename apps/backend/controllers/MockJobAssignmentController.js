const { handleAsync } = require('../middleware/error-handler-middleware');

class MockJobAssignmentController {
    constructor(mockDb) {
        this.mockDb = mockDb;
    }

    getUnassignedJobs = async (req, res) => {
        try {
            const applications = await this.mockDb.collection('applications');
            // Find applications that don't have an active assignment
            // For simplicity in mock, just return all 'submitted' applications
            // In a real scenario, we'd check if they are already assigned
            const docs = await applications.find({ status: 'submitted' }); // or 'draft' for test
            const results = await docs.toArray();

            // Filter out those that are already assigned
            const assignments = await this.mockDb.collection('job_assignments');
            const assignmentCursor = await assignments.find({});
            const allAssignments = await assignmentCursor.toArray();
            const assignedAppIds = allAssignments.map(a => a.applicationId);

            const unassigned = results.filter(app => !assignedAppIds.includes(app._id));

            res.json({
                success: true,
                data: unassigned,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    assignJob = async (req, res) => {
        try {
            const { applicationId, auditorId } = req.body;
            const assignments = await this.mockDb.collection('job_assignments');

            const newAssignment = {
                applicationId,
                assignedTo: auditorId,
                assignedBy: req.user.id,
                status: 'assigned',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await assignments.insertOne(newAssignment);

            res.json({
                success: true,
                message: 'Job assigned successfully',
                data: { ...newAssignment, _id: result.insertedId },
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    getMyAssignments = async (req, res) => {
        try {
            const assignments = await this.mockDb.collection('job_assignments');
            const docs = await assignments.find({ assignedTo: req.user.id });
            const myAssignments = await docs.toArray();

            // Enrich with application details
            const applications = await this.mockDb.collection('applications');
            const enriched = await Promise.all(myAssignments.map(async (a) => {
                const app = await applications.findOne({ _id: a.applicationId });
                return { ...a, applicationNumber: app ? app.applicationNumber : 'Unknown' };
            }));

            res.json({
                success: true,
                data: enriched,
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    acceptAssignment = async (req, res) => {
        try {
            const { id } = req.params; // Application ID in route, but usually Assignment ID. 
            // The route is /:id/accept. The test passes applicationId.
            // Let's find assignment by ApplicationID for convenience in this mock

            const assignments = await this.mockDb.collection('job_assignments');
            const assignment = await assignments.findOne({ applicationId: id });

            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            await assignments.updateOne({ _id: assignment._id }, { $set: { status: 'accepted', acceptedAt: new Date() } });

            res.json({ success: true, message: 'Assignment accepted' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    startAssignment = async (req, res) => {
        try {
            const { id } = req.params; // Application ID
            const assignments = await this.mockDb.collection('job_assignments');
            const assignment = await assignments.findOne({ applicationId: id });

            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            await assignments.updateOne({ _id: assignment._id }, { $set: { status: 'in_progress', startedAt: new Date() } });

            res.json({ success: true, message: 'Assignment started' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    completeAssignment = async (req, res) => {
        try {
            const { id } = req.params; // Application ID
            const assignments = await this.mockDb.collection('job_assignments');
            const assignment = await assignments.findOne({ applicationId: id });

            if (!assignment) {
                return res.status(404).json({ success: false, message: 'Assignment not found' });
            }

            await assignments.updateOne({ _id: assignment._id }, { $set: { status: 'completed', completedAt: new Date() } });

            res.json({ success: true, message: 'Assignment completed' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}

module.exports = MockJobAssignmentController;
