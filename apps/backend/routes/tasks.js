/**
 * Task management routes
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const { validateTask } = require('../middleware/validators-middleware');
const Task = require('../models/Task');
const logger = require('../shared').logger;
const taskLogger = logger.createLogger('tasks');

// Get all tasks (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignedTo, createdBy, priority, dueDate } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    if (createdBy) {
      filter.createdBy = createdBy;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (dueDate) {
      filter.dueDate = { $lte: new Date(dueDate) };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    taskLogger.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
router.post('/', [auth, validateTask], async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, location } = req.body;

    const newTask = new Task({
      title,
      description,
      assignedTo,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      location,
      createdBy: req.user.id,
      status: 'pending',
    });

    const task = await newTask.save();

    // Send real-time notification
    const io = req.app.get('io');
    if (io && assignedTo) {
      io.to(`inspector:${assignedTo}`).emit('new-task', {
        taskId: task._id,
        title: task.title,
        timestamp: new Date(),
      });
    }

    res.status(201).json(task);
  } catch (err) {
    taskLogger.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    taskLogger.error(`Error fetching task ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!['pending', 'in-progress', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    if (comment) {
      task.comments = task.comments || [];
      task.comments.push({
        text: comment,
        user: req.user.id,
        createdAt: new Date(),
      });
    }

    const updatedTask = await task.save();

    // Notify task creator
    const io = req.app.get('io');
    if (io && task.createdBy) {
      io.to(`user:${task.createdBy}`).emit('task-updated', {
        taskId: task._id,
        status,
        updatedBy: req.user.id,
        timestamp: new Date(),
      });
    }

    res.json(updatedTask);
  } catch (err) {
    taskLogger.error(`Error updating task status ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
