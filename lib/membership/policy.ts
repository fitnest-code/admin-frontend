import {
  DAYS,
  TIERS,
  type Day,
  type Tier,
  type PolicyDraft,
  type MembershipPolicy,
  type WorkingHours,
  type TimeRule,
} from "../types/membership";
import { toTime24 } from "@/lib/time-24";

export const tierName = (tier: Tier) => tier[0] + tier.slice(1).toLowerCase();
export function resolveTier(name: string): Tier | undefined {
  const names: Record<string, Tier> = {
    bronze: "BRONZE",
    bürünc: "BRONZE",
    бронза: "BRONZE",
    silver: "SILVER",
    gümüş: "SILVER",
    серебро: "SILVER",
    gold: "GOLD",
    qızıl: "GOLD",
    золото: "GOLD",
    platinum: "PLATINUM",
    platin: "PLATINUM",
    платина: "PLATINUM",
  };
  return names[name.trim().toLocaleLowerCase()];
}
export function toDraft(policy: MembershipPolicy): PolicyDraft {
  const timeRules = (policy.timeRules ?? []).map((r) => ({
    ...r,
    start: toTime24(r.start),
    end: toTime24(r.end),
  }));
  return {
    ...policy,
    timeRules,
    packageWindows: decomposeTimeRules(timeRules),
    packages: TIERS.map(
      (tier) => policy.packages.find((p) => p.tier === tier)!,
    ).map((p) => ({
      ...p,
      categories: p.categories ?? [],
      entryPrice: String(p.entryPrice),
      primaryMonthlyPrice:
        p.primaryMonthlyPrice == null ? "" : String(p.primaryMonthlyPrice),
    })),
  };
}
export function fromDraft(draft: PolicyDraft): MembershipPolicy {
  const windows = editorWindows(draft);
  const timeRules = compileTimeRules(
    Object.fromEntries(
      TIERS.map((t) => [
        t,
        normalizePackageWindows((windows[t] ?? []).filter(isCompleteWindow)),
      ]),
    ) as Record<Tier, PackageAccessWindow[]>,
  ).map((r) => ({
    ...r,
    start: toTime24(r.start),
    end: toTime24(r.end),
  }));
  return {
    version: draft.version,
    timeRulesEnabled: draft.timeRulesEnabled,
    timeRules,
    packages: draft.packages.map((p) => ({
      ...p,
      entryPrice: p.entryPrice.trim() === "" ? 0 : Number(p.entryPrice),
      primaryMonthlyPrice:
        p.primaryMonthlyPrice.trim() === ""
          ? null
          : Number(p.primaryMonthlyPrice),
      categories: p.categories.map((s) => s.trim()).filter(Boolean),
    })),
  };
}
export function importLegacy(
  names: { id: number; name: string }[],
  subscriptions: {
    packageId: number;
    packageName: string;
    dailyPrice?: number;
    benefits?: { name?: string; description?: string }[];
  }[],
): PolicyDraft | null {
  const ids = new Map(
    names.flatMap((p) => {
      const tier = resolveTier(p.name);
      return tier ? [[tier, p.id] as const] : [];
    }),
  );
  if (TIERS.some((t) => !ids.has(t)) || new Set(ids.values()).size !== 4)
    return null;
  return {
    version: 0,
    timeRulesEnabled: false,
    timeRules: [],
    packageWindows: Object.fromEntries(TIERS.map((t) => [t, []])) as unknown as Record<
      Tier,
      PackageAccessWindow[]
    >,
    packages: TIERS.map((tier) => {
      const existing = subscriptions.find((p) => p.packageId === ids.get(tier));
      return {
        packageId: ids.get(tier)!,
        tier,
        included: !!existing,
        primaryEnabled: false,
        entryPrice:
          existing?.dailyPrice == null ? "" : String(existing.dailyPrice),
        primaryMonthlyPrice: "",
        categories: (existing?.benefits ?? [])
          .map((b) => b.name || b.description || "")
          .filter(Boolean),
      };
    }),
  };
}
const time = (value: string | number[] | undefined) =>
  Array.isArray(value)
    ? `${String(value[0] ?? 0).padStart(2, "0")}:${String(value[1] ?? 0).padStart(2, "0")}`
    : (value ?? "").slice(0, 5);
