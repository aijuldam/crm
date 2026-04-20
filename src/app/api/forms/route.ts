import { NextRequest, NextResponse } from 'next/server'
import { MOCK_FORMS } from '@/lib/mock-data'
import { slugify } from '@/lib/utils'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'forms:read')
  if (isAuthError(auth)) return auth
  const { searchParams } = req.nextUrl
  const project_id = searchParams.get('project_id') ?? ''

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    let query = supabase.from('forms').select('*, projects(name, slug)').order('name')
    if (project_id) query = query.eq('project_id', project_id)
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  let data = [...MOCK_FORMS]
  if (project_id) data = data.filter(f => f.project_id === project_id)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'forms:write')
  if (isAuthError(auth)) return auth
  const body = await req.json()
  if (!body.name || !body.project_id) {
    return NextResponse.json({ error: 'name and project_id are required' }, { status: 400 })
  }

  const slug = body.slug ?? slugify(body.name)

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase.from('forms').insert({ ...body, slug }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  return NextResponse.json({
    id: `form-${Date.now()}`,
    ...body,
    slug,
    is_active: true,
    submission_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { status: 201 })
}

// Form submission ingestion — used by public-facing forms
export async function PUT(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  const body = await req.json()
  const email = body.email

  if (!email) return NextResponse.json({ error: 'email is required in submission' }, { status: 400 })

  // Extension point: find form by slug, create/update contact, log submission, record consent
  // For Phase 1 this is a stub that returns 200
  return NextResponse.json({ success: true, message: 'Submission recorded' })
}
