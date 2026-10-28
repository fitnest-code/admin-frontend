"use client";
import { useState } from "react";
import { Plus, RotateCcw, Trash2, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SubscriptionBadge } from "@/components/ui/subscription-badge";
import {
  DAYS,
  TIERS,
  type PolicyDraft,
  type TimeRule,
  type WorkingHours,
  type Tier,
} from "@/lib/types/membership";
import {
  defaultRules,
  minute,
  tierName,
  validatePolicy,
} from "@/lib/membership/policy";
import { membershipDays, useMembershipCopy } from "@/lib/i18n/membership";
import { useI18nStore } from "@/lib/i18n";
import { Notice } from "./shared";
import styles from "./membership.module.css";
import { useMembershipEditorState } from "@/lib/membership/editor-state";

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
  const [previewTier, setPreviewTier] = useState<Tier>("BRONZE");
  const [previewDay, setPreviewDay] = useState(DAYS[0]);
  const [previewTime, setPreviewTime] = useState("17:00");
  const included = draft.packages.filter((p) => p.included);
  const firstTier = included[0]?.tier ?? "BRONZE";
  const update = (index: number, patch: Partial<TimeRule>) =>
    onChange({
      ...draft,
      timeRules: draft.timeRules.map((r, i) =>
        i === index ? { ...r, ...patch } : r,
      ),
    });
  const reset = () => {
    if (hours)
      onChange({ ...draft, timeRules: defaultRules(hours, firstTier) });
  };
  const coverage = validatePolicy(draft, hours).filter((i) =>
    ["ranges", "overlap", "coverage", "hours", "tier"].includes(i.code),
  );
  const match = draft.timeRules.find(
    (r) =>
      r.days.includes(previewDay) &&
      minute(previewTime) >= minute(r.start) &&
      minute(previewTime) <= minute(r.end),
  );
  const price = match && draft.packages.find((p) => p.tier === match.priceTier);
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
              onChange({
                ...draft,
                timeRulesEnabled: value,
                timeRules:
                  value && !draft.timeRules.length && hours
                    ? defaultRules(hours, firstTier)
                    : draft.timeRules,
              })
            }
          />
        </label>
      </div>
      {!draft.timeRulesEnabled ? (
        <Notice>{c.timeOff}</Notice>
      ) : (
        <>
          <div className={styles.rules}>
            {draft.timeRules.map((r, index) => (
              <div
                key={index}
                className={styles.rule}
                aria-label={`${c.timeTitle} ${index + 1}`}
              >
                <div className={styles.label}>
                  {c.days}
                  <div className={styles.days}>
                    {DAYS.map((day, d) => (
                      <button
                        type="button"
                        key={day}
                        aria-label={`${day} ${index + 1}`}
                        aria-pressed={r.days.includes(day)}
                        disabled={disabled}
                        className={styles.day}
                        onClick={() =>
                          update(index, {
                            days: DAYS.filter((x) =>
                              x === day
                                ? !r.days.includes(x)
                                : r.days.includes(x),
                            ),
                          })
                        }
                      >
                        {membershipDays[locale][d]}
                      </button>
                    ))}
                  </div>
                </div>
                <label className={styles.label}>
                  {c.start}
                  <input
                    aria-label={`${c.start} ${index + 1}`}
                    className={styles.input}
                    type="time"
                    value={r.start}
                    disabled={disabled}
                    onChange={(e) => update(index, { start: e.target.value })}
                  />
                </label>
                <label className={styles.label}>
                  {c.end}
                  <input
                    aria-label={`${c.end} ${index + 1}`}
                    className={styles.input}
                    type="time"
                    value={r.end}
                    disabled={disabled}
                    onChange={(e) => update(index, { end: e.target.value })}
                  />
                </label>
                <div className={styles.label}>
                  {c.allowed}
                  <div className={styles.tiers}>
                    {TIERS.map((tier) => (
                      <button
                        type="button"
                        key={tier}
                        aria-pressed={r.allowedTiers.includes(tier)}
                        disabled={
                          disabled ||
                          TIERS.indexOf(tier) < TIERS.indexOf(r.priceTier)
                        }
                        className={styles.tierChoice}
                        onClick={() =>
                          update(index, {
                            allowedTiers: TIERS.filter((t) =>
                              t === tier
                                ? !r.allowedTiers.includes(t)
                                : r.allowedTiers.includes(t),
                            ),
                          })
                        }
                      >
                        {tierName(tier)}
                      </button>
                    ))}
                  </div>
                </div>
                <label className={styles.label}>
                  {c.rate}
                  <select
                    aria-label={`${c.rate} ${index + 1}`}
                    className={styles.select}
                    value={r.priceTier}
                    disabled={disabled}
                    onChange={(e) => {
                      const tier = e.target.value as Tier;
                      update(index, {
                        priceTier: tier,
                        allowedTiers: TIERS.filter(
                          (t) => TIERS.indexOf(t) >= TIERS.indexOf(tier),
                        ),
                      });
                    }}
                  >
                    {included.map((p) => (
                      <option key={p.tier} value={p.tier}>
                        {tierName(p.tier)} · {p.entryPrice || "—"} AZN
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className={styles.danger}
                  style={{ padding: 7, alignSelf: "end" }}
                  aria-label={`${c.remove} ${index + 1}`}
                  disabled={disabled}
                  onClick={() =>
                    onChange({
                      ...draft,
                      timeRules: draft.timeRules.filter((_, i) => i !== index),
                    })
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className={styles.heading}>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.button}
                disabled={disabled || !included.length}
                onClick={() =>
                  onChange({
                    ...draft,
                    timeRules: [
                      ...draft.timeRules,
                      {
                        days: [],
                        start: "",
                        end: "",
                        allowedTiers: TIERS.filter(
                          (t) => TIERS.indexOf(t) >= TIERS.indexOf(firstTier),
                        ),
                        priceTier: firstTier,
                      },
                    ],
                  })
                }
              >
                <Plus size={15} />
                {c.addRange}
              </button>
              <button
                type="button"
                className={styles.secondary}
                disabled={disabled || !hours}
                onClick={() => {
                  if (!draft.timeRules.length) reset();
                  else
                    useMembershipEditorState.getState().requestDiscard(reset);
                }}
              >
                <RotateCcw size={14} />
                {c.resetHours}
              </button>
            </div>
            <button type="button" onClick={onWorkHours} className={styles.link}>
              {c.workHours}
            </button>
          </div>
          {!coverage.length && <Notice tone="success">{c.coverageOk}</Notice>}
          <details className={styles.preview}>
            <summary className={styles.summary}>{c.preview}</summary>
            <div className={`${styles.actions} mt-3`}>
              <select
                aria-label={c.package}
                className={styles.select}
                style={{ width: 120 }}
                value={previewTier}
                onChange={(e) => setPreviewTier(e.target.value as Tier)}
              >
                {TIERS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select
                aria-label={c.days}
                className={styles.select}
                style={{ width: 100 }}
                value={previewDay}
                onChange={(e) =>
                  setPreviewDay(e.target.value as typeof previewDay)
                }
              >
                {DAYS.map((day, i) => (
                  <option key={day} value={day}>
                    {membershipDays[locale][i]}
                  </option>
                ))}
              </select>
              <input
                aria-label={c.preview}
                type="time"
                className={styles.input}
                style={{ width: 110 }}
                value={previewTime}
                onChange={(e) => setPreviewTime(e.target.value)}
              />
              {match?.allowedTiers.includes(previewTier) && price ? (
                <span className={styles.inline}>
                  <SubscriptionBadge type={tierName(price.tier)} />
                  <span>
                    {price.entryPrice || "—"} AZN ·{" "}
                    {price.primaryMonthlyPrice || "—"} AZN {c.perMonth}
                  </span>
                </span>
              ) : (
                <span className={styles.pill}>
                  <Clock size={13} />
                  {c.denied}
                </span>
              )}
            </div>
          </details>
        </>
      )}
    </section>
  );
}
