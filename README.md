# NAVIAR CONSULT - Norwegian Workplace Incident Management Platform

A comprehensive SaaS platform for managing workplace incidents, employee consultations, and return-to-work programs in Norwegian organizations, fully compliant with Norwegian labor law (Arbeidsmiljøloven) and GDPR.

## Features

### Core Platform
- **Incident Management** - Comprehensive incident reporting, tracking, and resolution
- **Advisor Portal** - Advanced case management and follow-up scheduling
- **Client Dashboard** - Self-service incident reporting and consultation tracking
- **Analytics & Reporting** - Anonymized aggregate data for organizational insights

### Integration Capabilities
- **Calendly Integration** - Advisor scheduling and availability management
- **Whereby (Video Conferencing)** - Secure video consultations with recording
- **SAP SuccessFactors** - HR employee data, compensation, performance metrics
- **Visma (Accounting)** - Norwegian payroll, invoicing, and financial reporting
- **Stripe Payment** - Subscription billing and payment processing

### Security & Compliance
- **AES-256-CBC Encryption** - Sensitive document encryption at rest
- **JWT Authentication** - Secure token-based authentication with role-based access control
- **HMAC-SHA256 Webhook Verification** - Secure webhook signature verification
- **Audit Logging** - Comprehensive action logging for compliance
- **GDPR Compliant** - Privacy by design, data retention policies

### Multi-Language Support
- Norwegian (Bokmål)
- English
- Turkish

### Norwegian Compliance
- Automatic tax calculation and VAT handling
- Employee absence and sick leave tracking
- 7-year consultation record retention (Norwegian law requirement)
- 10-year financial record retention (Norwegian tax law)

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL with 13 normalized tables
- **Authentication:** JWT with bcrypt password hashing
- **Payment:** Stripe API integration
- **Email:** SMTP with async notifications
- **Encryption:** crypto module with AES-256-CBC

### Architecture
- RESTful API with modular route design
- Service layer for business logic separation
- Database abstraction layer for security
- Middleware-based request processing pipeline
- Error handling with consistent response format

## Project Structure

```
├── server.js                 # Main application entry point
├── config.js                 # Configuration management
├── db.js                     # Database connection and queries
├── auth.js                   # JWT authentication and password hashing
├── utils.js                  # Utility functions and validators
├── notifications.js          # Email notification service
├── schema.sql                # Database schema and migrations
│
├── Core Routes
├── billing-routes.js         # Subscription and billing endpoints
├── documents-routes.js       # Document management endpoints
├── usage-routes.js           # Usage monitoring endpoints
├── analytics-routes.js       # Analytics and reporting endpoints
│
├── Integration Services
├── calendly.js               # Calendly integration service
├── whereby.js                # Whereby video integration service
├── sap-successfactors.js     # SAP SuccessFactors HR integration
├── visma.js                  # Visma accounting integration
├── payments.js               # Stripe payment service
├── stripe-webhooks.js        # Stripe webhook handler
├── invoices.js               # Invoice management service
│
├── Integration Routes
├── calendly-routes.js        # Calendly REST endpoints
├── whereby-routes.js         # Whereby REST endpoints
├── sap-routes.js             # SAP SuccessFactors REST endpoints
├── visma-routes.js           # Visma REST endpoints
│
├── Frontend (HTML/CSS/JS)
├── dashboard.html            # Organization dashboard
├── advisor-portal.html       # Advisor portal
├── language-switcher.js      # Multi-language support
├── styles.css                # Application styles
│
├── Documentation
├── API.md                    # Complete API documentation
├── README.md                 # This file
└── .env.example              # Environment variable template
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
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

4. **Set up database**
```bash
psql -U postgres -d postgres -f schema.sql
```

5. **Start the server**
```bash
npm start
```

Server runs on http://localhost:3000

## API Documentation

Complete API documentation is available in `API.md` including:
- All REST endpoints
- Request/response examples
- Authentication requirements
- Error handling
- Rate limiting
- Data retention policies

## Database Schema

The system uses 13 normalized PostgreSQL tables:

### Organizations & Users
- `organizations` - Organization accounts
- `org_admins` - Administrator accounts with roles
- `individual_clients` - Client profiles

### Incident Management
- `incidents` - Workplace incidents
- `case_assignments` - Case advisor assignments
- `case_notes` - Incident documentation
- `followups` - Follow-up actions

### Consultations
- `consultation_bookings` - Consultation reservations
- `meeting_rooms` - Whereby meeting spaces
- `meeting_recordings` - Video consultation recordings
- `meeting_access_tokens` - Access control tokens

### Billing & Subscriptions
- `subscriptions` - Active subscriptions
- `invoices` - Generated invoices
- `webhook_events` - Stripe webhook events

### Documents
- `documents` - Encrypted document storage
- `document_shares` - Share tokens and permissions

### Usage & Analytics
- `usage_logs` - Usage tracking
- `analytics_events` - Event tracking for analytics

### HR Integration
- `employee_compensation` - Salary and benefits
- `performance_ratings` - Employee performance reviews
- `employee_absences` - Sick leave and absence tracking
- `sap_syncs` - SAP SuccessFactors sync records

### Accounting
- `payroll_records` - Processed payroll
- `visma_invoices` - Synchronized invoices
- `expense_reports` - Expense tracking
- `chart_of_accounts` - Accounting chart
- `financial_reports` - Generated reports
- `tax_compliance` - Tax filing status

## Authentication

The platform uses JWT for stateless authentication:

```javascript
// Login returns JWT token
POST /api/auth/login
{
  "email": "user@example.no",
  "password": "secure_password"
}

