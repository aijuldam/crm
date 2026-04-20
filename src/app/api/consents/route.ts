import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONSENTS } from '@/lib/mock-data'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'consents:read')
  if (isAuthError(auth)) return auth
  const { searchParams } = req.nextUrl
  const contact_id = searchParams.get('contact_id') ?? ''
  const project_id = searchParams.get('project_id') ?? ''
  const status = searchParams.get('status') ?? ''
  const channel = searchParams.get('channel') ?? ''

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    let query = supabase
      .from('consents')
      .select('*, contacts(email, first_name, last_name), projects(name), lists(name)')
      .order('created_at', { ascending: false })

    if (contact_id) query = query.eq('contact_id', contact_id)
    if (project_id) query = query.eq('project_id', project_id)
    if (status) query = query.eq('consent_status', status)
    if (channel) query = query.eq('channel', channel)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  let data = [...MOCK_CONSENTS]
  if (contact_id) data = data.filter(c => c.contact_id === contact_id)
  if (project_id) data = data.filter(c => c.project_id === project_id)
  if (status) data = data.filter(c => c.consent_status === status)
  if (channel) data = data.filter(c => c.channel === channel)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'consents:write')
  if (isAuthError(auth)) return auth
  const body = await req.json()

  const required = ['contact_id', 'project_id', 'channel', 'consent_status']
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `${field} is required` }, { status: 400 })
  }

  const consent = {
    ...body,
    consented_at: body.consent_status === 'opted_in' ? new Date().toISOString() : null,
    withdrawn_at: body.consent_status === 'opted_out' || body.consent_status === 'unsubscribed'
      ? new Date().toISOString()
      : null,
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase.from('consents').insert(consent).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  return NextResponse.json({
    id: `cns-${Date.now()}`,
    ...consent,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { status: 201 })
}
