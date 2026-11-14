const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  );
const {
  importLegacy,
  fromDraft,
  toDraft,
  defaultRules,
  validatePolicy,
  disabledPackageIds,
  formatMembershipEndDate,
  workMinutes,
  minute,
} = require("../lib/membership/policy.ts");
const { TIERS, DAYS } = require("../lib/types/membership.ts");
const names = TIERS.map((name, i) => ({ name, id: (i + 1) * 10 }));
const hours = {
  generalWorkHours: DAYS.map((period) => ({
    period,
    from: "00:01",
    to: "23:59",
  })),
  restDays: [],
};
function draft() {
  return {
    version: 4,
    timeRulesEnabled: true,
    packages: TIERS.map((tier, i) => ({
      tier,
      packageId: (i + 1) * 10,
      included: i < 2,
      primaryEnabled: i < 2,
      entryPrice: i === 0 ? "4" : "6",
      primaryMonthlyPrice: i === 0 ? "50" : "60",
      categories: [],
    })),
    timeRules: [
      {
        days: [...DAYS],
        start: "00:01",
        end: "16:59",
        allowedTiers: [...TIERS],
        priceTier: "BRONZE",
      },
      {
        days: [...DAYS],
        start: "17:00",
        end: "23:59",
        allowedTiers: TIERS.slice(1),
        priceTier: "SILVER",
      },
    ],
  };
}
test("resolves real package IDs and preserves a zero legacy price", () => {
  const d = importLegacy(names, [
    {
      packageId: 10,
      packageName: "Bronze",
      dailyPrice: 0,
      benefits: [{ name: "Pool" }],
    },
  ]);
  assert.equal(d.packages[0].packageId, 10);
  assert.equal(d.packages[0].entryPrice, "0");
  assert.deepEqual(d.packages[0].categories, ["Pool"]);
  assert.equal(d.packages[0].primaryEnabled, false);
});
test("does not fabricate missing IDs", () => {
  assert.equal(importLegacy(names.slice(0, 3), []), null);
});
test("valid 16:59/17:00 ranges cover inclusive working minutes", () => {
  assert.deepEqual(validatePolicy(draft(), hours), []);
});
test("equal endpoints are overlapping", () => {
  const d = draft();
  d.timeRules[0].end = "17:00";
  assert.ok(validatePolicy(d, hours).some((i) => i.code === "overlap"));
});
test("one-minute gaps are detected", () => {
  const d = draft();
  d.timeRules[0].end = "16:58";
  assert.ok(validatePolicy(d, hours).some((i) => i.code === "coverage"));
});
test("entry price rejects negative and excessive decimal precision", () => {
  for (const price of ["-1", "4.123", "Infinity", ""]) {
    const d = draft();
    d.packages[0].entryPrice = price;
    assert.ok(validatePolicy(d, hours).some((i) => i.code === "price"));
  }
});
test("free access is valid and zero survives API round trip", () => {
  const d = draft();
  d.packages[0].entryPrice = "0";
  d.packages[0].primaryMonthlyPrice = "0";
  assert.deepEqual(validatePolicy(d, hours), []);
  assert.equal(toDraft(fromDraft(d)).packages[0].primaryMonthlyPrice, "0");
});
test("time price tier cannot admit a lower package", () => {
  const d = draft();
  d.timeRules[1].allowedTiers.push("BRONZE");
  assert.ok(validatePolicy(d, hours).some((i) => i.code === "tier"));
});
test("monthly rates are required for primary access", () => {
  const d = draft();
  d.packages[0].primaryMonthlyPrice = "";
  assert.ok(validatePolicy(d, hours).some((i) => i.code === "monthly"));
});
test("unconfigured hours prevent enabling time rules", () => {
  assert.ok(validatePolicy(draft()).some((i) => i.code === "hours"));
});
test("default rules split overnight hours and respect rest days", () => {
  const h = {
    generalWorkHours: [{ period: "MONDAY", from: "22:00", to: "02:00" }],
    restDays: [],
  };
  const r = defaultRules(h, "SILVER");
  assert.equal(r.length, 2);
  assert.equal(r[0].start, "22:00");
  assert.equal(r[1].end, "02:00");
  assert.deepEqual(r[1].days, ["TUESDAY"]);
  assert.ok(!r[0].allowedTiers.includes("BRONZE"));
  h.restDays = ["TUESDAY"];
  assert.equal(defaultRules(h, "BRONZE").length, 1);
});
test("work hours accept backend LocalTime arrays", () => {
  const h = {
    generalWorkHours: [{ period: "MONDAY", from: [9, 0], to: [10, 0] }],
  };
  assert.equal(workMinutes(h).get("MONDAY").size, 61);
});
test("disabling Bronze includes inherited Gold and Platinum subscribers, not Silver", () => {
  const before = fromDraft(draft());
  const after = structuredClone(before);
  after.packages[0].primaryEnabled = false;
  assert.deepEqual(disabledPackageIds(before, after), [10, 30, 40]);
});
test("unchecking a package can preserve inherited primary eligibility", () => {
  const before = fromDraft(draft());
  const after = structuredClone(before);
  after.packages[1].included = false;
  after.packages[1].primaryEnabled = false;
  assert.deepEqual(disabledPackageIds(before, after), []);
});
test("first policy does not trigger disable notifications", () => {
  assert.deepEqual(disabledPackageIds(null, fromDraft(draft())), []);
});
test("case-insensitive duplicate categories are rejected", () => {
  const d = draft();
  d.packages[0].categories = ["Pool", " pool "];
  assert.ok(validatePolicy(d, hours).some((i) => i.code === "category"));
});
test("exclusive period end is displayed as previous date without browser timezone drift", () => {
  assert.equal(formatMembershipEndDate("2026-11-05T00:00:00"), "04.11.2026");
  assert.equal(formatMembershipEndDate("2026-03-01T00:00:00"), "28.02.2026");
});
test("invalid clock input is rejected", () => {
  for (const s of ["24:00", "09:60", "9:00", ""])
    assert.ok(Number.isNaN(minute(s)));
});
const {
  useMembershipEditorState,
} = require("../lib/membership/editor-state.ts");
test("canceling discard keeps the draft and does not navigate", () => {
  const store = useMembershipEditorState.getState();
  let calls = 0;
  store.setDirtyGymId(10);
  store.requestDiscard(() => calls++);
  assert.equal(useMembershipEditorState.getState().dirtyGymId, 10);
  store.cancelDiscard();
  assert.equal(calls, 0);
  assert.equal(useMembershipEditorState.getState().dirtyGymId, 10);
});
test("confirming discard runs navigation once and clears dirty state", () => {
  const store = useMembershipEditorState.getState();
  let calls = 0;
  store.setDirtyGymId(10);
  store.requestDiscard(() => calls++);
  store.confirmDiscard();
  store.confirmDiscard();
  assert.equal(calls, 1);
  assert.equal(useMembershipEditorState.getState().dirtyGymId, null);
});
test("draft memory survives a locale remount and is removed only after confirmed discard", () => {
  const store = useMembershipEditorState.getState();
  const saved = {
    draft: draft(),
    baseline: fromDraft(draft()),
    signature: "baseline",
  };
  store.setDraft(10, saved);
  store.setDirtyGymId(10);
  store.setDirtyGymId(null);
  assert.equal(useMembershipEditorState.getState().drafts[10], saved);
  store.setDirtyGymId(10);
  store.requestDiscard(() => {});
  store.cancelDiscard();
  assert.equal(useMembershipEditorState.getState().drafts[10], saved);
  store.requestDiscard(() => {});
  store.confirmDiscard();
  assert.equal(useMembershipEditorState.getState().drafts[10], undefined);
});
test("normalizes all localized catalog day names before coverage checks", () => {
  const az = [
    "Bazar ertəsi",
    "Çərşənbə axşamı",
    "Çərşənbə",
    "Cümə axşamı",
    "Cümə",
    "Şənbə",
    "Bazar",
  ];
  const ru = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье",
  ];
  for (const labels of [az, ru]) {
    const translated = {
      generalWorkHours: labels.map((period) => ({
        period,
        from: "00:01",
        to: "23:59",
      })),
      restDays: [],
    };
    assert.deepEqual(validatePolicy(draft(), translated), []);
    assert.deepEqual(defaultRules(translated, "BRONZE")[0].days, [...DAYS]);
  }
});
test("localized rest days still close overnight access", () => {
  const localized = {
    generalWorkHours: [{ period: "Понедельник", from: "22:00", to: "02:00" }],
    restDays: [{ period: "Вторник" }],
  };
  const rules = defaultRules(localized, "BRONZE");
  assert.equal(rules.length, 1);
  assert.deepEqual(rules[0].days, ["MONDAY"]);
});
