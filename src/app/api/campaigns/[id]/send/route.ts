import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data-campaigns'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'
import { logger, AuditEvent } from '@/lib/logger'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, 'campaigns:send')
  if (isAuthError(auth)) return auth
  const { id } = await params

  if (!isSupabaseConfigured()) {
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === id)
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return NextResponse.json({ error: 'Campaign cannot be sent in its current state' }, { status: 422 })
    }
    logger.audit(AuditEvent.CAMPAIGN_SENT, { campaignId: id, userId: auth.userId })
    const run = {
      id: Math.random().toString(36).slice(2),
      campaign_id: id,
      status: 'sending',
      recipient_count: campaign.recipient_count ?? 0,
      suppressed_count: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
      provider_batch_id: `batch_${Math.random().toString(36).slice(2)}`,
      created_at: new Date().toISOString(),
    }
    return NextResponse.json({ run }, { status: 202 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
