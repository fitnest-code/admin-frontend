"use client";

import { useState } from "react";
import { Search, ChevronDown, Download, TrendingUp } from "lucide-react";

const musteriler = [
    { ad: "Aysel Məmmədova", giris: 28, abunulik: "Platinium - 1 Ay", sonAktivlik: "01.05.2026" },
    { ad: "Rəşad Əliyev", giris: 28, abunulik: "Gold - 3 Ay", sonAktivlik: "01.05.2026" },
    { ad: "Nigar Həsənova", giris: 28, abunulik: "Silver - 6 Ay", sonAktivlik: "01.05.2026" },
    { ad: "Elvin Quliyev", giris: 23, abunulik: "Bronze - 12 Ay", sonAktivlik: "01.05.2026" },
];

function StatCard({
    icon,
    title,
    value,
    change,
    period = "son 1 ay",
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    change: string;
    period?: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs flex-1 min-w-0">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span className="text-[#00BCD4] shrink-0">{icon}</span>
                <span className="truncate font-medium">{title}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp size={12} className="text-[#00BCD4]" />
                <span className="text-[#00BCD4] font-medium">{change}</span>
                <span>/</span>
                <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors whitespace-nowrap">
                    {period}
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

export default function CustomersTabContent() {
    const [search, setSearch] = useState("");
    const [tableSearch, setTableSearch] = useState("");

    const filtered = musteriler.filter((m) =>
        m.ad.toLowerCase().includes(tableSearch.toLowerCase())
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    }
                    title="Aktiv istifadəçilər"
                    value="2380"
                    change="+ 4.2 %"
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
                    title="Yeni istifadəçilər"
                    value="1000"
                    change="+ 12 %"
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    }
                    title="Retention"
                    value="82%"
                    change="+ 2"
                    period="son 7 gün"
                />
                <StatCard
                    icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    }
                    title="Orta istifadə tezliyi"
                    value="32"
                    change="+ 2"
                />
            </div>

            <div className="relative">
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
                                <th className="text-left px-5 py-4 font-medium rounded-tl-xl">Müştəri</th>
                                <th className="text-left px-5 py-4 font-medium">Giriş sayı</th>
                                <th className="text-left px-5 py-4 font-medium">Abunəlik</th>
                                <th className="text-left px-5 py-4 font-medium rounded-tr-xl">Son aktivlik</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-400">
                                        Məlumat tapılmadı
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m, i) => (
                                    <tr
                                        key={m.ad}
                                        className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                                    >
                                        <td className="px-5 py-4 text-gray-800 font-medium">{m.ad}</td>
                                        <td className="px-5 py-4 text-[#00BCD4] font-medium">{m.giris}</td>
                                        <td className="px-5 py-4 text-gray-600">{m.abunulik}</td>
                                        <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{m.sonAktivlik}</td>
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
    );
}