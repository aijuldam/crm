import { NextRequest, NextResponse } from 'next/server'
import { MOCK_TEMPLATES } from '@/lib/mock-data-campaigns'

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    const template = MOCK_TEMPLATES.find(t => t.id === id)
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ template })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  if (!isSupabaseConfigured()) {
    const template = MOCK_TEMPLATES.find(t => t.id === id)
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ template: { ...template, ...body, updated_at: new Date().toISOString() } })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ deleted: id })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
