// Visma integration for NAVIAR CONSULT
// Norwegian accounting and payroll system integration

const config = require('./config');
const db = require('./db');

class Visma {
  constructor() {
    this.apiKey = process.env.VISMA_API_KEY || 'test_visma_key';
    this.baseUrl = process.env.VISMA_BASE_URL || 'https://api.visma.com/eaccounting';
    this.enabled = process.env.ENABLE_VISMA !== 'false';
  }

  async syncPayroll(employeeId, payrollData) {
    try {
      const {
        salaryAmount,
        bonusAmount,
        deductions = [],
        taxRate,
        payPeriodStart,
        payPeriodEnd,
        paymentDate
      } = payrollData;

      if (!salaryAmount || !payPeriodStart || !paymentDate) {
        return { success: false, error: 'Salary amount, pay period, and payment date required' };
      }

      if (this.enabled) {
        // In production: POST /payroll to Visma API
        // Requires: salaryAmount, bonusAmount, deductions, taxRate, payPeriodStart, payPeriodEnd, paymentDate
      }

      const payrollId = `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const netAmount = salaryAmount + (bonusAmount || 0) - deductions.reduce((sum, d) => sum + d.amount, 0);

      await db.execute(
        `INSERT INTO payroll_records
         (id, employee_id, salary_amount, bonus_amount, deductions, tax_rate, net_amount, pay_period_start, pay_period_end, payment_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [payrollId, employeeId, salaryAmount, bonusAmount, JSON.stringify(deductions), taxRate, netAmount, payPeriodStart, payPeriodEnd, paymentDate, 'processed']
      );

      console.log(`[VISMA] Synced payroll for ${employeeId}`);

      return {
        success: true,
        payrollId,
        employeeId,
        salaryAmount,
        netAmount,
        paymentDate,
        status: 'processed'
      };
    } catch (error) {
      console.error('[VISMA] Failed to sync payroll:', error);
      return { success: false, error: error.message };
    }
  }

