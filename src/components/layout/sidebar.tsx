'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  Folders,
  List,
  Filter,
  FileText,
  ShieldCheck,
  Settings,
  ChevronRight,
  Send,
  LayoutTemplate,
  BarChart3,
  ShieldBan,
  Activity,
  Zap,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    label: 'CRM',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Contacts', href: '/contacts', icon: Users },
      { label: 'Companies', href: '/companies', icon: Building2 },
      { label: 'Projects', href: '/projects', icon: Folders },
      { label: 'Lists', href: '/lists', icon: List },
      { label: 'Segments', href: '/segments', icon: Filter },
      { label: 'Forms', href: '/forms', icon: FileText },
      { label: 'Compliance', href: '/compliance', icon: ShieldCheck },
    ],
  },
  {
    label: 'Email',
    items: [
      { label: 'Campaigns', href: '/campaigns', icon: Send },
      { label: 'Templates', href: '/templates', icon: LayoutTemplate },
      { label: 'Suppression', href: '/suppression', icon: ShieldBan },
      { label: 'Deliverability', href: '/deliverability', icon: Activity },
      { label: 'Reports', href: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Automations',
    items: [
      { label: 'Workflows',  href: '/automations', icon: Zap },
      { label: 'Events',     href: '/events',      icon: Radio },
    ],
  },
]

interface SidebarProps {
  user?: { name: string; email: string } | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white" stroke="currentColor" strokeWidth={2}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">CRM</p>
          <p className="text-xs text-slate-400 leading-tight">Internal Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group',
                      active
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && <ChevronRight className="h-3 w-3 opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-3 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        {user && (
          <div className="mt-3 flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
