import type {
  EmailTemplate, Campaign, CampaignRun, EmailEvent,
  Suppression, BounceEvent, ComplaintEvent, CampaignMetrics, TimeSeriesPoint,
} from './types/campaigns'

// ─── Email Templates ──────────────────────────────────────────────────────────

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    project_id: null,
    name: 'Monthly Newsletter',
    category: 'newsletter',
    content_mode: 'blocks',
    subject_default: 'Your {{month}} update from {{project_name}}',
    preheader_default: 'The latest news, tips and offers — just for you.',
    blocks: [
      {
        type: 'header', id: 'b1',
        background_color: '#4F46E5', text: '{{project_name}}',
        text_color: '#ffffff', logo_url: '',
      },
      {
        type: 'text', id: 'b2',
        content: 'Hi {{first_name}},\n\nWelcome to your monthly update. Here\'s what\'s new this month.',
        font_size: 15, text_color: '#1e293b', background_color: '#ffffff', padding: 24,
      },
      {
        type: 'button', id: 'b3',
        label: 'Read more', url: '{{cta_url}}',
        background_color: '#4F46E5', text_color: '#ffffff',
        border_radius: 8, align: 'center',
      },
      {
        type: 'divider', id: 'b4',
        color: '#e2e8f0', thickness: 1, padding: 16,
      },
      {
        type: 'footer', id: 'b5',
        text: '© 2026 {{project_name}}. All rights reserved.\n{{address}}',
        text_color: '#94a3b8', background_color: '#f8fafc',
        show_unsubscribe: true, unsubscribe_text: 'Unsubscribe',
        address: '123 Example Street, Amsterdam, Netherlands',
      },
    ],
    html_override: null,
    language_variants: [
      {
        language: 'nl',
        subject: 'Jouw {{month}} update van {{project_name}}',
        preheader: 'Het laatste nieuws, tips en aanbiedingen — speciaal voor jou.',
      },
      {
        language: 'fr',
        subject: 'Votre mise à jour {{month}} de {{project_name}}',
        preheader: 'Les dernières nouvelles, conseils et offres — rien que pour vous.',
      },
      {
        language: 'de',
        subject: 'Ihr {{month}}-Update von {{project_name}}',
        preheader: 'Die neuesten Nachrichten, Tipps und Angebote – nur für Sie.',
      },
    ],
    thumbnail_url: null,
    is_active: true,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'tpl-2',
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'Winback — NL',
    category: 'winback',
    content_mode: 'blocks',
    subject_default: 'We miss you, {{first_name}} 👋',
    preheader_default: 'It\'s been a while. Here\'s something special just for you.',
    blocks: [
      {
        type: 'header', id: 'b1',
        background_color: '#0f172a', text: 'Dutch Market',
        text_color: '#ffffff',
      },
      {
        type: 'text', id: 'b2',
        content: 'Hi {{first_name}},\n\nWe noticed you haven\'t been around in a while. We\'d love to have you back.\n\nAs a thank-you for being a valued customer, here\'s an exclusive offer just for you.',
        font_size: 15, text_color: '#1e293b', background_color: '#ffffff', padding: 24,
      },
      {
        type: 'button', id: 'b3',
        label: 'Claim your offer', url: '{{offer_url}}',
        background_color: '#059669', text_color: '#ffffff',
        border_radius: 8, align: 'center',
      },
      {
        type: 'footer', id: 'b4',
        text: '© 2026 Dutch Market. All rights reserved.',
        text_color: '#94a3b8', background_color: '#f8fafc',
        show_unsubscribe: true, unsubscribe_text: 'Unsubscribe',
      },
    ],
    html_override: null,
    language_variants: [
      {
        language: 'nl',
        subject: 'We missen je, {{first_name}} 👋',
        preheader: 'Het is al een tijdje geleden. Hier is iets speciaals voor jou.',
      },
    ],
    thumbnail_url: null,
    is_active: true,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'tpl-3',
    project_id: null,
    name: 'Promotional — Spring Sale',
    category: 'promotional',
    content_mode: 'blocks',
    subject_default: '🌸 Spring Sale: up to 30% off — this weekend only',
    preheader_default: 'Exclusive discounts for our email subscribers.',
    blocks: [
      {
        type: 'header', id: 'b1',
        background_color: '#db2777', text: '🌸 Spring Sale',
        text_color: '#ffffff',
      },
      {
        type: 'image', id: 'b2',
        url: 'https://placehold.co/600x200/fdf2f8/db2777?text=Spring+Sale+2026',
        alt: 'Spring Sale 2026',
        align: 'center',
      },
      {
        type: 'text', id: 'b3',
        content: 'Hi {{first_name}},\n\nOur biggest spring sale is here. Enjoy up to **30% off** selected products this weekend only.',
        font_size: 15, text_color: '#1e293b', background_color: '#ffffff', padding: 24,
      },
      {
        type: 'button', id: 'b4',
        label: 'Shop the sale', url: '{{shop_url}}',
        background_color: '#db2777', text_color: '#ffffff',
        border_radius: 6, align: 'center',
      },
      {
        type: 'footer', id: 'b5',
        text: '© 2026 {{project_name}}.',
        text_color: '#94a3b8', background_color: '#f8fafc',
        show_unsubscribe: true, unsubscribe_text: 'Unsubscribe',
      },
    ],
    html_override: null,
    language_variants: [
      {
        language: 'nl',
        subject: '🌸 Lente Sale: tot 30% korting — dit weekend',
        preheader: 'Exclusieve kortingen voor onze e-mailabonnees.',
      },
      {
        language: 'fr',
        subject: '🌸 Vente de printemps : jusqu\'à -30% ce week-end',
        preheader: 'Des réductions exclusives pour nos abonnés.',
      },
      {
        language: 'de',
        subject: '🌸 Frühlings-Sale: bis zu 30% Rabatt – nur dieses Wochenende',
        preheader: 'Exklusive Rabatte für unsere E-Mail-Abonnenten.',
      },
    ],
    thumbnail_url: null,
    is_active: true,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-20T10:00:00Z',
  },
  {
    id: 'tpl-4',
    project_id: null,
    name: 'Welcome Email',
    category: 'welcome',
    content_mode: 'blocks',
    subject_default: 'Welcome to {{project_name}}, {{first_name}}!',
    preheader_default: 'Great to have you on board.',
    blocks: [
      {
        type: 'header', id: 'b1',
        background_color: '#4F46E5', text: '{{project_name}}',
        text_color: '#ffffff',
      },
      {
        type: 'text', id: 'b2',
        content: 'Hi {{first_name}},\n\nWelcome! We\'re really glad you\'re here.\n\nYou\'re now subscribed to receive updates, tips, and exclusive offers.',
        font_size: 15, text_color: '#1e293b', background_color: '#ffffff', padding: 24,
      },
      {
        type: 'button', id: 'b3',
        label: 'Explore now', url: '{{website_url}}',
        background_color: '#4F46E5', text_color: '#ffffff',
        border_radius: 8, align: 'center',
      },
      {
        type: 'footer', id: 'b4',
        text: '© 2026 {{project_name}}.',
        text_color: '#94a3b8', background_color: '#f8fafc',
        show_unsubscribe: true, unsubscribe_text: 'Unsubscribe',
        address: '123 Example Street, Amsterdam, Netherlands',
      },
    ],
    html_override: null,
    language_variants: [],
    thumbnail_url: null,
    is_active: true,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
  },
]

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'NL January Newsletter',
    type: 'one_off',
    email_type: 'marketing',
    status: 'sent',
    template_id: 'tpl-1',
    audience: { type: 'list', list_id: '40000000-0000-0000-0001-000000000001' },
    subject: 'Jouw januari update van Dutch Market',
    preheader: 'Het laatste nieuws, tips en aanbiedingen.',
    from_name: 'Dutch Market',
    from_email: 'hello@mail.dutchbrand.nl',
    reply_to: 'support@dutchbrand.nl',
    language: 'nl',
    scheduled_at: '2026-01-15T09:00:00Z',
    sent_at: '2026-01-15T09:02:00Z',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-15T09:02:00Z',
    recipient_count: 3210,
  },
  {
    id: 'camp-2',
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'NL Spring Sale',
    type: 'one_off',
    email_type: 'marketing',
    status: 'sent',
    template_id: 'tpl-3',
    audience: { type: 'list', list_id: '40000000-0000-0000-0001-000000000002' },
    subject: '🌸 Lente Sale: tot 30% korting — dit weekend',
    preheader: 'Exclusieve kortingen voor onze e-mailabonnees.',
    from_name: 'Dutch Market',
    from_email: 'promo@mail.dutchbrand.nl',
    reply_to: null,
    language: 'nl',
    scheduled_at: '2026-02-22T10:00:00Z',
    sent_at: '2026-02-22T10:03:00Z',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-22T10:03:00Z',
    recipient_count: 1850,
  },
  {
    id: 'camp-3',
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'NL Winback Q1',
    type: 'one_off',
    email_type: 'marketing',
    status: 'sent',
    template_id: 'tpl-2',
    audience: { type: 'segment', segment_id: 'seg-1' },
    subject: 'We missen je, {{first_name}} 👋',
    preheader: 'Het is al een tijdje geleden. Hier is iets speciaals voor jou.',
    from_name: 'Dutch Market',
    from_email: 'hello@mail.dutchbrand.nl',
    reply_to: 'support@dutchbrand.nl',
    language: 'nl',
    scheduled_at: '2026-03-05T09:00:00Z',
    sent_at: '2026-03-05T09:01:00Z',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-02-28T10:00:00Z',
    updated_at: '2026-03-05T09:01:00Z',
    recipient_count: 312,
  },
  {
    id: 'camp-4',
    project_id: '10000000-0000-0000-0000-000000000002',
    name: 'FR February Newsletter',
    type: 'one_off',
    email_type: 'marketing',
    status: 'sent',
    template_id: 'tpl-1',
    audience: { type: 'list', list_id: '40000000-0000-0000-0002-000000000001' },
    subject: 'Votre mise à jour de février de French Market',
    preheader: 'Les dernières nouvelles et offres.',
    from_name: 'French Market',
    from_email: 'bonjour@mail.frenchbrand.fr',
    reply_to: null,
    language: 'fr',
    scheduled_at: '2026-02-10T09:00:00Z',
    sent_at: '2026-02-10T09:04:00Z',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-02-10T09:04:00Z',
    recipient_count: 2100,
  },
  {
    id: 'camp-5',
    project_id: '10000000-0000-0000-0000-000000000003',
    name: 'DE March Newsletter',
    type: 'one_off',
    email_type: 'marketing',
    status: 'sent',
    template_id: 'tpl-1',
    audience: { type: 'list', list_id: '40000000-0000-0000-0003-000000000001' },
    subject: 'Ihr März-Update von German Market',
    preheader: 'Neuigkeiten und Angebote für Sie.',
    from_name: 'German Market',
    from_email: 'hallo@mail.germanbrand.de',
    reply_to: null,
    language: 'de',
    scheduled_at: '2026-03-10T08:00:00Z',
    sent_at: '2026-03-10T08:02:00Z',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-03-10T08:02:00Z',
    recipient_count: 1980,
  },
  {
    id: 'camp-6',
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'NL April Newsletter',
    type: 'one_off',
    email_type: 'marketing',
    status: 'draft',
    template_id: 'tpl-1',
    audience: { type: 'list', list_id: '40000000-0000-0000-0001-000000000001' },
    subject: 'Jouw april update van Dutch Market',
    preheader: 'Het beste van april.',
    from_name: 'Dutch Market',
    from_email: 'hello@mail.dutchbrand.nl',
    reply_to: null,
    language: 'nl',
    scheduled_at: null,
    sent_at: null,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-04-10T10:00:00Z',
    updated_at: '2026-04-10T10:00:00Z',
    recipient_count: 3240,
  },
  {
    id: 'camp-7',
    project_id: '10000000-0000-0000-0000-000000000004',
    name: 'ES Spring Newsletter',
    type: 'one_off',
    email_type: 'marketing',
    status: 'scheduled',
    template_id: 'tpl-3',
    audience: { type: 'list', list_id: '40000000-0000-0000-0004-000000000001' },
    subject: '🌸 Venta de primavera: hasta 30% de descuento',
    preheader: 'Descuentos exclusivos para suscriptores.',
    from_name: 'Spanish Market',
    from_email: 'hola@mail.spanishbrand.es',
    reply_to: null,
    language: 'es',
    scheduled_at: '2026-04-25T10:00:00Z',
    sent_at: null,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-04-15T10:00:00Z',
    updated_at: '2026-04-15T10:00:00Z',
    recipient_count: 1400,
  },
]

