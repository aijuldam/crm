-- ============================================================
-- CRM Platform — Phase 2: Campaign & Email Schema
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─── Email templates ─────────────────────────────────────────
CREATE TABLE email_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID REFERENCES projects(id) ON DELETE CASCADE,  -- NULL = shared
  name              TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'newsletter'
                      CHECK (category IN ('newsletter','promotional','transactional','winback','welcome','blank')),
  content_mode      TEXT NOT NULL DEFAULT 'blocks'
                      CHECK (content_mode IN ('blocks','html')),
  -- JSON array of block objects (see Block types in types/campaigns.ts)
  blocks            JSONB NOT NULL DEFAULT '[]',
  html_override     TEXT,                -- raw HTML (used when content_mode = 'html')
  subject_default   TEXT NOT NULL,
  preheader_default TEXT NOT NULL DEFAULT '',
  -- Array of {language, subject, preheader, blocks?, html_override?}
  language_variants JSONB NOT NULL DEFAULT '[]',
  thumbnail_url     TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_by        UUID REFERENCES crm_users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_email_templates_project ON email_templates (project_id);
CREATE INDEX idx_email_templates_category ON email_templates (category);

-- ─── Campaigns ───────────────────────────────────────────────
CREATE TABLE campaigns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'one_off'
                 CHECK (type IN ('one_off','automated')),
  email_type   TEXT NOT NULL DEFAULT 'marketing'
                 CHECK (email_type IN ('marketing','operational')),
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','scheduled','sending','sent','paused','cancelled','failed')),
  template_id  UUID REFERENCES email_templates(id),
  -- Audience: {type: 'list'|'segment'|'manual', list_id?, segment_id?, filters?}
  audience     JSONB NOT NULL DEFAULT '{}',
  subject      TEXT NOT NULL DEFAULT '',
  preheader    TEXT NOT NULL DEFAULT '',
  from_name    TEXT NOT NULL,
  from_email   TEXT NOT NULL,
  reply_to     TEXT,
  language     TEXT NOT NULL DEFAULT 'en',
  scheduled_at TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ,
  created_by   UUID REFERENCES crm_users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_campaigns_project ON campaigns (project_id);
CREATE INDEX idx_campaigns_status ON campaigns (status);
CREATE INDEX idx_campaigns_sent_at ON campaigns (sent_at DESC);

-- ─── Campaign runs ────────────────────────────────────────────
-- One run per send attempt (retries produce new run records)
CREATE TABLE campaign_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','sending','completed','failed','cancelled')),
  recipient_count     INT NOT NULL DEFAULT 0,
  suppressed_count    INT NOT NULL DEFAULT 0,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  error_message       TEXT,
  provider_batch_id   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_runs_campaign ON campaign_runs (campaign_id);
CREATE INDEX idx_campaign_runs_status ON campaign_runs (status);

-- ─── Email events ─────────────────────────────────────────────
-- Append-only event log from provider webhooks or sync job
CREATE TABLE email_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_run_id     UUID NOT NULL REFERENCES campaign_runs(id) ON DELETE CASCADE,
  contact_id          UUID REFERENCES contacts(id),
  email               TEXT NOT NULL,
  event_type          TEXT NOT NULL
                        CHECK (event_type IN ('sent','delivered','opened','clicked','bounced_hard','bounced_soft','unsubscribed','complained','suppressed')),
  link_url            TEXT,         -- for 'clicked' events
  bounce_type         TEXT,         -- 'hard' | 'soft'
  bounce_reason       TEXT,
  provider_event_id   TEXT UNIQUE,  -- dedup webhook deliveries
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_events_run ON email_events (campaign_run_id);
CREATE INDEX idx_email_events_type ON email_events (event_type);
CREATE INDEX idx_email_events_email ON email_events (email);
CREATE INDEX idx_email_events_contact ON email_events (contact_id);
CREATE INDEX idx_email_events_occurred ON email_events (occurred_at DESC);

-- ─── Suppression lists ────────────────────────────────────────
-- Prevents mail to ineligible addresses regardless of consent state
CREATE TABLE suppression_list (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized  TEXT NOT NULL,
  scope             TEXT NOT NULL DEFAULT 'global'
                      CHECK (scope IN ('global','project','list')),
  project_id        UUID REFERENCES projects(id) ON DELETE CASCADE,
  list_id           UUID REFERENCES lists(id) ON DELETE CASCADE,
  reason            TEXT NOT NULL
                      CHECK (reason IN ('hard_bounce','complaint','manual','unsubscribed','role_address','invalid_email','gdpr_erasure')),
  notes             TEXT,
  source_event_id   UUID,           -- references email_events.id
  added_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Unique per email+scope+project+list combination
  UNIQUE NULLS NOT DISTINCT (email_normalized, scope, project_id, list_id)
);

