import { NextRequest, NextResponse } from 'next/server'
import { MOCK_ACCOUNT_METRICS, MOCK_CAMPAIGNS, MOCK_CAMPAIGN_RUNS, getMockTimeSeries } from '@/lib/mock-data-campaigns'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'reports:read')
  if (isAuthError(auth)) return auth
  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') ?? 'account'   // account | project | campaign
  const project_id = searchParams.get('project_id')
  const campaign_id = searchParams.get('campaign_id')

  if (!isSupabaseConfigured()) {
    if (scope === 'campaign' && campaign_id) {
      const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaign_id)
      if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const run = MOCK_CAMPAIGN_RUNS.find(r => r.campaign_id === campaign_id)
      return NextResponse.json({
        campaign,
        metrics: run?.metrics ?? null,
        time_series: run ? getMockTimeSeries(run.id) : [],
      })
    }

    if (scope === 'project' && project_id) {
      const campaigns = MOCK_CAMPAIGNS.filter(c => c.project_id === project_id && c.status === 'sent')
      return NextResponse.json({
        campaigns_sent: campaigns.length,
        metrics: MOCK_ACCOUNT_METRICS,
        time_series: getMockTimeSeries('run-1'),
      })
    }

    return NextResponse.json({
      metrics: MOCK_ACCOUNT_METRICS,
      time_series: getMockTimeSeries('run-1'),
    })
  }

  return NextResponse.json({ metrics: null })
}
