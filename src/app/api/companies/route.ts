import { NextRequest, NextResponse } from 'next/server'
import { MOCK_COMPANIES } from '@/lib/mock-data'

function isSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') ?? ''
  const country = searchParams.get('country') ?? ''
  const industry = searchParams.get('industry') ?? ''
  const page = Number(searchParams.get('page') ?? 1)
  const per_page = Number(searchParams.get('per_page') ?? 20)

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    let query = supabase.from('companies').select('*', { count: 'exact' }).order('name')

    if (search) query = query.ilike('name', `%${search}%`)
    if (country) query = query.eq('registered_country', country)
    if (industry) query = query.eq('industry', industry)

    const from = (page - 1) * per_page
    query = query.range(from, from + per_page - 1)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, total: count ?? 0, page, per_page })
  }

  let data = [...MOCK_COMPANIES]
  if (search) data = data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  if (country) data = data.filter(c => c.registered_country === country)
  if (industry) data = data.filter(c => c.industry === industry)

  const total = data.length
  data = data.slice((page - 1) * per_page, page * per_page)
  return NextResponse.json({ data, total, page, per_page })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.name) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase.from('companies').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }

  const newCompany = {
    id: `comp-${Date.now()}`,
    ...body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return NextResponse.json(newCompany, { status: 201 })
}
