import type { UserRole } from '@/lib/types'

// All fine-grained permissions in the system
export type Permission =
  | 'dashboard:read'
  | 'contacts:read'    | 'contacts:write'
  | 'companies:read'   | 'companies:write'
  | 'projects:read'    | 'projects:write'
  | 'lists:read'       | 'lists:write'
  | 'segments:read'    | 'segments:write'
  | 'forms:read'       | 'forms:write'
  | 'consents:read'    | 'consents:write'
  | 'campaigns:read'   | 'campaigns:write'  | 'campaigns:send'
  | 'templates:read'   | 'templates:write'
  | 'suppression:read' | 'suppression:write'
  | 'reports:read'
  | 'automations:read' | 'automations:write'
  | 'events:read'      | 'events:write'
  | 'settings:read'    | 'settings:write'

const VIEWER: Permission[] = [
  'dashboard:read',
  'contacts:read', 'companies:read', 'projects:read',
  'lists:read', 'segments:read', 'forms:read', 'consents:read',
  'campaigns:read', 'templates:read', 'suppression:read', 'reports:read',
  'automations:read', 'events:read',
  'settings:read',
]

const SALES: Permission[] = [
  ...VIEWER,
  'contacts:write', 'companies:write',
  'lists:write', 'events:write',
]

const MARKETING: Permission[] = [
  ...VIEWER,
  'contacts:read',            // intentionally no contacts:write for marketing
  'lists:write', 'segments:write', 'forms:write',
  'campaigns:write', 'campaigns:send',
  'templates:write',
  'suppression:write',
  'automations:write', 'events:write',
]

const ADMIN: Permission[] = [
  ...new Set([...VIEWER, ...SALES, ...MARKETING]),
  'contacts:write', 'companies:write', 'projects:write',
  'consents:write',
  'settings:write',
]

const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  admin:     new Set(ADMIN),
  marketing: new Set(MARKETING),
  sales:     new Set(SALES),
  viewer:    new Set(VIEWER),
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false
}

export function getPermissions(role: UserRole): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])]
}

/** Minimum role that satisfies a permission — useful for UI gate text */
export function minimumRoleFor(permission: Permission): UserRole | null {
  for (const role of ['viewer', 'sales', 'marketing', 'admin'] as UserRole[]) {
    if (hasPermission(role, permission)) return role
  }
  return null
}
