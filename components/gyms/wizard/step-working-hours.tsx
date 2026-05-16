"use client";

import { useState, useEffect } from "react";
import { Trash2, Pencil, Plus, Loader2, Clock, Check } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep3 } from "@/lib/query/gym-query";
import { AddClassTimeModal, ClassTimeData } from "../modals/add-hours-modal";
import { IGymWorkHoursPayload, IWorkHour, IRestDay } from "@/lib/types/working-hours";
import { cn } from "@/lib/utils";

type GenderTab = "generalWorkHours" | "workHoursMan" | "workHoursWoman";

interface SavedSlot extends ClassTimeData {
  id: string;
}

const BACKEND_DAY_MAP: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

const DAY_SHORT_LABELS = [
  { key: "monday", label: "B.e" },
  { key: "tuesday", label: "Ç.a" },
  { key: "wednesday", label: "Ç" },
  { key: "thursday", label: "C.a" },
  { key: "friday", label: "C" },
  { key: "saturday", label: "Ş" },
  { key: "sunday", label: "B" },
];

const DAY_FULL_LABELS: Record<string, string> = {
  monday: "Bazar ertəsi", tuesday: "Çərşənbə axşamı", wednesday: "Çərşənbə",
  thursday: "Cümə axşamı", friday: "Cümə", saturday: "Şənbə", sunday: "Bazar"
};

