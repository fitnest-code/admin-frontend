"use client";

import { useState } from "react";
import { Download, Search, ChevronDown, TrendingUp, Info } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";

const gelirData = [
  { ay: "Yanvar", value: 220 },
  { ay: "Fevral", value: 310 },
  { ay: "Fevral2", value: 400 },
  { ay: "Mart", value: 260 },
  { ay: "Mart2", value: 380 },
  { ay: "Aprel", value: 450 },
  { ay: "Aprel_peak", value: 500 },
  { ay: "Aprel2", value: 440 },
  { ay: "May_dip", value: 210 },
  { ay: "May", value: 380 },
  { ay: "May2", value: 440 },
  { ay: "İyun", value: 530 },
];

const istifadeciData = [
  { ay: "Jan", yeni: 2100, aktiv: 2600 },
  { ay: "Feb", yeni: 2400, aktiv: 2900 },
  { ay: "Mar", yeni: 3100, aktiv: 3700 },
  { ay: "Apr", yeni: 3000, aktiv: 3300 },
  { ay: "May", yeni: 4000, aktiv: 4800 },
  { ay: "Jun", yeni: 4500, aktiv: 3200 },
];

const girisData = Array.from({ length: 30 }, (_, i) => ({
  gun: i + 1,
  label: i === 0 ? "1 Yan" : i === 4 ? "5 Yan" : i === 9 ? "10 Yan" : i === 14 ? "15 Yan" : i === 19 ? "20 Yan" : i === 24 ? "25 Yan" : i === 29 ? "30 Yan" : "",
  value: Math.round(300 + (i * 9.5) + (Math.sin(i * 0.3) * 15)),
}));

function GelirTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    const displayLabel = label.includes("_") ? label.split("_")[0] : label;
    return (
      <div className="bg-[#00BCD4] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md text-center">
        <p>{displayLabel}</p>
        <p className="text-base">{payload[0].value}</p>
      </div>
    );
  }
  return null;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  period?: string;
}

function StatCard({ icon, title, value, change, period = "son 1 ay" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <span className="text-[#00BCD4]">{icon}</span>
        {title}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <TrendingUp size={12} className="text-[#00BCD4]" />
        <span className="text-[#00BCD4] font-medium">{change}</span>
        <span>/</span>
        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors">
          {period}
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  );
}

function Dropdown({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">
      {label}
      <ChevronDown size={14} className="text-gray-400" />
    </button>
  );
}

function GelirXTick({ x, y, payload }: any) {
  const showLabels: Record<string, string> = {
    Yanvar: "Yanvar",
    Mart: "Mart",
    Aprel: "Aprel",
    May: "May",
  };
  const text = showLabels[payload.value];
  if (!text) return null;
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#94a3b8" fontSize={11}>
      {text}
    </text>
  );
}

function GirisXTick({ x, y, payload }: any) {
  if (!payload.value) return null;
  return (
    <text x={x} y={y + 12} textAnchor="middle" fill="#94a3b8" fontSize={11}>
      {payload.value}
    </text>
  );
}

export default function TotalTab() {
  const [gelirDovr, setGelirDovr] = useState("Aylıq");
  const [istifadeciDovr, setIstifadeciDovr] = useState("Aylıq");
  const [girisDovr, setGirisDovr] = useState("Aylıq");

  return (
    <div className="space-y-5 pb-8">

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ID, Ad/Soyad , Email , Telefon üzrə axtarış....."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Dropdown label="Zallar" />
          <Dropdown label="Platformalar" />
          <Dropdown label="Paketlər" />
          <Dropdown label="Tarix aralığı" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Dropdown label="Tarix aralığı" />
        <button className="flex items-center gap-2 px-4 py-2 border border-[#00BCD4] rounded-lg text-sm font-medium text-[#00BCD4] hover:bg-[#00BCD4]/5 transition-colors">
          <Download size={15} />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>}
          title="Ümumi Gəlir"
          value="₼234,500"
          change="+ 4.2 %"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          title="Aktiv istifadəçi"
          value="32"
          change="+ 2"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>}
          title="Ümumi QR giriş"
          value="1000"
          change="+ 12 %"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:max-w-[calc(66.67%-0.5rem)]">
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
          title="Yeni Qeydiyyatlar"
          value="85"
          change="+ 1 %"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
          title="Aktiv Abunəliklər"
          value="85"
          change="+ 1 %"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">Gəlir Trendi</h3>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              {gelirDovr}
              <ChevronDown size={13} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Bronze
            </span>
            <span className="font-semibold text-gray-700">500 abunə</span>
            <span className="flex items-center gap-1 text-[#00BCD4]">
              <TrendingUp size={12} />
              +12% artım
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gelirData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gelirGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="ay"
                  tick={<GelirXTick />}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[100, 650]}
                  ticks={[100, 200, 300, 400, 500, 600]}
                />
                <Tooltip
                  content={<GelirTooltip />}
                  cursor={{ stroke: "#818cf8", strokeDasharray: "4 4", strokeWidth: 1 }}
                />
                <ReferenceLine x="Aprel" stroke="#818cf8" strokeDasharray="4 4" strokeWidth={1.5} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fill="url(#gelirGradient)"
                  dot={false}
                  activeDot={{ fill: "#818cf8", r: 5, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-900">İstifadəçi artımı</h3>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              {istifadeciDovr}
              <ChevronDown size={13} className="text-gray-400" />
            </button>
          </div>

          <p className="text-xs text-[#00BCD4] flex items-center gap-1 mb-1">
            <TrendingUp size={12} />
            +12% artım (keçən aya nisbətən)
          </p>
          <p className="text-[11px] text-gray-400 mb-3">Müştəri sayı</p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={istifadeciData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="ay" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(val: number, name: string) => [val.toLocaleString(), name === "yeni" ? "Yeni müştəri" : "Aktiv müştəri"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="yeni" fill="#67e8f9" radius={[4, 4, 0, 0]} name="Yeni müştəri" />
                <Bar dataKey="aktiv" fill="#0891b2" radius={[4, 4, 0, 0]} name="Aktiv müştəri" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#67e8f9] inline-block" />
              Yeni müştəri
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#0891b2] inline-block" />
              Aktiv müştəri
              <Info size={11} className="text-gray-400" />
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Giriş Sayı Trendi</h3>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            {girisDovr}
            <ChevronDown size={13} className="text-gray-400" />
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={girisData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="girisGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.30} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={<GirisXTick />}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 600]}
                ticks={[0, 150, 300, 450, 600]}
              />
              <Tooltip
                formatter={(val: number) => [val, "Giriş sayı"]}
                labelFormatter={(label) => label || ""}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#818cf8"
                strokeWidth={2.5}
                fill="url(#girisGradient)"
                dot={false}
                activeDot={{ fill: "#818cf8", r: 4, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}