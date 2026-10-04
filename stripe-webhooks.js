// Stripe webhook handler for NAVIAR CONSULT
// Processes and verifies Stripe webhook events

const crypto = require('crypto');
const db = require('./db');
const config = require('./config');

class StripeWebhookHandler {
  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
  }

  verifySignature(body, signature) {
    if (!signature) {
      console.warn('[STRIPE] Missing webhook signature');
      return false;
    }

    try {
      // Construct the signed content (timestamp.payload)
      const parts = signature.split(',');
      const timestamp = parts[0].split('=')[1];
      const signedContent = `${timestamp}.${body}`;

      // Create HMAC signature
      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      hmac.update(signedContent);
      const computedSignature = hmac.digest('hex');

      // Compare signatures (use timing-safe comparison)
      const providedSignature = parts[1].split('=')[1];
      return crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(providedSignature)
      );
    } catch (error) {
      console.error('[STRIPE] Webhook verification failed:', error);
      return false;
    }
  }

  async handleInvoicePaymentSucceeded(event) {
    try {
      const { id, customer, amount_paid, invoice, status_transitions } = event.data.object;

      console.log(`[STRIPE] Invoice paid: ${id} from customer ${customer}`);

      // Log webhook event
      await this.logWebhookEvent(event.id, event.type, {
        invoiceId: id,
        customerId: customer,
        amountPaid: amount_paid,
        status: 'success'
      });

      // Update subscription payment status in database if needed
      const subscription = await db.queryOne(
        'SELECT * FROM subscriptions WHERE billing_email = $1 ORDER BY created_at DESC LIMIT 1',
        [customer]
      );

      if (subscription) {
        await db.execute(
          'UPDATE subscriptions SET last_payment_at = NOW() WHERE id = $1',
          [subscription.id]
        );
      }

      return { success: true, processed: true };
    } catch (error) {
      console.error('[STRIPE] Failed to process invoice.payment_succeeded:', error);
      return { success: false, error: error.message };
    }
  }

  async handleInvoicePaymentFailed(event) {
    try {
      const { id, customer, amount_due, attempt_count } = event.data.object;

      console.warn(`[STRIPE] Invoice payment failed: ${id} from customer ${customer}`);

      // Log webhook event
      await this.logWebhookEvent(event.id, event.type, {
        invoiceId: id,
        customerId: customer,
        amountDue: amount_due,
        attemptCount: attempt_count,
        status: 'failed'
      });

      // Alert admin about payment failure
      await this.logPaymentFailure(customer, id, amount_due, attempt_count);

      return { success: true, processed: true };
    } catch (error) {
      console.error('[STRIPE] Failed to process invoice.payment_failed:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCustomerSubscriptionDeleted(event) {
    try {
      const { id, customer, canceled_at } = event.data.object;

      console.log(`[STRIPE] Subscription deleted: ${id} for customer ${customer}`);

      // Log webhook event
      await this.logWebhookEvent(event.id, event.type, {
        subscriptionId: id,
        customerId: customer,
        canceledAt: canceled_at,
        status: 'deleted'
      });

      // Update subscription status in database
      const subscription = await db.queryOne(
        'SELECT * FROM subscriptions WHERE id = $1',
        [id]
      );

      if (subscription) {
        await db.execute(
          'UPDATE subscriptions SET status = $1, cancelled_at = NOW() WHERE id = $2',
          ['cancelled', id]
        );
      }

      return { success: true, processed: true };
    } catch (error) {
      console.error('[STRIPE] Failed to process customer.subscription.deleted:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCustomerSubscriptionUpdated(event) {
    try {
      const { id, customer, plan, status } = event.data.object;

      console.log(`[STRIPE] Subscription updated: ${id} for customer ${customer}`);

      // Log webhook event
      await this.logWebhookEvent(event.id, event.type, {
        subscriptionId: id,
        customerId: customer,
        plan: plan,
        status: status
      });

      // Update subscription in database if status changed
      const subscription = await db.queryOne(
        'SELECT * FROM subscriptions WHERE id = $1',
        [id]
      );

      if (subscription && subscription.status !== status) {
        await db.execute(
          'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2',
          [status, id]
        );
      }

      return { success: true, processed: true };
    } catch (error) {
      console.error('[STRIPE] Failed to process customer.subscription.updated:', error);
      return { success: false, error: error.message };
    }
  }

  async handleChargeSucceeded(event) {
    try {
      const { id, customer, amount, invoice } = event.data.object;

      console.log(`[STRIPE] Charge succeeded: ${id} from customer ${customer}`);

      // Log webhook event
      await this.logWebhookEvent(event.id, event.type, {
        chargeId: id,
        customerId: customer,
        amount: amount,
        invoiceId: invoice
      });

      return { success: true, processed: true };
    } catch (error) {
      console.error('[STRIPE] Failed to process charge.succeeded:', error);
      return { success: false, error: error.message };
    }
  }

  async logWebhookEvent(eventId, eventType, data) {
    try {
      await db.execute(
        `INSERT INTO webhook_events
         (event_id, event_type, data, processed_at)
         VALUES ($1, $2, $3, NOW())`,
        [eventId, eventType, JSON.stringify(data)]
      );
    } catch (error) {
      console.error('[STRIPE] Failed to log webhook event:', error);
    }
  }

  async logPaymentFailure(customerId, invoiceId, amountDue, attemptCount) {
    try {
      await db.execute(
        `INSERT INTO payment_failures
         (customer_id, invoice_id, amount_due, attempt_count, occurred_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [customerId, invoiceId, amountDue, attemptCount]
      );
    } catch (error) {
      console.error('[STRIPE] Failed to log payment failure:', error);
    }
  }

  async processEvent(event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(event);
        case 'invoice.payment_failed':
          return await this.handleInvoicePaymentFailed(event);
        case 'customer.subscription.deleted':
          return await this.handleCustomerSubscriptionDeleted(event);
        case 'customer.subscription.updated':
          return await this.handleCustomerSubscriptionUpdated(event);
        case 'charge.succeeded':
          return await this.handleChargeSucceeded(event);
        default:
          console.log(`[STRIPE] Unhandled event type: ${event.type}`);
          return { success: true, handled: false };
      }
    } catch (error) {
      console.error('[STRIPE] Failed to process event:', error);
      return { success: false, error: error.message };
    }
  }

  async getWebhookStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await db.queryMany(
        `SELECT event_type, COUNT(*) as count FROM webhook_events
         WHERE processed_at >= $1
         GROUP BY event_type`,
        [startDate]
      );

      const failures = await db.queryOne(
        `SELECT COUNT(*) as count FROM payment_failures WHERE occurred_at >= $1`,
        [startDate]
      );

      return {
        success: true,
        stats: {
          period: `Last ${days} days`,
          eventsByType: stats,
          failedPayments: failures.count || 0
        }
      };
    } catch (error) {
      console.error('[STRIPE] Failed to get webhook stats:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StripeWebhookHandler();
