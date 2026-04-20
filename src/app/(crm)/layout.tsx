import { Sidebar } from '@/components/layout/sidebar'
import { isMockMode } from '@/lib/config'

async function getCurrentUser() {
  if (isMockMode()) return { name: 'Local Admin', email: 'admin@localhost' }
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'
    return { name, email: user.email ?? '' }
  } catch {
    return null
  }
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="flex h-full">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
