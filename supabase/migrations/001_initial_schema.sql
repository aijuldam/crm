-- ============================================================
-- CRM Platform — Phase 1 Schema
-- Run in Supabase SQL editor or via `supabase db push`
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Updated-at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── CRM Users ───────────────────────────────────────────────
CREATE TABLE crm_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  first_name    TEXT,
  last_name     TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Projects ────────────────────────────────────────────────
CREATE TABLE projects (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  slug                   TEXT NOT NULL UNIQUE,
  type                   TEXT NOT NULL DEFAULT 'b2c'
                           CHECK (type IN ('b2c', 'b2b', 'hybrid')),
  default_language       TEXT NOT NULL DEFAULT 'en',
  default_country        TEXT NOT NULL DEFAULT 'NL',
  sending_domain         TEXT,
  privacy_notice_version TEXT NOT NULL DEFAULT '1.0',
  is_active              BOOLEAN NOT NULL DEFAULT true,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Memberships (User ↔ Project RBAC) ────────────────────────
CREATE TABLE memberships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES crm_users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'viewer'
               CHECK (role IN ('admin', 'marketing', 'sales', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);

-- ─── Companies ───────────────────────────────────────────────
CREATE TABLE companies (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  domain              TEXT,
  registered_country  TEXT,
  billing_country     TEXT,
  vat_number          TEXT,
  vat_validated_at    TIMESTAMPTZ,
  industry            TEXT,
  company_size        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_companies_domain ON companies (domain);
CREATE INDEX idx_companies_registered_country ON companies (registered_country);

-- ─── Contacts ────────────────────────────────────────────────
CREATE TABLE contacts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL,
  email_normalized    TEXT NOT NULL UNIQUE,         -- lowercase, trimmed — deduplication key
  first_name          TEXT,
  last_name           TEXT,
  phone               TEXT,
  country_code        TEXT,                          -- dialling prefix country
  residency_country   TEXT,                          -- ISO 3166-1 alpha-2
  preferred_language  TEXT DEFAULT 'en',             -- ISO 639-1
  timezone            TEXT,
  currency            TEXT DEFAULT 'EUR',
  market              TEXT,                          -- free-form market label (e.g. DACH, Benelux)
  lifecycle_stage     TEXT NOT NULL DEFAULT 'lead'
                        CHECK (lifecycle_stage IN ('lead','prospect','customer','evangelist','churned')),
  source              TEXT,
  owner_id            UUID REFERENCES crm_users(id),
  company_id          UUID REFERENCES companies(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_contacts_email_normalized ON contacts (email_normalized);
CREATE INDEX idx_contacts_residency_country ON contacts (residency_country);
CREATE INDEX idx_contacts_lifecycle_stage ON contacts (lifecycle_stage);
CREATE INDEX idx_contacts_created_at ON contacts (created_at DESC);

-- ─── Contact ↔ Project ───────────────────────────────────────
CREATE TABLE contact_projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, project_id)
);

CREATE INDEX idx_contact_projects_contact ON contact_projects (contact_id);
CREATE INDEX idx_contact_projects_project ON contact_projects (project_id);

-- ─── Lists ───────────────────────────────────────────────────
CREATE TABLE lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER lists_updated_at
  BEFORE UPDATE ON lists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_lists_project ON lists (project_id);

-- ─── Contact ↔ List ──────────────────────────────────────────
CREATE TABLE contact_lists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  list_id    UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, list_id)
);

CREATE INDEX idx_contact_lists_list ON contact_lists (list_id);
CREATE INDEX idx_contact_lists_contact ON contact_lists (contact_id);

-- ─── Segments ────────────────────────────────────────────────
CREATE TABLE segments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  -- Array of {field, operator, value} condition objects
  conditions  JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER segments_updated_at
  BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Consents ────────────────────────────────────────────────
CREATE TABLE consents (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id             UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  project_id             UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  list_id                UUID REFERENCES lists(id),
  channel                TEXT NOT NULL CHECK (channel IN ('email','sms','push','post','phone')),
  purpose                TEXT,
  consent_status         TEXT NOT NULL DEFAULT 'pending'
                           CHECK (consent_status IN ('opted_in','opted_out','pending','unsubscribed')),
  legal_basis            TEXT CHECK (legal_basis IN ('consent','legitimate_interest','contract','legal_obligation')),
  -- Country/language AT TIME OF CONSENT — not from contact profile
  consent_country        TEXT,
  consent_language       TEXT,
  consent_text_version   TEXT,
  privacy_notice_version TEXT,
  source_form_id         UUID,                       -- references forms.id (no FK to allow form deletion)
  source_page            TEXT,
  consented_at           TIMESTAMPTZ,
  withdrawn_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER consents_updated_at
  BEFORE UPDATE ON consents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_consents_contact ON consents (contact_id);
CREATE INDEX idx_consents_project ON consents (project_id);
CREATE INDEX idx_consents_status ON consents (consent_status);
CREATE INDEX idx_consents_channel ON consents (channel);

-- ─── Forms ───────────────────────────────────────────────────
CREATE TABLE forms (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL,
  -- Array of field definition objects
  fields           JSONB NOT NULL DEFAULT '[]',
  settings         JSONB NOT NULL DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, slug)
);

