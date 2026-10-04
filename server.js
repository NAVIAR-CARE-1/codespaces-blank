// NAVIAR CONSULT — Backend API
// Node.js + Express server for SaaS platform

const crypto = require('crypto');
const express = require('express');
const config = require('./config');
const db = require('./db');
const auth = require('./auth');
const utils = require('./utils');
const notifications = require('./notifications');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = Array.isArray(config.cors.origin)
    ? config.cors.origin
    : [config.cors.origin];

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.queryOne('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: result ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, orgId, type } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!utils.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await db.queryOne(
      'SELECT id FROM org_admins WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = auth.hashPassword(password);
    const userId = crypto.randomUUID();

    await db.execute(
      'INSERT INTO org_admins (id, org_id, email, name, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, orgId, email, name || email.split('@')[0], 'admin']
    );

    const token = auth.generateToken({ userId, email, orgId, role: 'admin' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, name }
    });
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db.queryOne(
      'SELECT * FROM org_admins WHERE email = $1',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // TODO: Implement bcrypt verification
    const isValidPassword = auth.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = auth.generateToken({
      userId: user.id,
      email: user.email,
      orgId: user.org_id,
      role: user.role
    });

    res.json({
      token,
      user: utils.sanitize(user)
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  const decoded = auth.verifyToken(refreshToken);
  if (!decoded || decoded.type !== 'refresh') {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const token = auth.generateToken(decoded);
  res.json({ token });
});

// Organization routes
app.get('/api/orgs/:id', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const org = await db.queryOne(
      'SELECT * FROM organizations WHERE id = $1',
      [id]
    );

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(org);
  } catch (error) {
    console.error('[ORG] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

app.get('/api/orgs/:id/incidents', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity, limit = 20, offset = 0 } = req.query;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    let query = 'SELECT * FROM incidents WHERE org_id = $1';
    const params = [id];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const incidents = await db.queryMany(query, params);
    const countResult = await db.queryOne(
      'SELECT COUNT(*) as total FROM incidents WHERE org_id = $1',
      [id]
    );

    res.json(utils.formatPaginatedResponse(incidents, countResult.total, 1, limit));
  } catch (error) {
    console.error('[INCIDENTS] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

app.post('/api/orgs/:id/incidents', auth.authenticate, auth.requireOrgAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, startDate, endDate, severity = 'medium', reason } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    if (!employeeId || !startDate) {
      return res.status(400).json({ error: 'Employee ID and start date required' });
    }

    if (!utils.isValidDate(startDate)) {
      return res.status(400).json({ error: 'Invalid start date format (YYYY-MM-DD)' });
    }

    const incidentId = crypto.randomUUID();

    await db.execute(
      `INSERT INTO incidents
       (id, org_id, employee_id, status, start_date, end_date, severity, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [incidentId, id, employeeId, 'reported', startDate, endDate || null, severity, reason || null]
    );

    res.status(201).json({
      id: incidentId,
      status: 'reported',
      message: 'Incident reported successfully'
    });

    // Send notification asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        const org = await db.queryOne('SELECT * FROM organizations WHERE id = $1', [id]);
        const employee = await db.queryOne('SELECT * FROM employees WHERE id = $1', [employeeId]);
        if (org && employee) {
          const incident = { start_date: startDate, severity, reason };
          await notifications.notifyIncidentReported(incident, org, employee);
        }
      } catch (err) {
        console.error('[NOTIFICATIONS] Failed to send incident notification:', err);
      }
    });
  } catch (error) {
    console.error('[INCIDENTS] Create error:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

app.patch('/api/incidents/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid incident ID' });
    }

    let query = 'UPDATE incidents SET updated_at = NOW()';
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += `, status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (severity) {
      query += `, severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex} RETURNING *`;
    params.push(id);

    const incident = await db.queryOne(query, params);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    console.error('[INCIDENTS] Update error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Advisor routes
app.get('/api/advisors/:id/cases', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid advisor ID' });
    }

    const cases = await db.queryMany(
      `SELECT ca.*, i.* FROM case_assignments ca
       JOIN incidents i ON ca.incident_id = i.id
       WHERE ca.advisor_id = $1 AND ca.status != 'completed'
       ORDER BY ca.assigned_date DESC`,
      [id]
    );

    res.json(cases);
  } catch (error) {
    console.error('[ADVISORS] Cases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

app.post('/api/cases/:id/notes', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { advisorId, noteText, noteType = 'observation' } = req.body;

    if (!utils.isValidUUID(id) || !utils.isValidUUID(advisorId)) {
      return res.status(400).json({ error: 'Invalid case or advisor ID' });
    }

    if (!noteText) {
      return res.status(400).json({ error: 'Note text required' });
    }

    const noteId = crypto.randomUUID();

    await db.execute(
      `INSERT INTO case_notes
       (id, incident_id, advisor_id, note_text, note_type, is_encrypted)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [noteId, id, advisorId, noteText, noteType, true]
    );

    res.status(201).json({
      id: noteId,
      timestamp: new Date().toISOString(),
      message: 'Note created successfully'
    });
  } catch (error) {
    console.error('[CASES] Note creation error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.post('/api/cases/:id/schedule-followup', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { advisorId, scheduledDate, actionDescription } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid incident ID' });
    }

    if (!utils.isValidDate(scheduledDate)) {
      return res.status(400).json({ error: 'Invalid scheduled date (YYYY-MM-DD)' });
    }

    const followupId = crypto.randomUUID();

    await db.execute(
      `INSERT INTO followups
       (id, incident_id, advisor_id, scheduled_date, action_description, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [followupId, id, advisorId || null, scheduledDate, actionDescription, 'pending']
    );

    res.status(201).json({
      id: followupId,
      status: 'pending',
      message: 'Follow-up scheduled successfully'
    });
  } catch (error) {
    console.error('[FOLLOWUPS] Schedule error:', error);
    res.status(500).json({ error: 'Failed to schedule follow-up' });
  }
});

// Client routes
app.get('/api/client/profile', auth.authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const client = await db.queryOne(
      'SELECT * FROM individual_clients WHERE email = $1',
      [req.user.email]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    res.json(utils.sanitize(client));
  } catch (error) {
    console.error('[CLIENT] Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/client/consultations', auth.authenticate, async (req, res) => {
  try {
    const { advisorId, scheduledDate, durationMinutes = 60, topic } = req.body;

    if (!utils.isValidUUID(advisorId)) {
      return res.status(400).json({ error: 'Invalid advisor ID' });
    }

    const client = await db.queryOne(
      'SELECT id FROM individual_clients WHERE email = $1',
      [req.user.email]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const consultationId = crypto.randomUUID();

    await db.execute(
      `INSERT INTO consultations
       (id, client_id, advisor_id, scheduled_date, duration_minutes, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [consultationId, client.id, advisorId, scheduledDate, durationMinutes, 'scheduled', topic]
    );

    res.status(201).json({
      id: consultationId,
      status: 'scheduled',
      message: 'Consultation booked successfully'
    });

    // Send confirmation notification asynchronously
    setImmediate(async () => {
      try {
        const advisor = await db.queryOne('SELECT * FROM advisors WHERE id = $1', [advisorId]);
        if (advisor) {
          const consultation = { scheduled_date: scheduledDate, duration_minutes: durationMinutes, notes: topic };
          await notifications.notifyConsultationScheduled(
            consultation,
            { email: req.user.email, name: req.user.name },
            advisor
          );
        }
      } catch (err) {
        console.error('[NOTIFICATIONS] Failed to send consultation notification:', err);
      }
    });
  } catch (error) {
    console.error('[CONSULTATIONS] Booking error:', error);
    res.status(500).json({ error: 'Failed to book consultation' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = config.isDev ? err.message : 'Internal server error';

  res.status(statusCode).json({
    error: 'Internal server error',
    message,
    ...(config.isDev && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await db.close();
    process.exit(0);
  });
});

// Start server
const PORT = config.port;
const server = app.listen(PORT, config.host, () => {
  console.log(`[SERVER] NAVIAR API listening on http://${config.host}:${PORT}`);
  console.log(`[SERVER] Environment: ${config.env}`);
  console.log(`[SERVER] Health check: http://${config.host}:${PORT}/api/health`);
  console.log(`[SERVER] Database: ${config.database.url.split('@')[1] || 'local'}`);
});

module.exports = app;
