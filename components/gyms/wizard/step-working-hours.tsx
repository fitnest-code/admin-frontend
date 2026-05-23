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

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const formatToHHmm = (timeVal: any): string => {
  if (!timeVal) return "";
  if (Array.isArray(timeVal)) {
    const hours = timeVal[0] ?? 0;
    const minutes = timeVal[1] ?? 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  const timeStr = String(timeVal);
  let isPM = timeStr.toLowerCase().includes("pm");
  let isAM = timeStr.toLowerCase().includes("am");
  let cleanTime = timeStr.replace(/(am|pm)/i, "").trim();
  const parts = cleanTime.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  return timeStr;
};

const formatDayGroup = (days: string[]) => {
  const sorted = [...days].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
  if (sorted.length === 0) return "";
  if (sorted.length === 1) return DAY_FULL_LABELS[sorted[0]];
  
  const indices = sorted.map(d => DAYS_ORDER.indexOf(d));
  let isConsecutive = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      isConsecutive = false;
      break;
    }
  }
  
  if (isConsecutive) {
    return `${DAY_FULL_LABELS[sorted[0]]} — ${DAY_FULL_LABELS[sorted[sorted.length - 1]]}`;
  }
  
  return sorted.map(d => DAY_FULL_LABELS[d]).join(", ");
};

