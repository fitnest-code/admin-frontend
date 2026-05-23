"use client";

import { useState } from "react";
import { Search, ChevronDown, Download, TrendingUp, TrendingDown, FileText, CheckCheck, XCircle, UserX } from "lucide-react";

const rows = [
    { zal: "FIT CLUB - Nərimanov", cls: "Class", rezervasiya: "Rezervasiya", legv: "Ləğv" },
    { zal: "FIT CLUB - 28 May", cls: "Class", rezervasiya: "Rezervasiya", legv: "Ləğv" },
    { zal: "FIT CLUB - Nizami", cls: "Class", rezervasiya: "Rezervasiya", legv: "Ləğv" },
    { zal: "FIT CLUB - Xətai", cls: "Class", rezervasiya: "Rezervasiya", legv: "Ləğv" },
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

export default function ReservationTabContent() {
    const [search, setSearch] = useState("");
    const [tableSearch, setTableSearch] = useState("");

    const filtered = rows.filter((r) =>
        r.zal.toLowerCase().includes(tableSearch.toLowerCase())
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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FileText size={18} className="text-gray-400 shrink-0" />
                        <span className="font-medium truncate">Ümumi rezervasiya</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">772</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 4.2 %</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors whitespace-nowrap">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <CheckCheck size={18} className="text-green-500 shrink-0" />
                        <span className="font-medium text-green-500 truncate">Təsdiqlənmiş</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">675</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 12 %</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors whitespace-nowrap">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <XCircle size={18} className="text-red-500 shrink-0" />
                        <span className="font-medium text-red-500 truncate">Ləğv edilən</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">68</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingDown size={12} className="text-red-400" />
                        <span className="text-red-400 font-medium">− 12 %</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors whitespace-nowrap">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-xs">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <UserX size={18} className="text-gray-400 shrink-0" />
                        <span className="font-medium truncate">Gəlməyən</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">29</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} className="text-[#00BCD4]" />
                        <span className="text-[#00BCD4] font-medium">+ 3.8% dərəcə</span>
                        <span>/</span>
                        <button className="flex items-center gap-0.5 hover:text-gray-700 transition-colors whitespace-nowrap">
                            son 1 ay <ChevronDown size={12} />
                        </button>
                    </div>
                </div>
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
                                <th className="text-left px-5 py-4 font-semibold rounded-tl-xl">Zal</th>
                                <th className="text-left px-5 py-4 font-semibold">Class</th>
                                <th className="text-left px-5 py-4 font-semibold">Rezervasiya</th>
                                <th className="text-left px-5 py-4 font-semibold rounded-tr-xl">Ləğv</th>
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
                                filtered.map((r, i) => (
                                    <tr
                                        key={i}
                                        className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                                    >
                                        <td className="px-5 py-4 text-gray-800">{r.zal}</td>
                                        <td className="px-5 py-4 text-gray-600">{r.cls}</td>
                                        <td className="px-5 py-4 text-gray-600">{r.rezervasiya}</td>
                                        <td className="px-5 py-4 text-gray-600">{r.legv}</td>
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