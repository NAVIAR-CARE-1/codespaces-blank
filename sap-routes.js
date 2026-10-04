// SAP SuccessFactors integration routes for NAVIAR CONSULT
// REST endpoints for HR employee data management

const express = require('express');
const auth = require('./auth');
const utils = require('./utils');
const sapSF = require('./sap-successfactors');

const router = express.Router();

// Sync employee data
router.post('/employees/:id/sync', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, department, position, hireDate, salary, workStatus } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const employeeData = { firstName, lastName, email, department, position, hireDate, salary, workStatus };

    const result = await sapSF.syncEmployeeData(id, employeeData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[SAP] Employee sync error:', error);
    res.status(500).json({ error: 'Failed to sync employee data' });
  }
});

// Get employee profile
router.get('/employees/:id/profile', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const result = await sapSF.getEmployeeProfile(id);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[SAP] Employee profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch employee profile' });
  }
});

// Get compensation data
router.get('/employees/:id/compensation', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const result = await sapSF.getCompensationData(id);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[SAP] Compensation fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch compensation data' });
  }
});

// Update compensation
router.patch('/employees/:id/compensation', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { salary, bonus, benefits, stockOptions, pensionContribution } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const compensationData = { salary, bonus, benefits, stockOptions, pensionContribution };

    const result = await sapSF.updateCompensation(id, compensationData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[SAP] Compensation update error:', error);
    res.status(500).json({ error: 'Failed to update compensation' });
  }
});

// Get performance rating
router.get('/employees/:id/performance', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const result = await sapSF.getPerformanceRating(id, year ? parseInt(year) : null);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[SAP] Performance rating fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch performance rating' });
  }
});

// Create performance rating
router.post('/employees/:id/performance', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { overallRating, reviewDate, reviewerId, comments, goals, developmentAreas } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const ratingData = { overallRating, reviewDate, reviewerId, comments, goals, developmentAreas };

    const result = await sapSF.createPerformanceRating(id, ratingData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[SAP] Performance rating creation error:', error);
    res.status(500).json({ error: 'Failed to create performance rating' });
  }
});

// Sync absence data
router.post('/employees/:id/absences', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { absenceType, startDate, endDate, reason, status } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const absenceData = { absenceType, startDate, endDate, reason, status };

    const result = await sapSF.syncAbsenceData(id, absenceData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[SAP] Absence sync error:', error);
    res.status(500).json({ error: 'Failed to sync absence data' });
  }
});

// Get organization chart
router.get('/org-chart', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { departmentId } = req.query;

    const result = await sapSF.getOrgChart(departmentId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[SAP] Org chart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch organization chart' });
  }
});

// Get sync status
router.get('/sap/sync-status', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const result = await sapSF.getSyncStatus();

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[SAP] Sync status fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

module.exports = router;