export function StepWorkingHours({ onNext }: { onNext?: () => void }) {
  const { gymId, step3Data, setStep3Data } = useGymStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<GenderTab>("generalWorkHours");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ days: string[]; startTime: string; endTime: string } | null>(null);

  // Map backend data back to frontend structure if exists
  const initialSlots = step3Data ? {
    generalWorkHours: step3Data.generalWorkHours.map((s: any) => ({ ...s, day: s.period.toLowerCase(), startTime: formatToHHmm(s.from), endTime: formatToHHmm(s.to), id: Math.random().toString() })),
    workHoursMan: step3Data.workHoursMan.map((s: any) => ({ ...s, day: s.period.toLowerCase(), startTime: formatToHHmm(s.from), endTime: formatToHHmm(s.to), id: Math.random().toString() })),
    workHoursWoman: step3Data.workHoursWoman.map((s: any) => ({ ...s, day: s.period.toLowerCase(), startTime: formatToHHmm(s.from), endTime: formatToHHmm(s.to), id: Math.random().toString() })),
  } : {
    generalWorkHours: [],
    workHoursMan: [],
    workHoursWoman: [],
  };

  const [slots, setSlots] = useState<Record<GenderTab, SavedSlot[]>>(initialSlots);

  const validateStep3 = useValidateGymStep3();

  useEffect(() => { setMounted(true); }, []);

  const handleNext = async () => {
    const totalSlots = slots.generalWorkHours.length + slots.workHoursMan.length + slots.workHoursWoman.length;
    if (totalSlots === 0) {
      return toast.error("Ən azı bir iş saatı əlavə edilməlidir");
    }

    const activeTabs = (["generalWorkHours", "workHoursMan", "workHoursWoman"] as GenderTab[]).filter(t => slots[t].length > 0);

    try {
      const payload = buildPayload(activeTabs);
      await validateStep3.mutateAsync(payload);
      setStep3Data(payload);
      onNext?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "İş saatları məlumatları yanlışdır");
    }
  };

  const isSubmitting = validateStep3.isPending;

  const ALL_DAY_KEYS = DAY_SHORT_LABELS.map(d => d.key);

  const buildPayload = (activeTabs: GenderTab[]): IGymWorkHoursPayload => {
    const mapToWorkHour = (key: GenderTab): IWorkHour[] => {
      return slots[key].map(s => ({
        period: s.day ? (BACKEND_DAY_MAP[s.day] || s.day) : "",
        from: s.startTime,
        to: s.endTime,
      }));
    };

    const computeRestDays = (): IRestDay[] => {
      const allRestDays = new Set<string>();

      if (activeTabs.length > 0) {
        for (const dayKey of ALL_DAY_KEYS) {
          const hasSlotInAnyEnabled = activeTabs.some(tab => 
            slots[tab].some(s => s.day === dayKey)
          );
          if (!hasSlotInAnyEnabled) {
            allRestDays.add(dayKey);
          }
        }
      } else {
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
  
  // Compute rest days for UI display
  const activeTabsForDisplay = (["generalWorkHours", "workHoursMan", "workHoursWoman"] as GenderTab[]).filter(t => slots[t].length > 0);
  const computedRestDays = new Set<string>();
  if (activeTabsForDisplay.length > 0) {
    for (const dayKey of ALL_DAY_KEYS) {
      const hasSlot = activeTabsForDisplay.some(tab => slots[tab].some(s => s.day === dayKey));
      if (!hasSlot) computedRestDays.add(dayKey);
    }
  } else {
    ALL_DAY_KEYS.forEach(d => computedRestDays.add(d));
  }

  // 1. Group active slots by day
  const slotsByDay: Record<string, SavedSlot[]> = {};
  DAYS_ORDER.forEach(d => {
    slotsByDay[d] = [];
  });
  slots[activeTab].forEach(s => {
    if (s.day && slotsByDay[s.day]) {
      slotsByDay[s.day].push(s);
    }
  });
  DAYS_ORDER.forEach(d => {
    slotsByDay[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  // 2. Group days with identical slot configurations
  interface GroupedDayConfig {
    days: string[];
    slots: SavedSlot[];
  }
  const groupedConfigs: GroupedDayConfig[] = [];
  DAYS_ORDER.forEach(day => {
    const daySlots = slotsByDay[day];
    if (daySlots.length === 0) return;
    
    const foundGroup = groupedConfigs.find(g => {
      if (g.slots.length !== daySlots.length) return false;
      for (let i = 0; i < daySlots.length; i++) {
        if (daySlots[i].startTime !== g.slots[i].startTime || daySlots[i].endTime !== g.slots[i].endTime) {
          return false;
        }
      }
      return true;
    });
    
    if (foundGroup) {
      foundGroup.days.push(day);
    } else {
      groupedConfigs.push({
        days: [day],
        slots: daySlots
      });
    }
  });

  return (
    <div className="w-full bg-white rounded-[12px] border border-[#ECECED] p-5 sm:p-7 flex flex-col gap-9 font-sans animate-in fade-in duration-500">
      <div className="flex flex-col gap-10">
        
        {/* Header & Languages */}
        <div className="border-b border-[#ECECED] flex items-center justify-between pb-1">
          <h2 className="text-[20px] font-semibold text-black leading-[30px]">Zal məlumatları</h2>
          <div className="flex items-center gap-[34px] text-base text-center">
            <div className="w-[26px] border-b border-[#00B4CC] flex flex-col items-center justify-center p-[2px]">
              <span className="leading-[24px]">Az</span>
            </div>
            <div className="w-[26px] flex flex-col items-center justify-center p-[2px] cursor-pointer hover:opacity-70 transition-opacity text-slate-400">
              <span className="leading-[24px]">Ru</span>
            </div>
            <div className="w-[26px] flex flex-col items-center justify-center p-[2px] cursor-pointer hover:opacity-70 transition-opacity text-slate-400">
              <span className="leading-[24px]">En</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col gap-7 text-base">
          
          {/* Gender Tabs */}
          <div className="flex w-full items-center justify-between gap-3 sm:gap-5 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: "generalWorkHours" as GenderTab, label: "Ümumi zal" },
              { id: "workHoursMan" as GenderTab, label: "Yalnız kişilər" },
              { id: "workHoursWoman" as GenderTab, label: "Yalnız qadınlar" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-[120px] h-[48px] rounded-[32px] flex items-center justify-center px-4 sm:px-[28px] py-[8px] transition-all font-medium leading-[24px] whitespace-nowrap",
                    isActive 
                      ? "bg-[#00B4CC] text-white" 
                      : "bg-white border border-[#00B4CC] text-black hover:bg-slate-50"
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Week Days Indicators (with checkboxes) */}
          <div className="flex w-full items-center justify-between gap-2 sm:gap-[18.5px] text-[14px] text-center overflow-x-auto pb-2 sm:pb-0">
            {DAY_SHORT_LABELS.map((day) => {
              const hasSlot = activeDays.has(day.key);
              return (
                <div 
                  key={day.key}
                  className="flex-1 min-w-[50px] h-[40px] rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col items-center justify-center py-[11px]"
                >
                  <div className="flex items-center gap-1 sm:gap-[9px]">
                    <div className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center">
                      <div className={cn(
                        "w-4 h-4 sm:w-[18px] sm:h-[18px] rounded flex items-center justify-center border transition-colors",
                        hasSlot ? "bg-[#00B4CC] border-[#00B4CC]" : "bg-white border-[#D1D5DB]"
                      )}>
                        {hasSlot && <Check size={12} strokeWidth={3} className="text-white" />}
                      </div>
                    </div>
                    <span className="leading-[18px]">{day.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Working Hours Header & Add Button */}
          <div className="flex items-center justify-between h-[47px] mt-2">
            <div className="flex flex-col items-start">
              <h3 className="text-[18px] font-semibold tracking-[-0.44px] leading-[27px]">İş saatları</h3>
            </div>
            <button 
              type="button"
              onClick={() => { setEditingGroup(null); setModalOpen(true); }} 
              className="h-[35px] w-[140px] sm:w-[176px] rounded-[4px] bg-[#00B4CC] flex items-center justify-center px-2 py-1 gap-2 sm:gap-3 text-[14px] font-medium text-white hover:bg-[#009DB3] transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="tracking-[-0.15px] leading-[20px]">Əlavə et</span>
            </button>
          </div>
 
          {/* Time Slots List */}
          <div className="flex flex-col gap-4">
            {groupedConfigs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/50">
                <Clock size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium italic text-slate-400">Bu zal üçün hələ iş saatı əlavə edilməyib</p>
              </div>
            ) : (
              groupedConfigs.map((group, groupIdx) => (
                <div key={groupIdx} className="flex flex-col gap-4 pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[18px] font-semibold tracking-[-0.44px] leading-[27px]">
                      {formatDayGroup(group.days)}
                    </h4>
                  </div>
                  <div className="flex flex-col gap-[16px] text-[14px] text-[#4A5565]">
                    {group.slots.map((slot, index) => (
                      <div key={slot.id} className="min-h-[73px] bg-[#F9FAFB] rounded-[14px] border border-[#E5E7EB] flex flex-wrap items-center justify-between p-3 sm:px-4 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-[38px] h-[38px] rounded-[10px] bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                            <span className="font-medium tracking-[-0.15px] leading-[20px]">{index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2 h-[38.7px] text-[16px] text-[#161515]">
                            <div className="w-[98px] rounded-[10px] bg-white border border-[#E5E7EB] flex flex-col items-start px-[15px] py-[8px]">
                              <div className="w-full flex items-center gap-[9px]">
                                <Clock size={13} className="text-[#00B4CC]" />
                                <span className="font-medium tracking-[-0.31px] leading-[24px]">{slot.startTime}</span>
                              </div>
                            </div>
                            <span className="text-[#99A1AF] font-medium tracking-[-0.31px] leading-[24px]">—</span>
                            <div className="w-[98px] rounded-[10px] bg-white border border-[#E5E7EB] flex flex-col items-start px-[15px] py-[8px]">
                              <div className="w-full flex items-center gap-[9px]">
                                <Clock size={13} className="text-[#00B4CC]" />
                                <span className="font-medium tracking-[-0.31px] leading-[24px]">{slot.endTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-[94px] flex items-center justify-end gap-3 ml-auto">
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingGroup({ days: group.days, startTime: slot.startTime, endTime: slot.endTime });
                              setModalOpen(true);
                            }}
                            className="w-[30px] h-[30px] rounded bg-[#EEE1FB] flex items-center justify-center text-[#9035E9] hover:opacity-80 transition-opacity"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setSlots(prev => ({
                                ...prev,
                                [activeTab]: prev[activeTab].filter(s => 
                                  !(s.day && group.days.includes(s.day) && s.startTime === slot.startTime && s.endTime === slot.endTime)
                                )
                              }));
                            }}
                            className="w-[30px] h-[30px] rounded bg-[#F103031A] flex items-center justify-center text-[#F10303] hover:opacity-80 transition-opacity"
                          >
                            <Trash2 size={18} />
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
      </div>

      {/* Rest Days Section */}
      <div className="bg-white rounded-[14px] pt-[25px] pb-[1px] flex flex-col gap-4 font-sans text-[14px]">
        <h3 className="text-[18px] font-semibold tracking-[-0.44px] leading-[28px]">İstirahət günü</h3>
        
        <div className="flex w-full items-center justify-between gap-2 sm:gap-3 relative overflow-x-auto pb-2 sm:pb-0 pointer-events-none">
          {DAY_SHORT_LABELS.map((day) => {
            const isRest = computedRestDays.has(day.key);
            return (
              <div
                key={day.key}
                className={cn(
                  "flex-1 min-w-[50px] h-[48px] rounded-[10px] border-[2px] flex items-center justify-center px-2 py-3 transition-colors",
                  isRest 
                    ? "border-[#F10303] text-[#F10303] bg-[#F9FAFB]" 
                    : "bg-[#F9FAFB] border-[#E5E7EB] text-[#364153]"
                )}
              >
                <span className="font-medium leading-[20px] tracking-[-0.15px]">{day.label}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[#6A7282] leading-[20px] tracking-[-0.15px]">İstirahət günündə dərs saatları əlavə edilə bilməz</p>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-5 text-center text-[16px] mt-2">
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
          }}
          className="w-full sm:w-[280px] h-[48px] rounded-[10px] bg-white border border-[#00B4CC] flex items-center justify-center px-4 py-2 text-black hover:bg-slate-50 transition-colors"
        >
          <span className="font-medium leading-[24px]">Sıfırla</span>
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-full sm:w-[280px] h-[48px] rounded-[10px] bg-[#00B4CC] text-white flex items-center justify-center px-4 py-2 hover:bg-[#009DB3] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span className="font-medium leading-[24px]">Növbəti</span>}
        </button>
      </div>

      <AddClassTimeModal
        open={modalOpen}
        onOpenChange={(val) => {
          setModalOpen(val);
          if (!val) setEditingGroup(null);
        }}
        editData={editingGroup ? { days: editingGroup.days, startTime: editingGroup.startTime, endTime: editingGroup.endTime } : null}
        onSubmit={(data) => {
          const timeToMin = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
          };

          const newStart = timeToMin(data.startTime);
          const newEnd = timeToMin(data.endTime);
          const targetDays = data.days || (data.day ? [data.day] : []);

          if (editingGroup) {
            // Check conflicts for each day in the NEW selection (excluding the slot we are editing)
            let hasConflict = false;
            for (const day of targetDays) {
              const conflict = slots[activeTab].find(s => {
                if (s.day !== day) return false;
                if (editingGroup.days.includes(s.day) && s.startTime === editingGroup.startTime && s.endTime === editingGroup.endTime) {
                  return false;
                }
                const sStart = timeToMin(s.startTime);
                const sEnd = timeToMin(s.endTime);
                return (newStart < sEnd) && (sStart < newEnd);
              });
              if (conflict) {
                hasConflict = true;
                break;
              }
            }

            if (hasConflict) {
              return toast.error("Bu zaman intervalı digəri ilə kəsişir və ya artıq mövcuddur");
            }

            // Remove the old slots matching editingGroup.days and old time
            const filteredSlots = slots[activeTab].filter(s => 
              !(s.day && editingGroup.days.includes(s.day) && s.startTime === editingGroup.startTime && s.endTime === editingGroup.endTime)
            );

            // Add the new slots for each day in targetDays
            const newSlotsForGroup = targetDays.map(day => ({
              day,
              startTime: data.startTime,
              endTime: data.endTime,
              id: Math.random().toString()
            }));

            setSlots(prev => ({
              ...prev,
              [activeTab]: [...filteredSlots, ...newSlotsForGroup]
            }));
            setEditingGroup(null);
          } else {
            // Check conflict for each of the target days we are adding to
            let hasConflict = false;
            for (const day of targetDays) {
              const conflict = slots[activeTab].find(s => {
                if (s.day !== day) return false;
                const sStart = timeToMin(s.startTime);
                const sEnd = timeToMin(s.endTime);
                return (newStart < sEnd) && (sStart < newEnd);
              });
              if (conflict) {
                hasConflict = true;
                break;
              }
            }

            if (hasConflict) {
              return toast.error("Bu zaman intervalı digəri ilə kəsişir və ya artıq mövcuddur");
            }

            const newSlots = targetDays.map(day => ({
              day,
              startTime: data.startTime,
              endTime: data.endTime,
              id: Math.random().toString()
            }));

            setSlots(prev => ({
              ...prev,
              [activeTab]: [...prev[activeTab], ...newSlots]
            }));
          }
        }}
      />
    </div>
  );
}