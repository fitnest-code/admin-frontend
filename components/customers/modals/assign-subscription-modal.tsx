'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, Loader2, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { useRawSubscriptionPackages, useAdminAssignSubscription, BackendPackageOption } from '@/lib/query/use-subscriptions'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

interface AssignSubscriptionModalProps {
  userId: number
  onClose: () => void
  onSuccess: () => void
}

export function AssignSubscriptionModal({ userId, onClose, onSuccess }: AssignSubscriptionModalProps) {
  const [mounted, setMounted] = useState(false)
  const t = useT()

  const { data: packages = [], isLoading: loadingPackages } = useRawSubscriptionPackages()
  const assignMutation = useAdminAssignSubscription()

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  const [autoPaymentEnabled, setAutoPaymentEnabled] = useState(false)
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  })

  // Filter out inactive packages
  const activePackages = packages.filter((p) => p.is_active !== false)

  // Find currently selected package details
  const selectedPackage = activePackages.find((p) => p.package_id === selectedPlanId)

  // Filter active options of selected package
  const activeOptions = (selectedPackage?.duration_options || []).filter((o) => o.is_active !== false)

  // Automatically select first plan and option when loaded
  useEffect(() => {
    if (activePackages.length > 0 && selectedPlanId === null) {
      const firstPkg = activePackages[0]
      setSelectedPlanId(firstPkg.package_id ?? null)
      
      const firstOpt = (firstPkg.duration_options || []).filter((o) => o.is_active !== false)[0]
      if (firstOpt) {
        setSelectedOptionId(firstOpt.option_id ?? null)
      }
    }
  }, [activePackages, selectedPlanId])

  // Reset selected option when plan changes
  const handlePlanChange = (planId: number) => {
    setSelectedPlanId(planId)
    const pkg = activePackages.find((p) => p.package_id === planId)
    const opts = (pkg?.duration_options || []).filter((o) => o.is_active !== false)
    if (opts.length > 0) {
      setSelectedOptionId(opts[0].option_id ?? null)
    } else {
      setSelectedOptionId(null)
    }
    setAutoPaymentEnabled(false)
  }

  // Get currently selected option
  const selectedOption = activeOptions.find((o) => o.option_id === selectedOptionId)
  const showAutoPayment = selectedOption?.duration_months === 1

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPlanId || !selectedOptionId) return

    try {
      await assignMutation.mutateAsync({
        userId,
        planId: selectedPlanId,
        optionId: selectedOptionId,
        autoPaymentEnabled: showAutoPayment ? autoPaymentEnabled : false,
      })

      setModalConfig({
        isOpen: true,
        message: t.modals.assignSuccess || 'Abunəlik uğurla təyin edildi.',
        type: 'success',
      })

      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setModalConfig({
        isOpen: true,
        message: err.message || t.modals.assignError || 'Abunəlik təyin edilərkən xəta baş verdi.',
        type: 'error',
      })
    }
  }

  if (!mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[548px] rounded-[12px] bg-white flex flex-col p-8 gap-6 shadow-2xl animate-in zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full text-left">
          <div className="border-b border-border pb-3">
            <h3 className="text-[24px] font-bold text-[#131212] leading-[36px]">
              {t.modals.assignSubscriptionTitle || 'Abunəlik təyin et'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t.modals.userIdLabel || 'İstifadəçi ID:'} <span className="font-semibold text-foreground">{userId}</span>
            </p>
          </div>

          {loadingPackages ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
              <span className="text-sm text-muted-foreground">{t.modals.loading || 'Yüklənir...'}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Select Package */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold text-foreground">
                  {t.modals.selectPackage || 'Paket seçin'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activePackages.map((pkg) => {
                    const isSelected = selectedPlanId === pkg.package_id
                    return (
                      <button
                        key={pkg.package_id}
                        type="button"
                        onClick={() => pkg.package_id && handlePlanChange(pkg.package_id)}
                        className={cn(
                          'flex items-center justify-center p-4 rounded-lg border text-center transition-all duration-200 outline-none cursor-pointer',
                          isSelected
                            ? 'border-[#00B4CC] bg-[#00B4CC]/5 text-[#00B4CC] font-semibold'
                            : 'border-[#cecfd2]/60 bg-white text-foreground hover:bg-slate-50'
                        )}
                      >
                        <span className="text-sm font-bold">{pkg.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Select Option */}
              {selectedPlanId && activeOptions.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-semibold text-foreground">
                    {t.modals.selectOption || 'Variant seçin'}
                  </label>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {activeOptions.map((opt) => {
                      const isSelected = selectedOptionId === opt.option_id
                      return (
                        <button
                          key={opt.option_id}
                          type="button"
                          onClick={() => opt.option_id && setSelectedOptionId(opt.option_id)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3.5 rounded-lg border text-left transition-all duration-200 outline-none cursor-pointer',
                            isSelected
                              ? 'border-[#00B4CC] bg-[#00B4CC]/5 text-[#00B4CC] font-semibold'
                              : 'border-[#cecfd2]/60 bg-white text-foreground hover:bg-slate-50'
                          )}
                        >
                          <span className="text-sm font-medium">{opt.duration_months} ay</span>
                          <div
                            className={cn(
                              'h-4 w-4 rounded-full border flex items-center justify-center transition-all',
                              isSelected ? 'border-[#00B4CC] bg-[#00B4CC]' : 'border-[#cecfd2]'
                            )}
                          >
                            {isSelected && <Check size={10} className="text-white font-bold" strokeWidth={3} />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-5 pt-3 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={assignMutation.isPending}
              className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-white border border-[#00b4cc] flex items-center justify-center px-4 transition-all hover:bg-slate-50 disabled:opacity-55 cursor-pointer text-[16px] font-medium text-black"
            >
              {t.modals.cancel}
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending || loadingPackages || !selectedPlanId || !selectedOptionId}
              className="flex-1 h-[48px] max-w-[250px] rounded-[10px] bg-[#00b4cc] flex items-center justify-center px-4 transition-all hover:opacity-90 shadow-md shadow-cyan-100 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer text-[16px] font-medium text-white"
            >
              {assignMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{t.modals.loading}</span>
                </div>
              ) : (
                t.modals.save
              )}
            </button>
          </div>
        </form>
      </div>

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  )

  return createPortal(modalContent, document.body)
}
