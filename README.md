# Internal CRM Platform

A modular, multi-project CRM built with Next.js 16, TypeScript, Tailwind CSS, and Supabase. Designed for European B2C/B2B operations with GDPR-first contact management, full email campaign tooling, and event-driven automation.

Works fully in **mock mode** (no Supabase credentials required). Wire up Supabase for production persistence.

---

## Phased architecture

### Phase 1 — CRM foundation

**Goal:** Multi-project contact and company management with GDPR consent tracking.

**Schema** (`001_initial_schema.sql`): `projects`, `contacts` (with `email_normalized` UNIQUE dedup key), `companies`, `contact_projects`, `lists`, `contact_lists`, `segments`, `consents`, `forms`, `submissions`, `activities`, `tasks`, `deals`, `crm_users`, `memberships`.

**Key design decisions:**
- `email_normalized` (lowercase + trimmed) enforced at DB level as the universal deduplication key
- Consent records store country, language, legal basis, and privacy notice version **at event time** — never derived from the current contact profile
- `withdrawn_at` is stamped on opt-out but the row is never deleted (GDPR audit trail)
- Row Level Security enabled on all tables; service role key used server-side only
- European contact model: residency country, preferred language, timezone, currency, market, lifecycle stage

**Pages:** Dashboard · Contacts · Companies · Projects · Lists · Segments · Forms · Compliance

**API routes:** `/api/contacts` · `/api/contacts/[id]` · `/api/contacts/import` (CSV batch upsert) · `/api/companies` · `/api/projects` · `/api/lists` · `/api/segments` · `/api/forms` · `/api/consents` · `/api/dashboard`

---

### Phase 2 — Campaign management

**Goal:** Full email campaign lifecycle — templates, one-off sends, suppression, and deliverability monitoring.

**Schema** (`002_campaigns.sql`): `email_templates` (block-based + HTML override + language variants), `campaigns`, `campaign_runs`, `email_events` (append-only, deduplicated via `provider_event_id`), `suppression_list` (global/project/list scope), `bounce_events`, `complaint_events`, `campaign_run_metrics` (materialised).

**Key design decisions:**
- Block-based email editor: typed block system (header, text, button, image, divider, spacer, footer, columns) stored as JSONB
- `compute_run_metrics(run_id)` Postgres function — materialised metrics avoid COUNT(*) on `email_events` at query time
- Auto-suppression via DB triggers on hard bounce and complaint insert
- GDPR-safe send eligibility pipeline (see `src/lib/email-eligibility.ts`): hard bounce → complaint → global suppression → project suppression → marketing consent check
- Marketing vs operational email separation — operational bypasses consent check
- `provider_event_id` UNIQUE constraint deduplicates webhook event deliveries

**Pages:** Campaigns · Campaign builder (5-step wizard) · Campaign detail · Templates · Template editor · Suppression center · Deliverability · Reports

**API routes:** `/api/campaigns` · `/api/campaigns/[id]` · `/api/campaigns/[id]/send` · `/api/templates` · `/api/templates/[id]` · `/api/suppression` · `/api/email-events` · `/api/sync` · `/api/reports`

---

### Phase 3 — Automations & event engine

**Goal:** Event-driven workflow automation, nurture sequences, and trigger-based email sending.

**Schema** (`003_automations.sql`):
- `events` — append-only contact event log (`idempotency_key` UNIQUE for client-side dedup)
- `automation_workflows` — definitions with trigger config, re-entry rules, frequency caps, goal events, exclusion lists
- `workflow_steps` — graph nodes with polymorphic `config` JSONB (shape varies by step type)
- `workflow_enrollments` — one active row per contact per workflow; soft-unique prevents duplicate active enrollments
- `workflow_step_logs` — append-only execution audit log driving step funnel analytics
- `workflow_metrics` — materialised enrollment/completion counts via `compute_workflow_metrics()`

**Supported event types:** `form_submitted` · `quiz_completed` · `guide_downloaded` · `page_viewed` · `form_started` · `form_abandoned` · `contact_inactive` · `link_clicked` · `email_opened` · `purchase_completed` · `custom`

**Workflow step types:**

| Type | Description |
|---|---|
| `trigger` | Entry point — fires on a contact event |
| `delay` | Wait N minutes / hours / days / weeks |
| `condition` | Evaluate contact conditions without branching |
| `branch` | Split flow into yes/no paths |
| `send_email` | Send a marketing or operational email |
| `wait_for_event` | Pause until event fires or timeout expires |
| `add_to_list` | Add contact to a list |
| `remove_from_list` | Remove contact from a list |
| `create_task` | Create a CRM task |
| `update_field` | Update a contact field |
| `exit` | End the workflow |

**Branch fields:** `country` · `language` · `lifecycle_stage` · `consent_status` · `event_type` · `tag` · `custom_field`

**Safety rails:**
- `stop_on_unsubscribe` — DB trigger auto-exits all active marketing enrollments when consent is withdrawn
- `stop_on_conversion` — exits when goal event fires
- `frequency_cap_per_day` — per-contact daily email cap across all workflow steps
- `exclusion_list_id` — blocks enrollment for any contact in the specified list
- `evaluate_branch_condition()` Postgres function for consistent server-side branch evaluation

