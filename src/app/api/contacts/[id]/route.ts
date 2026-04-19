import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONTACTS } from '@/lib/mock-data'
import { normalizeEmail } from '@/lib/utils'

function isSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('contacts')
      .select(`*, contact_projects(project_id, projects(*)), contact_lists(list_id, lists(*)), consents(*), activities(*)`)
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  }

  const contact = MOCK_CONTACTS.find(c => c.id === id)
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(contact)
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { id } = await params
  const body = await req.json()

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const updates: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() }
    if (body.email) updates.email_normalized = normalizeEmail(body.email)

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const contact = MOCK_CONTACTS.find(c => c.id === id)
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...contact, ...body, updated_at: new Date().toISOString() })
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id } = await params

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
