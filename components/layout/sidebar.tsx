'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/nav-config'
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react'
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
  
  const pathname = usePathname()

  // Track expanded state for nested submenus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    // Pre-expand menus where the current active path resides
    const initial: Record<string, boolean> = {}
    NAV_ITEMS.forEach(item => {
      if (item.children && pathname.startsWith(item.href)) {
        initial[item.key] = true
      }
    })
    return initial
  })

  const { gymId, resetGym } = useGymStore()
  const router = useRouter()

  // Keep expanded menus up to date when pathname changes
  useEffect(() => {
    NAV_ITEMS.forEach(item => {
      if (item.children && pathname.startsWith(item.href)) {
        setExpandedMenus(prev => ({ ...prev, [item.key]: true }))
      }
    })
  }, [pathname])

  function handleCollapseToggle() {
    toggleSidebar()
  }

  const handleLinkClick = (e: React.MouseEvent, href: string, isParent = false, itemKey = '') => {
    if (pathname === '/gyms/new' && gymId && href !== '/gyms/new') {
      e.preventDefault()
      setPendingHref(href)
      setShowExitConfirm(true)
      return
    }

    if (isParent && !collapsed) {
      e.preventDefault()
      setExpandedMenus(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))
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
                const hasChildren = !!item.children
                const isExpanded = !!expandedMenus[item.key]
                
                // Parent item is highlighted if any of its children are active or if the parent itself is active
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : hasChildren
                      ? pathname.startsWith(item.href)
                      : pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <li key={item.key} className="w-full flex flex-col items-center">
                    <Link
                      href={hasChildren && collapsed ? item.children![0].href : item.href}
                      onClick={(e) => handleLinkClick(e, hasChildren && collapsed ? item.children![0].href : item.href, hasChildren, item.key)}
                      className={cn(
                        'group flex items-center rounded-lg transition-all duration-300 relative',
                        // If it has children and is expanded, we don't highlight the parent button unless a child is selected
                        isActive && (!hasChildren || collapsed)
                          ? 'bg-white border border-[#00b4cc] text-black shadow-sm'
                          : 'text-black hover:bg-slate-50',
                        collapsed 
                          ? 'w-[44px] h-[40px] justify-center px-0' 
                          : 'w-full h-[40px] px-4 justify-between gap-3',
                      )}
                      aria-current={isActive && (!hasChildren || collapsed) ? 'page' : undefined}
                    >
                      <div className="flex items-center gap-3">
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
                      </div>

                      {/* Expand/Collapse Chevron Indicator */}
                      {hasChildren && !collapsed && (
                        <div className="shrink-0 text-gray-500 hover:text-black">
                          {isExpanded ? (
                            <ChevronUp size={16} strokeWidth={2} />
                          ) : (
                            <ChevronDown size={16} strokeWidth={2} />
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Sub-menu rendering */}
                    {hasChildren && isExpanded && !collapsed && (
                      <ul className="w-full flex flex-col gap-2 mt-2 pl-4 transition-all duration-300">
                        {item.children!.map((child) => {
                          const isChildActive = pathname === child.href

                          return (
                            <li key={child.key} className="w-full flex justify-center">
                              <Link
                                href={child.href}
                                onClick={(e) => handleLinkClick(e, child.href)}
                                className={cn(
                                  'group flex items-center rounded-lg transition-all duration-300 w-[144px] h-[36px] px-3 gap-3.5',
                                  isChildActive
                                    ? 'bg-[#00b4cc]/10 text-[#00b4cc]'
                                    : 'text-black hover:bg-slate-50',
                                )}
                              >
                                {/* Active/Inactive bullet dot indicator */}
                                <span 
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                                    isChildActive ? "bg-[#00b4cc]" : "bg-[#cecfd2] group-hover:bg-gray-500"
                                  )} 
                                />
                                <span className="text-[13px] leading-[20px] font-medium whitespace-nowrap overflow-hidden">
                                  {t.nav[child.labelKey]}
                                </span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
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
