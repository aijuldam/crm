'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WorkflowBuilder } from '@/components/automations/workflow-builder'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { WorkflowStep, WorkflowCategory, ReEntryRule, EventType } from '@/lib/types/automations'

const STEPS = ['Basics', 'Builder', 'Settings', 'Review'] as const

const CATEGORIES: { value: WorkflowCategory; label: string; desc: string }[] = [
  { value: 'welcome',          label: 'Welcome series',       desc: 'Onboard new contacts after signup or form submission.' },
  { value: 'nurture',          label: 'Nurture sequence',     desc: 'Guide contacts toward conversion over multiple touchpoints.' },
  { value: 'reengagement',     label: 'Re-engagement',        desc: 'Win back inactive contacts before removing from lists.' },
  { value: 'content_delivery', label: 'Content delivery',     desc: 'Automatically deliver guides, resources, or quiz results.' },
  { value: 'transactional',    label: 'Transactional',        desc: 'Confirmations, receipts, and operational notifications.' },
  { value: 'custom',           label: 'Custom',               desc: 'Build any automation from scratch.' },
]

// ─── Step 1: Basics ───────────────────────────────────────────────────────────

function StepBasics({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  function set(k: string, v: string) { onChange({ ...data, [k]: v }) }
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Workflow name</label>
          <input
            value={data.name ?? ''}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Welcome Series"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={data.description ?? ''}
            onChange={e => set('description', e.target.value)}
            placeholder="What does this workflow do?"
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
          <select
            value={data.project_id ?? ''}
            onChange={e => set('project_id', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select project…</option>
            {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Category</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => set('category', cat.value)}
              className={cn(
                'p-3 border rounded-xl text-left transition-colors',
                data.category === cat.value
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <p className={cn('text-sm font-semibold', data.category === cat.value ? 'text-indigo-700' : 'text-slate-700')}>{cat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Builder ──────────────────────────────────────────────────────────

function StepBuilderTab({ workflowId, steps, onChange }: { workflowId: string; steps: WorkflowStep[]; onChange: (s: WorkflowStep[]) => void }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden h-[600px]">
      <WorkflowBuilder workflowId={workflowId} steps={steps} onChange={onChange} />
    </div>
  )
}

// ─── Step 3: Settings ─────────────────────────────────────────────────────────

function StepSettings({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  function set(k: string, v: string) { onChange({ ...data, [k]: v }) }
  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Re-entry rule</label>
        <select
          value={data.re_entry ?? 'none'}
          onChange={e => set('re_entry', e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="none">No re-entry — contact can only pass through once</option>
          <option value="always">Always — re-enter every time trigger fires</option>
          <option value="after_exit">After exit — re-enter only after completing or exiting</option>
        </select>
      </div>
      {data.re_entry === 'after_exit' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Re-entry delay (days)</label>
          <input
            type="number"
            value={data.re_entry_delay_days ?? '0'}
            onChange={e => set('re_entry_delay_days', e.target.value)}
            min={0}
            className="w-40 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Goal event (auto-exit on conversion)</label>
        <select
          value={data.goal_event_type ?? ''}
          onChange={e => set('goal_event_type', e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">No goal event</option>
          <option value="purchase_completed">Purchase completed</option>
          <option value="quiz_completed">Quiz completed</option>
          <option value="guide_downloaded">Guide downloaded</option>
          <option value="form_submitted">Form submitted</option>
          <option value="email_opened">Email opened</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Daily email frequency cap per contact</label>
        <input
          type="number"
          value={data.frequency_cap_per_day ?? ''}
          onChange={e => set('frequency_cap_per_day', e.target.value)}
          placeholder="No limit"
          min={1}
          className="w-40 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        {[
          { key: 'stop_on_unsubscribe', label: 'Stop if contact unsubscribes' },
          { key: 'stop_on_conversion',  label: 'Stop on goal conversion' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data[key] !== 'false'}
              onChange={e => set(key, String(e.target.checked))}
              className="rounded border-slate-300"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function StepReview({ basics, steps }: { basics: Record<string, string>; steps: WorkflowStep[] }) {
  const project = MOCK_PROJECTS.find(p => p.id === basics.project_id)
  const triggerStep = steps.find(s => s.type === 'trigger')
  const rows = [
    ['Name',        basics.name || '—'],
    ['Project',     project?.name || '—'],
    ['Category',    basics.category || '—'],
    ['Trigger',     (triggerStep?.config as { event_type?: string })?.event_type ?? 'Not set'],
    ['Steps',       `${steps.length}`],
    ['Re-entry',    basics.re_entry || 'none'],
    ['Goal event',  basics.goal_event_type || 'None'],
    ['Stop on unsub', basics.stop_on_unsubscribe !== 'false' ? 'Yes' : 'No'],
  ]
  return (
    <div className="max-w-xl">
      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-slate-800 font-medium">{value}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4">
        The workflow will be saved as <strong>draft</strong>. Activate it from the workflow detail page.
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NewWorkflowPage() {
  const router  = useRouter()
  const wfId    = `wf-new-${Math.random().toString(36).slice(2)}`
  const [step, setStep]     = useState(0)
  const [basics, setBasics] = useState<Record<string, string>>({ category: 'custom', re_entry: 'none', stop_on_unsubscribe: 'true', stop_on_conversion: 'true' })
  const [wfSteps, setWfSteps] = useState<WorkflowStep[]>([])
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    setSaving(true)
    await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...basics, steps: wfSteps }),
    })
    setSaving(false)
    router.push('/automations')
  }

  const STEP_LABELS = STEPS

  return (
    <div>
      <PageHeader title="New workflow" description="Build an event-driven automation" />

      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors',
              i <= step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('ml-2 text-sm font-medium', i <= step ? 'text-slate-800' : 'text-slate-400')}>
              {label}
            </span>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn('w-10 h-px mx-3', i < step ? 'bg-indigo-300' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      <Card padding={step === 1 ? false : true} className={step === 1 ? 'overflow-hidden' : ''}>
        {step === 0 && <StepBasics data={basics} onChange={setBasics} />}
        {step === 1 && <StepBuilderTab workflowId={wfId} steps={wfSteps} onChange={setWfSteps} />}
        {step === 2 && <StepSettings data={basics} onChange={setBasics} />}
        {step === 3 && <StepReview basics={basics} steps={wfSteps} />}
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button variant="secondary" size="sm" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/automations')} disabled={saving}>
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEP_LABELS.length - 1 ? (
          <Button size="sm" onClick={() => setStep(s => s + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" onClick={handleCreate} loading={saving}>
            Create workflow
          </Button>
        )}
      </div>
    </div>
  )
}
