# NAVIAR CONSULT API Documentation

## Base URL
```
https://api.naviar-consult.no/api
```

## Authentication
All endpoints (except `/auth/*`) require JWT token in `Authorization: Bearer <token>` header.

---

## Authentication Routes

### Register User
```
POST /auth/register
```
**Body:**
```json
{
  "email": "user@example.no",
  "password": "secure_password",
  "name": "User Name",
  "orgId": "uuid",
  "type": "admin"
}
```

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.no",
  "password": "secure_password"
}
```
**Response:**
```json
{
  "token": "jwt_token",
  "user": { "id": "uuid", "email": "email", "name": "name" }
}
```

### Refresh Token
```
POST /auth/refresh
```
**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

---

## Billing Routes

### Get Subscription
```
GET /orgs/:id/subscription
```

### List Plans
```
GET /plans
```

### Create Subscription
```
POST /orgs/:id/subscription
```
**Body:**
```json
{
  "plan": "professional",
  "billingEmail": "billing@example.no",
  "paymentMethodId": "pm_xxx"
}
```

### Update Subscription Plan
```
PATCH /orgs/:id/subscription
```
**Body:**
```json
{
  "newPlan": "enterprise"
}
```

### Cancel Subscription
```
DELETE /orgs/:id/subscription
```

### Get Invoices
```
GET /orgs/:id/invoices?limit=12&offset=0
```

### Get Invoice Details
```
GET /invoices/:id
```

### Download Invoice
```
GET /invoices/:id/download
```

### Stripe Webhook
```
POST /webhooks/stripe
```

---

## Document Management Routes

### Upload Document
```
POST /documents/upload
```
**Form Data:**
```
file: <binary>
consultationId: uuid
confidential: boolean (optional, default: false)
description: string (optional)
```

### Get Document
```
GET /documents/:id
```

### Download Document
```
GET /documents/:id/download
```

### Delete Document
```
DELETE /documents/:id
```

### List Documents
```
GET /documents?limit=20&offset=0
```

### Update Document Metadata
```
PATCH /documents/:id
```
**Body:**
```json
{
  "description": "Updated description",
  "tags": ["tag1", "tag2"]
}
```

### Share Document
```
POST /documents/:id/share
```
**Body:**
```json
{
  "recipientEmail": "recipient@example.no",
  "expirationDays": 30
}
```

### Verify Share Access
```
GET /documents/:id/verify-access?token=share_token
```

### Document Statistics
```
GET /documents/stats/overview
```

---

## Usage Monitoring Routes

### Get Current Usage
```
GET /usage/current
```

### Get Usage Warnings
```
GET /usage/warnings
```

### Check Limit
```
POST /usage/check-limit
```
**Body:**
```json
{
  "limitType": "employees"
}
```

### Get Usage History
```
GET /usage/history?period=30
```

### Get Upgrade Suggestion
```
GET /usage/upgrade-suggestion
```

### Usage Report
```
GET /usage/report
```

---

## Calendly Integration Routes

### Get Advisor Availability
```
GET /advisors/:id/availability?startDate=2026-01-01&endDate=2026-01-31
```

### Book Consultation
```
POST /consultations/book
```
**Body:**
```json
{
  "advisorId": "uuid",
  "clientId": "uuid",
  "slotTime": "2026-01-15T10:00:00Z",
  "notes": "Optional notes"
}
```

### Reschedule Consultation
```
PATCH /consultations/:id
```
**Body:**
```json
{
  "newSlotTime": "2026-01-16T14:00:00Z"
}
```

### Cancel Consultation
```
DELETE /consultations/:id
```

### Get Advisor Schedule
```
GET /advisors/:id/schedule?month=2026-01
```

### Get Client Consultations
```
GET /clients/:id/consultations
```

### Get Advisor Statistics
```
GET /advisors/:id/stats
```

---

## Whereby (Video Consultation) Routes

### Create Meeting Room
```
POST /meetings/create
```
**Body:**
```json
{
  "consultationId": "uuid",
  "advisorId": "uuid",
  "clientId": "uuid",
  "roomName": "Consultation Room",
  "duration": 60,
  "recordingEnabled": true
}
```

### Start Meeting
```
POST /meetings/:id/start
```

### End Meeting
```
POST /meetings/:id/end
```

### Get Meeting Details
```
GET /meetings/:id
```

### Get Recordings
```
GET /meetings/:id/recordings
```

### Store Recording
```
POST /meetings/:id/recordings
```
**Body:**
```json
{
  "recordingUrl": "https://storage.example.com/recording.mp4",
  "duration": 3600,
  "fileSize": 500000000
}
```

### Generate Access Token
```
POST /meetings/:id/access-token
```
**Body:**
```json
{
  "userId": "uuid",
  "role": "participant"
}
```

### Verify Access Token
```
POST /meetings/:id/verify-token
```
**Body:**
```json
{
  "token": "access_token"
}
```

### Get Meeting Statistics
```
GET /consultations/:id/meeting-stats
```

---

## SAP SuccessFactors Integration Routes

### Sync Employee Data
```
POST /employees/:id/sync
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.no",
  "department": "HR",
  "position": "Manager",
  "hireDate": "2024-01-15",
  "salary": 500000,
  "workStatus": "active"
}
```

### Get Employee Profile
```
GET /employees/:id/profile
```

### Get Compensation Data
```
GET /employees/:id/compensation
```

### Update Compensation
```
PATCH /employees/:id/compensation
```
**Body:**
```json
{
  "salary": 550000,
  "bonus": 50000,
  "benefits": ["health_insurance", "pension"],
  "pensionContribution": 50000
}
```

### Get Performance Rating
```
GET /employees/:id/performance?year=2026
```

### Create Performance Rating
```
POST /employees/:id/performance
```
**Body:**
```json
{
  "overallRating": 4.5,
  "reviewDate": "2026-01-15",
  "reviewerId": "uuid",
  "comments": "Excellent performance",
  "goals": ["Goal 1", "Goal 2"],
  "developmentAreas": ["Area 1"]
}
```

### Sync Absence Data
```
POST /employees/:id/absences
```
**Body:**
```json
{
  "absenceType": "sick_leave",
  "startDate": "2026-01-15",
  "endDate": "2026-01-20",
  "reason": "Medical leave",
  "status": "pending"
}
```

### Get Organization Chart
```
GET /org-chart?departmentId=dept_uuid
```

### Get SAP Sync Status
```
GET /sap/sync-status
```

---

## Visma (Accounting & Payroll) Routes

### Sync Payroll
```
POST /payroll/:employeeId/sync
```
**Body:**
```json
{
  "salaryAmount": 50000,
  "bonusAmount": 5000,
  "deductions": [
    { "type": "tax", "amount": 12500 },
    { "type": "pension", "amount": 2500 }
  ],
  "taxRate": 0.22,
  "payPeriodStart": "2026-01-01",
  "payPeriodEnd": "2026-01-31",
  "paymentDate": "2026-02-01"
}
```

### Get Payroll History
```
GET /payroll/:employeeId/history?months=12
```

### Create Invoice
```
POST /invoices
```
**Body:**
```json
{
  "invoiceNumber": "INV-2026-001",
  "clientId": "uuid",
  "invoiceDate": "2026-01-15",
  "dueDate": "2026-02-15",
  "amount": 50000,
  "currency": "NOK",
  "description": "Consultation Services",
  "lineItems": [
    { "description": "Item 1", "quantity": 1, "unitPrice": 50000 }
  ]
}
```

### Get Invoice Status
```
GET /invoices/:id/status
```

### Sync Expense
```
POST /expenses
```
**Body:**
```json
{
  "expenseType": "travel",
  "amount": 5000,
  "currency": "NOK",
  "date": "2026-01-15",
  "description": "Flight to Oslo",
  "vendor": "Airline Company",
  "costCenter": "cc_001",
  "projectId": "proj_001",
  "receipt": "https://storage.example.com/receipt.pdf"
}
```

### Get Account Chart
```
GET /chart-of-accounts
```

### Generate Financial Report
```
POST /financial-reports
```
**Body:**
```json
{
  "reportType": "income_statement",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

### Get Tax Compliance
```
GET /tax-compliance
```

### Get Visma Sync Status
```
GET /visma/sync-status
```

---

## Analytics Routes

### Get Key Metrics
```
GET /analytics/metrics
```

### Get Incident Trends
```
GET /analytics/trends?period=30
```

### Get Advisor Performance
```
GET /analytics/advisors
```

### Get Incident Distribution
```
GET /analytics/distribution
```

### Get Employee Demographics
```
GET /analytics/employees
```

### Get Case Outcomes
```
GET /analytics/outcomes
```

### Get Return to Work Metrics
```
GET /analytics/return-to-work
```

### Get Comprehensive Report
```
GET /analytics/report
```

### Get Dashboard Summary
```
GET /analytics/dashboard
```

---

## Organization Routes

### Get Organization
```
GET /orgs/:id
```

### Get Incidents
```
GET /orgs/:id/incidents?status=reported&severity=high&limit=20&offset=0
```

### Create Incident
```
POST /orgs/:id/incidents
```
**Body:**
```json
{
  "employeeId": "uuid",
  "startDate": "2026-01-15",
  "endDate": "2026-01-20",
  "severity": "high",
  "reason": "Workplace incident"
}
```

---

## Incident Management Routes

### Update Incident
```
PATCH /incidents/:id
```
**Body:**
```json
{
  "status": "resolved",
  "severity": "medium"
}
```

### Add Case Note
```
POST /cases/:id/notes
```
**Body:**
```json
{
  "advisorId": "uuid",
  "noteText": "Case note content",
  "noteType": "observation"
}
```

### Schedule Follow-up
```
POST /cases/:id/schedule-followup
```
**Body:**
```json
{
  "advisorId": "uuid",
  "scheduledDate": "2026-02-15",
  "actionDescription": "Follow-up action"
}
```

---

## Client Routes

### Get Client Profile
```
GET /client/profile
```

### Book Consultation
```
POST /client/consultations
```
**Body:**
```json
{
  "advisorId": "uuid",
  "scheduledDate": "2026-02-01",
  "durationMinutes": 60,
  "topic": "Consultation topic"
}
```

---

## Health Check

### Health Status
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:00:00Z",
  "database": "connected"
}
```

---

## Error Responses

All endpoints return errors in standard format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (development mode only)"
}
```

**HTTP Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Rate Limiting

- Standard tier: 1000 requests/hour
- Professional tier: 5000 requests/hour
- Enterprise tier: Unlimited

---

## Data Retention

- Consultation records: 7 years (Norwegian law)
- Access logs: 90 days
- Deleted documents: 30 days (soft delete before permanent removal)
- Financial records: 10 years (Norwegian tax requirements)

---

## Internationalization (i18n)

Supported languages: Norwegian (NO), English (EN), Turkish (TR)

Pass language preference via:
- Query parameter: `?lang=no`
- Header: `Accept-Language: no`
- User profile setting (default)

---

## API Versioning

Current version: v1

All endpoints are versioned. Future breaking changes will increment version number.
