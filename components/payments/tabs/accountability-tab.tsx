"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";

const zeroData = [
  { name: "", value: 0 },
  { name: "", value: 0 },
  { name: "", value: 0 },
  { name: "", value: 0 },
  { name: "", value: 0 },
];

const activityData = [
  { name: "1", value: 0 },
  { name: "2", value: 0.6 },
  { name: "3", value: 0.1 },
  { name: "4", value: 0.9 },
  { name: "5", value: 0.3 },
  { name: "6", value: 0.0 },
  { name: "7", value: 0.0 },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_AZ: Record<string, string> = {
  Jan: "Yan", Feb: "Fev", Mar: "Mar", Apr: "Apr",
  May: "May", Jun: "İyn", Jul: "İyl", Aug: "Avq",
  Sep: "Sen", Oct: "Okt", Nov: "Noy", Dec: "Dek",
};

function formatDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function DateRangePicker({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (from: Date, to: Date) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<Date | null>(null);

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const isInRange = (d: Date) => {
    const rangeEnd = end ?? hovered;
    if (!start || !rangeEnd) return false;
    const [a, b] = start <= rangeEnd ? [start, rangeEnd] : [rangeEnd, start];
    return d > a && d < b;
  };
  const isStart = (d: Date) => start?.toDateString() === d.toDateString();
  const isEnd = (d: Date) => (end ?? hovered)?.toDateString() === d.toDateString();

  const handleDay = (d: Date) => {
    if (!start || (start && end)) {
      setStart(d); setEnd(null);
    } else {
      if (d < start) { setEnd(start); setStart(d); }
      else { setEnd(d); }
    }
  };

  const rangeLabel = () => {
    if (!start) return "Tarix seçin";
    if (!end && !hovered) return formatDate(start);
    const e = end ?? hovered!;
    const [a, b] = start <= e ? [start, e] : [e, start];
    return `${formatDate(a)}  -  ${formatDate(b)}`;
  };

  const cells: { date: Date; current: boolean }[] = [];
  for (let i = firstDay === 0 ? 6 : firstDay - 1; i > 0; i--)
    cells.push({ date: new Date(year, month - 1, daysInPrev - i + 1), current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push({ date: new Date(year, month + 1, d), current: false });

  return (
    <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl w-80 p-4">
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm text-gray-700">
        <Calendar size={14} className="text-gray-400 shrink-0" />
        <span className="truncate">{rangeLabel()}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <div className="flex items-center gap-2">
          <select
            value={MONTHS[month]}
            onChange={(e) => setMonth(MONTHS.indexOf(e.target.value))}
            className="text-sm font-medium text-gray-800 bg-transparent border border-gray-200 rounded-md px-2 py-0.5 focus:outline-none"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{MONTH_AZ[m]}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm font-medium text-gray-800 bg-transparent border border-gray-200 rounded-md px-2 py-0.5 focus:outline-none"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map(({ date, current }, i) => {
          const inRange = isInRange(date);
          const sel = isStart(date) || isEnd(date);
          return (
            <button
              key={i}
              onClick={() => current && handleDay(date)}
              onMouseEnter={() => start && !end && setHovered(date)}
              onMouseLeave={() => setHovered(null)}
              className={`
                relative text-center text-sm py-1.5 transition-colors rounded-full
                ${!current ? "text-gray-300 cursor-default" : "cursor-pointer"}
                ${sel && current ? "bg-[#00BCD4] text-white font-semibold" : ""}
                ${inRange && current && !sel ? "bg-[#E0F7FA] text-gray-800 rounded-none" : ""}
                ${current && !sel && !inRange ? "hover:bg-gray-100 text-gray-700" : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => { setStart(null); setEnd(null); setHovered(null); }}
          className="text-sm text-[#00BCD4] hover:underline font-medium"
        >
          Təmizlə
        </button>
      </div>

      {start && end && (
        <button
          onClick={() => { onApply(start, end); onClose(); }}
          className="w-full mt-2 bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Tətbiq et
        </button>
      )}
    </div>
  );
}

function TransferModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("0.89");
  const komissiya = 0.0;
  const odenisAmount = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="text-base font-semibold text-gray-900 text-center mb-5">
          Köçürmə sorğusu
        </h3>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1.5">Məbləğ</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4]"
          />
        </div>

        <div className="space-y-1 mb-6 text-sm text-gray-600">
          <p>Komissiya: <span className="font-medium text-gray-800">{komissiya.toFixed(2)} AZN</span></p>
          <p>Ödəniş məbləği: <span className="font-medium text-gray-800">{odenisAmount.toFixed(2)} AZN</span></p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Göndər
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Ləğv et
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountabilityTab() {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dövürLabel = dateRange
    ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : "Dövr";

  return (
    <div className="space-y-8 pt-2 pb-8">

      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-100 text-cyan-500 rounded-lg">
            <Image src="/coin.svg" alt="coin" width={20} height={20} />
          </div>
          <span className="font-semibold text-slate-900 text-sm md:text-[20px]">Toplanılan məbləğ</span>
        </div>
        <div className="flex items-center gap-8">
          <span className="font-bold text-slate-900 text-base md:text-lg">0.88 AZN</span>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="bg-[#00b4d8] hover:bg-[#0096c7] text-white text-xs md:text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Köçürmə sorğusu
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-slate-900">Ödəniş</h2>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-cyan-200 rounded-lg text-xs bg-white hover:bg-cyan-50 transition-colors cursor-pointer text-cyan-600 font-medium">
              Yenilə
            </button>

            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setDatePickerOpen((v) => !v)}
                className="inline-flex items-center justify-between gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 outline-none min-w-28 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-32">{dövürLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {datePickerOpen && (
                <DateRangePicker
                  onClose={() => setDatePickerOpen(false)}
                  onApply={(from, to) => setDateRange({ from, to })}
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">0.00 AZN</span>
            <span className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-100/70 rounded-[12px] text-base font-medium">
              <TrendingDown className="w-3 h-3 text-red-500" /> -100%
            </span>
          </div>
          <p className="text-base text-slate-900 font-medium">Əməliyyatlar: 0</p>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={zeroData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <YAxis domain={[0, 1.0]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <XAxis dataKey="name" hide />
              <Area type="monotone" dataKey="value" stroke="#00B4CC" strokeWidth={5} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-[20px] font-bold text-slate-900 mb-4">Köçürmələr</h2>
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">0.00 AZN</span>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-100/70 rounded-[12px] text-base font-medium">
                <TrendingDown className="w-3 h-3 text-red-500" /> -100%
              </span>
            </div>
            <p className="text-base text-slate-900 font-medium">Əməliyyatlar: 0</p>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={zeroData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <YAxis domain={[0, 1.0]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#00b4d8" strokeWidth={5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-[20px] font-bold text-slate-900 mb-4">Əməliyyat Loqları</h2>
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">Əməliyyatlar 5</span>
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-cyan-100/70 rounded-[12px] text-base font-medium">
                <TrendingUp className="w-3 h-3 text-green-500" /> +20%
              </span>
            </div>
            <p className="text-base text-slate-900 font-medium">Əməliyyatlar: 0</p>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis domain={[0, 1.0]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#00e5ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {transferModalOpen && (
        <TransferModal onClose={() => setTransferModalOpen(false)} />
      )}
    </div>
  );
}