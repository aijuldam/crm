'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/card'
import { SearchInput, FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { MOCK_COMPANIES } from '@/lib/mock-data'
import { EUROPEAN_COUNTRIES, INDUSTRIES } from '@/lib/constants'
import { getCountryFlag, formatRelativeDate } from '@/lib/utils'

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [industryFilter, setIndustryFilter] = useState('')

  const filtered = useMemo(() => {
    return MOCK_COMPANIES.filter(c => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
          !c.domain?.toLowerCase().includes(search.toLowerCase())) return false
      if (countryFilter && c.registered_country !== countryFilter) return false
      if (industryFilter && c.industry !== industryFilter) return false
      return true
    })
  }, [search, countryFilter, industryFilter])

  return (
    <div>
      <PageHeader
        title="Companies"
        description={`${MOCK_COMPANIES.length} companies`}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New Company
          </Button>
        }
      />

      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search companies…"
          className="w-72"
        />
        <FilterSelect
          label="All countries"
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
        >
          {EUROPEAN_COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="All industries"
          value={industryFilter}
          onChange={e => setIndustryFilter(e.target.value)}
        >
          {INDUSTRIES.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No companies found" description="Try adjusting your search or filters" />
      ) : (
        <Table>
          <TableHead>
            <Th>Company</Th>
            <Th>Country</Th>
            <Th>Industry</Th>
            <Th>Size</Th>
            <Th>VAT</Th>
            <Th>Contacts</Th>
            <Th>Added</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.map(company => (
              <Tr
                key={company.id}
                onClick={() => window.location.href = `/companies/${company.id}`}
              >
                <Td>
                  <div>
                    <p className="font-medium text-slate-900">{company.name}</p>
                    {company.domain && (
                      <p className="text-xs text-slate-400">{company.domain}</p>
                    )}
                  </div>
                </Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    {company.registered_country && (
                      <span>{getCountryFlag(company.registered_country)}</span>
                    )}
                    <span className="text-slate-600">{company.registered_country ?? '—'}</span>
                  </span>
                </Td>
                <Td className="text-slate-500">{company.industry ?? '—'}</Td>
                <Td>
                  {company.company_size ? (
                    <Badge color="gray">{company.company_size}</Badge>
                  ) : '—'}
                </Td>
                <Td>
                  {company.vat_number ? (
                    <div className="flex items-center gap-1.5">
                      {company.vat_validated_at
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                      <span className="text-xs text-slate-500 font-mono">{company.vat_number}</span>
                    </div>
                  ) : <span className="text-slate-300">—</span>}
                </Td>
                <Td>
                  <span className="font-medium tabular-nums">{company.contact_count ?? 0}</span>
                </Td>
                <Td className="text-slate-400">{formatRelativeDate(company.created_at)}</Td>
                <Td><ChevronRight className="h-4 w-4 text-slate-300" /></Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
