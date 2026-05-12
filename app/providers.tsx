'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/query/query-client'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            background: '#fff',
            border: '1px solid #ececed',
            color: '#101828',
            fontSize: '16px',
            fontFamily: 'sans-serif'
          }
        }} 
      />
    </QueryClientProvider>
  )
}
