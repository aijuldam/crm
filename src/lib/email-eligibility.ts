/**
 * Send eligibility logic — evaluated before every campaign send.
 *
 * Marketing emails:
 *   - Requires opted_in consent for channel=email in the target project/list
 *   - Must pass suppression checks
 *
 * Operational emails:
 *   - No marketing consent required
 *   - Still blocked by hard bounces, complaints, and global suppression
 *   - Used for transactional/service messages (order confirmation, password reset)
 *
 * Suppression hierarchy (checked in order):
 *   1. Hard bounce on email (blocks all mail)
 *   2. Complaint / phishing report (blocks all mail)
 *   3. Global suppression (blocks all mail)
 *   4. Project-level suppression (blocks mail for that project)
 *   5. Marketing consent check (marketing only)
 */

import type { Contact, Consent } from './types'
import type {
  Suppression, BounceEvent, ComplaintEvent,
  EligibilityResult, IneligibilityReason,
} from './types/campaigns'

export interface EligibilityContext {
  contact: Contact
  consents: Consent[]
  suppressions: Suppression[]
  hardBounces: BounceEvent[]
  complaints: ComplaintEvent[]
  projectId: string
  listId?: string
  emailType: 'marketing' | 'operational'
  channel?: 'email' // extensible for sms/push later
}

export function checkSendEligibility(ctx: EligibilityContext): EligibilityResult {
  const email = ctx.contact.email_normalized

  // 1. Hard bounce
  if (ctx.hardBounces.some(b => b.email.toLowerCase() === email)) {
    return ineligible('hard_bounce')
  }

  // 2. Complaint / phishing report
  if (ctx.complaints.some(c => c.email.toLowerCase() === email)) {
    return ineligible('complaint')
  }

  // 3. Global suppression
  if (ctx.suppressions.some(s => s.email_normalized === email && s.scope === 'global')) {
    return ineligible('global_suppression')
  }

  // 4. Project-level suppression
  if (ctx.suppressions.some(
    s => s.email_normalized === email && s.scope === 'project' && s.project_id === ctx.projectId
  )) {
    return ineligible('project_suppression')
  }

  // 5. Marketing consent check (operational emails skip this)
  if (ctx.emailType === 'marketing') {
    const relevantConsents = ctx.consents.filter(
      c => c.contact_id === ctx.contact.id &&
           c.project_id === ctx.projectId &&
           c.channel === (ctx.channel ?? 'email')
    )

    const hasOptedIn = relevantConsents.some(c => c.consent_status === 'opted_in')
    const hasOptedOut = relevantConsents.some(
      c => c.consent_status === 'opted_out' || c.consent_status === 'unsubscribed'
    )

    if (hasOptedOut) return ineligible('consent_withdrawn')
    if (!hasOptedIn) return ineligible('no_consent')
  }

  return { eligible: true, reason: null }
}

function ineligible(reason: IneligibilityReason): EligibilityResult {
  return { eligible: false, reason }
}

// Batch check — returns { eligible: Contact[], suppressed: { contact: Contact; reason: IneligibilityReason }[] }
export function batchCheckEligibility(
  contacts: Contact[],
  ctx: Omit<EligibilityContext, 'contact'>
) {
  const eligible: Contact[] = []
  const suppressed: { contact: Contact; reason: IneligibilityReason }[] = []

  for (const contact of contacts) {
    const result = checkSendEligibility({ ...ctx, contact })
    if (result.eligible) {
      eligible.push(contact)
    } else {
      suppressed.push({ contact, reason: result.reason! })
    }
  }

  return { eligible, suppressed }
}

// Human-readable labels for suppression reasons
export const SUPPRESSION_REASON_LABELS: Record<IneligibilityReason, string> = {
  hard_bounce: 'Hard bounce',
  complaint: 'Spam complaint / phishing report',
  global_suppression: 'Global suppression list',
  project_suppression: 'Project suppression list',
  no_consent: 'No marketing consent on record',
  consent_withdrawn: 'Consent withdrawn / unsubscribed',
  no_email: 'No email address',
}

// Classify role/generic addresses that should never be mailed
const ROLE_ADDRESS_PREFIXES = [
  'abuse', 'admin', 'administrator', 'billing', 'ceo', 'cfo', 'coo', 'cto',
  'contact', 'hello', 'help', 'hostmaster', 'info', 'it', 'legal', 'mailer-daemon',
  'noc', 'noreply', 'no-reply', 'postmaster', 'privacy', 'root', 'sales',
  'security', 'spam', 'support', 'sysadmin', 'test', 'webmaster',
]

export function isRoleAddress(email: string): boolean {
  const local = email.split('@')[0]?.toLowerCase() ?? ''
  return ROLE_ADDRESS_PREFIXES.includes(local)
}
