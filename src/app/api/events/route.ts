import { NextRequest, NextResponse } from 'next/server'
import { MOCK_EVENTS } from '@/lib/mock-data-automations'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'events:read')
  if (isAuthError(auth)) return auth
  const { searchParams } = new URL(req.url)
  const project_id  = searchParams.get('project_id')
  const contact_id  = searchParams.get('contact_id')
  const event_type  = searchParams.get('event_type')
  const source      = searchParams.get('source')
  const q           = searchParams.get('q')
  const limit       = Number(searchParams.get('limit') ?? 50)
  const offset      = Number(searchParams.get('offset') ?? 0)

  if (!isSupabaseConfigured()) {
    let events = MOCK_EVENTS
    if (project_id) events = events.filter(e => e.project_id === project_id)
    if (contact_id) events = events.filter(e => e.contact_id === contact_id)
    if (event_type) events = events.filter(e => e.event_type === event_type)
    if (source)     events = events.filter(e => e.source === source)
    if (q) {
      const lq = q.toLowerCase()
      events = events.filter(e =>
        e.email?.toLowerCase().includes(lq) ||
        JSON.stringify(e.properties).toLowerCase().includes(lq)
      )
    }
    const total = events.length
    const page  = events
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
      .slice(offset, offset + limit)
    return NextResponse.json({ events: page, total })
  }

  return NextResponse.json({ events: [], total: 0 })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'events:write')
  if (isAuthError(auth)) return auth
  const body = await req.json()
  const events = Array.isArray(body) ? body : [body]

  for (const e of events) {
    if (!e.project_id || !e.event_type) {
      return NextResponse.json(
        { error: 'Each event must have project_id and event_type' },
        { status: 400 }
      )
    }
  }

  // In production: upsert into events table (dedup via idempotency_key),
  // then enqueue automation trigger evaluation for each event.
  if (!isSupabaseConfigured()) {
    const ingested = events.map(e => ({
      id: Math.random().toString(36).slice(2),
      ...e,
      ingested_at: new Date().toISOString(),
      occurred_at: e.occurred_at ?? new Date().toISOString(),
    }))
    return NextResponse.json({ ingested: ingested.length, events: ingested }, { status: 201 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
