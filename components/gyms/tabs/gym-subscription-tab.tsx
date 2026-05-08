"use client";

import { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Trash2, Plus, Loader2 } from "lucide-react";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useCreateSupportedService, useCreateGymStep6 } from "@/lib/query/gym-query";
import { toast } from "sonner";

import { ServiceSelectorModal } from "../modals/service-selector-modal";

type Package = "Bronze" | "Silver" | "Gold" | "Platinum";

const packageStyles: Record<Package, { bg: string; text: string; border: string; checked: string }> = {
  Bronze:   { bg: "bg-[#e8c49a]",  text: "text-white", border: "border-[#e8c49a]",  checked: "bg-[#e8c49a]"  },
  Silver:   { bg: "bg-[#c8cfe0]",  text: "text-white", border: "border-[#c8cfe0]",  checked: "bg-[#c8cfe0]"  },
  Gold:     { bg: "bg-[#f0d080]",  text: "text-white", border: "border-[#f0d080]",  checked: "bg-[#f0d080]"  },
  Platinum: { bg: "bg-[#2d2d2d]",  text: "text-white", border: "border-[#2d2d2d]",  checked: "bg-[#2d2d2d]"  },
};

const PACKAGES: Package[] = ["Bronze", "Silver", "Gold", "Platinum"];

export default function GymSubscriptionTab({ onNext }: { onNext?: () => void }) {
  const { gymId } = useGymStore();
  const [selectedPackages, setSelectedPackages] = useState<Package[]>(["Platinum"]);
  const [activePackage, setActivePackage] = useState<Package>("Platinum");
  const [prices, setPrices] = useState<Record<Package, string>>({ Bronze: "", Silver: "", Gold: "", Platinum: "50" });
  
  const [packageServices, setPackageServices] = useState<Record<Package, string[]>>({
    Bronze: [], Silver: [], Gold: [], Platinum: []
  });

  const [showSelectorModal, setShowSelectorModal] = useState(false);

  const { data: allServices, isLoading: servicesLoading } = useSupportedServices(gymId ? Number(gymId) : undefined);

  const togglePackage = (pkg: Package) => {
    setSelectedPackages((prev) =>
      prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg]
    );
    if (!selectedPackages.includes(pkg)) setActivePackage(pkg);
  };

  const removeService = (pkg: Package, svcName: string) => {
    setPackageServices((prev) => ({ ...prev, [pkg]: prev[pkg].filter((s) => s !== svcName) }));
  };

  const { mutate: createStep6, isPending: savingStep6 } = useCreateGymStep6();

  const handleNext = () => {
    if (!gymId) return toast.error("Zal ID tapılmadı");
    
    const PACKAGE_IDS: Record<Package, number> = {
      Bronze: 1, Silver: 2, Gold: 3, Platinum: 4,
    };

    const subscriptions = selectedPackages.map(pkg => {
      const serviceNames = packageServices[pkg];
      const serviceIds = serviceNames.map(name => {
        const found = allServices?.find(s => s.name === name);
        return found ? found.id : null;
      }).filter((id): id is number => id !== null);

      return {
        packageId: PACKAGE_IDS[pkg],
        dailyPrice: Number(prices[pkg]) || 0,
        supportedServicesId: serviceIds
      };
    });

    if (subscriptions.length === 0) {
      return toast.error("Ən azı bir abunəlik paketi seçilməlidir");
    }

    createStep6({
      id: Number(gymId),
      payload: { subscriptions }
    }, {
      onSuccess: () => {
        toast.success("Abunəlik məlumatları yadda saxlanıldı");
        onNext?.();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Xəta baş verdi");
      }
    });
  };

  return (
    <div className="w-full flex justify-center py-6">
      <div className="bg-white rounded-2xl border border-[#ECECED] w-full max-w-[783px] flex flex-col shadow-sm">

        {/* Package selector */}
        <div className="p-6 border-b border-dashed border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Zala aid olan abunəliklər</h2>
          <div className="flex flex-wrap gap-3">
            {PACKAGES.map((pkg) => {
              const ps = packageStyles[pkg];
              const isSelected = selectedPackages.includes(pkg);
              const isActive = activePackage === pkg;
              return (
                <div
                  key={pkg}
                  onClick={() => {
                    if (isSelected) setActivePackage(pkg);
                    else {
                      togglePackage(pkg);
                      setActivePackage(pkg);
                    }
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer
                    ${isSelected ? `${ps.bg} ${ps.text}` : "bg-gray-100 text-gray-500 hover:bg-gray-200"}
                    ${isActive && isSelected ? "ring-2 ring-offset-2 ring-gray-400" : ""}
                  `}
                >
                  <Checkbox.Root
                    checked={isSelected}
                    onCheckedChange={() => togglePackage(pkg)}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                      ${isSelected ? "bg-white/30 border-white" : "bg-white border-gray-300"}`}
                  >
                    <Checkbox.Indicator>
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  {pkg}
                </div>
              );
            })}
          </div>
        </div>

        {/* Price & Services Header */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-semibold text-gray-900">
              {activePackage} paketinin parametrləri
            </h2>
            <p className="text-xs text-gray-400">Bu paket üçün giriş qiyməti və daxil olan xidmətləri tənzimləyin</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Giriş qiyməti (AZN)</label>
            <input
              type="number"
              value={prices[activePackage]}
              onChange={(e) => setPrices((prev) => ({ ...prev, [activePackage]: e.target.value }))}
              placeholder="0.00"
              className="w-full max-w-[200px] border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Daxil olan xidmətlər</label>
              <button
                onClick={() => setShowSelectorModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00B4D815] hover:bg-[#00B4D825]
                  text-[#00B4D8] text-sm font-bold rounded-xl transition"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Xidmət seç / əlavə et
              </button>
            </div>

            {/* Selected services chips */}
            <div className="flex flex-wrap gap-2 min-h-[45px] p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              {packageServices[activePackage].length === 0 ? (
                <p className="text-sm text-gray-400 italic self-center">Hələ ki xidmət seçilməyib</p>
              ) : (
                packageServices[activePackage].map((svc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 shadow-sm animate-in fade-in zoom-in duration-200"
                  >
                    <span>{svc}</span>
                    <button
                      onClick={() => removeService(activePackage, svc)}
                      className="shrink-0 text-slate-300 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-6 py-4 mt-auto border-t">
          <button 
            type="button"
            onClick={handleNext}
            disabled={savingStep6}
            className="w-full py-4 rounded-xl bg-[#00B4D8] text-white text-sm font-bold
            hover:bg-[#0096B4] transition shadow-lg shadow-cyan-100 flex items-center justify-center disabled:opacity-70"
          >
            {savingStep6 ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Növbəti
          </button>
        </div>

      </div>

      {showSelectorModal && (
        <ServiceSelectorModal 
          onClose={() => setShowSelectorModal(false)}
          activePackageName={activePackage}
          selectedServiceNames={packageServices[activePackage]}
          onSelectionChange={(names) => setPackageServices(prev => ({ ...prev, [activePackage]: names }))}
        />
      )}
    </div>
  );
}