"use client";

import { useState } from "react";
import { Plus, Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useCreateGymStep6, useCreateSupportedService } from "@/lib/query/gym-query";
import { toast } from "sonner";

type Package = "Bronze" | "Silver" | "Gold" | "Platinum";

const PACKAGES: Package[] = ["Bronze", "Silver", "Gold", "Platinum"];

export function StepPlans({ onNext }: { onNext: () => void }) {
  const { gymId } = useGymStore();
  const [selectedPackages, setSelectedPackages] = useState<Package[]>(["Platinum"]);
  const [activePackage, setActivePackage] = useState<Package>("Platinum");
  const [prices, setPrices] = useState<Record<Package, string>>({ Bronze: "", Silver: "", Gold: "", Platinum: "50" });
  
  const [packageServices, setPackageServices] = useState<Record<Package, string[]>>({
    Bronze: [], Silver: [], Gold: [], Platinum: []
  });

  const [pendingService, setPendingService] = useState<string | null>(null);
  const { data: allServices } = useSupportedServices(gymId ? Number(gymId) : undefined);
  const createServiceMutation = useCreateSupportedService();
  const { mutate: createStep6, isPending: savingStep6 } = useCreateGymStep6();

  const togglePackage = (pkg: Package) => {
    setSelectedPackages((prev) =>
      prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg]
    );
    if (!selectedPackages.includes(pkg)) setActivePackage(pkg);
  };

  const handleAddClick = () => {
    setPendingService("");
  };

  const handleConfirmService = async () => {
    if (!pendingService || !pendingService.trim()) {
      setPendingService(null);
      return;
    }

    try {
      await createServiceMutation.mutateAsync({
        name: pendingService.trim(),
        gymId: gymId ? Number(gymId) : undefined
      });
      
      setPackageServices(prev => ({
        ...prev,
        [activePackage]: [...prev[activePackage], pendingService.trim()]
      }));
      setPendingService(null);
      toast.success("Xidmət yaradıldı");
    } catch (err: any) {
      toast.error(err?.message || "Xidmət yaradıla bilmədi");
    }
  };

  const toggleServiceSelection = (svcName: string) => {
    setPackageServices(prev => {
      const isSelected = prev[activePackage].includes(svcName);
      if (isSelected) {
        return { ...prev, [activePackage]: prev[activePackage].filter(s => s !== svcName) };
      } else {
        return { ...prev, [activePackage]: [...prev[activePackage], svcName] };
      }
    });
  };

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
        toast.success("Abunəlik məlumatları uğurla yeniləndi");
        onNext();
      },
      onError: (err: any) => {
        toast.error(err?.message || "Xəta baş verdi");
      }
    });
  };

  return (
    <div className="w-full flex justify-center py-6">
      <div className="bg-white rounded-[32px] border border-[#ECECED] w-full max-w-[783px] flex flex-col shadow-sm overflow-hidden">

        {/* Package selector */}
        <div className="p-8 border-b border-dashed border-slate-100 bg-slate-50/30">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Zala aid olan abunəliklər</h2>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Aktivləşdirmək istədiyiniz paketləri seçin</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PACKAGES.map((pkg) => {
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
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-4 rounded-[20px] border-2 transition-all duration-300 cursor-pointer",
                    isActive && isSelected
                      ? "border-[#00B4D8] bg-white shadow-md ring-4 ring-[#00B4D805]" 
                      : isSelected
                      ? "border-slate-200 bg-white"
                      : "border-transparent bg-slate-50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePackage(pkg);
                    }}
                    className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                      isSelected ? "bg-[#00B4D8] border-[#00B4D8]" : "bg-white border-slate-200"
                    )}
                  >
                    {isSelected && <Check className="text-white w-3.5 h-3.5 stroke-[4]" />}
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-xs font-bold transition-colors",
                      isSelected ? "text-slate-800" : "text-slate-400"
                    )}>
                      {pkg}
                    </span>
                    {isSelected && <span className="text-[10px] text-[#00B4D8] font-bold">Aktiv</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Price & Services Header */}
        <div className="p-8 space-y-8">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {activePackage} paketinin parametrləri
            </h2>
            <p className="text-xs text-slate-400 font-medium">Bu paket üçün giriş qiyməti və daxil olan xidmətləri tənzimləyin</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giriş qiyməti (AZN)</label>
            <div className="relative max-w-[200px]">
              <input
                type="number"
                value={prices[activePackage]}
                onChange={(e) => setPrices((prev) => ({ ...prev, [activePackage]: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-100 rounded-[18px] px-5 py-4 text-sm font-bold text-slate-700
                  focus:outline-none focus:border-[#00B4D8] focus:bg-white transition-all shadow-sm"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">AZN</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daxil olan xidmətlər</label>
              <button
                onClick={handleAddClick}
                disabled={pendingService !== null}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00B4D8] hover:bg-[#0096B4]
                  text-white text-xs font-bold rounded-[14px] transition-all shadow-lg shadow-cyan-100 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Xidmət əlavə et
              </button>
            </div>

            <div className="flex flex-wrap gap-3 min-h-[100px] p-5 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
              {packageServices[activePackage].length === 0 && pendingService === null ? (
                <div className="w-full flex flex-col items-center justify-center py-4 text-slate-300 italic gap-2">
                  <p className="text-sm">Hələ ki xidmət seçilməyib</p>
                </div>
              ) : (
                <>
                  {packageServices[activePackage].map((svc, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-3 bg-white border border-slate-100 rounded-[16px] px-4 py-3 text-sm font-bold text-slate-600 shadow-sm animate-in fade-in zoom-in duration-300"
                    >
                      <span>{svc}</span>
                      <button
                        onClick={() => toggleServiceSelection(svc)}
                        className="p-1.5 bg-red-50 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {pendingService !== null && (
                    <div className="flex items-center gap-2 bg-white border-2 border-[#00B4D8] rounded-[16px] pl-4 pr-2 py-2 shadow-md animate-in slide-in-from-left-2 duration-300">
                      <input 
                        autoFocus
                        value={pendingService}
                        onChange={(e) => setPendingService(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmService()}
                        placeholder="Xidmət adı..."
                        className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 w-[140px]"
                      />
                      <button 
                        onClick={handleConfirmService}
                        disabled={createServiceMutation.isPending}
                        className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                      >
                        {createServiceMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                      <button 
                        onClick={() => setPendingService(null)}
                        className="p-2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Select from All Services */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mövcud xidmətlər (Sürətli seçim)</label>
              <div className="flex flex-wrap gap-2">
                {allServices?.filter(s => !packageServices[activePackage].includes(s.name)).map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => toggleServiceSelection(svc.name)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-[#00B4D8] hover:text-[#00B4D8] hover:bg-cyan-50 transition-all"
                  >
                    + {svc.name}
                  </button>
                ))}
              </div>
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
    </div>
  );
}
