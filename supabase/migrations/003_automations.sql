-- ============================================================
-- CRM Platform — Phase 3: Events & Automation Engine
-- Run AFTER 002_campaigns.sql
-- ============================================================

-- ─── Contact events ───────────────────────────────────────────
-- Append-only event log from website/app/internal sources
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES contacts(id),
  email           TEXT,                   -- when contact_id not yet resolved
  event_type      TEXT NOT NULL
                    CHECK (event_type IN (
                      'form_submitted', 'quiz_completed', 'guide_downloaded',
                      'page_viewed', 'form_started', 'form_abandoned',
                      'contact_inactive', 'link_clicked', 'email_opened',
                      'purchase_completed', 'custom'
                    )),
  source          TEXT NOT NULL DEFAULT 'api'
                    CHECK (source IN ('api', 'webhook', 'sdk', 'import', 'internal')),
  -- Arbitrary event payload: {url, form_id, quiz_id, guide_id, score, ...}
  properties      JSONB NOT NULL DEFAULT '{}',
  session_id      TEXT,                   -- browser session for dedup / funnel analysis
  idempotency_key TEXT UNIQUE,            -- client-side dedup
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_project    ON events (project_id, occurred_at DESC);
CREATE INDEX idx_events_contact    ON events (contact_id, occurred_at DESC);
CREATE INDEX idx_events_type       ON events (event_type);
CREATE INDEX idx_events_email      ON events (email);
CREATE INDEX idx_events_session    ON events (session_id) WHERE session_id IS NOT NULL;

-- ─── Automation workflows ─────────────────────────────────────
CREATE TABLE automation_workflows (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  description           TEXT NOT NULL DEFAULT '',
  category              TEXT NOT NULL DEFAULT 'custom'
                          CHECK (category IN (
                            'welcome', 'nurture', 'reengagement',
                            'content_delivery', 'transactional', 'custom'
                          )),
  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  -- Trigger: {type:'event'|'schedule'|'manual', event_type?, filters?, cron?}
  trigger_config        JSONB NOT NULL DEFAULT '{}',
  -- Re-entry: whether contacts can re-enter after completing/exiting
  re_entry              TEXT NOT NULL DEFAULT 'none'
                          CHECK (re_entry IN ('none', 'always', 'after_exit')),
  re_entry_delay_days   INT NOT NULL DEFAULT 0,
  -- Safety rails
  frequency_cap_per_day INT,              -- max emails per contact per day across all steps
  goal_event_type       TEXT,             -- auto-exit when contact fires this event
  goal_conditions       JSONB,            -- optional filters on goal event properties
  exclusion_list_id     UUID REFERENCES lists(id),
  stop_on_unsubscribe   BOOLEAN NOT NULL DEFAULT true,
  stop_on_conversion    BOOLEAN NOT NULL DEFAULT true,
  created_by            UUID REFERENCES crm_users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER automation_workflows_updated_at
  BEFORE UPDATE ON automation_workflows
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_workflows_project ON automation_workflows (project_id);
CREATE INDEX idx_workflows_status  ON automation_workflows (status);

-- ─── Workflow steps ───────────────────────────────────────────
-- One row per node in the workflow graph
CREATE TABLE workflow_steps (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id         UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  type                TEXT NOT NULL
                        CHECK (type IN (
                          'trigger', 'delay', 'condition', 'branch',
                          'send_email', 'wait_for_event',
                          'add_to_list', 'remove_from_list',
                          'create_task', 'update_field', 'exit'
                        )),
  name                TEXT NOT NULL DEFAULT '',
  -- Polymorphic config: shape varies by type (see StepConfig in types/automations.ts)
  config              JSONB NOT NULL DEFAULT '{}',
  -- Visual canvas position
  position_x          FLOAT NOT NULL DEFAULT 0,
  position_y          FLOAT NOT NULL DEFAULT 0,
  -- Graph edges
  next_step_id        UUID REFERENCES workflow_steps(id),
  branch_yes_step_id  UUID REFERENCES workflow_steps(id),
  branch_no_step_id   UUID REFERENCES workflow_steps(id),
  order_index         INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_steps_workflow ON workflow_steps (workflow_id, order_index);

-- ─── Workflow enrollments ─────────────────────────────────────
-- One row per contact per workflow run (unique enforced, re-entry via delete+reinsert)
CREATE TABLE workflow_enrollments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id         UUID NOT NULL REFERENCES automation_workflows(id) ON DELETE CASCADE,
  contact_id          UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'completed', 'exited', 'failed')),
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_step_id     UUID REFERENCES workflow_steps(id),
  completed_at        TIMESTAMPTZ,
  exit_reason         TEXT,
  goal_completed_at   TIMESTAMPTZ,
  -- Soft unique: enforced for active enrollments; exited/completed allow re-enroll
  CONSTRAINT uq_enrollment_active UNIQUE NULLS NOT DISTINCT (workflow_id, contact_id)
);

CREATE INDEX idx_enrollments_workflow ON workflow_enrollments (workflow_id, status);
CREATE INDEX idx_enrollments_contact  ON workflow_enrollments (contact_id);
CREATE INDEX idx_enrollments_step     ON workflow_enrollments (current_step_id);

-- ─── Workflow step execution log ─────────────────────────────
-- Append-only audit log; drives step analytics and drop-off reports
CREATE TABLE workflow_step_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES workflow_enrollments(id) ON DELETE CASCADE,
  step_id        UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  executed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  result         TEXT NOT NULL
                   CHECK (result IN (
                     'success', 'skipped', 'failed',
                     'branched_yes', 'branched_no', 'pending'
                   )),
  output         JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_step_logs_enrollment ON workflow_step_logs (enrollment_id);
