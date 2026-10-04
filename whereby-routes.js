// Whereby integration routes for NAVIAR CONSULT
// REST endpoints for video consultation management

const express = require('express');
const auth = require('./auth');
const utils = require('./utils');
const whereby = require('./whereby');

const router = express.Router();

// Create meeting room
router.post('/meetings/create', auth.authenticate, async (req, res) => {
  try {
    const { consultationId, advisorId, clientId, roomName, duration, recordingEnabled } = req.body;

    if (!utils.isValidUUID(consultationId) || !utils.isValidUUID(advisorId) || !utils.isValidUUID(clientId)) {
      return res.status(400).json({ error: 'Invalid consultation, advisor, or client ID' });
    }

    const options = {};
    if (roomName) options.roomName = roomName;
    if (duration) options.duration = duration;
    if (recordingEnabled !== undefined) options.recordingEnabled = recordingEnabled;

    const result = await whereby.createMeetingRoom(consultationId, advisorId, clientId, options);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[WHEREBY] Room creation error:', error);
    res.status(500).json({ error: 'Failed to create meeting room' });
  }
});

// Start meeting
router.post('/meetings/:id/start', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await whereby.startMeeting(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[WHEREBY] Meeting start error:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
});

// End meeting
router.post('/meetings/:id/end', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await whereby.endMeeting(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[WHEREBY] Meeting end error:', error);
    res.status(500).json({ error: 'Failed to end meeting' });
  }
});

// Get meeting details
router.get('/meetings/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await whereby.getMeetingDetails(id);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[WHEREBY] Meeting details fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch meeting details' });
  }
});

// Get recordings
router.get('/meetings/:id/recordings', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await whereby.getRecordings(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[WHEREBY] Recordings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

// Store recording
router.post('/meetings/:id/recordings', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { recordingUrl, duration, fileSize } = req.body;

    if (!recordingUrl) {
      return res.status(400).json({ error: 'Recording URL required' });
    }

    const result = await whereby.storeRecording(id, recordingUrl, duration, fileSize);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[WHEREBY] Recording storage error:', error);
    res.status(500).json({ error: 'Failed to store recording' });
  }
});

// Generate access token
router.post('/meetings/:id/access-token', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role = 'participant' } = req.body;

    if (!utils.isValidUUID(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await whereby.generateAccessToken(id, userId, role);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[WHEREBY] Access token generation error:', error);
    res.status(500).json({ error: 'Failed to generate access token' });
  }
});

// Verify access token
router.post('/meetings/:id/verify-token', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const result = await whereby.verifyAccessToken(token, id);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[WHEREBY] Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// Get meeting statistics
router.get('/consultations/:id/meeting-stats', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid consultation ID' });
    }

    const result = await whereby.getMeetingStats(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[WHEREBY] Meeting stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch meeting statistics' });
  }
});

module.exports = router;
