# CRM Platform — Phase 1

Internal CRM built on **Next.js 15 + TypeScript + Supabase/Postgres**.
Multi-project, Europe-first, GDPR-aware. B2C-primary with B2B foundation.

---

## Quick start

```bash
cp .env.example .env.local   # fill in Supabase credentials
npm install
npm run dev                   # → http://localhost:3000
```

> **Without Supabase**: The app runs fully with mock data — no `.env.local` needed.

Run the database:
1. Paste `supabase/migrations/001_initial_schema.sql` into Supabase SQL editor
2. Optionally run `supabase/seed.sql` for European test data

---

## Pages

| Route | Description |
|---|---|
| `/dashboard` | KPIs, contact growth, lifecycle and consent charts |
| `/contacts` | Searchable/filterable contact list with CSV import |
| `/contacts/new` | Create contact with full European field set |
| `/contacts/[id]` | Contact detail: profile, consents, activity |
| `/companies` | Company list with VAT status |
| `/companies/[id]` | Company detail |
| `/projects` | Project cards (one per market/brand) |
| `/lists` | Static subscriber lists |
| `/segments` | Dynamic segments with condition builder |
| `/forms` | Ingestion forms |
| `/compliance` | Full consent audit table |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (Postgres) |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (Phase 2) |

---

## Project structure

```
src/
├── app/
│   ├── (crm)/                     # CRM shell (sidebar layout)
│   └── api/                       # REST API routes
├── components/
│   ├── ui/                        # Button, Badge, Table, Dialog, etc.
│   └── layout/                    # Sidebar, PageHeader
└── lib/
    ├── types/index.ts             # All TypeScript types
    ├── constants.ts               # Countries, languages, lifecycle stages
    ├── utils.ts                   # Helpers
    ├── mock-data.ts               # Dev/demo fallback data
    └── supabase/                  # Browser + server clients
supabase/
├── migrations/001_initial_schema.sql
└── seed.sql
```

---

## Database schema

| Table | Purpose |
|---|---|
| `projects` | Brands / markets |
| `contacts` | Deduplicated by `email_normalized` |
| `companies` | B2B companies with VAT |
| `contact_projects` | Contact ↔ project many-to-many |
| `lists` | Static subscriber lists |
| `contact_lists` | Contact ↔ list many-to-many |
| `segments` | Dynamic JSONB-condition groups |
| `consents` | GDPR consent events (immutable audit trail) |
| `forms` | Ingestion forms with field definitions |
| `submissions` | Raw form submissions |
| `activities` | Append-only event log |
| `tasks` | Manual tasks |
| `deals` | Lightweight pipeline |
| `crm_users` + `memberships` | RBAC (admin/marketing/sales/viewer) |

**Key decisions:**
- `email_normalized` is the deduplication key — lowercase + trimmed, enforced by UNIQUE constraint
- Consent records store country/language **at event time** — not from the contact profile (GDPR correct)
- `withdrawn_at` is stamped but the row is never deleted — full audit trail
- Segments use JSONB conditions — extend without schema changes
- RLS enabled on all tables; Phase 2 adds per-membership policies

---

## CSV import

`POST /api/contacts/import` — multipart form with a `file` field.

Required: `email` | Optional: `first_name`, `last_name`, `phone`, `country`, `language`, `lifecycle_stage`, `source`

Uses Postgres `UPSERT ON CONFLICT (email_normalized)` for safe re-import.

---

## Roles

| Role | Access |
|---|---|
| `admin` | Full access across all projects |
| `marketing` | Contacts, lists, segments, forms, consents |
| `sales` | Contacts (read), tasks, deals |
| `viewer` | Read-only |

---

## Extension points for Phase 2

### Email automation
- `email_campaigns` table (template, schedule, segment_id)
- `campaign_sends` for delivery tracking (opened_at, clicked_at, bounced_at)
- Provider integration via `/api/campaigns/send` (Postmark / Resend / SendGrid)

### Auth
- Supabase Auth + `/app/(auth)/login`
- RLS policies tied to `auth.uid()` + memberships
- `middleware.ts` route protection

### Form builder
- Drag-and-drop field editor on the Forms page
- Public `/forms/[slug]` route for embedded forms
- Complete form submission ingestion pipeline

### Reporting
- Recharts already installed — add time-series charts to dashboard
- Deliverability reports from `campaign_sends`

### GDPR Phase 2
- Right-to-erasure workflow (Art. 17) — anonymize fields, preserve consent audit trail
- Data portability export (Art. 20)
- DPA tracking table

---

## Getting started (original Next.js instructions)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
