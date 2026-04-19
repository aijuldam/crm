'use client'

import { useState, useMemo } from 'react'
import { Plus, Users, CheckCircle, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SearchInput, FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { MOCK_LISTS, MOCK_PROJECTS } from '@/lib/mock-data'
import { formatRelativeDate } from '@/lib/utils'

export default function ListsPage() {
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    return MOCK_LISTS.filter(l => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false
      if (projectFilter && l.project_id !== projectFilter) return false
      if (statusFilter === 'active' && !l.is_active) return false
      if (statusFilter === 'inactive' && l.is_active) return false
      return true
    })
  }, [search, projectFilter, statusFilter])

  const totalContacts = MOCK_LISTS.reduce((sum, l) => sum + (l.contact_count ?? 0), 0)

  return (
    <div>
      <PageHeader
        title="Lists"
        description={`${MOCK_LISTS.length} lists · ${totalContacts.toLocaleString('en-GB')} total subscribers`}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New List
          </Button>
        }
      />

      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search lists…"
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
        <FilterSelect
          label="All statuses"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>
      </FilterBar>

      <Table>
        <TableHead>
          <Th>List</Th>
          <Th>Project</Th>
          <Th>Subscribers</Th>
          <Th>Status</Th>
          <Th>Updated</Th>
        </TableHead>
        <TableBody>
          {filtered.map(list => (
            <Tr key={list.id}>
              <Td>
                <div>
                  <p className="font-medium text-slate-900">{list.name}</p>
                  {list.description && (
                    <p className="text-xs text-slate-400">{list.description}</p>
                  )}
                </div>
              </Td>
              <Td>
                {list.project && (
                  <Badge color="gray">{list.project.name}</Badge>
                )}
              </Td>
              <Td>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium tabular-nums">
                    {(list.contact_count ?? 0).toLocaleString('en-GB')}
                  </span>
                </span>
              </Td>
              <Td>
                {list.is_active ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
                    <CheckCircle className="h-4 w-4" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <XCircle className="h-4 w-4" /> Inactive
                  </span>
                )}
              </Td>
              <Td className="text-slate-400">{formatRelativeDate(list.updated_at)}</Td>
            </Tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
