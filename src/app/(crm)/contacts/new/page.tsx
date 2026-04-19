'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { EUROPEAN_COUNTRIES, LANGUAGES, LIFECYCLE_STAGES, CONTACT_SOURCES, TIMEZONES, CURRENCIES } from '@/lib/constants'

export default function NewContactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    country_code: '',
    residency_country: '',
    preferred_language: 'en',
    timezone: '',
    currency: 'EUR',
    market: '',
    lifecycle_stage: 'lead',
    source: '',
    project_id: '',
  })

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to create contact')
      const data = await res.json()
      router.push(`/contacts/${data.id}`)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="New Contact"
        description="Add a new contact to your CRM"
        actions={
          <Link href="/contacts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
        {/* Identity */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              value={form.first_name}
              onChange={e => set('first_name', e.target.value)}
            />
            <Input
              label="Last name"
              value={form.last_name}
              onChange={e => set('last_name', e.target.value)}
            />
            <Input
              label="Email address"
              type="email"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="col-span-2"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+31 6 12345678"
            />
          </div>
        </Card>

        {/* Location & Language */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Location & Language</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Residency country"
              value={form.residency_country}
              onChange={e => set('residency_country', e.target.value)}
            >
              <option value="">Select country…</option>
              {EUROPEAN_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </Select>
            <Select
              label="Country code (dialling)"
              value={form.country_code}
              onChange={e => set('country_code', e.target.value)}
            >
              <option value="">Same as residency</option>
              {EUROPEAN_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </Select>
            <Select
              label="Preferred language"
              value={form.preferred_language}
              onChange={e => set('preferred_language', e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </Select>
            <Select
              label="Timezone"
              value={form.timezone}
              onChange={e => set('timezone', e.target.value)}
            >
              <option value="">Select timezone…</option>
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </Select>
            <Input
              label="Market"
              value={form.market}
              onChange={e => set('market', e.target.value)}
              placeholder="e.g. NL, FR, DACH"
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={e => set('currency', e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </Select>
          </div>
        </Card>

        {/* CRM fields */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">CRM Classification</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Lifecycle stage"
              value={form.lifecycle_stage}
              onChange={e => set('lifecycle_stage', e.target.value)}
            >
              {LIFECYCLE_STAGES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
            <Select
              label="Source"
              value={form.source}
              onChange={e => set('source', e.target.value)}
            >
              <option value="">Select source…</option>
              {CONTACT_SOURCES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>
            <Select
              label="Assign to project"
              value={form.project_id}
              onChange={e => set('project_id', e.target.value)}
            >
              <option value="">No project…</option>
              {MOCK_PROJECTS.filter(p => p.is_active).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={loading}>
            <Save className="h-4 w-4" /> Create Contact
          </Button>
          <Link href="/contacts">
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
