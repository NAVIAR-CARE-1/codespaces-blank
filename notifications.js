// Email notification system for NAVIAR CONSULT
// Supports SendGrid, Resend, and SMTP backends

const config = require('./config');

class NotificationService {
  constructor() {
    this.provider = config.email.provider || 'sendgrid';
    this.from = config.email.from || 'noreply@naviar.no';
  }

  async send(to, subject, htmlBody, textBody = null) {
    if (!config.features.enableNotifications) {
      console.log('[NOTIFICATIONS] Disabled in config, skipping:', subject);
      return { success: true, skipped: true };
    }

    try {
      if (this.provider === 'sendgrid') {
        return await this.sendViaMailer(to, subject, htmlBody, textBody);
      } else if (this.provider === 'resend') {
        return await this.sendViaResend(to, subject, htmlBody, textBody);
      } else if (this.provider === 'sendmail') {
        return await this.sendViaNodemailer(to, subject, htmlBody, textBody);
      } else {
        console.warn('[NOTIFICATIONS] Unknown provider:', this.provider);
        return { success: false, error: 'Unknown email provider' };
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] Send failed:', error);
      return { success: false, error: error.message };
    }
  }

  async sendViaMailer(to, subject, htmlBody, textBody) {
    // Mock implementation - would use sgMail in production
    console.log(`[EMAIL via Mailer] To: ${to}, Subject: ${subject}`);
    return { success: true, provider: 'mailer' };
  }

  async sendViaResend(to, subject, htmlBody, textBody) {
    // Mock implementation - would use Resend API in production
    console.log(`[EMAIL via Resend] To: ${to}, Subject: ${subject}`);
    return { success: true, provider: 'resend' };
  }

  async sendViaNodemailer(to, subject, htmlBody, textBody) {
    // Mock implementation - would use nodemailer in production
    console.log(`[EMAIL via SMTP] To: ${to}, Subject: ${subject}`);
    return { success: true, provider: 'smtp' };
  }

  // Notification templates

  async notifyIncidentReported(incident, org, employee) {
    const subject = `Incident Report: ${employee.name} — ${incident.start_date}`;
    const htmlBody = `
      <h2>New Incident Report</h2>
      <p>A new sick leave incident has been reported in your organization.</p>
      <dl>
        <dt>Employee:</dt>
        <dd>${employee.name} (${employee.email})</dd>
        <dt>Department:</dt>
        <dd>${employee.department || 'N/A'}</dd>
        <dt>Start Date:</dt>
        <dd>${incident.start_date}</dd>
        <dt>Severity:</dt>
        <dd><strong>${incident.severity}</strong></dd>
        <dt>Reason:</dt>
        <dd>${incident.reason || 'Not specified'}</dd>
      </dl>
      <p>
        <a href="${config.appUrl}/dashboard.html" style="display:inline-block;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:4px;">
          Review in Dashboard
        </a>
      </p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;">This is an automated notification from NAVIAR CONSULT.</p>
    `;

    const textBody = `
New Incident Report
Employee: ${employee.name}
Department: ${employee.department || 'N/A'}
Start Date: ${incident.start_date}
Severity: ${incident.severity}
Reason: ${incident.reason || 'Not specified'}

Review in dashboard: ${config.appUrl}/dashboard.html
    `;

    return this.send(org.billing_email || org.contact_email, subject, htmlBody, textBody);
  }

  async notifyAdvisorAssigned(incident, advisor, org, employee) {
    const subject = `Case Assignment: ${employee.name}`;
    const htmlBody = `
      <h2>New Case Assigned</h2>
      <p>You have been assigned a new case to manage.</p>
      <dl>
        <dt>Client:</dt>
        <dd>${employee.name}</dd>
        <dt>Organization:</dt>
        <dd>${org.name}</dd>
        <dt>Incident Date:</dt>
        <dd>${incident.start_date}</dd>
        <dt>Severity:</dt>
        <dd><strong>${incident.severity}</strong></dd>
      </dl>
      <p>
        <a href="${config.appUrl}/advisor-portal.html" style="display:inline-block;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:4px;">
          View in Advisor Portal
        </a>
      </p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;">This is an automated notification from NAVIAR CONSULT.</p>
    `;

    const textBody = `
New Case Assigned
Client: ${employee.name}
Organization: ${org.name}
Incident Date: ${incident.start_date}
Severity: ${incident.severity}

View in advisor portal: ${config.appUrl}/advisor-portal.html
    `;

    return this.send(advisor.email, subject, htmlBody, textBody);
  }

