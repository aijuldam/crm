import { NextRequest, NextResponse } from 'next/server'
import { MOCK_WORKFLOWS } from '@/lib/mock-data-automations'

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const project_id = searchParams.get('project_id')
  const status     = searchParams.get('status')
  const category   = searchParams.get('category')

  if (!isSupabaseConfigured()) {
    let workflows = MOCK_WORKFLOWS
    if (project_id) workflows = workflows.filter(w => w.project_id === project_id)
    if (status)     workflows = workflows.filter(w => w.status === status)
    if (category)   workflows = workflows.filter(w => w.category === category)
    return NextResponse.json({ workflows, total: workflows.length })
  }

  return NextResponse.json({ workflows: [], total: 0 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, project_id, category = 'custom', description = '' } = body

  if (!name || !project_id) {
    return NextResponse.json({ error: 'name and project_id are required' }, { status: 400 })
  }

  if (!isSupabaseConfigured()) {
    const workflow = {
      id: `wf-${Math.random().toString(36).slice(2)}`,
      name,
      project_id,
      category,
      description,
      status: 'draft',
      trigger_config: {},
      re_entry: 'none',
      re_entry_delay_days: 0,
      frequency_cap_per_day: null,
      goal_event_type: null,
      goal_conditions: null,
      exclusion_list_id: null,
      stop_on_unsubscribe: true,
      stop_on_conversion: true,
      created_by: null,
      steps: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return NextResponse.json({ workflow }, { status: 201 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
