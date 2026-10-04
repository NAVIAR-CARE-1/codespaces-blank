// Analytics routes for NAVIAR CONSULT
// Provides endpoints for dashboards and reporting

const express = require('express');
const auth = require('./auth');
const utils = require('./utils');
const analytics = require('./analytics');

const router = express.Router();

// Get key metrics
router.get('/analytics/metrics', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.getKeyMetrics(orgId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.metrics);
  } catch (error) {
    console.error('[ANALYTICS] Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get incident trends
router.get('/analytics/trends', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId, days = 30 } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.getIncidentTrends(orgId, parseInt(days));
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      period: result.period,
      trends: result.trends
    });
  } catch (error) {
    console.error('[ANALYTICS] Trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get advisor performance
router.get('/analytics/advisors', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.getAdvisorPerformance(orgId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      advisors: result.advisors
    });
  } catch (error) {
    console.error('[ANALYTICS] Advisors error:', error);
    res.status(500).json({ error: 'Failed to fetch advisor data' });
  }
});

// Get incident distribution
router.get('/analytics/distribution', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.getIncidentDistribution(orgId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.distribution);
  } catch (error) {
    console.error('[ANALYTICS] Distribution error:', error);
    res.status(500).json({ error: 'Failed to fetch distribution data' });
  }
});

// Get employee demographics
router.get('/analytics/employees', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.getEmployeeDemographics(orgId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.demographics);
  } catch (error) {
    console.error('[ANALYTICS] Employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employee data' });
  }
});

// Get case outcomes
router.get('/analytics/outcomes', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.getCaseOutcomes(orgId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      outcomes: result.outcomes
    });
  } catch (error) {
    console.error('[ANALYTICS] Outcomes error:', error);
    res.status(500).json({ error: 'Failed to fetch outcomes' });
  }
});

// Get return to work metrics
router.get('/analytics/return-to-work', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.getReturnToWorkMetrics(orgId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.returnToWork);
  } catch (error) {
    console.error('[ANALYTICS] Return to work error:', error);
    res.status(500).json({ error: 'Failed to fetch return to work metrics' });
  }
});

// Get comprehensive report
router.get('/analytics/report', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const result = await analytics.generateComprehensiveReport(orgId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.report);
  } catch (error) {
    console.error('[ANALYTICS] Report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get dashboard summary (quick overview)
router.get('/analytics/dashboard', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const metrics = await analytics.getKeyMetrics(orgId);
    const trends = await analytics.getIncidentTrends(orgId, 7);
    const performance = await analytics.getAdvisorPerformance(orgId);
    const rtw = await analytics.getReturnToWorkMetrics(orgId);

    if (!metrics.success) {
      return res.status(400).json({ error: 'Failed to fetch dashboard data' });
    }

    res.json({
      timestamp: new Date().toISOString(),
      summary: {
        metrics: metrics.metrics,
        recentTrends: trends.trends.slice(0, 7),
        topAdvisors: performance.advisors.slice(0, 5),
        returnToWorkMetrics: rtw.returnToWork
      }
    });
  } catch (error) {
    console.error('[ANALYTICS] Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

module.exports = router;
