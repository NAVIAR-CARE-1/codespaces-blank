// Calendly integration routes for NAVIAR CONSULT
// REST endpoints for advisor scheduling and consultation management

const express = require('express');
const auth = require('./auth');
const utils = require('./utils');
const calendly = require('./calendly');

const router = express.Router();

// Get advisor availability
router.get('/advisors/:id/availability', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid advisor ID' });
    }

    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const result = await calendly.getAdvisorAvailability(id, dateRange);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[CALENDLY] Availability fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Book consultation
router.post('/consultations/book', auth.authenticate, async (req, res) => {
  try {
    const { advisorId, clientId, slotTime, notes = '' } = req.body;

    if (!utils.isValidUUID(advisorId) || !utils.isValidUUID(clientId)) {
      return res.status(400).json({ error: 'Invalid advisor or client ID' });
    }

    if (!slotTime) {
      return res.status(400).json({ error: 'Slot time required' });
    }

    const result = await calendly.bookConsultation(advisorId, clientId, slotTime, notes);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[CALENDLY] Booking error:', error);
    res.status(500).json({ error: 'Failed to book consultation' });
  }
});

// Reschedule consultation
router.patch('/consultations/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { newSlotTime } = req.body;

    if (!newSlotTime) {
      return res.status(400).json({ error: 'New slot time required' });
    }

    const result = await calendly.rescheduleConsultation(id, newSlotTime);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[CALENDLY] Reschedule error:', error);
    res.status(500).json({ error: 'Failed to reschedule consultation' });
  }
});

// Cancel consultation
router.delete('/consultations/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await calendly.cancelConsultation(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[CALENDLY] Cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel consultation' });
  }
});

// Get advisor schedule
router.get('/advisors/:id/schedule', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid advisor ID' });
    }

    const result = await calendly.getAdvisorSchedule(id, month);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[CALENDLY] Schedule fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Get client consultations
router.get('/clients/:id/consultations', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const result = await calendly.getClientConsultations(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[CALENDLY] Client consultations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

// Get advisor statistics
router.get('/advisors/:id/stats', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid advisor ID' });
    }

    const result = await calendly.getAdvisorStats(id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[CALENDLY] Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
