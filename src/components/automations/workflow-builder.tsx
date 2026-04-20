'use client'

import { useState } from 'react'
import {
  Plus, Trash2, ChevronDown, ChevronUp, Settings2,
  Zap, Clock, GitBranch, Mail, ListPlus, ListMinus,
  CheckSquare, PenLine, LogOut, Timer, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  WorkflowStep, StepType, StepConfig,
  TriggerConfig, DelayConfig, BranchConfig, SendEmailConfig,
  WaitForEventConfig, AddToListConfig, CreateTaskConfig, UpdateFieldConfig,
  EventType,
} from '@/lib/types/automations'

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_META: Record<StepType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  trigger:          { label: 'Trigger',          icon: <Zap className="h-4 w-4" />,         color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  delay:            { label: 'Delay',             icon: <Clock className="h-4 w-4" />,        color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200' },
  condition:        { label: 'Condition',         icon: <Eye className="h-4 w-4" />,          color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  branch:           { label: 'Branch',            icon: <GitBranch className="h-4 w-4" />,    color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  send_email:       { label: 'Send email',        icon: <Mail className="h-4 w-4" />,         color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
  wait_for_event:   { label: 'Wait for event',    icon: <Timer className="h-4 w-4" />,        color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  add_to_list:      { label: 'Add to list',       icon: <ListPlus className="h-4 w-4" />,     color: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200' },
  remove_from_list: { label: 'Remove from list',  icon: <ListMinus className="h-4 w-4" />,    color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  create_task:      { label: 'Create task',       icon: <CheckSquare className="h-4 w-4" />,  color: 'text-sky-700',    bg: 'bg-sky-50 border-sky-200' },
  update_field:     { label: 'Update field',      icon: <PenLine className="h-4 w-4" />,      color: 'text-pink-700',   bg: 'bg-pink-50 border-pink-200' },
  exit:             { label: 'Exit',              icon: <LogOut className="h-4 w-4" />,        color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'form_submitted',    label: 'Form submitted' },
  { value: 'quiz_completed',    label: 'Quiz completed' },
  { value: 'guide_downloaded',  label: 'Guide downloaded' },
  { value: 'page_viewed',       label: 'Page viewed' },
  { value: 'form_started',      label: 'Form started' },
  { value: 'form_abandoned',    label: 'Form abandoned' },
  { value: 'contact_inactive',  label: 'Contact inactive' },
  { value: 'link_clicked',      label: 'Link clicked' },
  { value: 'email_opened',      label: 'Email opened' },
  { value: 'purchase_completed','label': 'Purchase completed' },
  { value: 'custom',            label: 'Custom event' },
]

// ─── Step summary lines ────────────────────────────────────────────────────────

function stepSummary(s: WorkflowStep): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = s.config as any
  switch (s.type) {
    case 'trigger':
      return EVENT_TYPES.find(e => e.value === c.event_type)?.label ?? String(c.event_type ?? '')
    case 'delay':
      return `Wait ${c.value ?? ''} ${c.unit ?? ''}`
    case 'send_email':
      return c.subject ? `"${c.subject}"` : 'Configure subject…'
    case 'branch':
      return `${c.conditions?.length ?? 0} condition(s) — ${c.logic ?? 'and'}`
    case 'wait_for_event':
      return `${EVENT_TYPES.find(e => e.value === c.event_type)?.label ?? String(c.event_type ?? '')} — timeout ${c.timeout_days ?? 0}d`
    case 'add_to_list':
    case 'remove_from_list':
      return c.list_name ?? c.list_id ?? 'Select list…'
    case 'create_task':
      return c.title ?? 'Configure task…'
    case 'update_field':
      return c.field ? `${c.field} = ${c.value}` : 'Configure field…'
    case 'exit':
      return c.reason ?? 'End of workflow'
    default:
      return ''
  }
}

// ─── Config form ──────────────────────────────────────────────────────────────

function ConfigForm({ step, onChange }: { step: WorkflowStep; onChange: (s: WorkflowStep) => void }) {
  function setConfig(patch: Partial<StepConfig>) {
    onChange({ ...step, config: { ...step.config, ...patch } as StepConfig })
  }
  function setName(name: string) { onChange({ ...step, name }) }

  const c = step.config as Record<string, unknown>

  const field = (key: string, label: string, value: string | number, type = 'text') => (
    <label key={key} className="block mb-3">
      <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => setConfig({ [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  )

  const sel = (key: string, label: string, value: string, options: { value: string; label: string }[]) => (
    <label key={key} className="block mb-3">
      <span className="text-xs font-medium text-slate-500 mb-1 block">{label}</span>
      <select
        value={value ?? ''}
        onChange={e => setConfig({ [key]: e.target.value })}
        className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )

  return (
    <div>
      <label className="block mb-4">
        <span className="text-xs font-medium text-slate-500 mb-1 block">Step name</span>
        <input
          value={step.name}
          onChange={e => setName(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <div className="border-t border-slate-100 pt-3">
        {step.type === 'trigger' && <>
          {sel('event_type', 'Trigger event', c.event_type as string ?? 'form_submitted', EVENT_TYPES)}
        </>}
        {step.type === 'delay' && <>
          {field('value', 'Duration', (c.value as number) ?? 1, 'number')}
          {sel('unit', 'Unit', c.unit as string ?? 'days', [
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours',   label: 'Hours' },
            { value: 'days',    label: 'Days' },
            { value: 'weeks',   label: 'Weeks' },
          ])}
        </>}
        {step.type === 'send_email' && <>
          {field('subject',    'Subject',    c.subject    as string ?? '')}
          {field('preheader',  'Preheader',  c.preheader  as string ?? '')}
          {field('from_name',  'From name',  c.from_name  as string ?? '')}
          {field('from_email', 'From email', c.from_email as string ?? '')}
          {sel('email_type', 'Email type', c.email_type as string ?? 'marketing', [
            { value: 'marketing',    label: 'Marketing' },
            { value: 'operational',  label: 'Operational' },
          ])}
        </>}
        {step.type === 'branch' && <>
          {sel('logic', 'Match logic', c.logic as string ?? 'and', [
            { value: 'and', label: 'All conditions (AND)' },
            { value: 'or',  label: 'Any condition (OR)' },
          ])}
          {field('yes_label', 'Yes branch label', c.yes_label as string ?? 'Yes')}
          {field('no_label',  'No branch label',  c.no_label  as string ?? 'No')}
          <p className="text-xs text-slate-400 mt-1">Add branch conditions in a future step via the conditions panel.</p>
        </>}
        {step.type === 'wait_for_event' && <>
          {sel('event_type', 'Wait for event', c.event_type as string ?? 'email_opened', EVENT_TYPES)}
          {field('timeout_days', 'Timeout (days)', (c.timeout_days as number) ?? 7, 'number')}
          {sel('timeout_action', 'On timeout', c.timeout_action as string ?? 'continue', [
            { value: 'continue', label: 'Continue to next step' },
            { value: 'exit',     label: 'Exit workflow' },
            { value: 'branch',   label: 'Branch (yes=received, no=timeout)' },
          ])}
        </>}
        {(step.type === 'add_to_list' || step.type === 'remove_from_list') && <>
          {field('list_id',   'List ID',   c.list_id   as string ?? '')}
          {field('list_name', 'List name', c.list_name as string ?? '')}
        </>}
        {step.type === 'create_task' && <>
          {field('title',    'Task title', c.title as string ?? '')}
          {sel('priority', 'Priority', c.priority as string ?? 'medium', [
            { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' },
          ])}
          {field('due_days', 'Due in (days)', (c.due_days as number) ?? 3, 'number')}
        </>}
        {step.type === 'update_field' && <>
          {field('field', 'Contact field', c.field as string ?? '')}
          {field('value', 'New value',     c.value as string ?? '')}
        </>}
        {step.type === 'exit' && <>
          {field('reason', 'Exit reason (optional)', (c as { reason?: string }).reason ?? '')}
        </>}
        {step.type === 'condition' && (
          <p className="text-xs text-slate-400">Condition logic is configured via the branch conditions panel.</p>
        )}
      </div>
    </div>
  )
}

// ─── Add-step popover ─────────────────────────────────────────────────────────

function AddStepMenu({ onAdd }: { onAdd: (type: StepType) => void }) {
  const [open, setOpen] = useState(false)
  const groups: { label: string; types: StepType[] }[] = [
    { label: 'Messaging',  types: ['send_email'] },
    { label: 'Flow',       types: ['delay', 'wait_for_event', 'branch', 'condition', 'exit'] },
    { label: 'Data',       types: ['add_to_list', 'remove_from_list', 'create_task', 'update_field'] },
  ]

  return (
    <div className="relative flex justify-center">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-full bg-white hover:bg-indigo-50 shadow-sm transition-colors"
      >
        <Plus className="h-3.5 w-3.5" /> Add step
      </button>
      {open && (
        <div className="absolute top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 w-56 py-2 left-1/2 -translate-x-1/2">
          {groups.map(g => (
            <div key={g.label}>
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{g.label}</p>
              {g.types.map(t => {
                const m = STEP_META[t]
                return (
                  <button
                    key={t}
                    onClick={() => { onAdd(t); setOpen(false) }}
                    className={cn('w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors', m.color)}
                  >
                    {m.icon} {m.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Single step node ─────────────────────────────────────────────────────────

function StepNode({
  step, index, total, selected, onSelect, onRemove, onMove,
}: {
  step: WorkflowStep
  index: number
  total: number
  selected: boolean
  onSelect: () => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const m = STEP_META[step.type]
  const isBranch = step.type === 'branch' || step.type === 'wait_for_event'

  return (
    <div className="flex flex-col items-center">
      {/* Connector line */}
      {index > 0 && <div className="w-px h-6 bg-slate-200" />}

      {/* Node */}
      <div
        onClick={onSelect}
        className={cn(
          'w-72 border rounded-xl p-3.5 cursor-pointer transition-all shadow-sm',
          m.bg,
          selected ? 'ring-2 ring-indigo-400 shadow-md' : 'hover:shadow-md'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn('flex-shrink-0', m.color)}>{m.icon}</span>
            <div className="min-w-0">
              <p className={cn('text-sm font-semibold truncate', m.color)}>{step.name || m.label}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{stepSummary(step)}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={e => { e.stopPropagation(); onMove(-1) }} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); onMove(1) }} disabled={index === total - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 ml-1">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Branch labels */}
        {isBranch && (
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {(step.config as BranchConfig).yes_label ?? 'Yes'} →
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {(step.config as BranchConfig).no_label ?? 'No'} →
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main WorkflowBuilder ────────────────────────────────────────────────────

function makeStep(type: StepType, workflowId: string, order: number): WorkflowStep {
  const defaults: Partial<Record<StepType, Partial<StepConfig>>> = {
    trigger:          { event_type: 'form_submitted' },
    delay:            { value: 1, unit: 'days' },
    send_email:       { subject: '', from_name: '', from_email: '', email_type: 'marketing' },
    branch:           { conditions: [], logic: 'and', yes_label: 'Yes', no_label: 'No' },
    wait_for_event:   { event_type: 'email_opened', timeout_days: 7, timeout_action: 'branch' },
    add_to_list:      { list_id: '', list_name: '' },
    remove_from_list: { list_id: '', list_name: '' },
    create_task:      { title: '', priority: 'medium', due_days: 3 },
    update_field:     { field: '', value: '' },
    exit:             {},
    condition:        { conditions: [], logic: 'and' },
  }
  return {
    id: `new-${Math.random().toString(36).slice(2)}`,
    workflow_id: workflowId,
    type,
    name: STEP_META[type].label,
    config: (defaults[type] ?? {}) as StepConfig,
    position_x: 0,
    position_y: order * 160,
    next_step_id: null,
    branch_yes_step_id: null,
    branch_no_step_id: null,
    order_index: order,
    created_at: new Date().toISOString(),
  }
}

interface WorkflowBuilderProps {
  workflowId: string
  steps: WorkflowStep[]
  onChange: (steps: WorkflowStep[]) => void
}

export function WorkflowBuilder({ workflowId, steps, onChange }: WorkflowBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(steps[0]?.id ?? null)
  const selectedStep = steps.find(s => s.id === selectedId) ?? null

  function addStep(type: StepType) {
    const s = makeStep(type, workflowId, steps.length)
    onChange([...steps, s])
    setSelectedId(s.id)
  }

  function removeStep(id: string) {
    onChange(steps.filter(s => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function updateStep(updated: WorkflowStep) {
    onChange(steps.map(s => s.id === updated.id ? updated : s))
  }

  function moveStep(id: string, dir: -1 | 1) {
    const idx = steps.findIndex(s => s.id === id)
    if (idx === -1) return
    const next = idx + dir
    if (next < 0 || next >= steps.length) return
    const arr = [...steps]
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    onChange(arr.map((s, i) => ({ ...s, order_index: i })))
  }

  return (
    <div className="flex gap-0 h-full min-h-[520px]">
      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-[#f8f9fb] p-8">
        <div className="flex flex-col items-center min-w-[320px]">
          {steps.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Start by adding a trigger step</p>
            </div>
          )}

          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center w-full">
              <StepNode
                step={s}
                index={i}
                total={steps.length}
                selected={selectedId === s.id}
                onSelect={() => setSelectedId(s.id)}
                onRemove={() => removeStep(s.id)}
                onMove={dir => moveStep(s.id, dir)}
              />
              {/* Add step button after every node except exit */}
              {s.type !== 'exit' && (
                <div className="my-2">
                  <AddStepMenu onAdd={addStep} />
                </div>
              )}
            </div>
          ))}

          {steps.length === 0 && (
            <div className="mt-6">
              <AddStepMenu onAdd={addStep} />
            </div>
          )}
        </div>
      </div>

      {/* Config panel */}
      {selectedStep && (
        <div className="w-72 shrink-0 border-l border-slate-200 bg-white overflow-auto p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">
              {STEP_META[selectedStep.type].label} settings
            </h3>
          </div>
          <ConfigForm step={selectedStep} onChange={updateStep} />
        </div>
      )}
    </div>
  )
}
