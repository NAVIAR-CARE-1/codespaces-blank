// Visma integration routes for NAVIAR CONSULT
// REST endpoints for Norwegian accounting and payroll management

const express = require('express');
const auth = require('./auth');
const utils = require('./utils');
const visma = require('./visma');

const router = express.Router();

// Sync payroll
router.post('/payroll/:employeeId/sync', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { salaryAmount, bonusAmount, deductions, taxRate, payPeriodStart, payPeriodEnd, paymentDate } = req.body;

    if (!utils.isValidUUID(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const payrollData = { salaryAmount, bonusAmount, deductions, taxRate, payPeriodStart, payPeriodEnd, paymentDate };

    const result = await visma.syncPayroll(employeeId, payrollData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[VISMA] Payroll sync error:', error);
    res.status(500).json({ error: 'Failed to sync payroll' });
  }
});

// Get payroll history
router.get('/payroll/:employeeId/history', auth.authenticate, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { months = 12 } = req.query;

    if (!utils.isValidUUID(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const result = await visma.getPayrollHistory(employeeId, parseInt(months));

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[VISMA] Payroll history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch payroll history' });
  }
});

// Create invoice
router.post('/invoices', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.user;
    const org = await require('./db').queryOne('SELECT org_id FROM org_admins WHERE id = $1', [id]);

    const { invoiceNumber, clientId, invoiceDate, dueDate, amount, currency, description, lineItems } = req.body;

    const invoiceData = { invoiceNumber, clientId, invoiceDate, dueDate, amount, currency, description, lineItems };

    const result = await visma.createInvoice(org.org_id, invoiceData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[VISMA] Invoice creation error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Get invoice status
router.get('/invoices/:id/status', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await visma.getInvoiceStatus(id);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[VISMA] Invoice status fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice status' });
  }
});

// Sync expense
router.post('/expenses', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.user;
    const org = await require('./db').queryOne('SELECT org_id FROM org_admins WHERE id = $1', [id]);

    const { expenseType, amount, currency, date, description, vendor, costCenter, projectId, receipt } = req.body;

    const expenseData = { expenseType, amount, currency, date, description, vendor, costCenter, projectId, receipt };

    const result = await visma.syncExpense(org.org_id, expenseData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[VISMA] Expense sync error:', error);
    res.status(500).json({ error: 'Failed to sync expense' });
  }
});

// Get account chart
router.get('/chart-of-accounts', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.user;
    const org = await require('./db').queryOne('SELECT org_id FROM org_admins WHERE id = $1', [id]);

    const result = await visma.getAccountChart(org.org_id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[VISMA] Account chart fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch account chart' });
  }
});

// Generate financial report
router.post('/financial-reports', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.user;
    const org = await require('./db').queryOne('SELECT org_id FROM org_admins WHERE id = $1', [id]);

    const { reportType, startDate, endDate } = req.body;

    const result = await visma.generateFinancialReport(org.org_id, reportType, startDate, endDate);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('[VISMA] Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get tax compliance
router.get('/tax-compliance', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.user;
    const org = await require('./db').queryOne('SELECT org_id FROM org_admins WHERE id = $1', [id]);

    const result = await visma.getTaxCompliance(org.org_id);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[VISMA] Tax compliance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tax compliance' });
  }
});

// Get Visma sync status
router.get('/visma/sync-status', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const result = await visma.getSyncStatus();

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('[VISMA] Sync status fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

module.exports = router;
