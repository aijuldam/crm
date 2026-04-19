'use client'

import { useState, useMemo } from 'react'
import { Plus, Users, Filter } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SearchInput, FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { MOCK_SEGMENTS, MOCK_PROJECTS } from '@/lib/mock-data'
import { formatRelativeDate } from '@/lib/utils'

export default function SegmentsPage() {
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')

  const filtered = useMemo(() => {
    return MOCK_SEGMENTS.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (projectFilter && s.project_id !== projectFilter) return false
      return true
    })
  }, [search, projectFilter])

  return (
    <div>
      <PageHeader
        title="Segments"
        description="Dynamic groups built from contact conditions. Used for targeting and campaign filtering."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New Segment
          </Button>
        }
      />

      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search segments…"
          className="w-64"
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
      </FilterBar>

      <Table>
        <TableHead>
          <Th>Segment</Th>
          <Th>Project</Th>
          <Th>Conditions</Th>
          <Th>Contacts</Th>
          <Th>Status</Th>
          <Th>Updated</Th>
        </TableHead>
        <TableBody>
          {filtered.map(segment => (
            <Tr key={segment.id}>
              <Td>
                <div>
                  <p className="font-medium text-slate-900">{segment.name}</p>
                  {segment.description && (
                    <p className="text-xs text-slate-400">{segment.description}</p>
                  )}
                </div>
              </Td>
              <Td>
                {segment.project && (
                  <Badge color="gray">{segment.project.name}</Badge>
                )}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {segment.conditions.map((cond, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-600"
                    >
                      <Filter className="h-2.5 w-2.5" />
                      {cond.field} {cond.operator} {String(cond.value)}
                    </span>
                  ))}
                </div>
              </Td>
              <Td>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium tabular-nums">
                    {(segment.contact_count ?? 0).toLocaleString('en-GB')}
                  </span>
                </span>
              </Td>
              <Td>
                <Badge color={segment.is_active ? 'green' : 'gray'}>
                  {segment.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Td>
              <Td className="text-slate-400">{formatRelativeDate(segment.updated_at)}</Td>
            </Tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
