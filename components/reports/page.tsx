"use client";

import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import TotalTab from "./tabs/total-tab";
import HallInformationTab from "./tabs/hall-information-tab";
import CustomersTab from "./tabs/customers-tab";
import SubscriptionsServicesTab from "./tabs/subscriptions-services-tab";
import ReservationTab from "./tabs/reservation-tab";
import QrInputTab from "./tabs/qr-input-tab";


export default function ReportsPageContent() {
    return (
        <div className="min-h-screen font-sans text-slate-800 px-4 md:px-6">
            <div className="space-y-6">

                <Tabs.Root defaultValue="total" className="w-full">

                    <Tabs.List className="flex border-b border-slate-200 overflow-x-auto scrollbar-none mb-6 justify-between">
                        <Tabs.Trigger
                            value="total"
                            className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
                        >
                            Ümumi
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="hall-information"
                            className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
                        >
                            Zal Məlumatları
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="customers"
                            className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
                        >
                            Müştərilər
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="subscriptions-services"
                            className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
                        >
                            Abunəlik / Xidmətlər
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="qr-input"
                            className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
                        >
                            QR Giriş
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="reservation"
                            className="px-4 py-3 text-[20px] font-semibold whitespace-nowrap text-[#7C7C7C] border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 transition-all outline-none"
                        >
                            Rezervasiya
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="total" className="outline-none">
                        <TotalTab />
                    </Tabs.Content>

                    <Tabs.Content value="hall-information" className="outline-none pt-4 text-slate-500">
                        <HallInformationTab />
                    </Tabs.Content>

                    <Tabs.Content value="customers" className="outline-none pt-4 text-slate-500">
                        <CustomersTab />
                    </Tabs.Content>

                    <Tabs.Content value="subscriptions-services" className="outline-none pt-4 text-slate-500">
                        <SubscriptionsServicesTab />
                    </Tabs.Content>

                    <Tabs.Content value="qr-input" className="outline-none pt-4 text-slate-500">
                        <QrInputTab />
                    </Tabs.Content>

                    <Tabs.Content value="reservation" className="outline-none pt-4 text-slate-500">
                        <ReservationTab />
                    </Tabs.Content>

                </Tabs.Root>
            </div>
        </div>
    )
} 