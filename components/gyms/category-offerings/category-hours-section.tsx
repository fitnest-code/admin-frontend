"use client";

import { useEffect, useState } from "react";
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
  useCategoryWorkHours,
  useSaveCategoryWorkHours,
} from "@/lib/query/use-gym-category-offerings";
import {
  WORK_HOUR_PERIODS,
  type GymCategoryChip,
  type GymCategoryWorkHour,
} from "@/lib/types/category-offerings";
import { useGymCategoryChips } from "./use-gym-category-chips";
import styles from "./category-offerings.module.css";

function normalizeTime(value: string) {
  const t = value.trim();
  if (!t) return "";
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function toDraft(rows: GymCategoryWorkHour[] | undefined) {
  const map = new Map(
    (rows ?? []).map((r) => [r.period.toUpperCase(), r] as const),
  );
  return WORK_HOUR_PERIODS.map((period) => {
    const row = map.get(period);
    return {
      period,
      from: normalizeTime(row?.from ?? ""),
      to: normalizeTime(row?.to ?? ""),
    };
  });
}

function HoursModal({
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
  const hours = useCategoryWorkHours(gymId, chip.categoryId);
  const save = useSaveCategoryWorkHours(gymId, chip.categoryId);
  const [draft, setDraft] = useState(() => toDraft(undefined));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(toDraft(hours.data));
    setDirty(false);
  }, [open, hours.data, chip.categoryId]);

  const payload = () =>
    draft
      .filter((row) => row.from.trim() && row.to.trim())
      .map((row) => ({
        period: row.period,
        from: normalizeTime(row.from),
        to: normalizeTime(row.to),
      }));

  const persist = async (workHours: GymCategoryWorkHour[]) => {
    try {
      await save.mutateAsync({ workHours });
      toast.success(copy.saved);
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError && e.message ? e.message : copy.saveFailed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`sm:max-w-[480px] ${styles.dialog}`}>
        <DialogHeader>
          <DialogTitle>
            {copy.hours}: {chip.name}
          </DialogTitle>
        </DialogHeader>
        <div className={styles.modalBody}>
          <p className={styles.modalHint}>{copy.hoursHelp}</p>
          {hours.isLoading ? (
            <div className={styles.busy}>{copy.loading}</div>
          ) : hours.isError ? (
            <div className={styles.busy}>{copy.failed}</div>
          ) : (
            <div className={styles.fieldGrid}>
              {draft.map((row) => (
                <div key={row.period} className={styles.dayRow}>
                  <div className={styles.dayLabel}>
                    {copy.days[row.period] ?? row.period}
                  </div>
                  <input
                    type="time"
                    className={styles.input}
                    value={row.from}
                    disabled={save.isPending}
                    onChange={(e) => {
                      setDraft((prev) =>
                        prev.map((r) =>
                          r.period === row.period
                            ? { ...r, from: e.target.value }
                            : r,
                        ),
                      );
                      setDirty(true);
                    }}
                  />
                  <input
                    type="time"
                    className={styles.input}
                    value={row.to}
                    disabled={save.isPending}
                    onChange={(e) => {
                      setDraft((prev) =>
                        prev.map((r) =>
                          r.period === row.period
                            ? { ...r, to: e.target.value }
                            : r,
                        ),
                      );
                      setDirty(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={save.isPending}
              onClick={() => persist([])}
            >
              {copy.clearHours}
            </button>
            <button type="button" className={styles.secondary} onClick={onClose}>
              {copy.cancel}
            </button>
            <button
              type="button"
              className={styles.button}
              disabled={save.isPending || !dirty}
              onClick={() => persist(payload())}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CategoryHoursSection({ gymId }: { gymId: number }) {
  const copy = useCategoryOfferingsCopy();
  const { chips, isLoading, isError } = useGymCategoryChips(gymId);
  const [editing, setEditing] = useState<GymCategoryChip | null>(null);

  // Hours overrides matter most for subcategory gyms; still show for multi-main.
  if (!isLoading && !isError && chips.length < 2 && !chips.some((c) => c.role === "SUB")) {
    return null;
  }

  return (
    <section className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.heading}>
          <div>
            <h2 className={styles.title}>{copy.hoursTitle}</h2>
            <p className={styles.subtitle}>{copy.hoursSubtitle}</p>
          </div>
        </div>
        {isLoading ? (
          <div className={styles.busy}>{copy.loading}</div>
        ) : isError ? (
          <div className={styles.busy}>{copy.failed}</div>
        ) : chips.length === 0 ? (
          <p className={styles.muted}>{copy.emptyCategories}</p>
        ) : (
          <div className={styles.list}>
            {chips.map((chip) => (
              <div key={chip.categoryId} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowName}>{chip.name}</div>
                  <div className={styles.rowMeta}>{copy.hoursRowHint}</div>
                </div>
                <span
                  className={`${styles.badge} ${chip.role === "SUB" ? styles.badgeSub : ""}`}
                >
                  {chip.role === "MAIN" ? copy.main : copy.sub}
                </span>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={copy.editHours}
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
        <HoursModal
          gymId={gymId}
          chip={editing}
          open
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
