import { NextRequest, NextResponse } from 'next/server'
import { MOCK_LISTS } from '@/lib/mock-data'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'lists:read')
  if (isAuthError(auth)) return auth
  const { searchParams } = req.nextUrl
  const project_id = searchParams.get('project_id') ?? ''

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    let query = supabase
      .from('lists')
      .select('*, projects(name, slug)')
      .order('name')
    if (project_id) query = query.eq('project_id', project_id)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  let data = [...MOCK_LISTS]
  if (project_id) data = data.filter(l => l.project_id === project_id)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'lists:write')
  if (isAuthError(auth)) return auth
  const body = await req.json()
  if (!body.name || !body.project_id) {
    return NextResponse.json({ error: 'name and project_id are required' }, { status: 400 })
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase.from('lists').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  return NextResponse.json({
    id: `list-${Date.now()}`,
    ...body,
    is_active: true,
    contact_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { status: 201 })
}
