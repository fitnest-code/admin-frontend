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
  open,
  onClose,
}: {
  gymId: number;
  chip: GymCategoryChip;
  open: boolean;
  onClose: () => void;
}) {
  const copy = useCategoryOfferingsCopy();
  const readOnly = chip.role === "MAIN";
  const packages = useSubscriptionPackages();
  const prices = useCategoryPrices(gymId, chip.categoryId);
  const save = useSaveCategoryPrice(gymId, chip.categoryId);
  const [draft, setDraft] = useState<
    Record<number, { singlePrice: string; unlimitedPrice: string }>
  >({});
  const [dirty, setDirty] = useState(false);

  const packageList = useMemo(
    () => [...(packages.data ?? [])].sort((a, b) => a.id - b.id),
    [packages.data],
  );

  useEffect(() => {
    if (!open) return;
    const next: typeof draft = {};
    for (const pkg of packageList) {
      const row = (prices.data ?? []).find((p) => p.packageId === pkg.id);
      next[pkg.id] = {
        singlePrice: money(row?.singlePrice),
        unlimitedPrice: money(row?.unlimitedPrice),
      };
    }
    setDraft(next);
    setDirty(false);
  }, [open, packageList, prices.data, chip.categoryId]);

  const onSaveAll = async () => {
    try {
      for (const pkg of packageList) {
        const row = draft[pkg.id];
        if (!row) continue;
        const singlePrice = parseMoney(row.singlePrice);
        const unlimitedPrice = parseMoney(row.unlimitedPrice);
        if (
          (row.singlePrice.trim() && singlePrice == null) ||
          (row.unlimitedPrice.trim() && unlimitedPrice == null) ||
          (singlePrice != null && singlePrice < 0) ||
          (unlimitedPrice != null && unlimitedPrice < 0)
        ) {
          toast.error(copy.saveFailed);
          return;
        }
        await save.mutateAsync({
          packageId: pkg.id,
          singlePrice,
          unlimitedPrice,
          effectiveFrom: monthStartIso(),
        });
      }
      toast.success(copy.saved);
      setDirty(false);
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError && e.message ? e.message : copy.saveFailed);
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
          <p className={styles.modalHint}>
            {readOnly ? copy.mainPriceNote : copy.subPriceHelp}
          </p>
          {prices.isLoading || packages.isLoading ? (
            <div className={styles.busy}>{copy.loading}</div>
          ) : prices.isError || packages.isError ? (
            <div className={styles.busy}>{copy.failed}</div>
          ) : (
            <div className={styles.fieldGrid}>
              <div className={styles.fieldRow}>
                <span className={styles.fieldLabel}>{copy.package}</span>
                <span className={styles.fieldLabel}>{copy.entry}</span>
                <span className={styles.fieldLabel}>{copy.monthly}</span>
              </div>
              {packageList.map((pkg) => {
                const row = draft[pkg.id] ?? {
                  singlePrice: "",
                  unlimitedPrice: "",
                };
                return (
                  <div key={pkg.id} className={styles.fieldRow}>
                    <div className={styles.pkgName}>{pkg.name}</div>
                    <label className={styles.price}>
                      <input
                        inputMode="decimal"
                        disabled={readOnly || save.isPending}
                        value={row.singlePrice}
                        onChange={(e) => {
                          setDraft((prev) => ({
                            ...prev,
                            [pkg.id]: { ...row, singlePrice: e.target.value },
                          }));
                          setDirty(true);
                        }}
                      />
                      <span>₼</span>
                    </label>
                    <label className={styles.price}>
                      <input
                        inputMode="decimal"
                        disabled={readOnly || save.isPending}
                        value={row.unlimitedPrice}
                        onChange={(e) => {
                          setDraft((prev) => ({
                            ...prev,
                            [pkg.id]: {
                              ...row,
                              unlimitedPrice: e.target.value,
                            },
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
            {!readOnly ? (
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

export function CategoryPricesSection({ gymId }: { gymId: number }) {
  const copy = useCategoryOfferingsCopy();
  const { chips, isLoading, isError, hasSubs } = useGymCategoryChips(gymId);
  const [editing, setEditing] = useState<GymCategoryChip | null>(null);

  // Only show when gym has subcategory offerings to configure (or dual-main picker).
  const visible = chips.filter((c) => c.role === "SUB" || chips.length > 1);
  if (!isLoading && !isError && visible.length === 0) return null;

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
        ) : !hasSubs && visible.every((c) => c.role === "MAIN") ? (
          <p className={styles.muted}>{copy.pricesMainOnlyHint}</p>
        ) : (
          <div className={styles.list}>
            {visible.map((chip) => (
              <div key={chip.categoryId} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowName}>{chip.name}</div>
                  <div className={styles.rowMeta}>
                    {chip.role === "MAIN"
                      ? copy.mainPriceRowHint
                      : copy.subPriceRowHint}
                  </div>
                </div>
                <span
                  className={`${styles.badge} ${chip.role === "SUB" ? styles.badgeSub : ""}`}
                >
                  {chip.role === "MAIN" ? copy.main : copy.sub}
                </span>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={copy.editPrices}
                  onClick={() => setEditing(chip)}
                >
                  <Pencil size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {editing ? (
        <PriceModal
          gymId={gymId}
          chip={editing}
          open
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