// ─── Campaign Runs ────────────────────────────────────────────────────────────

export const MOCK_CAMPAIGN_RUNS: CampaignRun[] = [
  {
    id: 'run-1', campaign_id: 'camp-1',
    status: 'completed',
    recipient_count: 3210, suppressed_count: 142,
    started_at: '2026-01-15T09:02:00Z',
    completed_at: '2026-01-15T09:18:00Z',
    error_message: null, provider_batch_id: 'batch_nl_jan_001',
    created_at: '2026-01-15T09:02:00Z',
  },
  {
    id: 'run-2', campaign_id: 'camp-2',
    status: 'completed',
    recipient_count: 1850, suppressed_count: 89,
    started_at: '2026-02-22T10:03:00Z',
    completed_at: '2026-02-22T10:15:00Z',
    error_message: null, provider_batch_id: 'batch_nl_spring_001',
    created_at: '2026-02-22T10:03:00Z',
  },
  {
    id: 'run-3', campaign_id: 'camp-3',
    status: 'completed',
    recipient_count: 312, suppressed_count: 18,
    started_at: '2026-03-05T09:01:00Z',
    completed_at: '2026-03-05T09:05:00Z',
    error_message: null, provider_batch_id: 'batch_nl_winback_001',
    created_at: '2026-03-05T09:01:00Z',
  },
  {
    id: 'run-4', campaign_id: 'camp-4',
    status: 'completed',
    recipient_count: 2100, suppressed_count: 110,
    started_at: '2026-02-10T09:04:00Z',
    completed_at: '2026-02-10T09:20:00Z',
    error_message: null, provider_batch_id: 'batch_fr_feb_001',
    created_at: '2026-02-10T09:04:00Z',
  },
  {
    id: 'run-5', campaign_id: 'camp-5',
    status: 'completed',
    recipient_count: 1980, suppressed_count: 95,
    started_at: '2026-03-10T08:02:00Z',
    completed_at: '2026-03-10T08:16:00Z',
    error_message: null, provider_batch_id: 'batch_de_mar_001',
    created_at: '2026-03-10T08:02:00Z',
  },
]

