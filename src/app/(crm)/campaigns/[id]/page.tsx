'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { CampaignStats } from '@/components/campaigns/campaign-stats'
import { MetricsChart } from '@/components/reports/metrics-chart'
import {
  MOCK_CAMPAIGNS, MOCK_CAMPAIGN_RUNS, MOCK_CAMPAIGN_METRICS, getMockTimeSeries,
} from '@/lib/mock-data-campaigns'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import type { CampaignStatus } from '@/lib/types/campaigns'

const STATUS_COLOR: Record<CampaignStatus, 'green' | 'blue' | 'yellow' | 'gray' | 'red' | 'amber'> = {
  sent: 'green', sending: 'blue', scheduled: 'blue', draft: 'gray',
  paused: 'yellow', cancelled: 'gray', failed: 'red',
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const campaign = MOCK_CAMPAIGNS.find(c => c.id === id)
  if (!campaign) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Campaign not found.</p>
        <Button variant="secondary" size="sm" onClick={() => router.push('/campaigns')} className="mt-4">
          Back to campaigns
        </Button>
      </div>
    )
  }

  const run = MOCK_CAMPAIGN_RUNS.find(r => r.campaign_id === id)
  const metrics = run ? MOCK_CAMPAIGN_METRICS[run.id] : null
  const timeSeries = run ? getMockTimeSeries(run.id) : []
  const project = MOCK_PROJECTS.find(p => p.id === campaign.project_id)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/campaigns')} className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{campaign.name}</h1>
            <p className="text-sm text-slate-500">{project?.name} · {campaign.language.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={STATUS_COLOR[campaign.status]}>{campaign.status}</Badge>
          {campaign.status === 'draft' && (
            <Button size="sm">
              <Send className="h-4 w-4" /> Send campaign
            </Button>
          )}
        </div>
      </div>

      {/* Subject / sender info */}
      <Card className="p-0">
        <div className="divide-y divide-slate-100">
          {[
            ['Subject', campaign.subject],
            ['Preheader', campaign.preheader || '—'],
            ['From', `${campaign.from_name} <${campaign.from_email}>`],
            ['Reply-to', campaign.reply_to ?? '—'],
            ['Email type', campaign.email_type],
            ['Audience', campaign.audience.type],
            ['Sent at', campaign.sent_at ? formatDate(campaign.sent_at) : '—'],
            ['Scheduled', campaign.scheduled_at ? formatDate(campaign.scheduled_at) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between px-5 py-3 text-sm">
              <span className="text-slate-500 w-28 shrink-0">{label}</span>
              <span className="text-slate-800 flex-1">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Metrics */}
      {metrics ? (
        <>
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-3">Performance</h2>
            <CampaignStats metrics={metrics} />
          </div>

          {timeSeries.length > 0 && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">Opens & clicks over time</h2>
              <MetricsChart data={timeSeries} type="line" height={240} />
            </Card>
          )}
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-slate-400 text-sm">No metrics available — campaign has not been sent yet.</p>
        </Card>
      )}

      {/* Run details */}
      {run && (
        <Card className="p-0">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Send run</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              ['Run ID', run.id],
              ['Status', run.status],
              ['Recipients', run.recipient_count.toLocaleString()],
              ['Suppressed', run.suppressed_count.toLocaleString()],
              ['Provider batch', run.provider_batch_id ?? '—'],
              ['Started', run.started_at ? formatDate(run.started_at) : '—'],
              ['Completed', run.completed_at ? formatDate(run.completed_at) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between px-5 py-2.5 text-sm">
                <span className="text-slate-500 w-36 shrink-0">{label}</span>
                <span className="text-slate-700 font-mono text-xs">{String(value)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