  async getPayrollHistory(employeeId, months = 12) {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const records = await db.queryMany(
        `SELECT * FROM payroll_records
         WHERE employee_id = $1 AND payment_date >= $2
         ORDER BY payment_date DESC`,
        [employeeId, startDate]
      );

      return {
        success: true,
        employeeId,
        period: `Last ${months} months`,
        records: records.map(r => ({
          payrollId: r.id,
          salaryAmount: r.salary_amount,
          bonusAmount: r.bonus_amount,
          deductions: JSON.parse(r.deductions),
          netAmount: r.net_amount,
          paymentDate: r.payment_date,
          status: r.status
        }))
      };
    } catch (error) {
      console.error('[VISMA] Failed to get payroll history:', error);
      return { success: false, error: error.message };
    }
  }

  async createInvoice(organizationId, invoiceData) {
    try {
      const {
        invoiceNumber,
        clientId,
        invoiceDate,
        dueDate,
        amount,
        currency = 'NOK',
        description,
        lineItems = []
      } = invoiceData;

      if (!invoiceNumber || !clientId || !amount || !dueDate) {
        return { success: false, error: 'Invoice number, client, amount, and due date required' };
      }

      if (this.enabled) {
        // In production: POST /invoices to Visma API
        // Requires: invoiceNumber, clientId, amount, currency, lineItems
      }

      const vismaInvoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(
        `INSERT INTO visma_invoices
         (id, org_id, invoice_number, client_id, invoice_date, due_date, amount, currency, description, line_items, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [vismaInvoiceId, organizationId, invoiceNumber, clientId, invoiceDate || new Date(), dueDate, amount, currency, description, JSON.stringify(lineItems), 'issued']
      );

      console.log(`[VISMA] Created invoice ${vismaInvoiceId}`);

      return {
        success: true,
        invoiceId: vismaInvoiceId,
        invoiceNumber,
        amount,
        dueDate,
        status: 'issued'
      };
    } catch (error) {
      console.error('[VISMA] Failed to create invoice:', error);
      return { success: false, error: error.message };
    }
  }

  async getInvoiceStatus(invoiceId) {
    try {
      const invoice = await db.queryOne(
        'SELECT * FROM visma_invoices WHERE id = $1',
        [invoiceId]
      );

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      return {
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          invoiceDate: invoice.invoice_date,
          dueDate: invoice.due_date,
          lineItems: invoice.line_items ? JSON.parse(invoice.line_items) : [],
          createdAt: invoice.created_at
        }
      };
    } catch (error) {
      console.error('[VISMA] Failed to get invoice status:', error);
      return { success: false, error: error.message };
    }
  }

  async syncExpense(organizationId, expenseData) {
    try {
      const {
        expenseType,
        amount,
        currency = 'NOK',
        date,
        description,
        vendor,
        costCenter,
        projectId,
        receipt = null
      } = expenseData;

      if (!expenseType || !amount || !date) {
        return { success: false, error: 'Expense type, amount, and date required' };
      }

      if (this.enabled) {
        // In production: POST /expenses to Visma API
        // Requires: expenseType, amount, date, description, vendor, costCenter
      }

      const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(
        `INSERT INTO expense_reports
         (id, org_id, expense_type, amount, currency, date, description, vendor, cost_center, project_id, receipt_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [expenseId, organizationId, expenseType, amount, currency, date, description, vendor, costCenter, projectId, receipt, 'submitted']
      );

      console.log(`[VISMA] Synced expense ${expenseId}`);

      return {
        success: true,
        expenseId,
        amount,
        currency,
        date,
        status: 'submitted'
      };
    } catch (error) {
      console.error('[VISMA] Failed to sync expense:', error);
      return { success: false, error: error.message };
    }
  }

  async getAccountChart(organizationId) {
    try {
      const accounts = await db.queryMany(
        `SELECT * FROM chart_of_accounts
         WHERE org_id = $1
         ORDER BY account_number`,
        [organizationId]
      );

      return {
        success: true,
        organizationId,
        accounts: accounts.map(a => ({
          accountNumber: a.account_number,
          accountName: a.account_name,
          accountType: a.account_type,
          status: a.status,
          balance: a.balance
        }))
      };
    } catch (error) {
      console.error('[VISMA] Failed to get account chart:', error);
      return { success: false, error: error.message };
    }
  }

  async generateFinancialReport(organizationId, reportType, startDate, endDate) {
    try {
      const validTypes = ['income_statement', 'balance_sheet', 'cash_flow', 'trial_balance'];
      if (!validTypes.includes(reportType)) {
        return { success: false, error: 'Invalid report type' };
      }

      if (this.enabled) {
        // In production: GET /reports/{reportType} from Visma API
        // Filter by startDate and endDate
      }

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(
        `INSERT INTO financial_reports
         (id, org_id, report_type, start_date, end_date, status, generated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [reportId, organizationId, reportType, startDate, endDate, 'generated']
      );

      console.log(`[VISMA] Generated ${reportType} report ${reportId}`);

      return {
        success: true,
        reportId,
        reportType,
        periodStart: startDate,
        periodEnd: endDate,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[VISMA] Failed to generate report:', error);
      return { success: false, error: error.message };
    }
  }

  async getTaxCompliance(organizationId) {
    try {
      const compliance = await db.queryOne(
        `SELECT * FROM tax_compliance
         WHERE org_id = $1
         ORDER BY created_at DESC LIMIT 1`,
        [organizationId]
      );

      if (!compliance) {
        return { success: true, compliance: null };
      }

      return {
        success: true,
        compliance: {
          organizationId,
          vatNumber: compliance.vat_number,
          taxYear: compliance.tax_year,
          status: compliance.status,
          lastReportDate: compliance.last_report_date,
          nextDueDate: compliance.next_due_date,
          filedReturns: compliance.filed_returns ? JSON.parse(compliance.filed_returns) : []
        }
      };
    } catch (error) {
      console.error('[VISMA] Failed to get tax compliance:', error);
      return { success: false, error: error.message };
    }
  }

  async getSyncStatus() {
    try {
      const lastSync = await db.queryOne(
        'SELECT * FROM visma_syncs ORDER BY synced_at DESC LIMIT 1'
      );

      const stats = await db.queryOne(
        `SELECT
          COUNT(*) as total_syncs,
          COUNT(CASE WHEN status = 'synced' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
         FROM visma_syncs`
      );

      return {
        success: true,
        lastSync: lastSync ? lastSync.synced_at : null,
        stats: {
          totalSyncs: stats.total_syncs || 0,
          successful: stats.successful || 0,
          failed: stats.failed || 0
        }
      };
    } catch (error) {
      console.error('[VISMA] Failed to get sync status:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new Visma();
