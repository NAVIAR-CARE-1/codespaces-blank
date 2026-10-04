# NAVIAR CONSULT — Sick Leave Advisory Platform

**Professional sick leave follow-up (sykefraværsoppfølging) platform for Norway**

World-class advisory service combining human expertise with technology to support employees during health challenges and guide their return to work.

---

## 🎯 Mission

Enable ethical, professional, privacy-first sick leave management through expert advisor guidance and structured follow-up, reducing absence duration while maintaining employee dignity and employer compliance.

---

## 📦 Project Structure

### Frontend (Public-Facing & Dashboards)

```
index.html                 # Public website (marketing, methodology, trust-building)
dashboard.html             # B2B SaaS: HR Manager organization dashboard
advisor-portal.html        # Advisor workspace: case management, notes, scheduling
client-portal.html         # B2C: Individual client interface (planned)
naviar.css                 # WEB-28 design system (shared across all frontends)
language-switcher.js       # i18n for Norwegian, English, Turkish (planned)
```

### Backend (Node.js + Express)

```
server.js                  # Express application with all API routes
config.js                  # Centralized configuration (env, database, services)
db.js                      # PostgreSQL connection pool and query helpers
auth.js                    # JWT authentication and authorization middleware
utils.js                   # Validation, pagination, sanitization helpers
schema.sql                 # Complete PostgreSQL database schema
package.json               # Dependencies and npm scripts
.env.example               # Environment variable template
```

### Documentation

```
PLATFORM_STRATEGY.md       # Comprehensive business model and roadmap
README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 12
- Git

### Installation

1. **Clone repository**
```bash
git clone https://github.com/NAVIAR-CARE-1/codespaces-blank.git
cd codespaces-blank
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize database**
```bash
npm run db:init
```

5. **Start development server**
```bash
npm run dev
```

Server runs on http://localhost:3000

---

## 📋 API Documentation

### Authentication Endpoints

**Register**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe",
  "type": "admin|advisor|client"
}

Response: { token, user }
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}

Response: { token, user }
```

**Refresh Token**
```
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "token" }

Response: { token }
```

### Organization Endpoints (Requires Authentication)

**Get Organization**
```
GET /api/orgs/:id
Authorization: Bearer <token>

Response: { id, name, plan, employees_count, ... }
```

**List Incidents**
```
GET /api/orgs/:id/incidents?status=active&severity=high&limit=20
Authorization: Bearer <token>

Response: { data: [], pagination: { page, perPage, total, totalPages } }
```

**Report Incident**
```
POST /api/orgs/:id/incidents
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "uuid",
  "startDate": "2026-10-01",
  "severity": "medium|low|high",
  "reason": "Optional description"
}

Response: { id, status: "reported", message }
```

**Update Incident**
```
PATCH /api/incidents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "reported|reviewed|in-progress|closed",
  "severity": "low|medium|high"
}

Response: Updated incident object
```

### Advisor Endpoints

**Get Advisor Cases**
```
GET /api/advisors/:id/cases
Authorization: Bearer <token>

Response: Array of case assignments with incident details
```

**Add Case Note**
```
POST /api/cases/:id/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "advisorId": "uuid",
  "noteText": "Confidential notes...",
  "noteType": "observation|action|followup|recommendation"
}

Response: { id, timestamp, message }
```

**Schedule Follow-up**
```
POST /api/cases/:id/schedule-followup
Authorization: Bearer <token>
Content-Type: application/json

{
  "advisorId": "uuid",
  "scheduledDate": "2026-10-15",
  "actionDescription": "Phone consultation..."
}

Response: { id, status: "pending", message }
```

### Client Endpoints

**Get Profile**
```
GET /api/client/profile
Authorization: Bearer <token>

Response: Client profile object
```

**Book Consultation**
```
POST /api/client/consultations
Authorization: Bearer <token>
Content-Type: application/json

{
  "advisorId": "uuid",
  "scheduledDate": "2026-10-15T14:00:00Z",
  "durationMinutes": 60,
  "topic": "Return-to-work planning"
}

Response: { id, status: "scheduled", message }
```

### Health Check

```
GET /api/health

