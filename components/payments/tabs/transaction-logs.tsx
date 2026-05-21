"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Download,
    ChevronDown,
    ChevronUp,
    ArrowUp,
} from "lucide-react";
import Image from "next/image";

type StatusType = "Təsdiqlənib" | "Bilinməyən bank xətası" | "Linkin müddəti bitib" | "Timeout error";

interface Transaction {
    id: string;
    emeliyyat: string;
    status: StatusType;
    tesvir: string;
    istifadeci: string;
    kart: string;
    mebleg: string;
    tarix: string;
    detay: {
        rrn: string;
        tarix: string;
        komissiya: string;
        emeliyyatKomissiyasi: string;
        kartNomresi: string;
        kartMebleg: string;
        odenisQebzi: boolean;
        yerineYetirdi: string;
        operator: string;
        odenisMenubeyi: string;
    };
}

const mockTransactions: Transaction[] = [
    {
        id: "1",
        emeliyyat: "Kartın qeydiyyatı və ödənişi",
        status: "Bilinməyən bank xətası",
        tesvir: "Fitnest MMC: Fitness package monthly payment",
        istifadeci: "İstifadəçi tapılmadı",
        kart: "******3830",
        mebleg: "3 AZN",
        tarix: "01.01.2026 21:05:01",
        detay: {
            rrn: "424353Y63677",
            tarix: "12.05.2026  14:41",
            komissiya: "₼ 0.00",
            emeliyyatKomissiyasi: "₼ 0.00",
            kartNomresi: "**** **** **** 4127",
            kartMebleg: "₼ 0.00",
            odenisQebzi: true,
            yerineYetirdi: "API",
            operator: "-//-",
            odenisMenubeyi: "-//-",
        },
    },
    {
        id: "2",
        emeliyyat: "İstifadəçi ödənişi",
        status: "Təsdiqlənib",
        tesvir: "Fitnest MMC: Fitness package monthly payment",
        istifadeci: "Fitnest MMC",
        kart: "******3830",
        mebleg: "3 AZN",
        tarix: "01.01.2026 21:05:01",
        detay: {
            rrn: "524353Y74788",
            tarix: "12.05.2026  15:20",
            komissiya: "₼ 0.00",
            emeliyyatKomissiyasi: "₼ 0.00",
            kartNomresi: "**** **** **** 3830",
            kartMebleg: "₼ 0.00",
            odenisQebzi: true,
            yerineYetirdi: "API",
            operator: "-//-",
            odenisMenubeyi: "-//-",
        },
    },
    {
        id: "3",
        emeliyyat: "İstifadəçi ödənişi",
        status: "Təsdiqlənib",
        tesvir: "Fitnest MMC: Fitness package monthly payment",
        istifadeci: "Fitnest MMC",
        kart: "******3830",
        mebleg: "3 AZN",
        tarix: "01.01.2026 21:05:01",
        detay: {
            rrn: "624353Y85899",
            tarix: "12.05.2026  16:00",
            komissiya: "₼ 0.00",
            emeliyyatKomissiyasi: "₼ 0.00",
            kartNomresi: "**** **** **** 3830",
            kartMebleg: "₼ 0.00",
            odenisQebzi: true,
            yerineYetirdi: "API",
            operator: "-//-",
            odenisMenubeyi: "-//-",
        },
    },
    {
        id: "4",
        emeliyyat: "Kartın qeydiyyatı və ödənişi",
        status: "Linkin müddəti bitib",
        tesvir: "Fitnest MMC: Fitness package monthly payment",
        istifadeci: "İstifadəçi tapılmadı",
        kart: "******3830",
        mebleg: "3 AZN",
        tarix: "01.01.2026 21:05:01",
        detay: {
            rrn: "724353Y96900",
            tarix: "12.05.2026  17:10",
            komissiya: "₼ 0.00",
            emeliyyatKomissiyasi: "₼ 0.00",
            kartNomresi: "**** **** **** 3830",
            kartMebleg: "₼ 0.00",
            odenisQebzi: false,
            yerineYetirdi: "API",
            operator: "-//-",
            odenisMenubeyi: "-//-",
        },
    },
    {
        id: "5",
        emeliyyat: "Kartın qeydiyyatı və ödənişi",
        status: "Timeout error",
        tesvir: "Fitnest MMC: Fitness package monthly payment",
        istifadeci: "İstifadəçi tapılmadı",
        kart: "******3830",
        mebleg: "3 AZN",
        tarix: "01.01.2026 21:05:01",
        detay: {
            rrn: "824353Y07011",
            tarix: "12.05.2026  18:30",
            komissiya: "₼ 0.00",
            emeliyyatKomissiyasi: "₼ 0.00",
            kartNomresi: "**** **** **** 3830",
            kartMebleg: "₼ 0.00",
            odenisQebzi: false,
            yerineYetirdi: "API",
            operator: "-//-",
            odenisMenubeyi: "-//-",
        },
    },
    {
        id: "6",
        emeliyyat: "İstifadəçi ödənişi",
        status: "Təsdiqlənib",
        tesvir: "Fitnest MMC: Fitness package monthly payment",
        istifadeci: "Fitnest MMC",
        kart: "******3830",
        mebleg: "3 AZN",
        tarix: "01.01.2026 21:05:01",
        detay: {
            rrn: "924353Y18122",
            tarix: "12.05.2026  19:45",
            komissiya: "₼ 0.00",
            emeliyyatKomissiyasi: "₼ 0.00",
            kartNomresi: "**** **** **** 3830",
            kartMebleg: "₼ 0.00",
            odenisQebzi: true,
            yerineYetirdi: "API",
            operator: "-//-",
            odenisMenubeyi: "-//-",
        },
    },
];

