# Security checklist

## Authentication & authorisation

- [x] All CRM page routes protected by `src/proxy.ts` — unauthenticated users redirected to `/login`
- [x] All 24 API routes enforce authentication via `requireAuth()` in `src/lib/auth/api.ts`
- [x] RBAC — 4 roles (`admin`, `marketing`, `sales`, `viewer`) with per-permission grants (`src/lib/auth/rbac.ts`)
- [x] Webhook endpoints (`/api/email-events`) protected by `X-Webhook-Secret` header check
- [x] Cron/sync endpoint (`/api/sync`) protected by `Authorization: Bearer <CRON_SECRET>` check
- [x] Mock mode (no Supabase configured) bypasses auth — intentional for local development only
- [ ] Supabase RLS policies — see **Manual steps** below
- [ ] Assign `role` in Supabase user metadata on signup/invite

## Environment variables

- [x] `.env.example` documents all required and optional variables
- [x] `src/lib/config.ts` validates env at startup; fails fast in production if Supabase vars are absent
- [x] `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never in `NEXT_PUBLIC_` vars
- [x] `WEBHOOK_SECRET` — shared secret for ESP webhook verification (≥32 chars)
- [x] `CRON_SECRET` — bearer token for scheduled job endpoints (≥32 chars)
- [ ] Rotate secrets after each deployment environment promotion

## Security headers

Set via `next.config.ts` on all routes:

- [x] `Content-Security-Policy` — restricts script/style/connect origins
- [x] `X-Frame-Options: DENY` — prevents clickjacking
- [x] `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` — disables camera, microphone, geolocation
- [x] `Strict-Transport-Security` — HSTS with 1-year max-age (production only)

## Data protection (GDPR)

- [x] Consent records store country, language, legal basis, privacy notice version **at event time**
- [x] `withdrawn_at` stamped on opt-out — row never deleted (audit trail)
- [x] `stop_on_unsubscribe` DB trigger auto-exits active marketing workflow enrollments
- [x] `email_normalized` deduplication key enforced at DB level
- [x] `consents:write` permission restricted to `admin` role only
- [x] Suppression additions logged as audit events

## Audit logging

- [x] Structured logger in `src/lib/logger.ts` — JSON in production, readable in dev
- [x] Named audit events: login, auth denied, consent changes, campaign sends, workflow activations, webhook ingestion, suppression additions
- [ ] Wire logger output to your SIEM / log aggregator (Datadog, CloudWatch, Papertrail)

## Input validation

- [x] Required fields validated at API boundary (returns 400 on missing fields)
- [x] `email_normalized` normalization (lowercase + trim) applied before DB writes
- [ ] Add Zod schemas for all POST/PATCH request bodies (currently only spot-checked)

## Secrets management

- [x] `.gitignore` covers all `.env*` files
- [x] No secrets hardcoded in source (sidebar user is UI-only placeholder)
- [ ] Use a secrets manager (AWS Secrets Manager, Doppler) for staging/production

---

## Manual steps (provider dashboards)

These cannot be automated — a human must configure them after deployment.

### Supabase

1. **Enable email auth** — Supabase dashboard → Authentication → Providers → Email
2. **Disable public sign-ups** — Authentication → Settings → "Enable sign ups" → OFF (internal tool)
3. **Add your domain to allowed redirect URLs** — Authentication → URL Configuration
4. **Write RLS policies** for all tables — suggested baseline:
   ```sql
   -- Example: contacts table
   CREATE POLICY "Authenticated users can read contacts"
     ON contacts FOR SELECT
     USING (auth.role() = 'authenticated');

   CREATE POLICY "Admins and sales can write contacts"
     ON contacts FOR INSERT
     USING (auth.jwt() ->> 'role' IN ('admin', 'sales'));
   ```
5. **Set user role on invite** — use Supabase Admin SDK or edge function to set `user_metadata.role` when creating users
6. **Enable leaked password protection** — Authentication → Settings → Security

### Email provider (Postmark / SendGrid / SES)

1. **Configure webhook URL** — point to `https://your-domain.com/api/email-events`
2. **Set the shared webhook secret** — match what you put in `WEBHOOK_SECRET`
3. **Verify your sending domain** — set up SPF, DKIM, DMARC records
4. **Enable bounce/complaint webhooks** — required for auto-suppression to work

### Vercel / hosting

1. **Set all env vars** in the Vercel project settings (not in `.env` files committed to git)
2. **Configure Cron Jobs** — set `Authorization: Bearer <CRON_SECRET>` header on `/api/sync` schedule
3. **Enable Web Application Firewall** (WAF) if on Vercel Pro
4. **Set `APP_ENV=production`** in production environment vars