CREATE INDEX idx_suppression_email ON suppression_list (email_normalized);
CREATE INDEX idx_suppression_scope ON suppression_list (scope);
CREATE INDEX idx_suppression_reason ON suppression_list (reason);

-- ─── Bounce events ────────────────────────────────────────────
CREATE TABLE bounce_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  campaign_run_id   UUID REFERENCES campaign_runs(id),
  bounce_type       TEXT NOT NULL CHECK (bounce_type IN ('hard','soft')),
  bounce_subtype    TEXT,           -- mailbox_not_found, domain_not_found, mailbox_full, etc.
  bounce_reason     TEXT NOT NULL,
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bounce_events_email ON bounce_events (email);
CREATE INDEX idx_bounce_events_type ON bounce_events (bounce_type);

-- ─── Complaint events ─────────────────────────────────────────
CREATE TABLE complaint_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  campaign_run_id   UUID REFERENCES campaign_runs(id),
  complaint_type    TEXT NOT NULL DEFAULT 'abuse',
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_complaint_events_email ON complaint_events (email);

-- ─── Materialized campaign metrics ────────────────────────────
-- Refreshed by sync job — avoids COUNT(*) on email_events for every API call
CREATE TABLE campaign_run_metrics (
  run_id             UUID PRIMARY KEY REFERENCES campaign_runs(id) ON DELETE CASCADE,
  sent               INT NOT NULL DEFAULT 0,
  delivered          INT NOT NULL DEFAULT 0,
  unique_opens       INT NOT NULL DEFAULT 0,
  total_opens        INT NOT NULL DEFAULT 0,
  unique_clicks      INT NOT NULL DEFAULT 0,
  total_clicks       INT NOT NULL DEFAULT 0,
  bounces_hard       INT NOT NULL DEFAULT 0,
  bounces_soft       INT NOT NULL DEFAULT 0,
  unsubscribes       INT NOT NULL DEFAULT 0,
  complaints         INT NOT NULL DEFAULT 0,
  suppressed         INT NOT NULL DEFAULT 0,
  last_computed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Aggregate views ──────────────────────────────────────────

-- Per-campaign aggregate (latest run metrics)
CREATE VIEW campaign_metrics_view AS
SELECT
  c.id                       AS campaign_id,
  c.name,
  c.project_id,
  c.status,
  c.sent_at,
  cr.id                      AS run_id,
  COALESCE(m.sent, 0)        AS sent,
  COALESCE(m.delivered, 0)   AS delivered,
  COALESCE(m.unique_opens, 0)  AS unique_opens,
  COALESCE(m.unique_clicks, 0) AS unique_clicks,
  COALESCE(m.bounces_hard, 0)  AS bounces_hard,
  COALESCE(m.bounces_soft, 0)  AS bounces_soft,
  COALESCE(m.unsubscribes, 0)  AS unsubscribes,
  COALESCE(m.complaints, 0)    AS complaints,
  COALESCE(m.suppressed, 0)    AS suppressed,
  CASE WHEN COALESCE(m.delivered, 0) > 0
       THEN ROUND((m.unique_opens::NUMERIC / m.delivered) * 100, 1)
       ELSE 0 END                 AS open_rate_pct,
  CASE WHEN COALESCE(m.delivered, 0) > 0
       THEN ROUND((m.unique_clicks::NUMERIC / m.delivered) * 100, 1)
       ELSE 0 END                 AS click_rate_pct,
  CASE WHEN COALESCE(m.unique_opens, 0) > 0
       THEN ROUND((m.unique_clicks::NUMERIC / m.unique_opens) * 100, 1)
       ELSE 0 END                 AS ctor_pct
FROM campaigns c
LEFT JOIN campaign_runs cr ON cr.campaign_id = c.id
  AND cr.id = (SELECT id FROM campaign_runs WHERE campaign_id = c.id ORDER BY created_at DESC LIMIT 1)
LEFT JOIN campaign_run_metrics m ON m.run_id = cr.id;

-- Suppression breakdown view
CREATE VIEW suppression_summary AS
SELECT
  scope,
  reason,
  COUNT(*) AS total,
  project_id
FROM suppression_list
GROUP BY scope, reason, project_id;

-- ─── Function: recompute run metrics ──────────────────────────
-- Called by the sync job / on-demand after event ingestion
CREATE OR REPLACE FUNCTION compute_run_metrics(p_run_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO campaign_run_metrics (
    run_id, sent, delivered, unique_opens, total_opens,
    unique_clicks, total_clicks, bounces_hard, bounces_soft,
    unsubscribes, complaints, suppressed, last_computed_at
  )
  SELECT
    p_run_id,
    COUNT(*) FILTER (WHERE event_type = 'sent')                                              AS sent,
    COUNT(*) FILTER (WHERE event_type = 'delivered')                                         AS delivered,
    COUNT(DISTINCT email) FILTER (WHERE event_type = 'opened')                               AS unique_opens,
    COUNT(*) FILTER (WHERE event_type = 'opened')                                            AS total_opens,
    COUNT(DISTINCT email) FILTER (WHERE event_type = 'clicked')                              AS unique_clicks,
    COUNT(*) FILTER (WHERE event_type = 'clicked')                                           AS total_clicks,
    COUNT(*) FILTER (WHERE event_type = 'bounced_hard')                                      AS bounces_hard,
    COUNT(*) FILTER (WHERE event_type = 'bounced_soft')                                      AS bounces_soft,
    COUNT(DISTINCT email) FILTER (WHERE event_type = 'unsubscribed')                         AS unsubscribes,
    COUNT(DISTINCT email) FILTER (WHERE event_type = 'complained')                           AS complaints,
    COUNT(*) FILTER (WHERE event_type = 'suppressed')                                        AS suppressed,
    now()                                                                                    AS last_computed_at
  FROM email_events
  WHERE campaign_run_id = p_run_id
  ON CONFLICT (run_id) DO UPDATE SET
    sent = EXCLUDED.sent, delivered = EXCLUDED.delivered,
    unique_opens = EXCLUDED.unique_opens, total_opens = EXCLUDED.total_opens,
    unique_clicks = EXCLUDED.unique_clicks, total_clicks = EXCLUDED.total_clicks,
    bounces_hard = EXCLUDED.bounces_hard, bounces_soft = EXCLUDED.bounces_soft,
    unsubscribes = EXCLUDED.unsubscribes, complaints = EXCLUDED.complaints,
    suppressed = EXCLUDED.suppressed, last_computed_at = now();
END;
$$ LANGUAGE plpgsql;

-- ─── Function: check send eligibility ─────────────────────────
-- Returns NULL if eligible, or the ineligibility reason
CREATE OR REPLACE FUNCTION get_send_ineligibility_reason(
  p_email_normalized TEXT,
  p_contact_id       UUID,
  p_project_id       UUID,
  p_email_type       TEXT DEFAULT 'marketing'
)
RETURNS TEXT AS $$
DECLARE
  v_reason TEXT;
BEGIN
  -- Hard bounce
  IF EXISTS (SELECT 1 FROM bounce_events WHERE email = p_email_normalized AND bounce_type = 'hard') THEN
    RETURN 'hard_bounce';
  END IF;

  -- Complaint
  IF EXISTS (SELECT 1 FROM complaint_events WHERE email = p_email_normalized) THEN
    RETURN 'complaint';
  END IF;

  -- Global suppression
  IF EXISTS (SELECT 1 FROM suppression_list WHERE email_normalized = p_email_normalized AND scope = 'global') THEN
    RETURN 'global_suppression';
  END IF;

  -- Project suppression
  IF EXISTS (SELECT 1 FROM suppression_list WHERE email_normalized = p_email_normalized AND scope = 'project' AND project_id = p_project_id) THEN
    RETURN 'project_suppression';
  END IF;

  -- Marketing consent check
  IF p_email_type = 'marketing' THEN
    IF EXISTS (
      SELECT 1 FROM consents
      WHERE contact_id = p_contact_id
        AND project_id = p_project_id
        AND channel = 'email'
        AND consent_status IN ('opted_out', 'unsubscribed')
    ) THEN
      RETURN 'consent_withdrawn';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM consents
      WHERE contact_id = p_contact_id
        AND project_id = p_project_id
        AND channel = 'email'
        AND consent_status = 'opted_in'
    ) THEN
      RETURN 'no_consent';
    END IF;
  END IF;

  RETURN NULL;  -- eligible
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Auto-suppress on hard bounce / complaint ─────────────────
CREATE OR REPLACE FUNCTION auto_suppress_on_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'bounce_events' AND NEW.bounce_type = 'hard' THEN
    INSERT INTO suppression_list (email_normalized, scope, reason, notes)
    VALUES (lower(trim(NEW.email)), 'global', 'hard_bounce', NEW.bounce_reason)
    ON CONFLICT DO NOTHING;
  END IF;

  IF TG_TABLE_NAME = 'complaint_events' THEN
    INSERT INTO suppression_list (email_normalized, scope, reason, notes)
    VALUES (lower(trim(NEW.email)), 'global', 'complaint', NEW.complaint_type)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_suppress_hard_bounce
  AFTER INSERT ON bounce_events
  FOR EACH ROW WHEN (NEW.bounce_type = 'hard')
  EXECUTE FUNCTION auto_suppress_on_event();

CREATE TRIGGER auto_suppress_complaint
  AFTER INSERT ON complaint_events
  FOR EACH ROW
  EXECUTE FUNCTION auto_suppress_on_event();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE email_templates    ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns          ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_runs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppression_list   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounce_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_run_metrics ENABLE ROW LEVEL SECURITY;
