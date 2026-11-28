"use client";

import { useCategoryAnalytics } from "@/lib/query/use-gym-category-offerings";
import { useCategoryOfferingsCopy } from "@/lib/i18n/category-offerings";
import styles from "./category-offerings.module.css";

function formatMoney(n: number) {
  return `${Number(n || 0).toFixed(2)} ₼`;
}

export function CategoryAnalyticsTable({
  gymId,
  startDate,
  endDate,
}: {
  gymId: number | string;
  startDate?: string;
  endDate?: string;
}) {
  const copy = useCategoryOfferingsCopy();
  const id = Number(gymId);
  const query = useCategoryAnalytics(
    id,
    startDate || undefined,
    endDate || undefined,
  );

  return (
    <section className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.heading}>
          <div>
            <h2 className={styles.title}>{copy.analyticsTitle}</h2>
            <p className={styles.subtitle}>{copy.analyticsSubtitle}</p>
          </div>
        </div>

        {query.isLoading ? (
          <div className={styles.busy}>{copy.loading}</div>
        ) : query.isError ? (
          <div className={styles.busy}>{copy.failed}</div>
        ) : !query.data || query.data.categories.length === 0 ? (
          <p className={styles.muted}>{copy.noAnalytics}</p>
        ) : (
          <>
            <div className={styles.analyticsTotals}>
              <div>
                <strong>{copy.total}</strong>
                {' '}
                {copy.okScans}: {query.data.totalSuccessfulScans}
              </div>
              <div>
                {copy.failScans}: {query.data.totalFailedScans}
              </div>
              <div>
                {copy.revenue}: {formatMoney(query.data.totalRevenue)}
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{copy.category}</th>
                    <th>{copy.okScans}</th>
                    <th>{copy.failScans}</th>
                    <th>{copy.revenue}</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.categories.map((row) => (
                    <tr key={row.categoryKey}>
                      <td>
                        {row.categoryKey === "legacy"
                          ? copy.legacy
                          : row.categoryName || `#${row.categoryId}`}
                      </td>
                      <td>{row.successfulScans}</td>
                      <td>{row.failedScans}</td>
                      <td>{formatMoney(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
