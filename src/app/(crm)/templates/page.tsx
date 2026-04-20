'use client'

import { useState, useMemo } from 'react'
import { Plus, LayoutTemplate } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/card'
import { FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { MOCK_TEMPLATES } from '@/lib/mock-data-campaigns'
import { formatRelativeDate } from '@/lib/utils'
import type { TemplateCategory } from '@/lib/types/campaigns'

const CATEGORY_COLOR: Record<TemplateCategory, 'blue' | 'green' | 'yellow' | 'purple' | 'indigo' | 'gray'> = {
  newsletter: 'blue',
  promotional: 'green',
  transactional: 'yellow',
  winback: 'purple',
  welcome: 'indigo',
  blank: 'gray',
}

export default function TemplatesPage() {
  const [categoryFilter, setCategoryFilter] = useState('')

  const filtered = useMemo(() => {
    return MOCK_TEMPLATES.filter(t => {
      if (categoryFilter && t.category !== categoryFilter) return false
      return true
    })
  }, [categoryFilter])

  return (
    <div>
      <PageHeader
        title="Templates"
        description={`${MOCK_TEMPLATES.length} email templates`}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New template
          </Button>
        }
      />

      <FilterBar className="mb-6">
        <FilterSelect
          label="All categories"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          {(['newsletter', 'promotional', 'transactional', 'winback', 'welcome', 'blank'] as TemplateCategory[]).map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No templates found" description="Try adjusting the category filter" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(template => (
            <a
              key={template.id}
              href={`/templates/${template.id}`}
              className="block border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-sm transition-all group"
            >
              {/* Thumbnail / placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-slate-100">
                {template.thumbnail_url ? (
                  <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                  <LayoutTemplate className="h-10 w-10 text-slate-300 group-hover:text-indigo-300 transition-colors" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {template.name}
                  </p>
                  <Badge color={CATEGORY_COLOR[template.category]}>{template.category}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-2">{formatRelativeDate(template.updated_at)}</p>
                <p className="text-xs text-slate-400">{template.blocks.length} block{template.blocks.length !== 1 ? 's' : ''}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
