/**
 * Notification management routes
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const Notification = require('../models/Notification');
const logger = require('../shared').logger;
const notifLogger = logger.createLogger('notifications');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    notifLogger.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    notification.readAt = new Date();

    const updated = await notification.save();
    res.json(updated);
  } catch (err) {
    notifLogger.error(`Error marking notification ${req.params.id} as read:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.post('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true, readAt: new Date() } },
    );

    res.json({
      success: true,
      count: result.modifiedCount,
    });
  } catch (err) {
    notifLogger.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
