'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Card, StatCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricsChart } from '@/components/reports/metrics-chart'
import { MOCK_ACCOUNT_METRICS, MOCK_CAMPAIGN_METRICS, MOCK_SUPPRESSIONS, getMockTimeSeries } from '@/lib/mock-data-campaigns'
import { SUPPRESSION_REASON_LABELS } from '@/lib/email-eligibility'

// Aggregate across all runs
const allMetrics = Object.values(MOCK_CAMPAIGN_METRICS)
const totalSent = allMetrics.reduce((s, m) => s + m.sent, 0)
const totalDelivered = allMetrics.reduce((s, m) => s + m.delivered, 0)
const totalBounces = allMetrics.reduce((s, m) => s + m.bounces_hard + m.bounces_soft, 0)
const totalComplaints = allMetrics.reduce((s, m) => s + m.complaints, 0)
const totalUnsubs = allMetrics.reduce((s, m) => s + m.unsubscribes, 0)

const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0
const complaintRate = totalDelivered > 0 ? (totalComplaints / totalDelivered) * 100 : 0
const unsubRate = totalDelivered > 0 ? (totalUnsubs / totalDelivered) * 100 : 0

function RateIndicator({ label, value, threshold, unit = '%' }: {
  label: string; value: number; threshold: number; unit?: string
}) {
  const ok = value < threshold
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm tabular-nums">{value.toFixed(2)}{unit}</span>
        <Badge color={ok ? 'green' : 'red'}>{ok ? 'Good' : 'At risk'}</Badge>
      </div>
    </div>
  )
}

export default function DeliverabilityPage() {
  const timeSeries = getMockTimeSeries('run-1')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliverability"
        description="Monitor bounce rates, complaints, and suppression health"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Delivery rate" value={`${deliveryRate.toFixed(1)}%`} />
        <StatCard label="Bounce rate" value={`${bounceRate.toFixed(2)}%`} />
        <StatCard label="Complaint rate" value={`${complaintRate.toFixed(3)}%`} />
        <StatCard label="Unsubscribe rate" value={`${unsubRate.toFixed(2)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thresholds */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Industry thresholds</h2>
          <RateIndicator label="Bounce rate" value={bounceRate} threshold={2} />
          <RateIndicator label="Complaint rate" value={complaintRate} threshold={0.08} />
          <RateIndicator label="Unsubscribe rate" value={unsubRate} threshold={0.5} />
          <RateIndicator label="Delivery rate" value={100 - bounceRate} threshold={98} unit="%" />
          <p className="text-xs text-slate-400 mt-3">
            Thresholds: bounce &lt;2%, complaint &lt;0.08% (Google/Yahoo 2024 requirements), unsub &lt;0.5%
          </p>
        </Card>

        {/* Suppression breakdown */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            Suppression list ({MOCK_SUPPRESSIONS.length} addresses)
          </h2>
          <div className="space-y-2">
            {MOCK_ACCOUNT_METRICS.suppressions_by_reason.map(({ reason, count }) => (
              <div key={reason} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {SUPPRESSION_REASON_LABELS[reason as keyof typeof SUPPRESSION_REASON_LABELS] ?? reason}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-indigo-400"
                    style={{ width: `${(count / MOCK_SUPPRESSIONS.length) * 80}px` }}
                  />
                  <span className="text-sm font-medium tabular-nums w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Time series */}
      {timeSeries.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Event distribution (latest run)</h2>
          <MetricsChart data={timeSeries} type="bar" height={240} />
        </Card>
      )}

      {/* Per-project breakdown */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">By project</h2>
        <div className="divide-y divide-slate-100">
          {MOCK_ACCOUNT_METRICS.by_project.map(row => (
            <div key={row.project} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium text-slate-700">{row.project}</span>
              <div className="flex items-center gap-6 text-slate-500">
                <span><span className="font-semibold text-slate-800">{row.sent.toLocaleString()}</span> sent</span>
                <span><span className="font-semibold text-slate-800">{(row.open_rate * 100).toFixed(1)}%</span> open</span>
                <span><span className="font-semibold text-slate-800">{(row.click_rate * 100).toFixed(1)}%</span> click</span>
                <span><span className="font-semibold text-slate-800">{(row.unsubscribe_rate * 100).toFixed(2)}%</span> unsub</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