Response: { status: "ok", timestamp, database: "connected|disconnected" }
```

---

## 🏗️ Database Schema

### Core Tables

**organizations** - B2B customer companies
- id (UUID)
- name, orgNumber (unique)
- plan (essentials, professional, enterprise)
- employees_count
- created_at, updated_at

**employees** - Employee roster
- id (UUID)
- org_id (foreign key)
- name, email, phone, position, department
- created_at

**incidents** - Sick leave events
- id (UUID)
- org_id (foreign key)
- employee_id (foreign key, nullable)
- status (reported, reviewed, in-progress, closed)
- start_date, end_date
- reason, severity (low, medium, high)
- created_at, updated_at

**advisors** - Professional advisors
- id (UUID)
- email (unique), name
- credentials, bio
- max_caseload (default: 15)
- active (boolean)
- created_at

**case_assignments** - Incident-to-advisor linking
- id (UUID)
- incident_id, advisor_id (foreign keys)
- status (assigned, active, completed)
- assigned_date, completed_date

**case_notes** - Confidential advisor observations
- id (UUID)
- incident_id, advisor_id (foreign keys)
- note_text
- note_type (observation, action, followup, recommendation)
- is_encrypted (default: true)
- created_at

**individual_clients** - B2C clients
- id (UUID)
- email (unique), name, phone
- health_notes, privacy_settings (JSONB)
- created_at

**consultations** - B2C consultations
- id (UUID)
- client_id, advisor_id (foreign keys)
- scheduled_date, duration_minutes
- status (scheduled, completed, cancelled)
- notes
- created_at

**subscriptions** - Billing information
- id (UUID)
- org_id (unique foreign key)
- plan, monthly_price
- billing_email
- status (active, paused, cancelled)
- next_billing_date
- created_at

**outcomes** - Resolution tracking
- id (UUID)
- incident_id (foreign key)
- resolution_type (return-to-work, transferred, disability, ongoing)
- days_to_resolution
- advisor_effectiveness_score (1-10)
- notes
- created_at

**audit_log** - Compliance logging
- id (UUID)
- user_id, action, resource_type, resource_id
- timestamp

See `schema.sql` for complete definitions with indexes.

---

## 🎨 Design System

### WEB-28 Design System (Swiss Precision + Scandinavian Restraint)

**Typography**
- Sora (display, 600/700) - Headlines and emphasis
- IBM Plex Sans (body, 400-600) - Main content
- IBM Plex Mono (code, 500) - Technical text

**Color Palette**
- Primary: `var(--green-900)` (#15803d), `var(--green-600)` (#22c55e)
- Secondary: `var(--brass)` (#d4af37) - Accent
- Neutral: `var(--paper)` (#fafaf8), `var(--text)` (#1f2937)
- Borders: `var(--border)` (#e5e7eb)

**Spacing (Fluid)**
- Gutter: `clamp(1rem, 3vw, 2rem)`
- Section: `clamp(2rem, 5vw, 4rem)`
- Responsive breakpoints: 320px, 390px, 480px, 768px, 1024px, 1440px

**Components**
- Buttons: Primary (green), Secondary (bordered), Disabled
- Cards: Elevated, bordered, hover states
- Badges: Status (4 colors), Priority (3 colors)
- Modals: Centered, scrollable body, footer actions
- Tables: Striped, hover, responsive

---

## 🔐 Security

### Authentication & Authorization

- **JWT Tokens**: 7-day expiration (configurable via JWT_EXPIRES_IN)
- **Refresh Tokens**: 30-day expiration for long-lived sessions
- **Password Hashing**: Bcrypt (implemented in auth.js)
- **Role-Based Access Control**: admin, advisor, employee roles
- **Organization Access Control**: Users can only access their organization

### Data Protection

- **Encryption at Rest**: AES-256 configured in PostgreSQL
- **Encryption in Transit**: TLS/HTTPS (configured in deployment)
- **Confidential Notes**: End-to-end encrypted, never accessible to organizations
- **Audit Logging**: All actions logged for compliance
- **GDPR Compliance**: Data retention policies, right to deletion

### Input Validation

- Email format validation
- UUID validation
- Date format validation (YYYY-MM-DD)
- Parameterized queries (SQL injection prevention)
- Rate limiting (implemented via express-rate-limit)

---

## 📈 Deployment

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/naviar
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# Optional (defaults provided)
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment

**Vercel** (Frontend)
- Deploy `index.html`, `dashboard.html`, `advisor-portal.html`
- Use Vercel Edge Functions for API fallback

**Railway / Fly.io** (Backend)
- Deploy Node.js server with PostgreSQL
- Environment variables via dashboard
- Auto-scaling based on CPU/memory

**AWS RDS** (Database)
- Managed PostgreSQL with automated backups
- Multi-AZ for high availability
- Encrypted at rest (AWS KMS)

---

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test -- --coverage

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📊 Feature Roadmap

### Phase 1 (MVP - Current)
- [x] Public website with branding
- [x] Organization dashboard (incident reporting, advisor assignment)
- [x] Advisor portal (case management, notes)
- [x] PostgreSQL schema with all core entities
- [x] Express.js API with authentication
- [x] Backend infrastructure (config, auth, utils)

### Phase 2 (Months 4-6)
- [ ] Individual client portal (consultations, documents)
- [ ] Email notifications (incidents, follow-ups, confirmations)
- [ ] Document management (uploads, storage, confidentiality)
- [ ] Calendly integration for scheduling
- [ ] Stripe payment integration (subscriptions)

### Phase 3 (Months 7-12)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Video consultation integration (Whereby)
- [ ] Norwegian HR system integrations (SAP SuccessFactors, Visma)
- [ ] Compliance documentation auto-generation

### Phase 4 (Year 2+)
- [ ] White-label SaaS for partners
- [ ] Nordic expansion (Swedish, Danish translations)
- [ ] AI-powered case recommendations
- [ ] Predictive analytics for absence risk
- [ ] Workplace return-to-work mentoring network

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes with clear commit messages
3. Push to remote: `git push origin feature/your-feature`
4. Create pull request with description

**Commit Message Format**
```
[FEATURE|FIX|REFACTOR] Brief description

- Detailed change 1
- Detailed change 2

Related to: #issue-number
```

---

## 📞 Support

**Issues & Bug Reports**: [GitHub Issues](https://github.com/NAVIAR-CARE-1/codespaces-blank/issues)

**Documentation**: See `PLATFORM_STRATEGY.md` for business model, roadmap, and comprehensive architecture.

---

## 📄 License

Proprietary - NAVIAR Team 2026

---

## 🙏 Acknowledgments

- WEB-28 Design System (Swiss precision + Scandinavian restraint)
- Norwegian IA Agreement (Inkluderende Arbeidsliv) compliance framework
- Professional advisors and occupational health experts in Norway

---

**Last Updated**: 2026-10-04  
**Version**: 0.1.0 (MVP)  
**Status**: 🚀 Active Development
