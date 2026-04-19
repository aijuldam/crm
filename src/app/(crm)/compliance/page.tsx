'use client'

import { useState, useMemo } from 'react'
import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, StatCard } from '@/components/ui/card'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { ConsentBadge, Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { SearchInput, FilterBar, FilterSelect } from '@/components/ui/search-filter'
import { MOCK_CONSENTS, MOCK_PROJECTS } from '@/lib/mock-data'
import { LEGAL_BASES, CONSENT_STATUSES } from '@/lib/constants'
import { getFullName, getCountryFlag, formatDate } from '@/lib/utils'

export default function CompliancePage() {
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [legalBasisFilter, setLegalBasisFilter] = useState('')

  const filtered = useMemo(() => {
    return MOCK_CONSENTS.filter(c => {
      if (projectFilter && c.project_id !== projectFilter) return false
      if (statusFilter && c.consent_status !== statusFilter) return false
      if (legalBasisFilter && c.legal_basis !== legalBasisFilter) return false
      if (search && c.contact) {
        const name = getFullName(c.contact).toLowerCase()
        if (!name.includes(search.toLowerCase()) && !c.contact.email.includes(search.toLowerCase())) return false
      }
      return true
    })
  }, [search, projectFilter, statusFilter, legalBasisFilter])

  const optedIn = MOCK_CONSENTS.filter(c => c.consent_status === 'opted_in').length
  const optedOut = MOCK_CONSENTS.filter(c => c.consent_status === 'opted_out').length
  const pending = MOCK_CONSENTS.filter(c => c.consent_status === 'pending').length
  const unsubscribed = MOCK_CONSENTS.filter(c => c.consent_status === 'unsubscribed').length
  const total = MOCK_CONSENTS.length

  return (
    <div>
      <PageHeader
        title="Consent & Compliance"
        description="GDPR-compliant consent records with full audit trail. All channels, all projects."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard
          label="Opted In"
          value={optedIn}
          change={`${Math.round((optedIn / total) * 100)}% of records`}
          changeType="positive"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Pending"
          value={pending}
          change="Awaiting confirmation"
          changeType="neutral"
        />
        <StatCard
          label="Opted Out"
          value={optedOut}
          change="Must not be contacted"
          changeType="negative"
        />
        <StatCard
          label="Unsubscribed"
          value={unsubscribed}
          change="Self-removed from lists"
          changeType="neutral"
        />
      </div>

      {/* Filters */}
      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by contact…"
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
          {CONSENT_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="All legal bases"
          value={legalBasisFilter}
          onChange={e => setLegalBasisFilter(e.target.value)}
        >
          {LEGAL_BASES.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {/* Consent table */}
      <Table>
        <TableHead>
          <Th>Contact</Th>
          <Th>Project</Th>
          <Th>Channel</Th>
          <Th>Status</Th>
          <Th>Legal Basis</Th>
          <Th>Country / Language</Th>
          <Th>Privacy Notice</Th>
          <Th>Consented At</Th>
          <Th>Withdrawn At</Th>
        </TableHead>
        <TableBody>
          {filtered.map(consent => (
            <Tr key={consent.id}>
              <Td>
                {consent.contact ? (
                  <div className="flex items-center gap-2">
                    <Avatar
                      firstName={consent.contact.first_name}
                      lastName={consent.contact.last_name}
                      email={consent.contact.email}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-xs truncate">
                        {getFullName(consent.contact)}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{consent.contact.email}</p>
                    </div>
                  </div>
                ) : consent.contact_id}
              </Td>
              <Td>
                {consent.project && (
                  <Badge color="gray">{consent.project.name}</Badge>
                )}
              </Td>
              <Td className="capitalize font-medium">{consent.channel}</Td>
              <Td><ConsentBadge status={consent.consent_status} /></Td>
              <Td className="text-xs text-slate-500 max-w-[140px] truncate">
                {consent.legal_basis?.replace('_', ' ') ?? '—'}
              </Td>
              <Td>
                <span className="flex items-center gap-1">
                  <span>{getCountryFlag(consent.consent_country)}</span>
                  <span className="text-slate-500 text-xs">
                    {consent.consent_country ?? '—'} / {consent.consent_language?.toUpperCase() ?? '—'}
                  </span>
                </span>
              </Td>
              <Td className="text-xs font-mono text-slate-500">
                v{consent.privacy_notice_version ?? '—'}
              </Td>
              <Td className="text-xs text-slate-500">
                {formatDate(consent.consented_at)}
              </Td>
              <Td className="text-xs text-slate-500">
                {consent.withdrawn_at ? formatDate(consent.withdrawn_at) : '—'}
              </Td>
            </Tr>
          ))}
        </TableBody>
      </Table>

      {/* GDPR info card */}
      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">GDPR Compliance Notes</h3>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>• Every consent record stores the exact legal basis, privacy notice version, and consent text version used at the time of collection.</li>
              <li>• Country and language are captured per consent event, not inherited from the contact, to support multi-jurisdiction records.</li>
              <li>• Withdrawn consent is never deleted — the <code className="bg-slate-100 px-1 rounded">withdrawn_at</code> timestamp is the audit trail.</li>
              <li>• Source page and source form are logged for traceability to the exact collection touchpoint.</li>
              <li>• Phase 2 extension: automated Right-to-Erasure workflows, data export (Art. 20), and DPA management.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
