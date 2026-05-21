"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, ArrowUp } from "lucide-react";

interface BalansRecord {
    id: string;
    nomer: string;
    balans: string;
    tarix: string;
}

const mockData: BalansRecord[] = Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1),
    nomer: "1192980",
    balans: "0,88",
    tarix: "01.06.2026",
}));

export default function BalanceHistoryPageContent() {
    const [filterOpen, setFilterOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState("01.05.2026");
    const [dateTo, setDateTo] = useState("01.05.2026");

    return (
        <div className="bg-white rounded-xl border border-gray-200 py-4 px-4 sm:py-5 sm:px-7">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium bg-[#00BCD4] text-white hover:bg-[#00acc1] transition-colors"
                >
                    <Image src="/filter.svg" alt="Filtr" width={16} height={16} />
                    Filtr
                </button>

                <button className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg text-sm font-medium text-[#00BCD4] border border-[#00BCD4] hover:bg-[#00BCD4]/5 transition-colors">
                    <Download size={16} />
                    Yüklə
                </button>
            </div>

            {filterOpen && (
                <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                    <input
                        type="text"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border border-gray-200 bg-neutral-100 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] w-full sm:w-44 md:w-52"
                    />
                    <input
                        type="text"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border border-gray-200 bg-neutral-100 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] w-full sm:w-44 md:w-52"
                    />
                    <button className="bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto">
                        Tətbiq edin
                    </button>
                </div>
            )}

            <div className="mt-4 w-full overflow-x-auto rounded-lg">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-[#E0F7FA] text-[#7C7C7C]">
                            <th className="text-left px-3 sm:px-4 py-3 font-medium rounded-l-lg">
                                #
                            </th>
                            <th className="text-center px-3 sm:px-4 py-3 font-medium">
                                <button className="flex items-center gap-1 mx-auto hover:text-[#00BCD4] transition-colors whitespace-nowrap">
                                    Balans
                                    <ArrowUp size={16} />
                                </button>
                            </th>
                            <th className="text-right px-3 sm:px-4 py-3 font-medium rounded-r-lg">
                                <button className="flex items-center gap-1 ml-auto hover:text-[#00BCD4] transition-colors whitespace-nowrap">
                                    Tarix
                                    <ArrowUp size={16} />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockData.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-center py-12 text-gray-400">
                                    Məlumat tapılmadı
                                </td>
                            </tr>
                        ) : (
                            mockData.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors last:border-0"
                                >
                                    <td className="px-3 sm:px-4 py-3 text-[#7C7C7C]">
                                        {row.nomer}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 text-[#7C7C7C] text-center">
                                        {row.balans}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 text-[#7C7C7C] text-right whitespace-nowrap">
                                        {row.tarix}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}