export const minute = (value: string) => {
  const normalized = toTime24(value);
  return /^\d{2}:\d{2}$/.test(normalized) &&
    Number(normalized.slice(0, 2)) < 24 &&
    Number(normalized.slice(3)) < 60
    ? Number(normalized.slice(0, 2)) * 60 + Number(normalized.slice(3))
    : NaN;
};
/**
 * Admin "Bitmə 00:00" means until end of day. A raw 00:00 end after a later start would read as a
 * midnight start and leave a gap, so it is treated as 23:59 (mirrors catalog-backend effectiveEnd).
 */
export const effectiveEndMinute = (start: number, end: number) =>
  end === 0 && start > 0 ? 23 * 60 + 59 : end;

/**
 * Tier windows inherit upward (as legacy home-gym): a rule admits a member when any allowed tier
 * is at or below the member's tier (Bronze window also admits Silver/Gold/Platinum).
 */
export const tierAdmitted = (allowed: Tier[], member: Tier) =>
  allowed.some((t) => TIERS.indexOf(t) <= TIERS.indexOf(member));

export function normalizeDay(value: string): Day | undefined {
  const localized = [
    ["monday", "bazar ertəsi", "понедельник"],
    ["tuesday", "çərşənbə axşamı", "вторник"],
    ["wednesday", "çərşənbə", "среда"],
    ["thursday", "cümə axşamı", "четверг"],
    ["friday", "cümə", "пятница"],
    ["saturday", "şənbə", "суббота"],
    ["sunday", "bazar", "воскресенье"],
  ];
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\u0307/g, "");
  const index = localized.findIndex((names) => names.includes(normalized));
  return index >= 0 ? DAYS[index] : undefined;
}
export function workMinutes(hours: WorkingHours): Map<Day, Set<number>> {
  const result = new Map<Day, Set<number>>(DAYS.map((d) => [d, new Set()]));
  const rest = new Set(
    (hours.restDays ?? []).map((d) =>
      normalizeDay(typeof d === "string" ? d : d.period),
    ),
  );
  for (const h of hours.generalWorkHours ?? []) {
    const day = normalizeDay(h.period);
    const start = minute(time(h.from ?? h.fromTime));
    const end = minute(time(h.to ?? h.toTime));
    if (
      !day ||
      !result.has(day) ||
      !Number.isFinite(start) ||
      !Number.isFinite(end)
    )
      continue;
    for (let n = start; n <= (start <= end ? end : 1439); n++)
      if (!rest.has(day)) result.get(day)!.add(n);
    if (start > end) {
      const next = DAYS[(DAYS.indexOf(day) + 1) % 7];
      for (let n = 0; n <= end; n++)
        if (!rest.has(next)) result.get(next)!.add(n);
    }
  }
  return result;
}
const hhmm = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** Per-package schedule card shown in the Stripe-like editor. */
export type PackageAccessWindow = {
  days: Day[];
  start: string;
  end: string;
};

/** Window ready to compile into API timeRules (incomplete cards stay visible in the editor). */
export function isCompleteWindow(w: PackageAccessWindow): boolean {
  const start = minute(w.start);
  const end = effectiveEndMinute(start, minute(w.end));
  return (
    w.days.length > 0 &&
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start <= end
  );
}

/** Editable cards for the UI — prefer draft.packageWindows over compiled timeRules. */
export function editorWindows(
  draft: PolicyDraft,
): Record<Tier, PackageAccessWindow[]> {
  if (draft.packageWindows) {
    return Object.fromEntries(
      TIERS.map((t) => [t, [...(draft.packageWindows?.[t] ?? [])]]),
    ) as Record<Tier, PackageAccessWindow[]>;
  }
  return decomposeTimeRules(draft.timeRules);
}

/** True when the gym has any open minutes that day. */
export function dayHasWork(hours: WorkingHours, day: Day): boolean {
  return (workMinutes(hours).get(day)?.size ?? 0) > 0;
}

/**
 * Complete window must sit inside work minutes for every selected day.
 * Incomplete windows are skipped (validated on save via ranges).
 */
export function windowFitsWorkHours(
  w: PackageAccessWindow,
  hours: WorkingHours,
): boolean {
  if (!isCompleteWindow(w)) return true;
  const work = workMinutes(hours);
  const start = minute(w.start);
  const end = effectiveEndMinute(start, minute(w.end));
  for (const day of w.days) {
    const open = work.get(day);
    if (!open?.size) return false;
    for (let n = start; n <= end && n < 1440; n++) {
      if (!open.has(n)) return false;
    }
  }
  return true;
}

