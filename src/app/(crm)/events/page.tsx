'use client'

import { useState, useMemo } from 'react'
import { Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { EmptyState, StatCard, Card } from '@/components/ui/card'
import { FilterBar, FilterSelect, SearchInput } from '@/components/ui/search-filter'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { MOCK_EVENTS } from '@/lib/mock-data-automations'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import type { EventType, EventSource } from '@/lib/types/automations'

const EVENT_TYPE_COLOR: Partial<Record<EventType, 'indigo' | 'green' | 'blue' | 'yellow' | 'amber' | 'gray' | 'purple' | 'red'>> = {
  form_submitted:    'indigo',
  quiz_completed:    'green',
  guide_downloaded:  'blue',
  page_viewed:       'gray',
  form_started:      'yellow',
  form_abandoned:    'amber',
  contact_inactive:  'gray',
  link_clicked:      'purple',
  email_opened:      'blue',
  purchase_completed:'green',
  custom:            'gray',
}

const SOURCE_COLOR: Record<EventSource, 'blue' | 'green' | 'indigo' | 'gray' | 'yellow'> = {
  api:      'blue',
  webhook:  'green',
  sdk:      'indigo',
  import:   'gray',
  internal: 'yellow',
}

export default function EventsPage() {
  const [search, setSearch]           = useState('')
  const [projectFilter, setProject]   = useState('')
  const [typeFilter, setType]         = useState('')
  const [sourceFilter, setSource]     = useState('')
  const [expandedId, setExpandedId]   = useState<string | null>(null)

  const filtered = useMemo(() => {
    const sorted = [...MOCK_EVENTS].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    return sorted.filter(e => {
      if (projectFilter && e.project_id !== projectFilter) return false
      if (typeFilter    && e.event_type  !== typeFilter)   return false
      if (sourceFilter  && e.source      !== sourceFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const propsStr = JSON.stringify(e.properties).toLowerCase()
        if (!e.email?.includes(q) && !e.contact_id?.includes(q) && !propsStr.includes(q)) return false
      }
      return true
    })
  }, [search, projectFilter, typeFilter, sourceFilter])

  const projectMap = Object.fromEntries(MOCK_PROJECTS.map(p => [p.id, p]))

  // Stats
  const byType = MOCK_EVENTS.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1
    return acc
  }, {})
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]

  return (
    <div>
      <PageHeader
        title="Event explorer"
        description="Browse and debug all contact events ingested into the platform"
        actions={
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500">Live ingestion active</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total events"    value={MOCK_EVENTS.length} />
        <StatCard label="Event types"     value={Object.keys(byType).length} />
        <StatCard label="Top event type"  value={topType?.[0]?.replace(/_/g, ' ') ?? '—'} />
        <StatCard label="With contact ID" value={MOCK_EVENTS.filter(e => e.contact_id).length} />
      </div>

      {/* Type breakdown */}
      <Card className="p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Event type distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setType(typeFilter === type ? '' : type)}
              className={`p-3 rounded-lg border text-left transition-colors ${typeFilter === type ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <p className="text-lg font-semibold text-slate-800 tabular-nums">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{type.replace(/_/g, ' ')}</p>
            </button>
          ))}
        </div>
      </Card>

      <FilterBar className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search email, contact, properties…" className="w-72" />
        <FilterSelect label="All projects" value={projectFilter} onChange={e => setProject(e.target.value)}>
          {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </FilterSelect>
        <FilterSelect label="All event types" value={typeFilter} onChange={e => setType(e.target.value)}>
          {(Object.keys(byType) as EventType[]).map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="All sources" value={sourceFilter} onChange={e => setSource(e.target.value)}>
          {(['api', 'webhook', 'sdk', 'import', 'internal'] as EventSource[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No events found" description="Try adjusting your filters" />
      ) : (
        <Table>
          <TableHead>
            <Th>Time</Th>
            <Th>Event type</Th>
            <Th>Project</Th>
            <Th>Contact / Email</Th>
            <Th>Source</Th>
            <Th>Properties</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.map(event => {
              const expanded = expandedId === event.id
              const propKeys = Object.keys(event.properties)
              return (
                <>
                  <Tr key={event.id} onClick={() => setExpandedId(expanded ? null : event.id)}>
                    <Td className="tabular-nums text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(event.occurred_at)}
                    </Td>
                    <Td>
                      <Badge color={EVENT_TYPE_COLOR[event.event_type] ?? 'gray'}>
                        {event.event_type.replace(/_/g, ' ')}
                      </Badge>
                    </Td>
                    <Td className="text-slate-500 text-sm">{projectMap[event.project_id]?.name ?? event.project_id.slice(-8)}</Td>
                    <Td>
                      <span className="font-mono text-xs text-slate-700">
                        {event.email ?? (event.contact_id ? event.contact_id.slice(-8) : <span className="text-slate-300">anonymous</span>)}
                      </span>
                    </Td>
                    <Td>
                      <Badge color={SOURCE_COLOR[event.source]}>{event.source}</Badge>
                    </Td>
                    <Td className="text-xs text-slate-400 max-w-xs truncate">
                      {propKeys.length > 0
                        ? propKeys.slice(0, 3).map(k => `${k}: ${String(event.properties[k])}`).join(' · ')
                        : '—'}
                    </Td>
                    <Td>
                      {propKeys.length > 0 && (
                        expanded
                          ? <ChevronUp className="h-4 w-4 text-slate-400" />
                          : <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </Td>
                  </Tr>
                  {expanded && (
                    <tr key={`${event.id}-expanded`} className="bg-slate-50">
                      <td colSpan={7} className="px-5 py-3">
                        <div className="font-mono text-xs text-slate-600 space-y-0.5">
                          <p className="font-semibold text-slate-400 mb-2">Event properties</p>
                          {Object.entries(event.properties).map(([k, v]) => (
                            <div key={k} className="flex gap-3">
                              <span className="text-indigo-600 w-32 shrink-0">{k}</span>
                              <span>{JSON.stringify(v)}</span>
                            </div>
                          ))}
                          {event.session_id && (
                            <div className="flex gap-3 mt-1">
                              <span className="text-slate-400 w-32 shrink-0">session_id</span>
                              <span>{event.session_id}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