  async notifyConsultationScheduled(consultation, client, advisor) {
    const scheduledDate = new Date(consultation.scheduled_date);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `Consultation Scheduled with ${advisor.name}`;
    const htmlBody = `
      <h2>Your Consultation is Confirmed</h2>
      <p>Your consultation has been scheduled with ${advisor.name}.</p>
      <dl>
        <dt>Date:</dt>
        <dd>${formattedDate} at ${formattedTime}</dd>
        <dt>Duration:</dt>
        <dd>${consultation.duration_minutes} minutes</dd>
        <dt>Topic:</dt>
        <dd>${consultation.notes || 'General consultation'}</dd>
      </dl>
      <p style="margin-top:24px;">
        <strong>How to Join:</strong>
        The consultation link will be sent to you 30 minutes before the scheduled time.
      </p>
      <p style="margin-top:24px;">
        <a href="${config.appUrl}/client-portal.html" style="display:inline-block;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:4px;">
          View My Consultations
        </a>
      </p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;">This is an automated notification from NAVIAR CONSULT.</p>
    `;

    const textBody = `
Your Consultation is Confirmed

Date: ${formattedDate} at ${formattedTime}
Duration: ${consultation.duration_minutes} minutes
Topic: ${consultation.notes || 'General consultation'}

The consultation link will be sent 30 minutes before the scheduled time.

View consultations: ${config.appUrl}/client-portal.html
    `;

    return this.send(client.email, subject, htmlBody, textBody);
  }

  async notifyFollowupScheduled(followup, advisor, incident, org) {
    const subject = `Follow-up Scheduled: ${incident.id}`;
    const htmlBody = `
      <h2>Follow-up Action Scheduled</h2>
      <p>A follow-up has been scheduled for one of your cases.</p>
      <dl>
        <dt>Scheduled Date:</dt>
        <dd>${followup.scheduled_date}</dd>
        <dt>Action:</dt>
        <dd>${followup.action_description}</dd>
      </dl>
      <p>
        <a href="${config.appUrl}/advisor-portal.html" style="display:inline-block;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:4px;">
          View in Advisor Portal
        </a>
      </p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;">This is an automated notification from NAVIAR CONSULT.</p>
    `;

    const textBody = `
Follow-up Action Scheduled

Scheduled Date: ${followup.scheduled_date}
Action: ${followup.action_description}

View in advisor portal: ${config.appUrl}/advisor-portal.html
    `;

    return this.send(advisor.email, subject, htmlBody, textBody);
  }

  async notifyReturnToWorkMilestone(incident, employee, org, milestone) {
    const subject = `Return-to-Work Milestone: ${milestone.title}`;
    const htmlBody = `
      <h2>${milestone.title}</h2>
      <p>We're pleased to inform you about your progress toward return to work.</p>
      <dl>
        <dt>Milestone:</dt>
        <dd>${milestone.title}</dd>
        <dt>Date:</dt>
        <dd>${milestone.date}</dd>
        <dt>Progress:</dt>
        <dd>${milestone.description}</dd>
      </dl>
      <p>
        <a href="${config.appUrl}/client-portal.html" style="display:inline-block;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:4px;">
          View Your Progress
        </a>
      </p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;">This is an automated notification from NAVIAR CONSULT.</p>
    `;

    const textBody = `
${milestone.title}

Milestone: ${milestone.title}
Date: ${milestone.date}
Progress: ${milestone.description}

View your progress: ${config.appUrl}/client-portal.html
    `;

    return this.send(employee.email, subject, htmlBody, textBody);
  }

  async notifyConsultationReminder(consultation, client, advisor, hoursUntil = 24) {
    const scheduledDate = new Date(consultation.scheduled_date);
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `Reminder: Consultation with ${advisor.name} in ${hoursUntil} hours`;
    const htmlBody = `
      <h2>Upcoming Consultation Reminder</h2>
      <p>Your consultation with ${advisor.name} is coming up soon.</p>
      <dl>
        <dt>Time:</dt>
        <dd>${formattedTime} today</dd>
        <dt>Topic:</dt>
        <dd>${consultation.notes || 'General consultation'}</dd>
      </dl>
      <p style="margin-top:24px;">
        The consultation link will be sent 30 minutes before the scheduled time.
      </p>
      <p style="margin-top:24px;">
        <a href="${config.appUrl}/client-portal.html" style="display:inline-block;padding:10px 20px;background:#22c55e;color:white;text-decoration:none;border-radius:4px;">
          View Consultation Details
        </a>
      </p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;">This is an automated notification from NAVIAR CONSULT.</p>
    `;

    const textBody = `
Upcoming Consultation Reminder

Time: ${formattedTime} today
Topic: ${consultation.notes || 'General consultation'}

The consultation link will be sent 30 minutes before the scheduled time.

View consultation details: ${config.appUrl}/client-portal.html
    `;

    return this.send(client.email, subject, htmlBody, textBody);
  }
}

module.exports = new NotificationService();
