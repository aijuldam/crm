'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, Send, Clock, FileText, Play, AlertTriangle, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/card'
import { FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { SearchInput } from '@/components/ui/search-filter'
import { MOCK_CAMPAIGNS, MOCK_CAMPAIGN_METRICS, MOCK_CAMPAIGN_RUNS } from '@/lib/mock-data-campaigns'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { formatRelativeDate } from '@/lib/utils'
import type { CampaignStatus } from '@/lib/types/campaigns'

const STATUS_COLOR: Record<CampaignStatus, 'green' | 'blue' | 'yellow' | 'gray' | 'red' | 'amber'> = {
  sent: 'green',
  sending: 'blue',
  scheduled: 'blue',
  draft: 'gray',
  paused: 'yellow',
  cancelled: 'gray',
  failed: 'red',
}

function StatusIcon({ status }: { status: CampaignStatus }) {
  switch (status) {
    case 'sent': return <Send className="h-3.5 w-3.5" />
    case 'sending': return <Play className="h-3.5 w-3.5" />
    case 'scheduled': return <Clock className="h-3.5 w-3.5" />
    case 'draft': return <FileText className="h-3.5 w-3.5" />
    case 'failed': return <AlertTriangle className="h-3.5 w-3.5" />
    case 'cancelled': return <X className="h-3.5 w-3.5" />
    default: return null
  }
}

export default function CampaignsPage() {
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    return MOCK_CAMPAIGNS.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.subject.toLowerCase().includes(search.toLowerCase())) return false
      if (projectFilter && c.project_id !== projectFilter) return false
      if (statusFilter && c.status !== statusFilter) return false
      return true
    })
  }, [search, projectFilter, statusFilter])

  const projectMap = Object.fromEntries(MOCK_PROJECTS.map(p => [p.id, p]))

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description={`${MOCK_CAMPAIGNS.length} campaigns`}
        actions={
          <Button size="sm" onClick={() => window.location.href = '/campaigns/new'}>
            <Plus className="h-4 w-4" /> New campaign
          </Button>
        }
      />

      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search campaigns…"
          className="w-72"
        />
        <FilterSelect
          label="All projects"
          value={projectFilter}
          onChange={e => setProjectFilter(e.target.value)}
        >
          {MOCK_PROJECTS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="All statuses"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {(['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed'] as CampaignStatus[]).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No campaigns found" description="Try adjusting your search or filters" />
      ) : (
        <Table>
          <TableHead>
            <Th>Campaign</Th>
            <Th>Project</Th>
            <Th>Status</Th>
            <Th>Recipients</Th>
            <Th>Open rate</Th>
            <Th>Click rate</Th>
            <Th>Sent</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.map(campaign => {
              const run = MOCK_CAMPAIGN_RUNS.find(r => r.campaign_id === campaign.id)
              const metrics = run ? MOCK_CAMPAIGN_METRICS[run.id] : null
              const project = projectMap[campaign.project_id]
              return (
                <Tr
                  key={campaign.id}
                  onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                >
                  <Td>
                    <div>
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{campaign.subject}</p>
                    </div>
                  </Td>
                  <Td className="text-slate-500 text-sm">{project?.name ?? '—'}</Td>
                  <Td>
                    <Badge color={STATUS_COLOR[campaign.status]}>
                      <StatusIcon status={campaign.status} />
                      {' '}{campaign.status}
                    </Badge>
                  </Td>
                  <Td className="tabular-nums">{campaign.recipient_count?.toLocaleString() ?? '—'}</Td>
                  <Td className="tabular-nums font-medium">
                    {metrics ? `${(metrics.open_rate * 100).toFixed(1)}%` : '—'}
                  </Td>
                  <Td className="tabular-nums">
                    {metrics ? `${(metrics.click_rate * 100).toFixed(1)}%` : '—'}
                  </Td>
                  <Td className="text-slate-400">
                    {campaign.sent_at ? formatRelativeDate(campaign.sent_at) : (
                      campaign.scheduled_at ? `Scheduled ${formatRelativeDate(campaign.scheduled_at)}` : '—'
                    )}
                  </Td>
                  <Td><ChevronRight className="h-4 w-4 text-slate-300" /></Td>
                </Tr>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
