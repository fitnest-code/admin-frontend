"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import AccountabilityTab from "./tabs/accountability-tab";
import PaymentHistoryTab from "./tabs/payment-history-tab";
import TransactionLogsTabContent from "./tabs/transaction-logs-tab";
import BalanceHistoryPageContent from "./tabs/balance-history-tab";
import HistoryOfMigrationsTabContent from "./tabs/history-of-migrations-tab";

export default function PaymentPageContent() {
  return (
    <div className="min-h-screen font-sans text-slate-800 p-4 md:p-6">
      <div className="space-y-6">

        <h1 className="text-2xl font-bold text-slate-900 px-1 border-b pb-3 border-slate-100">
          Analitika
        </h1>

        <Tabs.Root defaultValue="hesabatliq" className="w-full">

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

          <Tabs.Content value="hesabatliq" className="outline-none">
            <AccountabilityTab />
          </Tabs.Content>

          <Tabs.Content value="odenis" className="outline-none pt-4 text-slate-500">
            <PaymentHistoryTab />
          </Tabs.Content>

          <Tabs.Content value="kocurmeler" className="outline-none pt-4 text-slate-500">
            <HistoryOfMigrationsTabContent />
          </Tabs.Content>

          <Tabs.Content value="loqlar" className="outline-none pt-4 text-slate-500">
            <TransactionLogsTabContent />
          </Tabs.Content>

          <Tabs.Content value="balans" className="outline-none pt-4 text-slate-500">
            <BalanceHistoryPageContent />
          </Tabs.Content>

        </Tabs.Root>
      </div>
    </div>
  );
}