-- NAVIAR CONSULT — PostgreSQL Database Schema
-- Complete data model for sick leave management platform

-- Organizations (B2B customers)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  orgNumber VARCHAR(20) UNIQUE,
  plan VARCHAR(50) NOT NULL CHECK (plan IN ('essentials', 'professional', 'enterprise')),
  employees_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization admins
CREATE TABLE org_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Employees (linked to organizations)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  position VARCHAR(255),
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incident reports (sick leave events)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('reported', 'reviewed', 'in-progress', 'closed')),
  start_date DATE NOT NULL,
  end_date DATE,
  reason VARCHAR(500),
  severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Advisors
CREATE TABLE advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  credentials TEXT,
  bio TEXT,
  max_caseload INT DEFAULT 15,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Case assignments
CREATE TABLE case_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('assigned', 'active', 'completed')),
  assigned_date TIMESTAMP DEFAULT NOW(),
  completed_date TIMESTAMP
);

-- Case notes (confidential advisor observations)
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type VARCHAR(50) CHECK (note_type IN ('observation', 'action', 'followup', 'recommendation')),
  is_encrypted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Follow-up schedule
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES advisors(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  action_description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rescheduled', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual clients (B2C)
CREATE TABLE individual_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  health_notes TEXT,
  privacy_settings JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consultations
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES individual_clients(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents (medical certs, agreements, reports)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  client_id UUID REFERENCES individual_clients(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  file_path VARCHAR(500),
  uploaded_by UUID,
  is_confidential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions & billing
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  monthly_price DECIMAL(10,2),
  billing_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  next_billing_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Outcomes & metrics
CREATE TABLE outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  resolution_type VARCHAR(100) CHECK (resolution_type IN ('return-to-work', 'transferred', 'disability', 'ongoing')),
  days_to_resolution INT,
  advisor_effectiveness_score INT CHECK (advisor_effectiveness_score BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit log (for compliance)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_incidents_org_id ON incidents(org_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_start_date ON incidents(start_date);
CREATE INDEX idx_case_assignments_advisor ON case_assignments(advisor_id);
CREATE INDEX idx_case_assignments_incident ON case_assignments(incident_id);
CREATE INDEX idx_followups_scheduled ON followups(scheduled_date);
CREATE INDEX idx_consultations_client ON consultations(client_id);
CREATE INDEX idx_consultations_advisor ON consultations(advisor_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