// ─── Campaign Metrics ─────────────────────────────────────────────────────────

function buildMetrics(
  sent: number,
  openRate: number,
  clickRate: number,
  bounceRate: number,
  unsubRate: number,
  complaintRate: number,
): CampaignMetrics {
  const delivered = Math.round(sent * (1 - bounceRate))
  const uniqueOpens = Math.round(delivered * openRate)
  const totalOpens = Math.round(uniqueOpens * 1.6)
  const uniqueClicks = Math.round(delivered * clickRate)
  const totalClicks = Math.round(uniqueClicks * 2.1)
  const bouncesHard = Math.round(sent * bounceRate * 0.4)
  const bouncesSoft = Math.round(sent * bounceRate * 0.6)
  const unsubscribes = Math.round(delivered * unsubRate)
  const complaints = Math.round(delivered * complaintRate)
  const suppressed = Math.round(sent * 0.04)

  return {
    sent,
    delivered,
    delivery_rate: delivered / sent,
    unique_opens: uniqueOpens,
    total_opens: totalOpens,
    open_rate: uniqueOpens / delivered,
    unique_clicks: uniqueClicks,
    total_clicks: totalClicks,
    click_rate: uniqueClicks / delivered,
    ctor: uniqueOpens > 0 ? uniqueClicks / uniqueOpens : 0,
    bounces_hard: bouncesHard,
    bounces_soft: bouncesSoft,
    bounce_rate: (bouncesHard + bouncesSoft) / sent,
    unsubscribes,
    unsubscribe_rate: unsubscribes / delivered,
    complaints,
    complaint_rate: complaints / delivered,
    suppressed,
  }
}

