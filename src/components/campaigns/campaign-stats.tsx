import { cn } from '@/lib/utils'
import type { CampaignMetrics } from '@/lib/types/campaigns'

interface StatProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

function Stat({ label, value, sub, highlight }: StatProps) {
  return (
    <div className={cn('rounded-lg border p-4', highlight ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-white')}>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className={cn('text-2xl font-semibold tabular-nums', highlight ? 'text-indigo-700' : 'text-slate-900')}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function pct(n: number) {
  return `${n.toFixed(1)}%`
}

interface CampaignStatsProps {
  metrics: CampaignMetrics
  className?: string
}

export function CampaignStats({ metrics, className }: CampaignStatsProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3', className)}>
      <Stat label="Sent" value={metrics.sent.toLocaleString()} />
      <Stat label="Delivered" value={metrics.delivered.toLocaleString()} sub={pct(metrics.delivery_rate)} />
      <Stat label="Unique opens" value={metrics.unique_opens.toLocaleString()} sub={pct(metrics.open_rate)} highlight />
      <Stat label="Unique clicks" value={metrics.unique_clicks.toLocaleString()} sub={pct(metrics.click_rate)} highlight />
      <Stat label="CTOR" value={pct(metrics.ctor)} sub="Click-to-open" />
      <Stat label="Unsubscribes" value={metrics.unsubscribes.toLocaleString()} sub={pct(metrics.unsubscribe_rate)} />
      <Stat label="Hard bounces" value={metrics.bounces_hard.toLocaleString()} sub={pct(metrics.bounce_rate)} />
      <Stat label="Soft bounces" value={metrics.bounces_soft.toLocaleString()} />
      <Stat label="Complaints" value={metrics.complaints.toLocaleString()} sub={pct(metrics.complaint_rate)} />
      <Stat label="Suppressed" value={metrics.suppressed.toLocaleString()} />
    </div>
  )
}
