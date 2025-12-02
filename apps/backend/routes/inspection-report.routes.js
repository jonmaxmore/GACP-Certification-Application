const express = require('express');
const router = express.Router();
const InspectionNotificationService = require('../services/inspection-notification.service');

router.post('/inspections/:id/report', async (req, res) => {
  try {
    const { id: inspectionId } = req.params;
    const {
      inspectionType,
      summary,
      strengths,
      weaknesses,
      recommendations,
      checklistItems,
      decision,
      reason,
      snapshotCount,
    } = req.body;

    if (!summary || !decision) {
      return res.status(400).json({ error: 'Summary and decision are required' });
    }

    if (decision === 'reject' && !reason) {
      return res.status(400).json({ error: 'Reason is required for rejection' });
    }

    const report = {
      inspectionId,
      inspectionType,
      summary,
      strengths,
      weaknesses,
      recommendations,
      checklistItems,
      decision,
      reason,
      snapshotCount,
      submittedAt: new Date(),
    };

    // TODO: Save to database and update application status

    // Send notifications
    if (req.app.get('io')) {
      const notificationService = new InspectionNotificationService(req.app.get('io'));
      // TODO: Get farmerId and approverId from database
      // await notificationService.notifyInspectionCompleted(inspectionId, farmerId, decision);
      // if (decision === 'approve') {
      //   await notificationService.notifyApprover(applicationId, approverId);
      // }
    }

    res.json({
      success: true,
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

router.get('/inspections/:id/report', async (req, res) => {
  try {
    const { id: inspectionId } = req.params;

    // TODO: Fetch from database
    res.json({
      success: true,
      report: null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

module.exports = router;
