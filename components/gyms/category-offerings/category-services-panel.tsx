"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  useCategoryServices,
  useSaveCategoryServices,
} from "@/lib/query/use-gym-category-offerings";
import { useSupportedServices } from "@/lib/query/gym-query";
import type { CategoryOfferingsCopy } from "@/lib/i18n/category-offerings";
import styles from "./category-offerings.module.css";

export function CategoryServicesPanel({
  gymId,
  categoryId,
  copy,
}: {
  gymId: number;
  categoryId: number;
  copy: CategoryOfferingsCopy;
}) {
  const all = useSupportedServices(gymId);
  const linked = useCategoryServices(gymId, categoryId);
  const save = useSaveCategoryServices(gymId, categoryId);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setSelected(new Set((linked.data ?? []).map((s) => s.id)));
    setDirty(false);
  }, [linked.data, categoryId]);

  const catalog = useMemo(() => {
    const rows = all.data ?? [];
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }, [all.data]);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDirty(true);
  };

  const onSave = async () => {
    try {
      await save.mutateAsync({ serviceIds: [...selected] });
      setDirty(false);
      toast.success(copy.saved);
    } catch (e) {
      toast.error(e instanceof ApiError && e.message ? e.message : copy.saveFailed);
    }
  };

  if (all.isLoading || linked.isLoading) {
    return <div className={styles.busy}>{copy.loading}</div>;
  }
  if (all.isError || linked.isError) {
    return <div className={styles.busy}>{copy.failed}</div>;
  }

  return (
    <div>
      <div className={styles.notice}>{copy.servicesHelp}</div>
      {catalog.length === 0 ? (
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
                  onChange={() => toggle(service.id)}
                />
                <span>{service.name}</span>
              </label>
            );
          })}
        </div>
      )}
      <div className={styles.actions}>
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
  );
}
