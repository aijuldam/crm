'use client'

import { FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { EUROPEAN_COUNTRIES, LANGUAGES } from '@/lib/constants'
import type { ReportFilters } from '@/lib/types/campaigns'

interface ReportFiltersProps {
  filters: ReportFilters
  onChange: (f: ReportFilters) => void
}

export function ReportFilterBar({ filters, onChange }: ReportFiltersProps) {
  function set<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    onChange({ ...filters, [key]: value || undefined })
  }

  return (
    <FilterBar className="mb-6 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 font-medium">From</label>
        <input
          type="date"
          value={filters.date_from ?? ''}
          onChange={e => set('date_from', e.target.value)}
          className="text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 font-medium">To</label>
        <input
          type="date"
          value={filters.date_to ?? ''}
          onChange={e => set('date_to', e.target.value)}
          className="text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <FilterSelect
        label="All projects"
        value={filters.project_id ?? ''}
        onChange={e => set('project_id', e.target.value)}
      >
        {MOCK_PROJECTS.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="All countries"
        value={filters.country ?? ''}
        onChange={e => set('country', e.target.value)}
      >
        {EUROPEAN_COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="All languages"
        value={filters.language ?? ''}
        onChange={e => set('language', e.target.value)}
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="All types"
        value={filters.campaign_type ?? ''}
        onChange={e => set('campaign_type', e.target.value as ReportFilters['campaign_type'])}
      >
        <option value="one_off">One-off</option>
        <option value="automated">Automated</option>
      </FilterSelect>
      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.compare_previous ?? false}
          onChange={e => set('compare_previous', e.target.checked)}
          className="rounded border-slate-300"
        />
        Compare to previous period
      </label>
    </FilterBar>
  )
}
