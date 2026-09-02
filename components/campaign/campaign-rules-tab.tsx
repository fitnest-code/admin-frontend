'use client'

import { useState } from 'react'
import { FileText, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { useCoinTerms } from '@/lib/query/use-coin-terms'
import { CoinSection, CoinTabLoader } from './campaign-coin-ui'
import { EditCoinTermsModal } from './edit-coin-terms-modal'

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function CampaignRulesTab({
  onNotify,
}: {
  onNotify: (message: string, type: 'success' | 'error') => void
}) {
  const t = useT()
  const c = t.campaign
  const { terms, isLoading, deleteTerms, isDeleting } = useCoinTerms()
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading || !terms) return <CoinTabLoader />

  const preview = stripHtml(terms.htmlContentAz || terms.htmlContentEn || terms.htmlContentRu)
  const hasContent = Boolean(preview)

  async function handleDelete() {
    if (!window.confirm(c.termsDeleteConfirm)) return
    try {
      await deleteTerms()
      onNotify(c.termsDeleted, 'success')
    } catch (e) {
      onNotify(e instanceof Error ? e.message : c.termsDeleteFailed, 'error')
    }
  }

  return (
    <>
      <div className="flex w-full max-w-3xl flex-col gap-5">
        <CoinSection title={c.termsSectionTitle} description={c.termsSectionHint}>
          <div className="rounded-xl border border-[#ececed]/80 bg-[#fafafa] p-4">
            {hasContent ? (
              <p className="line-clamp-4 text-[13px] leading-relaxed text-[#475467]">{preview}</p>
            ) : (
              <div className="flex items-center gap-3 py-4 text-[13px] text-[#98a2b3]">
                <FileText className="h-5 w-5 shrink-0" />
                <span>{c.termsEmpty}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => setEditOpen(true)}
              className="h-10 rounded-xl bg-[#00B4CC] px-5 text-[13px] font-medium hover:bg-[#00B4CC]/90"
            >
              <Pencil className="h-4 w-4" />
              {hasContent ? c.termsEdit : c.termsAdd}
            </Button>
            {hasContent ? (
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={handleDelete}
                className="h-10 rounded-xl border-[#ececed] bg-white text-[13px] font-medium text-[#b42318] hover:border-[#fecdca] hover:bg-[#fef3f2]"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {c.termsDelete}
              </Button>
            ) : null}
          </div>
        </CoinSection>
      </div>

      {editOpen ? (
        <EditCoinTermsModal onClose={() => setEditOpen(false)} onNotify={onNotify} />
      ) : null}
    </>
  )
}