CREATE TRIGGER forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Submissions ─────────────────────────────────────────────
CREATE TABLE submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id      UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  contact_id   UUID REFERENCES contacts(id),
  data         JSONB NOT NULL DEFAULT '{}',
  ip_address   TEXT,
  user_agent   TEXT,
  source_page  TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_form ON submissions (form_id);
CREATE INDEX idx_submissions_contact ON submissions (contact_id);

-- ─── Activities ──────────────────────────────────────────────
CREATE TABLE activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id),
  type         TEXT NOT NULL,
  subject      TEXT,
  body         TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}',
  performed_by UUID REFERENCES crm_users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_contact ON activities (contact_id, created_at DESC);
CREATE INDEX idx_activities_type ON activities (type);

-- ─── Tasks ───────────────────────────────────────────────────
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID REFERENCES contacts(id),
  company_id  UUID REFERENCES companies(id),
  deal_id     UUID,                                  -- references deals.id (circular, added after deals)
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo','in_progress','done')),
  priority    TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high')),
  due_date    TIMESTAMPTZ,
  assigned_to UUID REFERENCES crm_users(id),
  created_by  UUID REFERENCES crm_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_tasks_contact ON tasks (contact_id);
CREATE INDEX idx_tasks_status ON tasks (status);

-- ─── Deals ───────────────────────────────────────────────────
CREATE TABLE deals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  UUID REFERENCES contacts(id),
  company_id  UUID REFERENCES companies(id),
  project_id  UUID NOT NULL REFERENCES projects(id),
  title       TEXT NOT NULL,
  value       NUMERIC,
  currency    TEXT NOT NULL DEFAULT 'EUR',
  stage       TEXT NOT NULL DEFAULT 'lead'
                CHECK (stage IN ('lead','qualified','proposal','negotiation','won','lost')),
  closed_at   TIMESTAMPTZ,
  owner_id    UUID REFERENCES crm_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Add FK from tasks to deals now that deals table exists
ALTER TABLE tasks
  ADD CONSTRAINT tasks_deal_id_fkey
  FOREIGN KEY (deal_id) REFERENCES deals(id);

-- ─── Aggregate views ─────────────────────────────────────────

CREATE VIEW contact_count_by_project AS
SELECT p.id AS project_id, p.name AS project, COUNT(cp.contact_id) AS contact_count
FROM projects p
LEFT JOIN contact_projects cp ON cp.project_id = p.id
GROUP BY p.id, p.name;

CREATE VIEW contact_count_by_country AS
SELECT residency_country AS country, COUNT(*) AS contact_count
FROM contacts
WHERE residency_country IS NOT NULL
GROUP BY residency_country
ORDER BY contact_count DESC;

CREATE VIEW contact_count_by_lifecycle AS
SELECT lifecycle_stage AS stage, COUNT(*) AS contact_count
FROM contacts
GROUP BY lifecycle_stage;

CREATE VIEW consent_summary_view AS
SELECT consent_status AS status, COUNT(*) AS record_count
FROM consents
GROUP BY consent_status;

CREATE VIEW list_subscriber_count AS
SELECT l.id AS list_id, l.name, l.project_id, COUNT(cl.contact_id) AS subscriber_count
FROM lists l
LEFT JOIN contact_lists cl ON cl.list_id = l.id
GROUP BY l.id, l.name, l.project_id;

-- ─── RPC helpers for dashboard ────────────────────────────────
CREATE OR REPLACE FUNCTION contacts_by_project()
RETURNS TABLE (project TEXT, count BIGINT) AS $$
  SELECT project, contact_count FROM contact_count_by_project;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION contacts_by_country()
RETURNS TABLE (country TEXT, count BIGINT) AS $$
  SELECT country, contact_count FROM contact_count_by_country;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION contacts_by_lifecycle()
RETURNS TABLE (stage TEXT, count BIGINT) AS $$
  SELECT stage, contact_count FROM contact_count_by_lifecycle;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION consent_summary()
RETURNS TABLE (status TEXT, count BIGINT) AS $$
  SELECT status, record_count FROM consent_summary_view;
$$ LANGUAGE SQL STABLE;

-- ─── Row Level Security ──────────────────────────────────────
-- Enable RLS on all user-facing tables.
-- In production: add policies based on auth.uid() and membership role.
-- For Phase 1 with service-role key on server routes, RLS is applied but policies
-- are permissive. Tighten per project-membership in Phase 2.

ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists  ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_users      ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by server-side API routes)
-- Add granular policies here as you implement auth in Phase 2.
-- Example pattern:
-- CREATE POLICY "Members can view their project contacts"
--   ON contacts FOR SELECT
--   USING (
--     id IN (
--       SELECT cp.contact_id FROM contact_projects cp
--       WHERE cp.project_id IN (
--         SELECT m.project_id FROM memberships m WHERE m.user_id = auth.uid()
--       )
--     )
--   );
