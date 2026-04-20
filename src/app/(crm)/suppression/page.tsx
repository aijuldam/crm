'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState, StatCard } from '@/components/ui/card'
import { FilterBar, FilterSelect, SearchInput } from '@/components/ui/search-filter'
import { MOCK_SUPPRESSIONS, MOCK_BOUNCES, MOCK_COMPLAINTS } from '@/lib/mock-data-campaigns'
import { formatDate } from '@/lib/utils'
import type { SuppressionReason, SuppressionScope } from '@/lib/types/campaigns'

const REASON_COLOR: Record<SuppressionReason, 'red' | 'yellow' | 'gray' | 'blue' | 'amber' | 'purple'> = {
  hard_bounce: 'red',
  complaint: 'red',
  manual: 'gray',
  unsubscribed: 'yellow',
  role_address: 'blue',
  invalid_email: 'amber',
  gdpr_erasure: 'purple',
}

const SCOPE_COLOR: Record<SuppressionScope, 'gray' | 'blue' | 'yellow'> = {
  global: 'gray',
  project: 'blue',
  list: 'yellow',
}

export default function SuppressionPage() {
  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newReason, setNewReason] = useState<SuppressionReason>('manual')
  const [suppressions, setSuppressions] = useState(MOCK_SUPPRESSIONS)

  const filtered = useMemo(() => {
    return suppressions.filter(s => {
      if (search && !s.email_normalized.includes(search.toLowerCase())) return false
      if (scopeFilter && s.scope !== scopeFilter) return false
      if (reasonFilter && s.reason !== reasonFilter) return false
      return true
    })
  }, [search, scopeFilter, reasonFilter, suppressions])

  async function handleAdd() {
    if (!newEmail) return
    const res = await fetch('/api/suppression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, reason: newReason }),
    })
    const data = await res.json()
    if (data.suppression) {
      setSuppressions(prev => [data.suppression, ...prev])
    }
    setShowAddModal(false)
    setNewEmail('')
  }

  async function handleRemove(id: string) {
    await fetch(`/api/suppression?id=${id}`, { method: 'DELETE' })
    setSuppressions(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div>
      <PageHeader
        title="Suppression center"
        description="Manage addresses that should never receive email"
        actions={
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" /> Add suppression
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total suppressed" value={suppressions.length} />
        <StatCard label="Hard bounces" value={MOCK_BOUNCES.filter(b => b.bounce_type === 'hard').length} />
        <StatCard label="Complaints" value={MOCK_COMPLAINTS.length} />
        <StatCard label="Global" value={suppressions.filter(s => s.scope === 'global').length} />
      </div>

      <FilterBar className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search email…"
          className="w-64"
        />
        <FilterSelect label="All scopes" value={scopeFilter} onChange={e => setScopeFilter(e.target.value)}>
          <option value="global">Global</option>
          <option value="project">Project</option>
          <option value="list">List</option>
        </FilterSelect>
        <FilterSelect label="All reasons" value={reasonFilter} onChange={e => setReasonFilter(e.target.value)}>
          {(['hard_bounce', 'complaint', 'manual', 'unsubscribed', 'role_address', 'invalid_email', 'gdpr_erasure'] as SuppressionReason[]).map(r => (
            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
          ))}
        </FilterSelect>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState title="No suppressions found" description="Adjust your search or filters" />
      ) : (
        <Table>
          <TableHead>
            <Th>Email</Th>
            <Th>Scope</Th>
            <Th>Reason</Th>
            <Th>Notes</Th>
            <Th>Added</Th>
            <Th />
          </TableHead>
          <TableBody>
            {filtered.map(s => (
              <Tr key={s.id}>
                <Td><span className="font-mono text-sm text-slate-700">{s.email_normalized}</span></Td>
                <Td><Badge color={SCOPE_COLOR[s.scope]}>{s.scope}</Badge></Td>
                <Td><Badge color={REASON_COLOR[s.reason]}>{s.reason.replace(/_/g, ' ')}</Badge></Td>
                <Td className="text-slate-400 text-sm">{s.notes ?? '—'}</Td>
                <Td className="text-slate-400 text-sm">{formatDate(s.added_at)}</Td>
                <Td>
                  <button
                    onClick={() => handleRemove(s.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Remove suppression"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Td>
              </Tr>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Add suppression</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <select
                  value={newReason}
                  onChange={e => setNewReason(e.target.value as SuppressionReason)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {(['manual', 'hard_bounce', 'complaint', 'unsubscribed', 'role_address', 'invalid_email', 'gdpr_erasure'] as SuppressionReason[]).map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} disabled={!newEmail}>Add</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
