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

import { useT } from '@/lib/i18n'

interface SidebarProps {
  className?: string
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ className }: SidebarProps) {
  const t = useT()
  const { 
    sidebarCollapsed: collapsed, 
    toggleSidebar,
  } = useUIStore()
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
      {/* Sidebar panel - desktop only */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col bg-white border-r border-[#ececed] transition-all duration-500 ease-in-out font-sans overflow-hidden shadow-sm hidden lg:flex',
          collapsed ? 'w-[80px]' : 'w-[230px]',
          className,
        )}
        aria-label="Main navigation"
      >
        {/* Logo area */}
        <div className="relative w-full h-[100px] shrink-0">
          <div className={cn(
            "absolute transition-all duration-500",
            collapsed ? "top-[34px] left-[24px]" : "top-[34px] left-[25.5px]"
          )}>
            <div className="flex items-center gap-3">
               <div className="relative h-[28px] w-[28px] md:h-[32px] md:w-[32px] shrink-0">
                  <Image src="/Sidebar/Group 11.svg" fill alt="Logo" className="object-contain" />
               </div>
               {!collapsed && (
                 <span className="text-[22px] font-semibold text-[#00b4cc] leading-[32px] animate-in fade-in slide-in-from-left-2 duration-500 whitespace-nowrap">
                   FitNest
                 </span>
               )}
            </div>
          </div>
          
          {/* Collapse/Expand Toggle - Visible when collapsed */}
          {collapsed && (
            <button
              onClick={handleCollapseToggle}
              className="absolute top-[68px] left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center transition-all"
            >
              <Image src="/menu.svg" width={24} height={24} alt="Expand" />
            </button>
          )}
          
          {/* Collapse/Expand Toggle - Visible when expanded */}
          {!collapsed && (
            <button 
              onClick={handleCollapseToggle}
              className="absolute top-[34px] right-5 text-slate-400 hover:text-slate-600 transition-colors"
            >
               <div className="h-[32px] flex items-center justify-center">
                  <Image src="/Sidebar/X.svg" width={20} height={20} alt="Collapse" />
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
                        'group flex items-center rounded-lg transition-all duration-300 relative',
                        isActive
                          ? 'bg-white border border-[#00b4cc] text-black shadow-sm'
                          : 'text-black hover:bg-slate-50',
                        collapsed 
                          ? 'w-[44px] h-[40px] justify-center px-0' 
                          : 'w-full h-[40px] px-4 gap-3',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="shrink-0 transition-all duration-300 text-black w-[20px] h-[20px] relative">
                      {item.iconPath ? (
                        <Image src={item.iconPath} fill alt={t.nav[item.labelKey]} className="object-contain" />
                      ) : (
                        <Icon size={20} strokeWidth={2} />
                      )}
                    </div>
                      
                      {!collapsed && (
                        <span className="text-[14px] leading-[22px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden">
                          {t.nav[item.labelKey]}
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
