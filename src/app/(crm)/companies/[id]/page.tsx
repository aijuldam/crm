import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Globe, Building2, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOCK_COMPANIES, MOCK_CONTACTS } from '@/lib/mock-data'
import { getCountryFlag, getCountryName, formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Company' }

interface Props { params: Promise<{ id: string }> }

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params
  const company = MOCK_COMPANIES.find(c => c.id === id)
  if (!company) notFound()

  const contacts = MOCK_CONTACTS.filter(c => c.residency_country === company.registered_country).slice(0, 5)

  return (
    <div>
      <PageHeader
        title={company.name}
        description={company.domain ?? 'No domain'}
        actions={
          <Link href="/companies">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Companies</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                {getCountryFlag(company.registered_country)}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{company.name}</h2>
                {company.domain && <p className="text-sm text-slate-400">{company.domain}</p>}
              </div>
            </div>
            <dl className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-400">Registered country</dt>
                <dd className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  {getCountryFlag(company.registered_country)} {getCountryName(company.registered_country)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-400">Billing country</dt>
                <dd className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  {getCountryFlag(company.billing_country)} {getCountryName(company.billing_country)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-400">Industry</dt>
                <dd className="text-sm font-medium text-slate-700">{company.industry ?? '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-400">Company size</dt>
                <dd><Badge color="gray">{company.company_size ?? '—'}</Badge></dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">VAT</h3>
            {company.vat_number ? (
              <div className="space-y-2">
                <p className="font-mono text-sm text-slate-900">{company.vat_number}</p>
                {company.vat_validated_at ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Validated {formatDate(company.vat_validated_at)}
                  </div>
                ) : (
                  <p className="text-xs text-amber-600">Not yet validated</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No VAT number on file</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Associated Contacts ({company.contact_count ?? 0})
            </h3>
            {contacts.length === 0 ? (
              <p className="text-sm text-slate-400">No contacts linked to this company</p>
            ) : (
              <ul className="space-y-2">
                {contacts.map(c => (
                  <li key={c.id}>
                    <Link
                      href={`/contacts/${c.id}`}
                      className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}
                        </p>
                        <p className="text-xs text-slate-400">{c.email}</p>
                      </div>
                      <Badge color={c.lifecycle_stage === 'customer' ? 'green' : 'blue'}>
                        {c.lifecycle_stage}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