export const MOCK_CAMPAIGN_METRICS: Record<string, CampaignMetrics> = {
  'run-1': buildMetrics(3068, 0.284, 0.071, 0.021, 0.004, 0.0008),  // NL Jan newsletter
  'run-2': buildMetrics(1761, 0.312, 0.082, 0.018, 0.005, 0.0006),  // NL Spring sale
  'run-3': buildMetrics(294, 0.198, 0.041, 0.024, 0.007, 0.0010),   // NL Winback
  'run-4': buildMetrics(1990, 0.268, 0.063, 0.022, 0.003, 0.0007),  // FR Feb newsletter
  'run-5': buildMetrics(1885, 0.221, 0.055, 0.025, 0.004, 0.0009),  // DE Mar newsletter
}

// Time-series data for charts (hourly opens/clicks over first 48h after send)
export function getMockTimeSeries(runId: string): TimeSeriesPoint[] {
  const metrics = MOCK_CAMPAIGN_METRICS[runId]
  if (!metrics) return []

  const opens = metrics.unique_opens
  const clicks = metrics.unique_clicks

  // Distribution: 60% in first 6h, tapering off
  const distribution = [0.15, 0.18, 0.12, 0.08, 0.05, 0.03, 0.04, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
  const points: TimeSeriesPoint[] = []

  for (let i = 0; i < 24; i++) {
    const frac = distribution[i] ?? 0.005
    points.push({
      date: `Hour ${i + 1}`,
      opens: Math.round(opens * frac),
      clicks: Math.round(clicks * frac),
      unsubscribes: i < 8 ? Math.round(metrics.unsubscribes * (frac * 1.5)) : 0,
      bounces: i === 0 ? metrics.bounces_hard : i < 4 ? Math.round(metrics.bounces_soft * 0.25) : 0,
    })
  }

  return points
}

// ─── Suppressions ─────────────────────────────────────────────────────────────

export const MOCK_SUPPRESSIONS: Suppression[] = [
  { id: 'sup-1', email_normalized: 'bounced.user@example.nl',     scope: 'global',  project_id: null, list_id: null, reason: 'hard_bounce',  notes: 'Permanent delivery failure', source_event_id: null, added_at: '2026-01-15T09:18:00Z' },
  { id: 'sup-2', email_normalized: 'complaint@example.fr',        scope: 'global',  project_id: null, list_id: null, reason: 'complaint',     notes: 'Spam report via Outlook',    source_event_id: null, added_at: '2026-02-10T09:45:00Z' },
  { id: 'sup-3', email_normalized: 'spam.reporter@gmail.com',     scope: 'global',  project_id: null, list_id: null, reason: 'complaint',     notes: 'Spam report via Gmail FBL',  source_event_id: null, added_at: '2026-02-22T11:30:00Z' },
  { id: 'sup-4', email_normalized: 'hard.bounce@company.de',      scope: 'global',  project_id: null, list_id: null, reason: 'hard_bounce',   notes: 'Mailbox does not exist',     source_event_id: null, added_at: '2026-03-10T08:30:00Z' },
  { id: 'sup-5', email_normalized: 'invalid@nonexistent.xyz',     scope: 'global',  project_id: null, list_id: null, reason: 'invalid_email', notes: 'Domain does not exist',      source_event_id: null, added_at: '2026-01-20T10:00:00Z' },
  { id: 'sup-6', email_normalized: 'deleted.user@orange.fr',      scope: 'project', project_id: '10000000-0000-0000-0000-000000000002', list_id: null, reason: 'manual', notes: 'Manually suppressed by marketing team', source_event_id: null, added_at: '2026-03-01T10:00:00Z' },
  { id: 'sup-7', email_normalized: 'old.customer@xs4all.nl',      scope: 'project', project_id: '10000000-0000-0000-0000-000000000001', list_id: null, reason: 'gdpr_erasure', notes: 'Art. 17 erasure request processed', source_event_id: null, added_at: '2026-03-15T14:00:00Z' },
  { id: 'sup-8', email_normalized: 'abuse@spammer.example',       scope: 'global',  project_id: null, list_id: null, reason: 'role_address', notes: 'Abuse role address — auto-suppressed', source_event_id: null, added_at: '2026-01-01T00:00:00Z' },
  { id: 'sup-9', email_normalized: 'noreply@automations.com',     scope: 'global',  project_id: null, list_id: null, reason: 'role_address', notes: 'No-reply address — auto-suppressed', source_event_id: null, added_at: '2026-01-01T00:00:00Z' },
  { id: 'sup-10', email_normalized: 'bounced.2@example.es',       scope: 'global',  project_id: null, list_id: null, reason: 'hard_bounce',  notes: 'User account suspended',    source_event_id: null, added_at: '2026-03-10T09:00:00Z' },
]

// ─── Bounce events ────────────────────────────────────────────────────────────

export const MOCK_BOUNCES: BounceEvent[] = [
  { id: 'bnc-1', email: 'bounced.user@example.nl',  campaign_run_id: 'run-1', bounce_type: 'hard', bounce_subtype: 'mailbox_not_found', bounce_reason: 'The email account does not exist', occurred_at: '2026-01-15T09:05:00Z' },
  { id: 'bnc-2', email: 'hard.bounce@company.de',   campaign_run_id: 'run-5', bounce_type: 'hard', bounce_subtype: 'domain_not_found',  bounce_reason: 'Domain does not exist',            occurred_at: '2026-03-10T08:10:00Z' },
  { id: 'bnc-3', email: 'temp.error@example.fr',    campaign_run_id: 'run-4', bounce_type: 'soft', bounce_subtype: 'mailbox_full',      bounce_reason: 'Mailbox is full',                  occurred_at: '2026-02-10T09:12:00Z' },
  { id: 'bnc-4', email: 'bounced.2@example.es',     campaign_run_id: 'run-5', bounce_type: 'hard', bounce_subtype: 'account_suspended', bounce_reason: 'User account suspended',            occurred_at: '2026-03-10T08:08:00Z' },
  { id: 'bnc-5', email: 'away@example.nl',          campaign_run_id: 'run-2', bounce_type: 'soft', bounce_subtype: 'auto_reply',        bounce_reason: 'Out of office reply received',      occurred_at: '2026-02-22T10:30:00Z' },
]

// ─── Complaint events ─────────────────────────────────────────────────────────

export const MOCK_COMPLAINTS: ComplaintEvent[] = [
  { id: 'cmp-1', email: 'complaint@example.fr',     campaign_run_id: 'run-4', complaint_type: 'abuse', occurred_at: '2026-02-10T09:45:00Z' },
  { id: 'cmp-2', email: 'spam.reporter@gmail.com',  campaign_run_id: 'run-2', complaint_type: 'abuse', occurred_at: '2026-02-22T11:30:00Z' },
]

// ─── Account-level summary ────────────────────────────────────────────────────

export const MOCK_ACCOUNT_METRICS = {
  campaigns_sent: 5,
  total_recipients: 11068,
  total_delivered: 10562,
  avg_open_rate: 0.268,
  avg_click_rate: 0.067,
  avg_bounce_rate: 0.022,
  avg_unsubscribe_rate: 0.0044,
  total_suppressions: MOCK_SUPPRESSIONS.length,
  suppressions_by_reason: [
    { reason: 'hard_bounce', count: 4 },
    { reason: 'complaint', count: 2 },
    { reason: 'role_address', count: 2 },
    { reason: 'gdpr_erasure', count: 1 },
    { reason: 'manual', count: 1 },
  ],
  by_project: [
    { project: 'Dutch Market', sent: 5532, open_rate: 0.275, click_rate: 0.069, unsubscribe_rate: 0.0050 },
    { project: 'France', sent: 1990, open_rate: 0.268, click_rate: 0.063, unsubscribe_rate: 0.0030 },
    { project: 'Germany', sent: 1885, open_rate: 0.221, click_rate: 0.055, unsubscribe_rate: 0.0040 },
  ],
  monthly_sends: [
    { month: '2026-01', campaigns: 1, sent: 3068, opens: 0, opens_rate: 0.284 },
    { month: '2026-02', campaigns: 2, sent: 3751, opens: 0, opens_rate: 0.292 },
    { month: '2026-03', campaigns: 2, sent: 2179, opens: 0, opens_rate: 0.218 },
  ],
}
