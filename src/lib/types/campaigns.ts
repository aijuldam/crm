// ─── Template blocks ─────────────────────────────────────────────────────────

export type BlockType =
  | 'header'
  | 'text'
  | 'button'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'footer'
  | 'columns'

export interface HeaderBlock {
  type: 'header'
  id: string
  logo_url?: string
  logo_alt?: string
  background_color: string
  text?: string
  text_color: string
}

export interface TextBlock {
  type: 'text'
  id: string
  content: string           // supports {{first_name}} etc.
  font_size: number
  text_color: string
  background_color: string
  padding: number
}

export interface ButtonBlock {
  type: 'button'
  id: string
  label: string
  url: string               // supports {{unsubscribe_url}} etc.
  background_color: string
  text_color: string
  border_radius: number
  align: 'left' | 'center' | 'right'
}

export interface ImageBlock {
  type: 'image'
  id: string
  url: string
  alt: string
  link_url?: string
  width?: number
  align: 'left' | 'center' | 'right'
}

export interface DividerBlock {
  type: 'divider'
  id: string
  color: string
  thickness: number
  padding: number
}

export interface SpacerBlock {
  type: 'spacer'
  id: string
  height: number
}

export interface FooterBlock {
  type: 'footer'
  id: string
  text: string              // supports merge tags
  text_color: string
  background_color: string
  show_unsubscribe: boolean
  unsubscribe_text: string
  address?: string
}

export interface ColumnsBlock {
  type: 'columns'
  id: string
  ratio: '50/50' | '33/67' | '67/33'
  left: Block[]
  right: Block[]
}

export type Block =
  | HeaderBlock
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | DividerBlock
  | SpacerBlock
  | FooterBlock
  | ColumnsBlock

// ─── Template ────────────────────────────────────────────────────────────────

export type TemplateCategory = 'newsletter' | 'promotional' | 'transactional' | 'winback' | 'welcome' | 'blank'
export type ContentMode = 'blocks' | 'html'

export interface LanguageVariant {
  language: string
  subject: string
  preheader: string
  blocks?: Block[]
  html_override?: string
}

export interface EmailTemplate {
  id: string
  project_id: string | null    // null = shared across all projects
  name: string
  category: TemplateCategory
  content_mode: ContentMode
  blocks: Block[]
  html_override: string | null
  subject_default: string
  preheader_default: string
  language_variants: LanguageVariant[]
  thumbnail_url: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export type CampaignType = 'one_off' | 'automated'
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed'
export type AudienceType = 'list' | 'segment' | 'manual'
export type EmailType = 'marketing' | 'operational'

export interface CampaignAudience {
  type: AudienceType
  list_id?: string
  segment_id?: string
  filters?: Record<string, string>
}

export interface Campaign {
  id: string
  project_id: string
  name: string
  type: CampaignType
  email_type: EmailType
  status: CampaignStatus
  template_id: string | null
  audience: CampaignAudience
  subject: string
  preheader: string
  from_name: string
  from_email: string
  reply_to: string | null
  language: string
  scheduled_at: string | null
  sent_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // relations
  project?: { name: string; slug: string }
  template?: EmailTemplate
  // aggregates
  recipient_count?: number
  latest_run?: CampaignRun
}

// ─── Campaign run ─────────────────────────────────────────────────────────────

export type RunStatus = 'pending' | 'sending' | 'completed' | 'failed' | 'cancelled'

export interface CampaignRun {
  id: string
  campaign_id: string
  status: RunStatus
  recipient_count: number
  suppressed_count: number
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  provider_batch_id: string | null
  created_at: string
  // aggregates
  metrics?: CampaignMetrics
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

export interface CampaignMetrics {
  sent: number
  delivered: number
  delivery_rate: number
  unique_opens: number
  total_opens: number
  open_rate: number
  unique_clicks: number
  total_clicks: number
  click_rate: number
  ctor: number            // click-to-open rate
  bounces_hard: number
  bounces_soft: number
  bounce_rate: number
  unsubscribes: number
  unsubscribe_rate: number
  complaints: number
  complaint_rate: number
  suppressed: number
}

export interface TimeSeriesPoint {
  date: string
  opens: number
  clicks: number
  unsubscribes: number
  bounces: number
}

// ─── Email event ──────────────────────────────────────────────────────────────

export type EmailEventType =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced_hard'
  | 'bounced_soft'
  | 'unsubscribed'
  | 'complained'
  | 'suppressed'

export interface EmailEvent {
  id: string
  campaign_run_id: string
  contact_id: string
  email: string
  event_type: EmailEventType
  link_url: string | null
  bounce_type: string | null
  bounce_reason: string | null
  provider_event_id: string | null
  occurred_at: string
}

// ─── Suppression ──────────────────────────────────────────────────────────────

export type SuppressionScope = 'global' | 'project' | 'list'
export type SuppressionReason =
  | 'hard_bounce'
  | 'complaint'
  | 'manual'
  | 'unsubscribed'
  | 'role_address'      // abuse@, postmaster@, etc.
  | 'invalid_email'
  | 'gdpr_erasure'

export interface Suppression {
  id: string
  email_normalized: string
  scope: SuppressionScope
  project_id: string | null
  list_id: string | null
  reason: SuppressionReason
  notes: string | null
  source_event_id: string | null
  added_at: string
}

// ─── Bounce / Complaint ────────────────────────────────────────────────────────

export interface BounceEvent {
  id: string
  email: string
  campaign_run_id: string | null
  bounce_type: 'hard' | 'soft'
  bounce_subtype: string | null
  bounce_reason: string
  occurred_at: string
}

export interface ComplaintEvent {
  id: string
  email: string
  campaign_run_id: string | null
  complaint_type: string
  occurred_at: string
}

// ─── Eligibility ──────────────────────────────────────────────────────────────

export type IneligibilityReason =
  | 'hard_bounce'
  | 'complaint'
  | 'global_suppression'
  | 'project_suppression'
  | 'no_consent'
  | 'consent_withdrawn'
  | 'no_email'

export interface EligibilityResult {
  eligible: boolean
  reason: IneligibilityReason | null
}

// ─── Report aggregates ────────────────────────────────────────────────────────

export interface AccountReportMetrics extends CampaignMetrics {
  campaigns_sent: number
  active_campaigns: number
  total_recipients: number
  top_campaigns: { id: string; name: string; open_rate: number }[]
  by_project: { project: string; sent: number; open_rate: number }[]
  time_series: TimeSeriesPoint[]
}

export interface ReportFilters {
  date_from?: string
  date_to?: string
  project_id?: string
  country?: string
  language?: string
  list_id?: string
  campaign_type?: CampaignType
  compare_previous?: boolean
}