**Sample workflows (seeded):**
1. **Welcome Series** — form_submitted → welcome email → 1d delay → onboarding tips → 3d delay → guide email → add to list → exit
2. **Content Delivery** — guide_downloaded → 30min delay → related content → wait_for_event (7d) → branch (engaged/not) → exit
3. **Quiz Follow-up Nurture** — quiz_completed → results email → 2d delay → branch (score ≥ 80) → personalised path → 4d delay → final email → exit
4. **Re-engagement** — contact_inactive (30d) → re-engagement email → wait_for_event (email_opened, 7d) → branch → segment/remove → exit

**Pages:** Automations list · Workflow builder (4-step wizard) · Workflow detail (analytics + builder + enrollments) · Event explorer

**API routes:** `/api/automations` · `/api/automations/[id]` · `/api/events`

---

### Phase 4 — Extension points (planned)

Interfaces defined in `src/lib/extensions/index.ts`. Register an adapter with `registerExtension(key, adapter)` — call sites use the convenience helpers without null-checking.

| Extension key | Capability |
|---|---|
| `leadScoring` | Score contacts 0–100 from engagement + firmographic signals |
| `ai` | Generate email copy, contact summaries, predict send times |
| `abTest` | Subject / content experiments with automatic winner selection |
| `doubleOptIn` | GDPR confirmation flow with token-based verification |
| `dataExport` | Async export to CSV / JSONL / Parquet → S3 / BigQuery / Snowflake |
| `vatValidation` | VIES / HMRC VAT lookup for B2B company records |
| `billing` | Invoice sync from Stripe / Mollie |
| `support` | Ticket sync from Zendesk / Intercom / Plain |
| `affiliate` | Referral tracking and commission calculation |
| `sendTime` | Per-contact ML-predicted optimal send window |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router (TypeScript) |
| Styling | Tailwind CSS + custom component library (no shadcn) |
| Charts | Recharts |
| Database | Supabase (Postgres) with Row Level Security |
| Auth | Supabase Auth (SSR server client via `@supabase/ssr`) |
| Email | Provider-agnostic (Postmark / SendGrid / SES via webhook + sync job) |

## Project structure

```
src/
  app/
    (crm)/                  — All CRM pages (shared sidebar layout)
      dashboard/ contacts/ companies/ projects/
      lists/ segments/ forms/ compliance/
      campaigns/ templates/ suppression/ deliverability/ reports/
      automations/ events/
    api/                    — REST routes (mock fallback when Supabase absent)
  components/
    ui/                     — Button, Badge, Card, Table, Input, …
    layout/                 — Sidebar, PageHeader
    campaigns/              — BlockEditor, CampaignStats
    reports/                — MetricsChart, ReportFilterBar
    automations/            — WorkflowBuilder, WorkflowStats
  lib/
    types/
      index.ts              — Phase 1 types
      campaigns.ts          — Phase 2 types
      automations.ts        — Phase 3 types + extension point interfaces
    mock-data.ts            — Phase 1 seed data
    mock-data-campaigns.ts  — Phase 2 seed data
    mock-data-automations.ts — Phase 3 seed data + 4 sample workflows
    email-eligibility.ts    — Send eligibility pipeline
    extensions/index.ts     — Extension registry + adapter interfaces
    supabase/               — Server + browser Supabase clients
    utils.ts                — cn(), normalizeEmail(), formatDate(), …
    constants.ts            — European countries, languages, stages, …
supabase/
  migrations/
    001_initial_schema.sql
    002_campaigns.sql
    003_automations.sql
```

## Getting started

```bash
npm install
npm run dev        # mock mode — no Supabase needed

# With Supabase:
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Apply migrations in order: 001 → 002 → 003
npm run dev
```

## Mock mode

Every API route calls `isSupabaseConfigured()` (from `src/lib/config.ts`) before any DB access. If the env vars are absent, the route falls back to the in-memory mock data in `src/lib/mock-data*.ts`. Authentication is also bypassed in mock mode — all requests are treated as `admin`. The full UI is usable for demos and local development without any backend setup.

**Never run mock mode in production.** Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable auth and database persistence.

## Security

See [`SECURITY.md`](./SECURITY.md) for the full security checklist and manual provider configuration steps.

### Quick summary

| Layer | Implementation |
|---|---|
| Page auth | `src/proxy.ts` — unauthenticated users → `/login` |
| API auth | `src/lib/auth/api.ts` — `requireAuth(req, permission)` on every route |
| RBAC | `src/lib/auth/rbac.ts` — 4 roles: `admin`, `marketing`, `sales`, `viewer` |
| Env validation | `src/lib/config.ts` — Zod schema, fails fast in production |
| Security headers | `next.config.ts` — CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy |
| Audit logging | `src/lib/logger.ts` — structured JSON in production, named `AuditEvent` constants |
| Webhook auth | `X-Webhook-Secret` header check on `/api/email-events` |
| Cron auth | `Authorization: Bearer` check on `/api/sync` |

### Generating secrets

```bash
# WEBHOOK_SECRET and CRON_SECRET (≥32 chars each)
openssl rand -hex 32
```
