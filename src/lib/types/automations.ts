// ─── Contact events ───────────────────────────────────────────────────────────

export type EventType =
  | 'form_submitted'
  | 'quiz_completed'
  | 'guide_downloaded'
  | 'page_viewed'
  | 'form_started'
  | 'form_abandoned'
  | 'contact_inactive'
  | 'link_clicked'
  | 'email_opened'
  | 'purchase_completed'
  | 'custom'

export type EventSource = 'api' | 'webhook' | 'sdk' | 'import' | 'internal'

export interface ContactEvent {
  id: string
  project_id: string
  contact_id: string | null
  email: string | null
  event_type: EventType
  source: EventSource
  properties: Record<string, unknown>
  session_id: string | null
  idempotency_key: string | null
  occurred_at: string
  ingested_at: string
  // relations
  contact?: { first_name: string | null; last_name: string | null; email_normalized: string }
}

// ─── Workflow core types ───────────────────────────────────────────────────────

export type WorkflowStatus   = 'draft' | 'active' | 'paused' | 'archived'
export type WorkflowCategory = 'welcome' | 'nurture' | 'reengagement' | 'content_delivery' | 'transactional' | 'custom'
export type ReEntryRule      = 'none' | 'always' | 'after_exit'

export type StepType =
  | 'trigger'
  | 'delay'
  | 'condition'
  | 'branch'
  | 'send_email'
  | 'wait_for_event'
  | 'add_to_list'
  | 'remove_from_list'
  | 'create_task'
  | 'update_field'
  | 'exit'

// ─── Step configs (discriminated union by StepType) ───────────────────────────

export interface TriggerConfig {
  event_type: EventType
  filters?: Record<string, string>  // e.g. {form_id: 'form-1', quiz_score_min: '80'}
}

export interface DelayConfig {
  value: number
  unit: 'minutes' | 'hours' | 'days' | 'weeks'
}

export type BranchField    = 'country' | 'language' | 'lifecycle_stage' | 'consent_status' | 'event_type' | 'tag' | 'custom_field'
export type BranchOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'exists' | 'not_exists' | 'gt' | 'lt'

export interface BranchCondition {
  field: BranchField
  operator: BranchOperator
  value: string
}

export interface ConditionConfig {
  conditions: BranchCondition[]
  logic: 'and' | 'or'
}

export interface BranchConfig {
  conditions: BranchCondition[]
  logic: 'and' | 'or'
  yes_label?: string
  no_label?: string
}

export interface SendEmailConfig {
  template_id?: string
  subject: string
  preheader?: string
  from_name: string
  from_email: string
  reply_to?: string
  email_type: 'marketing' | 'operational'
}

export interface WaitForEventConfig {
  event_type: EventType
  filters?: Record<string, string>
  timeout_days: number
  timeout_action: 'continue' | 'exit' | 'branch'
}

export interface AddToListConfig    { list_id: string; list_name?: string }
export interface RemoveFromListConfig { list_id: string; list_name?: string }
export interface CreateTaskConfig   { title: string; priority: 'low' | 'medium' | 'high'; assign_to?: string; due_days?: number }
export interface UpdateFieldConfig  { field: string; value: string }
export interface ExitConfig         { reason?: string }
export interface EmptyConfig        { [k: string]: never }

export type StepConfig =
  | TriggerConfig
  | DelayConfig
  | ConditionConfig
  | BranchConfig
  | SendEmailConfig
  | WaitForEventConfig
  | AddToListConfig
  | RemoveFromListConfig
  | CreateTaskConfig
  | UpdateFieldConfig
  | ExitConfig
  | EmptyConfig

// ─── Workflow step ─────────────────────────────────────────────────────────────

export interface WorkflowStep {
  id: string
  workflow_id: string
  type: StepType
  name: string
  config: StepConfig
  position_x: number
  position_y: number
  next_step_id: string | null
  branch_yes_step_id: string | null
  branch_no_step_id: string | null
  order_index: number
  created_at: string
}

// ─── Automation workflow ───────────────────────────────────────────────────────

export interface AutomationWorkflow {
  id: string
  project_id: string
  name: string
  description: string
  category: WorkflowCategory
  status: WorkflowStatus
  trigger_config: TriggerConfig
  re_entry: ReEntryRule
  re_entry_delay_days: number
  frequency_cap_per_day: number | null
  goal_event_type: EventType | null
  goal_conditions: Record<string, unknown> | null
  exclusion_list_id: string | null
  stop_on_unsubscribe: boolean
  stop_on_conversion: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // relations
  steps?: WorkflowStep[]
  project?: { name: string; slug: string }
  // aggregates (from workflow_metrics)
  enrollment_count?: number
  completion_rate?: number
  goal_completion_rate?: number
}

// ─── Enrollments ──────────────────────────────────────────────────────────────

export type EnrollmentStatus = 'active' | 'completed' | 'exited' | 'failed'

