'use client'

import { Search, LogOut, User, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUIStore } from '@/lib/store/ui-store'
import Image from 'next/image'

export function Header() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar)
  
  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') ?? 'AS'

  async function handleLogout() {
    await apiPost('/api/auth/logout', undefined, { auth: false }).catch(() => null)
    clearSession()
    router.push('/login')
  }

  return (
    <header className="mx-6 mt-6 mb-6 h-[60px] rounded-xl bg-[#00B4CC26] px-5 flex items-center justify-between gap-4 transition-all duration-300">
      {/* Left: Profile Chip & Mobile Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden mr-1 p-1.5 text-[#00b4cc] hover:bg-[#00B4CC15] rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
        <div className="w-10 h-10 rounded-full bg-white border border-[#ececed] flex items-center justify-center text-[14px] font-medium text-black">
          {initials}
        </div>
        <div className="text-[14px] leading-[20px] text-black font-medium">
          {user?.name || (user?.role === 'SUPER_ADMIN' ? 'Owner' : 'Admin')}
        </div>
      </div>

      {/* Right: Exit Action */}
      <div className="flex items-center gap-4 shrink-0">
         <button 
           onClick={handleLogout}
           className="flex items-center gap-1.5 text-[#F10303] hover:opacity-80 transition-opacity font-medium cursor-pointer"
         >
            <div className="w-5 h-5 flex items-center justify-center">
               <LogOut size={16} />
            </div>
            <span className="text-[14px] leading-[20px] font-medium">Çıxış</span>
         </button>
      </div>
    </header>
  )
}
