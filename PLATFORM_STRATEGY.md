# NAVIAR CONSULT — Comprehensive Platform Strategy

**Project Scope:** World-class sick leave follow-up (sykefraværsoppfølging) advisory platform  
**Target Market:** Norway (primary), Scandinavia (secondary)  
**Model:** B2B SaaS + B2C Advisory Services  
**Status:** Strategic framework for implementation  
**Last Updated:** 2026-10-04

---

## 1. Executive Business Model

### 1.1 Core Value Proposition

**For Employers/Organizations:**
- Structured sick leave management reducing average absence duration
- Compliance with Norwegian sick leave regulations and IA agreement (Inkluderende Arbeidsliv)
- Risk mitigation through professional early intervention
- Cost reduction through data-driven return-to-work processes
- Employee retention through supportive, transparent framework

**For Employees/Individuals:**
- Independent, professional guidance during health challenges
- Clear communication pathway with employer without power imbalance
- Practical support for return-to-work planning
- Privacy-protected health information management
- Advocate for reasonable accommodations

**For Advisors:**
- Scalable advisory model combining 1:1 consulting with technology platform
- Client management automation reducing administrative burden
- Data-driven insights for outcome measurement
- Reputation and trust leverage through methodology
- Revenue model supporting premium positioning

### 1.2 Revenue Streams

#### Stream 1: Organization Subscription (B2B SaaS)
- **Tier A - Essentials:** 10K-30K NOK/month
  - Up to 200 employees
  - Unlimited incident reporting
  - Basic advisor consultations
  - Compliance dashboard
  
- **Tier B - Professional:** 50K-100K NOK/month
  - Up to 1000 employees
  - Priority advisor access
  - Advanced analytics
  - Custom return-to-work workflows
  - Integration with HR systems
  
- **Tier C - Enterprise:** Custom pricing
  - Unlimited employees
  - Dedicated advisor team
  - White-label option
  - Complete integration
  - Custom SLA

#### Stream 2: Individual Consultation (B2C)
- **Single consultation:** 2000-3500 NOK
- **3-month program:** 15000-25000 NOK
- **Retainer model:** 3000-5000 NOK/month

#### Stream 3: Data & Insights (B2B)
- Anonymized trend reporting to organizations
- Industry benchmarking
- Predictive analytics for absence prevention

#### Stream 4: Training & Workshops
- Leadership development
- Workplace health promotion
- Organizational culture consulting

### 1.3 Go-to-Market Strategy

**Phase 1 (Months 1-3):** Founder-led B2C advisory + organic employer referrals  
**Phase 2 (Months 4-9):** SaaS MVP launch, targeted SMB outreach  
**Phase 3 (Months 10-18):** Scale through partnerships (HR consultants, occupational health)  
**Phase 4 (18+ months):** Enterprise sales, Nordic expansion

---

## 2. Technical Platform Architecture

### 2.1 Frontend Stack

**Current Status:** ✓ Implemented
- **Framework:** Static HTML/CSS with progressive enhancement
- **Language Support:** Norwegian, English, Turkish (Vercel i18n routing)
- **Design System:** WEB-28 (Swiss precision + Scandinavian restraint)
- **Performance:** Optimized fonts, lazy loading, caching strategy
- **Security:** CSP headers, HSTS, privacy-first headers

**Next Phase:** React/TypeScript SPA for dashboard functionality

### 2.2 Backend Architecture (Required)

**Technology Stack:**
- **Runtime:** Node.js + Express OR Python/FastAPI
- **Database:** PostgreSQL (relational structure for complex leave tracking)
- **ORM:** Prisma or SQLAlchemy
- **Authentication:** OAuth2 (Azure AD for orgs, Email for individuals)
- **File Storage:** AWS S3 or Vercel Blob Storage
- **Caching:** Redis
- **Queue:** Bull (job scheduling for reminders, reports)

**Core Microservices:**
1. **Auth Service** — User/organization authentication, token management
2. **Case Management Service** — Sick leave incident lifecycle
3. **Advisor Service** — Schedule, consultations, notes
4. **Analytics Service** — Anonymized insights, reporting
5. **Notification Service** — Email, SMS, push notifications
6. **Document Service** — Report generation, compliance documents
7. **Integration Service** — HR system integrations

### 2.3 Data Model (Core Entities)

