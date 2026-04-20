import { NextRequest, NextResponse } from 'next/server'
import { MOCK_TEMPLATES } from '@/lib/mock-data-campaigns'

function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const project_id = searchParams.get('project_id')

  if (!isSupabaseConfigured()) {
    let templates = MOCK_TEMPLATES
    if (category) templates = templates.filter(t => t.category === category)
    if (project_id) templates = templates.filter(t => t.project_id === project_id || t.project_id === null)
    return NextResponse.json({ templates, total: templates.length })
  }

  return NextResponse.json({ templates: [], total: 0 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!isSupabaseConfigured()) {
    const template = {
      id: Math.random().toString(36).slice(2),
      ...body,
      is_active: true,
      language_variants: body.language_variants ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return NextResponse.json({ template }, { status: 201 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
