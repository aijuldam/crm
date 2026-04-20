'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Zap, Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { WorkflowBuilder } from '@/components/automations/workflow-builder'
import { WorkflowStats } from '@/components/automations/workflow-stats'
import { MOCK_WORKFLOWS, MOCK_WORKFLOW_ANALYTICS, MOCK_ENROLLMENTS } from '@/lib/mock-data-automations'
import { MOCK_PROJECTS } from '@/lib/mock-data'
import { formatDate, formatRelativeDate, cn } from '@/lib/utils'
import type { WorkflowStatus, WorkflowStep } from '@/lib/types/automations'

const STATUS_COLOR: Record<WorkflowStatus, 'green' | 'yellow' | 'gray'> = {
  active: 'green', paused: 'yellow', draft: 'gray', archived: 'gray',
}

type Tab = 'overview' | 'builder' | 'enrollments'

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [tab, setTab] = useState<Tab>('overview')

  const workflow = MOCK_WORKFLOWS.find(w => w.id === id)
  if (!workflow) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Workflow not found.</p>
        <Button variant="secondary" size="sm" onClick={() => router.push('/automations')} className="mt-4">
          Back to automations
        </Button>
      </div>
    )
  }

  const analytics   = MOCK_WORKFLOW_ANALYTICS[id]
  const enrollments = MOCK_ENROLLMENTS.filter(e => e.workflow_id === id)
  const project     = MOCK_PROJECTS.find(p => p.id === workflow.project_id)

  const [steps, setSteps] = useState<WorkflowStep[]>(workflow.steps ?? [])

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',    label: 'Analytics' },
    { key: 'builder',     label: 'Workflow builder' },
    { key: 'enrollments', label: `Enrollments (${enrollments.length})` },
  ]

  const STATUS_ENROLL: Record<string, 'green' | 'blue' | 'gray' | 'red'> = {
    active: 'blue', completed: 'green', exited: 'gray', failed: 'red',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/automations')} className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-500" />
              <h1 className="text-xl font-semibold text-slate-900">{workflow.name}</h1>
              <Badge color={STATUS_COLOR[workflow.status]}>{workflow.status}</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {project?.name} · {workflow.category.replace(/_/g, ' ')} · {steps.length} steps
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {workflow.status === 'active' ? (
            <Button variant="secondary" size="sm">
              <Pause className="h-4 w-4" /> Pause
            </Button>
          ) : workflow.status === 'paused' || workflow.status === 'draft' ? (
            <Button size="sm">
              <Play className="h-4 w-4" /> Activate
            </Button>
          ) : null}
        </div>
      </div>

      {/* Workflow metadata */}
      <Card className="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          {[
            ['Trigger', (workflow.trigger_config as { event_type?: string })?.event_type?.replace(/_/g, ' ') ?? '—'],
            ['Re-entry', workflow.re_entry],
            ['Goal event', workflow.goal_event_type?.replace(/_/g, ' ') ?? 'None'],
            ['Updated', formatRelativeDate(workflow.updated_at)],
          ].map(([label, value]) => (
            <div key={label} className="px-5 py-4">
              <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-slate-800 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Analytics tab */}
      {tab === 'overview' && (
        analytics
          ? <WorkflowStats analytics={analytics} />
          : <Card className="p-10 text-center"><p className="text-slate-400 text-sm">No analytics data yet — activate the workflow to start collecting data.</p></Card>
      )}

      {/* Builder tab */}
      {tab === 'builder' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500">Edit the workflow steps below. Changes are not saved until you click Save.</p>
            <Button size="sm" onClick={async () => {
              await fetch(`/api/automations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steps }),
              })
            }}>
              <Settings2 className="h-4 w-4" /> Save steps
            </Button>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden h-[620px]">
            <WorkflowBuilder workflowId={id} steps={steps} onChange={setSteps} />
          </div>
        </div>
      )}

      {/* Enrollments tab */}
      {tab === 'enrollments' && (
        <Card className="p-0">
          {enrollments.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No enrollments yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {enrollments.map(e => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-mono text-xs text-slate-500">Contact {e.contact_id.slice(-8)}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Enrolled {formatDate(e.enrolled_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {e.exit_reason && (
                      <span className="text-xs text-slate-400 italic">{e.exit_reason}</span>
                    )}
                    {e.goal_completed_at && (
                      <span className="text-xs text-emerald-600">Goal ✓</span>
                    )}
                    <Badge color={STATUS_ENROLL[e.status] ?? 'gray'}>{e.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
