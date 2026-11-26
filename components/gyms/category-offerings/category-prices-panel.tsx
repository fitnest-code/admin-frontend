"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  useCategoryPrices,
  useSaveCategoryPrice,
} from "@/lib/query/use-gym-category-offerings";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import type { CategoryOfferingsCopy } from "@/lib/i18n/category-offerings";
import type { CategoryRole } from "@/lib/types/category-offerings";
import { monthStartIso } from "@/lib/types/category-offerings";
import styles from "./category-offerings.module.css";

type Draft = Record<number, { singlePrice: string; unlimitedPrice: string }>;

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

export function CategoryPricesPanel({
  gymId,
  categoryId,
  role,
  copy,
}: {
  gymId: number;
  categoryId: number;
  role: CategoryRole;
  copy: CategoryOfferingsCopy;
}) {
  const readOnly = role === "MAIN";
  const packages = useSubscriptionPackages();
  const prices = useCategoryPrices(gymId, categoryId);
  const save = useSaveCategoryPrice(gymId, categoryId);
  const [draft, setDraft] = useState<Draft>({});
  const [dirtyPackageId, setDirtyPackageId] = useState<number | null>(null);

  const packageList = useMemo(() => {
    const rows = packages.data ?? [];
    return [...rows].sort((a, b) => a.id - b.id);
  }, [packages.data]);

  useEffect(() => {
    const next: Draft = {};
    for (const pkg of packageList) {
      const row = (prices.data ?? []).find((p) => p.packageId === pkg.id);
      next[pkg.id] = {
        singlePrice: money(row?.singlePrice),
        unlimitedPrice: money(row?.unlimitedPrice),
      };
    }
    setDraft(next);
    setDirtyPackageId(null);
  }, [packageList, prices.data, categoryId]);

  const busy = prices.isLoading || packages.isLoading;
  const failed = prices.isError || packages.isError;

  const onChange = (
    packageId: number,
    field: "singlePrice" | "unlimitedPrice",
    value: string,
  ) => {
    setDraft((prev) => ({
      ...prev,
      [packageId]: { ...prev[packageId], [field]: value },
    }));
    setDirtyPackageId(packageId);
  };

  const onSave = async (packageId: number) => {
    const row = draft[packageId];
    if (!row) return;
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
    try {
      await save.mutateAsync({
        packageId,
        singlePrice,
        unlimitedPrice,
        effectiveFrom: monthStartIso(),
      });
      setDirtyPackageId(null);
      toast.success(copy.saved);
    } catch (e) {
      const msg =
        e instanceof ApiError && e.message ? e.message : copy.saveFailed;
      toast.error(msg);
    }
  };

  if (busy) return <div className={styles.busy}>{copy.loading}</div>;
  if (failed) return <div className={styles.busy}>{copy.failed}</div>;

  return (
    <div>
      <div className={readOnly ? `${styles.notice} ${styles.noticeMuted}` : styles.notice}>
        {readOnly ? copy.mainPriceNote : copy.subPriceHelp}
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{copy.package}</th>
              <th>{copy.entry}</th>
              <th>{copy.monthly}</th>
              {!readOnly ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {packageList.map((pkg) => {
              const row = draft[pkg.id] ?? { singlePrice: "", unlimitedPrice: "" };
              return (
                <tr key={pkg.id}>
                  <td>{pkg.name}</td>
                  <td>
                    <label className={`${styles.price} ${readOnly ? styles.priceReadonly : ""}`}>
                      <input
                        inputMode="decimal"
                        value={row.singlePrice}
                        disabled={readOnly || save.isPending}
                        onChange={(e) => onChange(pkg.id, "singlePrice", e.target.value)}
                        aria-label={`${pkg.name} ${copy.entry}`}
                      />
                      <span>₼</span>
                    </label>
                  </td>
                  <td>
                    <label className={`${styles.price} ${readOnly ? styles.priceReadonly : ""}`}>
                      <input
                        inputMode="decimal"
                        value={row.unlimitedPrice}
                        disabled={readOnly || save.isPending}
                        onChange={(e) => onChange(pkg.id, "unlimitedPrice", e.target.value)}
                        aria-label={`${pkg.name} ${copy.monthly}`}
                      />
                      <span>₼</span>
                    </label>
                  </td>
                  {!readOnly ? (
                    <td>
                      <button
                        type="button"
                        className={styles.button}
                        disabled={save.isPending || dirtyPackageId !== pkg.id}
                        onClick={() => onSave(pkg.id)}
                      >
                        {save.isPending && dirtyPackageId === pkg.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            {copy.saving}
                          </>
                        ) : (
                          copy.save
                        )}
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
