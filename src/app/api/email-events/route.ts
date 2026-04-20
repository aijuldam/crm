import { NextRequest, NextResponse } from 'next/server'

// Webhook ingestion endpoint — receives events from ESP (e.g. Postmark, SendGrid)
export async function POST(req: NextRequest) {
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
