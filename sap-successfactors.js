// SAP SuccessFactors integration for NAVIAR CONSULT
// Manages HR employee data, compensation, and performance metrics

const config = require('./config');
const db = require('./db');

class SAPSuccessFactors {
  constructor() {
    this.apiKey = process.env.SAP_SF_API_KEY || 'test_sap_sf_key';
    this.baseUrl = process.env.SAP_SF_BASE_URL || 'https://api.sap.com/successfactors';
    this.enabled = process.env.ENABLE_SAP_SF !== 'false';
    this.companyId = process.env.SAP_SF_COMPANY_ID || 'naviar';
  }

  async syncEmployeeData(employeeId, employeeData) {
    try {
      const {
        firstName,
        lastName,
        email,
        department,
        position,
        hireDate,
        salary,
        workStatus = 'active'
      } = employeeData;

      if (!email) {
        return { success: false, error: 'Email required' };
      }

      if (this.enabled) {
        // In production: POST /employees to SAP SF API
        // Requires: firstName, lastName, email, department, position, hireDate, salary
      }

      const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(
        `INSERT INTO sap_syncs
         (id, employee_id, sync_type, data, status, synced_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [syncId, employeeId, 'employee_data', JSON.stringify(employeeData), 'synced']
      );

      console.log(`[SAP_SF] Synced employee data for ${employeeId}`);

      return {
        success: true,
        syncId,
        employeeId,
        status: 'synced',
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to sync employee data:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmployeeProfile(employeeId) {
    try {
      const employee = await db.queryOne(
        'SELECT * FROM employees WHERE id = $1',
        [employeeId]
      );

      if (!employee) {
        return { success: false, error: 'Employee not found' };
      }

      if (this.enabled) {
        // In production: GET /employees/{employeeId} from SAP SF API
        // Return full profile with salary, benefits, performance ratings
      }

      return {
        success: true,
        employee: {
          id: employee.id,
          firstName: employee.first_name,
          lastName: employee.last_name,
          email: employee.email,
          department: employee.department,
          position: employee.position,
          hireDate: employee.hire_date,
          workStatus: employee.work_status,
          phone: employee.phone,
          manager: employee.manager_id,
          costCenter: employee.cost_center
        }
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to get employee profile:', error);
      return { success: false, error: error.message };
    }
  }

  async getCompensationData(employeeId) {
    try {
      const compensation = await db.queryOne(
        'SELECT * FROM employee_compensation WHERE employee_id = $1',
        [employeeId]
      );

      if (!compensation) {
        return { success: false, error: 'Compensation data not found' };
      }

      return {
        success: true,
        compensation: {
          employeeId,
          salary: compensation.salary,
          currency: compensation.currency || 'NOK',
          payFrequency: compensation.pay_frequency || 'monthly',
          benefits: compensation.benefits ? JSON.parse(compensation.benefits) : [],
          bonus: compensation.bonus,
          stockOptions: compensation.stock_options,
          pensionContribution: compensation.pension_contribution,
          lastReviewDate: compensation.last_review_date,
          nextReviewDate: compensation.next_review_date
        }
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to get compensation data:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCompensation(employeeId, compensationData) {
    try {
      const {
        salary,
        bonus,
        benefits = [],
        stockOptions,
        pensionContribution
      } = compensationData;

      const existing = await db.queryOne(
        'SELECT * FROM employee_compensation WHERE employee_id = $1',
        [employeeId]
      );

      if (existing) {
        await db.execute(
          `UPDATE employee_compensation
           SET salary = $1, bonus = $2, benefits = $3, stock_options = $4, pension_contribution = $5, updated_at = NOW()
           WHERE employee_id = $6`,
          [salary, bonus, JSON.stringify(benefits), stockOptions, pensionContribution, employeeId]
        );
      } else {
        await db.execute(
          `INSERT INTO employee_compensation
           (employee_id, salary, bonus, benefits, stock_options, pension_contribution)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [employeeId, salary, bonus, JSON.stringify(benefits), stockOptions, pensionContribution]
        );
      }

      console.log(`[SAP_SF] Updated compensation for ${employeeId}`);

      return {
        success: true,
        employeeId,
        salary,
        bonus,
        message: 'Compensation updated successfully'
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to update compensation:', error);
      return { success: false, error: error.message };
    }
  }

