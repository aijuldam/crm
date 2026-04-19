'use client'

import { useState, useMemo } from 'react'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SearchInput, FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { MOCK_FORMS, MOCK_PROJECTS } from '@/lib/mock-data'
import { formatRelativeDate } from '@/lib/utils'

export default function FormsPage() {
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')

  const filtered = useMemo(() => {
    return MOCK_FORMS.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
      if (projectFilter && f.project_id !== projectFilter) return false
      return true
    })
  }, [search, projectFilter])

  return (
    <div>
      <PageHeader
        title="Forms"
        description="Ingestion forms for contact capture and consent collection"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New Form
          </Button>
        }
      />

      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search forms…"
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
          <Th>Form</Th>
          <Th>Project</Th>
          <Th>Fields</Th>
          <Th>Submissions</Th>
          <Th>Status</Th>
          <Th>Updated</Th>
        </TableHead>
        <TableBody>
          {filtered.map(form => (
            <Tr key={form.id}>
              <Td>
                <div>
                  <p className="font-medium text-slate-900">{form.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{form.slug}</p>
                </div>
              </Td>
              <Td>
                {form.project && (
                  <Badge color="gray">{form.project.name}</Badge>
                )}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {form.fields.map(field => (
                    <span
                      key={field.id}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
                    >
                      {field.name}
                      {field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </span>
                  ))}
                </div>
              </Td>
              <Td>
                <span className="font-medium tabular-nums text-slate-900">
                  {(form.submission_count ?? 0).toLocaleString('en-GB')}
                </span>
              </Td>
              <Td>
                {form.is_active ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
                    <CheckCircle className="h-4 w-4" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <XCircle className="h-4 w-4" /> Inactive
                  </span>
                )}
              </Td>
              <Td className="text-slate-400">{formatRelativeDate(form.updated_at)}</Td>
            </Tr>
          ))}
        </TableBody>
      </Table>

      {/* Extension point note */}
      <div className="mt-6 rounded-xl border border-dashed border-indigo-200 bg-indigo-50 p-5">
        <h3 className="text-sm font-semibold text-indigo-800 mb-1">Extension point: Form builder</h3>
        <p className="text-sm text-indigo-600">
          Phase 2 will add a drag-and-drop form builder, live preview, A/B testing, multi-step forms,
          and conditional logic. Forms will auto-generate consent records on submission.
        </p>
      </div>
    </div>
  )
}
