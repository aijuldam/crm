type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

function emit(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.APP_ENV ?? process.env.NODE_ENV,
    ...meta,
  }

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for log aggregators (Datadog, CloudWatch, etc.)
    process.stdout.write(JSON.stringify(entry) + '\n')
  } else {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
    const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
    console.log(`${prefix} ${message}${metaStr}`)
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
  info:  (message: string, meta?: Record<string, unknown>) => emit('info',  message, meta),
  warn:  (message: string, meta?: Record<string, unknown>) => emit('warn',  message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),

  /** Security-relevant events — always emitted, included in SIEM/audit log */
  audit(event: string, meta: Record<string, unknown> = {}) {
    emit('info', event, { audit: true, ...meta })
  },
}

// Convenience audit event names
export const AuditEvent = {
  LOGIN_SUCCESS:      'auth.login.success',
  LOGIN_FAILURE:      'auth.login.failure',
  LOGOUT:             'auth.logout',
  AUTH_DENIED:        'auth.denied',
  ROLE_CHANGED:       'auth.role.changed',
  CONSENT_WITHDRAWN:  'gdpr.consent.withdrawn',
  CONSENT_GIVEN:      'gdpr.consent.given',
  CONTACT_DELETED:    'gdpr.contact.deleted',
  SUPPRESSION_ADDED:  'email.suppression.added',
  CAMPAIGN_SENT:      'campaign.sent',
  WORKFLOW_ACTIVATED: 'automation.workflow.activated',
  WEBHOOK_RECEIVED:   'webhook.received',
  WEBHOOK_REJECTED:   'webhook.rejected',
} as const