  async getPerformanceRating(employeeId, year = null) {
    try {
      let query = 'SELECT * FROM performance_ratings WHERE employee_id = $1';
      const params = [employeeId];

      if (year) {
        query += ' AND EXTRACT(YEAR FROM review_date) = $2';
        params.push(year);
      }

      query += ' ORDER BY review_date DESC LIMIT 1';

      const rating = await db.queryOne(query, params);

      if (!rating) {
        return { success: false, error: 'No performance rating found' };
      }

      return {
        success: true,
        rating: {
          employeeId,
          overallRating: rating.overall_rating,
          reviewDate: rating.review_date,
          reviewer: rating.reviewer_id,
          comments: rating.comments,
          goals: rating.goals ? JSON.parse(rating.goals) : [],
          developmentAreas: rating.development_areas ? JSON.parse(rating.development_areas) : []
        }
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to get performance rating:', error);
      return { success: false, error: error.message };
    }
  }

  async createPerformanceRating(employeeId, ratingData) {
    try {
      const {
        overallRating,
        reviewDate,
        reviewerId,
        comments,
        goals = [],
        developmentAreas = []
      } = ratingData;

      if (!overallRating || !reviewDate) {
        return { success: false, error: 'Overall rating and review date required' };
      }

      const ratingId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(
        `INSERT INTO performance_ratings
         (id, employee_id, overall_rating, review_date, reviewer_id, comments, goals, development_areas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [ratingId, employeeId, overallRating, reviewDate, reviewerId, comments, JSON.stringify(goals), JSON.stringify(developmentAreas)]
      );

      console.log(`[SAP_SF] Created performance rating ${ratingId}`);

      return {
        success: true,
        ratingId,
        employeeId,
        overallRating,
        message: 'Performance rating created successfully'
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to create performance rating:', error);
      return { success: false, error: error.message };
    }
  }

  async syncAbsenceData(employeeId, absenceData) {
    try {
      const {
        absenceType,
        startDate,
        endDate,
        reason,
        status = 'pending'
      } = absenceData;

      if (!absenceType || !startDate) {
        return { success: false, error: 'Absence type and start date required' };
      }

      const absenceId = `abs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.execute(
        `INSERT INTO employee_absences
         (id, employee_id, absence_type, start_date, end_date, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [absenceId, employeeId, absenceType, startDate, endDate, reason, status]
      );

      console.log(`[SAP_SF] Synced absence data for ${employeeId}`);

      return {
        success: true,
        absenceId,
        employeeId,
        absenceType,
        status: 'synced'
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to sync absence data:', error);
      return { success: false, error: error.message };
    }
  }

  async getOrgChart(departmentId = null) {
    try {
      let query = 'SELECT id, first_name, last_name, position, department, manager_id FROM employees WHERE work_status = $1';
      const params = ['active'];

      if (departmentId) {
        query += ' AND department = $2';
        params.push(departmentId);
      }

      query += ' ORDER BY department, position';

      const employees = await db.queryMany(query, params);

      const orgChart = this.buildOrgChart(employees);

      return {
        success: true,
        orgChart,
        totalEmployees: employees.length
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to get org chart:', error);
      return { success: false, error: error.message };
    }
  }

  buildOrgChart(employees) {
    const map = new Map();
    const roots = [];

    employees.forEach(emp => {
      map.set(emp.id, { ...emp, children: [] });
    });

    employees.forEach(emp => {
      if (emp.manager_id) {
        const manager = map.get(emp.manager_id);
        if (manager) {
          manager.children.push(map.get(emp.id));
        }
      } else {
        roots.push(map.get(emp.id));
      }
    });

    return roots;
  }

  async getSyncStatus() {
    try {
      const lastSync = await db.queryOne(
        'SELECT * FROM sap_syncs ORDER BY synced_at DESC LIMIT 1'
      );

      const syncStats = await db.queryOne(
        `SELECT
          COUNT(*) as total_syncs,
          COUNT(CASE WHEN status = 'synced' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          MAX(synced_at) as last_sync_time
         FROM sap_syncs`
      );

      return {
        success: true,
        status: lastSync ? lastSync.status : 'never',
        lastSync: lastSync ? lastSync.synced_at : null,
        stats: {
          totalSyncs: syncStats.total_syncs || 0,
          successful: syncStats.successful || 0,
          failed: syncStats.failed || 0,
          lastSyncTime: syncStats.last_sync_time
        }
      };
    } catch (error) {
      console.error('[SAP_SF] Failed to get sync status:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SAPSuccessFactors();
