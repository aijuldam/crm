import type { Metadata } from 'next'
import {
  Users, TrendingUp, ShieldCheck, List,
  Globe, BarChart2
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_DASHBOARD_STATS, MOCK_PROJECTS } from '@/lib/mock-data'
import { getCountryFlag, getCountryName } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const stats = MOCK_DASHBOARD_STATS
  const projects = MOCK_PROJECTS

  const lifecycleColors: Record<string, string> = {
    lead: 'bg-blue-500',
    prospect: 'bg-violet-500',
    customer: 'bg-emerald-500',
    evangelist: 'bg-amber-500',
    churned: 'bg-red-500',
  }

  const consentColors: Record<string, string> = {
    opted_in: 'bg-emerald-500',
    pending: 'bg-yellow-500',
    opted_out: 'bg-red-500',
    unsubscribed: 'bg-slate-400',
  }

  const totalConsents = stats.consent_summary.reduce((s, x) => s + x.count, 0)
  const optedIn = stats.consent_summary.find(x => x.status === 'opted_in')?.count ?? 0

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of contacts, growth, and consent across all projects"
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard
          label="Total Contacts"
          value={stats.total_contacts}
          change="+12% vs last month"
          changeType="positive"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Consented (Email)"
          value={`${Math.round((optedIn / totalConsents) * 100)}%`}
          change={`${optedIn.toLocaleString('en-GB')} opted in`}
          changeType="positive"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Active Projects"
          value={projects.filter(p => p.is_active).length}
          change={`${projects.length} total projects`}
          changeType="neutral"
          icon={<Globe className="h-5 w-5" />}
        />
        <StatCard
          label="New This Month"
          value={stats.new_contacts_over_time.at(-1)?.count ?? 0}
          change="+8% vs prev month"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">
        {/* Contacts by project */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Contacts by Project</h2>
            <BarChart2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {stats.contacts_by_project.map(({ project, count }) => {
              const pct = Math.round((count / stats.total_contacts) * 100)
              const proj = projects.find(p => p.name === project)
              return (
                <div key={project}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{project}</span>
                      {proj && (
                        <Badge color={proj.is_active ? 'green' : 'gray'} className="text-[10px]">
                          {proj.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-slate-500 tabular-nums">{count.toLocaleString('en-GB')}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Lifecycle distribution */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Lifecycle Stages</h2>
          <div className="space-y-3">
            {stats.contacts_by_lifecycle.map(({ stage, count }) => {
              const pct = Math.round((count / stats.total_contacts) * 100)
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize text-slate-700">{stage}</span>
                    <span className="text-sm text-slate-500 tabular-nums">{count.toLocaleString('en-GB')}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${lifecycleColors[stage] ?? 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* New contacts over time */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">New Contacts Over Time</h2>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats.new_contacts_over_time.map(({ date, count }) => {
              const max = Math.max(...stats.new_contacts_over_time.map(x => x.count))
              const pct = (count / max) * 100
              const month = new Date(date + '-01').toLocaleDateString('en-GB', { month: 'short' })
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500 tabular-nums">{count.toLocaleString()}</span>
                  <div className="w-full rounded-t-md bg-indigo-100 relative overflow-hidden" style={{ height: 80 }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-indigo-500 transition-all"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{month}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Consent summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Consent Status</h2>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {stats.consent_summary.map(({ status, count }) => {
              const pct = Math.round((count / totalConsents) * 100)
              const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{label}</span>
                    <span className="text-sm text-slate-500 tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${consentColors[status] ?? 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Total consent records</span>
              <span className="font-medium text-slate-700">{totalConsents.toLocaleString('en-GB')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* List growth */}
      <Card className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">List Growth</h2>
          <List className="h-4 w-4 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.list_growth.map(({ list, count }) => (
            <div key={list} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 truncate">{list}</p>
              <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                {count.toLocaleString('en-GB')}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Countries */}
      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Contacts by Country</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {stats.contacts_by_country.map(({ country, count }) => (
            <div key={country} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-lg">{getCountryFlag(country)}</span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{getCountryName(country)}</p>
                <p className="text-sm font-semibold text-slate-900 tabular-nums">{count.toLocaleString('en-GB')}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
