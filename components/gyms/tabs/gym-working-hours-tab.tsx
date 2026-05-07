"use client";

import { useState } from "react";
import { Trash2, Pencil, Plus, Check, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type GenderTab = "umumi" | "kisiler" | "qadinlar";
type DayKey = "Be" | "Ca" | "C" | "Ca2" | "C2" | "S" | "B";

interface TimeSlot {
  id: number;
  from: string;
  to: string;
}

type ScheduleMap = Record<DayKey, TimeSlot[]>;

// ─── Constants ───────────────────────────────────────────────────────────────

const DAY_SHORT: Record<DayKey, string> = {
  Be: "B.e",
  Ca: "Ç.a",
  C: "Ç",
  Ca2: "C.a",
  C2: "C",
  S: "Ş",
  B: "B",
};

const ALL_DAYS: DayKey[] = ["Be", "Ca", "C", "Ca2", "C2", "S", "B"];

const SECTIONS: { label: string; days: DayKey[] }[] = [
  { label: "Bazar ertəsi – Cümə", days: ["Be", "Ca", "C", "Ca2", "C2"] },
  { label: "Şənbə", days: ["S"] },
  { label: "Bazar günü", days: ["B"] },
];

const GENDER_TABS: { key: GenderTab; label: string }[] = [
  { key: "umumi", label: "Ümumi zal" },
  { key: "kisiler", label: "Yalnız kişilər" },
  { key: "qadinlar", label: "Yalnız qadınlar" },
];

function generateHours(): string[] {
  const h: string[] = [];
  for (let i = 0; i < 24; i++) {
    h.push(`${String(i).padStart(2, "0")}:00`);
    h.push(`${String(i).padStart(2, "0")}:30`);
  }
  return h;
}
const HOURS = generateHours();

function makeDefaultSchedule(): ScheduleMap {
  return {
    Be: [{ id: 1, from: "12:00", to: "18:00" }],
    Ca: [{ id: 1, from: "12:00", to: "18:00" }],
    C:  [{ id: 1, from: "12:00", to: "18:00" }],
    Ca2:[{ id: 1, from: "12:00", to: "18:00" }],
    C2: [{ id: 1, from: "12:00", to: "18:00" }],
    S:  [{ id: 1, from: "12:00", to: "18:00" }],
    B:  [],
  };
}

// ─── TimeSelect ──────────────────────────────────────────────────────────────

function TimeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-teal-400 rounded-lg px-2 py-1 text-sm font-semibold text-slate-800 bg-white outline-none cursor-pointer min-w-[82px] focus:ring-2 focus:ring-teal-300"
    >
      {HOURS.map((h) => (
        <option key={h}>{h}</option>
      ))}
    </select>
  );
}

// ─── BusinessHoursPanel ──────────────────────────────────────────────────────

