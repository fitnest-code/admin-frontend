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
} from "recharts";

const zallar = [
    { ad: "FIT CLUB - Nərimanov", gelir: 87500, giris: 4850, musteri: 620 },
    { ad: "FIT CLUB - 28 May", gelir: 76200, giris: 4120, musteri: 545 },
    { ad: "FIT CLUB - Nizami", gelir: 71000, giris: 3890, musteri: 498 },
    { ad: "FIT CLUB - Xətai", gelir: 45800, giris: 2590, musteri: 312 },
];

const chartData = zallar.map((z) => ({
    name: z.ad.replace("FIT CLUB - ", ""),
    gelir: z.gelir,
    girisler: z.giris,
}));

function StatCard({
    icon,
    title,
    value,
    change,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    change: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs flex-1 min-w-0">
            <div className="flex items-center gap-2 text-gray-500 text-sm whitespace-nowrap">
                <span className="text-[#00BCD4] shrink-0">{icon}</span>
                <span className="truncate">{title}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp size={12} className="text-[#00BCD4]" />
                <span className="text-[#00BCD4] font-medium">{change}</span>
                <span>/</span>
                <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors whitespace-nowrap">
                    son 1 ay
                    <ChevronDown size={12} />
                </button>
            </div>
        </div>
    );
}

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
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === current
                            ? "bg-[#00BCD4] text-white"
                            : "text-gray-600 hover:bg-gray-100"
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

export default function HallInformationTab() {
    const [search, setSearch] = useState("");
    const [zalSearch, setZalSearch] = useState("");

    const filtered = zallar.filter((z) =>
        z.ad.toLowerCase().includes(zalSearch.toLowerCase())
    );

    const en_yaxsi = [...zallar].sort((a, b) => b.gelir - a.gelir)[0];
    const diqqet = [...zallar].sort((a, b) => a.gelir - b.gelir)[0];

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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    }
                    title="Zal üzrə ümumi gəlir"
                    value="₼234,500"
                    change="+ 4.2 %"
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M9 21V9" />
                        </svg>
                    }
                    title="QR giriş sayı"
                    value="1000"
                    change="+ 12 %"
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    }
                    title="Unikal müştəri sayı"
                    value="32"
                    change="+ 2"
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    }
                    title="Ortalama gündəlik giriş"
                    value="32"
                    change="+ 2"
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <h3 className="text-base font-bold text-gray-900 mb-5">Zallar üzrə müqayisə</h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                            barSize={80}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "#94a3b8", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => v.toLocaleString()}
                                domain={[0, 100000]}
                                ticks={[0, 25000, 50000, 75000, 100000]}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: "#94a3b8", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 6000]}
                                ticks={[0, 1500, 3000, 4500, 6000]}
                            />
                            <Tooltip
                                formatter={(val: number, name: string) => [
                                    name === "gelir" ? `₼${val.toLocaleString()}` : val.toLocaleString(),
                                    name === "gelir" ? "Gəlir" : "Girişlər",
                                ]}
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                            />
                            <Bar yAxisId="left" dataKey="gelir" fill="#00BCD4" radius={[6, 6, 0, 0]} name="gelir" />
                            <Bar yAxisId="right" dataKey="girisler" fill="#26C6DA" radius={[6, 6, 0, 0]} name="girisler" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-[#00BCD4] inline-block" />
                        gəlir
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-[#26C6DA] inline-block" />
                        girişlər
                    </span>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Zallar</h2>

                <div className="relative mb-4">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={zalSearch}
                        onChange={(e) => setZalSearch(e.target.value)}
                        placeholder="Zal adı, Şəhər, Ünvan axtar......"
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-white"
                    />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#E0F7FA] text-gray-700">
                                    <th className="text-left px-5 py-4 font-medium rounded-tl-xl">Zal adı</th>
                                    <th className="text-left px-5 py-4 font-medium">Gəlir</th>
                                    <th className="text-left px-5 py-4 font-medium">Giriş sayı</th>
                                    <th className="text-left px-5 py-4 font-medium rounded-tr-xl">Müştəri sayı</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((z, i) => (
                                    <tr
                                        key={z.ad}
                                        className={`border-t border-gray-100 hover:bg-gray-50/60 transition-colors ${i === filtered.length - 1 ? "last:border-b-0" : ""
                                            }`}
                                    >
                                        <td className="px-5 py-4 text-gray-800">{z.ad}</td>
                                        <td className="px-5 py-4 text-[#00BCD4] font-medium">
                                            ₼{z.gelir.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">
                                            {z.giris.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">{z.musteri}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-100">
                        <Pagination current={1} total={34} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-green-500">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="8" r="6" />
                                    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                                </svg>
                            </span>
                            <span className="font-semibold text-gray-900">Ən yaxşı zallar</span>
                        </div>
                        <div className="bg-green-50 rounded-lg px-4 py-3">
                            <p className="font-semibold text-gray-900 text-sm">{en_yaxsi.ad}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Gəlir: ₼{en_yaxsi.gelir.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-amber-500">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </span>
                            <span className="font-semibold text-gray-900">Diqqət tələb edən zallar</span>
                        </div>
                        <div className="bg-orange-50 rounded-lg px-4 py-3">
                            <p className="font-semibold text-gray-900 text-sm">{diqqet.ad}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Gəlir: ₼{diqqet.gelir.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}