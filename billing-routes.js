// Billing and subscription management routes for NAVIAR CONSULT
// Handles payment processing, subscription changes, and invoice management

const express = require('express');
const db = require('./db');
const auth = require('./auth');
const utils = require('./utils');
const payments = require('./payments');
const notifications = require('./notifications');
const stripeWebhooks = require('./stripe-webhooks');
const invoices = require('./invoices');

const router = express.Router();

// Get organization subscription details
router.get('/orgs/:id/subscription', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const subscription = await db.queryOne(
      `SELECT * FROM subscriptions WHERE org_id = $1`,
      [id]
    );

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    const planDetails = payments.getPlan(subscription.plan);
    const usageLimits = payments.getUsageLimits(subscription.plan);
    const billingCycle = payments.getBillingCycleInfo(subscription.created_at, subscription.plan);

    // Get current usage
    const employeeCount = await db.queryOne(
      'SELECT COUNT(*) as count FROM employees WHERE org_id = $1',
      [id]
    );

    const advisorCount = await db.queryOne(
      'SELECT COUNT(*) as count FROM case_assignments WHERE incident_id IN (SELECT id FROM incidents WHERE org_id = $1) GROUP BY advisor_id',
      [id]
    );

    res.json({
      subscription: {
        ...subscription,
        plan: planDetails,
        status: subscription.status,
        nextBillingDate: subscription.next_billing_date,
        cancelledAt: subscription.cancelled_at
      },
      usage: {
        employees: employeeCount.count,
        employeesLimit: usageLimits.maxEmployees,
        advisors: advisorCount?.count || 0,
        advisorsLimit: usageLimits.maxAdvisors
      },
      billingCycle
    });
  } catch (error) {
    console.error('[BILLING] Subscription fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// List available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = Object.entries(payments.getPlans()).map(([key, plan]) => ({
      id: key,
      ...plan,
      priceFormatted: payments.formatPrice(plan.price)
    }));

    res.json({ plans });
  } catch (error) {
    console.error('[BILLING] Plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Create new subscription
router.post('/orgs/:id/subscription', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, billingEmail, paymentMethodId } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    if (!plan || !billingEmail) {
      return res.status(400).json({ error: 'Plan and billing email required' });
    }

    if (!payments.getPlan(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Check if subscription already exists
    const existing = await db.queryOne(
      'SELECT id FROM subscriptions WHERE org_id = $1 AND status = $2',
      [id, 'active']
    );

    if (existing) {
      return res.status(409).json({ error: 'Organization already has an active subscription' });
    }

    // Validate payment method if provided
    if (paymentMethodId) {
      const validation = await payments.validatePaymentMethod(paymentMethodId);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid payment method' });
      }
    }

    // Create subscription
    const paymentResult = await payments.createSubscription(id, plan, billingEmail);
    if (!paymentResult.success) {
      return res.status(400).json({ error: paymentResult.error });
    }

    const subscriptionId = paymentResult.subscriptionId;
    const planDetails = payments.getPlan(plan);
    const nextBillingDate = paymentResult.nextBillingDate;

    // Store in database
    await db.execute(
      `INSERT INTO subscriptions
       (id, org_id, plan, monthly_price, billing_email, status, next_billing_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [subscriptionId, id, plan, planDetails.price, billingEmail, 'active', nextBillingDate]
    );

    res.status(201).json({
      subscriptionId,
      plan,
      status: 'active',
      nextBillingDate,
      message: 'Subscription created successfully'
    });

    // Send confirmation email asynchronously
    setImmediate(async () => {
      try {
        const org = await db.queryOne('SELECT * FROM organizations WHERE id = $1', [id]);
        if (org) {
          await notifications.send(
            billingEmail,
            `NAVIAR CONSULT Subscription Confirmed — ${planDetails.name} Plan`,
            `
              <h2>Subscription Confirmed</h2>
              <p>Your ${planDetails.name} subscription has been activated.</p>
              <dl>
                <dt>Plan:</dt><dd>${planDetails.name}</dd>
                <dt>Monthly Price:</dt><dd>${payments.formatPrice(planDetails.price)}</dd>
                <dt>Organization:</dt><dd>${org.name}</dd>
                <dt>Next Billing Date:</dt><dd>${new Date(nextBillingDate).toLocaleDateString()}</dd>
              </dl>
            `
          );
        }
      } catch (err) {
        console.error('[BILLING] Confirmation email failed:', err);
      }
    });
  } catch (error) {
    console.error('[BILLING] Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Update subscription plan
router.patch('/orgs/:id/subscription', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPlan } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    if (!newPlan || !payments.getPlan(newPlan)) {
      return res.status(400).json({ error: 'Invalid new plan' });
    }

    const subscription = await db.queryOne(
      'SELECT * FROM subscriptions WHERE org_id = $1 AND status = $2',
      [id, 'active']
    );

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    if (subscription.plan === newPlan) {
      return res.status(400).json({ error: 'Already on this plan' });
    }

    // Calculate proration
    const oldPlan = payments.getPlan(subscription.plan);
    const newPlanDetails = payments.getPlan(newPlan);
    const proration = payments.calculateProration(
      oldPlan.price,
      newPlanDetails.price,
      subscription.created_at,
      subscription.next_billing_date
    );

    // Update subscription with payment processor
    const updateResult = await payments.updateSubscription(subscription.id, newPlan);
    if (!updateResult.success) {
      return res.status(400).json({ error: updateResult.error });
    }

    // Update in database
    await db.execute(
      `UPDATE subscriptions SET plan = $1, monthly_price = $2, updated_at = NOW()
       WHERE id = $3`,
      [newPlan, newPlanDetails.price, subscription.id]
    );

    res.json({
      subscriptionId: subscription.id,
      previousPlan: subscription.plan,
      newPlan,
      proration,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('[BILLING] Subscription update error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel subscription
router.delete('/orgs/:id/subscription', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const subscription = await db.queryOne(
      'SELECT * FROM subscriptions WHERE org_id = $1 AND status = $2',
      [id, 'active']
    );

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription' });
    }

    // Cancel with payment processor
    const cancelResult = await payments.cancelSubscription(subscription.id);
    if (!cancelResult.success) {
      return res.status(400).json({ error: cancelResult.error });
    }

    // Update in database
    await db.execute(
      `UPDATE subscriptions SET status = $1, cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      ['cancelled', subscription.id]
    );

    res.json({
      subscriptionId: subscription.id,
      status: 'cancelled',
      cancelledAt: new Date(),
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('[BILLING] Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get invoices
router.get('/orgs/:id/invoices', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 12, offset = 0 } = req.query;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const invoices = await db.queryMany(
      `SELECT * FROM subscriptions WHERE org_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const total = await db.queryOne(
      'SELECT COUNT(*) as count FROM subscriptions WHERE org_id = $1',
      [id]
    );

    res.json(utils.formatPaginatedResponse(invoices, total.count, 1, limit));
  } catch (error) {
    console.error('[BILLING] Invoices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Webhook handler for Stripe events
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const body = req.body.toString('utf-8');

    // Verify webhook signature
    if (process.env.STRIPE_WEBHOOK_SECRET && !stripeWebhooks.verifySignature(body, signature)) {
      console.warn('[BILLING] Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(body);

    // Process webhook event
    const result = await stripeWebhooks.processEvent(event);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ received: true, processed: result.processed });
  } catch (error) {
    console.error('[BILLING] Webhook processing error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Get invoice
router.get('/invoices/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await invoices.getInvoice(id);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result.invoice);
  } catch (error) {
    console.error('[BILLING] Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Download invoice as PDF (HTML)
router.get('/invoices/:id/download', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await invoices.generateInvoicePDF(id);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${result.pdfFileName}"`);
    res.send(result.html);
  } catch (error) {
    console.error('[BILLING] Download invoice error:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

module.exports = router;
