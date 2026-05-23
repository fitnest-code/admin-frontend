"use client";

import { useState } from "react";
import { Search, ChevronDown, Download, TrendingUp } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const pieData = [
    { name: "Gold", value: 35, color: "#FBBF24" },
    { name: "Bronze", value: 22, color: "#B45309" },
    { name: "Silver", value: 28, color: "#D1D5DB" },
    { name: "Platinum", value: 15, color: "#E5E7EB" },
];

const barData = [
    { name: "Bronze", gelir: 18000 },
    { name: "Silver", gelir: 46000 },
    { name: "Gold", gelir: 92000 },
    { name: "Platinum", gelir: 67000 },
];

const paketler = [
    { ad: "1 Aylıq", satis: 286, gelir: 71500 },
    { ad: "3 Aylıq", satis: 245, gelir: 98000 },
    { ad: "6 Aylıq", satis: 98, gelir: 58800 },
    { ad: "12 Aylıq", satis: 37, gelir: 29900 },
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

function PieLabel({ cx, cy, midAngle, outerRadius, name, value }: any) {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 36;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            fill="#6B7280"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            fontSize={12}
        >
            {name}: {value}%
        </text>
    );
}

export default function SubscriptionsServicesTabContent() {
    const [search, setSearch] = useState("");
    const [tableSearch, setTableSearch] = useState("");
    const [barDovr, setBarDovr] = useState("Aylıq");

    const filtered = paketler.filter((p) =>
        p.ad.toLowerCase().includes(tableSearch.toLowerCase())
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
                        <span className="text-[#00BCD4]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                            </svg>
                        </span>
                        Ümumi satış
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
                        <span className="text-[#00BCD4]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </span>
                        Paketlər üzrə satış
                    </div>
                    <p className="text-2xl font-bold text-gray-900">4 Paket</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 12 %</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">Bronze, Silver, Gold, Platinum</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="text-[#00BCD4]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                            </svg>
                        </span>
                        Ortalama istifadəçi gəliri
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₼347</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 2</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">ARPU</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Paket üzrə gəlir</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="40%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    labelLine={true}
                                    label={<PieLabel />}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} stroke="white" strokeWidth={2} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-bold text-gray-900">Plan üzrə gəlir</h3>
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                            {barDovr}
                            <ChevronDown size={13} className="text-gray-400" />
                        </button>
                    </div>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => v.toLocaleString()}
                                    domain={[0, 100000]}
                                    ticks={[0, 25000, 50000, 75000, 100000]}
                                />
                                <Tooltip
                                    formatter={(val: number) => [`₼${val.toLocaleString()}`, "Gəlir"]}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                />
                                <Bar dataKey="gelir" fill="#00BCD4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Zallar</h2>

                <div className="relative mb-4">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        placeholder="Zal adı, Şəhər, Ünvan axtar......"
                        className="w-full sm:max-w-sm pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-white"
                    />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E0F7FA] text-gray-700">
                                    <th className="text-left px-5 py-4 font-medium rounded-tl-xl">Paket</th>
                                    <th className="text-left px-5 py-4 font-medium">Satış sayı</th>
                                    <th className="text-left px-5 py-4 font-medium rounded-tr-xl">Gəlir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-gray-400">
                                            Məlumat tapılmadı
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((p) => (
                                        <tr
                                            key={p.ad}
                                            className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                                        >
                                            <td className="px-5 py-4 text-gray-800">{p.ad}</td>
                                            <td className="px-5 py-4 text-gray-600">{p.satis.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-[#00BCD4] font-medium">
                                                ₼{p.gelir.toLocaleString()}
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