"use client";
import { Plus, Trash2 } from "lucide-react";
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
  decomposeTimeRules,
  setPackageWindows,
  tierName,
  type PackageAccessWindow,
} from "@/lib/membership/policy";
import { membershipDays, useMembershipCopy } from "@/lib/i18n/membership";
import { useI18nStore } from "@/lib/i18n";
import { Notice } from "./shared";
import styles from "./membership.module.css";

function emptyWindow(): PackageAccessWindow {
  return { days: [DAYS[0]], start: "09:00", end: "17:00" };
}

export function TimeRulesEditor({
  draft,
  hours,
  onChange,
  onWorkHours,
  disabled,
}: {
  draft: PolicyDraft;
  hours?: WorkingHours;
  onChange: (next: PolicyDraft) => void;
  onWorkHours: () => void;
  disabled: boolean;
}) {
  const c = useMembershipCopy();
  const locale = useI18nStore((s) => s.locale);
  const included = draft.packages.filter((p) => p.included);
  const byTier = decomposeTimeRules(draft.timeRules);

  const write = (tier: Tier, windows: PackageAccessWindow[]) =>
    onChange(setPackageWindows(draft, tier, windows));

  const patchWindow = (
    tier: Tier,
    index: number,
    patch: Partial<PackageAccessWindow>,
  ) => {
    const windows = byTier[tier].map((w, i) =>
      i === index ? { ...w, ...patch } : w,
    );
    write(tier, windows);
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
              onChange({ ...draft, timeRulesEnabled: value })
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
          {included.map((pkg) => {
            const windows = byTier[pkg.tier] ?? [];
            return (
              <div key={pkg.tier} className={styles.packageBlock}>
                <div className={styles.packageBlockHead}>
                  <SubscriptionBadge type={tierName(pkg.tier)} />
                  <button
                    type="button"
                    className={styles.ghost}
                    disabled={disabled}
                    onClick={() => write(pkg.tier, [...windows, emptyWindow()])}
                  >
                    <Plus size={14} />
                    {c.addRange}
                  </button>
                </div>
                {!windows.length ? (
                  <p className={styles.emptyHint}>{c.noPackageHours}</p>
                ) : (
                  <div className={styles.windowList}>
                    {windows.map((w, index) => (
                      <div
                        key={`${pkg.tier}-${index}-${w.start}-${w.end}`}
                        className={styles.windowCard}
                        aria-label={`${tierName(pkg.tier)} ${index + 1}`}
                      >
                        <div className={styles.days}>
                          {DAYS.map((day, d) => (
                            <button
                              type="button"
                              key={day}
                              aria-label={`${day} ${pkg.tier} ${index + 1}`}
                              aria-pressed={w.days.includes(day)}
                              disabled={disabled}
                              className={styles.day}
                              onClick={() => {
                                const days = DAYS.filter((x) =>
                                  x === day
                                    ? !w.days.includes(x)
                                    : w.days.includes(x),
                                ) as Day[];
                                patchWindow(pkg.tier, index, { days });
                              }}
                            >
                              {membershipDays[locale][d]}
                            </button>
                          ))}
                        </div>
                        <div className={styles.windowTimes}>
                          <TimeInput24
                            aria-label={`${c.start} ${pkg.tier} ${index + 1}`}
                            className={styles.input}
                            value={w.start}
                            disabled={disabled}
                            onChange={(start) =>
                              patchWindow(pkg.tier, index, { start })
                            }
                          />
                          <span className={styles.muted}>–</span>
                          <TimeInput24
                            aria-label={`${c.end} ${pkg.tier} ${index + 1}`}
                            className={styles.input}
                            value={w.end}
                            disabled={disabled}
                            onChange={(end) =>
                              patchWindow(pkg.tier, index, { end })
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
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button type="button" onClick={onWorkHours} className={styles.link}>
            {c.workHours}
          </button>
          {!hours && <Notice tone="warning">{c.errorHours}</Notice>}
        </div>
      )}
    </section>
  );
}
