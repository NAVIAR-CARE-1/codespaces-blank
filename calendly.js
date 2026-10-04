// Calendly integration for NAVIAR CONSULT
// Manages advisor availability and consultation scheduling

const config = require('./config');
const db = require('./db');

class CalendlyService {
  constructor() {
    this.apiKey = process.env.CALENDLY_API_KEY || 'test_calendly_key';
    this.baseUrl = 'https://api.calendly.com';
    this.enabled = process.env.ENABLE_CALENDLY !== 'false';
  }

  async getAdvisorAvailability(advisorId, dateRange = {}) {
    try {
      if (!this.enabled) {
        return this.generateMockAvailability(advisorId, dateRange);
      }

      // In production: fetch from Calendly API
      // GET /users/{user_id}/availability_schedules
      // GET /event_types for advisor's calendars

      return this.generateMockAvailability(advisorId, dateRange);
    } catch (error) {
      console.error('[CALENDLY] Failed to get availability:', error);
      return { success: false, error: error.message };
    }
  }

  generateMockAvailability(advisorId, dateRange) {
    const startDate = new Date(dateRange.startDate || new Date());
    const endDate = new Date(dateRange.endDate || new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)); // 2 weeks

    const availableSlots = [];
    const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
    const slotDuration = 60; // minutes

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        const slotStart = new Date(d);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

        availableSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true,
          duration: slotDuration
        });
      }
    }

    return {
      success: true,
      advisorId,
      availableSlots: availableSlots.slice(0, 50), // Return first 50 slots
      totalSlots: availableSlots.length
    };
  }

  async createConsultationSlot(advisorId, eventDetails) {
    try {
      const {
        title = 'NAVIAR Consultation',
        description,
        duration = 60,
        startTime,
        endTime
      } = eventDetails;

      if (!startTime || !endTime) {
        return { success: false, error: 'Start and end times required' };
      }

      if (this.enabled) {
        // In production: POST /scheduled_events to Calendly
        // Requires: event_type_uri, invitees_counter_proposal_enabled, start_time, end_time
      }

      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in database
      await db.execute(
        `INSERT INTO consultation_slots
         (id, advisor_id, title, description, start_time, end_time, duration, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [eventId, advisorId, title, description, startTime, endTime, duration, 'scheduled']
      );

      console.log(`[CALENDLY] Created consultation slot ${eventId}`);

      return {
        success: true,
        eventId,
        title,
        startTime,
        endTime,
        duration
      };
    } catch (error) {
      console.error('[CALENDLY] Failed to create slot:', error);
      return { success: false, error: error.message };
    }
  }

  async bookConsultation(advisorId, clientId, slotTime, notes = '') {
    try {
      const bookingId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create invitation event
      await db.execute(
        `INSERT INTO consultation_bookings
         (id, advisor_id, client_id, scheduled_time, notes, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [bookingId, advisorId, clientId, slotTime, notes, 'confirmed']
      );

      console.log(`[CALENDLY] Booked consultation ${bookingId}`);

      return {
        success: true,
        bookingId,
        advisorId,
        clientId,
        scheduledTime: slotTime,
        status: 'confirmed'
      };
    } catch (error) {
      console.error('[CALENDLY] Failed to book consultation:', error);
      return { success: false, error: error.message };
    }
  }

  async cancelConsultation(bookingId) {
    try {
      const booking = await db.queryOne(
        'SELECT * FROM consultation_bookings WHERE id = $1',
        [bookingId]
      );

      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      await db.execute(
        'UPDATE consultation_bookings SET status = $1, cancelled_at = NOW() WHERE id = $2',
        ['cancelled', bookingId]
      );

      console.log(`[CALENDLY] Cancelled consultation ${bookingId}`);

      return {
        success: true,
        bookingId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[CALENDLY] Failed to cancel consultation:', error);
      return { success: false, error: error.message };
    }
  }

  async rescheduleConsultation(bookingId, newSlotTime) {
    try {
      const booking = await db.queryOne(
        'SELECT * FROM consultation_bookings WHERE id = $1',
        [bookingId]
      );

      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      if (booking.status === 'cancelled') {
        return { success: false, error: 'Cannot reschedule cancelled booking' };
      }

      await db.execute(
        'UPDATE consultation_bookings SET scheduled_time = $1, rescheduled_at = NOW() WHERE id = $2',
        [newSlotTime, bookingId]
      );

      console.log(`[CALENDLY] Rescheduled consultation ${bookingId}`);

      return {
        success: true,
        bookingId,
        newScheduledTime: newSlotTime,
        status: 'rescheduled'
      };
    } catch (error) {
      console.error('[CALENDLY] Failed to reschedule:', error);
      return { success: false, error: error.message };
    }
  }

  async getAdvisorSchedule(advisorId, month = null) {
    try {
      let query = `SELECT * FROM consultation_bookings
                   WHERE advisor_id = $1 AND status != 'cancelled'
                   ORDER BY scheduled_time ASC`;
      const params = [advisorId];

      if (month) {
        const [year, monthNum] = month.split('-');
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        query += ` AND scheduled_time >= $2 AND scheduled_time <= $3`;
        params.push(startDate, endDate);
      }

      const bookings = await db.queryMany(query, params);

      return {
        success: true,
        advisorId,
        bookings: bookings.map(b => ({
          bookingId: b.id,
          clientId: b.client_id,
          scheduledTime: b.scheduled_time,
          status: b.status,
          notes: b.notes
        }))
      };
    } catch (error) {
      console.error('[CALENDLY] Failed to get schedule:', error);
      return { success: false, error: error.message };
    }
  }

  async getClientConsultations(clientId) {
    try {
      const consultations = await db.queryMany(
        `SELECT * FROM consultation_bookings
         WHERE client_id = $1
         ORDER BY scheduled_time DESC`,
        [clientId]
      );

      return {
        success: true,
        clientId,
        consultations: consultations.map(c => ({
          bookingId: c.id,
          advisorId: c.advisor_id,
          scheduledTime: c.scheduled_time,
          status: c.status,
          notes: c.notes
        }))
      };
    } catch (error) {
      console.error('[CALENDLY] Failed to get client consultations:', error);
      return { success: false, error: error.message };
    }
  }

  async getAdvisorStats(advisorId) {
    try {
      const stats = await db.queryOne(
        `SELECT
          COUNT(*) as total_consultations,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          AVG(EXTRACT(DAY FROM COALESCE(completed_at, NOW()) - created_at)) as avg_duration
         FROM consultation_bookings
         WHERE advisor_id = $1`,
        [advisorId]
      );

      return {
        success: true,
        advisorId,
        stats: {
          totalConsultations: stats.total_consultations || 0,
          completed: stats.completed || 0,
          confirmed: stats.confirmed || 0,
          cancelled: stats.cancelled || 0,
          completionRate: stats.total_consultations > 0
            ? Math.round((stats.completed / stats.total_consultations) * 100)
            : 0,
          averageDurationDays: Math.round(stats.avg_duration || 0)
        }
      };
    } catch (error) {
      console.error('[CALENDLY] Failed to get stats:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CalendlyService();