/** First contiguous open span per working day — used for defaults and hints. */
export function workDaySpans(
  hours: WorkingHours,
): { day: Day; start: string; end: string }[] {
  const work = workMinutes(hours);
  const spans: { day: Day; start: string; end: string }[] = [];
  for (const day of DAYS) {
    const sorted = [...(work.get(day) ?? [])].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      const first = sorted[i];
      let last = first;
      while (sorted[i + 1] === last + 1) last = sorted[++i];
      spans.push({ day, start: hhmm(first), end: hhmm(last) });
    }
  }
  return spans;
}

/** Short summary e.g. "Mon 09:00–18:00 · Tue 09:00–18:00". */
export function formatWorkHoursHint(
  hours: WorkingHours,
  dayLabels: string[],
): string {
  const spans = workDaySpans(hours);
  if (!spans.length) return "";
  return spans
    .map((s) => {
      const label = dayLabels[DAYS.indexOf(s.day)] ?? s.day;
      return `${label} ${s.start}–${s.end}`;
    })
    .join(" · ");
}

/**
 * Suggest a non-colliding default inside work hours when known.
 * Returns null when work hours are required but empty/missing.
 */
export function nextEmptyWindow(
  existing: PackageAccessWindow[],
  hours?: WorkingHours,
): PackageAccessWindow | null {
  const key = (w: PackageAccessWindow) =>
    `${w.days.join(",")}|${toTime24(w.start)}|${toTime24(w.end)}`;
  const used = new Set(existing.map(key));

  if (hours) {
    const spans = workDaySpans(hours);
    if (!spans.length) return null;
    for (const s of spans) {
      const candidate = {
        days: [s.day] as Day[],
        start: s.start,
        end: s.end,
      };
      if (!used.has(key(candidate))) return candidate;
      // Same day already has full span — try a shorter morning half if possible.
      const startM = minute(s.start);
      const endM = minute(s.end);
      if (Number.isFinite(startM) && Number.isFinite(endM) && endM - startM >= 120) {
        const mid = startM + Math.floor((endM - startM) / 2);
        const half = {
          days: [s.day] as Day[],
          start: s.start,
          end: hhmm(mid),
        };
        if (!used.has(key(half)) && windowFitsWorkHours(half, hours))
          return half;
      }
    }
    // All spans used — still return first span so the card appears; save merge is OK.
    const first = spans[0];
    return { days: [first.day], start: first.start, end: first.end };
  }

  const candidates: PackageAccessWindow[] = [
    { days: [DAYS[0]], start: "09:00", end: "17:00" },
    { days: [DAYS[0]], start: "17:00", end: "21:00" },
    { days: [DAYS[1]], start: "09:00", end: "17:00" },
    { days: [DAYS[2]], start: "09:00", end: "17:00" },
  ];
  for (const c of candidates) {
    if (!used.has(key(c)))
      return { days: [...c.days], start: c.start, end: c.end };
  }
  return { days: [DAYS[0]], start: "09:00", end: "17:00" };
}

export function defaultRules(hours: WorkingHours, priceTier: Tier): TimeRule[] {
  const grouped = new Map<string, TimeRule>();
  for (const [day, minutes] of workMinutes(hours)) {
    const sorted = [...minutes].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      const first = sorted[i];
      let last = first;
      while (sorted[i + 1] === last + 1) last = sorted[++i];
      const key = `${first}-${last}`;
      const existing = grouped.get(key);
      if (existing) existing.days.push(day);
      else
        grouped.set(key, {
          days: [day],
          start: hhmm(first),
          end: hhmm(last),
          allowedTiers: TIERS.filter(
            (t) => TIERS.indexOf(t) >= TIERS.indexOf(priceTier),
          ),
          priceTier,
        });
    }
  }
  return [...grouped.values()];
}

/** Expand API TimeRules into per-package windows (old policies load into the new UI). */
export function decomposeTimeRules(
  rules: TimeRule[],
): Record<Tier, PackageAccessWindow[]> {
  const out = Object.fromEntries(TIERS.map((t) => [t, [] as PackageAccessWindow[]])) as Record<
    Tier,
    PackageAccessWindow[]
  >;
  for (const r of rules) {
    for (const tier of r.allowedTiers) {
      if (!out[tier]) continue;
      out[tier].push({
        days: [...r.days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)),
        start: toTime24(r.start),
        end: toTime24(r.end),
      });
    }
  }
  for (const tier of TIERS) out[tier] = normalizePackageWindows(out[tier]);
  return out;
}

