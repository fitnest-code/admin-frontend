"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/client";
import { useCategoryOfferingsCopy } from "@/lib/i18n/category-offerings";
import {
  useCategoryPrices,
  useSaveCategoryPrice,
} from "@/lib/query/use-gym-category-offerings";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import type { GymCategoryChip } from "@/lib/types/category-offerings";
import { monthStartIso } from "@/lib/types/category-offerings";
import { useGymCategoryChips } from "./use-gym-category-chips";
import styles from "./category-offerings.module.css";

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "";
  return String(n);
}

function parseMoney(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function PriceModal({
  gymId,
  chip,
  includedPackageIds,
  open,
  onClose,
}: {
  gymId: number;
  chip: GymCategoryChip;
  includedPackageIds: number[];
  open: boolean;
  onClose: () => void;
}) {
  const copy = useCategoryOfferingsCopy();
  const packages = useSubscriptionPackages();
  const prices = useCategoryPrices(gymId, chip.categoryId);
  const save = useSaveCategoryPrice(gymId, chip.categoryId);
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [dirty, setDirty] = useState(false);

  const included = useMemo(() => new Set(includedPackageIds), [includedPackageIds]);
  const packageList = useMemo(
    () =>
      [...(packages.data ?? [])]
        .filter((pkg) => included.has(pkg.id))
        .sort((a, b) => a.id - b.id),
    [packages.data, included],
  );

  useEffect(() => {
    if (!open) return;
    const next: Record<number, string> = {};
    for (const pkg of packageList) {
      const row = (prices.data ?? []).find((p) => p.packageId === pkg.id);
      next[pkg.id] = money(row?.singlePrice);
    }
    setDraft(next);
    setDirty(false);
  }, [open, packageList, prices.data, chip.categoryId]);

  const onSaveAll = async () => {
    try {
      for (const pkg of packageList) {
        const raw = draft[pkg.id] ?? "";
        const singlePrice = parseMoney(raw);
        if ((raw.trim() && singlePrice == null) || (singlePrice != null && singlePrice < 0)) {
          toast.error(copy.saveFailed);
          return;
        }
        await save.mutateAsync({
          packageId: pkg.id,
          singlePrice,
          unlimitedPrice: null,
          effectiveFrom: monthStartIso(),
        });
      }
      toast.success(copy.saved);
      setDirty(false);
      onClose();
    } catch (e) {
      toast.error(
        e instanceof ApiError && e.message ? e.message : copy.saveFailed,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`sm:max-w-[560px] ${styles.dialog}`}>
        <DialogHeader>
          <DialogTitle>
            {copy.prices}: {chip.name}
          </DialogTitle>
        </DialogHeader>
        <div className={styles.modalBody}>
          <p className={styles.modalHint}>{copy.subPriceHelp}</p>
          {prices.isLoading || packages.isLoading ? (
            <div className={styles.busy}>{copy.loading}</div>
          ) : prices.isError || packages.isError ? (
            <div className={styles.busy}>{copy.failed}</div>
          ) : packageList.length === 0 ? (
            <p className={styles.muted}>{copy.noIncludedPackages}</p>
          ) : (
            <div className={styles.fieldGridSingle}>
              <div className={styles.fieldRowSingle}>
                <span className={styles.fieldLabel}>{copy.package}</span>
                <span className={styles.fieldLabel}>{copy.entry}</span>
              </div>
              {packageList.map((pkg) => {
                const value = draft[pkg.id] ?? "";
                return (
                  <div key={pkg.id} className={styles.fieldRowSingle}>
                    <div className={styles.pkgName}>{pkg.name}</div>
                    <label className={styles.price}>
                      <input
                        inputMode="decimal"
                        disabled={save.isPending}
                        value={value}
                        placeholder="0.00"
                        onChange={(e) => {
                          setDraft((prev) => ({
                            ...prev,
                            [pkg.id]: e.target.value,
                          }));
                          setDirty(true);
                        }}
                      />
                      <span>₼</span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              {copy.cancel}
            </button>
            {packageList.length > 0 ? (
              <button
                type="button"
                className={styles.button}
                disabled={save.isPending || !dirty}
                onClick={onSaveAll}
              >
                {save.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {copy.saving}
                  </>
                ) : (
                  copy.save
                )}
              </button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryPricesSection({
  gymId,
  includedPackageIds = [],
}: {
  gymId: number;
  /** Only these packages get subcategory prices; empty = no editable packages yet. */
  includedPackageIds?: number[];
}) {
  const copy = useCategoryOfferingsCopy();
  const { chips, isLoading, isError, hasSubs } = useGymCategoryChips(gymId);
  const [editing, setEditing] = useState<GymCategoryChip | null>(null);

  // Dual-main / multi-offer gyms still need the section; MAIN rows stay view-only (no pencil).
  const showSection =
    hasSubs || chips.filter((c) => c.role === "MAIN").length > 1;
  if (!isLoading && !isError && !showSection) return null;

  return (
    <section className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.heading}>
          <div>
            <h2 className={styles.title}>{copy.pricesTitle}</h2>
            <p className={styles.subtitle}>{copy.pricesSubtitle}</p>
          </div>
        </div>
        {isLoading ? (
          <div className={styles.busy}>{copy.loading}</div>
        ) : isError ? (
          <div className={styles.busy}>{copy.failed}</div>
        ) : !hasSubs ? (
          <p className={styles.muted}>{copy.pricesMainOnlyHint}</p>
        ) : includedPackageIds.length === 0 ? (
          <p className={styles.muted}>{copy.noIncludedPackages}</p>
        ) : (
          <div className={styles.list}>
            {chips
              .filter((c) => c.role === "SUB" || chips.length > 1)
              .map((chip) => {
                const editable = chip.role === "SUB";
                return (
                  <div key={chip.categoryId} className={styles.row}>
                    <div className={styles.rowMain}>
                      <div className={styles.rowName}>{chip.name}</div>
                      <div className={styles.rowMeta}>
                        {editable
                          ? copy.subPriceRowHint
                          : copy.mainPriceRowHint}
                      </div>
                    </div>
                    <span
                      className={`${styles.badge} ${
                        editable ? styles.badgeSub : ""
                      }`}
                    >
                      {editable ? copy.sub : copy.main}
                    </span>
                    {editable ? (
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label={copy.editPrices}
                        onClick={() => setEditing(chip)}
                      >
                        <Pencil size={15} />
                      </button>
                    ) : (
                      <span className={styles.iconBtnSpacer} aria-hidden />
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
      {editing ? (
        <PriceModal
          gymId={gymId}
          chip={editing}
          includedPackageIds={includedPackageIds}
          open
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
