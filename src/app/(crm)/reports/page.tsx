'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, StatCard } from '@/components/ui/card'
import { MetricsChart } from '@/components/reports/metrics-chart'
import { ReportFilterBar } from '@/components/reports/report-filters'
import { MOCK_ACCOUNT_METRICS, MOCK_CAMPAIGN_METRICS, MOCK_CAMPAIGN_RUNS, MOCK_CAMPAIGNS, getMockTimeSeries } from '@/lib/mock-data-campaigns'
import { cn } from '@/lib/utils'
import type { ReportFilters } from '@/lib/types/campaigns'

const TABS = ['Account', 'By project', 'By campaign'] as const
type Tab = typeof TABS[number]

function AccountTab() {
  const m = MOCK_ACCOUNT_METRICS
  const timeSeries = getMockTimeSeries('run-1')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Campaigns sent" value={m.campaigns_sent} />
        <StatCard label="Total sent" value={m.total_recipients.toLocaleString()} />
        <StatCard label="Avg open rate" value={`${(m.avg_open_rate * 100).toFixed(1)}%`} />
        <StatCard label="Avg click rate" value={`${(m.avg_click_rate * 100).toFixed(1)}%`} />
        <StatCard label="Avg bounce rate" value={`${(m.avg_bounce_rate * 100).toFixed(2)}%`} />
        <StatCard label="Avg unsub rate" value={`${(m.avg_unsubscribe_rate * 100).toFixed(2)}%`} />
        <StatCard label="Total suppressed" value={m.total_suppressions} />
        <StatCard label="Delivered" value={m.total_delivered.toLocaleString()} />
      </div>

      {timeSeries.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Opens & clicks — latest send</h2>
          <MetricsChart data={timeSeries} type="line" height={240} />
        </Card>
      )}

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Monthly send volume</h2>
        <div className="divide-y divide-slate-100">
          {m.monthly_sends.map(row => (
            <div key={row.month} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-slate-700">{row.month}</span>
              <div className="flex items-center gap-6 text-slate-500">
                <span><span className="font-semibold text-slate-800">{row.campaigns}</span> campaign{row.campaigns !== 1 ? 's' : ''}</span>
                <span><span className="font-semibold text-slate-800">{row.sent.toLocaleString()}</span> sent</span>
                <span><span className="font-semibold text-slate-800">{(row.opens_rate * 100).toFixed(1)}%</span> open rate</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ByProjectTab() {
  return (
    <div className="space-y-4">
      {MOCK_ACCOUNT_METRICS.by_project.map(row => (
        <Card key={row.project} className="p-5">
          <h3 className="font-semibold text-slate-800 mb-3">{row.project}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Sent" value={row.sent.toLocaleString()} />
            <StatCard label="Open rate" value={`${(row.open_rate * 100).toFixed(1)}%`} />
            <StatCard label="Click rate" value={`${(row.click_rate * 100).toFixed(1)}%`} />
            <StatCard label="Unsub rate" value={`${(row.unsubscribe_rate * 100).toFixed(2)}%`} />
          </div>
        </Card>
      ))}
    </div>
  )
}

function ByCampaignTab() {
  return (
    <div className="space-y-4">
      {MOCK_CAMPAIGNS.filter(c => c.status === 'sent').map(campaign => {
        const run = MOCK_CAMPAIGN_RUNS.find(r => r.campaign_id === campaign.id)
        const metrics = run ? MOCK_CAMPAIGN_METRICS[run.id] : null
        if (!metrics) return null
        return (
          <Card key={campaign.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-800">{campaign.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-lg">{campaign.subject}</p>
              </div>
              <a href={`/campaigns/${campaign.id}`} className="text-xs text-indigo-600 hover:underline">
                View campaign →
              </a>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              <StatCard label="Sent" value={metrics.sent.toLocaleString()} />
              <StatCard label="Open rate" value={`${(metrics.open_rate * 100).toFixed(1)}%`} />
              <StatCard label="Click rate" value={`${(metrics.click_rate * 100).toFixed(1)}%`} />
              <StatCard label="CTOR" value={`${(metrics.ctor * 100).toFixed(1)}%`} />
              <StatCard label="Bounce rate" value={`${(metrics.bounce_rate * 100).toFixed(2)}%`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Account')
  const [filters, setFilters] = useState<ReportFilters>({})

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Campaign analytics and deliverability metrics" />

      <ReportFilterBar filters={filters} onChange={setFilters} />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Account' && <AccountTab />}
      {activeTab === 'By project' && <ByProjectTab />}
      {activeTab === 'By campaign' && <ByCampaignTab />}
    </div>
  )
}
