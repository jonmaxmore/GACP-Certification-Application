/**
 * JobAssignmentController
 * Handles API requests for job assignment
 */

const { handleAsync } = require('../middleware/error-handler-middleware');
const JobAssignmentService = require('../services/job-assignment');
const JobAssignmentRepository = require('../repositories/JobAssignmentRepository');
const UserRepository = require('../repositories/UserRepository');
const { validateRequest } = require('../middleware/validation-middleware');
const Joi = require('joi');

// Initialize services
// Note: In a real app, these should be injected or singletons
const db = require('mongoose').connection; // Assuming mongoose connection is available globally or via module
const assignmentRepo = new JobAssignmentRepository(db);
const userRepo = new UserRepository();
const jobAssignmentService = new JobAssignmentService(assignmentRepo, userRepo, null); // KPI service optional for now

const assignJobSchema = Joi.object({
    applicationId: Joi.string().required(),
    auditorId: Joi.string().required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
});

const JobAssignmentController = {
    /**
     * Get unassigned jobs (Officer only)
     */
    getUnassignedJobs: handleAsync(async (req, res) => {
        const jobs = await jobAssignmentService.getUnassignedJobs(req.query);
        res.json({
            success: true,
            data: jobs,
        });
    }),

    /**
     * Assign job to auditor (Officer only)
     */
    assignJob: [
        validateRequest(assignJobSchema),
        handleAsync(async (req, res) => {
            const { applicationId, auditorId, priority } = req.body;
            const officerId = req.user.id;

            const assignment = await jobAssignmentService.assignJobToAuditor(
                applicationId,
                auditorId,
                officerId,
                priority
            );

            res.json({
                success: true,
                message: 'Job assigned successfully',
                data: assignment,
            });
        }),
    ],

    /**
     * Get my assignments (Auditor)
     */
    getMyAssignments: handleAsync(async (req, res) => {
        const assignments = await jobAssignmentService.getUserAssignments(req.user.id, req.query);
        res.json({
            success: true,
            data: assignments,
        });
    }),

    /**
     * Accept assignment (Auditor)
     */
    acceptAssignment: handleAsync(async (req, res) => {
        const { id } = req.params;
        const assignment = await jobAssignmentService.acceptAssignment(id, req.user.id);
        res.json({
            success: true,
            message: 'Assignment accepted',
            data: assignment,
        });
    }),

    /**
     * Start assignment (Auditor)
     */
    startAssignment: handleAsync(async (req, res) => {
        const { id } = req.params;
        const assignment = await jobAssignmentService.startAssignment(id, req.user.id);
        res.json({
            success: true,
            message: 'Assignment started',
            data: assignment,
        });
    }),

    /**
     * Complete assignment (Auditor)
     */
    completeAssignment: handleAsync(async (req, res) => {
        const { id } = req.params;
        const assignment = await jobAssignmentService.completeAssignment(id, req.user.id, req.body);
        res.json({
            success: true,
            message: 'Assignment completed',
            data: assignment,
        });
    }),
};

module.exports = JobAssignmentController;