// Response includes JWT token
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "email", "name": "name" }
}

// Include token in subsequent requests
Authorization: Bearer <token>
```

## Billing Plans

Three subscription tiers:

| Plan | Price | Employees | Advisors | Storage |
|------|-------|-----------|----------|---------|
| Essentials | 2,990 NOK/mo | 50 | 5 | 10 GB |
| Professional | 7,990 NOK/mo | 500 | 20 | 100 GB |
| Enterprise | 19,990 NOK/mo | Unlimited | Unlimited | Unlimited |

## Integrations

### Calendly
- Advisor availability management
- Consultation scheduling
- Automated reminders

### Whereby
- Secure video conferencing
- Meeting recording and playback
- Access token-based authentication

### SAP SuccessFactors
- Employee master data sync
- Compensation management
- Performance ratings
- Absence tracking

### Visma
- Payroll processing
- Invoice generation and tracking
- Expense reporting
- Financial reporting (income statement, balance sheet)
- Tax compliance tracking

### Stripe
- Subscription management
- Payment processing
- Invoice generation
- Webhook event handling

## Security Features

- **Encryption at Rest:** AES-256-CBC for sensitive documents
- **Encryption in Transit:** HTTPS/TLS for all communications
- **Authentication:** JWT with bcrypt password hashing
- **Authorization:** Role-based access control (RBAC)
- **Audit Logging:** Comprehensive action logging
- **Rate Limiting:** 1000-unlimited requests/hour by plan
- **CORS Protection:** Configurable origin whitelist
- **CSRF Protection:** Token-based protection
- **SQL Injection Prevention:** Parameterized queries
- **Timing-Safe Comparison:** HMAC signature verification

## Compliance

### GDPR
- Privacy by design
- Data minimization
- Right to erasure (soft delete)
- Data portability support
- Consent management
- Privacy notices and terms

### Norwegian Law
- **Arbeidsmiljøloven (Working Environment Act)** compliance
- **Personopplysningsloven (Personal Data Act)** compliance
- 7-year consultation record retention
- 10-year financial record retention
- Norwegian tax reporting (Visma integration)
- Employee absence tracking (sickness, maternity, etc.)

### Internationalization
- Multi-language UI (NO/EN/TR)
- Localized error messages
- Currency support (primarily NOK)
- Timezone handling (Europe/Oslo default)

## Development

### Run with Mock External APIs
```bash
MOCK_EXTERNAL_APIS=true npm start
```

### Enable Debug Mode
```bash
DEBUG=true npm start
```

### Run Tests
```bash
npm test
```

## Production Deployment

1. **Set environment to production**
```bash
NODE_ENV=production
```

2. **Enable security features**
```bash
HTTPS_ONLY=true
SECURE_COOKIES=true
CSRF_PROTECTION=true
```

3. **Configure external services**
- Stripe API keys
- Calendly API token
- Whereby API credentials
- SAP SuccessFactors connection
- Visma connection
- Email SMTP settings

4. **Database setup**
```bash
npm run migrate
```

5. **Start application**
```bash
npm start
```

## Monitoring & Logging

Logs are output to console in JSON format for easy parsing:

```json
{
  "timestamp": "2026-01-15T10:00:00Z",
  "level": "info",
  "module": "[BILLING]",
  "message": "Subscription created",
  "subscriptionId": "sub_xxx",
  "status": "active"
}
```

Supported log levels: debug, info, warn, error

## Support & Contact

- **Documentation:** See API.md for complete reference
- **Issues:** Report on GitHub
- **Email:** support@naviar.no

## License

© 2026 NAVIAR CONSULT AS. All rights reserved.

---

**Last Updated:** 2026-01-15
**Version:** 1.0.0
**Status:** Production Ready
