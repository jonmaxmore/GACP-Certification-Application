/**
 * Inspector-specific routes
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const inspectorAuth = require('../middleware/inspector-auth-middleware');
const Task = require('../models/Task');
const Report = require('../models/Report');
const logger = require('../shared').logger;
const inspectorLogger = logger.createLogger('inspectors');

// Get inspector dashboard data
router.get('/dashboard', [auth, inspectorAuth], async (req, res) => {
  try {
    // Get counts of tasks by status for the inspector
    const taskCounts = await Task.aggregate([
      { $match: { assignedTo: req.user.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Format task counts
    const taskStats = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      rejected: 0,
      total: 0,
    };

    taskCounts.forEach(item => {
      taskStats[item._id] = item.count;
      taskStats.total += item.count;
    });

    // Get upcoming tasks (due in the next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingTasks = await Task.find({
      assignedTo: req.user.id,
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $lte: nextWeek, $gte: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(5);

    // Get latest submitted reports
    const latestReports = await Report.find({
      submittedBy: req.user.id,
    })
      .sort({ submittedAt: -1 })
      .limit(5);

    res.json({
      taskStats,
      upcomingTasks,
      latestReports,
    });
  } catch (err) {
    inspectorLogger.error('Error fetching inspector dashboard data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned tasks
router.get('/tasks', [auth, inspectorAuth], async (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;

    // Build filter
    const filter = { assignedTo: req.user.id };
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }

    // Build sort
    let sort = { dueDate: 1 }; // Default: Sort by due date (earliest first)
    if (sortBy === 'priority') {
      sort = {
        priority: -1, // High priority first
        dueDate: 1,
      };
    } else if (sortBy === 'recent') {
      sort = { createdAt: -1 };
    }

    const tasks = await Task.find(filter).sort(sort);
    res.json(tasks);
  } catch (err) {
    inspectorLogger.error('Error fetching inspector tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit inspection report
router.post('/reports', [auth, inspectorAuth], async (req, res) => {
  try {
    const { taskId, findings, recommendations, compliance, images } = req.body;

    // Verify task exists and is assigned to this inspector
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to submit report for this task' });
    }

    // Create report
    const newReport = new Report({
      task: taskId,
      findings,
      recommendations,
      compliance: compliance || 'compliant',
      images: images || [],
      submittedBy: req.user.id,
      submittedAt: new Date(),
    });

    const report = await newReport.save();

    // Update task status
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    // Send notification
    const io = req.app.get('io');
    if (io && task.createdBy) {
      io.to(`user:${task.createdBy}`).emit('report-submitted', {
        taskId: task._id,
        reportId: report._id,
        submittedBy: req.user.id,
        timestamp: new Date(),
      });
    }

    res.status(201).json(report);
  } catch (err) {
    inspectorLogger.error('Error submitting inspection report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
