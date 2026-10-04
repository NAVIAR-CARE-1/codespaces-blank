// Usage monitoring and limits routes for NAVIAR CONSULT
// Provides endpoints for tracking and enforcing subscription limits

const express = require('express');
const auth = require('./auth');
const utils = require('./utils');
const usageLimits = require('./usage-limits');

const router = express.Router();

// Get current usage
router.get('/usage/current', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const usageResult = await usageLimits.getCurrentUsage(orgId);
    if (!usageResult.success) {
      return res.status(400).json({ error: usageResult.error });
    }

    res.json(usageResult.usage);
  } catch (error) {
    console.error('[USAGE] Current usage error:', error);
    res.status(500).json({ error: 'Failed to fetch current usage' });
  }
});

// Get usage warnings
router.get('/usage/warnings', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const warningsResult = await usageLimits.getUsageWarnings(orgId);
    if (!warningsResult.success) {
      return res.status(400).json({ error: warningsResult.error });
    }

    res.json({
      hasWarnings: warningsResult.hasWarnings,
      warnings: warningsResult.warnings,
      usage: warningsResult.usage
    });
  } catch (error) {
    console.error('[USAGE] Warnings error:', error);
    res.status(500).json({ error: 'Failed to fetch usage warnings' });
  }
});

// Check specific limit
router.post('/usage/check-limit', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId, limitType } = req.body;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    if (!limitType) {
      return res.status(400).json({ error: 'Limit type required' });
    }

    const checkResult = await usageLimits.checkLimit(orgId, limitType);
    if (!checkResult.success) {
      return res.status(400).json({ error: checkResult.error });
    }

    res.json({
      allowed: checkResult.allowed,
      limitType: checkResult.limitType,
      current: checkResult.current,
      limit: checkResult.limit,
      plan: checkResult.plan,
      message: checkResult.message,
      usage: checkResult.usage
    });
  } catch (error) {
    console.error('[USAGE] Check limit error:', error);
    res.status(500).json({ error: 'Failed to check limit' });
  }
});

// Get usage violation history
router.get('/usage/history', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId, days = 30 } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const historyResult = await usageLimits.getUsageHistory(orgId, parseInt(days));
    if (!historyResult.success) {
      return res.status(400).json({ error: historyResult.error });
    }

    res.json(historyResult);
  } catch (error) {
    console.error('[USAGE] History error:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

// Get upgrade suggestion
router.get('/usage/upgrade-suggestion', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const suggestionResult = await usageLimits.suggestUpgrade(orgId);
    if (!suggestionResult.success) {
      return res.status(400).json({ error: suggestionResult.error });
    }

    res.json({
      currentPlan: suggestionResult.currentPlan,
      suggestedPlan: suggestionResult.suggestedPlan,
      usage: suggestionResult.usage
    });
  } catch (error) {
    console.error('[USAGE] Suggestion error:', error);
    res.status(500).json({ error: 'Failed to get upgrade suggestion' });
  }
});

// Get comprehensive usage report
router.get('/usage/report', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const usageResult = await usageLimits.getCurrentUsage(orgId);
    const warningsResult = await usageLimits.getUsageWarnings(orgId);
    const historyResult = await usageLimits.getUsageHistory(orgId, 30);
    const suggestionResult = await usageLimits.suggestUpgrade(orgId);

    if (!usageResult.success) {
      return res.status(400).json({ error: usageResult.error });
    }

    res.json({
      usage: usageResult.usage,
      warnings: warningsResult.warnings || [],
      violationHistory: historyResult.violations || [],
      upgradeOption: suggestionResult.suggestedPlan,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[USAGE] Report error:', error);
    res.status(500).json({ error: 'Failed to generate usage report' });
  }
});

module.exports = router;
