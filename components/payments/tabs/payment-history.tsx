"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Download, ChevronDown, ChevronUp, X, ArrowUp } from "lucide-react";

interface Payment {
  id: string;
  kartSahibi: string;
  odenisNovu: string;
  odenisUsulu: string;
  tesvir: string;
  siferishNomresi: string;
  abunulik: string;
  rrn: string;
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

const mockPayments: Payment[] = [
  {
    id: "1",
    kartSahibi: "Fitnest MMC",
    odenisNovu: "Google Pay",
    odenisUsulu: "API qoşulma",
    tesvir: "Abunəlik: Bronze (1ay)",
    siferishNomresi: "b54435-b53535-f54336-26363",
    abunulik: "Bronze (1ay)",
    rrn: "613210082382",
    mebleg: "3 AZN",
    tarix: "01.01.2026",
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
  }
];

function ExportModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Məlumat arxivini ixrac etmək istəyirsiniz?
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          Hesabat hazırlandıqdan sonra Hesabatlarım səhifəsindən yükləyə bilərsiniz
        </p>
        <button
          onClick={onClose}
          className="bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          İxrac et
        </button>
      </div>
    </div>
  );
}

function FilterPanel() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      <input
        type="text"
        placeholder="Axtarış"
        className="border border-gray-200 bg-neutral-100 rounded-[12px] px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4]"
      />
      <input
        type="text"
        defaultValue="01.05.2026"
        className="border border-gray-200 bg-neutral-100 rounded-[12px] px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4]"
      />
      <input
        type="text"
        defaultValue="01.05.2026"
        className="border border-gray-200 bg-neutral-100 rounded-[12px] px-3 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4]"
      />
      <div className="relative">
        <select className="w-full appearance-none border border-gray-200 rounded-[12px] px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
          <option value="">Növü seçin</option>
          <option value="google_pay">Google Pay</option>
          <option value="visa">Visa</option>
          <option value="mastercard">Mastercard</option>
        </select>
        <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select className="w-full appearance-none border border-gray-200 rounded-[12px] px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
          <option value="all">Hamısı</option>
          <option value="income">Daxil olan</option>
          <option value="outcome">Çıxan</option>
        </select>
        <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      <div className="relative">
        <select className="w-full appearance-none border border-gray-200 rounded-[12px] px-3 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/30 focus:border-[#00BCD4] bg-neutral-100 pr-8">
          <option value="">Ödəniş mənbəyini seçin</option>
          <option value="api">API</option>
          <option value="pos">POS terminal</option>
        </select>
        <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      <div />
      <button className="bg-[#00BCD4] hover:bg-[#00acc1] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
        Tətbiq edin
      </button>
    </div>
  );
}

function TransactionDetail({ payment }: { payment: Payment }) {
  return (
    <tr>
      <td colSpan={8} className="bg-white px-4 pb-4 pt-2">
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 py-3">
          <div>
            <p className="text-sm text-gray-500 mb-2">RRN</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.rrn}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Tarix</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.tarix}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Komissiya</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.komissiya}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Əməliyyat komissiyası</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.emeliyyatKomissiyasi}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">{payment.detay.kartNomresi}</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.kartMebleg}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Ödəniş qəbzi</p>
            <button className="flex items-center gap-1 text-sm font-medium text-[#00BCD4] hover:text-[#00acc1] transition-colors">
              <Download size={14} />
              Yüklə
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Yerinə yetirdi</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.yerineYetirdi}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Operator</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.operator}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Ödəniş mənbəyi</p>
            <p className="text-sm font-medium text-gray-900">{payment.detay.odenisMenubeyi}</p>
          </div>
        </div>
        <div className="mt-2">
          <button className="border border-gray-300 hover:border-gray-400 text-sm text-gray-600 hover:text-gray-800 px-4 py-1.5 rounded-lg transition-colors">
            Geri qaytarın
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PaymentHistoryTabContent() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const total = mockPayments.reduce((acc, p) => {
    const n = parseFloat(p.mebleg.replace(/[^\d.]/g, ""));
    return acc + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="bg-white rounded-[12px] border border-[#ECECED] py-5 px-7">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            filterOpen
              ? "bg-[#00BCD4] text-white"
              : "bg-[#00BCD4] text-white hover:bg-[#00acc1]"
          )}
        >
          <Image src="/filter.svg" alt="Filtr" width={16} height={16} />
          Filtr
        </button>

        <button
          onClick={() => setExportOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#00BCD4] border border-[#00BCD4] hover:bg-[#00BCD4]/5 transition-colors"
        >
          <Download size={16} />
          Yüklə
        </button>
      </div>

      {filterOpen && <FilterPanel />}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-[#E0F7FA] text-[#7C7C7C] text-[18px]">
              {[
                "Kart sahibi",
                "Ödəniş növü",
                "Ödəniş üsulu",
                "Təsvir",
                "RRN",
              ].map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-3 font-medium first:rounded-l-lg last:rounded-r-lg whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
              {["Məbləğ", "Tarix", "Komissiya", "Əməliyyat Komissiyası"].map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-3 py-3 font-medium whitespace-nowrap"
                  >
                    <button className="flex items-center gap-2 hover:text-[#00BCD4] transition-colors">
                      {col}
                      <ArrowUp size={18} />
                    </button>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {mockPayments.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  Məlumat tapılmadı
                </td>
              </tr>
            ) : (
              mockPayments.map((payment) => (
                <>
                  <tr
                    key={payment.id}
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === payment.id ? null : payment.id
                      )
                    }
                    className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors group"
                  >
                    <td className="px-3 py-3 text-gray-800 font-medium">
                      {payment.kartSahibi}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {payment.odenisNovu}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {payment.odenisUsulu}
                    </td>
                    <td className="px-3 py-3 text-gray-500 max-w-50">
                      <div className="text-xs leading-relaxed whitespace-pre-line line-clamp-3">
                        {payment.tesvir}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{payment.rrn}</td>
                    <td className="px-3 py-3 text-gray-800 font-medium">
                      {payment.mebleg}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                      {payment.tarix}
                    </td>
                    <td className="px-3 py-3 text-gray-600">—</td>
                    <td className="px-3 py-3 text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>—</span>
                        <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          {expandedRow === payment.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === payment.id && (
                    <TransactionDetail key={`detail-${payment.id}`} payment={payment} />
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-3 mt-3">
        <span className="text-sm text-gray-500">
          Cəmi:{" "}
          <span className="font-semibold text-[#7C7C7C]">
            {total.toFixed(2)} AZN
          </span>
        </span>
      </div>

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}