```
Organization
├── OrganizationAdmin (users with org access)
├── Employee (linked via integration or invite)
├── IncidentReport (sick leave events)
├── Subscription (billing)
└── Settings (compliance, workflows)

IncidentReport
├── EmployeeId
├── ReportDate
├── Status (reported, reviewed, in-progress, closed)
├── Notes (timeline of actions)
├── DocumentLinks (medical certificates, etc.)
├── FollowUpSchedule (planned interventions)
└── Outcome (returned, transferred, ongoing)

Advisor
├── Profile (credentials, areas of expertise)
├── Schedule (availability)
├── Cases (current caseload)
├── Notes (confidential)
└── Reports (outcomes, effectiveness)

IndividualClient (B2C)
├── Profile (personal info, health notes)
├── Consultations (scheduled sessions)
├── Documents (personal records)
└── Subscription (billing)
```

### 2.4 API Specification (REST)

**Authentication Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

**Organization Management:**
```
GET    /api/orgs/{id}
GET    /api/orgs/{id}/employees
GET    /api/orgs/{id}/incidents
POST   /api/orgs/{id}/incidents
PATCH  /api/incidents/{id}
GET    /api/orgs/{id}/advisors
GET    /api/orgs/{id}/analytics
```

**Advisor Portal:**
```
GET    /api/advisors/{id}/cases
GET    /api/cases/{id}/notes
POST   /api/cases/{id}/notes
GET    /api/cases/{id}/timeline
POST   /api/cases/{id}/schedule-followup
POST   /api/cases/{id}/generate-report
```

**Individual Client API:**
```
GET    /api/client/profile
POST   /api/client/consultations
GET    /api/client/consultations/{id}
POST   /api/client/documents
GET    /api/client/progress
```

---

## 3. Product Architecture

### 3.1 Public Website (Current)
- **Status:** Implemented
- **Role:** Marketing, trust-building, conversion
- **Content:** Service explanation, methodology, advisor biography
- **Next:** Add case studies, research data, blog

### 3.2 Organization Dashboard (B2B)
- **Users:** HR managers, organization admins
- **Features:**
  - Employee roster management
  - Incident reporting interface
  - Workflow management (assign advisors, set follow-up dates)
  - Compliance dashboard (current absences, trends)
  - Privacy-respecting reporting (no employee health data)
  - Team management (invite other HR staff)
  - Billing and subscription management

### 3.3 Advisor Portal
- **Users:** Professional advisors, counselors
- **Features:**
  - Case management dashboard (prioritized by urgency)
  - Client notes with versioning
  - Schedule and availability management
  - Document management (medical certificates, assessment notes)
  - Outcome tracking and effectiveness measurement
  - Client communication (secure messaging)
  - Reporting tools for outcomes and recommendations
  - Continuing education resources

