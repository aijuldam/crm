import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail } from '@/lib/utils'
import { MOCK_CONTACTS } from '@/lib/mock-data'
import { requireAuth, isAuthError } from '@/lib/auth/api'
import { isSupabaseConfigured } from '@/lib/config'
import type { ContactFilters } from '@/lib/types'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, 'contacts:read')
  if (isAuthError(auth)) return auth

  const { searchParams } = req.nextUrl
  const filters: ContactFilters = {
    search: searchParams.get('search') ?? undefined,
    lifecycle_stage: (searchParams.get('lifecycle_stage') as ContactFilters['lifecycle_stage']) ?? undefined,
    country: searchParams.get('country') ?? undefined,
    list_id: searchParams.get('list_id') ?? undefined,
    page: Number(searchParams.get('page') ?? 1),
    per_page: Number(searchParams.get('per_page') ?? 20),
  }

  if (isSupabaseConfigured()) {
    // Production: use Supabase
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
    }
    if (filters.lifecycle_stage) query = query.eq('lifecycle_stage', filters.lifecycle_stage)
    if (filters.country) query = query.eq('residency_country', filters.country)

    const from = ((filters.page ?? 1) - 1) * (filters.per_page ?? 20)
    query = query.range(from, from + (filters.per_page ?? 20) - 1)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, total: count ?? 0, page: filters.page, per_page: filters.per_page })
  }

  // Development: mock data
  let data = [...MOCK_CONTACTS]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(c =>
      c.email.includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q)
    )
  }
  if (filters.lifecycle_stage) data = data.filter(c => c.lifecycle_stage === filters.lifecycle_stage)
  if (filters.country) data = data.filter(c => c.residency_country === filters.country)

  const total = data.length
  const page = filters.page ?? 1
  const per_page = filters.per_page ?? 20
  data = data.slice((page - 1) * per_page, page * per_page)

  return NextResponse.json({ data, total, page, per_page })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'contacts:write')
  if (isAuthError(auth)) return auth
  const body = await req.json()

  if (!body.email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const email_normalized = normalizeEmail(body.email)

  // Deduplication check
  const existing = MOCK_CONTACTS.find(c => c.email_normalized === email_normalized)
  if (existing) {
    return NextResponse.json({ error: 'Contact with this email already exists', existing_id: existing.id }, { status: 409 })
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Check for duplicate
    const { data: dup } = await supabase
      .from('contacts')
      .select('id')
      .eq('email_normalized', email_normalized)
      .single()

    if (dup) {
      return NextResponse.json({ error: 'Contact with this email already exists', existing_id: dup.id }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...body, email_normalized })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If project_id was provided, link contact to project
    if (body.project_id) {
      await supabase
        .from('contact_projects')
        .insert({ contact_id: data.id, project_id: body.project_id })
    }

    return NextResponse.json(data, { status: 201 })
  }

  // Mock response
  const newContact = {
    id: `con-${Date.now()}`,
    email: body.email,
    email_normalized,
    first_name: body.first_name ?? null,
    last_name: body.last_name ?? null,
    phone: body.phone ?? null,
    country_code: body.country_code ?? null,
    residency_country: body.residency_country ?? null,
    preferred_language: body.preferred_language ?? 'en',
    timezone: body.timezone ?? null,
    currency: body.currency ?? 'EUR',
    market: body.market ?? null,
    lifecycle_stage: body.lifecycle_stage ?? 'lead',
    source: body.source ?? null,
    owner_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return NextResponse.json(newContact, { status: 201 })
}
