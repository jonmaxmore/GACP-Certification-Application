const express = require('express');
const videoService = require('../services/videoService');

router.post('/inspections/:id/video-room', async (req, res) => {
  try {
    const { id: inspectionId } = req.params;
    const { title } = req.body;

    // Create room using Daily.co Service
    const roomDetails = await videoService.createRoom(inspectionId, title || `Inspection ${inspectionId}`);

    res.json({
      success: true,
      data: roomDetails
    });
  } catch (error) {
    console.error('Error creating video room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create video room',
      details: error.message
    });
  }
});

module.exports = router;