### 3.4 Individual Client Portal (B2C)
- **Users:** Employees, individuals with health challenges
- **Features:**
  - Secure profile and health history
  - Consultation booking
  - Document upload (medical information)
  - Progress tracking toward return-to-work
  - Communication with advisor
  - Resource library (return-to-work tips, exercises)
  - Privacy controls (see what's shared with employer)

### 3.5 Mobile App (Future)
- **Phase:** Year 2
- **Users:** Primarily individual clients
- **Features:**
  - Appointment notifications and confirmations
  - Daily check-ins / wellness tracking
  - Resource access
  - Secure messaging with advisor
  - Document access
  - Progress visualization

---

## 4. Feature Roadmap

### MVP (Months 1-6)
- ✓ Public website (responsive, professional)
- ✓ Advisor profile with credentials
- [ ] Organization sign-up flow
- [ ] Basic incident reporting (form-based)
- [ ] Advisor scheduling system (Calendly integration initially)
- [ ] Email notifications
- [ ] Simple compliance reporting
- [ ] Individual B2C sign-up and profile
- [ ] Consultation booking
- [ ] Secure messaging (email-based)

### Phase 1 (Months 7-12)
- [ ] Full organization dashboard
- [ ] Advisor portal with case management
- [ ] Document management (upload, archive)
- [ ] Advanced follow-up workflow engine
- [ ] Integration with Norwegian HR systems (SAP SuccessFactors, Visma)
- [ ] Compliance documentation auto-generation
- [ ] Analytics dashboard (anonymized)
- [ ] Email invoice system
- [ ] Stripe payment integration

### Phase 2 (Year 2)
- [ ] Mobile app (iOS/Android)
- [ ] Advanced predictive analytics (absence risk scoring)
- [ ] Video consultation integration (Whereby, Whereby)
- [ ] Document signing (for agreements)
- [ ] Employee wellness program integration
- [ ] Occupational health provider integration
- [ ] Multiple language support in dashboards

### Phase 3 (Year 2+)
- [ ] White-label SaaS for partners
- [ ] Nordic expansion (Swedish, Danish translations)
- [ ] Advanced compliance modules (pension, disability)
- [ ] AI-powered case recommendations
- [ ] Workplace return-to-work mentoring network

---

## 5. Compliance & Legal Framework

### 5.1 Norwegian Data Protection
- **GDPR Compliance:** Data Processing Agreement (DPA) for all clients
- **NIST SP 800-171:** Security standards for sensitive health information
- **Norwegian Patient Act (Pasientloven):** If handling patient data through doctor referrals
- **Occupational Health & Safety Act:** Work environment compliance

### 5.2 Confidentiality & Privacy
- **Principle:** "Privacy by default"
- **Employer Access:** Only non-identifying incident metadata (absence duration, resolution time)
- **Employee Health:** Kept completely confidential from employer
- **Advisor Notes:** End-to-end encrypted, never accessible to organization
- **Documentation:** Clear data retention policies, right to deletion

### 5.3 Professional Credentials
- **Betül Öner:** Verify and display credentials (NAV experience, counseling certifications)
- **Future Advisors:** Credential verification system required
- **Professional Liability:** Insurance required for all advisors

### 5.4 Terms & Service Structure
- **Separate ToS:** Organization vs. Individual
- **Liability Limits:** Clear boundaries between advisory and medical care
- **Cancellation Policy:** Clear exit terms for organizations
- **Data Rights:** Specify data ownership and export capabilities

---

## 6. Quality & Safety Framework

### 6.1 Case Management Protocols
- **Initial Assessment:** 72-hour response SLA
- **Case Complexity:** Automatic escalation for high-risk situations
- **Progress Monitoring:** Regular check-ins, documented outcomes
- **Hand-off to Specialists:** Clear criteria for referring to occupational health, psychologist, doctor

### 6.2 Advisor Quality Assurance
- **Credential Verification:** Background check, certification confirmation
- **Continuing Education:** Required annual training on latest Norwegian labor law
- **Peer Review:** Case supervision and periodic review
- **Client Feedback:** Rating system with follow-up on low scores
- **Compliance Audits:** Regular checks on data handling and confidentiality

### 6.3 Data Security
- **Infrastructure:** Vercel + PostgreSQL on managed cloud (EU-hosted)
- **Encryption:** TLS in transit, AES-256 at rest
- **Access Control:** Role-based access (RBAC) with audit logging
- **Penetration Testing:** Annual third-party security audit
- **Incident Response:** Clear protocol for data breaches

### 6.4 Measurement & Outcomes
- **Primary Metric:** Time to return-to-work (benchmark: Norwegian average 45 days)
- **Secondary Metrics:**
  - Client satisfaction (NPS)
  - Advisor effectiveness (cases resolved vs. ongoing)
  - Employer retention rate
  - ROI for organizations (savings from reduced absence duration)
- **Transparency:** Public anonymized outcome reporting builds trust

---

## 7. Marketing & Positioning

### 7.1 Brand Positioning
**"The ethical alternative to traditional sick leave administration"**

**Key Message:** "Riktig støtte. Riktig person. Riktig tid." (Right support. Right person. Right time.)

**Differentiation:**
- ✓ Independent (not tied to employer interest)
- ✓ Professional (not DIY HR software)
- ✓ Privacy-first (health data separate from employment)
- ✓ Evidence-based (outcome measurement)
- ✓ Human-centered (real advisors, not automation)

### 7.2 Customer Acquisition

**For Organizations:**
- LinkedIn B2B advertising targeting HR managers
- Partnership with HR consulting firms
- Referrals from occupational health providers
- Conference speaking (HR Norway, workplace health)
- Case study publishing

**For Individuals:**
- SEO targeting (sykefraværsoppfølging, fravær til arbeid)
- Employer partnerships (EAP - Employee Assistance Program)
- Referrals from healthcare providers
- Content marketing (blog, guides)
- Community building (support groups)

### 7.3 Trust Signals
- GDPR certification badge
- "Verified Advisor" credentials
- Transparent pricing (no hidden fees)
- Public case studies (anonymized)
- Annual impact report
- Third-party security audit results

---

## 8. Financial Projections (Year 1-3)

### 8.1 Revenue Assumptions

**Year 1 (MVP Phase):**
- 10 organizational clients @ avg 40K/month = 4.8M NOK
- 50 individual consulting clients @ avg 15K = 750K NOK
- **Total Year 1 Revenue:** ~5.5M NOK

**Year 2 (Growth Phase):**
- 50 organizational clients @ avg 50K/month = 30M NOK
- 200 individual clients @ avg 20K = 4M NOK
- Data/insights licensing = 1M NOK
- **Total Year 2 Revenue:** ~35M NOK

**Year 3 (Scale Phase):**
- 150 organizational clients @ avg 55K/month = 99M NOK
- 500 individual clients @ avg 20K = 10M NOK
- Data/insights and training = 5M NOK
- **Total Year 3 Revenue:** ~114M NOK

### 8.2 Cost Structure

**Fixed Costs:**
- Platform development and hosting: 500K/month
- Betül Öner salary: 200K/month
- Additional advisors (Year 2+): 2 advisors @ 150K/month = 300K
- Operations/marketing: 300K/month
- Legal/compliance: 50K/month

**Variable Costs:**
- Payment processing: 2-3% of revenue
- Customer support: 5% of revenue
- Cloud infrastructure scaling: ~5% of revenue

---

## 9. Technical Debt & Decisions

### 9.1 Frontend Decisions
- **Status Quo:** Static HTML with excellent responsive design
- **Decision Point:** Add React/SPA only when dashboard complexity requires
- **Rationale:** Keep initial product simple, add complexity when justified by feature needs

### 9.2 Backend Technology
- **Recommendation:** Node.js + Express (or Python/FastAPI)
- **Database:** PostgreSQL for relational structure
- **Deployment:** Vercel (frontend) + Railway or Fly.io (backend API)
- **Rationale:** Aligned with existing tech stack, strong ecosystem for healthcare

### 9.3 Authentication
- **Recommendation:** Auth0 or Supabase Auth
- **Rationale:** Reduces implementation burden, handles GDPR compliance features
- **SSO:** Add Azure AD/Entra for organizational customers

---

## 10. Success Criteria & KPIs

### 10.1 Year 1 Milestones
- [ ] 10+ organizational customers with 2000+ employees
- [ ] 100+ individual consultations completed
- [ ] 50% average reduction in time-to-return-to-work vs. baseline
- [ ] NPS >= 70
- [ ] 95%+ data security and uptime
- [ ] GDPR compliance verified

### 10.2 Year 2 Milestones
- [ ] 50+ organizational customers
- [ ] 5M+ NOK in annual recurring revenue
- [ ] Expand to 2-3 additional advisors
- [ ] Mobile app MVP launched
- [ ] Partnerships with 3+ major HR consultants
- [ ] Recognized as "Best Sickleave Management Platform" in Norway

### 10.3 Year 3 Milestones
- [ ] 150+ organizational customers
- [ ] 30M+ NOK annual recurring revenue
- [ ] Expand to Scandinavia (Sweden, Denmark)
- [ ] Industry benchmark data published annually
- [ ] Series A funding (if pursuing growth capital)

---

## 11. Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Advisor burnout** | High | Limit caseload, peer support, regular supervision |
| **Data breach** | Critical | Multiple security layers, bug bounty, insurance |
| **Regulatory change** | Medium | Monitor Norwegian labor law, legal review |
| **Market saturation** | Medium | Early-mover advantage, premium positioning |
| **Retention of customers** | High | Demonstrate ROI, continuous improvement |
| **Technical platform limits** | Medium | Plan architecture for scale, regular audits |

---

## 12. Next Steps (Immediate Actions)

### Week 1
- [ ] Finalize business model and pricing
- [ ] Set up separate i18n frontend (dashboard vs. public site)
- [ ] Begin backend API design document
- [ ] Create organization onboarding flow wireframes

### Week 2-3
- [ ] Implement basic backend API skeleton (Auth, Organization CRUD)
- [ ] Build organization sign-up flow on frontend
- [ ] Create advisor portal wireframes
- [ ] Set up PostgreSQL schema

### Week 4-6
- [ ] Build incident reporting feature
- [ ] Implement advisor scheduling (Calendly integration)
- [ ] Create individual B2C consultation booking
- [ ] Deploy MVP to production

---

**Document Version:** 1.0  
**Last Updated:** 2026-10-04  
**Author:** NAVIAR Expert Team  
**Next Review:** 2026-10-18
