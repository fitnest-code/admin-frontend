"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import AccountabilityTab from "./tabs/accountability";
import PaymentHistoryTab from "./tabs/payment-history";
import TransactionLogsTabContent from "./tabs/transaction-logs";
import BalanceHistoryPageContent from "./tabs/balance-history";
import HistoryOfMigrationsTabContent from "./tabs/history-of-migrations";

export default function PaymentPageContent() {
  return (
    <div className="min-h-screen font-sans text-slate-800 p-4 md:p-6">
      <div className="space-y-6">

        {/* Başlıq */}
        <h1 className="text-2xl font-bold text-slate-900 px-1 border-b pb-3 border-slate-100">
          Analitika
        </h1>

        {/* Tab İdarəetmə Mərkəzi */}
        <Tabs.Root defaultValue="hesabatliq" className="w-full">

          {/* Ümumi Tab Naviqasiya Siyahısı */}
          <Tabs.List className="flex border-b border-slate-200 overflow-x-auto scrollbar-none mb-6 justify-between">
            <Tabs.Trigger
              value="hesabatliq"
              className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
            >
              Hesabatlıq
            </Tabs.Trigger>
            <Tabs.Trigger
              value="odenis"
              className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
            >
              Ödəniş tarixçəsi
            </Tabs.Trigger>
            <Tabs.Trigger
              value="kocurmeler"
              className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
            >
              Köçürmələrin tarixçəsi
            </Tabs.Trigger>
            <Tabs.Trigger
              value="loqlar"
              className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
            >
              Əməliyyat loqları
            </Tabs.Trigger>
            <Tabs.Trigger
              value="balans"
              className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
            >
              Balans tarixçəsi
            </Tabs.Trigger>
          </Tabs.List>

          {/* 1. Hesabatlıq Kontenti */}
          <Tabs.Content value="hesabatliq" className="outline-none">
            <AccountabilityTab />
          </Tabs.Content>

          {/* 2. Ödəniş Tarixçəsi Kontenti (Gələcəkdə bura yeni komponent qoyacaqsınız) */}
          <Tabs.Content value="odenis" className="outline-none pt-4 text-slate-500">
            <PaymentHistoryTab />
          </Tabs.Content>

          {/* 3. Köçürmələrin Tarixçəsi */}
          <Tabs.Content value="kocurmeler" className="outline-none pt-4 text-slate-500">
            <HistoryOfMigrationsTabContent />
          </Tabs.Content>

          {/* 4. Əməliyyat Loqları */}
          <Tabs.Content value="loqlar" className="outline-none pt-4 text-slate-500">
            <TransactionLogsTabContent />
          </Tabs.Content>

          {/* 5. Balans Tarixçəsi */}
          <Tabs.Content value="balans" className="outline-none pt-4 text-slate-500">
            <BalanceHistoryPageContent />
          </Tabs.Content>

        </Tabs.Root>
      </div>
    </div>
  );
}