"use client";

import { useState, useEffect } from "react";
import { Trash2, Pencil, Plus, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useAddGymWorkHours } from "@/lib/query/gym-work-hours";
import { AddClassTimeModal, ClassTimeData } from "../modals/add-hours-modal";
import { IGymWorkHoursPayload, IWorkHour, IRestDay } from "@/lib/types/working-hours";

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

export default function WorkingHoursPanel({ onNext }: { onNext?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<GenderTab>("generalWorkHours");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDataSaved, setIsDataSaved] = useState(false);

  const [slots, setSlots] = useState<Record<GenderTab, SavedSlot[]>>({
    generalWorkHours: [],
    workHoursMan: [],
    workHoursWoman: [],
  });

  const [restDays, setRestDays] = useState<Set<string>>(new Set(["sunday"]));

  const gymId = useGymStore((state) => state.gymId);
  const { mutateAsync, isPending } = useAddGymWorkHours();

  useEffect(() => { setMounted(true); }, []);

  const handleNext = () => {
    console.log("next");
    
    if (isDataSaved) {
      onNext?.();
    } else {
      toast.info("Əvvəl məlumatları yadda saxlayın");
    }
  };

  const buildPayload = (): IGymWorkHoursPayload => {
    const mapToWorkHour = (items: SavedSlot[]): IWorkHour[] => 
      items.map(s => ({
        period: BACKEND_DAY_MAP[s.day] || s.day,
        from: s.startTime,
        to: s.endTime,
      }));

    return {
      gymId: Number(gymId),
      generalWorkHours: mapToWorkHour(slots.generalWorkHours),
      workHoursMan: mapToWorkHour(slots.workHoursMan),
      workHoursWoman: mapToWorkHour(slots.workHoursWoman),
      restDays: Array.from(restDays).map(d => ({ period: BACKEND_DAY_MAP[d] || d })),
    };
  };

  // Yadda saxla funksiyası
  const handleSubmit = async () => {
    if (!gymId) return toast.error("Zal ID tapılmadı");

    const payload = buildPayload();
    const hasData = 
      payload.generalWorkHours.length > 0 || 
      payload.workHoursMan.length > 0 || 
      payload.workHoursWoman.length > 0;

    if (!hasData) {
      return toast.info("Heç bir məlumat daxil edilməyib");
    }

    try {
      // Async sorğunu gözləyirik
      await mutateAsync(payload);
      toast.success("Məlumatlar uğurla sinxronlaşdırıldı");
      setIsDataSaved(true); // Yadda saxlandı qeyd olunur
    } catch (error: any) {
      console.error("Xəta baş verdi:", error);
      toast.error(error?.message || "Server xətası baş verdi (500)");
      setIsDataSaved(false); // Uğursuz oldu
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-[783px] mx-auto bg-white rounded-xl border border-[#ECECED] p-[28px] space-y-8 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#1F2937]">Zal məlumatları</h2>
        <div className="flex gap-4 text-sm font-medium text-[#6B7280]">
          <span className="text-[#00B4D8] border-b-2 border-[#00B4D8] cursor-pointer">Az</span>
          <span className="hover:text-[#00B4D8] cursor-pointer transition-colors">Ru</span>
          <span className="hover:text-[#00B4D8] cursor-pointer transition-colors">En</span>
        </div>
      </div>

      <div className="flex gap-3">
        {[
          { id: "generalWorkHours", label: "Ümumi zal" },
          { id: "workHoursMan", label: "Yalnız kişilər" },
          { id: "workHoursWoman", label: "Yalnız qadınlar" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as GenderTab)}
            className={`px-6 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              activeTab === tab.id 
                ? "bg-[#00B4D8] text-white border-[#00B4D8] shadow-md shadow-cyan-100" 
                : "bg-white text-[#6B7280] border-[#ECECED] hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {DAY_SHORT_LABELS.map((day) => (
          <div key={day.key} className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F9FAFB] text-[#6B7280] text-xs border border-[#ECECED]">
            {day.label}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-2">
          <span className="text-sm font-bold text-[#1F2937] uppercase tracking-tight">İş saatları</span>
          <button 
            type="button"
            onClick={() => { setEditingId(null); setModalOpen(true); }} 
            className="flex items-center gap-1.5 bg-[#00B4D8] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
          >
            <Plus size={14} strokeWidth={3} /> Əlavə et
          </button>
        </div>

        <div className="min-h-[120px] space-y-4">
          {slots[activeTab].length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#9CA3AF] border-2 border-dashed border-[#F3F4F6] rounded-2xl">
              <Clock size={24} className="mb-2 opacity-20" />
              <p className="text-xs italic">Hələ ki, saat əlavə edilməyib</p>
            </div>
          ) : (
            slots[activeTab].map((slot, index) => (
              <div key={slot.id} className="animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-semibold text-[#374151] mb-2">{DAY_FULL_LABELS[slot.day]}</p>
                <div className="flex items-center gap-4 bg-[#F9FAFB] p-3 rounded-xl border border-[#ECECED]">
                  <div className="bg-white w-8 h-8 flex items-center justify-center rounded border border-[#ECECED] text-xs font-bold text-[#9CA3AF]">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                     <div className="bg-white px-4 py-2 rounded-lg border border-[#ECECED] text-sm font-medium">🕒 {slot.startTime}</div>
                     <span className="text-[#D1D5DB]">—</span>
                     <div className="bg-white px-4 py-2 rounded-lg border border-[#ECECED] text-sm font-medium">🕒 {slot.endTime}</div>
                  </div>
                  <div className="flex gap-2">
                     <button type="button" onClick={() => { setEditingId(slot.id); setModalOpen(true); }} className="p-2.5 text-[#00B4D8] bg-[#E0F7FA] rounded-lg hover:bg-[#B2EBF2] transition-colors"><Pencil size={16}/></button>
                     <button type="button" onClick={() => setSlots(p => ({...p, [activeTab]: p[activeTab].filter(s => s.id !== slot.id)}))} className="p-2.5 text-[#EF4444] bg-[#FEE2E2] rounded-lg hover:bg-[#FECACA] transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-[#F3F4F6]">
        <span className="text-sm font-bold text-[#1F2937] uppercase tracking-tight">İstirahət günü</span>
        <div className="flex gap-2">
          {DAY_SHORT_LABELS.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => {
                const newRest = new Set(restDays);
                newRest.has(day.key) ? newRest.delete(day.key) : newRest.add(day.key);
                setRestDays(newRest);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold border transition-all duration-200 ${
                restDays.has(day.key) 
                  ? "border-[#EF4444] text-[#EF4444] bg-[#FFF1F2]" 
                  : "border-[#ECECED] text-[#6B7280] bg-[#F9FAFB]"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 py-4 rounded-xl border border-[#D1D5DB] text-[#4B5563] font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Yadda saxla"}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-4 rounded-xl bg-[#00B4D8] text-white font-bold text-sm hover:bg-[#0096B4] shadow-lg shadow-cyan-100 flex items-center justify-center"
        >
          Növbəti
        </button>
      </div>

      <AddClassTimeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={(data) => {
          if (editingId) {
            setSlots(prev => ({...prev, [activeTab]: prev[activeTab].map(s => s.id === editingId ? {...s, ...data} : s)}));
            setEditingId(null);
          } else {
            setSlots(prev => ({...prev, [activeTab]: [...prev[activeTab], { id: Math.random().toString(), ...data }]}));
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
}