'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useT } from '@/lib/i18n'
import {
  BOL_ODE_STATUSES,
  useBolOdeHistoryQuery,
  useBolOdeQuery,
  useUpdateBolOdeMutation,
  type BolOdeStatus,
} from '@/modules/bol-ode'

const STATUS_STYLES: Record<BolOdeStatus, string> = {
  NEW: 'bg-[#155EEF] text-white',
  PENDING: 'bg-[#EC972F] text-white',
  IN_REVIEW: 'bg-[#7C3AED] text-white',
  APPROVED: 'bg-[#166728] text-white',
  DECLINED: 'bg-[#B42318] text-white',
  CANCELLED: 'bg-[#94979C] text-white',
}

function statusLabel(t: ReturnType<typeof useT>['bolOde'], status: BolOdeStatus) {
  switch (status) {
    case 'NEW':
      return t.statusNew
    case 'PENDING':
      return t.statusPending
    case 'IN_REVIEW':
      return t.statusInReview
    case 'APPROVED':
      return t.statusApproved
    case 'DECLINED':
      return t.statusDeclined
    case 'CANCELLED':
      return t.statusCancelled
    default:
      return status
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('az-AZ', {
    timeZone: 'Asia/Baku',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function ReadField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-[#667085]">{label}</div>
      <div className="mt-1 text-sm text-[#101828]">{value || '—'}</div>
    </div>
  )
}

export function BolOdeDetailPage({ id }: { id: string }) {
  const t = useT().bolOde
  const detailQuery = useBolOdeQuery(id)
  const historyQuery = useBolOdeHistoryQuery(id)
  const updateMutation = useUpdateBolOdeMutation(id)

  const detail = detailQuery.data
  const [status, setStatus] = useState<BolOdeStatus>('NEW')
  const [assignedAdminUserId, setAssignedAdminUserId] = useState('')
  const [declineReason, setDeclineReason] = useState('')
  const [declineVisible, setDeclineVisible] = useState(true)
  const [internalNote, setInternalNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (!detail) return
    setStatus(detail.status)
    setAssignedAdminUserId(
      detail.assignedAdminUserId != null ? String(detail.assignedAdminUserId) : '',
    )
    setDeclineReason(detail.declineReason ?? '')
    setDeclineVisible(detail.declineReasonVisibleToCustomer !== false)
    setInternalNote(detail.internalNote ?? '')
  }, [detail])

  if (detailQuery.isLoading) {
    return <p className="text-sm text-[#667085]">{t.detailLoading}</p>
  }
  if (detailQuery.isError || !detail) {
    return (
      <div className="space-y-3">
        <Link href="/odenisler/birbank-bol-ode" className="text-sm text-[#155EEF]">
          ← {t.backToList}
        </Link>
        <p className="text-sm text-[#B42318]">{t.detailError}</p>
      </div>
    )
  }

  const declineEnabled = status === 'DECLINED'

  async function onSave() {
    setFormError(null)
    setSavedFlash(false)
    if (status === 'DECLINED' && !declineReason.trim()) {
      setFormError(t.declineReasonRequired)
      return
    }
    try {
      await updateMutation.mutateAsync({
        status,
        assignedAdminUserId: assignedAdminUserId.trim()
          ? Number(assignedAdminUserId.trim())
          : undefined,
        declineReason: declineEnabled ? declineReason.trim() : undefined,
        declineReasonVisibleToCustomer: declineEnabled ? declineVisible : undefined,
        internalNote: internalNote,
      })
      setSavedFlash(true)
    } catch {
      setFormError(t.saveError)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/odenisler/birbank-bol-ode" className="text-sm text-[#155EEF]">
            ← {t.backToList}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-[#1e2430]">{detail.displayId}</h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[detail.status]}`}
            >
              {statusLabel(t, detail.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#667085]">{formatDateTime(detail.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-[#EAECF0] bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#101828]">{t.customerData}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadField label={t.fin} value={detail.finCode} />
              <ReadField label={t.birthDate} value={detail.birthDate} />
              <ReadField label={t.extraPhone1} value={detail.extraPhone1} />
              <ReadField label={t.extraPhone2} value={detail.extraPhone2} />
            </div>
          </section>

          <section className="rounded-xl border border-[#EAECF0] bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#101828]">{t.consents}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <ReadField
                label={t.birbankConsent}
                value={detail.birbankConsentAccepted ? '✓' : '—'}
              />
              <ReadField
                label={t.mygovConsent}
                value={detail.mygovConsentAccepted ? '✓' : '—'}
              />
            </div>
          </section>

          <section className="rounded-xl border border-[#EAECF0] bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#101828]">{t.systemData}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadField label={t.packageName} value={detail.packageName} />
              <ReadField
                label={t.duration}
                value={
                  detail.durationMonths != null
                    ? `${detail.durationMonths} ${t.months}`
                    : null
                }
              />
              <ReadField
                label={t.amount}
                value={
                  detail.finalAmount != null ? `${detail.finalAmount} ₼` : null
                }
              />
              <ReadField
                label={t.contactPhone}
                value={
                  detail.contactPhone ? (
                    <a className="text-[#155EEF]" href={`tel:${detail.contactPhone}`}>
                      {detail.contactPhone}
                    </a>
                  ) : null
                }
              />
              <ReadField label={t.paymentReference} value={detail.paymentReference} />
            </div>
          </section>

          <section className="rounded-xl border border-[#EAECF0] bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#101828]">{t.history}</h2>
            {historyQuery.isLoading ? (
              <p className="text-sm text-[#667085]">...</p>
            ) : (historyQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-[#667085]">{t.historyEmpty}</p>
            ) : (
              <ol className="space-y-4 border-l border-[#D0D5DD] pl-4">
                {(historyQuery.data ?? []).map((event) => {
                  const actor =
                    event.actorType === 'ADMIN'
                      ? t.actorAdmin
                      : event.actorType === 'USER'
                        ? t.actorCustomer
                        : t.actorSystem
                  return (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-[#155EEF]" />
                      <div className="text-sm font-medium text-[#101828]">
                        {actor}
                        {event.actorUserId != null ? ` #${event.actorUserId}` : ''}
                        {event.message ? ` — ${event.message}` : ''}
                      </div>
                      <div className="text-xs text-[#667085]">
                        {formatDateTime(event.createdAt)}
                        {event.fromStatus || event.toStatus
                          ? ` · ${event.fromStatus ?? '—'} → ${event.toStatus ?? '—'}`
                          : ''}
                      </div>
                      {event.declineReason ? (
                        <div className="mt-1 text-xs text-[#B42318]">{event.declineReason}</div>
                      ) : null}
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-[#EAECF0] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#101828]">{t.manage}</h2>

          <label className="block text-sm">
            <span className="mb-1 block text-[#667085]">{t.status}</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BolOdeStatus)}
              className="h-10 w-full rounded-lg border border-[#D0D5DD] px-3"
            >
              {BOL_ODE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(t, s)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[#667085]">{t.assignedAdmin}</span>
            <input
              value={assignedAdminUserId}
              onChange={(e) => setAssignedAdminUserId(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#D0D5DD] px-3"
              inputMode="numeric"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[#667085]">{t.declineReason}</span>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              disabled={!declineEnabled}
              rows={4}
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2 disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
            />
          </label>

          <label
            className={`flex items-center gap-2 text-sm ${declineEnabled ? '' : 'opacity-50'}`}
          >
            <input
              type="checkbox"
              checked={declineVisible}
              disabled={!declineEnabled}
              onChange={(e) => setDeclineVisible(e.target.checked)}
            />
            {t.declineVisible}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[#667085]">{t.internalNote}</span>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[#D0D5DD] px-3 py-2"
            />
          </label>

          {formError ? <p className="text-sm text-[#B42318]">{formError}</p> : null}
          {savedFlash ? <p className="text-sm text-[#166728]">{t.saved}</p> : null}

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={updateMutation.isPending}
            className="h-10 w-full rounded-lg bg-[#155EEF] text-sm font-medium text-white disabled:opacity-60"
          >
            {updateMutation.isPending ? t.saving : t.save}
          </button>
        </aside>
      </div>
    </div>
  )
}
