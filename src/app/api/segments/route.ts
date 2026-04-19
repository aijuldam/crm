import { NextRequest, NextResponse } from 'next/server'
import { MOCK_SEGMENTS } from '@/lib/mock-data'

function isSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const project_id = searchParams.get('project_id') ?? ''

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    let query = supabase.from('segments').select('*, projects(name, slug)').order('name')
    if (project_id) query = query.eq('project_id', project_id)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  let data = [...MOCK_SEGMENTS]
  if (project_id) data = data.filter(s => s.project_id === project_id)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name || !body.project_id) {
    return NextResponse.json({ error: 'name and project_id are required' }, { status: 400 })
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase.from('segments').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  return NextResponse.json({
    id: `seg-${Date.now()}`,
    ...body,
    conditions: body.conditions ?? [],
    is_active: true,
    contact_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { status: 201 })
}
