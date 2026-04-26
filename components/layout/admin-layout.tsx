'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main content — offset by sidebar width */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          // On desktop, push content right of sidebar
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[240px]',
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
          {children}
        </main>
      </div>
    </div>
  )
}
