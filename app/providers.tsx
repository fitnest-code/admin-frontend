'use client'

import { useState, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/query/query-client'
import { Toaster, toast } from 'sonner'
import { ErrorToastModal } from '@/components/categories/modals/error-toast-modal'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  const [globalError, setGlobalError] = useState<string | null>(null)

  useEffect(() => {
    // Intercept toast.error globally to trigger the beautiful full-screen Lottie modal
    // instead of standard small corner toast notifications.
    const originalError = toast.error
    toast.error = (message: any, data?: any) => {
      const msgString = typeof message === 'string' ? message : message?.toString() || "Xəta baş verdi"
      setGlobalError(msgString)
      return "error-toast"
    }

    return () => {
      toast.error = originalError
    }
  }, [])

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
      {globalError && (
        <ErrorToastModal 
          message={globalError} 
          onClose={() => setGlobalError(null)} 
        />
      )}
    </QueryClientProvider>
  )
}