export function BusinessHoursPanel() {
  const [schedule, setSchedule] = useState<ScheduleMap>(makeDefaultSchedule);
  const [restDays, setRestDays] = useState<Set<DayKey>>(new Set(["B"]));
  const [editing, setEditing] = useState<{
    day: DayKey;
    id: number;
    from: string;
    to: string;
  } | null>(null);

  const addSlot = (days: DayKey[]) =>
    setSchedule((p) => {
      const next = { ...p };
      days.forEach((d) => {
        next[d] = [
          ...p[d],
          { id: Date.now() + Math.random(), from: "09:00", to: "18:00" },
        ];
      });
      return next;
    });

  const removeSlot = (days: DayKey[], id: number) =>
    setSchedule((p) => {
      const next = { ...p };
      days.forEach((d) => {
        next[d] = p[d].filter((s) => s.id !== id);
      });
      return next;
    });

  const confirmEdit = () => {
    if (!editing) return;
    setSchedule((p) => ({
      ...p,
      [editing.day]: p[editing.day].map((s) =>
        s.id === editing.id ? { ...s, from: editing.from, to: editing.to } : s
      ),
    }));
    setEditing(null);
  };

  const toggleRest = (day: DayKey) =>
    setRestDays((p) => {
      const n = new Set(p);
      n.has(day) ? n.delete(day) : n.add(day);
      return n;
    });

  return (
    <div className="px-8 py-7 space-y-6">
      {/* ── Time sections ── */}
      {SECTIONS.map((sec) => {
        const active = sec.days.filter((d) => !restDays.has(d));
        if (!active.length) return null;
        const rep = active[0];
        const slots = schedule[rep];

        return (
          <div key={sec.label} className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {sec.label}
              </span>
              <button
                onClick={() => addSlot(active)}
                className="flex items-center gap-1.5 bg-teal-400 hover:bg-teal-500 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all duration-150"
              >
                <Plus size={13} strokeWidth={2.8} />
                Əlavə et
              </button>
            </div>

            {slots.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-4 text-center text-slate-400 text-sm">
                Saat əlavə edilməyib
              </div>
            ) : (
              slots.map((slot, i) => {
                const isEd = editing?.day === rep && editing?.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-sm rounded-xl px-4 py-2.5 transition-all duration-150"
                  >
                    <span className="text-xs font-bold text-slate-300 w-4 text-center shrink-0">
                      {i + 1}
                    </span>

                    <div className="flex items-center gap-2.5 flex-1">
                      {isEd ? (
                        <>
                          <TimeSelect
                            value={editing.from}
                            onChange={(v) =>
                              setEditing((e) => e && { ...e, from: v })
                            }
                          />
                          <span className="text-slate-300 text-sm">—</span>
                          <TimeSelect
                            value={editing.to}
                            onChange={(v) =>
                              setEditing((e) => e && { ...e, to: v })
                            }
                          />
                        </>
                      ) : (
                        <>
                          <span className="text-[15px] font-semibold text-slate-800 min-w-[46px]">
                            {slot.from}
                          </span>
                          <span className="text-slate-300 text-sm">—</span>
                          <span className="text-[15px] font-semibold text-slate-800 min-w-[46px]">
                            {slot.to}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-1.5 ml-auto">
                      {isEd ? (
                        <>
                          <button
                            onClick={confirmEdit}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent text-slate-400 hover:bg-green-50 hover:border-green-200 hover:text-green-500 transition-all duration-150"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-all duration-150"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setEditing({
                                day: rep,
                                id: slot.id,
                                from: slot.from,
                                to: slot.to,
                              })
                            }
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent text-slate-400 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-500 transition-all duration-150"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => removeSlot(active, slot.id)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-transparent text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-all duration-150"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      {/* ── Divider ── */}
      <div className="h-px bg-slate-100" />

      {/* ── Rest days ── */}
      <div className="space-y-3">
        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          İstirahət günü
        </span>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map((d) => (
            <button
              key={d}
              onClick={() => toggleRest(d)}
              className={`text-[13px] font-bold px-4 py-1.5 rounded-lg border transition-all duration-150 ${
                restDays.has(d)
                  ? "bg-red-50 border-red-300 text-red-400"
                  : "bg-white border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-500"
              }`}
            >
              {DAY_SHORT[d]}
            </button>
          ))}
        </div>
        {restDays.size > 0 && (
          <p className="text-xs text-slate-400">
            İstirahət günündə saat əlavə edilə bilməz
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex gap-3 pt-2">
        <button className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-150">
          Yadda saxla
        </button>
        <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-teal-500 text-white text-sm font-bold shadow-[0_4px_16px_rgba(14,200,200,0.3)] hover:opacity-90 active:scale-[0.98] transition-all duration-150">
          Növbəti
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WorkingHoursPanel() {
  const [activeTab, setActiveTab] = useState<GenderTab>("umumi");
  const [activeLang, setActiveLang] = useState("Az");

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-[760px] bg-white rounded-2xl shadow-[0_2px_28px_rgba(0,0,0,0.07)] overflow-hidden">

        {/* ── Card header ── */}
        <div className="px-8 pt-7 pb-0 border-b border-slate-100">
          {/* Top row */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
              Zal məlumatları
            </h2>
            <div className="flex gap-1">
              {["Az", "Ru", "En"].map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLang(l)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all duration-150 ${
                    activeLang === l
                      ? "bg-teal-400 text-white border-teal-400"
                      : "bg-transparent text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex">
            {GENDER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative text-[13.5px] font-semibold px-5 py-3 border-b-2 transition-all duration-150 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-teal-400 border-teal-400"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab panels — each isolated with its own state ── */}
        {activeTab === "umumi" && <BusinessHoursPanel key="umumi" />}
        {activeTab === "kisiler" && <BusinessHoursPanel key="kisiler" />}
        {activeTab === "qadinlar" && <BusinessHoursPanel key="qadinlar" />}
      </div>
    </div>
  );
}