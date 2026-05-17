'use client'

import { Search, LogOut, User, Menu } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { apiPost } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUIStore } from '@/lib/store/ui-store'
import { NAV_ITEMS } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  
  const mobileSidebarOpen = useUIStore((state) => state.mobileSidebarOpen)
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen)
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
    <header className="relative mx-6 mt-6 mb-6 h-[60px] rounded-xl bg-[#00B4CC26] px-5 flex items-center justify-between gap-4 transition-all duration-300">
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

      {/* Mobile Dropdown Menu */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          {/* Dropdown Menu Container */}
          <div className="absolute top-[72px] left-0 right-0 z-50 bg-white border border-[#ececed] rounded-xl shadow-xl p-4 lg:hidden animate-in fade-in slide-in-from-top-5 duration-300 max-h-[70vh] overflow-y-auto">
            <ul className="grid grid-cols-2 gap-3" role="list">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <li key={item.key} className="w-full">
                    <Link
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 border',
                        isActive
                          ? 'bg-white border-[#00b4cc] text-black shadow-sm'
                          : 'bg-slate-50 border-transparent text-black hover:bg-slate-100',
                      )}
                    >
                      <div className="shrink-0 text-black w-[18px] h-[18px] relative flex items-center justify-center animate-in duration-300">
                        {item.iconPath ? (
                          <Image src={item.iconPath} fill alt={item.label} className="object-contain" />
                        ) : (
                          <Icon size={18} strokeWidth={2} />
                        )}
                      </div>
                      <span className="text-[13px] font-medium leading-none truncate text-slate-800">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </header>
  )
}
