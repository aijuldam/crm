import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { slugify } from '@/lib/utils'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'projects:read')
  if (isAuthError(auth)) return auth
  const { searchParams } = req.nextUrl
  const includeInactive = searchParams.get('include_inactive') === 'true'

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    let query = supabase.from('projects').select('*').order('name')
    if (!includeInactive) query = query.eq('is_active', true)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  let data = [...MOCK_PROJECTS]
  if (!includeInactive) data = data.filter(p => p.is_active)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'projects:write')
  if (isAuthError(auth)) return auth
  const body = await req.json()

  if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const slug = body.slug ?? slugify(body.name)

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...body, slug })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  return NextResponse.json({
    id: `proj-${Date.now()}`,
    ...body,
    slug,
    is_active: true,
    contact_count: 0,
    list_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { status: 201 })
}
