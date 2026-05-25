'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/store/ui-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { apiGet } from '@/lib/api/client'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebarCollapsed } = useUIStore()
  const user = useAuthStore((state) => state.user)
  const roleUpper = user?.role?.toUpperCase()
  const isGymAdmin = roleUpper === 'ROLE_GYM_SUPER_ADMIN' || 
                     roleUpper === 'ROLE_GYM_ADMIN' || 
                     roleUpper === 'GYM_SUPER_ADMIN' || 
                     roleUpper === 'GYM_ADMIN'
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [gyms, setGyms] = useState<any[] | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isGymAdmin) {
      if (gyms) {
        const currentGymMatch = pathname.match(/^\/gyms\/(\d+)/)
        const currentGymId = currentGymMatch ? Number(currentGymMatch[1]) : null
        const hasAccess = gyms.some((g: any) => g.id === currentGymId)
        
        if (!hasAccess) {
          const defaultGymId = gyms[0]?.id
          if (defaultGymId) {
            router.replace(`/gyms/${defaultGymId}`)
          }
        } else {
          setIsResolving(false)
        }
        return
      }

      setIsResolving(true)
      apiGet<any>('/admin/gyms/list')
        .then(res => {
          const items = res?.items || []
          setGyms(items)
          if (items.length > 0) {
            const currentGymMatch = pathname.match(/^\/gyms\/(\d+)/)
            const currentGymId = currentGymMatch ? Number(currentGymMatch[1]) : null
            const hasAccess = items.some((g: any) => g.id === currentGymId)
            
            if (!hasAccess) {
              router.replace(`/gyms/${items[0].id}`)
            } else {
               setIsResolving(false)
            }
          } else {
            setIsResolving(false)
          }
        })
        .catch(() => {
          setIsResolving(false)
        })
    }
  }, [mounted, isGymAdmin, pathname, router, gyms])

  if (!mounted || (isGymAdmin && isResolving)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00B4CC] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {!isGymAdmin && <Sidebar />}

      {/* Main content — offset by sidebar width */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-500 ease-in-out',
          // On desktop, push content right of sidebar
          isGymAdmin ? 'lg:pl-0' : (sidebarCollapsed ? 'lg:pl-[80px]' : 'lg:pl-[230px]'),
          // On mobile, no padding (sidebar overlays)
          'pl-0',
        )}
      >
        <Header />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          role="main"
          id="main-content"
        >
          {isResolving ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00B4CC] border-t-transparent" />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}
