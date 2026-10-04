// Analytics service for NAVIAR CONSULT
// Provides anonymized aggregate metrics and insights

const db = require('./db');

class AnalyticsService {
  async getKeyMetrics(orgId) {
    try {
      // Total incidents
      const incidentCount = await db.queryOne(
        'SELECT COUNT(*) as count FROM incidents WHERE org_id = $1',
        [orgId]
      );

      // Total advisors
      const advisorCount = await db.queryOne(
        `SELECT COUNT(DISTINCT ca.advisor_id) as count FROM case_assignments ca
         JOIN incidents i ON ca.incident_id = i.id
         WHERE i.org_id = $1`,
        [orgId]
      );

      // Total employees affected
      const employeeCount = await db.queryOne(
        'SELECT COUNT(*) as count FROM employees WHERE org_id = $1',
        [orgId]
      );

      // Resolved incidents
      const resolvedCount = await db.queryOne(
        'SELECT COUNT(*) as count FROM incidents WHERE org_id = $1 AND status = $2',
        [orgId, 'resolved']
      );

      // Average case duration (days from start to close)
      const avgDuration = await db.queryOne(
        `SELECT AVG(EXTRACT(DAY FROM (COALESCE(updated_at, NOW()) - created_at))) as avg_days
         FROM incidents WHERE org_id = $1 AND status = $2`,
        [orgId, 'resolved']
      );

      // Pending cases
      const pendingCount = await db.queryOne(
        'SELECT COUNT(*) as count FROM incidents WHERE org_id = $1 AND status = $2',
        [orgId, 'pending']
      );

      return {
        success: true,
        metrics: {
          totalIncidents: incidentCount.count || 0,
          resolvedIncidents: resolvedCount.count || 0,
          pendingIncidents: pendingCount.count || 0,
          totalAdvisors: advisorCount.count || 0,
          totalEmployees: employeeCount.count || 0,
          resolutionRate: incidentCount.count > 0
            ? Math.round((resolvedCount.count / incidentCount.count) * 100)
            : 0,
          averageCaseDurationDays: Math.round(avgDuration.avg_days || 0)
        }
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get key metrics:', error);
      return { success: false, error: error.message };
    }
  }

  async getIncidentTrends(orgId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await db.queryMany(
        `SELECT DATE(created_at) as date, COUNT(*) as count, status
         FROM incidents
         WHERE org_id = $1 AND created_at >= $2
         GROUP BY DATE(created_at), status
         ORDER BY DATE(created_at) DESC`,
        [orgId, startDate]
      );

      // Aggregate by date
      const aggregated = {};
      trends.forEach(row => {
        const date = row.date;
        if (!aggregated[date]) {
          aggregated[date] = { date, total: 0, reported: 0, pending: 0, resolved: 0, closed: 0 };
        }
        aggregated[date][row.status] = row.count || 0;
        aggregated[date].total += row.count || 0;
      });

      return {
        success: true,
        period: `Last ${days} days`,
        trends: Object.values(aggregated).sort((a, b) => new Date(a.date) - new Date(b.date))
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get trends:', error);
      return { success: false, error: error.message };
    }
  }

  async getAdvisorPerformance(orgId) {
    try {
      const performance = await db.queryMany(
        `SELECT
          a.id, a.name,
          COUNT(ca.id) as total_cases,
          COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) as resolved_cases,
          AVG(EXTRACT(DAY FROM (COALESCE(i.updated_at, NOW()) - i.created_at))) as avg_duration
         FROM advisors a
         LEFT JOIN case_assignments ca ON a.id = ca.advisor_id
         LEFT JOIN incidents i ON ca.incident_id = i.id AND i.org_id = $1
         WHERE a.org_id = $1
         GROUP BY a.id, a.name
         ORDER BY total_cases DESC`,
        [orgId]
      );

      return {
        success: true,
        advisors: performance.map(adv => ({
          advisorId: adv.id,
          name: adv.name,
          totalCases: adv.total_cases || 0,
          resolvedCases: adv.resolved_cases || 0,
          resolutionRate: adv.total_cases > 0
            ? Math.round((adv.resolved_cases / adv.total_cases) * 100)
            : 0,
          averageCaseDurationDays: Math.round(adv.avg_duration || 0)
        }))
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get advisor performance:', error);
      return { success: false, error: error.message };
    }
  }

  async getIncidentDistribution(orgId) {
    try {
      // By severity
      const bySeverity = await db.queryMany(
        'SELECT severity, COUNT(*) as count FROM incidents WHERE org_id = $1 GROUP BY severity',
        [orgId]
      );

      // By status
      const byStatus = await db.queryMany(
        'SELECT status, COUNT(*) as count FROM incidents WHERE org_id = $1 GROUP BY status',
        [orgId]
      );

      // By reason (top 10)
      const byReason = await db.queryMany(
        `SELECT reason, COUNT(*) as count FROM incidents
         WHERE org_id = $1 AND reason IS NOT NULL
         GROUP BY reason ORDER BY count DESC LIMIT 10`,
        [orgId]
      );

      return {
        success: true,
        distribution: {
          bySeverity: bySeverity.map(row => ({ severity: row.severity, count: row.count })),
          byStatus: byStatus.map(row => ({ status: row.status, count: row.count })),
          byReason: byReason.map(row => ({ reason: row.reason, count: row.count }))
        }
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get distribution:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmployeeDemographics(orgId) {
    try {
      // By incident status
      const demographics = await db.queryMany(
        `SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN i.id IS NOT NULL THEN 1 END) as with_incidents,
          COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) as resolved_incidents,
          COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_incidents
         FROM employees e
         LEFT JOIN incidents i ON e.id = i.employee_id
         WHERE e.org_id = $1`,
        [orgId]
      );

      const data = demographics[0] || {};

      return {
        success: true,
        demographics: {
          totalEmployees: data.total || 0,
          employeesWithIncidents: data.with_incidents || 0,
          resolvedCases: data.resolved_incidents || 0,
          pendingCases: data.pending_incidents || 0,
          percentageAffected: data.total > 0
            ? Math.round((data.with_incidents / data.total) * 100)
            : 0
        }
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get demographics:', error);
      return { success: false, error: error.message };
    }
  }

  async getCaseOutcomes(orgId) {
    try {
      const outcomes = await db.queryMany(
        `SELECT outcome, COUNT(*) as count FROM outcomes
         WHERE org_id = $1
         GROUP BY outcome
         ORDER BY count DESC`,
        [orgId]
      );

      return {
        success: true,
        outcomes: outcomes.map(row => ({
          outcome: row.outcome,
          count: row.count
        }))
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get outcomes:', error);
      return { success: false, error: error.message };
    }
  }

  async getReturnToWorkMetrics(orgId) {
    try {
      const metrics = await db.queryMany(
        `SELECT
          COUNT(*) as total_cases,
          COUNT(CASE WHEN o.status = 'returned' THEN 1 END) as returned,
          COUNT(CASE WHEN o.status = 'partial' THEN 1 END) as partial_return,
          COUNT(CASE WHEN o.status = 'ongoing' THEN 1 END) as ongoing,
          AVG(EXTRACT(DAY FROM o.return_date - i.created_at)) as avg_days_to_return
         FROM incidents i
         LEFT JOIN outcomes o ON i.id = o.incident_id
         WHERE i.org_id = $1`,
        [orgId]
      );

      const data = metrics[0] || {};

      return {
        success: true,
        returnToWork: {
          totalCases: data.total_cases || 0,
          returnedToWork: data.returned || 0,
          partialReturn: data.partial_return || 0,
          ongoing: data.ongoing || 0,
          successRate: data.total_cases > 0
            ? Math.round((data.returned / data.total_cases) * 100)
            : 0,
          averageDaysToReturn: Math.round(data.avg_days_to_return || 0)
        }
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to get return to work metrics:', error);
      return { success: false, error: error.message };
    }
  }

  async generateComprehensiveReport(orgId) {
    try {
      const metrics = await this.getKeyMetrics(orgId);
      const trends = await this.getIncidentTrends(orgId, 30);
      const performance = await this.getAdvisorPerformance(orgId);
      const distribution = await this.getIncidentDistribution(orgId);
      const demographics = await this.getEmployeeDemographics(orgId);
      const outcomes = await this.getCaseOutcomes(orgId);
      const rtw = await this.getReturnToWorkMetrics(orgId);

      if (!metrics.success) {
        return { success: false, error: 'Failed to generate report' };
      }

      return {
        success: true,
        report: {
          generatedAt: new Date().toISOString(),
          period: 'Last 30 days',
          keyMetrics: metrics.metrics,
          trends: trends.trends,
          advisorPerformance: performance.advisors,
          incidentDistribution: distribution.distribution,
          employeeDemographics: demographics.demographics,
          caseOutcomes: outcomes.outcomes,
          returnToWorkMetrics: rtw.returnToWork
        }
      };
    } catch (error) {
      console.error('[ANALYTICS] Failed to generate report:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new AnalyticsService();