function StatusBadge({ status }: { status: StatusType }) {
    const styles: Record<StatusType, string> = {
        "Təsdiqlənib": "bg-[#4CAF50] text-white",
        "Bilinməyən bank xətası": "bg-[#F44336] text-white",
        "Linkin müddəti bitib": "bg-[#FF7043] text-white",
        "Timeout error": "bg-[#EF5350] text-white",
    };

    return (
        <span
            className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                styles[status] ?? "bg-gray-100 text-gray-600"
            )}
        >
            {status}
        </span>
    );
}

function FilterPanel() {
    return (
        <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                    type="text"
                    placeholder="Axtarış"
                    className="border border-gray-200 rounded-lg bg-neutral-100 px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4]"
                />
                <input
                    type="text"
                    defaultValue="01.05.2026"
                    className="border border-gray-200 rounded-lg bg-neutral-100 px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4]"
                />
                <input
                    type="text"
                    defaultValue="01.05.2026"
                    className="border border-gray-200 rounded-lg bg-neutral-100 px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4]"
                />
                <div className="relative">
                    <select className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
                        <option value="">Növü seçin</option>
                        <option value="istifadeci">İstifadəçi ödənişi</option>
                        <option value="kart">Ödəniş kartının hesaba bağlanması</option>
                        <option value="kart">Əməliyyatın ləğvi</option>
                        <option value="kart">Kartın silinməsi</option>
                        <option value="kart">Abunə</option>
                        <option value="kart">Saxlanmış kartla ödəniş</option>
                        <option value="kart">Vəsaitin ödənilməsi</option>
                        <option value="kart">Kartın qeydiyyatı və ödənişi</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="relative">
                    <select className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
                        <option value="">Status seçin</option>
                        <option value="success">Təsdiq edildi</option>
                        <option value="bank_error">İmtina edildi</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
                        <option value="">Növü seçin</option>
                        <option value="google_pay">Birbaşa ödəniş</option>
                        <option value="visa">Google / Apple Pay</option>
                        <option value="visa">Click to Pay</option>
                        <option value="visa">Taksit</option>
                        <option value="visa">Cüzdan</option>
                        <option value="visa">Pre - avtorizasiya</option>
                        <option value="visa">Birpos</option>
                        <option value="visa">Kreditlər</option>
                        <option value="visa">Abunəlik</option>

                    </select>
                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
                        <option value="all">Hamısı</option>
                        <option value="income">Biznes səhifə</option>
                        <option value="outcome">API qoşulma</option>
                        <option value="outcome">Geri qaytarma</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
                        <option value="">Ödəniş mənbəyini seçin</option>
                        <option value="api">Biznes səhifə</option>
                        <option value="api">Lending səhifə</option>
                        <option value="api">Otel</option>
                        <option value="api">Link ilə ödəniş</option>
                        <option value="api">Əmlak</option>
                        <option value="api">Parqour</option>
                        <option value="api">Parqour Cash</option>
                        <option value="api">Parqour No Cash</option>
                        <option value="api">Birpos</option>
                        <option value="api">Kreditlər</option>
                        <option value="api">Abunəlik</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="flex justify-end">
                <button className="bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
                    Tətbiq edin
                </button>
            </div>
        </div>
    );
}

