"use client";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { TimeInput24 } from "@/components/ui/time-input-24";
import { SubscriptionBadge } from "@/components/ui/subscription-badge";
import {
  DAYS,
  type Day,
  type PolicyDraft,
  type Tier,
  type WorkingHours,
} from "@/lib/types/membership";
import {
  dayHasWork,
  editorWindows,
  formatWorkHoursHint,
  isCompleteWindow,
  nextEmptyWindow,
  setPackageWindows,
  tierName,
  windowFitsWorkHours,
  type PackageAccessWindow,
} from "@/lib/membership/policy";
import { membershipDays, useMembershipCopy } from "@/lib/i18n/membership";
import { useI18nStore } from "@/lib/i18n";
import { Notice } from "./shared";
import styles from "./membership.module.css";

export function TimeRulesEditor({
  draft,
  hours,
  onChange,
  onWorkHours,
  disabled,
}: {
  draft: PolicyDraft;
  hours?: WorkingHours;
  onChange: (next: PolicyDraft | ((prev: PolicyDraft) => PolicyDraft)) => void;
  onWorkHours: () => void;
  disabled: boolean;
}) {
  const c = useMembershipCopy();
  const locale = useI18nStore((s) => s.locale);
  const dayLabels = membershipDays[locale];
  const included = draft.packages.filter((p) => p.included);
  const byTier = editorWindows(draft);
  const workHint = hours ? formatWorkHoursHint(hours, dayLabels) : "";

  const write = (tier: Tier, windows: PackageAccessWindow[]) =>
    onChange((prev) => setPackageWindows(prev, tier, windows));

  const rejectOutside = () => toast.error(c.errorCoverage);

  const tryPatchWindow = (
    tier: Tier,
    index: number,
    patch: Partial<PackageAccessWindow>,
  ) => {
    const next = { ...byTier[tier][index], ...patch };
    if (hours && isCompleteWindow(next) && !windowFitsWorkHours(next, hours)) {
      rejectOutside();
      return;
    }
    const windows = byTier[tier].map((w, i) =>
      i === index ? next : w,
    );
    write(tier, windows);
  };

  const addRange = (tier: Tier, windows: PackageAccessWindow[]) => {
    if (!hours) {
      toast.error(c.errorHours);
      onWorkHours();
      return;
    }
    const created = nextEmptyWindow(windows, hours);
    if (!created) {
      toast.error(c.errorHours);
      onWorkHours();
      return;
    }
    write(tier, [...windows, created]);
  };

  const toggleDay = (
    tier: Tier,
    index: number,
    day: Day,
    current: PackageAccessWindow,
  ) => {
    const enabling = !current.days.includes(day);
    if (enabling && hours && !dayHasWork(hours, day)) {
      toast.error(c.errorDayClosed);
      return;
    }
    const days = DAYS.filter((x) =>
      x === day ? enabling : current.days.includes(x),
    ) as Day[];
    tryPatchWindow(tier, index, { days });
  };

  return (
    <section className={styles.panel} aria-labelledby="time-rules-heading">
      <div className={styles.heading}>
        <div>
          <h2 id="time-rules-heading" className={styles.title}>
            {c.timeTitle}
          </h2>
          <p className={styles.subtitle}>{c.timeSubtitle}</p>
        </div>
        <label className={styles.inline}>
          <span className={styles.muted}>{c.enableTime}</span>
          <Switch
            aria-label={c.enableTime}
            checked={draft.timeRulesEnabled}
            disabled={disabled}
            onCheckedChange={(value) =>
              onChange((prev) => ({ ...prev, timeRulesEnabled: value }))
            }
          />
        </label>
      </div>
      {!draft.timeRulesEnabled ? (
        <Notice>{c.timeOff}</Notice>
      ) : (
        <div className={styles.packageHours}>
          {!included.length && (
            <Notice tone="warning">{c.errorIncluded}</Notice>
          )}
          {!hours ? (
            <Notice tone="warning">
              {c.errorHours}{" "}
              <button type="button" className={styles.link} onClick={onWorkHours}>
                {c.workHours}
              </button>
            </Notice>
          ) : (
            <Notice>
              {c.workHoursBound}
              {workHint ? ` ${workHint}` : ""}
            </Notice>
          )}
          {included.map((pkg) => {
            const windows = byTier[pkg.tier] ?? [];
            return (
              <div key={pkg.tier} className={styles.packageBlock}>
                <div className={styles.packageBlockHead}>
                  <SubscriptionBadge type={tierName(pkg.tier)} />
                  <button
                    type="button"
                    className={styles.ghost}
                    disabled={disabled || !hours}
                    onClick={() => addRange(pkg.tier, windows)}
                  >
                    <Plus size={14} />
                    {c.addRange}
                  </button>
                </div>
                {!windows.length ? (
                  <p className={styles.emptyHint}>{c.noPackageHours}</p>
                ) : (
                  <div className={styles.windowList}>
                    {windows.map((w, index) => {
                      const outside =
                        !!hours &&
                        isCompleteWindow(w) &&
                        !windowFitsWorkHours(w, hours);
                      return (
                        <div
                          key={`${pkg.tier}-${index}`}
                          className={styles.windowCard}
                          aria-label={`${tierName(pkg.tier)} ${index + 1}`}
                          data-invalid={outside || undefined}
                          style={
                            outside
                              ? { outline: "1px solid #e11d48", outlineOffset: 2 }
                              : undefined
                          }
                        >
                          {outside && (
                            <Notice tone="error">{c.errorCoverage}</Notice>
                          )}
                          <div className={styles.days}>
                            {DAYS.map((day, d) => {
                              const closed =
                                !!hours && !dayHasWork(hours, day);
                              return (
                                <button
                                  type="button"
                                  key={day}
                                  aria-label={`${day} ${pkg.tier} ${index + 1}`}
                                  aria-pressed={w.days.includes(day)}
                                  disabled={disabled || (closed && !w.days.includes(day))}
                                  title={closed ? c.errorDayClosed : undefined}
                                  className={styles.day}
                                  style={
                                    closed
                                      ? { opacity: 0.35, cursor: "not-allowed" }
                                      : undefined
                                  }
                                  onClick={() =>
                                    toggleDay(pkg.tier, index, day, w)
                                  }
                                >
                                  {dayLabels[d]}
                                </button>
                              );
                            })}
                          </div>
                          <div className={styles.windowTimes}>
                            <TimeInput24
                              aria-label={`${c.start} ${pkg.tier} ${index + 1}`}
                              className={styles.input}
                              value={w.start}
                              disabled={disabled}
                              onChange={(start) =>
                                tryPatchWindow(pkg.tier, index, { start })
                              }
                            />
                            <span className={styles.muted}>–</span>
                            <TimeInput24
                              aria-label={`${c.end} ${pkg.tier} ${index + 1}`}
                              className={styles.input}
                              value={w.end}
                              disabled={disabled}
                              onChange={(end) =>
                                tryPatchWindow(pkg.tier, index, { end })
                              }
                            />
                            <button
                              type="button"
                              className={styles.iconDanger}
                              aria-label={`${c.remove} ${pkg.tier} ${index + 1}`}
                              disabled={disabled}
                              onClick={() =>
                                write(
                                  pkg.tier,
                                  windows.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <button type="button" onClick={onWorkHours} className={styles.link}>
            {c.workHours}
          </button>
        </div>
      )}
    </section>
  );
}
