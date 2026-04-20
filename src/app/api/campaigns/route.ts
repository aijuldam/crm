import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data-campaigns'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'campaigns:read')
  if (isAuthError(auth)) return auth
  const { searchParams } = new URL(req.url)
  const project_id = searchParams.get('project_id')
  const status = searchParams.get('status')

  if (!isSupabaseConfigured()) {
    let campaigns = MOCK_CAMPAIGNS
    if (project_id) campaigns = campaigns.filter(c => c.project_id === project_id)
    if (status) campaigns = campaigns.filter(c => c.status === status)
    return NextResponse.json({ campaigns, total: campaigns.length })
  }

  // Supabase path — placeholder for live implementation
  return NextResponse.json({ campaigns: [], total: 0 })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'campaigns:write')
  if (isAuthError(auth)) return auth
  const body = await req.json()

  if (!isSupabaseConfigured()) {
    const campaign = {
      id: Math.random().toString(36).slice(2),
      ...body,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return NextResponse.json({ campaign }, { status: 201 })
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
