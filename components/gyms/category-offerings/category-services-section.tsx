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
  useCategoryServices,
  useSaveCategoryServices,
} from "@/lib/query/use-gym-category-offerings";
import { useSupportedServices } from "@/lib/query/gym-query";
import type { GymCategoryChip } from "@/lib/types/category-offerings";
import { useGymCategoryChips } from "./use-gym-category-chips";
import styles from "./category-offerings.module.css";

function ServicesModal({
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
  const all = useSupportedServices(gymId);
  const linked = useCategoryServices(gymId, chip.categoryId);
  const save = useSaveCategoryServices(gymId, chip.categoryId);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set((linked.data ?? []).map((s) => s.id)));
    setDirty(false);
  }, [open, linked.data, chip.categoryId]);

  const catalog = useMemo(
    () => [...(all.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [all.data],
  );

  const onSave = async () => {
    try {
      await save.mutateAsync({ serviceIds: [...selected] });
      toast.success(copy.saved);
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError && e.message ? e.message : copy.saveFailed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`sm:max-w-[520px] ${styles.dialog}`}>
        <DialogHeader>
          <DialogTitle>
            {copy.services}: {chip.name}
          </DialogTitle>
        </DialogHeader>
        <div className={styles.modalBody}>
          <p className={styles.modalHint}>{copy.servicesHelp}</p>
          {all.isLoading || linked.isLoading ? (
            <div className={styles.busy}>{copy.loading}</div>
          ) : all.isError || linked.isError ? (
            <div className={styles.busy}>{copy.failed}</div>
          ) : catalog.length === 0 ? (
            <p className={styles.muted}>{copy.noServices}</p>
          ) : (
            <div className={styles.serviceGrid}>
              {catalog.map((service) => {
                const on = selected.has(service.id);
                return (
                  <label
                    key={service.id}
                    className={`${styles.serviceItem} ${on ? styles.serviceOn : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={save.isPending}
                      onChange={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(service.id)) next.delete(service.id);
                          else next.add(service.id);
                          return next;
                        });
                        setDirty(true);
                      }}
                    />
                    <span>{service.name}</span>
                  </label>
                );
              })}
            </div>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              {copy.cancel}
            </button>
            <button
              type="button"
              className={styles.button}
              disabled={save.isPending || !dirty}
              onClick={onSave}
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

export function CategoryServicesSection({ gymId }: { gymId: number }) {
  const copy = useCategoryOfferingsCopy();
  const { chips, isLoading, isError } = useGymCategoryChips(gymId);
  const [editing, setEditing] = useState<GymCategoryChip | null>(null);

  if (!isLoading && !isError && chips.length === 0) return null;

  return (
    <section className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.heading}>
          <div>
            <h2 className={styles.title}>{copy.servicesTitle}</h2>
            <p className={styles.subtitle}>{copy.servicesSubtitle}</p>
          </div>
        </div>
        {isLoading ? (
          <div className={styles.busy}>{copy.loading}</div>
        ) : isError ? (
          <div className={styles.busy}>{copy.failed}</div>
        ) : (
          <div className={styles.list}>
            {chips.map((chip) => (
              <div key={chip.categoryId} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowName}>{chip.name}</div>
                  <div className={styles.rowMeta}>{copy.servicesRowHint}</div>
                </div>
                <span
                  className={`${styles.badge} ${chip.role === "SUB" ? styles.badgeSub : ""}`}
                >
                  {chip.role === "MAIN" ? copy.main : copy.sub}
                </span>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={copy.editServices}
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
        <ServicesModal
          gymId={gymId}
          chip={editing}
          open
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
