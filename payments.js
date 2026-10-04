// Stripe payment integration for NAVIAR CONSULT subscriptions
// Handles organization billing, subscription management, and invoice tracking

const config = require('./config');

const PLANS = {
  essentials: {
    id: 'price_naviar_essentials',
    name: 'Essentials',
    price: 2990, // NOK per month, in cents
    currency: 'nok',
    features: ['Up to 50 employees', 'Basic incident tracking', '1 advisor', 'Email support'],
    interval: 'month'
  },
  professional: {
    id: 'price_naviar_professional',
    name: 'Professional',
    price: 7990,
    currency: 'nok',
    features: ['Up to 500 employees', 'Advanced analytics', '5 advisors', 'Priority support', 'Custom reports'],
    interval: 'month'
  },
  enterprise: {
    id: 'price_naviar_enterprise',
    name: 'Enterprise',
    price: 19990,
    currency: 'nok',
    features: ['Unlimited employees', 'Full analytics suite', 'Unlimited advisors', '24/7 phone support', 'Dedicated account manager', 'Custom integrations'],
    interval: 'month',
    custom: true
  }
};

class PaymentService {
  constructor() {
    this.stripeEnabled = config.features.enableStripe;
    // In production, would initialize: const stripe = require('stripe')(config.stripe.secretKey);
    this.stripe = null;
  }

  getPlans() {
    return PLANS;
  }

  getPlan(planName) {
    return PLANS[planName] || null;
  }