/** Merge same-package cards: overlapping/adjacent times per day, then same hours across days. */
export function normalizePackageWindows(
  windows: PackageAccessWindow[],
): PackageAccessWindow[] {
  type Seg = { day: Day; start: number; end: number };
  const segs: Seg[] = [];
  for (const w of windows) {
    const start = minute(w.start);
    const end = effectiveEndMinute(start, minute(w.end));
    if (!w.days.length || !Number.isFinite(start) || !Number.isFinite(end) || start > end)
      continue;
    for (const day of w.days) segs.push({ day, start, end });
  }
  const byDay = new Map<Day, { start: number; end: number }[]>();
  for (const day of DAYS) byDay.set(day, []);
  for (const s of segs) byDay.get(s.day)!.push({ start: s.start, end: s.end });
  for (const day of DAYS) {
    const list = byDay.get(day)!.sort((a, b) => a.start - b.start || a.end - b.end);
    const merged: { start: number; end: number }[] = [];
    for (const cur of list) {
      const prev = merged[merged.length - 1];
      // Adjacent minutes (prev.end+1 === cur.start) collapse into one card.
      if (prev && cur.start <= prev.end + 1)
        prev.end = Math.max(prev.end, cur.end);
      else merged.push({ ...cur });
    }
    byDay.set(day, merged);
  }
  const grouped = new Map<string, Day[]>();
  for (const day of DAYS) {
    for (const r of byDay.get(day)!) {
      const key = `${r.start}-${r.end}`;
      const days = grouped.get(key) ?? [];
      days.push(day);
      grouped.set(key, days);
    }
  }
  return [...grouped.entries()]
    .sort((a, b) => {
      const [as, ae] = a[0].split("-").map(Number);
      const [bs, be] = b[0].split("-").map(Number);
      return as - bs || ae - be;
    })
    .map(([key, days]) => {
      const [start, end] = key.split("-").map(Number);
      return {
        days: days.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)),
        start: hhmm(start),
        end: hhmm(end),
      };
    });
}

/** Compile per-package windows into non-overlapping API TimeRules (priceTier = lowest allowed). */
export function compileTimeRules(
  perPackage: Partial<Record<Tier, PackageAccessWindow[]>>,
): TimeRule[] {
  const dayMasks = Object.fromEntries(DAYS.map((d) => [d, new Array<number>(1440).fill(0)])) as Record<
    Day,
    number[]
  >;
  for (const tier of TIERS) {
    const bit = 1 << TIERS.indexOf(tier);
    for (const w of perPackage[tier] ?? []) {
      const start = minute(w.start);
      const end = effectiveEndMinute(start, minute(w.end));
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) continue;
      for (const day of w.days) {
        for (let n = start; n <= end && n < 1440; n++) dayMasks[day][n] |= bit;
      }
    }
  }
  const grouped = new Map<string, TimeRule>();
  for (const day of DAYS) {
    const mask = dayMasks[day];
    let i = 0;
    while (i < 1440) {
      while (i < 1440 && mask[i] === 0) i++;
      if (i >= 1440) break;
      const bits = mask[i];
      const first = i;
      while (i + 1 < 1440 && mask[i + 1] === bits) i++;
      const last = i;
      i++;
      const allowedTiers = TIERS.filter((t) => bits & (1 << TIERS.indexOf(t)));
      if (!allowedTiers.length) continue;
      const priceTier = allowedTiers.reduce((a, b) =>
        TIERS.indexOf(a) <= TIERS.indexOf(b) ? a : b,
      );
      const key = `${first}-${last}-${allowedTiers.join(",")}`;
      const existing = grouped.get(key);
      if (existing) existing.days.push(day);
      else
        grouped.set(key, {
          days: [day],
          start: hhmm(first),
          end: hhmm(last),
          allowedTiers,
          priceTier,
        });
    }
  }
  return [...grouped.values()].map((r) => ({
    ...r,
    days: r.days.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)),
  }));
}

export function setPackageWindows(
  draft: PolicyDraft,
  tier: Tier,
  windows: PackageAccessWindow[],
): PolicyDraft {
  // Keep raw cards (including incomplete / duplicate defaults) so Add range does not vanish.
  const current = editorWindows(draft);
  current[tier] = windows.map((w) => ({
    days: [...w.days],
    start: w.start,
    end: w.end,
  }));
  const forCompile = Object.fromEntries(
    TIERS.map((t) => [
      t,
      normalizePackageWindows((current[t] ?? []).filter(isCompleteWindow)),
    ]),
  ) as Record<Tier, PackageAccessWindow[]>;
  return {
    ...draft,
    packageWindows: current,
    timeRules: compileTimeRules(forCompile),
  };
}

