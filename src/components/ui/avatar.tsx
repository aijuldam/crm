import { cn, getInitials, generateAvatarColor } from '@/lib/utils'

interface AvatarProps {
  firstName?: string | null
  lastName?: string | null
  email?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ firstName, lastName, email = '', size = 'md', className }: AvatarProps) {
  const initials = getInitials(firstName, lastName, email)
  const colorClass = generateAvatarColor(email || initials)

  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold flex-shrink-0 select-none',
        sizes[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  )
}
