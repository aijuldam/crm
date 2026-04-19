import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { EUROPEAN_COUNTRIES, LIFECYCLE_STAGES, CONSENT_STATUSES } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName.slice(0, 2).toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return '??'
}

export function getFullName(contact: { first_name?: string | null; last_name?: string | null; email: string }): string {
  const parts = [contact.first_name, contact.last_name].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : contact.email
}

export function formatDate(iso: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatRelativeDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export function getCountryName(code: string | null | undefined): string {
  if (!code) return '—'
  return EUROPEAN_COUNTRIES.find(c => c.code === code)?.name ?? code
}

export function getCountryFlag(code: string | null | undefined): string {
  if (!code) return ''
  return EUROPEAN_COUNTRIES.find(c => c.code === code)?.flag ?? ''
}

export function getLifecycleStageConfig(stage: string) {
  return LIFECYCLE_STAGES.find(s => s.value === stage) ?? { value: stage, label: stage, color: 'gray' }
}

export function getConsentStatusConfig(status: string) {
  return CONSENT_STATUSES.find(s => s.value === status) ?? { value: status, label: status, color: 'gray' }
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const filtered = Object.entries(params).filter(([, v]) => v != null && v !== '')
  if (filtered.length === 0) return ''
  return '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
}

export function generateAvatarColor(str: string): string {
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
