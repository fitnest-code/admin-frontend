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
import { useT } from "@/lib/i18n";

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
  const t = useT();
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
  const [isCreatingService, setIsCreatingService] = useState(false);

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
        <span className="font-medium">{t.plans.loading}</span>
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
      toast.error(err?.message || t.plans.serviceCreateFailed);
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
      toast.error(err?.message || t.plans.serviceDeleteFailed);
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
    if (!gymId) return toast.error(t.plans.gymIdNotFound);

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
      return toast.error(t.plans.selectAtLeastOne);
    }

    updateSubscriptions({
      id: Number(gymId),
      payload: { subscriptions }
    }, {
      onSuccess: () => {
        setShowSuccessModal(true);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || t.plans.genericError);
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
      <div className="bg-white rounded-[12px] border border-[#ececed] p-5 flex flex-col gap-5 shadow-sm">
        <div className="border-b border-[#ececed] pb-2">
          <h2 className="text-[18px] font-semibold leading-[28px]">{t.plans.gymSubscriptions}</h2>
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
                  "relative h-[56px] rounded-[28px] flex items-center px-5 cursor-pointer transition-all duration-300",
                  isActive ? "scale-[1.03] shadow-lg ring-2 ring-[#00B4CC]" : "hover:scale-[1.01] shadow-sm",
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
                  "ml-3 text-[16px] tracking-tight",
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
      <div className="bg-white rounded-[12px] border border-[#ececed] p-5 flex flex-col gap-5 shadow-sm">
        <div className="border-b border-[#ececed] pb-2">
          <h2 className="text-[18px] font-semibold leading-[28px]">{t.plans.entrancePrice}</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-black/60 font-medium">{t.plans.entrancePriceAzn}</label>
          <div className="h-[44px] w-full max-w-[320px] bg-[#fafafa] border border-[#ececed] rounded-lg flex items-center px-4">
            <input
              type="number"
              value={prices[activePackage] || ""}
              onChange={(e) => setPrices(prev => ({ ...prev, [activePackage]: e.target.value }))}
              className="bg-transparent w-full h-full outline-none text-[15px] font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
            <span className="text-black/40 font-bold ml-2 text-sm">AZN</span>
          </div>
        </div>
      </div>

      {/* 3. Services Section */}
      <div className="bg-white rounded-[12px] border border-[#ececed] p-5 flex flex-col gap-6 shadow-sm">
        {/* Add Service Section (Frame Group) */}
        {!isCreatingService ? (
          <div className="flex items-center justify-between border-b border-[#ececed] pb-2 animate-in fade-in duration-300">
            <h2 className="text-[18px] font-semibold leading-[28px]">
              {activePackage} {t.plans.includedServices}
            </h2>
            <button
              onClick={() => setIsCreatingService(true)}
              className="h-[40px] px-4 bg-[#00B4CC] rounded-lg flex items-center justify-center gap-2 text-white text-sm font-medium transition-all hover:opacity-90"
            >
              <span>{t.plans.addService}</span>
              <Plus size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-5 rounded-xl bg-white border border-[#ececed] animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
              <h3 className="text-[18px] font-semibold leading-[28px]">{t.plans.addService}</h3>
              <button 
                onClick={() => setIsCreatingService(false)}
                className="flex items-center justify-center text-[#1F2937] hover:opacity-70 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] leading-[20px]">{t.plans.serviceName}</label>
              <div className="h-[44px] bg-[#fafafa] border border-[#ececed] rounded-lg flex items-center px-3">
                <input
                  type="text"
                  value={pendingService || ""}
                  onChange={(e) => setPendingService(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmService()}
                  placeholder={t.plans.exampleService}
                  className="bg-transparent w-full h-full outline-none text-[15px] leading-[24px]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConfirmService}
                disabled={createServiceMutation.isPending}
                className="h-[40px] w-[160px] bg-[#00B4CC] rounded-lg flex items-center justify-center text-[#fafafa] text-sm transition-all hover:opacity-90 shadow-sm"
              >
                {createServiceMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : t.plans.add}
              </button>
            </div>
          </div>
        )}

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
                    "h-[48px] rounded-lg px-3 flex items-center justify-between gap-3 cursor-pointer transition-all border",
                    isSelected
                      ? "bg-[#00b4cc0a] border-[#00b4cc]"
                      : "bg-[#fafafa] border-[#ececed]"
                  )}
                >
                  <div className="flex items-center overflow-hidden">
                    <span className="text-[14px] font-medium text-black truncate leading-[20px]">
                      {svc.name}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteServiceId(svc.id);
                    }}
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                  >
                    <Trash2 size={16} />
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
          className="h-[40px] w-[240px] rounded-lg bg-[#00B4CC] text-white text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-100"
        >
          {savingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
          {t.plans.save}
        </button>
      </div>

      {deleteServiceId !== null && (
        <ConfirmDeleteModal
          name={allServices?.find(s => s.id === deleteServiceId)?.name || t.plans.service}
          onConfirm={() => handleDeleteFromGym()}
          onCancel={() => setDeleteServiceId(null)}
          isLoading={deleteServiceMutation.isPending}
        />
      )}

      <SuccessAnimationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t.plans.successUpdated}
      />
    </div>
  );
}