export interface WorkflowEnrollment {
  id: string
  workflow_id: string
  contact_id: string
  status: EnrollmentStatus
  enrolled_at: string
  current_step_id: string | null
  completed_at: string | null
  exit_reason: string | null
  goal_completed_at: string | null
  // relations
  contact?: { first_name: string | null; last_name: string | null; email_normalized: string }
}

// ─── Step execution log ────────────────────────────────────────────────────────

export type StepResult = 'success' | 'skipped' | 'failed' | 'branched_yes' | 'branched_no' | 'pending'

export interface WorkflowStepLog {
  id: string
  enrollment_id: string
  step_id: string
  executed_at: string
  result: StepResult
  output: Record<string, unknown>
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface WorkflowStepStat {
  step_id: string
  step_name: string
  step_type: StepType
  executions: number
  successes: number
  failures: number
  skipped: number
  success_rate_pct: number
}

export interface WorkflowAnalytics {
  total_enrolled: number
  active_count: number
  completed_count: number
  exited_count: number
  failed_count: number
  completion_rate: number
  goal_completion_rate: number
  avg_completion_days: number
  step_stats: WorkflowStepStat[]
  email_performance: {
    step_id: string
    step_name: string
    sent: number
    open_rate: number
    click_rate: number
    unsubscribe_rate: number
  }[]
  enrollment_by_day: { date: string; enrolled: number; completed: number }[]
  exit_reasons: { reason: string; count: number }[]
}

// ─── Extension point interfaces (Phase 4+) ────────────────────────────────────
// These define the contracts for future modules without implementing them.
// Each interface is intentionally minimal — implementations will extend them.

/** Lead scoring — Phase 4 */
export interface LeadScore {
  contact_id: string
  score: number                  // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  breakdown: { category: string; points: number; label: string }[]
  computed_at: string
}

/** AI-generated email suggestion — Phase 4 */
export interface AIEmailSuggestion {
  workflow_id?: string
  step_id?: string
  subject: string
  preheader: string
  body_summary: string
  tone: 'professional' | 'friendly' | 'urgent' | 'empathetic'
  confidence: number             // 0–1
  generated_at: string
}

/** AI contact summary — Phase 4 */
export interface AIContactSummary {
  contact_id: string
  summary: string
  key_signals: string[]
  recommended_next_action: string
  generated_at: string
}

/** Send-time optimisation — Phase 4 */
export interface SendTimeOptimization {
  contact_id: string
  optimal_hour_utc: number       // 0–23
  optimal_day_of_week: number    // 0 = Sunday
  confidence: number             // 0–1
  data_points: number            // number of past sends used
  computed_at: string
}

/** Predictive segment membership — Phase 4 */
export interface PredictiveSegmentMember {
  contact_id: string
  segment_id: string
  probability: number            // 0–1 churn / purchase / etc. probability
  features: Record<string, number>
  computed_at: string
}

/** A/B test variant — Phase 4 */
export interface ABTestVariant {
  id: string
  test_id: string
  name: string
  subject?: string
  template_id?: string
  send_percentage: number        // % of audience to send this variant to
  is_winner: boolean
  metrics?: { open_rate: number; click_rate: number; revenue?: number }
}

/** Double opt-in workflow config — Phase 4 */
export interface DoubleOptInConfig {
  project_id: string
  confirmation_template_id: string
  confirmation_url_pattern: string  // e.g. https://brand.com/confirm?token={{token}}
  expiry_hours: number
  redirect_url: string
}

/** VAT validation result — Phase 4 */
export interface VATValidationResult {
  vat_number: string
  country_code: string
  is_valid: boolean
  company_name?: string
  company_address?: string
  checked_at: string
  provider: 'vies' | 'hmrc' | 'manual'
}

/** Data warehouse export job — Phase 4 */
export interface DataExportJob {
  id: string
  scope: 'contacts' | 'events' | 'campaigns' | 'enrollments' | 'full'
  format: 'csv' | 'jsonl' | 'parquet'
  destination: 'download' | 's3' | 'bigquery' | 'snowflake'
  filters?: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed'
  row_count?: number
  file_url?: string
  created_at: string
  completed_at?: string
}

/** Shared inbox message — Phase 4 */
export interface InboxMessage {
  id: string
  project_id: string
  contact_id: string
  channel: 'email' | 'chat' | 'sms'
  direction: 'inbound' | 'outbound'
  subject?: string
  body: string
  assigned_to?: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  created_at: string
}

/** Billing / invoice sync — Phase 4 */
export interface Invoice {
  id: string
  contact_id: string
  company_id?: string
  amount_cents: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
  due_date: string
  paid_at?: string
  provider: 'stripe' | 'mollie' | 'manual'
  provider_invoice_id?: string
  created_at: string
}

/** Support ticket — Phase 4 */
export interface SupportTicket {
  id: string
  project_id: string
  contact_id: string
  title: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  created_at: string
  resolved_at?: string
}

/** Affiliate / partner record — Phase 4 */
export interface AffiliatePartner {
  id: string
  project_id: string
  contact_id: string
  code: string
  commission_pct: number
  total_referrals: number
  total_commission_cents: number
  status: 'active' | 'suspended'
  joined_at: string
}
