"use client";

import { useState } from "react";
import { Search, ChevronDown, Download, TrendingUp, CheckCircle, XCircle, Percent } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const girisData = Array.from({ length: 30 }, (_, i) => ({
    gun: i + 1,
    label:
        i === 0 ? "1 Yan" :
            i === 4 ? "5 Yan" :
                i === 9 ? "10 Yan" :
                    i === 14 ? "15 Yan" :
                        i === 19 ? "20 Yan" :
                            i === 24 ? "25 Yan" :
                                i === 29 ? "30 Yan" : "",
    value: Math.round(300 + i * 9.5 + Math.sin(i * 0.3) * 8),
}));

const rows = [
    { tarix: "01.05.2026", zal: "FIT CLUB - Nərimanov", giris: 285, ugursuz: 12, platform: null },
    { tarix: "30.04.2026", zal: "FIT CLUB - Nərimanov", giris: 285, ugursuz: 15, platform: "Aktiv" },
    { tarix: "29.04.2026", zal: "FIT CLUB - Nərimanov", giris: 285, ugursuz: 18, platform: "Aktiv" },
    { tarix: "01.05.2026", zal: "FIT CLUB - Nərimanov", giris: 285, ugursuz: 12, platform: "Aktiv" },
];

function Dropdown({ label }: { label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">
            {label}
            <ChevronDown size={14} className="text-gray-400" />
        </button>
    );
}

function Pagination({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center justify-center gap-1 py-4">
            {[1, 2, 3, 4].map((p) => (
                <button
                    key={p}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === current ? "bg-[#00BCD4] text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    {p}
                </button>
            ))}
            <span className="px-1 text-gray-400 text-sm">···</span>
            <button className="w-9 h-9 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                {total}
            </button>
        </div>
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

export default function QRInputTabContent() {
    const [search, setSearch] = useState("");
    const [tableSearch, setTableSearch] = useState("");
    const [dovr, setDovr] = useState("Aylıq");

    const filtered = rows.filter(
        (r) =>
            r.zal.toLowerCase().includes(tableSearch.toLowerCase()) ||
            r.tarix.includes(tableSearch)
    );

    return (
        <div className="space-y-5 pb-8">

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ID, Ad/Soyad , Email , Telefon üzrə axtarış....."
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-white"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Dropdown label="Zallar" />
                    <Dropdown label="Platformalar" />
                    <Dropdown label="Paketlər" />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Dropdown label="Tarix aralığı" />
                <button className="flex items-center gap-2 px-4 py-2 border border-[#00BCD4] rounded-lg text-sm font-medium text-[#00BCD4] hover:bg-[#00BCD4]/5 transition-colors">
                    <Download size={15} />
                    Export
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <CheckCircle size={18} className="text-green-500" />
                        <span className="font-medium">Uğurlu girişlər</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">666</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 12.3 %</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <XCircle size={18} className="text-red-500" />
                        <span className="font-medium">Uğursuz girişlər</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">65</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 12 %</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-400 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-gray-500">%</span>
                        </div>
                        <span className="font-medium">Uğur faizi</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">24%</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 2</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">Giriş Sayı</h3>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                        {dovr}
                        <ChevronDown size={13} className="text-gray-400" />
                    </button>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={girisData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="qrGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.04} />
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
                                fill="url(#qrGradient)"
                                dot={false}
                                activeDot={{ fill: "#818cf8", r: 4, stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <div className="relative mb-4">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        placeholder="Müştəri adı"
                        className="w-full sm:max-w-sm pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-white"
                    />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E0F7FA] text-gray-700">
                                    <th className="text-left px-5 py-4 font-semibold rounded-tl-xl">Tarix</th>
                                    <th className="text-left px-5 py-4 font-semibold">Zal</th>
                                    <th className="text-left px-5 py-4 font-semibold">Giriş</th>
                                    <th className="text-left px-5 py-4 font-semibold">Uğursuz</th>
                                    <th className="text-left px-5 py-4 font-semibold rounded-tr-xl">Platform</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400">
                                            Məlumat tapılmadı
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((r, i) => (
                                        <tr
                                            key={i}
                                            className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                                        >
                                            <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{r.tarix}</td>
                                            <td className="px-5 py-4 text-gray-700">{r.zal}</td>
                                            <td className="px-5 py-4 text-[#00BCD4] font-medium">{r.giris}</td>
                                            <td className="px-5 py-4 text-red-500 font-medium">{r.ugursuz}</td>
                                            <td className="px-5 py-4">
                                                {r.platform ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                                                        {r.platform}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">.///</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-gray-100">
                        <Pagination current={1} total={34} />
                    </div>
                </div>
            </div>

        </div>
    );
}