'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/nav-config'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import { useGymStore } from '@/lib/store/gym-store'
import { useUIStore } from '@/lib/store/ui-store'
import { useRouter } from 'next/navigation'
import { ExitConfirmationModal } from '../gyms/modals/exit-confirmation-modal'

interface SidebarProps {
  className?: string
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ className }: SidebarProps) {
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const { gymId, resetGym } = useGymStore()
  const router = useRouter()
  const pathname = usePathname()

  function handleCollapseToggle() {
    toggleSidebar()
  }

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (pathname === '/gyms/new' && gymId && href !== '/gyms/new') {
      e.preventDefault()
      setPendingHref(href)
      setShowExitConfirm(true)
      return
    }
    setMobileOpen(false)
  }

  const handleConfirmExit = () => {
    resetGym()
    setShowExitConfirm(false)
    if (pendingHref) {
      router.push(pendingHref)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#ececed] text-[#00b4cc] shadow-sm lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-[110] flex h-screen flex-col bg-white border-r border-[#ececed] transition-all duration-500 ease-in-out font-sans overflow-hidden shadow-sm',
          collapsed ? 'w-[110px]' : 'w-[272px]',
          // Mobile: translate off-screen unless open
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          className,
        )}
        aria-label="Main navigation"
      >
        {/* Logo area */}
        <div className="relative w-full h-[150px] shrink-0">
          <div className={cn(
            "absolute transition-all duration-500",
            collapsed ? "top-[60px] left-[35px]" : "top-[71px] left-[25.5px]"
          )}>
            <div className="flex items-center gap-4">
               <div className="relative h-[34px] w-[34px] md:h-[41px] md:w-[41px] shrink-0">
                  <Image src="/Sidebar/Group 11.svg" fill alt="Logo" className="object-contain" />
               </div>
               {!collapsed && (
                 <span className="text-[30px] font-semibold text-[#00b4cc] leading-[46px] animate-in fade-in slide-in-from-left-2 duration-500 whitespace-nowrap">
                   FitNest
                 </span>
               )}
            </div>
          </div>
          
          {/* Collapse/Expand Toggle - Visible when collapsed */}
          {collapsed && (
            <button
              onClick={handleCollapseToggle}
              className="absolute top-[115px] left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center transition-all"
            >
              <Image src="/menu.svg" width={28} height={28} alt="Expand" />
            </button>
          )}
          
          {/* Collapse/Expand Toggle - Visible when expanded */}
          {!collapsed && (
            <button 
              onClick={handleCollapseToggle}
              className="absolute top-[71px] right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
               <div className="h-[46px] flex items-center justify-center">
                  <Image src="/Sidebar/X.svg" width={24} height={24} alt="Collapse" />
               </div>
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden pb-10 flex flex-col items-center">
            <ul className={cn(
              "flex flex-col transition-all duration-500 w-full px-4 items-center gap-5",
            )} role="list">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <li key={item.key} className="w-full flex justify-center">
                    <Link
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className={cn(
                        'group flex items-center rounded-[12px] transition-all duration-300 relative',
                        isActive
                          ? 'bg-white border border-[#00b4cc] text-black shadow-sm'
                          : 'text-black hover:bg-slate-50',
                        collapsed 
                          ? 'w-[60px] h-[48px] justify-center px-0' 
                          : 'w-[184px] h-[48px] px-6 gap-3',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className={cn(
                        "shrink-0 transition-all duration-300",
                        isActive ? "text-[#00b4cc]" : "text-black opacity-80"
                      )}>
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      
                      {!collapsed && (
                        <span className={cn(
                          "text-[16px] leading-[24px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                          isActive ? "font-semibold" : "font-normal"
                        )}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
        </nav>
      </aside>

      {showExitConfirm && (
        <ExitConfirmationModal
          onConfirm={handleConfirmExit}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}
    </>
  )
}
