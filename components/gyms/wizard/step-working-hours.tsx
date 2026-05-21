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
        period: BACKEND_DAY_MAP[s.day] || s.day,
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
          <div className="flex items-center justify-between gap-5 overflow-x-auto pb-2 sm:pb-0">
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
                    "min-w-[150px] sm:w-[180px] h-[48px] rounded-[32px] flex items-center justify-center px-4 sm:px-[28px] py-[8px] transition-all font-medium leading-[24px] whitespace-nowrap",
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
          <div className="flex items-center justify-between gap-2 sm:gap-[18.5px] text-[14px] text-center overflow-x-auto pb-2 sm:pb-0">
            {DAY_SHORT_LABELS.map((day) => {
              const hasSlot = activeDays.has(day.key);
              return (
                <div 
                  key={day.key}
                  className="min-w-[60px] sm:w-[88px] h-[40px] rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] flex flex-col items-center justify-center py-[11px]"
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
              onClick={() => { setEditingId(null); setModalOpen(true); }} 
              className="h-[35px] w-[140px] sm:w-[176px] rounded-[4px] bg-[#00B4CC] flex items-center justify-center px-2 py-1 gap-2 sm:gap-3 text-[14px] font-medium text-white hover:bg-[#009DB3] transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="tracking-[-0.15px] leading-[20px]">Əlavə et</span>
            </button>
          </div>

          {/* Time Slots List */}
          <div className="flex flex-col gap-4">
            {slots[activeTab].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/50">
                <Clock size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium italic text-slate-400">Bu zal üçün hələ iş saatı əlavə edilməyib</p>
              </div>
            ) : (
              Object.entries(
                slots[activeTab].reduce((acc, slot) => {
                  if (!acc[slot.day]) acc[slot.day] = [];
                  acc[slot.day].push(slot);
                  return acc;
                }, {} as Record<string, SavedSlot[]>)
              ).map(([dayKey, daySlots]) => (
                <div key={dayKey} className="flex flex-col gap-4 pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[18px] font-semibold tracking-[-0.44px] leading-[27px]">{DAY_FULL_LABELS[dayKey]}</h4>
                  </div>
                  <div className="flex flex-col gap-[16px] text-[14px] text-[#4A5565]">
                    {daySlots.map((slot, index) => (
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
                            onClick={() => { setEditingId(slot.id); setModalOpen(true); }}
                            className="w-[30px] h-[30px] rounded bg-[#EEE1FB] flex items-center justify-center text-[#9035E9] hover:opacity-80 transition-opacity"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setSlots(p => ({...p, [activeTab]: p[activeTab].filter(s => s.id !== slot.id)}))}
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
        
        <div className="flex items-center justify-between gap-2 sm:gap-3 relative overflow-x-auto pb-2 sm:pb-0 pointer-events-none">
          {DAY_SHORT_LABELS.map((day) => {
            const isRest = computedRestDays.has(day.key);
            return (
              <div
                key={day.key}
                className={cn(
                  "min-w-[60px] sm:w-[84px] h-[48px] rounded-[10px] border-[2px] flex items-center justify-center px-2 py-3 transition-colors",
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
        onOpenChange={setModalOpen}
        editData={editingId ? slots[activeTab].find(s => s.id === editingId) || null : null}
        onSubmit={(data) => {
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
        }}
      />
    </div>
  );
}