import { NextRequest, NextResponse } from 'next/server'
import { isMockMode } from '@/lib/config'
import { hasPermission, type Permission } from '@/lib/auth/rbac'
import { logger, AuditEvent } from '@/lib/logger'
import type { UserRole } from '@/lib/types'

export interface AuthContext {
  userId: string
  role: UserRole
  email: string
}

/**
 * Call at the top of every API handler.
 * Returns AuthContext on success, NextResponse on auth failure.
 * In mock mode (no Supabase configured) always succeeds as admin.
 */
export async function requireAuth(
  req: NextRequest,
  permission: Permission,
): Promise<AuthContext | NextResponse> {
  if (isMockMode()) {
    return { userId: 'mock-admin', role: 'admin', email: 'admin@localhost' }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    logger.audit(AuditEvent.AUTH_DENIED, {
      path: req.nextUrl.pathname,
      reason: 'no_session',
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (user.user_metadata?.role ?? 'viewer') as UserRole

  if (!hasPermission(role, permission)) {
    logger.audit(AuditEvent.AUTH_DENIED, {
      userId: user.id,
      role,
      permission,
      path: req.nextUrl.pathname,
      reason: 'insufficient_permission',
    })
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return { userId: user.id, role, email: user.email ?? '' }
}

/** Type guard — lets call sites do: if (isAuthError(auth)) return auth */
export function isAuthError(result: AuthContext | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}

/**
 * Verify the X-Webhook-Secret header for inbound provider webhooks.
 * Returns NextResponse 401 on failure, null on success.
 */
export function requireWebhookSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return null // unconfigured = skip check (dev convenience)

  const provided = req.headers.get('x-webhook-secret')
  if (!provided || provided !== secret) {
    logger.audit(AuditEvent.WEBHOOK_REJECTED, { path: req.nextUrl.pathname })
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }
  return null
}

/**
 * Verify the Authorization: Bearer <CRON_SECRET> header for scheduled jobs.
 * Returns NextResponse 401 on failure, null on success.
 */
export function requireCronSecret(req: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET
  if (!secret) return null

  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
