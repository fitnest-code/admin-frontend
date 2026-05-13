"use client";

import { useState, useMemo } from "react";
import { Plus, Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useValidateGymStep6, useCreateSupportedService, useDeleteSupportedService } from "@/lib/query/gym-query";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import { GymCreateStep6Request } from "@/lib/types/gym";
import { toast } from "sonner";
import Image from "next/image";
import { ErrorToastModal } from "../../categories/modals/error-toast-modal";

const gradientsMap: Record<string, string> = {
  Bronze: "linear-gradient(111.92deg, #d8a673, #b97a3c 99.99%)",
  Silver: "linear-gradient(106.25deg, #e5e8ec, #9baac7)",
  Gold: "linear-gradient(104.88deg, #e7b75f, #f8d57e)",
  Platinum: "linear-gradient(99.99deg, #313131, #515254 40.45%, #5b5b5d 55.32%, #565857)",
};

export function StepPlans({ onNext }: { onNext: () => void }) {
  const { step6Data, setStep6Data, gymId } = useGymStore();
  const { data: allPackageNames, isLoading: packagesLoading } = useSubscriptionPackages();
  
  const PACKAGES = useMemo(() => allPackageNames?.map(p => p.name) || [], [allPackageNames]);

  // Initialize from store if exists
  const initialPackages = useMemo(() => {
    if (!step6Data) {
        // Default to first package if available
        return new Set<string>();
    }
    const set = new Set<string>();
    step6Data.subscriptions.forEach(s => {
      const found = allPackageNames?.find(p => p.id === s.packageId);
      if (found) set.add(found.name);
    });
    return set;
  }, [step6Data, allPackageNames]);

  const initialPrices = useMemo(() => {
    const res: Record<string, string> = {};
    if (step6Data) {
        step6Data.subscriptions.forEach(s => {
            const found = allPackageNames?.find(p => p.id === s.packageId);
            if (found) res[found.name] = s.dailyPrice.toString();
        });
    }
    return res;
  }, [step6Data, allPackageNames]);

  const initialServices = useMemo(() => {
    const svcs: Record<string, string[]> = {};
    PACKAGES.forEach(p => { svcs[p] = []; });
    return svcs;
  }, [PACKAGES]);

  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [activePackage, setActivePackage] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [packageServices, setPackageServices] = useState<Record<string, string[]>>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreatingService, setIsCreatingService] = useState(false);

  // Sync state once data is loaded
  useMemo(() => {
    if (allPackageNames && allPackageNames.length > 0) {
        if (selectedPackages.size === 0 && !step6Data) {
            setSelectedPackages(initialPackages.size > 0 ? initialPackages : new Set([allPackageNames[0].name]));
            setActivePackage(initialPackages.size > 0 ? Array.from(initialPackages)[0] : allPackageNames[0].name);
            setPrices(initialPrices);
            setPackageServices(initialServices);
        }
    }
  }, [allPackageNames, initialPackages, initialPrices, initialServices]);
  
  const [pendingService, setPendingService] = useState<string | null>(null);
  const { data: allServices } = useSupportedServices(gymId ? Number(gymId) : undefined);
  const createServiceMutation = useCreateSupportedService();
  const validateStep6 = useValidateGymStep6();

  const togglePackage = (pkg: string) => {
    setSelectedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(pkg)) next.delete(pkg);
      else next.add(pkg);
      return next;
    });
  };

  const handleConfirmService = async () => {
    if (!pendingService || !pendingService.trim()) {
      setPendingService(null);
      return;
    }

    try {
      const res = await createServiceMutation.mutateAsync({
        name: pendingService.trim(),
        gymId: gymId ? Number(gymId) : undefined
      });
      
      const createdName = res?.name || pendingService.trim();
      if (activePackage) {
        setPackageServices(prev => {
          const current = prev[activePackage] || [];
          if (!current.includes(createdName)) {
            return { ...prev, [activePackage]: [...current, createdName] };
          }
          return prev;
        });
      }

      setPendingService(null);
      setIsCreatingService(false);
    } catch (err: any) {
      setErrorMessage(err?.message || "Xidmət yaradıla bilmədi");
      setShowErrorModal(true);
    }
  };

  const toggleServiceSelection = (svcName: string) => {
    if (!activePackage) return;
    setPackageServices(prev => {
      const current = prev[activePackage] || [];
      const isSelected = current.includes(svcName);
      if (isSelected) {
        return { ...prev, [activePackage]: current.filter(s => s !== svcName) };
      } else {
        return { ...prev, [activePackage]: [...current, svcName] };
      }
    });
  };

  const deleteServiceMutation = useDeleteSupportedService();
  const handleDeleteService = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering service selection toggle
    try {
      await deleteServiceMutation.mutateAsync(id);
    } catch (err: any) {
      setErrorMessage("Xidməti silmək mümkün olmadı");
      setShowErrorModal(true);
    }
  };

  const handleNext = async () => {
    if (!allPackageNames) return;

    const subscriptions = Array.from(selectedPackages).map(pkgName => {
      const pkgInfo = allPackageNames.find(p => p.name === pkgName);
      const serviceNames = packageServices[pkgName] || [];
      const serviceIds = serviceNames.map(name => {
        const found = allServices?.find(s => s.name === name);
        return found ? found.id : null;
      }).filter((id): id is number => id !== null);

      return {
        packageId: pkgInfo?.id || 0,
        dailyPrice: Number(prices[pkgName]) || 0,
        supportedServicesId: serviceIds
      };
    });

    if (subscriptions.length === 0) {
      setErrorMessage("Ən azı bir abunəlik paketi seçilməlidir");
      setShowErrorModal(true);
      return;
    }

    try {
      const payload = { subscriptions };
      await validateStep6.mutateAsync(payload);
      setStep6Data(payload);
      onNext();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Abunəlik məlumatları yanlışdır");
      setShowErrorModal(true);
    }
  };

  const savingStep6 = validateStep6.isPending;

  if (packagesLoading) {
      return (
          <div className="flex-1 py-20 flex flex-col justify-center items-center text-slate-400 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <span className="font-medium">Paketlər yüklənir...</span>
          </div>
      );
  }

  if (!allPackageNames || allPackageNames.length === 0) {
      return (
          <div className="flex-1 py-20 flex flex-col justify-center items-center text-slate-400 gap-3 italic">
              Paket tapılmadı
          </div>
      );
  }


  return (
    <div className="w-full flex flex-col gap-9 font-sans text-black animate-in fade-in duration-500">
      
      {/* 1. Package Selector Section */}
      <div className="bg-white rounded-[24px] border border-[#ececed] p-7 flex flex-col gap-6 shadow-sm">
        <div className="border-b border-[#ececed] pb-2">
          <h2 className="text-[20px] font-semibold leading-[30px]">Zala aid olan abunəliklər</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPackages.has(pkg);
            const isActive = activePackage === pkg;

            return (
              <div
                key={pkg}
                onClick={() => setActivePackage(pkg)}
                style={{ background: gradientsMap[pkg] || gradientsMap["Bronze"] }}
                className={cn(
                  "relative h-[68px] rounded-[32px] flex items-center px-6 cursor-pointer transition-all duration-300",
                  isActive ? "scale-[1.05] shadow-xl ring-2 ring-[#00B4CC]" : "hover:scale-[1.02] shadow-sm",
                  !isSelected && "ring-1 ring-inset ring-black/5"
                )}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePackage(pkg);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-sm",
                    isSelected ? "bg-white border-white" : "bg-transparent border-white/70"
                  )}
                >
                  {isSelected && <Check className="text-black w-4 h-4 stroke-[4]" />}
                </div>

                <b className={cn(
                  "ml-3 text-[18px] tracking-tight",
                  pkg === "Platinum" ? "text-white" : "text-white drop-shadow-md"
                )}>
                  {pkg}
                </b>

                {isActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00B4CC] rounded-full border-2 border-white shadow-sm animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Price Section */}
      <div className="bg-white rounded-[24px] border border-[#ececed] p-7 flex flex-col gap-6 shadow-sm">
        <div className="border-b border-[#ececed] pb-2">
          <h2 className="text-[20px] font-semibold leading-[30px]">Giriş qiyməti</h2>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[16px] text-black/60 font-medium">Giriş qiyməti (AZN)</label>
          <div className="h-[60px] w-full max-w-[320px] bg-[#fafafa] border border-[#ececed] rounded-[12px] flex items-center px-5">
            <input
              type="number"
              value={prices[activePackage] || ""}
              onChange={(e) => setPrices(prev => ({ ...prev, [activePackage]: e.target.value }))}
              className="bg-transparent w-full h-full outline-none text-[18px] font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
            <span className="text-black/40 font-bold ml-2">AZN</span>
          </div>
        </div>
      </div>

      {/* 3. Services Section */}
      <div className="bg-white rounded-[12px] border border-[#ececed] p-7 flex flex-col gap-8 shadow-sm">
        {/* Add Service Section Toggle / Form */}
        {!isCreatingService ? (
          <div className="flex items-center justify-between border-b border-[#ececed] pb-3 animate-in fade-in duration-300">
            <h3 className="text-[20px] font-semibold leading-[30px]">{activePackage} paketə daxil olan xidmətlər</h3>
            <button
              onClick={() => setIsCreatingService(true)}
              className="h-[48px] px-6 bg-[#00B4CC] rounded-[12px] flex items-center justify-center gap-3 text-white font-medium transition-all hover:opacity-90"
            >
              <span>Xidmət əlavə et</span>
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-7 p-7 rounded-[12px] bg-white border border-[#ececed] animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-[#ececed] pb-3">
              <h3 className="text-[20px] font-semibold leading-[30px]">Xidmət əlavə et</h3>
              <button 
                onClick={() => setIsCreatingService(false)}
                className="flex items-center justify-center text-[#1F2937] hover:opacity-70 transition-opacity"
                title="Bağla"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[16px] leading-[24px]">Xidmət adı</label>
              <div className="h-[60px] bg-[#fafafa] border border-[#ececed] rounded-[12px] flex items-center px-4">
                <input
                  type="text"
                  value={pendingService || ""}
                  onChange={(e) => setPendingService(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmService()}
                  placeholder="Məs: Pilates"
                  className="bg-transparent w-full h-full outline-none text-[18px] leading-[28px]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConfirmService}
                disabled={createServiceMutation.isPending}
                className="h-[48px] w-[193px] bg-[#00B4CC] rounded-[12px] flex items-center justify-center text-[#fafafa] text-[16px] font-medium transition-all hover:opacity-90 shadow-sm"
              >
                {createServiceMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : "Əlavə et"}
              </button>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-4">
            {allServices?.map((svc) => {
              const isSelected = packageServices[activePackage]?.includes(svc.name);

              return (
                <div
                  key={svc.id}
                  onClick={() => toggleServiceSelection(svc.name)}
                  className={cn(
                    "h-[56px] rounded-lg px-4 flex items-center gap-4 cursor-pointer transition-all border flex-shrink-0",
                    isSelected
                      ? "bg-[#00b4cc0a] border-[#00b4cc]"
                      : "bg-[#fafafa] border-[#ececed]"
                  )}
                >
                  <span className="text-[16px] font-medium text-black leading-[24px] whitespace-nowrap">
                    {svc.name}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteService(svc.id, e)}
                    disabled={deleteServiceMutation.isPending}
                    className="w-6 h-6 flex items-center justify-center transition-opacity hover:opacity-80 flex-shrink-0 ml-1"
                    title="Xidməti sil"
                  >
                    <Image src="/trash.png" width={20} height={20} alt="Sil" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Footer Buttons */}
      <div className="flex items-center justify-end mt-4">
        <button
          onClick={handleNext}
          disabled={savingStep6}
          className="h-[48px] w-[280px] rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-100"
        >
          {savingStep6 && <Loader2 className="w-4 h-4 animate-spin" />}
          Növbəti
        </button>
      </div>

      {showErrorModal && (
        <ErrorToastModal 
          message={errorMessage} 
          onClose={() => setShowErrorModal(false)} 
        />
      )}
    </div>
  );
}
