"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Plus, Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useCreateGymStep6, useCreateSupportedService, useDeleteSupportedService, useUpdateGymSubscriptions, useGymSubscriptionsAdmin } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { ServiceSelectorModal } from "../modals/service-selector-modal";
import { ConfirmDeleteModal } from "../modals/confirm-delete-modal";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";

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

export function PlansTab({ gym }: { gym?: any }) {
  const { gymId } = useGymStore();
  const { data: adminSubs, isLoading: subsLoading } = useGymSubscriptionsAdmin(gymId);
  const { data: allServices } = useSupportedServices(gymId ? Number(gymId) : undefined);
  const createServiceMutation = useCreateSupportedService();
  const deleteServiceMutation = useDeleteSupportedService();
  const { mutate: updateSubscriptions, isPending: savingUpdate } = useUpdateGymSubscriptions();

  const initialData = useMemo(() => {
    const selected = new Set<Package>();
    const prcs: Record<Package, string> = { Bronze: "", Silver: "", Gold: "", Platinum: "" };
    const svcs: Record<Package, string[]> = { Bronze: [], Silver: [], Gold: [], Platinum: [] };

    const sourceData = adminSubs?.subscriptions || gym?.supportedSubscriptions;

    if (sourceData) {
      sourceData.forEach((sub: any) => {
        const pkgName = sub.packageName as Package;
        if (PACKAGES.includes(pkgName)) {
          selected.add(pkgName);
          prcs[pkgName] = String(sub.dailyPrice || "");
          svcs[pkgName] = (sub.benefits || [])
            .map((b: any) => b.name)
            .filter(Boolean);
        }
      });
    }

    return {
      selected: selected.size > 0 ? selected : new Set<Package>(["Platinum"]),
      prices: prcs,
      services: svcs
    };
  }, [gym, adminSubs]);

  const [activePackage, setActivePackage] = useState<Package>("Platinum");
  const [selectedPackages, setSelectedPackages] = useState<Set<Package>>(initialData.selected);
  const [prices, setPrices] = useState<Record<Package, string>>(initialData.prices);
  const [packageServices, setPackageServices] = useState<Record<Package, string[]>>(initialData.services);
  const [hasSynced, setHasSynced] = useState(false);
  const [pendingService, setPendingService] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);

  // Sync state when gym data arrives
  useEffect(() => {
    const sourceData = adminSubs?.subscriptions || gym?.supportedSubscriptions;
    if (sourceData && !hasSynced) {
      setSelectedPackages(initialData.selected);
      setPrices(initialData.prices);
      setPackageServices(initialData.services);
      setHasSynced(true);
    }
  }, [gym?.supportedSubscriptions, adminSubs, initialData, hasSynced]);

  if (subsLoading) {
    return (
      <div className="flex-1 py-20 flex flex-col justify-center items-center text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={32} />
        <span className="font-medium">Abunəliklər yüklənir...</span>
      </div>
    );
  }

  const togglePackage = (pkg: Package) => {
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
      await createServiceMutation.mutateAsync({
        name: pendingService.trim(),
        gymId: gymId ? Number(gymId) : undefined
      });

      setPendingService(null);
      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err?.message || "Xidmət yaradıla bilmədi");
    }
  };



  const handleDeleteFromGym = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!deleteServiceId) return;

    try {
      await deleteServiceMutation.mutateAsync(deleteServiceId);
      setDeleteServiceId(null);
      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err?.message || "Xidmət silinərkən xəta baş verdi");
    }
  };

  const toggleServiceSelection = (svcName: string) => {
    setPackageServices(prev => {
      const currentServices = prev[activePackage] || [];
      const isSelected = currentServices.some(
        s => s.trim().toLowerCase() === svcName.trim().toLowerCase()
      );
      
      if (isSelected) {
        return { 
          ...prev, 
          [activePackage]: currentServices.filter(
            s => s.trim().toLowerCase() !== svcName.trim().toLowerCase()
          ) 
        };
      } else {
        return { ...prev, [activePackage]: [...currentServices, svcName] };
      }
    });
  };

  const handleSave = () => {
    if (!gymId) return toast.error("Zal ID tapılmadı");

    const PACKAGE_IDS: Record<Package, number> = {
      Bronze: 1, Silver: 2, Gold: 3, Platinum: 4,
    };

    const subscriptions = Array.from(selectedPackages).map(pkg => {
      // Get service names from state, fall back to gym benefits if state is empty
      let serviceNames = packageServices[pkg] || [];
      if (serviceNames.length === 0 && gym?.supportedSubscriptions) {
        const sub = gym.supportedSubscriptions.find((s: any) => s.packageName === pkg);
        if (sub?.benefits) {
          serviceNames = sub.benefits.map((b: any) => b.description).filter(Boolean);
        }
      }

      const serviceIds = serviceNames.map(name => {
        const found = allServices?.find(s =>
          s.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
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

    updateSubscriptions({
      id: Number(gymId),
      payload: { subscriptions }
    }, {
      onSuccess: () => {
        setShowSuccessModal(true);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || "Xəta baş verdi");
      }
    });
  };

  const gradients: Record<Package, string> = {
    Bronze: "linear-gradient(111.92deg, #d8a673, #b97a3c 99.99%)",
    Silver: "linear-gradient(106.25deg, #e5e8ec, #9baac7)",
    Gold: "linear-gradient(104.88deg, #e7b75f, #f8d57e)",
    Platinum: "linear-gradient(99.99deg, #313131, #515254 40.45%, #5b5b5d 55.32%, #565857)",
  };

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
                style={{ background: gradients[pkg] }}
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
        <div className="border-b border-[#ececed] pb-1">
          <h2 className="text-[20px] font-semibold leading-[30px]">
            {activePackage} paketə daxil olan xidmətlər
          </h2>
        </div>

        {/* Add Service Section (Frame Group) */}
        <div className="flex flex-col gap-7 p-7 rounded-[12px] bg-white border border-[#ececed]">
          <div className="border-b border-[#ececed] pb-1">
            <h3 className="text-[20px] font-semibold leading-[30px]">Xidmət əlavə et</h3>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[16px] leading-[24px]">Xidmət adı</label>
            <div className="h-[60px] bg-[#fafafa] border border-[#ececed] rounded-[12px] flex items-center px-3">
              <input
                type="text"
                value={pendingService || ""}
                onChange={(e) => setPendingService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmService()}
                placeholder="Məs: Pilates"
                className="bg-transparent w-full h-full outline-none text-[18px] leading-[28px]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleConfirmService}
              disabled={createServiceMutation.isPending}
              className="h-[48px] w-[193px] bg-[#00B4CC] rounded-[12px] flex items-center justify-center text-[#fafafa] text-[16px] transition-all hover:opacity-90 shadow-sm"
            >
              {createServiceMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : "Əlavə et"}
            </button>
          </div>
        </div>

        {/* Services List (Frame Container) */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {allServices?.map((svc) => {
              // Check state first, then fall back to gym benefits data
              const stateSelected = packageServices[activePackage]?.includes(svc.name);
              const gymBenefits = gym?.supportedSubscriptions?.find(
                (s: any) => s.packageName === activePackage
              )?.benefits || [];
              const gymSelected = gymBenefits.some(
                (b: any) => b.description?.trim().toLowerCase() === svc.name?.trim().toLowerCase()
              );
              const isSelected = stateSelected || gymSelected;

              return (
                <div
                  key={svc.id}
                  onClick={() => toggleServiceSelection(svc.name)}
                  className={cn(
                    "h-[64px] rounded-lg px-3 flex items-center justify-between gap-5 cursor-pointer transition-all border",
                    isSelected
                      ? "bg-[#00b4cc0a] border-[#00b4cc]"
                      : "bg-[#fafafa] border-[#ececed]"
                  )}
                >
                  <div className="flex items-center overflow-hidden">
                    <span className="text-[16px] font-medium text-black truncate leading-[24px]">
                      {svc.name}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteServiceId(svc.id);
                    }}
                    className="w-6 h-6 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                  >
                    <Image src="/icons/trash.svg" width={24} height={24} alt="Delete" />
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
          onClick={handleSave}
          disabled={savingUpdate}
          className="h-[48px] w-[280px] rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-100"
        >
          {savingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
          Yadda saxla
        </button>
      </div>

      {deleteServiceId !== null && (
        <ConfirmDeleteModal
          name={allServices?.find(s => s.id === deleteServiceId)?.name || "Xidmət"}
          onConfirm={() => handleDeleteFromGym()}
          onCancel={() => setDeleteServiceId(null)}
          isLoading={deleteServiceMutation.isPending}
        />
      )}

      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Abunəlik məlumatları uğurla yeniləndi!"
      />
    </div>
  );
}
