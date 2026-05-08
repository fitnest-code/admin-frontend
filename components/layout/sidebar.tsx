'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FitNestLogo } from '@/components/brand/fitnest-logo'
import { NAV_ITEMS } from '@/lib/nav-config'
import { Menu, X } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
  className?: string
  onCollapseChange?: (collapsed: boolean) => void
}

import { useGymStore } from '@/lib/store/gym-store'
import { useRouter } from 'next/navigation'
import { ExitConfirmationModal } from '../gyms/modals/exit-confirmation-modal'

export function Sidebar({ className, onCollapseChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const { gymId, resetGym } = useGymStore()
  const router = useRouter()
  const pathname = usePathname()

  function handleCollapseToggle() {
    const next = !collapsed
    setCollapsed(next)
    onCollapseChange?.(next)
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
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-[#111318] text-[#A0ADB8] hover:text-white transition-colors lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col bg-[#111318] transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-[240px]',
          // Mobile: translate off-screen unless open
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          className,
        )}
        aria-label="Main navigation"
      >
        {/* Logo area */}
        <div
          className={cn(
            'flex h-20 items-center border-b border-[#1E2229] px-4',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          <FitNestLogo showText={!collapsed} />

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-[#A0ADB8] hover:text-white transition-colors lg:hidden"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={handleCollapseToggle}
            className={cn(
              'hidden h-7 w-7 items-center justify-center rounded-md text-[#A0ADB8] hover:text-white transition-colors lg:flex',
              collapsed && 'mt-0',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <TooltipProvider delayDuration={200}>
            <ul className="flex flex-col gap-1" role="list">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(item.href + '/')

                const linkContent = (
                  <Link
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#00B4CC26] text-[#00B4CC]'
                        : 'text-[#A0ADB8] hover:bg-[#1E2229] hover:text-white',
                      collapsed && 'justify-center px-2',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[#00B4CC]' : 'text-[#A0ADB8] group-hover:text-white',
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && (
                      <span className="truncate leading-relaxed">{item.label}</span>
                    )}
                    {/* Active indicator bar */}
                    {isActive && !collapsed && (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00B4CC]"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                )

                return (
                  <li key={item.key}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      linkContent
                    )}
                  </li>
                )
              })}
            </ul>
          </TooltipProvider>
        </nav>

        {/* Bottom: active indicator stripe */}
        <div className="h-px w-full bg-gradient-to-r from-[#624DE3] to-[#87CBF1] opacity-60" />
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