function TransactionDetail({ tx }: { tx: Transaction }) {
    return (
        <tr>
            <td colSpan={8} className="bg-white px-4 pb-5 pt-3">
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 py-2">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">RRN</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.rrn}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Tarix</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.tarix}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Komissiya</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.komissiya}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Əməliyyat komissiyası</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.emeliyyatKomissiyasi}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">{tx.detay.kartNomresi}</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.kartMebleg}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Ödəniş qəbzi</p>
                        {tx.detay.odenisQebzi ? (
                            <button className="flex items-center gap-1 text-sm font-medium text-[#00BCD4] hover:text-[#00acc1] transition-colors">
                                <Download size={14} />
                                Yüklə
                            </button>
                        ) : (
                            <p className="text-sm text-gray-400">-//-</p>
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Yerinə yetirdi</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.yerineYetirdi}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Operator</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.operator}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Ödəniş mənbəyi</p>
                        <p className="text-sm font-medium text-gray-900">{tx.detay.odenisMenubeyi}</p>
                    </div>
                </div>
            </td>
        </tr>
    );
}

export default function TransactionLogsTabContent() {
    const [filterOpen, setFilterOpen] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const columns = [
        { label: "Əməliyyat", sortable: true },
        { label: "Status", sortable: false },
        { label: "Təsvir", sortable: false },
        { label: "İstifadəçi", sortable: false },
        { label: "Kart", sortable: false },
        { label: "Məbləğ", sortable: true },
        { label: "Tarix", sortable: true },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 py-5 px-7">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#00BCD4] text-white hover:bg-[#00acc1] transition-colors"
                >
                    <Image src="/filter.svg" alt="Filtr" width={16} height={16} />
                    Filtr
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#00BCD4] border border-[#00BCD4] hover:bg-[#00BCD4]/5 transition-colors">
                    <Download size={16} />
                    Yüklə
                </button>
            </div>

            {filterOpen && <FilterPanel />}

            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#E0F7FA] text-[#7C7C7C]">
                            {columns.map((col) => (
                                <th
                                    key={col.label}
                                    className="text-left px-3 py-3 font-medium first:rounded-l-lg last:rounded-r-lg whitespace-nowrap"
                                >
                                    {col.sortable ? (
                                        <button className="flex items-center gap-1 hover:text-[#00BCD4] transition-colors">
                                            {col.label}
                                            <ArrowUp size={18} />
                                        </button>
                                    ) : (
                                        col.label
                                    )}
                                </th>
                            ))}
                            <th className="w-8 rounded-r-lg" />
                        </tr>
                    </thead>
                    <tbody>
                        {mockTransactions.map((tx) => (
                            <>
                                <tr
                                    key={tx.id}
                                    onClick={() =>
                                        setExpandedRow(expandedRow === tx.id ? null : tx.id)
                                    }
                                    className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors group"
                                >
                                    <td className="px-3 py-3 text-[#7C7C7C] max-w-35">
                                        <span className="text-xs leading-snug">{tx.emeliyyat}</span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <StatusBadge status={tx.status} />
                                    </td>
                                    <td className="px-3 py-3 text-[#7C7C7C] max-w-45">
                                        <span className="text-xs leading-snug line-clamp-2">{tx.tesvir}</span>
                                    </td>
                                    <td className="px-3 py-3 text-[#7C7C7C] whitespace-nowrap text-xs">
                                        {tx.istifadeci}
                                    </td>
                                    <td className="px-3 py-3 text-[#7C7C7C] text-xs">{tx.kart}</td>
                                    <td className="px-3 py-3 text-[#7C7C7C] font-medium whitespace-nowrap text-xs">
                                        {tx.mebleg}
                                    </td>
                                    <td className="px-3 py-3 text-[#7C7C7C] whitespace-nowrap text-xs">
                                        {tx.tarix}
                                    </td>
                                    <td className="px-3 py-3 text-gray-400 group-hover:text-gray-600 transition-colors">
                                        {expandedRow === tx.id ? (
                                            <ChevronUp size={16} />
                                        ) : (
                                            <ChevronDown size={16} />
                                        )}
                                    </td>
                                </tr>
                                {expandedRow === tx.id && (
                                    <TransactionDetail key={`detail-${tx.id}`} tx={tx} />
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}