'use client'

import { useState, useMemo } from 'react'
import { Plus, ChevronRight, Zap, Pause, Archive, FileText, Play } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState, StatCard } from '@/components/ui/card'
import { FilterBar, FilterSelect, SearchInput } from '@/components/ui/search-filter'
import { MOCK_WORKFLOWS } from '@/lib/mock-data-automations'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { formatRelativeDate } from '@/lib/utils'
import type { WorkflowStatus, WorkflowCategory } from '@/lib/types/automations'

const STATUS_COLOR: Record<WorkflowStatus, 'green' | 'blue' | 'yellow' | 'gray'> = {
  active: 'green', paused: 'yellow', draft: 'gray', archived: 'gray',
}

const STATUS_ICON: Record<WorkflowStatus, React.ReactNode> = {
  active:   <Play className="h-3 w-3" />,
  paused:   <Pause className="h-3 w-3" />,
  draft:    <FileText className="h-3 w-3" />,
  archived: <Archive className="h-3 w-3" />,
}

const CATEGORY_COLOR: Record<WorkflowCategory, 'indigo' | 'green' | 'yellow' | 'blue' | 'purple' | 'gray'> = {
  welcome:          'indigo',
  nurture:          'green',
  reengagement:     'yellow',
  content_delivery: 'blue',
  transactional:    'purple',
  custom:           'gray',
}

export default function AutomationsPage() {
  const [search, setSearch]         = useState('')
  const [projectFilter, setProject] = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [categoryFilter, setCategory] = useState('')

  const filtered = useMemo(() => MOCK_WORKFLOWS.filter(w => {
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    if (projectFilter && w.project_id !== projectFilter) return false
    if (statusFilter  && w.status    !== statusFilter)   return false
    if (categoryFilter && w.category !== categoryFilter) return false
    return true
  }), [search, projectFilter, statusFilter, categoryFilter])

  const projectMap = Object.fromEntries(MOCK_PROJECTS.map(p => [p.id, p]))

  const activeCount    = MOCK_WORKFLOWS.filter(w => w.status === 'active').length
  const totalEnrolled  = MOCK_WORKFLOWS.reduce((s, w) => s + (w.enrollment_count ?? 0), 0)
  const avgCompletion  = MOCK_WORKFLOWS.reduce((s, w) => s + (w.completion_rate ?? 0), 0) / MOCK_WORKFLOWS.length

  return (
    <div>
      <PageHeader
        title="Automations"
        description={`${MOCK_WORKFLOWS.length} workflows`}
        actions={
          <Button size="sm" onClick={() => window.location.href = '/automations/new'}>
            <Plus className="h-4 w-4" /> New workflow
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total workflows"    value={MOCK_WORKFLOWS.length} />
        <StatCard label="Active"             value={activeCount} />
        <StatCard label="Total enrolled"     value={totalEnrolled.toLocaleString()} />
        <StatCard label="Avg completion rate" value={`${(avgCompletion * 100).toFixed(1)}%`} />
      </div>

      <FilterBar className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search workflows…" className="w-64" />
        <FilterSelect label="All projects" value={projectFilter} onChange={e => setProject(e.target.value)}>
          {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </FilterSelect>
        <FilterSelect label="All statuses" value={statusFilter} onChange={e => setStatus(e.target.value)}>
          {(['active', 'paused', 'draft', 'archived'] as WorkflowStatus[]).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="All categories" value={categoryFilter} onChange={e => setCategory(e.target.value)}>
          {(['welcome', 'nurture', 'reengagement', 'content_delivery', 'transactional', 'custom'] as WorkflowCategory[]).map(c => (
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          title="No workflows found"
          description="Adjust your filters or create your first automation"
          action={<Button size="sm" onClick={() => window.location.href = '/automations/new'}><Plus className="h-4 w-4" /> New workflow</Button>}
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Workflow</Th>
            <Th>Project</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Steps</Th>
            <Th>Enrolled</Th>
            <Th>Completion</Th>
            <Th>Updated</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.map(w => (
              <Tr key={w.id} onClick={() => window.location.href = `/automations/${w.id}`}>
                <Td>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900">{w.name}</p>
                      {w.description && (
                        <p className="text-xs text-slate-400 max-w-xs truncate">{w.description}</p>
                      )}
                    </div>
                  </div>
                </Td>
                <Td className="text-slate-500 text-sm">{projectMap[w.project_id]?.name ?? '—'}</Td>
                <Td>
                  <Badge color={CATEGORY_COLOR[w.category]}>
                    {w.category.replace(/_/g, ' ')}
                  </Badge>
                </Td>
                <Td>
                  <Badge color={STATUS_COLOR[w.status]}>
                    {STATUS_ICON[w.status]}{' '}{w.status}
                  </Badge>
                </Td>
                <Td className="tabular-nums text-sm text-slate-600">{w.steps?.length ?? 0}</Td>
                <Td className="tabular-nums font-medium">{w.enrollment_count?.toLocaleString() ?? '—'}</Td>
                <Td className="tabular-nums text-sm">
                  {w.completion_rate != null
                    ? <span className={w.completion_rate >= 0.7 ? 'text-emerald-600 font-medium' : 'text-slate-600'}>{(w.completion_rate * 100).toFixed(1)}%</span>
                    : '—'}
                </Td>
                <Td className="text-slate-400 text-sm">{formatRelativeDate(w.updated_at)}</Td>
                <Td><ChevronRight className="h-4 w-4 text-slate-300" /></Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