export type PolicyIssue = {
  code:
    | "included"
    | "price"
    | "monthly"
    | "ranges"
    | "overlap"
    | "coverage"
    | "hours"
    | "tier"
    | "category";
  tier?: Tier;
  index?: number;
};
export function validatePolicy(
  draft: PolicyDraft,
  hours?: WorkingHours,
): PolicyIssue[] {
  const issues: PolicyIssue[] = [];
  const money = (s: string) => /^\d{1,10}(\.\d{1,2})?$/.test(s.trim());
  if (!draft.packages.some((p) => p.included))
    issues.push({ code: "included" });
  for (const p of draft.packages) {
    if ((p.included || p.entryPrice.trim() !== "") && !money(p.entryPrice))
      issues.push({ code: "price", tier: p.tier });
    if (
      (p.primaryEnabled || p.primaryMonthlyPrice.trim() !== "") &&
      !money(p.primaryMonthlyPrice)
    )
      issues.push({ code: "monthly", tier: p.tier });
    if (p.primaryEnabled && !p.included)
      issues.push({ code: "tier", tier: p.tier });
    if (
      p.categories.some((c) => !c.trim()) ||
      new Set(p.categories.map((c) => c.trim().toLocaleLowerCase())).size !==
        p.categories.length
    )
      issues.push({ code: "category", tier: p.tier });
  }
  if (!draft.timeRulesEnabled) return issues;
  if (!hours || [...workMinutes(hours).values()].every((s) => s.size === 0))
    issues.push({ code: "hours" });
  if (!draft.timeRules.length) issues.push({ code: "ranges" });
  const expected = hours ? workMinutes(hours) : null;
  for (const [index, r] of draft.timeRules.entries()) {
    const start = minute(r.start);
    const end = minute(r.end);
    const price = draft.packages.find((p) => p.tier === r.priceTier);
    if (
      !r.days.length ||
      !r.allowedTiers.length ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start > effectiveEndMinute(start, end)
    )
      issues.push({ code: "ranges", index });
    if (
      !price?.included ||
      r.allowedTiers.some((t) => TIERS.indexOf(t) < TIERS.indexOf(r.priceTier))
    )
      issues.push({ code: "tier", index });
    if (
      price &&
      r.allowedTiers.some((t) =>
        draft.packages.some((p) => p.tier === t && p.primaryEnabled),
      ) &&
      !money(price.primaryMonthlyPrice)
    )
      issues.push({ code: "monthly", tier: price.tier, index });
  }
  for (const day of DAYS) {
    const counts = new Uint8Array(1440);
    for (const r of draft.timeRules.filter((r) => r.days.includes(day))) {
      const start = minute(r.start);
      const end = effectiveEndMinute(start, minute(r.end));
      for (let n = start; n <= end && n < 1440; n++) if (n >= 0) counts[n]++;
    }
    if (counts.some((n) => n > 1)) issues.push({ code: "overlap" });
    // Gaps are allowed; only reject minutes that sit outside gym work hours.
    if (expected && counts.some((n, i) => n > 0 && !expected.get(day)!.has(i)))
      issues.push({ code: "coverage" });
  }
  return issues.filter(
    (issue, i, all) =>
      all.findIndex((x) => JSON.stringify(x) === JSON.stringify(issue)) === i,
  );
}
export function effectivePackage(
  packages: MembershipPolicy["packages"],
  tier: Tier,
) {
  const member = packages.find((p) => p.tier === tier);
  return member?.included
    ? member
    : packages.find(
        (p) => p.included && TIERS.indexOf(p.tier) <= TIERS.indexOf(tier),
      );
}
export function disabledPackageIds(
  before: MembershipPolicy | null,
  after: MembershipPolicy,
): number[] {
  if (!before) return [];
  return after.packages
    .filter(
      (p) =>
        effectivePackage(before.packages, p.tier)?.primaryEnabled &&
        !effectivePackage(after.packages, p.tier)?.primaryEnabled,
    )
    .map((p) => p.packageId);
}
export function formatMembershipDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = value.slice(0, 10).split("-");
  return date.length === 3 ? `${date[2]}.${date[1]}.${date[0]}` : value;
}

export function formatMembershipEndDate(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  const date = new Date(value.slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) return "—";
  date.setUTCDate(date.getUTCDate() - 1);
  return formatMembershipDate(date.toISOString());
}