CREATE INDEX idx_step_logs_step       ON workflow_step_logs (step_id);
CREATE INDEX idx_step_logs_executed   ON workflow_step_logs (executed_at DESC);

-- ─── Materialized workflow metrics ────────────────────────────
-- Refreshed by a background job; avoids COUNT(*) on step_logs at query time
CREATE TABLE workflow_metrics (
  workflow_id          UUID PRIMARY KEY REFERENCES automation_workflows(id) ON DELETE CASCADE,
  total_enrolled       INT NOT NULL DEFAULT 0,
  active_count         INT NOT NULL DEFAULT 0,
  completed_count      INT NOT NULL DEFAULT 0,
  exited_count         INT NOT NULL DEFAULT 0,
  failed_count         INT NOT NULL DEFAULT 0,
  goal_completed_count INT NOT NULL DEFAULT 0,
  last_computed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Aggregate view: step conversion rates ────────────────────
CREATE VIEW workflow_step_stats AS
SELECT
  ws.workflow_id,
  ws.id        AS step_id,
  ws.name      AS step_name,
  ws.type      AS step_type,
  COUNT(sl.id)                                                   AS executions,
  COUNT(sl.id) FILTER (WHERE sl.result IN ('success','branched_yes','branched_no')) AS successes,
  COUNT(sl.id) FILTER (WHERE sl.result = 'failed')               AS failures,
  COUNT(sl.id) FILTER (WHERE sl.result = 'skipped')              AS skipped,
  CASE WHEN COUNT(sl.id) > 0
       THEN ROUND((COUNT(sl.id) FILTER (WHERE sl.result NOT IN ('failed','pending'))::NUMERIC / COUNT(sl.id)) * 100, 1)
       ELSE 0 END                                                  AS success_rate_pct
FROM workflow_steps ws
LEFT JOIN workflow_step_logs sl ON sl.step_id = ws.id
GROUP BY ws.workflow_id, ws.id, ws.name, ws.type;

-- ─── Function: recompute workflow metrics ─────────────────────
CREATE OR REPLACE FUNCTION compute_workflow_metrics(p_workflow_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO workflow_metrics (
    workflow_id, total_enrolled, active_count, completed_count,
    exited_count, failed_count, goal_completed_count, last_computed_at
  )
  SELECT
    p_workflow_id,
    COUNT(*)                                                    AS total_enrolled,
    COUNT(*) FILTER (WHERE status = 'active')                   AS active_count,
    COUNT(*) FILTER (WHERE status = 'completed')                AS completed_count,
    COUNT(*) FILTER (WHERE status = 'exited')                   AS exited_count,
    COUNT(*) FILTER (WHERE status = 'failed')                   AS failed_count,
    COUNT(*) FILTER (WHERE goal_completed_at IS NOT NULL)       AS goal_completed_count,
    now()
  FROM workflow_enrollments
  WHERE workflow_id = p_workflow_id
  ON CONFLICT (workflow_id) DO UPDATE SET
    total_enrolled       = EXCLUDED.total_enrolled,
    active_count         = EXCLUDED.active_count,
    completed_count      = EXCLUDED.completed_count,
    exited_count         = EXCLUDED.exited_count,
    failed_count         = EXCLUDED.failed_count,
    goal_completed_count = EXCLUDED.goal_completed_count,
    last_computed_at     = now();
END;
$$ LANGUAGE plpgsql;

-- ─── Function: evaluate branch condition ─────────────────────
-- Returns TRUE if the contact passes all conditions in the branch config.
-- Used by the automation runner to pick branched_yes vs branched_no.
CREATE OR REPLACE FUNCTION evaluate_branch_condition(
  p_contact_id  UUID,
  p_conditions  JSONB,   -- [{field, operator, value}]
  p_logic       TEXT     -- 'and' | 'or'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_result   BOOLEAN := (p_logic = 'and');
  v_cond     JSONB;
  v_field    TEXT;
  v_op       TEXT;
  v_val      TEXT;
  v_contact  contacts%ROWTYPE;
  v_match    BOOLEAN;
BEGIN
  SELECT * INTO v_contact FROM contacts WHERE id = p_contact_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  FOR v_cond IN SELECT * FROM jsonb_array_elements(p_conditions) LOOP
    v_field := v_cond->>'field';
    v_op    := v_cond->>'operator';
    v_val   := v_cond->>'value';

    v_match := CASE v_field
      WHEN 'country'          THEN (v_contact.residency_country = v_val) = (v_op = 'equals')
      WHEN 'language'         THEN (v_contact.preferred_language = v_val) = (v_op = 'equals')
      WHEN 'lifecycle_stage'  THEN (v_contact.lifecycle_stage = v_val) = (v_op = 'equals')
      ELSE FALSE
    END;

    IF p_logic = 'and' THEN
      v_result := v_result AND v_match;
    ELSE
      v_result := v_result OR v_match;
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Auto-exit on unsubscribe ─────────────────────────────────
-- When a contact unsubscribes (consent update), exit all active marketing enrollments
CREATE OR REPLACE FUNCTION auto_exit_on_unsubscribe()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.consent_status IN ('opted_out', 'unsubscribed') AND NEW.channel = 'email' THEN
    UPDATE workflow_enrollments we
    SET status = 'exited', exit_reason = 'unsubscribed', completed_at = now()
    FROM automation_workflows aw
    WHERE we.workflow_id = aw.id
      AND we.contact_id = NEW.contact_id
      AND aw.project_id = NEW.project_id
      AND aw.stop_on_unsubscribe = true
      AND we.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exit_workflow_on_unsubscribe
  AFTER INSERT OR UPDATE ON consents
  FOR EACH ROW
  EXECUTE FUNCTION auto_exit_on_unsubscribe();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_enrollments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_metrics        ENABLE ROW LEVEL SECURITY;