  formatPrice(amountCents, currency = 'nok') {
    const formatter = new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: currency.toUpperCase()
    });
    return formatter.format(amountCents / 100);
  }

  async createSubscription(orgId, planName, billingEmail) {
    if (!this.stripeEnabled) {
      console.log('[PAYMENTS] Stripe disabled, returning mock subscription');
      return {
        success: true,
        subscriptionId: `sub_mock_${orgId}`,
        status: 'active',
        plan: planName,
        nextBillingDate: this.addMonths(new Date(), 1)
      };
    }

    const plan = this.getPlan(planName);
    if (!plan) {
      return { success: false, error: 'Invalid plan' };
    }

    try {
      console.log(`[PAYMENTS] Creating subscription for org ${orgId}, plan: ${planName}`);
      // Mock implementation - production would call Stripe API
      return {
        success: true,
        subscriptionId: `sub_stripe_${Math.random().toString(36).substr(2, 9)}`,
        customerId: `cus_${orgId}`,
        status: 'active',
        plan: planName,
        amount: plan.price,
        currency: plan.currency,
        nextBillingDate: this.addMonths(new Date(), 1)
      };
    } catch (error) {
      console.error('[PAYMENTS] Subscription creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async updateSubscription(subscriptionId, newPlanName) {
    if (!this.stripeEnabled) {
      console.log('[PAYMENTS] Stripe disabled, returning mock update');
      return { success: true, subscriptionId };
    }

    const newPlan = this.getPlan(newPlanName);
    if (!newPlan) {
      return { success: false, error: 'Invalid plan' };
    }

    try {
      console.log(`[PAYMENTS] Updating subscription ${subscriptionId} to plan: ${newPlanName}`);
      // Mock implementation
      return {
        success: true,
        subscriptionId,
        plan: newPlanName,
        prorationCredit: 0,
        nextBillingDate: this.addMonths(new Date(), 1)
      };
    } catch (error) {
      console.error('[PAYMENTS] Subscription update failed:', error);
      return { success: false, error: error.message };
    }
  }

  async cancelSubscription(subscriptionId) {
    if (!this.stripeEnabled) {
      console.log('[PAYMENTS] Stripe disabled, returning mock cancellation');
      return { success: true, subscriptionId };
    }

    try {
      console.log(`[PAYMENTS] Cancelling subscription ${subscriptionId}`);
      // Mock implementation
      return {
        success: true,
        subscriptionId,
        cancelledAt: new Date(),
        refundStatus: 'processed'
      };
    } catch (error) {
      console.error('[PAYMENTS] Subscription cancellation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getSubscriptionStatus(subscriptionId) {
    if (!this.stripeEnabled) {
      console.log('[PAYMENTS] Stripe disabled, returning mock status');
      return {
        success: true,
        subscriptionId,
        status: 'active',
        plan: 'professional'
      };
    }

    try {
      console.log(`[PAYMENTS] Fetching subscription status: ${subscriptionId}`);
      // Mock implementation
      return {
        success: true,
        subscriptionId,
        status: 'active',
        plan: 'professional',
        currentPeriodStart: this.addMonths(new Date(), -1),
        currentPeriodEnd: new Date(),
        nextBillingDate: this.addMonths(new Date(), 1)
      };
    } catch (error) {
      console.error('[PAYMENTS] Failed to fetch subscription:', error);
      return { success: false, error: error.message };
    }
  }

  async createInvoice(orgId, subscriptionId, amount, description) {
    try {
      console.log(`[PAYMENTS] Creating invoice for org ${orgId}: ${amount} NOK`);
      // Mock implementation
      return {
        success: true,
        invoiceId: `inv_${Date.now()}`,
        orgId,
        subscriptionId,
        amount,
        currency: 'nok',
        status: 'paid',
        issuedAt: new Date(),
        dueDate: this.addDays(new Date(), 30),
        pdfUrl: `/invoices/inv_${Date.now()}.pdf`
      };
    } catch (error) {
      console.error('[PAYMENTS] Invoice creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async listInvoices(orgId, limit = 12) {
    try {
      console.log(`[PAYMENTS] Fetching invoices for org ${orgId}`);
      // Mock implementation - would query database or Stripe
      return {
        success: true,
        invoices: [],
        total: 0
      };
    } catch (error) {
      console.error('[PAYMENTS] Failed to fetch invoices:', error);
      return { success: false, error: error.message };
    }
  }

  async refundInvoice(invoiceId, reason = '') {
    try {
      console.log(`[PAYMENTS] Processing refund for invoice ${invoiceId}`);
      // Mock implementation
      return {
        success: true,
        invoiceId,
        refundId: `ref_${Date.now()}`,
        amount: 0,
        reason,
        processedAt: new Date()
      };
    } catch (error) {
      console.error('[PAYMENTS] Refund failed:', error);
      return { success: false, error: error.message };
    }
  }

  async validatePaymentMethod(paymentMethodId) {
    try {
      console.log(`[PAYMENTS] Validating payment method: ${paymentMethodId}`);
      // Mock implementation
      return {
        success: true,
        valid: true,
        type: 'card',
        lastFour: '4242'
      };
    } catch (error) {
      console.error('[PAYMENTS] Payment method validation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility functions
  addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Usage limit calculations based on plan
  getUsageLimits(plan) {
    const limits = {
      essentials: {
        maxEmployees: 50,
        maxAdvisors: 1,
        maxStorageGB: 10,
        analyticsRetentionDays: 90,
        supportPriority: 'standard'
      },
      professional: {
        maxEmployees: 500,
        maxAdvisors: 5,
        maxStorageGB: 100,
        analyticsRetentionDays: 365,
        supportPriority: 'priority'
      },
      enterprise: {
        maxEmployees: null, // unlimited
        maxAdvisors: null,
        maxStorageGB: null,
        analyticsRetentionDays: null,
        supportPriority: 'vip'
      }
    };
    return limits[plan] || limits.essentials;
  }

  // Billing cycle calculations
  getBillingCycleInfo(startDate, plan = 'professional') {
    const cycleStart = new Date(startDate);
    const cycleEnd = this.addMonths(cycleStart, 1);
    const today = new Date();
    const daysInCycle = Math.ceil((cycleEnd - cycleStart) / (1000 * 60 * 60 * 24));
    const daysUsed = Math.ceil((today - cycleStart) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, daysInCycle - daysUsed);

    return {
      cycleStart,
      cycleEnd,
      daysInCycle,
      daysUsed,
      daysRemaining,
      percentageUsed: Math.round((daysUsed / daysInCycle) * 100),
      renewsAt: cycleEnd
    };
  }

  // Proration calculation (pro-rata billing for mid-cycle changes)
  calculateProration(oldAmount, newAmount, currentPeriodStart, currentPeriodEnd) {
    const now = new Date();
    const totalDays = (currentPeriodEnd - currentPeriodStart) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now - currentPeriodStart) / (1000 * 60 * 60 * 24);
    const remainingDays = totalDays - elapsedDays;

    const oldProRata = (oldAmount / totalDays) * elapsedDays;
    const newProRata = (newAmount / totalDays) * remainingDays;
    const credit = oldProRata;
    const newCharge = newProRata;
    const netAmount = newCharge - credit;

    return {
      oldProRata: Math.round(oldProRata),
      newProRata: Math.round(newProRata),
      credit: Math.round(credit),
      newCharge: Math.round(newCharge),
      netAmount: Math.round(netAmount)
    };
  }
}

module.exports = new PaymentService();
