import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail } from '@/lib/utils'
import { requireAuth, isAuthError } from '@/lib/auth/api'

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, 'contacts:write')
  if (isAuthError(auth)) return auth
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const projectId = formData.get('project_id') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const text = await file.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 })
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
  const emailIdx = headers.indexOf('email')

  if (emailIdx === -1) {
    return NextResponse.json({ error: 'CSV must have an "email" column' }, { status: 400 })
  }

  const fieldMap: Record<string, string> = {
    first_name: headers.indexOf('first_name') > -1 ? 'first_name' : headers.indexOf('firstname') > -1 ? 'firstname' : '',
    last_name: headers.indexOf('last_name') > -1 ? 'last_name' : headers.indexOf('lastname') > -1 ? 'lastname' : '',
    phone: headers.indexOf('phone') > -1 ? 'phone' : '',
    country: headers.indexOf('country') > -1 ? 'country' : headers.indexOf('residency_country') > -1 ? 'residency_country' : '',
    language: headers.indexOf('language') > -1 ? 'language' : headers.indexOf('preferred_language') > -1 ? 'preferred_language' : '',
    lifecycle_stage: headers.indexOf('lifecycle_stage') > -1 ? 'lifecycle_stage' : '',
    source: headers.indexOf('source') > -1 ? 'source' : '',
  }

  const results = {
    total: 0,
    created: 0,
    duplicates: 0,
    errors: 0,
    skipped_rows: [] as string[],
  }

  const contacts = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const email = cols[emailIdx]?.trim()

    if (!email || !email.includes('@')) {
      results.errors++
      results.skipped_rows.push(`Row ${i + 1}: invalid email "${email}"`)
      continue
    }

    results.total++
    const email_normalized = normalizeEmail(email)

    const contact: Record<string, string | null> = {
      email,
      email_normalized,
      first_name: fieldMap.first_name ? cols[headers.indexOf(fieldMap.first_name)] ?? null : null,
      last_name: fieldMap.last_name ? cols[headers.indexOf(fieldMap.last_name)] ?? null : null,
      phone: fieldMap.phone ? cols[headers.indexOf(fieldMap.phone)] ?? null : null,
      residency_country: fieldMap.country ? cols[headers.indexOf(fieldMap.country)] ?? null : null,
      preferred_language: fieldMap.language ? cols[headers.indexOf(fieldMap.language)] ?? null : null,
      lifecycle_stage: fieldMap.lifecycle_stage ? cols[headers.indexOf(fieldMap.lifecycle_stage)] ?? 'lead' : 'lead',
      source: fieldMap.source ? cols[headers.indexOf(fieldMap.source)] ?? 'csv_import' : 'csv_import',
    }

    contacts.push(contact)
  }

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isSupabaseConfigured && contacts.length > 0) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Upsert in batches of 100 using email_normalized as dedup key
    const batchSize = 100
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('contacts')
        .upsert(batch, { onConflict: 'email_normalized', ignoreDuplicates: false })
        .select('id')

      if (error) {
        results.errors += batch.length
      } else {
        results.created += data?.length ?? 0
      }
    }

    // Link to project if provided
    if (projectId) {
      // Would insert contact_projects rows here
    }
  } else {
    // Mock: count as created
    results.created = contacts.length
  }

  return NextResponse.json(results, { status: 200 })
}
