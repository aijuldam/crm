// ─── Enums ───────────────────────────────────────────────────────────────────

export type ProjectType = 'b2c' | 'b2b' | 'hybrid'

export type LifecycleStage =
  | 'lead'
  | 'prospect'
  | 'customer'
  | 'evangelist'
  | 'churned'

export type ConsentStatus =
  | 'opted_in'
  | 'opted_out'
  | 'pending'
  | 'unsubscribed'

export type LegalBasis =
  | 'consent'
  | 'legitimate_interest'
  | 'contract'
  | 'legal_obligation'

export type Channel = 'email' | 'sms' | 'push' | 'post' | 'phone'

export type UserRole = 'admin' | 'marketing' | 'sales' | 'viewer'

export type ActivityType =
  | 'email_sent'
  | 'email_opened'
  | 'form_submitted'
  | 'list_added'
  | 'consent_updated'
  | 'note_added'
  | 'deal_created'
  | 'task_created'
  | 'contact_created'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  slug: string
  type: ProjectType
  default_language: string
  default_country: string
  sending_domain: string | null
  privacy_notice_version: string
  is_active: boolean
  created_at: string
  updated_at: string
  // aggregates
  contact_count?: number
  list_count?: number
}

export interface Contact {
  id: string
  email: string
  email_normalized: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  country_code: string | null
  residency_country: string | null
  preferred_language: string | null
  timezone: string | null
  currency: string | null
  market: string | null
  lifecycle_stage: LifecycleStage
  source: string | null
  owner_id: string | null
  created_at: string
  updated_at: string
  // relations
  projects?: Project[]
  lists?: List[]
  consents?: Consent[]
  activities?: Activity[]
  tasks?: Task[]
  company?: Company | null
}

export interface Company {
  id: string
  name: string
  domain: string | null
  registered_country: string | null
  billing_country: string | null
  vat_number: string | null
  vat_validated_at: string | null
  industry: string | null
  company_size: string | null
  created_at: string
  updated_at: string
  // aggregates
  contact_count?: number
}

export interface ContactProject {
  id: string
  contact_id: string
  project_id: string
  joined_at: string
}

export interface List {
  id: string
  project_id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // aggregates
  contact_count?: number
  project?: Project
}

export interface ContactList {
  id: string
  contact_id: string
  list_id: string
  added_at: string
}

export interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'gt' | 'lt' | 'is_set' | 'is_not_set'
  value: string | string[] | number | null
}

export interface Segment {
  id: string
  project_id: string
  name: string
  description: string | null
  conditions: SegmentCondition[]
  is_active: boolean
  created_at: string
  updated_at: string
  // aggregates
  contact_count?: number
  project?: Project
}

export interface Consent {
  id: string
  contact_id: string
  project_id: string
  list_id: string | null
  channel: Channel
  purpose: string | null
  consent_status: ConsentStatus
  legal_basis: LegalBasis | null
  consent_country: string | null
  consent_language: string | null
  consent_text_version: string | null
  privacy_notice_version: string | null
  source_form_id: string | null
  source_page: string | null
  consented_at: string | null
  withdrawn_at: string | null
  created_at: string
  updated_at: string
  // relations
  contact?: Contact
  project?: Project
  list?: List
}

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea'
  label: string
  name: string
  required: boolean
  options?: string[]
  maps_to?: string // contact field it maps to
}

export interface Form {
  id: string
  project_id: string
  name: string
  slug: string
  fields: FormField[]
  settings: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
  // aggregates
  submission_count?: number
  project?: Project
}

export interface Submission {
  id: string
  form_id: string
  contact_id: string | null
  data: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  source_page: string | null
  submitted_at: string
  contact?: Contact
  form?: Form
}

export interface Activity {
  id: string
  contact_id: string | null
  company_id: string | null
  project_id: string | null
  type: ActivityType
  subject: string | null
  body: string | null
  metadata: Record<string, unknown>
  performed_by: string | null
  created_at: string
}

export interface Task {
  id: string
  contact_id: string | null
  company_id: string | null
  deal_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  contact_id: string | null
  company_id: string | null
  project_id: string
  title: string
  value: number | null
  currency: string
  stage: DealStage
  closed_at: string | null
  owner_id: string | null
  created_at: string
  updated_at: string
}

export interface CrmUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  project_id: string
  role: UserRole
  created_at: string
  user?: CrmUser
  project?: Project
}

// ─── API / UI helpers ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export interface DashboardStats {
  total_contacts: number
  contacts_by_project: { project: string; count: number }[]
  contacts_by_country: { country: string; count: number }[]
  contacts_by_lifecycle: { stage: string; count: number }[]
  new_contacts_over_time: { date: string; count: number }[]
  list_growth: { list: string; count: number }[]
  consent_summary: { status: string; count: number }[]
}

export interface ContactFilters {
  search?: string
  project_id?: string
  lifecycle_stage?: LifecycleStage
  country?: string
  list_id?: string
  page?: number
  per_page?: number
}

export interface CompanyFilters {
  search?: string
  country?: string
  industry?: string
  page?: number
  per_page?: number
}
