'use client'

import { Search, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '../ui/button'
import { apiPost } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'

interface HeaderProps {
  className?: string
}

export function Header({ className = '' }: HeaderProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') ?? 'FN'

  async function handleLogout() {
    await apiPost('/api/auth/logout', undefined, { auth: false }).catch(() => null)
    clearSession()
    router.push('/login')
  }

  return (
    <header
      className={`flex h-20 items-center gap-4 border-b bg-[#00B4CC26] border-border px-4 md:px-6 ${className}`}
      role="banner"
    >
      {/* Search bar */}
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 max-w-xl">
        <Search size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          placeholder="Ümumi axtarış..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed"
          aria-label="Ümumi axtarış"
        />
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Çıxış button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          aria-label="Çıxış"
          className="hover:text-[#F10303] cursor-pointer"
        >
          <LogOut size={13} aria-hidden="true" />
          <span>Çıxış</span>
        </Button>

        {/* Owner avatar chip */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-[#00B4CC] text-white text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-xs font-medium text-foreground sm:block">
            {user?.name ?? 'FitNest Admin'}
          </span>
        </div>
      </div>
    </header>
  )
}
