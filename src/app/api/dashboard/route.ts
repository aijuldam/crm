import { NextResponse } from 'next/server'
import { MOCK_DASHBOARD_STATS } from '@/lib/mock-data'

function isSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export async function GET() {
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const [
      { count: total_contacts },
      { data: byProject },
      { data: byCountry },
      { data: byLifecycle },
      { data: byConsent },
    ] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.rpc('contacts_by_project'),
      supabase.rpc('contacts_by_country'),
      supabase.rpc('contacts_by_lifecycle'),
      supabase.rpc('consent_summary'),
    ])

    // Extension point: add contacts_over_time and list_growth RPCs in Phase 2
    return NextResponse.json({
      total_contacts: total_contacts ?? 0,
      contacts_by_project: byProject ?? [],
      contacts_by_country: byCountry ?? [],
      contacts_by_lifecycle: byLifecycle ?? [],
      new_contacts_over_time: [],
      list_growth: [],
      consent_summary: byConsent ?? [],
    })
  }

  return NextResponse.json(MOCK_DASHBOARD_STATS)
}
