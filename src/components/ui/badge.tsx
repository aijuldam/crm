import { cn } from '@/lib/utils'

type BadgeColor = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'amber' | 'gray' | 'indigo'

interface BadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  className?: string
  dot?: boolean
}

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
}

const dotColorMap: Record<BadgeColor, string> = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
  gray: 'bg-slate-400',
  indigo: 'bg-indigo-500',
}

export function Badge({ children, color = 'gray', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        colorMap[color],
        className
      )}
    >
      {dot && (
        <span className={cn('inline-block h-1.5 w-1.5 rounded-full flex-shrink-0', dotColorMap[color])} />
      )}
      {children}
    </span>
  )
}

export function LifecycleBadge({ stage }: { stage: string }) {
  const colorMap: Record<string, BadgeColor> = {
    lead: 'blue',
    prospect: 'purple',
    customer: 'green',
    evangelist: 'amber',
    churned: 'red',
  }
  const labels: Record<string, string> = {
    lead: 'Lead',
    prospect: 'Prospect',
    customer: 'Customer',
    evangelist: 'Evangelist',
    churned: 'Churned',
  }
  return <Badge color={colorMap[stage] ?? 'gray'} dot>{labels[stage] ?? stage}</Badge>
}

export function ConsentBadge({ status }: { status: string }) {
  const colorMap: Record<string, BadgeColor> = {
    opted_in: 'green',
    opted_out: 'red',
    pending: 'yellow',
    unsubscribed: 'gray',
  }
  const labels: Record<string, string> = {
    opted_in: 'Opted In',
    opted_out: 'Opted Out',
    pending: 'Pending',
    unsubscribed: 'Unsubscribed',
  }
  return <Badge color={colorMap[status] ?? 'gray'} dot>{labels[status] ?? status}</Badge>
}

export function ProjectTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, BadgeColor> = {
    b2c: 'indigo',
    b2b: 'blue',
    hybrid: 'purple',
  }
  return <Badge color={colorMap[type] ?? 'gray'}>{type.toUpperCase()}</Badge>
}
