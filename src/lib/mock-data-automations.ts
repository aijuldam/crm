import type {
  AutomationWorkflow, WorkflowStep, WorkflowEnrollment, WorkflowStepLog,
  WorkflowAnalytics, ContactEvent,
} from './types/automations'

// ─── Helper ───────────────────────────────────────────────────────────────────

function step(
  id: string,
  workflow_id: string,
  type: WorkflowStep['type'],
  name: string,
  config: WorkflowStep['config'],
  order_index: number,
  next?: string | null,
  branch_yes?: string | null,
  branch_no?: string | null,
): WorkflowStep {
  return {
    id, workflow_id, type, name, config,
    position_x: 0, position_y: order_index * 160,
    next_step_id: next ?? null,
    branch_yes_step_id: branch_yes ?? null,
    branch_no_step_id: branch_no ?? null,
    order_index,
    created_at: '2026-03-01T10:00:00Z',
  }
}

// ─── Workflow 1: Welcome Series ────────────────────────────────────────────────

const WF1 = 'wf-1'
const welcomeSteps: WorkflowStep[] = [
  step(`${WF1}-s1`, WF1, 'trigger',    'Form submitted',        { event_type: 'form_submitted', filters: {} },                                          0, `${WF1}-s2`),
  step(`${WF1}-s2`, WF1, 'send_email', 'Welcome email',         { subject: 'Welcome to {{project_name}} 👋', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 1, `${WF1}-s3`),
  step(`${WF1}-s3`, WF1, 'delay',      'Wait 1 day',            { value: 1, unit: 'days' },                                                              2, `${WF1}-s4`),
  step(`${WF1}-s4`, WF1, 'send_email', 'Onboarding tips',       { subject: 'Here are 3 tips to get started', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 3, `${WF1}-s5`),
  step(`${WF1}-s5`, WF1, 'delay',      'Wait 3 days',           { value: 3, unit: 'days' },                                                              4, `${WF1}-s6`),
  step(`${WF1}-s6`, WF1, 'send_email', 'Getting started guide', { subject: 'Your free guide is ready, {{first_name}}', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 5, `${WF1}-s7`),
  step(`${WF1}-s7`, WF1, 'add_to_list','Add to Onboarded list', { list_id: '40000000-0000-0000-0001-000000000001', list_name: 'NL Newsletter' },          6, `${WF1}-s8`),
  step(`${WF1}-s8`, WF1, 'exit',       'Exit',                  {},                                                                                       7),
]

// ─── Workflow 2: Content Delivery Trigger ─────────────────────────────────────

const WF2 = 'wf-2'
const contentSteps: WorkflowStep[] = [
  step(`${WF2}-s1`, WF2, 'trigger',        'Guide downloaded',       { event_type: 'guide_downloaded' },                                                       0, `${WF2}-s2`),
  step(`${WF2}-s2`, WF2, 'delay',          'Wait 30 minutes',        { value: 30, unit: 'minutes' },                                                            1, `${WF2}-s3`),
  step(`${WF2}-s3`, WF2, 'send_email',     'Related content email',  { subject: 'More resources you might like', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 2, `${WF2}-s4`),
  step(`${WF2}-s4`, WF2, 'wait_for_event', 'Wait for another download', { event_type: 'guide_downloaded', timeout_days: 7, timeout_action: 'branch' },         3, null, `${WF2}-s5`, `${WF2}-s6`),
  step(`${WF2}-s5`, WF2, 'add_to_list',   'Add to Engaged Readers',  { list_id: '40000000-0000-0000-0001-000000000002', list_name: 'NL Spring Sale' },          4, `${WF2}-s7`),
  step(`${WF2}-s6`, WF2, 'send_email',    'Follow-up nudge',         { subject: 'Did you find what you were looking for?', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 4, `${WF2}-s7`),
  step(`${WF2}-s7`, WF2, 'exit',          'Exit',                    {},                                                                                        5),
]

// ─── Workflow 3: Quiz Follow-up Nurture ───────────────────────────────────────

const WF3 = 'wf-3'
const nurtureSteps: WorkflowStep[] = [
  step(`${WF3}-s1`, WF3, 'trigger',    'Quiz completed',         { event_type: 'quiz_completed' },                                                                            0, `${WF3}-s2`),
  step(`${WF3}-s2`, WF3, 'send_email', 'Quiz results email',     { subject: 'Your quiz results are in!', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 1, `${WF3}-s3`),
  step(`${WF3}-s3`, WF3, 'delay',      'Wait 2 days',            { value: 2, unit: 'days' },                                                                                 2, `${WF3}-s4`),
  step(`${WF3}-s4`, WF3, 'branch',     'High score?',            { conditions: [{ field: 'custom_field', operator: 'gt', value: '80' }], logic: 'and', yes_label: 'Score ≥ 80', no_label: 'Score < 80' }, 3, null, `${WF3}-s5`, `${WF3}-s6`),
  step(`${WF3}-s5`, WF3, 'send_email', 'Advanced nurture email', { subject: 'You scored high — here is what to do next', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 4, `${WF3}-s7`),
  step(`${WF3}-s6`, WF3, 'send_email', 'Beginner nurture email', { subject: 'Let us help you improve your score', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 4, `${WF3}-s7`),
  step(`${WF3}-s7`, WF3, 'delay',      'Wait 4 days',            { value: 4, unit: 'days' },                                                                                 5, `${WF3}-s8`),
  step(`${WF3}-s8`, WF3, 'send_email', 'Final nurture email',    { subject: 'One last resource for you, {{first_name}}', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 6, `${WF3}-s9`),
  step(`${WF3}-s9`, WF3, 'exit',       'Exit',                   {},                                                                                                          7),
]

// ─── Workflow 4: Re-engagement ────────────────────────────────────────────────

const WF4 = 'wf-4'
const reengageSteps: WorkflowStep[] = [
  step(`${WF4}-s1`, WF4, 'trigger',        'Contact inactive 30d',    { event_type: 'contact_inactive', filters: { inactive_days: '30' } },                            0, `${WF4}-s2`),
  step(`${WF4}-s2`, WF4, 'send_email',     'We miss you email',       { subject: 'We miss you, {{first_name}} 👋', from_name: 'Dutch Market', from_email: 'hello@mail.dutchbrand.nl', email_type: 'marketing' }, 1, `${WF4}-s3`),
  step(`${WF4}-s3`, WF4, 'wait_for_event', 'Wait for open/click',     { event_type: 'email_opened', timeout_days: 7, timeout_action: 'branch' },                       2, null, `${WF4}-s4`, `${WF4}-s5`),
  step(`${WF4}-s4`, WF4, 'add_to_list',   'Add to Re-engaged list',   { list_id: '40000000-0000-0000-0001-000000000001', list_name: 'NL Newsletter' },                  3, `${WF4}-s6`),
  step(`${WF4}-s5`, WF4, 'remove_from_list','Remove from main list',  { list_id: '40000000-0000-0000-0001-000000000002', list_name: 'NL Spring Sale' },                 3, `${WF4}-s6`),
  step(`${WF4}-s6`, WF4, 'exit',           'Exit',                    {},                                                                                                 4),
]

// ─── Workflows ─────────────────────────────────────────────────────────────────

export const MOCK_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: WF1,
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'Welcome Series',
    description: 'Onboards new contacts who submitted a signup form with a 3-email sequence over 4 days.',
    category: 'welcome',
    status: 'active',
    trigger_config: { event_type: 'form_submitted' },
    re_entry: 'none',
    re_entry_delay_days: 0,
    frequency_cap_per_day: 1,
    goal_event_type: 'purchase_completed',
    goal_conditions: null,
    exclusion_list_id: null,
    stop_on_unsubscribe: true,
    stop_on_conversion: true,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-01-10T14:30:00Z',
    steps: welcomeSteps,
    enrollment_count: 847,
    completion_rate: 0.68,
    goal_completion_rate: 0.12,
  },
  {
    id: WF2,
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'Content Delivery — Guide Download',
    description: 'Automatically sends related content 30 minutes after a guide is downloaded and tracks further engagement.',
    category: 'content_delivery',
    status: 'active',
    trigger_config: { event_type: 'guide_downloaded' },
    re_entry: 'always',
    re_entry_delay_days: 0,
    frequency_cap_per_day: 1,
    goal_event_type: 'guide_downloaded',
    goal_conditions: null,
    exclusion_list_id: null,
    stop_on_unsubscribe: true,
    stop_on_conversion: false,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
    steps: contentSteps,
    enrollment_count: 312,
    completion_rate: 0.82,
    goal_completion_rate: 0.31,
  },
  {
    id: WF3,
    project_id: '10000000-0000-0000-0000-000000000002',
    name: 'Quiz Follow-up Nurture',
    description: 'Delivers personalised follow-up content based on quiz score with a branching sequence over 6 days.',
    category: 'nurture',
    status: 'active',
    trigger_config: { event_type: 'quiz_completed' },
    re_entry: 'none',
    re_entry_delay_days: 0,
    frequency_cap_per_day: 1,
    goal_event_type: 'purchase_completed',
    goal_conditions: null,
    exclusion_list_id: null,
    stop_on_unsubscribe: true,
    stop_on_conversion: true,
    created_by: '00000000-0000-0000-0000-000000000003',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-15T12:00:00Z',
    steps: nurtureSteps,
    enrollment_count: 198,
    completion_rate: 0.74,
    goal_completion_rate: 0.09,
  },
  {
    id: WF4,
    project_id: '10000000-0000-0000-0000-000000000001',
    name: 'Re-engagement (30-day Inactive)',
    description: 'Sends a re-engagement email to contacts inactive for 30+ days and segments responders vs non-responders.',
    category: 'reengagement',
    status: 'paused',
    trigger_config: { event_type: 'contact_inactive', filters: { inactive_days: '30' } },
    re_entry: 'after_exit',
    re_entry_delay_days: 60,
    frequency_cap_per_day: null,
    goal_event_type: 'email_opened',
    goal_conditions: null,
    exclusion_list_id: null,
    stop_on_unsubscribe: true,
    stop_on_conversion: true,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-20T08:00:00Z',
    steps: reengageSteps,
    enrollment_count: 423,
    completion_rate: 0.55,
    goal_completion_rate: 0.22,
  },
]

// ─── Sample enrollments ────────────────────────────────────────────────────────

export const MOCK_ENROLLMENTS: WorkflowEnrollment[] = [
  { id: 'enr-1', workflow_id: WF1, contact_id: '20000000-0000-0000-0000-000000000001', status: 'completed', enrolled_at: '2026-01-15T10:00:00Z', current_step_id: null, completed_at: '2026-01-19T14:00:00Z', exit_reason: null, goal_completed_at: null },
  { id: 'enr-2', workflow_id: WF1, contact_id: '20000000-0000-0000-0000-000000000002', status: 'active',    enrolled_at: '2026-04-18T09:00:00Z', current_step_id: `${WF1}-s4`, completed_at: null,                exit_reason: null, goal_completed_at: null },
  { id: 'enr-3', workflow_id: WF1, contact_id: '20000000-0000-0000-0000-000000000003', status: 'exited',    enrolled_at: '2026-02-10T08:00:00Z', current_step_id: null, completed_at: '2026-02-11T10:00:00Z', exit_reason: 'unsubscribed', goal_completed_at: null },
  { id: 'enr-4', workflow_id: WF2, contact_id: '20000000-0000-0000-0000-000000000004', status: 'completed', enrolled_at: '2026-03-05T11:00:00Z', current_step_id: null, completed_at: '2026-03-12T14:00:00Z', exit_reason: null, goal_completed_at: '2026-03-07T09:00:00Z' },
  { id: 'enr-5', workflow_id: WF3, contact_id: '20000000-0000-0000-0000-000000000005', status: 'active',    enrolled_at: '2026-04-17T13:00:00Z', current_step_id: `${WF3}-s7`, completed_at: null, exit_reason: null, goal_completed_at: null },
  { id: 'enr-6', workflow_id: WF4, contact_id: '20000000-0000-0000-0000-000000000006', status: 'completed', enrolled_at: '2026-03-15T09:00:00Z', current_step_id: null, completed_at: '2026-03-22T10:00:00Z', exit_reason: null, goal_completed_at: '2026-03-16T11:00:00Z' },
]

// ─── Step logs ────────────────────────────────────────────────────────────────

export const MOCK_STEP_LOGS: WorkflowStepLog[] = [
  { id: 'log-1', enrollment_id: 'enr-1', step_id: `${WF1}-s1`, executed_at: '2026-01-15T10:00:00Z', result: 'success', output: {} },
  { id: 'log-2', enrollment_id: 'enr-1', step_id: `${WF1}-s2`, executed_at: '2026-01-15T10:01:00Z', result: 'success', output: { email_sent: true } },
  { id: 'log-3', enrollment_id: 'enr-1', step_id: `${WF1}-s3`, executed_at: '2026-01-15T10:01:00Z', result: 'pending', output: { resume_at: '2026-01-16T10:01:00Z' } },
  { id: 'log-4', enrollment_id: 'enr-1', step_id: `${WF1}-s4`, executed_at: '2026-01-16T10:01:00Z', result: 'success', output: { email_sent: true } },
  { id: 'log-5', enrollment_id: 'enr-4', step_id: `${WF2}-s1`, executed_at: '2026-03-05T11:00:00Z', result: 'success', output: {} },
  { id: 'log-6', enrollment_id: 'enr-4', step_id: `${WF2}-s4`, executed_at: '2026-03-05T11:31:00Z', result: 'branched_yes', output: { event_received: true } },
]

// ─── Sample events ────────────────────────────────────────────────────────────

function ev(
  id: string,
  project_id: string,
  contact_id: string | null,
  email: string | null,
  event_type: ContactEvent['event_type'],
  source: ContactEvent['source'],
  properties: Record<string, unknown>,
  occurred_at: string,
): ContactEvent {
  return {
    id,
    project_id,
    contact_id,
    email,
    event_type,
    source,
    properties,
    session_id: `sess-${id}`,
    idempotency_key: null,
    occurred_at,
    ingested_at: occurred_at,
  }
}

const P1 = '10000000-0000-0000-0000-000000000001'
const P2 = '10000000-0000-0000-0000-000000000002'
const C1 = '20000000-0000-0000-0000-000000000001'
const C2 = '20000000-0000-0000-0000-000000000002'
const C3 = '20000000-0000-0000-0000-000000000003'
const C4 = '20000000-0000-0000-0000-000000000004'
const C5 = '20000000-0000-0000-0000-000000000005'

export const MOCK_EVENTS: ContactEvent[] = [
  ev('evt-01', P1, C1, null, 'form_submitted',     'sdk',      { form_id: 'form-1', form_name: 'Newsletter signup' },                  '2026-01-15T09:58:00Z'),
  ev('evt-02', P1, C2, null, 'form_submitted',     'sdk',      { form_id: 'form-1', form_name: 'Newsletter signup' },                  '2026-04-18T08:55:00Z'),
  ev('evt-03', P1, C3, null, 'form_submitted',     'sdk',      { form_id: 'form-2', form_name: 'Contact form' },                        '2026-02-10T07:50:00Z'),
  ev('evt-04', P1, C4, null, 'guide_downloaded',   'api',      { guide_id: 'guide-1', guide_name: 'B2B Email Guide 2026', url: '/guides/b2b-email' }, '2026-03-05T10:55:00Z'),
  ev('evt-05', P2, C5, null, 'quiz_completed',     'sdk',      { quiz_id: 'quiz-1', score: 92, answers: 10 },                           '2026-04-17T12:58:00Z'),
  ev('evt-06', P1, C1, null, 'page_viewed',        'sdk',      { url: '/pricing', title: 'Pricing', duration_ms: 42000 },               '2026-01-15T09:30:00Z'),
  ev('evt-07', P1, C2, null, 'page_viewed',        'sdk',      { url: '/features', title: 'Features', duration_ms: 18000 },             '2026-04-18T08:40:00Z'),
  ev('evt-08', P1, null, 'anonymous@example.com', 'form_started',    'sdk', { form_id: 'form-1' },                                      '2026-04-19T11:00:00Z'),
  ev('evt-09', P1, null, 'anonymous@example.com', 'form_abandoned',  'sdk', { form_id: 'form-1', last_field: 'phone' },                  '2026-04-19T11:03:00Z'),
  ev('evt-10', P1, C1, null, 'email_opened',       'internal', { campaign_id: 'camp-1', subject: 'Jouw januari update' },               '2026-01-15T11:00:00Z'),
  ev('evt-11', P1, C4, null, 'guide_downloaded',   'api',      { guide_id: 'guide-2', guide_name: 'GDPR Checklist', url: '/guides/gdpr'}, '2026-03-07T09:00:00Z'),
  ev('evt-12', P1, C4, null, 'purchase_completed', 'webhook',  { order_id: 'ord-001', amount: 129.00, currency: 'EUR' },                '2026-03-07T09:15:00Z'),
  ev('evt-13', P2, C5, null, 'page_viewed',        'sdk',      { url: '/quiz', title: 'Take the quiz', duration_ms: 5000 },             '2026-04-17T12:50:00Z'),
  ev('evt-14', P1, C2, null, 'link_clicked',       'internal', { campaign_id: 'camp-2', url: 'https://dutchbrand.nl/sale' },            '2026-04-18T10:00:00Z'),
  ev('evt-15', P1, C3, null, 'contact_inactive',   'internal', { inactive_days: 30 },                                                   '2026-03-15T00:00:00Z'),
  ev('evt-16', P1, null, 'newuser@example.nl', 'form_submitted', 'sdk', { form_id: 'form-1' },                                          '2026-04-20T07:30:00Z'),
  ev('evt-17', P1, C1, null, 'guide_downloaded',   'api',      { guide_id: 'guide-3', guide_name: 'Email Marketing 101' },              '2026-04-20T08:00:00Z'),
  ev('evt-18', P2, C5, null, 'quiz_completed',     'sdk',      { quiz_id: 'quiz-2', score: 65, answers: 10 },                           '2026-04-19T15:00:00Z'),
  ev('evt-19', P1, C2, null, 'purchase_completed', 'webhook',  { order_id: 'ord-002', amount: 49.00, currency: 'EUR' },                 '2026-04-18T14:00:00Z'),
  ev('evt-20', P1, C4, null, 'email_opened',       'internal', { campaign_id: 'camp-4', subject: 'Votre mise à jour' },                 '2026-02-10T11:00:00Z'),
]

// ─── Analytics per workflow ───────────────────────────────────────────────────

function enrollmentByDay(start: string, count: number, completedFrac: number): WorkflowAnalytics['enrollment_by_day'] {
  const days = []
  const d = new Date(start)
  for (let i = 0; i < 14; i++) {
    const n = Math.round((count / 14) * (1 + Math.sin(i * 0.7) * 0.3))
    days.push({
      date: new Date(d.getTime() + i * 86400000).toISOString().slice(0, 10),
      enrolled: n,
      completed: Math.round(n * completedFrac),
    })
  }
  return days
}

export const MOCK_WORKFLOW_ANALYTICS: Record<string, WorkflowAnalytics> = {
  [WF1]: {
    total_enrolled: 847,
    active_count: 112,
    completed_count: 576,
    exited_count: 143,
    failed_count: 16,
    completion_rate: 0.68,
    goal_completion_rate: 0.12,
    avg_completion_days: 4.2,
    step_stats: welcomeSteps.map((s, i) => ({
      step_id: s.id, step_name: s.name, step_type: s.type,
      executions: Math.round(847 * Math.pow(0.93, i)),
      successes: Math.round(847 * Math.pow(0.93, i) * 0.96),
      failures: Math.round(847 * Math.pow(0.93, i) * 0.02),
      skipped: Math.round(847 * Math.pow(0.93, i) * 0.02),
      success_rate_pct: 96 - i * 0.5,
    })),
    email_performance: welcomeSteps.filter(s => s.type === 'send_email').map((s, i) => ({
      step_id: s.id, step_name: s.name,
      sent: Math.round(847 * Math.pow(0.93, i * 2)),
      open_rate: 0.45 - i * 0.08,
      click_rate: 0.12 - i * 0.02,
      unsubscribe_rate: 0.003 + i * 0.001,
    })),
    enrollment_by_day: enrollmentByDay('2026-01-05', 847, 0.68),
    exit_reasons: [
      { reason: 'unsubscribed', count: 89 },
      { reason: 'goal_completed', count: 38 },
      { reason: 'manual', count: 16 },
    ],
  },
  [WF2]: {
    total_enrolled: 312,
    active_count: 28,
    completed_count: 256,
    exited_count: 24,
    failed_count: 4,
    completion_rate: 0.82,
    goal_completion_rate: 0.31,
    avg_completion_days: 7.8,
    step_stats: contentSteps.map((s, i) => ({
      step_id: s.id, step_name: s.name, step_type: s.type,
      executions: Math.round(312 * Math.pow(0.95, i)),
      successes: Math.round(312 * Math.pow(0.95, i) * 0.97),
      failures: Math.round(312 * Math.pow(0.95, i) * 0.01),
      skipped: Math.round(312 * Math.pow(0.95, i) * 0.02),
      success_rate_pct: 97 - i * 0.3,
    })),
    email_performance: contentSteps.filter(s => s.type === 'send_email').map((s, i) => ({
      step_id: s.id, step_name: s.name,
      sent: Math.round(312 * Math.pow(0.95, i)),
      open_rate: 0.52 - i * 0.06,
      click_rate: 0.18 - i * 0.03,
      unsubscribe_rate: 0.002 + i * 0.001,
    })),
    enrollment_by_day: enrollmentByDay('2026-01-20', 312, 0.82),
    exit_reasons: [
      { reason: 'unsubscribed', count: 14 },
      { reason: 'goal_completed', count: 10 },
    ],
  },
  [WF3]: {
    total_enrolled: 198,
    active_count: 42,
    completed_count: 146,
    exited_count: 8,
    failed_count: 2,
    completion_rate: 0.74,
    goal_completion_rate: 0.09,
    avg_completion_days: 6.4,
    step_stats: nurtureSteps.map((s, i) => ({
      step_id: s.id, step_name: s.name, step_type: s.type,
      executions: Math.round(198 * Math.pow(0.94, i)),
      successes: Math.round(198 * Math.pow(0.94, i) * 0.97),
      failures: Math.round(198 * Math.pow(0.94, i) * 0.01),
      skipped: Math.round(198 * Math.pow(0.94, i) * 0.02),
      success_rate_pct: 97 - i * 0.4,
    })),
    email_performance: nurtureSteps.filter(s => s.type === 'send_email').map((s, i) => ({
      step_id: s.id, step_name: s.name,
      sent: Math.round(198 * Math.pow(0.94, i)),
      open_rate: 0.58 - i * 0.07,
      click_rate: 0.21 - i * 0.03,
      unsubscribe_rate: 0.002,
    })),
    enrollment_by_day: enrollmentByDay('2026-02-10', 198, 0.74),
    exit_reasons: [
      { reason: 'unsubscribed', count: 6 },
      { reason: 'manual', count: 2 },
    ],
  },
  [WF4]: {
    total_enrolled: 423,
    active_count: 0,
    completed_count: 233,
    exited_count: 179,
    failed_count: 11,
    completion_rate: 0.55,
    goal_completion_rate: 0.22,
    avg_completion_days: 7.0,
    step_stats: reengageSteps.map((s, i) => ({
      step_id: s.id, step_name: s.name, step_type: s.type,
      executions: Math.round(423 * Math.pow(0.88, i)),
      successes: Math.round(423 * Math.pow(0.88, i) * 0.94),
      failures: Math.round(423 * Math.pow(0.88, i) * 0.03),
      skipped: Math.round(423 * Math.pow(0.88, i) * 0.03),
      success_rate_pct: 94 - i * 1.2,
    })),
    email_performance: reengageSteps.filter(s => s.type === 'send_email').map((s, i) => ({
      step_id: s.id, step_name: s.name,
      sent: Math.round(423 * Math.pow(0.88, i)),
      open_rate: 0.22 - i * 0.04,
      click_rate: 0.06 - i * 0.01,
      unsubscribe_rate: 0.008,
    })),
    enrollment_by_day: enrollmentByDay('2026-03-01', 423, 0.55),
    exit_reasons: [
      { reason: 'unsubscribed', count: 134 },
      { reason: 'timeout', count: 45 },
    ],
  },
}
