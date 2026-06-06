"use client";

import { useState, useEffect } from "react";
import { Trash2, Pencil, Plus, Loader2, Clock, Check } from "lucide-react";
import { toast } from "sonner";
import { useGymWorkHours, useUpdateGymWorkHours } from "@/lib/query/gym-query";
import { AddClassTimeModal, ClassTimeData } from "../../gyms/modals/add-hours-modal";
import { IGymWorkHoursPayload, IWorkHour, IRestDay } from "@/lib/types/working-hours";
import { cn } from "@/lib/utils";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { useI18nStore } from "@/lib/i18n";

type GenderTab = "generalWorkHours" | "workHoursMan" | "workHoursWoman";

interface SavedSlot {
  day: string;
  startTime: string;
  endTime: string;
  id: string;
}

const BACKEND_DAY_MAP: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  AZ: {
    title: "Zal iş saatları",
    general: "Ümumi zal",
    onlyMen: "Yalnız kişilər",
    onlyWomen: "Yalnız qadınlar",
    workHours: "İş saatları",
    add: "Əlavə et",
    noHours: "Bu zal üçün hələ iş saatı əlavə edilməyib",
    restDay: "İstirahət günü",
    restDayHint: "İstirahət günündə dərs saatları əlavə edilə bilməz",
    save: "Yadda saxla",
    loading: "İş saatları yüklənir...",
    minOneHour: "Ən azı bir iş saatı əlavə edilməlidir",
    successUpdate: "İş saatları uğurla yeniləndi!",
    errorUpdate: "İş saatları məlumatları yanlışdır",
    mon: "B.e", tue: "Ç.a", wed: "Ç", thu: "C.a", fri: "C", sat: "Ş", sun: "B",
    monday: "Bazar ertəsi", tuesday: "Çərşənbə axşamı", wednesday: "Çərşənbə",
    thursday: "Cümə axşamı", friday: "Cümə", saturday: "Şənbə", sunday: "Bazar"
  },
  EN: {
    title: "Gym Working Hours",
    general: "General Gym",
    onlyMen: "Men Only",
    onlyWomen: "Women Only",
    workHours: "Working Hours",
    add: "Add Time",
    noHours: "No working hours have been added for this gym yet",
    restDay: "Rest Day",
    restDayHint: "Class hours cannot be added on a rest day",
    save: "Save",
    loading: "Loading working hours...",
    minOneHour: "At least one working hour must be added",
    successUpdate: "Working hours updated successfully!",
    errorUpdate: "Working hours data is invalid",
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
    monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
    thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday"
  },
  RU: {
    title: "Часы работы зала",
    general: "Общий зал",
    onlyMen: "Только мужчины",
    onlyWomen: "Только женщины",
    workHours: "Часы работы",
    add: "Добавить",
    noHours: "Часы работы для этого зала еще не добавлены",
    restDay: "Выходной день",
    restDayHint: "Часы занятий не могут быть добавлены в выходной день",
    save: "Сохранить",
    loading: "Загрузка часов работы...",
    minOneHour: "Необходимо добавить как минимум один рабочий час",
    successUpdate: "Часы работы успешно обновлены!",
    errorUpdate: "Данные часов работы недействительны",
    mon: "Пн", tue: "Вт", wed: "Ср", thu: "Чт", fri: "Пт", sat: "Сб", sun: "Вс",
    monday: "Понедельник", tuesday: "Вторник", wednesday: "Среда",
    thursday: "Четверг", friday: "Пятница", saturday: "Суббота", sunday: "Воскресенье"
  }
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

const resolveDayKey = (period: string): string => {
  if (!period) return "";
  const normalized = period.trim().toLowerCase();
  
  if (DAYS_ORDER.includes(normalized)) {
    return normalized;
  }
  
  for (const lang of Object.keys(LOCAL_TRANSLATIONS)) {
    const translations = LOCAL_TRANSLATIONS[lang];
    for (const key of DAYS_ORDER) {
      if (translations[key] && translations[key].toLowerCase() === normalized) {
        return key;
      }
    }
  }
  
  return normalized;
};

interface ZalWorkHoursTabProps {
  gymId: string | number;
}

