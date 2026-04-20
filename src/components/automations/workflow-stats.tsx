'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { StatCard, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { WorkflowAnalytics, WorkflowStepStat, StepType } from '@/lib/types/automations'

const STEP_TYPE_COLOR: Partial<Record<StepType, string>> = {
  send_email: 'bg-emerald-400',
  delay:      'bg-slate-300',
  branch:     'bg-violet-400',
  wait_for_event: 'bg-amber-400',
  add_to_list: 'bg-teal-400',
  exit:       'bg-red-400',
}

function pct(n: number) { return `${(n * 100).toFixed(1)}%` }

interface WorkflowStatsProps {
  analytics: WorkflowAnalytics
}

export function WorkflowStats({ analytics: a }: WorkflowStatsProps) {
  const tickStyle = { fontSize: 11, fill: '#94a3b8' }

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total enrolled"    value={a.total_enrolled.toLocaleString()} />
        <StatCard label="Active"            value={a.active_count.toLocaleString()} />
        <StatCard label="Completion rate"   value={pct(a.completion_rate)} />
        <StatCard label="Goal completion"   value={pct(a.goal_completion_rate)} />
        <StatCard label="Completed"         value={a.completed_count.toLocaleString()} />
        <StatCard label="Exited"            value={a.exited_count.toLocaleString()} />
        <StatCard label="Failed"            value={a.failed_count.toLocaleString()} />
        <StatCard label="Avg days to complete" value={`${a.avg_completion_days.toFixed(1)}d`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment over time */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Enrollments over time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={a.enrollment_by_day} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={tickStyle} tickLine={false} axisLine={false} />
              <YAxis tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="enrolled"  name="Enrolled"  stroke="#4f46e5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Exit reasons */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Exit reasons</h3>
          {a.exit_reasons.length === 0 ? (
            <p className="text-sm text-slate-400">No exits recorded.</p>
          ) : (
            <div className="space-y-3">
              {a.exit_reasons.map(({ reason, count }) => (
                <div key={reason} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600 capitalize">{reason.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-red-300"
                      style={{ width: `${Math.round((count / a.exited_count) * 80)}px` }}
                    />
                    <span className="text-sm font-semibold tabular-nums w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Email performance by step */}
      {a.email_performance.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Email performance by step</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={a.email_performance} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="step_name" tick={tickStyle} tickLine={false} axisLine={false} angle={-20} textAnchor="end" interval={0} />
              <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={tickStyle} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : v} contentStyle={{ fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="open_rate"        name="Open rate"        fill="#4f46e5" radius={[2, 2, 0, 0]} />
              <Bar dataKey="click_rate"       name="Click rate"       fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="unsubscribe_rate" name="Unsub rate"       fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Step funnel */}
      <Card className="p-0">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Step conversion funnel</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {a.step_stats.map((stat: WorkflowStepStat, i: number) => {
            const barColor = STEP_TYPE_COLOR[stat.step_type] ?? 'bg-slate-300'
            const barW = Math.max(4, Math.round((stat.executions / (a.step_stats[0]?.executions || 1)) * 100))
            return (
              <div key={stat.step_id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-xs font-mono text-slate-400 w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 truncate">{stat.step_name || stat.step_type}</span>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-slate-500 tabular-nums">{stat.executions.toLocaleString()} runs</span>
                      <Badge color={stat.success_rate_pct >= 95 ? 'green' : stat.success_rate_pct >= 80 ? 'yellow' : 'red'}>
                        {stat.success_rate_pct.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${barW}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
