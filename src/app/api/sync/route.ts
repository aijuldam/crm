import { NextRequest, NextResponse } from 'next/server'

// Sync job trigger — fetches delivery states/events from ESP and ingests them
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { campaign_run_id } = body

  // In a live environment this would:
  // 1. Fetch unprocessed events from ESP API since last_sync_at
  // 2. Upsert into email_events (dedup via provider_event_id)
  // 3. Call compute_run_metrics(run_id) for each affected run
  // 4. Auto-suppress hard bounces and complaints via DB triggers

  return NextResponse.json({
    synced: true,
    campaign_run_id: campaign_run_id ?? null,
    processed: 0,
    message: 'Sync complete (mock mode — no provider connected)',
  }, { status: 202 })
}