export function ZalWorkHoursTab({ gymId }: ZalWorkHoursTabProps) {
  const selectedLang = useI18nStore((s) => s.locale) || "AZ";
  const lt = LOCAL_TRANSLATIONS[selectedLang] || LOCAL_TRANSLATIONS.AZ;

  const dayShortLabels = [
    { key: "monday", label: lt.mon },
    { key: "tuesday", label: lt.tue },
    { key: "wednesday", label: lt.wed },
    { key: "thursday", label: lt.thu },
    { key: "friday", label: lt.fri },
    { key: "saturday", label: lt.sat },
    { key: "sunday", label: lt.sun },
  ];

  const dayFullLabels: Record<string, string> = {
    monday: lt.monday, tuesday: lt.tuesday, wednesday: lt.wednesday,
    thursday: lt.thursday, friday: lt.friday, saturday: lt.saturday, sunday: lt.sunday
  };

  const formatDayGroup = (days: string[]) => {
    const sorted = [...days].sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
    if (sorted.length === 0) return "";
    if (sorted.length === 1) return dayFullLabels[sorted[0]];
    
    const indices = sorted.map(d => DAYS_ORDER.indexOf(d));
    let isConsecutive = true;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) {
        isConsecutive = false;
        break;
      }
    }
    
    if (isConsecutive) {
      return `${dayFullLabels[sorted[0]]} — ${dayFullLabels[sorted[sorted.length - 1]]}`;
    }
    
    return sorted.map(d => dayFullLabels[d]).join(", ");
  };

  const ALL_DAY_KEYS = dayShortLabels.map(d => d.key);

  const { data: gymWorkHours, isLoading } = useGymWorkHours(gymId);
  const updateWorkHours = useUpdateGymWorkHours();
  const [activeTab, setActiveTab] = useState<GenderTab>("generalWorkHours");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<{ days: string[]; startTime: string; endTime: string } | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");

  const [slots, setSlots] = useState<Record<GenderTab, SavedSlot[]>>({
    generalWorkHours: [],
    workHoursMan: [],
    workHoursWoman: [],
  });

  useEffect(() => {
    if (gymWorkHours) {
      setSlots({
        generalWorkHours: (gymWorkHours.generalWorkHours || []).map((s: any) => ({
          day: resolveDayKey(s.period),
          startTime: formatToHHmm(s.from),
          endTime: formatToHHmm(s.to),
          id: Math.random().toString()
        })),
        workHoursMan: (gymWorkHours.workHoursMan || []).map((s: any) => ({
          day: resolveDayKey(s.period),
          startTime: formatToHHmm(s.from),
          endTime: formatToHHmm(s.to),
          id: Math.random().toString()
        })),
        workHoursWoman: (gymWorkHours.workHoursWoman || []).map((s: any) => ({
          day: resolveDayKey(s.period),
          startTime: formatToHHmm(s.from),
          endTime: formatToHHmm(s.to),
          id: Math.random().toString()
        })),
      });
    }
  }, [gymWorkHours]);

  const handleSave = async () => {
    const totalSlots = slots.generalWorkHours.length + slots.workHoursMan.length + slots.workHoursWoman.length;
    if (totalSlots === 0) {
      setSuccessMessage(lt.minOneHour);
      setModalType("error");
      setShowSuccessModal(true);
      return;
    }

    const activeTabs = (["generalWorkHours", "workHoursMan", "workHoursWoman"] as GenderTab[]).filter(t => slots[t].length > 0);

    try {
      const payload = buildPayload(activeTabs);
      await updateWorkHours.mutateAsync({ gymId, payload });
      setSuccessMessage(lt.successUpdate);
      setModalType("success");
      setShowSuccessModal(true);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || lt.errorUpdate;
      setSuccessMessage(errMsg);
      setModalType("error");
      setShowSuccessModal(true);
    }
  };

  const isSaving = updateWorkHours.isPending;

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
      gymId: Number(gymId),
      generalWorkHours: mapToWorkHour("generalWorkHours"),
      workHoursMan: mapToWorkHour("workHoursMan"),
      workHoursWoman: mapToWorkHour("workHoursWoman"),
      restDays: computeRestDays(),
    };
  };

  const handleDeleteSlot = (days: string[], startTime: string, endTime: string) => {
    setSlots(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(s => 
        !(days.includes(s.day) && s.startTime === startTime && s.endTime === endTime)
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 text-slate-400">
        <Loader2 className="animate-spin text-[#00B4CC] mr-2" />
        <span>{lt.loading}</span>
      </div>
    );
  }

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
    if (slotsByDay[s.day]) {
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
    <div className="w-full bg-white rounded-[12px] border border-[#ECECED] p-5 sm:p-7 flex flex-col gap-9 font-sans text-black">
      <div className="flex flex-col gap-10">
        
        {/* Header & Title */}
        <div className="border-b border-[#ECECED] flex items-center justify-between pb-3">
          <h2 className="text-[20px] font-semibold text-black leading-[30px]">{lt.title}</h2>
        </div>
 
        {/* Main Content Area */}
        <div className="flex flex-col gap-7 text-base">
          
          {/* Gender Tabs */}
          <div className="flex w-full items-center justify-between gap-3 sm:gap-5 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: "generalWorkHours" as GenderTab, label: lt.general },
              { id: "workHoursMan" as GenderTab, label: lt.onlyMen },
              { id: "workHoursWoman" as GenderTab, label: lt.onlyWomen },
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
            {dayShortLabels.map((day) => {
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
              <h3 className="text-[18px] font-semibold tracking-[-0.44px] leading-[27px]">{lt.workHours}</h3>
            </div>
            <button 
              type="button"
              onClick={() => { setEditingGroup(null); setModalOpen(true); }} 
              className="h-[35px] w-[140px] sm:w-[176px] rounded-[4px] bg-[#00B4CC] flex items-center justify-center px-2 py-1 gap-2 sm:gap-3 text-[14px] font-medium text-white hover:bg-[#009DB3] transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="tracking-[-0.15px] leading-[20px]">{lt.add}</span>
            </button>
          </div>
 
          {/* Time Slots List */}
          <div className="flex flex-col gap-4">
            {groupedConfigs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-[24px] bg-slate-50/50">
                <Clock size={32} className="mb-3 opacity-20" />
                <p className="text-sm font-medium italic text-slate-400">{lt.noHours}</p>
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
                            onClick={() => handleDeleteSlot(group.days, slot.startTime, slot.endTime)}
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
        <h3 className="text-[18px] font-semibold tracking-[-0.44px] leading-[28px]">{lt.restDay}</h3>
        
        <div className="flex w-full items-center justify-between gap-2 sm:gap-3 relative overflow-x-auto pb-2 sm:pb-0 pointer-events-none">
          {dayShortLabels.map((day) => {
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
 
        <p className="text-[#6A7282] leading-[20px] tracking-[-0.15px]">{lt.restDayHint}</p>
      </div>
 
      {/* Footer Save Button */}
      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-[200px] h-[48px] rounded-[10px] bg-[#00B4CC] text-white flex items-center justify-center px-4 py-2 hover:bg-[#009DB3] transition-colors disabled:opacity-50 font-semibold"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : lt.save}
        </button>
      </div>

      <AddClassTimeModal
        open={modalOpen}
        onOpenChange={(val) => {
          setModalOpen(val);
          if (!val) setEditingGroup(null);
        }}
        editData={editingGroup ? { days: editingGroup.days, startTime: editingGroup.startTime, endTime: editingGroup.endTime } : null}
        onSubmit={(data: ClassTimeData) => {
          const timeToMin = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
          };

          const isOverlapping = (s1: number, e1: number, s2: number, e2: number) => {
            const intervals1 = s1 < e1 ? [[s1, e1]] : [[s1, 1440], [0, e1]];
            const intervals2 = s2 < e2 ? [[s2, e2]] : [[s2, 1440], [0, e2]];
            return intervals1.some(([a1, b1]) =>
              intervals2.some(([a2, b2]) => a1 < b2 && a2 < b1)
            );
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
                return isOverlapping(newStart, newEnd, sStart, sEnd);
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
              !(editingGroup.days.includes(s.day) && s.startTime === editingGroup.startTime && s.endTime === editingGroup.endTime)
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
                return isOverlapping(newStart, newEnd, sStart, sEnd);
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
      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        type={modalType}
      />
    </div>
  );
}
