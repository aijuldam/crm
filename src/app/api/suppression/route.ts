import { NextRequest, NextResponse } from 'next/server'
import { MOCK_SUPPRESSIONS } from '@/lib/mock-data-campaigns'

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope')
  const reason = searchParams.get('reason')
  const q = searchParams.get('q')

  if (!isSupabaseConfigured()) {
    let list = MOCK_SUPPRESSIONS
    if (scope) list = list.filter(s => s.scope === scope)
    if (reason) list = list.filter(s => s.reason === reason)
    if (q) list = list.filter(s => s.email_normalized.includes(q.toLowerCase()))
    return NextResponse.json({ suppressions: list, total: list.length })
  }

  return NextResponse.json({ suppressions: [], total: 0 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, scope = 'global', reason, project_id, notes } = body

  if (!email || !reason) {
    return NextResponse.json({ error: 'email and reason are required' }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    const entry = {
      id: Math.random().toString(36).slice(2),
      email_normalized: email.toLowerCase().trim(),
      scope,
      project_id: project_id ?? null,
      list_id: null,
      reason,
      notes: notes ?? null,
      source_event_id: null,
      added_at: new Date().toISOString(),
    }
    return NextResponse.json({ suppression: entry }, { status: 201 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ deleted: id })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
