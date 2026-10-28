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
  return {
    ...policy,
    timeRules: policy.timeRules ?? [],
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
  return {
    ...draft,
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
export const minute = (value: string) =>
  /^\d{2}:\d{2}$/.test(value) &&
  Number(value.slice(0, 2)) < 24 &&
  Number(value.slice(3)) < 60
    ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
    : NaN;
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
export function defaultRules(hours: WorkingHours, priceTier: Tier): TimeRule[] {
  const grouped = new Map<string, TimeRule>();
  for (const [day, minutes] of workMinutes(hours)) {
    const sorted = [...minutes].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      const first = sorted[i];
      let last = first;
      while (sorted[i + 1] === last + 1) last = sorted[++i];
      const hhmm = (n: number) =>
        `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
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
      start > end
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
    for (const r of draft.timeRules.filter((r) => r.days.includes(day)))
      for (let n = minute(r.start); n <= minute(r.end) && n < 1440; n++)
        if (n >= 0) counts[n]++;
    if (counts.some((n) => n > 1)) issues.push({ code: "overlap" });
    if (expected && counts.some((n, i) => n > 0 !== expected.get(day)!.has(i)))
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
