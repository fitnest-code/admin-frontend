"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  useCategoryWorkHours,
  useSaveCategoryWorkHours,
} from "@/lib/query/use-gym-category-offerings";
import type { CategoryOfferingsCopy } from "@/lib/i18n/category-offerings";
import {
  WORK_HOUR_PERIODS,
  type GymCategoryWorkHour,
} from "@/lib/types/category-offerings";
import styles from "./category-offerings.module.css";

function normalizeTime(value: string) {
  const t = value.trim();
  if (!t) return "";
  // Accept HH:mm or HH:mm:ss from backend; store HH:mm for inputs.
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

export function CategoryHoursPanel({
  gymId,
  categoryId,
  copy,
}: {
  gymId: number;
  categoryId: number;
  copy: CategoryOfferingsCopy;
}) {
  const hours = useCategoryWorkHours(gymId, categoryId);
  const save = useSaveCategoryWorkHours(gymId, categoryId);
  const [draft, setDraft] = useState(() => toDraft(undefined));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(toDraft(hours.data));
    setDirty(false);
  }, [hours.data, categoryId]);

  const onChange = (period: string, field: "from" | "to", value: string) => {
    setDraft((prev) =>
      prev.map((row) =>
        row.period === period ? { ...row, [field]: value } : row,
      ),
    );
    setDirty(true);
  };

  const payloadFromDraft = () =>
    draft
      .filter((row) => row.from.trim() && row.to.trim())
      .map((row) => ({
        period: row.period,
        from: normalizeTime(row.from),
        to: normalizeTime(row.to),
      }));

  const onSave = async (workHours: GymCategoryWorkHour[]) => {
    try {
      await save.mutateAsync({ workHours });
      setDirty(false);
      toast.success(copy.saved);
    } catch (e) {
      toast.error(e instanceof ApiError && e.message ? e.message : copy.saveFailed);
    }
  };

  if (hours.isLoading) return <div className={styles.busy}>{copy.loading}</div>;
  if (hours.isError) return <div className={styles.busy}>{copy.failed}</div>;

  return (
    <div>
      <div className={styles.notice}>{copy.hoursHelp}</div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{copy.period}</th>
              <th>{copy.from}</th>
              <th>{copy.to}</th>
            </tr>
          </thead>
          <tbody>
            {draft.map((row) => (
              <tr key={row.period}>
                <td>{copy.days[row.period] ?? row.period}</td>
                <td>
                  <input
                    type="time"
                    className={styles.time}
                    value={row.from}
                    disabled={save.isPending}
                    onChange={(e) => onChange(row.period, "from", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className={styles.time}
                    value={row.to}
                    disabled={save.isPending}
                    onChange={(e) => onChange(row.period, "to", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          disabled={save.isPending}
          onClick={() => onSave([])}
        >
          {copy.clearHours}
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={save.isPending || !dirty}
          onClick={() => onSave(payloadFromDraft())}
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
