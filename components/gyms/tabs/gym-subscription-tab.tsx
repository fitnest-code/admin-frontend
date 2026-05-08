"use client";

import { useState } from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Trash2, Plus, Loader2 } from "lucide-react";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useCreateSupportedService, useCreateGymStep6 } from "@/lib/query/gym-query";
import { toast } from "sonner";

import { AddServiceModal } from "../modals/add-service-modal";

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
  
  // Local state for which services are assigned to which package
  const [packageServices, setPackageServices] = useState<Record<Package, string[]>>({
    Bronze: [], Silver: [], Gold: [], Platinum: []
  });

  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch all available services
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

  const handleAddServiceSuccess = (serviceName: string) => {
    if (!packageServices[activePackage].includes(serviceName)) {
      setPackageServices((prev) => ({ ...prev, [activePackage]: [...prev[activePackage], serviceName] }));
    }
  };

  const { mutate: createStep6, isPending: savingStep6 } = useCreateGymStep6();

  const handleNext = () => {
    if (!gymId) return toast.error("Zal ID tapılmadı");
    
    // Construct the payload for Step 6
    const PACKAGE_IDS: Record<Package, number> = {
      Bronze: 1,
      Silver: 2,
      Gold: 3,
      Platinum: 4,
    };

    const subscriptions: GymCreateStep6SubscriptionRequest[] = selectedPackages.map(pkg => {
      // Find service IDs for this package
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
                      <Check className="w-3 h-3 text-white stroke-[3]" />
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
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00B4D8] hover:bg-[#0096B4]
                text-white text-sm font-medium rounded-xl transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Xidmət əlavə et
            </button>
          </div>

          {/* Assigned Service chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {packageServices[activePackage].length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">Hələ ki xidmət seçilməyib</p>
            ) : (
              packageServices[activePackage].map((svc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 text-sm text-teal-700"
                >
                  <span>{svc}</span>
                  <button
                    onClick={() => removeService(activePackage, svc)}
                    className="shrink-0 text-teal-400 hover:text-teal-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Available Global/Gym Services Pool */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-3 block">Sistemdə olan xidmətlər (Seçmək üçün üzərinə basın)</label>
            <div className="flex flex-wrap gap-2">
              {servicesLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yüklənir...
                </div>
              ) : allServices?.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Hələ ki heç bir xidmət yoxdur</p>
              ) : (
                allServices?.map((s) => {
                  const isSelected = packageServices[activePackage].includes(s.name);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleServiceInPackage(s.name)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border
                        ${isSelected 
                          ? "bg-[#00B4D8] border-[#00B4D8] text-white shadow-md" 
                          : "bg-white border-gray-200 text-gray-600 hover:border-[#00B4D8] hover:text-[#00B4D8]"}`}
                    >
                      {s.name}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-6 py-4">
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

      {showAddModal && (
        <AddServiceModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={handleAddServiceSuccess}
        />
      )}
    </div>
  );
}