import { NextRequest, NextResponse } from 'next/server'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

interface Props { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Props) {
  const auth = await requireAuth(req, 'projects:read')
  if (isAuthError(auth)) return auth
  const { id } = await params

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
    if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  }

  const project = MOCK_PROJECTS.find(p => p.id === id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const auth = await requireAuth(req, 'projects:write')
  if (isAuthError(auth)) return auth
  const { id } = await params
  const body = await req.json()

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const project = MOCK_PROJECTS.find(p => p.id === id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...project, ...body, updated_at: new Date().toISOString() })
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const auth = await requireAuth(req, 'projects:write')
  if (isAuthError(auth)) return auth
  const { id } = await params
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.from('projects').update({ is_active: false }).eq('id', id)
  }
  return new NextResponse(null, { status: 204 })
}
