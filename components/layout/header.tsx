'use client'

import { Search, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiPost } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'
import Image from 'next/image'

export function Header() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  
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
    <header className="mx-6 mt-[53px] mb-8 h-20 rounded-[16px] bg-[#00B4CC26] px-4 flex items-center justify-between gap-4 transition-all duration-300">
      {/* Left: Profile Chip */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-[44px] h-[44px] rounded-full bg-white border border-[#ececed] flex items-center justify-center text-[16px] font-medium text-black">
          {initials}
        </div>
        <div className="text-[16px] leading-[24px] text-black font-normal">
          {user?.name || (user?.role === 'SUPER_ADMIN' ? 'Owner' : 'Admin')}
        </div>
      </div>

      {/* Middle: Search bar */}
      <div className="flex-1 max-w-[829px] h-12 bg-[#fafafa] rounded-[12px] border border-[#ececed] flex items-center px-6 gap-3">
        <div className="w-6 h-6 flex items-center justify-center opacity-60">
           <Search size={20} className="text-black" />
        </div>
        <input
          type="text"
          placeholder="Ümumi axtarış....."
          className="flex-1 bg-transparent border-none outline-none text-[16px] text-black placeholder:text-black/60"
        />
      </div>

      {/* Right: Exit Action */}
      <div className="flex items-center gap-4 shrink-0">
         <button 
           onClick={handleLogout}
           className="flex items-center gap-1 text-[#F10303] hover:opacity-80 transition-opacity"
         >
            <div className="w-5 h-5 flex items-center justify-center">
               <LogOut size={16} />
            </div>
            <span className="text-[16px] leading-[24px]">Çıxış</span>
         </button>
      </div>
    </header>
  )
}
