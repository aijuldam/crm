import { NextRequest, NextResponse } from 'next/server'
import { requireWebhookSecret } from '@/lib/auth/api'
import { logger, AuditEvent } from '@/lib/logger'

export async function POST(req: NextRequest) {
  const authError = requireWebhookSecret(req)
  if (authError) return authError
  logger.audit(AuditEvent.WEBHOOK_RECEIVED, { path: '/api/email-events' })
  const body = await req.json()

  // Normalise to array for batch webhooks
  const events = Array.isArray(body) ? body : [body]

  if (!events.every((e: Record<string, unknown>) => e.provider_event_id && e.event_type && e.email)) {
    return NextResponse.json(
      { error: 'Each event must have provider_event_id, event_type, and email' },
      { status: 400 }
    )
  }

  // In mock mode, just acknowledge
  return NextResponse.json({ ingested: events.length }, { status: 202 })
}
