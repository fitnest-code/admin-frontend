"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LegalDocumentsTab } from "./legal-documents-tab";
import { ContactDetailsTab } from "./contact-details-tab";

const LEGAL_TABS = [
  { key: "documents", label: "Hüquqi Sənədlər" },
  { key: "contact", label: "Əlaqə məlumatları" },
];

export function LegalPage() {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <div className="flex flex-col gap-8 w-full font-sans max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3">
        <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">Hüquqi və Əlaqə İdarəetməsi</h1>
      </div>

      {/* STRETCHED TABS */}
      <div className="w-full border-b border-[#ececed]">
        <nav className="-mb-px flex w-full overflow-x-auto no-scrollbar" aria-label="Hüquqi bölmələr">
          {LEGAL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 min-w-[130px] border-b-[3px] pb-3 text-[13px] font-bold transition-all duration-200 whitespace-nowrap tracking-wide text-center",
                activeTab === tab.key
                  ? "border-[#00B4CC] text-[#101828]"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
              )}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB CONTENT (BOX) */}
      <div className="w-full min-h-[500px]">
        {activeTab === "documents" && <LegalDocumentsTab />}
        {activeTab === "contact" && <ContactDetailsTab />}
      </div>
    </div>
  );
}
