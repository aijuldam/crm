import { NextRequest, NextResponse } from 'next/server'
import { MOCK_WORKFLOWS, MOCK_WORKFLOW_ANALYTICS } from '@/lib/mock-data-automations'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'
import { logger, AuditEvent } from '@/lib/logger'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, 'automations:read')
  if (isAuthError(auth)) return auth
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const include = searchParams.get('include') ?? ''

  if (!isSupabaseConfigured()) {
    const workflow = MOCK_WORKFLOWS.find(w => w.id === id)
    if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const payload: Record<string, unknown> = { workflow }
    if (include.includes('analytics')) {
      payload.analytics = MOCK_WORKFLOW_ANALYTICS[id] ?? null
    }
    return NextResponse.json(payload)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, 'automations:write')
  if (isAuthError(auth)) return auth
  const { id } = await params
  const body = await req.json()
  if (body.status === 'active') {
    logger.audit(AuditEvent.WORKFLOW_ACTIVATED, { workflowId: id, userId: auth.userId })
  }

  if (!isSupabaseConfigured()) {
    const workflow = MOCK_WORKFLOWS.find(w => w.id === id)
    if (!workflow) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      workflow: { ...workflow, ...body, updated_at: new Date().toISOString() },
    })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, 'automations:write')
  if (isAuthError(auth)) return auth
  const { id } = await params

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ deleted: id })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
