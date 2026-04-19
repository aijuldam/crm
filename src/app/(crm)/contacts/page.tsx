'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { UserPlus, Upload, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { LifecycleBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput, FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { EmptyState } from '@/components/ui/card'
import { MOCK_CONTACTS, MOCK_PROJECTS } from '@/lib/mock-data'
import { EUROPEAN_COUNTRIES, LIFECYCLE_STAGES } from '@/lib/constants'
import { getFullName, getCountryFlag, formatRelativeDate } from '@/lib/utils'

const PER_PAGE = 20

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [lifecycleFilter, setLifecycleFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return MOCK_CONTACTS.filter(c => {
      if (search) {
        const q = search.toLowerCase()
        const name = getFullName(c).toLowerCase()
        if (!name.includes(q) && !c.email.includes(q)) return false
      }
      if (lifecycleFilter && c.lifecycle_stage !== lifecycleFilter) return false
      if (countryFilter && c.residency_country !== countryFilter) return false
      return true
    })
  }, [search, projectFilter, lifecycleFilter, countryFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${MOCK_CONTACTS.length.toLocaleString('en-GB')} contacts across all projects`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
            <Link href="/contacts/new">
              <Button size="sm">
                <UserPlus className="h-4 w-4" /> New Contact
              </Button>
            </Link>
          </>
        }
      />

      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={v => { setSearch(v); setPage(1) }}
          placeholder="Search by name or email…"
          className="w-72"
        />
        <FilterSelect
          label="All projects"
          value={projectFilter}
          onChange={e => { setProjectFilter(e.target.value); setPage(1) }}
        >
          {MOCK_PROJECTS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="All stages"
          value={lifecycleFilter}
          onChange={e => { setLifecycleFilter(e.target.value); setPage(1) }}
        >
          {LIFECYCLE_STAGES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="All countries"
          value={countryFilter}
          onChange={e => { setCountryFilter(e.target.value); setPage(1) }}
        >
          {EUROPEAN_COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {paginated.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Contact</Th>
            <Th>Lifecycle</Th>
            <Th>Country</Th>
            <Th>Language</Th>
            <Th>Source</Th>
            <Th>Created</Th>
            <Th />
          </TableHead>
          <TableBody>
            {paginated.map(contact => (
              <Tr
                key={contact.id}
                onClick={() => window.location.href = `/contacts/${contact.id}`}
              >
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar
                      firstName={contact.first_name}
                      lastName={contact.last_name}
                      email={contact.email}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {getFullName(contact)}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{contact.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><LifecycleBadge stage={contact.lifecycle_stage} /></Td>
                <Td>
                  <span className="flex items-center gap-1.5">
                    {contact.residency_country && (
                      <span className="text-base leading-none">{getCountryFlag(contact.residency_country)}</span>
                    )}
                    <span className="text-slate-600">{contact.residency_country ?? '—'}</span>
                  </span>
                </Td>
                <Td className="uppercase text-slate-500">{contact.preferred_language ?? '—'}</Td>
                <Td className="text-slate-500 capitalize">{contact.source?.replace(/_/g, ' ') ?? '—'}</Td>
                <Td className="text-slate-400">{formatRelativeDate(contact.created_at)}</Td>
                <Td>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Td>
              </Tr>
            ))}
          </TableBody>
          <Pagination
            page={page}
            total={filtered.length}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        </Table>
      )}
    </div>
  )
}
