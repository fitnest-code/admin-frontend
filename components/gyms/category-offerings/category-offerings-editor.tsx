"use client";

import { useEffect, useMemo, useState } from "react";
import { useGymDetailsAdmin } from "@/lib/query/gym-query";
import { useCategoryOfferingsCopy } from "@/lib/i18n/category-offerings";
import type { GymCategoryChip } from "@/lib/types/category-offerings";
import { CategoryPricesPanel } from "./category-prices-panel";
import { CategoryHoursPanel } from "./category-hours-panel";
import { CategoryServicesPanel } from "./category-services-panel";
import styles from "./category-offerings.module.css";

type Panel = "prices" | "hours" | "services";

function buildChips(
  mains: { id: number; name: string }[] | undefined,
  subs: { id: number; name: string }[] | undefined,
): GymCategoryChip[] {
  const out: GymCategoryChip[] = [];
  const seen = new Set<number>();
  for (const c of mains ?? []) {
    if (!c?.id || seen.has(c.id)) continue;
    seen.add(c.id);
    out.push({ categoryId: c.id, name: c.name, role: "MAIN" });
  }
  for (const c of subs ?? []) {
    if (!c?.id || seen.has(c.id)) continue;
    seen.add(c.id);
    out.push({ categoryId: c.id, name: c.name, role: "SUB" });
  }
  return out;
}

export function CategoryOfferingsEditor({ gymId }: { gymId: number }) {
  const copy = useCategoryOfferingsCopy();
  const details = useGymDetailsAdmin(gymId);
  const chips = useMemo(
    () =>
      buildChips(
        details.data?.mainCategories,
        details.data?.subCategories,
      ),
    [details.data?.mainCategories, details.data?.subCategories],
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [panel, setPanel] = useState<Panel>("prices");

  useEffect(() => {
    if (!chips.length) {
      setActiveId(null);
      return;
    }
    if (activeId == null || !chips.some((c) => c.categoryId === activeId)) {
      setActiveId(chips[0].categoryId);
    }
  }, [chips, activeId]);

  const active = chips.find((c) => c.categoryId === activeId) ?? null;

  if (details.isLoading) {
    return (
      <section className={styles.root}>
        <div className={styles.panel}>
          <div className={styles.busy}>{copy.loading}</div>
        </div>
      </section>
    );
  }

  if (details.isError) {
    return (
      <section className={styles.root}>
        <div className={styles.panel}>
          <div className={styles.busy}>{copy.failed}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.heading}>
          <div>
            <h2 className={styles.title}>{copy.title}</h2>
            <p className={styles.subtitle}>{copy.subtitle}</p>
          </div>
        </div>

        {chips.length === 0 ? (
          <div className={`${styles.notice} ${styles.noticeMuted}`}>
            {copy.emptyCategories}
          </div>
        ) : (
          <>
            <div className={styles.chips} role="tablist" aria-label={copy.title}>
              {chips.map((chip) => {
                const on = chip.categoryId === activeId;
                return (
                  <button
                    key={chip.categoryId}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    className={`${styles.chip} ${on ? styles.chipActive : ""}`}
                    onClick={() => setActiveId(chip.categoryId)}
                  >
                    <span className={styles.role}>
                      {chip.role === "MAIN" ? copy.main : copy.sub}
                    </span>
                    {chip.name}
                  </button>
                );
              })}
            </div>

            <div className={styles.tabs} role="tablist">
              {(
                [
                  ["prices", copy.prices],
                  ["hours", copy.hours],
                  ["services", copy.services],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={panel === key}
                  className={`${styles.tab} ${panel === key ? styles.tabActive : ""}`}
                  onClick={() => setPanel(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {active ? (
              panel === "prices" ? (
                <CategoryPricesPanel
                  gymId={gymId}
                  categoryId={active.categoryId}
                  role={active.role}
                  copy={copy}
                />
              ) : panel === "hours" ? (
                <CategoryHoursPanel
                  gymId={gymId}
                  categoryId={active.categoryId}
                  copy={copy}
                />
              ) : (
                <CategoryServicesPanel
                  gymId={gymId}
                  categoryId={active.categoryId}
                  copy={copy}
                />
              )
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