export function StepWorkingHours({ onNext }: { onNext?: () => void }) {
  const { gymId, step3Data, setStep3Data } = useGymStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<GenderTab>("generalWorkHours");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [enabledTabs, setEnabledTabs] = useState<Set<GenderTab>>(new Set(["generalWorkHours"]));

  // Map backend data back to frontend structure if exists
  const initialSlots = step3Data ? {
    generalWorkHours: step3Data.generalWorkHours.map((s: any) => ({ ...s, day: s.period.toLowerCase(), startTime: s.from, endTime: s.to, id: Math.random().toString() })),
    workHoursMan: step3Data.workHoursMan.map((s: any) => ({ ...s, day: s.period.toLowerCase(), startTime: s.from, endTime: s.to, id: Math.random().toString() })),
    workHoursWoman: step3Data.workHoursWoman.map((s: any) => ({ ...s, day: s.period.toLowerCase(), startTime: s.from, endTime: s.to, id: Math.random().toString() })),
  } : {
    generalWorkHours: [],
    workHoursMan: [],
    workHoursWoman: [],
  };

  const initialRestDays = step3Data ? new Set(step3Data.restDays.map((d: any) => d.period.toLowerCase())) : new Set(["sunday"]);

  const [slots, setSlots] = useState<Record<GenderTab, SavedSlot[]>>(initialSlots);
  const [restDays, setRestDays] = useState<Set<string>>(initialRestDays);

  const validateStep3 = useValidateGymStep3();

  useEffect(() => { setMounted(true); }, []);

  const handleNext = async () => {
    // 1. Check if at least one slot exists for each enabled regime
    const enabledTabsArray = Array.from(enabledTabs);
    for (const tab of enabledTabsArray) {
      if (slots[tab].length === 0) {
        const labels: Record<GenderTab, string> = {
          generalWorkHours: "Ümumi zal",
          workHoursMan: "Kişi zalı",
          workHoursWoman: "Qadın zalı"
        };
        return toast.error(`${labels[tab]} rejimi üçün heç bir iş saatı əlavə edilməyib`);
      }
    }

    // 2. Check for slots on rest days (double check)
    for (const tab of enabledTabsArray) {
      const hasSlotsOnRestDay = slots[tab].some(s => restDays.has(s.day));
      if (hasSlotsOnRestDay) {
        return toast.error("İstirahət günlərinə iş saatı təyin edilə bilməz. Zəhmət olmasa yoxlayın.");
      }
    }

    try {
      const payload = buildPayload();
      await validateStep3.mutateAsync(payload);
      setStep3Data(payload);
      onNext?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "İş saatları məlumatları yanlışdır");
    }
  };

  const isSubmitting = validateStep3.isPending;

  const ALL_DAY_KEYS = DAY_SHORT_LABELS.map(d => d.key);

  const buildPayload = (): IGymWorkHoursPayload => {
    const mapToWorkHour = (key: GenderTab): IWorkHour[] => {
      // If regime is not enabled, return empty (all days are rest days for this type)
      if (!enabledTabs.has(key)) return [];
      return slots[key].map(s => ({
        period: BACKEND_DAY_MAP[s.day] || s.day,
        from: s.startTime,
        to: s.endTime,
      }));
    };

    // Compute rest days: explicit rest days + all days for disabled regimes
    // For enabled regimes: days without any work hours are implicitly rest days
    const computeRestDays = (): IRestDay[] => {
      // Start with explicitly selected rest days
      const allRestDays = new Set(restDays);

      // For each enabled regime, days without slots are also rest days
      const enabledTabsArray = Array.from(enabledTabs);
      if (enabledTabsArray.length > 0) {
        // Find days that have NO slots in ANY enabled regime
        for (const dayKey of ALL_DAY_KEYS) {
          const hasSlotInAnyEnabled = enabledTabsArray.some(tab => 
            slots[tab].some(s => s.day === dayKey)
          );
          if (!hasSlotInAnyEnabled) {
            allRestDays.add(dayKey);
          }
        }
      } else {
        // No regime enabled at all — all days are rest days
        ALL_DAY_KEYS.forEach(d => allRestDays.add(d));
      }

      return Array.from(allRestDays).map(d => ({ period: BACKEND_DAY_MAP[d] || d }));
    };

    return {
      gymId: gymId ? Number(gymId) : 0,
      generalWorkHours: mapToWorkHour("generalWorkHours"),
      workHoursMan: mapToWorkHour("workHoursMan"),
      workHoursWoman: mapToWorkHour("workHoursWoman"),
      restDays: computeRestDays(),
    };
  };



  if (!mounted) return null;

  const activeDays = new Set(slots[activeTab].map(s => s.day));

  return (
    <div className="w-full bg-white rounded-[24px] border border-[#ECECED] p-6 space-y-8 shadow-sm animate-in fade-in duration-500">
      <div className="flex justify-between items-center pb-2 border-b border-[#ECECED]">
        <h2 className="text-[18px] font-bold text-[#101828]">Zal məlumatları</h2>
        <div className="flex gap-4 text-xs font-bold text-[#9CA3AF]">
          <span className="text-[#00B4CC] border-b border-[#00B4CC] cursor-pointer pb-0.5">Az</span>
          <span className="hover:text-[#00B4CC] cursor-pointer transition-colors">Ru</span>
          <span className="hover:text-[#00B4CC] cursor-pointer transition-colors">En</span>
        </div>
      </div>

      {/* Gender Tabs – Checkbox-style: enable any combination */}
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {[
          { id: "generalWorkHours" as GenderTab, label: "Ümumi zal" },
          { id: "workHoursMan" as GenderTab, label: "Yalnız kişilər" },
          { id: "workHoursWoman" as GenderTab, label: "Yalnız qadınlar" },
        ].map((tab) => {
          const isEnabled = enabledTabs.has(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => {
                // Clicking the box body just switches the view, regardless of whether it's enabled
                setActiveTab(tab.id);
              }}
              className={cn(
                "flex-1 h-[40px] rounded-[24px] text-xs font-bold transition-all duration-300 border flex items-center justify-center gap-2 select-none",
                isActive 
                  ? isEnabled
                    ? "bg-[#00B4CC] text-white border-[#00B4CC] shadow-md cursor-default"
                    : "bg-[#F3F4F6] text-[#101828] border-[#D1D5DB] shadow-sm cursor-default" // active but not enabled
                  : isEnabled
                    ? "bg-[#00B4CC15] text-[#00B4CC] border-[#00B4CC] hover:bg-[#00B4CC25] cursor-pointer"
                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-slate-50 cursor-pointer"
              )}
            >
                {/* Checkbox — toggles enable/disable */}
                <span
                  role="checkbox"
                  aria-checked={isEnabled}
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger the outer div click
                    const newSet = new Set(enabledTabs);
                    if (isEnabled) {
                      newSet.delete(tab.id);
                      setEnabledTabs(newSet);
                      // Don't auto-switch the tab away if they disable it, let them stay on the current view
                    } else {
                      newSet.add(tab.id);
                      setEnabledTabs(newSet);
                      // Don't auto-switch tab when enabling
                    }
                  }}
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer hover:scale-110",
                    isEnabled
                      ? isActive
                        ? "border-white/50 bg-white/25"
                        : "border-[#00B4D8] bg-[#00B4D8]"
                      : "border-slate-300 bg-white hover:border-[#00B4CC80]"
                  )}>
                  {isEnabled && <Check className="text-white w-2.5 h-2.5 stroke-[4]" />}
                </span>
                {tab.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Week Day Selector */}
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-3">
          {DAY_SHORT_LABELS.map((day) => {
            const hasSlot = activeDays.has(day.key);
            return (
              <div 
                key={day.key} 
                className={cn(
                  "flex-1 h-9 flex items-center justify-center rounded-lg text-xs font-bold border transition-all duration-300",
                  hasSlot 
                    ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-sm" 
                    : "bg-[#F9FAFB] text-[#101828] border-[#E5E7EB]"
                )}
              >
                {day.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Hours Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#101828]">İş saatları</h3>
          <button 
            type="button"
            onClick={() => { setEditingId(null); setModalOpen(true); }} 
            className="flex items-center gap-2 bg-[#00B4CC] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#009DB3] active:scale-95 transition-all shadow-sm"
          >
            <Plus size={16} /> Əlavə et
          </button>
        </div>

        <div className="space-y-4 min-h-[120px]">
          {slots[activeTab].length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/50">
              <Clock size={32} className="mb-3 opacity-20" />
              <p className="text-sm font-medium italic text-slate-400">Bu kateqoriya üçün hələ saat əlavə edilməyib</p>
            </div>
          ) : (
            Object.entries(
              slots[activeTab].reduce((acc, slot) => {
                if (!acc[slot.day]) acc[slot.day] = [];
                acc[slot.day].push(slot);
                return acc;
              }, {} as Record<string, SavedSlot[]>)
            ).map(([dayKey, daySlots]) => (
              <div key={dayKey} className="space-y-3">
                <p className="text-sm font-bold text-[#101828]">{DAY_FULL_LABELS[dayKey]}</p>
                <div className="space-y-3">
                  {daySlots.map((slot, index) => (
                    <div key={slot.id} className="flex items-center justify-between bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB] hover:border-[#00B4CC40] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-xs font-bold text-[#4A5565] shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-[90px] h-9 bg-white px-3 flex items-center gap-2 rounded-lg border border-[#E5E7EB] text-xs font-bold text-[#161515] shadow-sm">
                             <Clock size={14} className="text-[#00B4D8]" /> {slot.startTime}
                           </div>
                           <span className="text-[#99A1AF] font-bold text-base">—</span>
                           <div className="w-[90px] h-9 bg-white px-3 flex items-center gap-2 rounded-lg border border-[#E5E7EB] text-xs font-bold text-[#161515] shadow-sm">
                             <Clock size={14} className="text-[#00B4D8]" /> {slot.endTime}
                           </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                         <button 
                           type="button" 
                           onClick={() => { setEditingId(slot.id); setModalOpen(true); }} 
                           className="w-9 h-9 flex items-center justify-center text-[#9035E9] bg-[#EEE1FB] rounded-lg hover:bg-[#E4D1F8] transition-all"
                         >
                           <Pencil size={18}/>
                         </button>
                         <button 
                           type="button" 
                           onClick={() => setSlots(p => ({...p, [activeTab]: p[activeTab].filter(s => s.id !== slot.id)}))} 
                           className="w-9 h-9 flex items-center justify-center text-[#F10303] bg-[#F103031A] rounded-lg hover:bg-[#F1030333] transition-all"
                         >
                           <Trash2 size={18}/>
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rest Days */}
      <div className="space-y-4 pt-6 border-t border-slate-100">
        <label className="text-base font-bold text-[#101828]">İstirahət günü</label>
        <div className="flex justify-between items-center gap-3">
          {DAY_SHORT_LABELS.map((day) => {
            const isRest = restDays.has(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => {
                  const newRest = new Set(restDays);
                  if (newRest.has(day.key)) {
                    newRest.delete(day.key);
                  } else {
                    newRest.add(day.key);
                    // Clear slots for this day across all tabs
                    setSlots(prev => ({
                      generalWorkHours: prev.generalWorkHours.filter(s => s.day !== day.key),
                      workHoursMan: prev.workHoursMan.filter(s => s.day !== day.key),
                      workHoursWoman: prev.workHoursWoman.filter(s => s.day !== day.key),
                    }));
                  }
                  setRestDays(newRest);
                }}
                className={cn(
                  "flex-1 h-[40px] flex items-center justify-center rounded-lg text-xs font-bold border transition-all duration-300",
                  isRest 
                    ? "border-[#F10303] text-[#F10303] bg-white shadow-md ring-2 ring-[#F1030305]" 
                    : "border-[#E5E7EB] text-[#364153] bg-[#F9FAFB] hover:bg-white hover:border-[#E5E7EB]"
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        <p className="text-[12px] text-[#6A7282] italic">İstirahət günündə dərs saatları əlavə edilə bilməz</p>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end items-center gap-3 pt-8 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            const { resetStep3Data } = useGymStore.getState();
            resetStep3Data();
            setSlots({
              generalWorkHours: [],
              workHoursMan: [],
              workHoursWoman: [],
            });
            setRestDays(new Set(["sunday"]));
          }}
          className="h-[40px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition-colors"
        >
          Sıfırla
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-[240px] h-[40px] rounded-lg bg-[#00B4CC] text-white font-medium text-[14px] hover:bg-[#009DB3] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Növbəti"}
        </button>
      </div>

      <AddClassTimeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        restDays={restDays}
        onRestDaysChange={(newRestDays) => {
          // Clear slots for newly added rest days across all tabs
          setSlots(prev => ({
            generalWorkHours: prev.generalWorkHours.filter(s => !newRestDays.has(s.day)),
            workHoursMan: prev.workHoursMan.filter(s => !newRestDays.has(s.day)),
            workHoursWoman: prev.workHoursWoman.filter(s => !newRestDays.has(s.day)),
          }));
          setRestDays(newRestDays);
        }}
        editData={editingId ? slots[activeTab].find(s => s.id === editingId) || null : null}
        onSubmit={(data) => {
          if (restDays.has(data.day)) {
            return toast.error("İstirahət gününə iş saatı əlavə edilə bilməz");
          }

          const timeToMin = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
          };

          const newStart = timeToMin(data.startTime);
          const newEnd = timeToMin(data.endTime);

          const conflict = slots[activeTab].find(s => {
            if (s.day !== data.day) return false;
            if (s.id === editingId) return false;

            const sStart = timeToMin(s.startTime);
            const sEnd = timeToMin(s.endTime);

            // Kəsişmə yoxlanışı: (StartA < EndB) AND (StartB < EndA)
            return (newStart < sEnd) && (sStart < newEnd);
          });

          if (conflict) {
            return toast.error("Bu zaman intervalı digəri ilə kəsişir və ya artıq mövcuddur");
          }

          if (editingId) {
            setSlots(prev => ({...prev, [activeTab]: prev[activeTab].map(s => s.id === editingId ? {...s, ...data} : s)}));
            setEditingId(null);
          } else {
            setSlots(prev => ({...prev, [activeTab]: [...prev[activeTab], { id: Math.random().toString(), ...data }]}));
          }
          // Don't close modal here — modal closes itself after iterating all days
        }}
      />
    </div>
  );
}