import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Globe, Calendar, Edit2 } from 'lucide-react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LifecycleBadge, ConsentBadge, Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Table, TableHead, TableBody, Th, Tr, Td } from '@/components/ui/table'
import { MOCK_CONTACTS, MOCK_CONSENTS, MOCK_ACTIVITIES } from '@/lib/mock-data'
import { getFullName, getCountryFlag, getCountryName, formatDate, formatRelativeDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Contact' }

interface Props { params: Promise<{ id: string }> }

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params
  const contact = MOCK_CONTACTS.find(c => c.id === id)
  if (!contact) notFound()

  const consents = MOCK_CONSENTS.filter(c => c.contact_id === id)
  const activities = MOCK_ACTIVITIES.filter(a => a.contact_id === id)

  const activityIcons: Record<string, string> = {
    form_submitted: '📋',
    list_added: '📋',
    email_sent: '📧',
    email_opened: '👁',
    consent_updated: '🛡',
    note_added: '📝',
    deal_created: '💼',
    contact_created: '✨',
  }

  return (
    <div>
      <PageHeader
        title={getFullName(contact)}
        description={contact.email}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/contacts">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Contacts</Button>
            </Link>
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4" /> Edit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: profile + details */}
        <div className="space-y-4">
          {/* Profile card */}
          <Card>
            <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-slate-100">
              <Avatar
                firstName={contact.first_name}
                lastName={contact.last_name}
                email={contact.email}
                size="lg"
              />
              <div>
                <h2 className="font-semibold text-slate-900">{getFullName(contact)}</h2>
                <p className="text-sm text-slate-500">{contact.email}</p>
              </div>
              <LifecycleBadge stage={contact.lifecycle_stage} />
            </div>
            <div className="pt-4 space-y-3">
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {contact.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Globe className="h-4 w-4 text-slate-400" />
                {getCountryFlag(contact.residency_country)} {getCountryName(contact.residency_country)}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                Created {formatDate(contact.created_at)}
              </div>
            </div>
          </Card>

          {/* Properties */}
          <Card>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Details</h3>
            <dl className="space-y-2.5">
              {[
                ['Language', contact.preferred_language?.toUpperCase() ?? '—'],
                ['Timezone', contact.timezone ?? '—'],
                ['Currency', contact.currency ?? '—'],
                ['Market', contact.market ?? '—'],
                ['Source', contact.source?.replace(/_/g, ' ') ?? '—'],
                ['Last updated', formatRelativeDate(contact.updated_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="text-xs font-medium text-slate-700 capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        {/* Right: activity + consents */}
        <div className="lg:col-span-2 space-y-4">
          {/* Consents */}
          <Card padding={false}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Consents</h3>
              <Badge color="gray">{consents.length}</Badge>
            </div>
            {consents.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">No consent records</p>
            ) : (
              <Table>
                <TableHead>
                  <Th>Channel</Th>
                  <Th>Purpose</Th>
                  <Th>Status</Th>
                  <Th>Legal Basis</Th>
                  <Th>Country</Th>
                  <Th>Date</Th>
                </TableHead>
                <TableBody>
                  {consents.map(c => (
                    <Tr key={c.id}>
                      <Td className="capitalize font-medium">{c.channel}</Td>
                      <Td className="text-slate-500">{c.purpose ?? '—'}</Td>
                      <Td><ConsentBadge status={c.consent_status} /></Td>
                      <Td className="text-slate-500 text-xs">{c.legal_basis?.replace('_', ' ') ?? '—'}</Td>
                      <Td>
                        {c.consent_country && (
                          <span className="flex items-center gap-1">
                            <span>{getCountryFlag(c.consent_country)}</span>
                            <span className="text-slate-500">{c.consent_country}</span>
                          </span>
                        )}
                      </Td>
                      <Td className="text-slate-400 text-xs">
                        {c.consented_at ? formatDate(c.consented_at) : '—'}
                      </Td>
                    </Tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Activity timeline */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Activity</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet</p>
            ) : (
              <ol className="space-y-4">
                {activities.map(act => (
                  <li key={act.id} className="flex gap-3">
                    <div className="flex-shrink-0 text-lg leading-none mt-0.5">
                      {activityIcons[act.type] ?? '●'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{act.subject}</p>
                      {act.body && <p className="text-sm text-slate-500 mt-0.5">{act.body}</p>}
                      <p className="text-xs text-slate-400 mt-1">{formatRelativeDate(act.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
