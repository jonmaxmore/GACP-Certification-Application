/**
 * Queue Management Routes
 */

const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticate } = require('../middleware/auth-middleware');
const { checkRole } = require('../middleware/roleCheck-middleware');

// All queue management requires admin role
router.use(authenticate);
router.use(checkRole(['admin']));

/**
 * @route   GET /api/v1/queue/stats
 * @desc    Get queue statistics
 * @access  Private (Admin)
 */
router.get('/stats', queueController.getQueueStats);

/**
 * @route   GET /api/v1/queue/health
 * @desc    Get queue health status
 * @access  Private (Admin)
 */
router.get('/health', queueController.healthCheck);

/**
 * @route   POST /api/v1/queue/clean
 * @desc    Clean old jobs from queues
 * @access  Private (Admin)
 */
router.post('/clean', queueController.cleanOldJobs);

/**
 * @route   POST /api/v1/queue/pause
 * @desc    Pause all queues
 * @access  Private (Admin)
 */
router.post('/pause', queueController.pauseQueues);

/**
 * @route   POST /api/v1/queue/resume
 * @desc    Resume all queues
 * @access  Private (Admin)
 */
router.post('/resume', queueController.resumeQueues);

module.exports = router;
