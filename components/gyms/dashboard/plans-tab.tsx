"use client";

import { useState } from "react";
import { Plus, Check, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useCreateGymStep6 } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { ServiceSelectorModal } from "../modals/service-selector-modal";

type Package = "Bronze" | "Silver" | "Gold" | "Platinum";

const PACKAGES: Package[] = ["Bronze", "Silver", "Gold", "Platinum"];

const packageStyles: Record<Package, { bg: string; text: string }> = {
  Bronze: { bg: "bg-orange-100", text: "text-orange-700" },
  Silver: { bg: "bg-slate-100", text: "text-slate-700" },
  Gold: { bg: "bg-amber-100", text: "text-amber-700" },
  Platinum: { bg: "bg-zinc-900", text: "text-white" },
};

const DEFAULT_SERVICES = [
  { id: 1, name: "Base dərslər" },
  { id: 2, name: "Hovuz" },
  { id: 3, name: "Sauna" },
  { id: 4, name: "Dəsmal" },
];

export function PlansTab() {
  const { gymId } = useGymStore();
  const [selectedPackages, setSelectedPackages] = useState<Package[]>(["Platinum"]);
  const [activePackage, setActivePackage] = useState<Package>("Platinum");
  const [prices, setPrices] = useState<Record<Package, string>>({ Bronze: "", Silver: "", Gold: "", Platinum: "50" });
  
  const [packageServices, setPackageServices] = useState<Record<Package, string[]>>({
    Bronze: [], Silver: [], Gold: [], Platinum: []
  });

  const [showSelectorModal, setShowSelectorModal] = useState(false);

  const { data: allServices } = useSupportedServices(gymId ? Number(gymId) : undefined);

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

  const handleSave = () => {
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
        toast.success("Abunəlik məlumatları uğurla yeniləndi");
      },
      onError: (err: any) => {
        toast.error(err?.message || "Xəta baş verdi");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground">Zala aid olan abunəliklər</h3>
          <div className="flex flex-wrap gap-3">
            {PACKAGES.map((pkg) => {
              const ps = packageStyles[pkg];
              const isSelected = selectedPackages.includes(pkg);
              return (
                <button
                  key={pkg}
                  onClick={() => togglePackage(pkg)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border",
                    isSelected 
                      ? `${ps.bg} ${ps.text} border-transparent shadow-sm` 
                      : "bg-secondary/20 text-muted-foreground border-border hover:bg-secondary/40"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                    isSelected ? "bg-white/30 border-white" : "bg-white border-border"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                  </div>
                  {pkg}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Zalda mövcud olan xidmətlər</h3>
            <button 
              onClick={() => setShowSelectorModal(true)}
              className="text-xs font-bold text-[#00B4CC] hover:underline"
            >
              Xidmət seç / əlavə et +
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {DEFAULT_SERVICES.map((svc) => {
              const isSelected = packageServices[activePackage].includes(svc.name);
              return (
                <button
                  key={svc.id}
                  onClick={() => {
                    if (isSelected) removeService(activePackage, svc.name);
                    else setPackageServices(prev => ({ ...prev, [activePackage]: [...prev[activePackage], svc.name] }));
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all border",
                    isSelected 
                      ? "bg-[#00B4CC15] text-[#00B4CC] border-[#00B4CC] shadow-sm" 
                      : "bg-secondary/10 text-muted-foreground border-border hover:bg-secondary/20"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                    isSelected ? "bg-[#00B4CC] border-transparent" : "bg-white border-border"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[4]" />}
                  </div>
                  {svc.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button 
          onClick={handleSave}
          disabled={savingStep6}
          className="px-10 py-3.5 rounded-xl bg-muted text-muted-foreground font-bold transition-all hover:bg-secondary/50 flex items-center gap-2"
        >
          {savingStep6 && <Loader2 className="w-4 h-4 animate-spin" />}
          Yadda saxla
        </button>
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
