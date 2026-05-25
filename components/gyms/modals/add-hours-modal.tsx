'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddClassTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ClassTimeData) => void;
  /** If provided, pre-fill the form for editing */
  editData?: ClassTimeData | null;
}

export interface ClassTimeData {
  day?: string;
  days?: string[];
  startTime: string;
  endTime: string;
}

const DAY_BUTTONS = [
  { key: 'monday', label: 'B.e' },
  { key: 'tuesday', label: 'Ç.a' },
  { key: 'wednesday', label: 'Ç' },
  { key: 'thursday', label: 'C.a' },
  { key: 'friday', label: 'C' },
  { key: 'saturday', label: 'Ş' },
  { key: 'sunday', label: 'B' },
];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

export function AddClassTimeModal({
  open,
  onOpenChange,
  onSubmit,
  editData,
}: AddClassTimeModalProps) {
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [startDropdown, setStartDropdown] = useState(false);
  const [endDropdown, setEndDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (editData) {
        if (editData.days && editData.days.length > 0) {
          setSelectedDays(new Set(editData.days));
        } else if (editData.day) {
          setSelectedDays(new Set([editData.day]));
        } else {
          setSelectedDays(new Set());
        }
        setStartTime(editData.startTime);
        setEndTime(editData.endTime);
      } else {
        setSelectedDays(new Set());
        setStartTime('09:00');
        setEndTime('10:00');
      }
    }
  }, [open, editData]);

  const toggleDay = (key: string) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedDays.size === 0) {
      return toast.error("Ən azı bir gün seçilməlidir");
    }
    if (!startTime || !endTime) {
      return toast.error("Zəhmət olmasa saatları daxil edin");
    }

    if (startTime === endTime) {
      return toast.error("Bitiş vaxtı başlama vaxtı ilə eyni ola bilməz");
    }

    onSubmit?.({ days: Array.from(selectedDays), startTime, endTime });

    setSelectedDays(new Set());
    setStartTime('09:00');
    setEndTime('10:00');
    onOpenChange(false);
  };

  if (!mounted || !open) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
      
      {/* Modal */}
      <div className="relative w-full max-w-[500px] bg-white rounded-2xl border border-[#ECECED] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 flex flex-col gap-5">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-[#101828] leading-7">
              İş saatı əlavə et
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Week Day Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-black/60">Həftənin günləri</label>
            <div className="flex items-center gap-2 sm:gap-[9px]">
              {DAY_BUTTONS.map((day) => {
                const isSelected = selectedDays.has(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={cn(
                      "flex-1 h-9 rounded-lg text-[13px] font-medium border transition-all duration-200 flex items-center justify-center gap-1.5",
                      "bg-[#F9FAFB] text-[#101828] border-[#E5E7EB] hover:border-[#00B4CC80]"
                    )}
                  >
                    {/* Always-visible checkbox */}
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                      {isSelected ? (
                        <>
                          <rect x="0.5" y="0.5" width="17" height="17" rx="4" fill="#00B4CC" stroke="#00B4CC"/>
                          <path d="M5 9L8 12L13 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </>
                      ) : (
                        <rect x="0.5" y="0.5" width="17" height="17" rx="4" fill="white" stroke="#E5E7EB"/>
                      )}
                    </svg>
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker Row */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-black/60">Saat</label>
            <div className="flex items-center gap-0">
              {/* Start Time */}
              <div className={cn("flex-1 relative", startDropdown ? "z-30" : "z-10")}>
                <button
                  type="button"
                  onClick={() => { setStartDropdown(!startDropdown); setEndDropdown(false); }}
                  className="w-full h-[40px] px-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-between text-sm font-medium text-[#161515] hover:border-[#00B4CC80] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#00B4CC]" />
                    <span>{startTime}</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {startDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setStartDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-top-1">
                      <TimePicker 
                        value={startTime}
                        onChange={(val) => {
                          setStartTime(val);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Separator */}
              <div className="w-10 flex items-center justify-center shrink-0">
                <div className="w-5 h-[1px] bg-[#717182]" />
              </div>

              {/* End Time */}
              <div className={cn("flex-1 relative", endDropdown ? "z-30" : "z-10")}>
                <button
                  type="button"
                  onClick={() => { setEndDropdown(!endDropdown); setStartDropdown(false); }}
                  className="w-full h-[40px] px-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-between text-sm font-medium text-[#161515] hover:border-[#00B4CC80] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#00B4CC]" />
                    <span>{endTime}</span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {endDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setEndDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-top-1">
                      <TimePicker 
                        value={endTime}
                        onChange={(val) => {
                          setEndTime(val);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>


          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-[240px] h-[40px] mx-auto rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:bg-[#009DB3] active:scale-[0.98] transition-all shadow-md shadow-cyan-50"
          >
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

function TimePickerList({ items, selectedValue, onChange }: { items: string[], selectedValue: string, onChange: (val: string) => void }) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    }
  }, [selectedValue]);

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      <div 
        ref={listRef} 
        className="flex-1 overflow-y-auto flex flex-col gap-1 hide-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {items.map((item) => {
          const isSelected = item === selectedValue;
          return (
            <button
              key={item}
              type="button"
              data-active={isSelected ? "true" : "false"}
              onClick={() => onChange(item)}
              className={cn(
                "w-full h-6 flex items-center justify-center text-[12px] border-none bg-transparent cursor-pointer p-1 box-border transition-all duration-150 shrink-0",
                isSelected 
                  ? "text-[#00B4CC] border-[0.5px] border-[#00B4CC] rounded-[2px] font-semibold bg-[#00B4CC]/[0.04]"
                  : "text-black hover:bg-[#F9FAFB]"
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </>
  );
}

function TimePicker({ value, onChange }: TimePickerProps) {
  const [hVal, mVal] = value.split(':');
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="w-full h-[214px] bg-white flex items-stretch gap-1 p-2 box-border font-sans">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TimePickerList 
          items={hours} 
          selectedValue={hVal} 
          onChange={(h) => onChange(`${h}:${mVal}`)} 
        />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TimePickerList 
          items={minutes} 
          selectedValue={mVal} 
          onChange={(m) => onChange(`${hVal}:${m}`)} 
        />
      </div>
    </div>
  );
}
