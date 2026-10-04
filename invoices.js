// Invoice management and PDF generation for NAVIAR CONSULT
// Generates and manages subscription invoices

const db = require('./db');
const payments = require('./payments');

class InvoiceService {
  async createInvoice(subscriptionId, orgId, amount, description = '') {
    try {
      const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await db.execute(
        `INSERT INTO invoices
         (id, subscription_id, org_id, amount, description, status, issued_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [invoiceId, subscriptionId, orgId, amount, description, 'issued']
      );

      console.log(`[INVOICES] Created invoice ${invoiceId}`);

      return {
        success: true,
        invoiceId,
        amount,
        status: 'issued',
        issuedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[INVOICES] Failed to create invoice:', error);
      return { success: false, error: error.message };
    }
  }

  async getInvoice(invoiceId) {
    try {
      const invoice = await db.queryOne(
        'SELECT * FROM invoices WHERE id = $1',
        [invoiceId]
      );

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      // Get subscription details
      const subscription = await db.queryOne(
        'SELECT * FROM subscriptions WHERE id = $1',
        [invoice.subscription_id]
      );

      // Get organization details
      const org = await db.queryOne(
        'SELECT * FROM organizations WHERE id = $1',
        [invoice.org_id]
      );

      return {
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.id.replace('inv_', ''),
          amount: invoice.amount,
          currency: 'NOK',
          status: invoice.status,
          issuedAt: invoice.issued_at,
          dueDate: this.calculateDueDate(invoice.issued_at),
          subscription,
          organization: org,
          description: invoice.description
        }
      };
    } catch (error) {
      console.error('[INVOICES] Failed to get invoice:', error);
      return { success: false, error: error.message };
    }
  }

  async listInvoices(orgId, limit = 20, offset = 0) {
    try {
      const invoices = await db.queryMany(
        `SELECT * FROM invoices WHERE org_id = $1
         ORDER BY issued_at DESC LIMIT $2 OFFSET $3`,
        [orgId, limit, offset]
      );

      const countResult = await db.queryOne(
        'SELECT COUNT(*) as count FROM invoices WHERE org_id = $1',
        [orgId]
      );

      return {
        success: true,
        invoices: invoices.map(inv => ({
          id: inv.id,
          amount: inv.amount,
          status: inv.status,
          issuedAt: inv.issued_at,
          dueDate: this.calculateDueDate(inv.issued_at)
        })),
        total: countResult.count || 0
      };
    } catch (error) {
      console.error('[INVOICES] Failed to list invoices:', error);
      return { success: false, error: error.message };
    }
  }

  async updateInvoiceStatus(invoiceId, status) {
    try {
      const validStatuses = ['issued', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'Invalid status' };
      }

      await db.execute(
        'UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, invoiceId]
      );

      console.log(`[INVOICES] Updated invoice ${invoiceId} status to ${status}`);

      return { success: true, status };
    } catch (error) {
      console.error('[INVOICES] Failed to update invoice:', error);
      return { success: false, error: error.message };
    }
  }

  async markAsPaid(invoiceId, paidAmount = null, paymentDate = null) {
    try {
      const invoice = await db.queryOne(
        'SELECT * FROM invoices WHERE id = $1',
        [invoiceId]
      );

      if (!invoice) {
        return { success: false, error: 'Invoice not found' };
      }

      await db.execute(
        `UPDATE invoices
         SET status = $1, paid_amount = $2, paid_at = $3, updated_at = NOW()
         WHERE id = $4`,
        [
          'paid',
          paidAmount || invoice.amount,
          paymentDate || new Date(),
          invoiceId
        ]
      );

      console.log(`[INVOICES] Marked invoice ${invoiceId} as paid`);

      return {
        success: true,
        invoiceId,
        status: 'paid',
        paidAmount: paidAmount || invoice.amount
      };
    } catch (error) {
      console.error('[INVOICES] Failed to mark as paid:', error);
      return { success: false, error: error.message };
    }
  }

  calculateDueDate(issuedDate, days = 30) {
    const date = new Date(issuedDate);
    date.setDate(date.getDate() + days);
    return date;
  }

  generateInvoiceHTML(invoiceData) {
    const { invoice, subscription, organization } = invoiceData;
    const dueDate = this.calculateDueDate(invoice.issuedAt);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            border-bottom: 2px solid #15803d;
            padding-bottom: 20px;
          }
          .header-left h1 {
            margin: 0;
            color: #15803d;
            font-size: 28px;
          }
          .header-right {
            text-align: right;
          }
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
          }
          .info-block h3 {
            margin: 0 0 8px 0;
            color: #15803d;
            font-size: 12px;
            text-transform: uppercase;
          }
          .info-block p {
            margin: 0;
            font-size: 14px;
          }
          .details-table {
            width: 100%;
            margin: 40px 0;
            border-collapse: collapse;
          }
          .details-table th {
            background: #15803d;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          .details-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .details-table tr:last-child td {
            border-bottom: none;
          }
          .amount {
            text-align: right;
            font-weight: 600;
          }
          .total-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
          }
          .total-box {
            width: 300px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .total-amount {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 700;
            color: #15803d;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #15803d;
          }
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .payment-status {
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .status-paid {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #86efac;
          }
          .status-pending {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <h1>NAVIAR CONSULT</h1>
              <p>Invoice</p>
            </div>
            <div class="header-right">
              <h2>${invoice.invoiceNumber}</h2>
            </div>
          </div>

          <div class="payment-status status-${invoice.status === 'paid' ? 'paid' : 'pending'}">
            Status: ${invoice.status.toUpperCase()}
          </div>

          <div class="invoice-info">
            <div class="info-block">
              <h3>From</h3>
              <p><strong>NAVIAR CONSULT</strong></p>
              <p>Norway</p>
            </div>
            <div class="info-block">
              <h3>Bill To</h3>
              <p><strong>${organization.name}</strong></p>
              <p>${subscription.billing_email}</p>
            </div>
            <div class="info-block">
              <h3>Invoice Details</h3>
              <p><strong>Date:</strong> ${new Date(invoice.issuedAt).toLocaleDateString('nb-NO')}</p>
              <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString('nb-NO')}</p>
              <p><strong>Period:</strong> Monthly</p>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Plan</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>NAVIAR CONSULT Subscription</td>
                <td>${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan</td>
                <td class="amount">${payments.formatPrice(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${payments.formatPrice(invoice.amount)}</span>
              </div>
              <div class="total-row">
                <span>Tax (VAT)</span>
                <span>${payments.formatPrice(0)}</span>
              </div>
              <div class="total-amount">
                <span>Total Due</span>
                <span>${payments.formatPrice(invoice.amount)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for using NAVIAR CONSULT. For questions, contact billing@naviar.no</p>
            <p>Invoice generated on ${new Date().toLocaleDateString('nb-NO')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  async generateInvoicePDF(invoiceId) {
    try {
      const invoiceResult = await this.getInvoice(invoiceId);
      if (!invoiceResult.success) {
        return invoiceResult;
      }

      const html = this.generateInvoiceHTML(invoiceResult.invoice);

      // Note: In production, you would use a PDF library like puppeteer or pdf-lib
      // For now, return the HTML that can be converted to PDF by the client
      return {
        success: true,
        html,
        pdfFileName: `NAVIAR_Invoice_${invoiceId}.pdf`
      };
    } catch (error) {
      console.error('[INVOICES] Failed to generate PDF:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new InvoiceService();
