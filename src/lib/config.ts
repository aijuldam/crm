import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['local', 'staging', 'production']).optional(),

  // Supabase — optional; absence enables mock mode
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),

  // Webhook auth token (for /api/email-events and /api/sync)
  WEBHOOK_SECRET: z.string().min(32).optional(),

  // Internal cron jobs
  CRON_SECRET: z.string().min(32).optional(),
})

// Fail fast on missing/invalid env vars in production
function parseEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }

  const cfg = result.data

  if (cfg.NODE_ENV === 'production') {
    if (!cfg.NEXT_PUBLIC_SUPABASE_URL || !cfg.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required in production')
    }
    if (!cfg.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production')
    }
    if (!cfg.WEBHOOK_SECRET) {
      console.warn('[config] WEBHOOK_SECRET is not set — webhook endpoints are unauthenticated')
    }
  }

  return cfg
}

export type AppConfig = z.infer<typeof envSchema>

let _config: AppConfig | undefined

export function getConfig(): AppConfig {
  if (!_config) _config = parseEnv()
  return _config
}

export function isSupabaseConfigured(): boolean {
  const env = process.env
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function isMockMode(): boolean {
  return !isSupabaseConfigured()
}

export function getAppEnv(): 'local' | 'staging' | 'production' {
  const explicit = process.env.APP_ENV as 'local' | 'staging' | 'production' | undefined
  if (explicit) return explicit
  if (process.env.NODE_ENV === 'production') return 'production'
  return 'local'
}
