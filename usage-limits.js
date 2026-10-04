// Usage limits enforcement for NAVIAR CONSULT
// Monitors and enforces subscription plan limits

const db = require('./db');
const payments = require('./payments');

class UsageLimitsService {
  async getCurrentUsage(orgId) {
    try {
      // Get subscription
      const subscription = await db.queryOne(
        'SELECT * FROM subscriptions WHERE org_id = $1 AND status = $2',
        [orgId, 'active']
      );

      if (!subscription) {
        return { success: false, error: 'No active subscription' };
      }

      // Get employee count
      const employeeResult = await db.queryOne(
        'SELECT COUNT(*) as count FROM employees WHERE org_id = $1',
        [orgId]
      );

      // Get advisor count (unique advisors assigned to incidents)
      const advisorResult = await db.queryOne(
        `SELECT COUNT(DISTINCT ca.advisor_id) as count FROM case_assignments ca
         JOIN incidents i ON ca.incident_id = i.id
         WHERE i.org_id = $1`,
        [orgId]
      );

      // Get storage usage (from documents)
      const storageResult = await db.queryOne(
        'SELECT SUM(size) as total FROM documents WHERE org_id = $1',
        [orgId]
      );

      const storageMB = storageResult.total ? Math.ceil(storageResult.total / (1024 * 1024)) : 0;

      // Get incident count
      const incidentResult = await db.queryOne(
        'SELECT COUNT(*) as count FROM incidents WHERE org_id = $1',
        [orgId]
      );

      return {
        success: true,
        usage: {
          employees: employeeResult.count || 0,
          advisors: advisorResult.count || 0,
          storageMB,
          storageGB: (storageMB / 1024).toFixed(2),
          incidents: incidentResult.count || 0,
          plan: subscription.plan,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status
        }
      };
    } catch (error) {
      console.error('[USAGE_LIMITS] Failed to get current usage:', error);
      return { success: false, error: error.message };
    }
  }

  async checkLimit(orgId, limitType) {
    try {
      const usageResult = await this.getCurrentUsage(orgId);
      if (!usageResult.success) {
        return usageResult;
      }

      const usage = usageResult.usage;
      const plan = payments.getPlan(usage.plan);
      if (!plan) {
        return { success: false, error: 'Invalid plan' };
      }

      const limits = payments.getUsageLimits(usage.plan);

      let isAllowed = true;
      let limitValue = null;
      let currentValue = null;
      let message = '';

      switch (limitType) {
        case 'employees':
          currentValue = usage.employees;
          limitValue = limits.maxEmployees;
          isAllowed = limitValue === null || currentValue < limitValue;
          message = `Employee limit: ${currentValue}/${limitValue || 'Unlimited'}`;
          break;

        case 'advisors':
          currentValue = usage.advisors;
          limitValue = limits.maxAdvisors;
          isAllowed = limitValue === null || currentValue < limitValue;
          message = `Advisor limit: ${currentValue}/${limitValue || 'Unlimited'}`;
          break;

        case 'storage':
          currentValue = usage.storageGB;
          limitValue = limits.maxStorageGB;
          isAllowed = limitValue === null || currentValue < limitValue;
          message = `Storage limit: ${currentValue}GB/${limitValue || 'Unlimited'}GB`;
          break;

        default:
          return { success: false, error: 'Unknown limit type' };
      }

      return {
        success: true,
        allowed: isAllowed,
        limitType,
        current: currentValue,
        limit: limitValue,
        plan: usage.plan,
        message,
        usage
      };
    } catch (error) {
      console.error('[USAGE_LIMITS] Failed to check limit:', error);
      return { success: false, error: error.message };
    }
  }

  async enforceLimit(orgId, limitType) {
    const checkResult = await this.checkLimit(orgId, limitType);
    if (!checkResult.success) {
      return checkResult;
    }

    if (!checkResult.allowed) {
      console.warn(`[USAGE_LIMITS] Limit exceeded for ${orgId}: ${limitType}`);
      return {
        success: false,
        error: `Plan limit exceeded: ${checkResult.message}`,
        limitExceeded: true,
        checkResult
      };
    }

    return {
      success: true,
      allowed: true,
      message: `Usage within limits: ${checkResult.message}`
    };
  }

