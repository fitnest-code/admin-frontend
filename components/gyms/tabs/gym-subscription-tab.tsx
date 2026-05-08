"use client";

import { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

type Package = "Bronze" | "Silver" | "Gold" | "Platinum";

const packageStyles: Record<Package, { bg: string; text: string; border: string; checked: string }> = {
  Bronze:   { bg: "bg-[#e8c49a]",  text: "text-white", border: "border-[#e8c49a]",  checked: "bg-[#e8c49a]"  },
  Silver:   { bg: "bg-[#c8cfe0]",  text: "text-white", border: "border-[#c8cfe0]",  checked: "bg-[#c8cfe0]"  },
  Gold:     { bg: "bg-[#f0d080]",  text: "text-white", border: "border-[#f0d080]",  checked: "bg-[#f0d080]"  },
  Platinum: { bg: "bg-[#2d2d2d]",  text: "text-white", border: "border-[#2d2d2d]",  checked: "bg-[#2d2d2d]"  },
};

const PACKAGES: Package[] = ["Bronze", "Silver", "Gold", "Platinum"];

const defaultServices: Record<Package, string[]> = {
  Bronze:   ["Spa", "Masaj"],
  Silver:   ["Spa", "Masaj", "Hovuz"],
  Gold:     ["Spa", "Masaj", "Hovuz", "Hamam", "Sauna"],
  Platinum: ["Spa", "Masaj", "Hovuz", "Hamam", "Sauna", "Kafe", "Fen", "Daraq"],
};

export default function SubscriptionPage() {
  const [selectedPackages, setSelectedPackages] = useState<Package[]>(["Platinum"]);
  const [activePackage, setActivePackage] = useState<Package>("Platinum");
  const [prices, setPrices] = useState<Record<Package, string>>({ Bronze: "", Silver: "", Gold: "", Platinum: "50" });
  const [services, setServices] = useState<Record<Package, string[]>>(defaultServices);
  const [newService, setNewService] = useState("");

  const togglePackage = (pkg: Package) => {
    setSelectedPackages((prev) =>
      prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg]
    );
    if (!selectedPackages.includes(pkg)) setActivePackage(pkg);
  };

  const removeService = (pkg: Package, idx: number) => {
    setServices((prev) => ({ ...prev, [pkg]: prev[pkg].filter((_, i) => i !== idx) }));
  };

  const addService = () => {
    const trimmed = newService.trim();
    if (!trimmed) return;
    setServices((prev) => ({ ...prev, [activePackage]: [...prev[activePackage], trimmed] }));
    setNewService("");
  };

  const s = packageStyles[activePackage];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-xl flex flex-col">

        {/* Package selector */}
        <div className="p-6 border-b border-dashed border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Zala aid olan abunəliklər</h2>
          <div className="flex flex-wrap gap-3">
            {PACKAGES.map((pkg) => {
              const ps = packageStyles[pkg];
              const isSelected = selectedPackages.includes(pkg);
              const isActive = activePackage === pkg;
              return (
                <button
                  key={pkg}
                  onClick={() => {
                    if (isSelected) setActivePackage(pkg);
                    togglePackage(pkg);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                    ${isSelected ? `${ps.bg} ${ps.text}` : "bg-gray-100 text-gray-500"}
                    ${isActive && isSelected ? "ring-2 ring-offset-2 ring-gray-400" : ""}
                  `}
                >
                  {/* Checkbox */}
                  <Checkbox.Root
                    checked={isSelected}
                    onCheckedChange={() => togglePackage(pkg)}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                      ${isSelected ? "bg-white/30 border-white" : "bg-white border-gray-300"}`}
                  >
                    <Checkbox.Indicator>
                      <CheckIcon className="w-3 h-3 text-white stroke-[3]" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  {pkg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div className="p-6 border-b border-dashed border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Giriş qiyməti</h2>
          <label className="text-sm text-gray-500 mb-1.5 block">Giriş qiyməti</label>
          <input
            type="number"
            value={prices[activePackage]}
            onChange={(e) => setPrices((prev) => ({ ...prev, [activePackage]: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800
              focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />
        </div>

        {/* Services */}
        <div className="p-6 border-b border-dashed border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {activePackage} paketə daxil olan xidmətlər
            </h2>
            <button
              onClick={addService}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600
                text-white text-sm font-medium rounded-xl transition active:scale-95"
            >
              Xidmət əlavə et <PlusIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Service chips */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {services[activePackage].map((svc, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800"
              >
                <span className="truncate">{svc}</span>
                <button
                  onClick={() => removeService(activePackage, i)}
                  className="shrink-0 text-red-400 hover:text-red-600 transition"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* New service input */}
          <input
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addService()}
            placeholder="Yeni xidmət adı..."
            className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-6 py-4">
          <button className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-medium
            text-gray-700 hover:bg-gray-50 transition active:scale-95">
            Yadda saxla
          </button>
          <button className="flex-1 py-3 rounded-xl bg-teal-500 text-white text-sm font-medium
            hover:bg-teal-600 transition active:scale-95">
            Növbəti
          </button>
        </div>

      </div>
    </div>
  );
}