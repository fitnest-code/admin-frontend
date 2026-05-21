"use client";

import { LegalDocumentsTab } from "./legal-documents-tab";

export function LegalPage() {
  return (
    <div className="flex flex-col gap-8 w-full font-sans p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="w-full flex items-center justify-between border-b border-[#ececed] pb-3">
        <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">Hüquqi Sənəd İdarəetməsi</h1>
      </div>

      {/* CONTENT */}
      <div className="w-full min-h-[500px]">
        <LegalDocumentsTab />
      </div>
    </div>
  );
}
