"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, ArrowUp } from "lucide-react";

interface Transfer {
  id: string;
  ad: string;
  kateqoriya: string;
  tesvir: string;
  rrn: string;
  tarix: string;
  mebleg: string;
  yerineYetirdi: string;
  cemi: string;
  odenisQebzi: boolean;
}

const mockTransfers: Transfer[] = [];

export default function HistoryOfMigrationsTabContent() {
  const [filterOpen, setFilterOpen] = useState(false);

  const columns: { label: string; sortable: boolean }[] = [
    { label: "Ad", sortable: false },
    { label: "Kateqoriya", sortable: false },
    { label: "Təsvir", sortable: false },
    { label: "RRN", sortable: false },
    { label: "Tarix", sortable: true },
    { label: "Məbləğ", sortable: true },
    { label: "Yerinə yetirdi", sortable: true },
    { label: "Cəmi", sortable: true },
    { label: "Ödəniş qəbzi", sortable: false },
  ];

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
            placeholder="Axtarış"
            className="border border-gray-200 rounded-lg px-3 py-2.5 bg-neutral-100 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] w-full sm:w-50 md:w-70"
          />
          <input
            type="text"
            defaultValue="01.05.2026"
            className="border border-gray-200 rounded-lg px-3 py-2.5 bg-neutral-100 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] w-full sm:w-50 md:w-70"
          />
          <input
            type="text"
            defaultValue="01.05.2026"
            className="border border-gray-200 rounded-lg px-3 py-2.5 bg-neutral-100 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] w-full sm:w-50 md:w-70"
          />
          <button className="bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-8 py-2.5 rounded-lg transition-colors w-full sm:w-auto">
            Tətbiq edin
          </button>
        </div>
      )}

      <div className="mt-4 w-full overflow-x-auto rounded-lg">
        <table className="min-w-max w-full text-sm">
          <thead>
            <tr className="bg-[#E0F7FA] text-[#7C7C7C]">
              {columns.map((col, i) => (
                <th
                  key={col.label}
                  className={`text-left px-3 py-3 text-base font-medium whitespace-nowrap ${
                    i === 0 ? "rounded-l-lg" : ""
                  } ${i === columns.length - 1 ? "rounded-r-lg" : ""}`}
                >
                  {col.sortable ? (
                    <button className="flex items-center gap-1 hover:text-[#00BCD4] transition-colors">
                      {col.label}
                      <ArrowUp size={16} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockTransfers.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-400 text-base"
                >
                  Seçilmiş dövr üçün heç bir məlumat tapılmadı.
                </td>
              </tr>
            ) : (
              mockTransfers.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-0"
                >
                  <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{t.ad}</td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{t.kateqoriya}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs max-w-40">
                    <span className="line-clamp-2">{t.tesvir}</span>
                  </td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{t.rrn}</td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{t.tarix}</td>
                  <td className="px-3 py-3 text-gray-800 font-medium whitespace-nowrap">{t.mebleg}</td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{t.yerineYetirdi}</td>
                  <td className="px-3 py-3 text-gray-800 font-medium whitespace-nowrap">{t.cemi}</td>
                  <td className="px-3 py-3">
                    {t.odenisQebzi ? (
                      <button className="flex items-center gap-1 text-sm font-medium text-[#00BCD4] hover:text-[#00acc1] transition-colors whitespace-nowrap">
                        <Download size={14} />
                        Yüklə
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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