/**
 * Extension point registry for Phase 4+ modules.
 *
 * Each adapter interface defines the contract a future implementation must satisfy.
 * The default stubs return null / empty — wire in a real implementation by
 * registering it with `registerExtension()`.
 *
 * Current extension points:
 *   - LeadScoringAdapter     — score contacts 0–100 from engagement + firmographic data
 *   - AIAdapter              — generate email copy, contact summaries, send-time hints
 *   - ABTestAdapter          — create and evaluate subject / content experiments
 *   - DoubleOptInAdapter     — GDPR-grade confirmation flow
 *   - DataExportAdapter      — async warehouse / file export jobs
 *   - VATValidationAdapter   — VIES / HMRC VAT lookup
 *   - BillingAdapter         — invoice sync from Stripe / Mollie
 *   - SupportAdapter         — ticket sync from Zendesk / Intercom / plain
 *   - AffiliateAdapter       — referral tracking and commission calculation
 *   - SendTimeAdapter        — per-contact optimal send-time prediction
 */

import type {
  LeadScore,
  AIEmailSuggestion,
  AIContactSummary,
  SendTimeOptimization,
  PredictiveSegmentMember,
  ABTestVariant,
  DoubleOptInConfig,
  VATValidationResult,
  DataExportJob,
  Invoice,
  SupportTicket,
  AffiliatePartner,
} from '@/lib/types/automations'

// ─── Adapter interfaces ───────────────────────────────────────────────────────

export interface LeadScoringAdapter {
  scoreContact(contactId: string, projectId: string): Promise<LeadScore | null>
  batchScore(contactIds: string[], projectId: string): Promise<LeadScore[]>
}

export interface AIAdapter {
  suggestEmail(context: {
    workflowCategory: string
    stepIndex: number
    language: string
    tone?: string
  }): Promise<AIEmailSuggestion | null>

  summarizeContact(contactId: string): Promise<AIContactSummary | null>

  predictSendTime(contactId: string): Promise<SendTimeOptimization | null>

  predictSegmentMembership(contactIds: string[], segmentId: string): Promise<PredictiveSegmentMember[]>
}

export interface ABTestAdapter {
  createTest(params: {
    campaignId?: string
    stepId?: string
    variants: Omit<ABTestVariant, 'id' | 'test_id' | 'is_winner' | 'metrics'>[]
  }): Promise<{ test_id: string; variants: ABTestVariant[] }>

  pickWinner(testId: string): Promise<ABTestVariant | null>
}

export interface DoubleOptInAdapter {
  sendConfirmation(contactId: string, config: DoubleOptInConfig): Promise<{ token: string }>
  verifyToken(token: string): Promise<{ valid: boolean; contactId?: string }>
}

export interface DataExportAdapter {
  createJob(params: Pick<DataExportJob, 'scope' | 'format' | 'destination' | 'filters'>): Promise<DataExportJob>
  getJob(jobId: string): Promise<DataExportJob | null>
}

export interface VATValidationAdapter {
  validate(vatNumber: string, countryCode: string): Promise<VATValidationResult>
}

export interface BillingAdapter {
  syncInvoices(contactId: string): Promise<Invoice[]>
  getInvoice(invoiceId: string): Promise<Invoice | null>
}

export interface SupportAdapter {
  getTickets(contactId: string): Promise<SupportTicket[]>
  createTicket(params: Pick<SupportTicket, 'project_id' | 'contact_id' | 'title' | 'priority' | 'tags'>): Promise<SupportTicket>
}

export interface AffiliateAdapter {
  getPartner(contactId: string): Promise<AffiliatePartner | null>
  createPartner(contactId: string, projectId: string): Promise<AffiliatePartner>
}

export interface SendTimeAdapter {
  predict(contactId: string): Promise<SendTimeOptimization | null>
  batchPredict(contactIds: string[]): Promise<SendTimeOptimization[]>
}

// ─── Extension registry ───────────────────────────────────────────────────────

interface ExtensionRegistry {
  leadScoring?: LeadScoringAdapter
  ai?: AIAdapter
  abTest?: ABTestAdapter
  doubleOptIn?: DoubleOptInAdapter
  dataExport?: DataExportAdapter
  vatValidation?: VATValidationAdapter
  billing?: BillingAdapter
  support?: SupportAdapter
  affiliate?: AffiliateAdapter
  sendTime?: SendTimeAdapter
}

const registry: ExtensionRegistry = {}

export function registerExtension<K extends keyof ExtensionRegistry>(
  key: K,
  adapter: NonNullable<ExtensionRegistry[K]>
): void {
  registry[key] = adapter
}

export function getExtension<K extends keyof ExtensionRegistry>(key: K): ExtensionRegistry[K] {
  return registry[key]
}

// ─── Convenience accessors ────────────────────────────────────────────────────
// These return null/[] when no adapter is registered, so call sites don't
// need to null-check the registry on every use.

export async function scoreContact(contactId: string, projectId: string): Promise<LeadScore | null> {
  return registry.leadScoring?.scoreContact(contactId, projectId) ?? null
}

export async function generateEmailSuggestion(context: Parameters<AIAdapter['suggestEmail']>[0]): Promise<AIEmailSuggestion | null> {
  return registry.ai?.suggestEmail(context) ?? null
}

export async function summarizeContact(contactId: string): Promise<AIContactSummary | null> {
  return registry.ai?.summarizeContact(contactId) ?? null
}

export async function predictSendTime(contactId: string): Promise<SendTimeOptimization | null> {
  if (registry.sendTime) return registry.sendTime.predict(contactId)
  return registry.ai?.predictSendTime(contactId) ?? null
}

export async function validateVAT(vatNumber: string, countryCode: string): Promise<VATValidationResult | null> {
  return registry.vatValidation?.validate(vatNumber, countryCode) ?? null
}

export async function syncInvoices(contactId: string): Promise<Invoice[]> {
  return registry.billing?.syncInvoices(contactId) ?? []
}

export async function getTickets(contactId: string): Promise<SupportTicket[]> {
  return registry.support?.getTickets(contactId) ?? []
}

// ─── Feature flag helpers (gate UI for unregistered extensions) ───────────────

export function isExtensionEnabled(key: keyof ExtensionRegistry): boolean {
  return key in registry && registry[key] !== undefined
}

export const EXTENSION_LABELS: Record<keyof ExtensionRegistry, string> = {
  leadScoring:   'Lead scoring',
  ai:            'AI assistant',
  abTest:        'A/B testing',
  doubleOptIn:   'Double opt-in',
  dataExport:    'Data export',
  vatValidation: 'VAT validation',
  billing:       'Billing / invoicing',
  support:       'Support tickets',
  affiliate:     'Affiliate / partner CRM',
  sendTime:      'Send-time optimisation',
}
