'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BlockEditor } from '@/components/campaigns/block-editor'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { MOCK_TEMPLATES } from '@/lib/mock-data-campaigns'
import { cn } from '@/lib/utils'
import type { Block, CampaignAudience } from '@/lib/types/campaigns'

const STEPS = ['Basics', 'Audience', 'Content', 'Schedule', 'Review']

// ─── Step 1: Basics ───────────────────────────────────────────────────────────

function StepBasics({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  function set(key: string, val: string) { onChange({ ...data, [key]: val }) }
  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Campaign name</label>
        <input
          value={data.name ?? ''}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. May Newsletter"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
        <select
          value={data.project_id ?? ''}
          onChange={e => set('project_id', e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a project…</option>
          {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email type</label>
          <select
            value={data.email_type ?? 'marketing'}
            onChange={e => set('email_type', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="marketing">Marketing</option>
            <option value="operational">Operational / Transactional</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
          <select
            value={data.language ?? 'en'}
            onChange={e => set('language', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="nl">Dutch</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
            <option value="it">Italian</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">From name</label>
          <input
            value={data.from_name ?? ''}
            onChange={e => set('from_name', e.target.value)}
            placeholder="Your Brand"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">From email</label>
          <input
            type="email"
            value={data.from_email ?? ''}
            onChange={e => set('from_email', e.target.value)}
            placeholder="hello@yourmail.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Audience ─────────────────────────────────────────────────────────

function StepAudience({ audience, onChange }: { audience: CampaignAudience; onChange: (a: CampaignAudience) => void }) {
  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Audience type</label>
        <div className="grid grid-cols-3 gap-3">
          {(['list', 'segment', 'manual'] as const).map(type => (
            <button
              key={type}
              onClick={() => onChange({ type })}
              className={cn(
                'p-3 border rounded-lg text-sm font-medium capitalize transition-colors',
                audience.type === type
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-500">
        {audience.type === 'list' && 'Send to all eligible contacts in a specific list.'}
        {audience.type === 'segment' && 'Send to contacts matching a saved segment filter.'}
        {audience.type === 'manual' && 'Upload a CSV or paste email addresses to send to a custom set.'}
      </p>
    </div>
  )
}

// ─── Step 3: Content ──────────────────────────────────────────────────────────

function StepContent({
  blocks, onBlocksChange, subject, preheader, onSubjectChange, onPreheaderChange, templateId, onTemplateChange,
}: {
  blocks: Block[]
  onBlocksChange: (b: Block[]) => void
  subject: string
  preheader: string
  onSubjectChange: (v: string) => void
  onPreheaderChange: (v: string) => void
  templateId: string
  onTemplateChange: (id: string) => void
}) {
  return (
    <div className="flex flex-col h-[calc(100vh-300px)] min-h-[500px]">
      {MOCK_TEMPLATES.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm font-medium text-slate-700">Start from template:</label>
          <select
            value={templateId}
            onChange={e => {
              onTemplateChange(e.target.value)
              const tpl = MOCK_TEMPLATES.find(t => t.id === e.target.value)
              if (tpl) onBlocksChange(tpl.blocks)
            }}
            className="border border-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Blank (start fresh)</option>
            {MOCK_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}
      <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden">
        <BlockEditor
          blocks={blocks}
          onChange={onBlocksChange}
          subject={subject}
          preheader={preheader}
          onSubjectChange={onSubjectChange}
          onPreheaderChange={onPreheaderChange}
        />
      </div>
    </div>
  )
}

// ─── Step 4: Schedule ─────────────────────────────────────────────────────────

function StepSchedule({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  return (
    <div className="space-y-4 max-w-xl">
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: 'Send immediately', value: 'now', desc: 'Starts sending as soon as you confirm.' },
          { label: 'Schedule for later', value: 'scheduled', desc: 'Pick a date and time to send.' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...data, send_mode: opt.value })}
            className={cn(
              'p-4 border rounded-lg text-left transition-colors',
              data.send_mode === opt.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            )}
          >
            <p className={cn('font-medium text-sm', data.send_mode === opt.value ? 'text-indigo-700' : 'text-slate-800')}>{opt.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
          </button>
        ))}
      </div>
      {data.send_mode === 'scheduled' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled date & time (UTC)</label>
          <input
            type="datetime-local"
            value={data.scheduled_at ?? ''}
            onChange={e => onChange({ ...data, scheduled_at: e.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  )
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────

function StepReview({ basics, audience, blocks, subject, preheader }: {
  basics: Record<string, string>
  audience: CampaignAudience
  blocks: Block[]
  subject: string
  preheader: string
}) {
  const project = MOCK_PROJECTS.find(p => p.id === basics.project_id)
  return (
    <div className="max-w-xl space-y-4">
      <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
        {[
          ['Campaign name', basics.name || '—'],
          ['Project', project?.name || '—'],
          ['Email type', basics.email_type || 'marketing'],
          ['Language', basics.language || 'en'],
          ['From', basics.from_name && basics.from_email ? `${basics.from_name} <${basics.from_email}>` : '—'],
          ['Subject', subject || '—'],
          ['Preheader', preheader || '—'],
          ['Audience type', audience.type],
          ['Blocks', `${blocks.length} block(s)`],
          ['Send mode', basics.send_mode === 'scheduled' ? `Scheduled: ${basics.scheduled_at}` : 'Send immediately'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-800 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function NewCampaignPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [basics, setBasics] = useState<Record<string, string>>({ email_type: 'marketing', language: 'en', send_mode: 'now' })
  const [audience, setAudience] = useState<CampaignAudience>({ type: 'list' })
  const [blocks, setBlocks] = useState<Block[]>([])
  const [subject, setSubject] = useState('')
  const [preheader, setPreheader] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...basics, audience, blocks, subject, preheader, template_id: templateId || null }),
    })
    setSubmitting(false)
    router.push('/campaigns')
  }

  return (
    <div>
      <PageHeader title="New campaign" description="Create a new email campaign" />

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors',
              i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('ml-2 text-sm font-medium', i <= step ? 'text-slate-800' : 'text-slate-400')}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn('w-12 h-px mx-3', i < step ? 'bg-indigo-300' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      <Card className="p-6">
        {step === 0 && <StepBasics data={basics} onChange={setBasics} />}
        {step === 1 && <StepAudience audience={audience} onChange={setAudience} />}
        {step === 2 && (
          <StepContent
            blocks={blocks} onBlocksChange={setBlocks}
            subject={subject} preheader={preheader}
            onSubjectChange={setSubject} onPreheaderChange={setPreheader}
            templateId={templateId} onTemplateChange={setTemplateId}
          />
        )}
        {step === 3 && <StepSchedule data={basics} onChange={setBasics} />}
        {step === 4 && (
          <StepReview basics={basics} audience={audience} blocks={blocks} subject={subject} preheader={preheader} />
        )}
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button variant="secondary" size="sm" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/campaigns')} disabled={submitting}>
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="sm" onClick={() => setStep(s => s + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} loading={submitting}>
            Create campaign
          </Button>
        )}
      </div>
    </div>
  )
}