  async getUsageWarnings(orgId) {
    try {
      const usageResult = await this.getCurrentUsage(orgId);
      if (!usageResult.success) {
        return usageResult;
      }

      const usage = usageResult.usage;
      const limits = payments.getUsageLimits(usage.plan);
      const warnings = [];

      // Check employee warning (80% of limit)
      if (limits.maxEmployees !== null) {
        const employeePercent = (usage.employees / limits.maxEmployees) * 100;
        if (employeePercent >= 80) {
          warnings.push({
            type: 'employee_limit',
            severity: employeePercent >= 100 ? 'critical' : 'warning',
            message: `Employee usage at ${Math.round(employeePercent)}% of plan limit (${usage.employees}/${limits.maxEmployees})`
          });
        }
      }

      // Check advisor warning (80% of limit)
      if (limits.maxAdvisors !== null) {
        const advisorPercent = (usage.advisors / limits.maxAdvisors) * 100;
        if (advisorPercent >= 80) {
          warnings.push({
            type: 'advisor_limit',
            severity: advisorPercent >= 100 ? 'critical' : 'warning',
            message: `Advisor usage at ${Math.round(advisorPercent)}% of plan limit (${usage.advisors}/${limits.maxAdvisors})`
          });
        }
      }

      // Check storage warning (80% of limit)
      if (limits.maxStorageGB !== null) {
        const storagePercent = (usage.storageGB / limits.maxStorageGB) * 100;
        if (storagePercent >= 80) {
          warnings.push({
            type: 'storage_limit',
            severity: storagePercent >= 100 ? 'critical' : 'warning',
            message: `Storage usage at ${Math.round(storagePercent)}% of plan limit (${usage.storageGB}GB/${limits.maxStorageGB}GB)`
          });
        }
      }

      return {
        success: true,
        hasWarnings: warnings.length > 0,
        warnings,
        usage
      };
    } catch (error) {
      console.error('[USAGE_LIMITS] Failed to get warnings:', error);
      return { success: false, error: error.message };
    }
  }

  async logUsageViolation(orgId, limitType, details = {}) {
    try {
      await db.execute(
        `INSERT INTO usage_violations
         (org_id, limit_type, details, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [orgId, limitType, JSON.stringify(details)]
      );

      console.warn(`[USAGE_LIMITS] Violation logged for ${orgId}: ${limitType}`);
      return { success: true };
    } catch (error) {
      console.error('[USAGE_LIMITS] Failed to log violation:', error);
      return { success: false, error: error.message };
    }
  }

  async getUsageHistory(orgId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await db.queryMany(
        `SELECT org_id, limit_type, details, created_at FROM usage_violations
         WHERE org_id = $1 AND created_at >= $2
         ORDER BY created_at DESC`,
        [orgId, startDate]
      );

      return {
        success: true,
        violations: history,
        total: history.length,
        period: `Last ${days} days`
      };
    } catch (error) {
      console.error('[USAGE_LIMITS] Failed to get history:', error);
      return { success: false, error: error.message };
    }
  }

  async suggestUpgrade(orgId) {
    try {
      const usageResult = await this.getCurrentUsage(orgId);
      if (!usageResult.success) {
        return usageResult;
      }

      const usage = usageResult.usage;
      const currentPlan = payments.getPlan(usage.plan);
      const allPlans = payments.getPlans();

      // Find next tier based on current limits
      let suggestedPlan = null;
      for (const [planName, plan] of Object.entries(allPlans)) {
        if (planName === usage.plan) continue;

        const limits = payments.getUsageLimits(planName);

        // Check if this plan would accommodate current usage
        const wouldFit =
          (limits.maxEmployees === null || usage.employees < limits.maxEmployees) &&
          (limits.maxAdvisors === null || usage.advisors < limits.maxAdvisors) &&
          (limits.maxStorageGB === null || usage.storageGB < limits.maxStorageGB);

        if (wouldFit && (!suggestedPlan || plan.price > currentPlan.price)) {
          suggestedPlan = {
            name: planName,
            plan: plan,
            limits: limits,
            priceIncrease: plan.price - currentPlan.price
          };
        }
      }

      return {
        success: true,
        currentPlan: {
          name: usage.plan,
          plan: currentPlan
        },
        suggestedPlan,
        usage
      };
    } catch (error) {
      console.error('[USAGE_LIMITS] Failed to suggest upgrade:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new UsageLimitsService();
