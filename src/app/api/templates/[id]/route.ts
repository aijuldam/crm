import { NextRequest, NextResponse } from 'next/server'
import { MOCK_TEMPLATES } from '@/lib/mock-data-campaigns'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, 'templates:read')
  if (isAuthError(auth)) return auth
  const { id } = await params

  if (!isSupabaseConfigured()) {
    const template = MOCK_TEMPLATES.find(t => t.id === id)
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ template })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, 'templates:write')
  if (isAuthError(auth)) return auth
  const { id } = await params
  const body = await req.json()

  if (!isSupabaseConfigured()) {
    const template = MOCK_TEMPLATES.find(t => t.id === id)
    if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ template: { ...template, ...body, updated_at: new Date().toISOString() } })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, 'templates:write')
  if (isAuthError(auth)) return auth
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ deleted: id })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
