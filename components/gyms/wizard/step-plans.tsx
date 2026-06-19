"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useValidateGymStep6, useCreateSupportedService, useDeleteSupportedService, useCategories } from "@/lib/query/gym-query";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import { GymCreateStep6RequestV2 } from "@/lib/types/gym";
import { toast } from "sonner";
import Image from "next/image";
import { ErrorToastModal } from "../../categories/modals/error-toast-modal";

const gradientsMap: Record<string, string> = {
  Bronze: "linear-gradient(111.92deg, #d8a673, #b97a3c 99.99%)",
  Silver: "linear-gradient(106.25deg, #e5e8ec, #9baac7)",
  Gold: "linear-gradient(104.88deg, #e7b75f, #f8d57e)",
  Platinum: "linear-gradient(99.99deg, #313131, #515254 40.45%, #5b5b5d 55.32%, #565857)",
};

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return "";
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("blob:") || urlOrFsId.startsWith("/")) return urlOrFsId;
  return `/api/v1/media/stream/${urlOrFsId}`;
};

export function StepPlans({ onNext }: { onNext: () => void }) {
  const { step6Data, setStep6Data, gymId, step1Data } = useGymStore();
  const { data: allPackageNames, isLoading: packagesLoading } = useSubscriptionPackages();
  const { data: categoriesData } = useCategories();

  const selectedCategoryIds = useMemo(() => {
    return [
      ...(step1Data?.mainCategoryIds || []),
      ...(step1Data?.subCategoryIds || [])
    ];
  }, [step1Data]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const PACKAGES = useMemo(() => allPackageNames?.map(p => p.name) || [], [allPackageNames]);

  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [activePackage, setActivePackage] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [packageServices, setPackageServices] = useState<Record<string, string[]>>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [customServicesList, setCustomServicesList] = useState<string[]>([]);
  const [pendingIcon, setPendingIcon] = useState<File | null>(null);
  const [customIcons, setCustomIcons] = useState<Record<string, File>>({});
  const { data: allServices } = useSupportedServices(gymId ? Number(gymId) : undefined);

  const servicesToRender = useMemo(() => {
    const apiServices = allServices || [];
    const localServices = customServicesList.map((name, idx) => ({
      id: -(idx + 1), // unique negative ID
      name,
      gymId: undefined
    }));
    const apiServiceNames = new Set(apiServices.map(s => s.name.toLowerCase()));
    const filteredLocal = localServices.filter(ls => !apiServiceNames.has(ls.name.toLowerCase()));
    return [...apiServices, ...filteredLocal];
  }, [allServices, customServicesList]);

  // Set default active category
  useEffect(() => {
    if (selectedCategoryIds.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(selectedCategoryIds[0]);
    }
  }, [selectedCategoryIds, activeCategoryId]);

  // Robust State Synchronization (supporting V2 categoryId)
  useEffect(() => {
    if (!allPackageNames || allPackageNames.length === 0 || hasSynced) return;

    if (step6Data) {
      if (allServices === undefined) return; // Wait for supported services to load to resolve IDs
      
      const pkgs = new Set<string>();
      const prcs: Record<string, string> = {};
      const svcs: Record<string, string[]> = {};
      
      const localCustoms = new Set<string>();

      step6Data.subscriptions.forEach(s => {
        const found = allPackageNames.find(p => p.id === s.packageId);
        if (found) {
          const key = `${s.categoryId}_${found.name}`;
          pkgs.add(key);
          prcs[key] = s.dailyPrice.toString();
          const names: string[] = [];
          if (s.supportedServicesId && allServices) {
            const resolvedNames = s.supportedServicesId
              .map((id: number) => allServices.find(as => as.id === id)?.name)
              .filter((name: string | undefined): name is string => !!name);
            names.push(...resolvedNames);
          }
          if (s.customServices) {
            names.push(...s.customServices);
            s.customServices.forEach((cs: string) => localCustoms.add(cs));
          }
          svcs[key] = names;
        }
      });

      setSelectedPackages(pkgs);
      const firstActiveKey = pkgs.size > 0 ? Array.from(pkgs)[0] : "";
      if (firstActiveKey) {
        const index = firstActiveKey.indexOf('_');
        const firstActiveCat = Number(firstActiveKey.substring(0, index));
        const firstActivePkg = firstActiveKey.substring(index + 1);
        setActiveCategoryId(firstActiveCat);
        setActivePackage(firstActivePkg);
      } else {
        if (selectedCategoryIds.length > 0) setActiveCategoryId(selectedCategoryIds[0]);
        setActivePackage(allPackageNames[0].name);
      }
      setPrices(prcs);
      setPackageServices(svcs);
      if (localCustoms.size > 0) {
        setCustomServicesList(Array.from(localCustoms));
      }
      setHasSynced(true);
    } else {
      if (selectedCategoryIds.length > 0) {
        const firstCatId = selectedCategoryIds[0];
        setActiveCategoryId(firstCatId);
        const firstPkg = allPackageNames[0].name;
        setSelectedPackages(new Set([`${firstCatId}_${firstPkg}`]));
        setActivePackage(firstPkg);
      }
      setPrices({});
      setPackageServices({});
      setHasSynced(true);
    }
  }, [allPackageNames, allServices, step6Data, hasSynced, PACKAGES, selectedCategoryIds]);
  
  const [pendingService, setPendingService] = useState<string | null>(null);
  const createServiceMutation = useCreateSupportedService();
  const validateStep6 = useValidateGymStep6();

  const togglePackage = (pkg: string) => {
    if (activeCategoryId === null) return;
    const key = `${activeCategoryId}_${pkg}`;
    setSelectedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleConfirmService = async () => {
    if (!pendingService || !pendingService.trim()) {
      setPendingService(null);
      return;
    }

    const trimmedName = pendingService.trim();

    if (!gymId) {
      // Local addition
      const alreadyExists = servicesToRender.some(s => s.name.toLowerCase() === trimmedName.toLowerCase());
      if (alreadyExists) {
        setErrorMessage("Bu xidmət artıq mövcuddur");
        setShowErrorModal(true);
        return;
      }
      
      setCustomServicesList(prev => [...prev, trimmedName]);
      if (pendingIcon) {
        setCustomIcons(prev => ({ ...prev, [trimmedName]: pendingIcon }));
      }
      if (activePackage && activeCategoryId !== null) {
        const key = `${activeCategoryId}_${activePackage}`;
        setPackageServices(prev => {
          const current = prev[key] || [];
          if (!current.includes(trimmedName)) {
            return { ...prev, [key]: [...current, trimmedName] };
          }
          return prev;
        });
      }
      setPendingService(null);
      setPendingIcon(null);
      setIsCreatingService(false);
    } else {
      // API call since gymId exists
      try {
        const res = await createServiceMutation.mutateAsync({
          payload: {
            name: trimmedName,
            gymId: Number(gymId)
          },
          icon: pendingIcon || undefined
        });
        
        const createdName = res?.name || trimmedName;
        if (activePackage && activeCategoryId !== null) {
          const key = `${activeCategoryId}_${activePackage}`;
          setPackageServices(prev => {
            const current = prev[key] || [];
            if (!current.includes(createdName)) {
              return { ...prev, [key]: [...current, createdName] };
            }
            return prev;
          });
        }

        setPendingService(null);
        setPendingIcon(null);
        setIsCreatingService(false);
      } catch (err: any) {
        setErrorMessage(err?.message || "Xidmət yaradıla bilmədi");
        setShowErrorModal(true);
      }
    }
  };

  const toggleServiceSelection = (svcName: string) => {
    if (!activePackage || activeCategoryId === null) return;
    const key = `${activeCategoryId}_${activePackage}`;
    setPackageServices(prev => {
      const current = prev[key] || [];
      const isSelected = current.includes(svcName);
      if (isSelected) {
        return { ...prev, [key]: current.filter(s => s !== svcName) };
      } else {
        return { ...prev, [key]: [...current, svcName] };
      }
    });
  };

  const deleteServiceMutation = useDeleteSupportedService();
  const handleDeleteService = async (id: number, svcName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering service selection toggle
    if (id < 0) {
      // Local deletion
      setCustomServicesList(prev => prev.filter(name => name !== svcName));
      setPackageServices(prev => {
        const updated: Record<string, string[]> = {};
        Object.keys(prev).forEach(key => {
          updated[key] = prev[key].filter(name => name !== svcName);
        });
        return updated;
      });
    } else {
      // API call since it's a persisted service
      try {
        await deleteServiceMutation.mutateAsync(id);
      } catch (err: any) {
        setErrorMessage("Xidməti silmək mümkün olmadı");
        setShowErrorModal(true);
      }
    }
  };

  const handleNext = async () => {
    if (!allPackageNames) return;

    const serviceIcons: File[] = [];
    const processedPackages = new Set<string>(); // unique key is packageId_categoryId to keep them separate

    const subscriptions = Array.from(selectedPackages).map(key => {
      const index = key.indexOf('_');
      const catId = Number(key.substring(0, index));
      const pkgName = key.substring(index + 1);

      const pkgInfo = allPackageNames.find(p => p.name === pkgName);
      const serviceNames = packageServices[key] || [];
      const serviceIds: number[] = [];
      const customServices: string[] = [];

      const pkgId = pkgInfo?.id || 0;
      const uniqKey = `${pkgId}_${catId}`;
      const isNewPackage = !processedPackages.has(uniqKey);
      if (isNewPackage) {
        processedPackages.add(uniqKey);
      }

      serviceNames.forEach(name => {
        const found = allServices?.find(s => s.name === name);
        if (found && found.id > 0) {
          serviceIds.push(found.id);
        } else {
          customServices.push(name);
          if (isNewPackage) {
            const file = customIcons[name];
            if (file) {
              serviceIcons.push(file);
            } else {
              const dummyFile = new File([new Blob([""], { type: "image/png" })], "empty.png", { type: "image/png" });
              serviceIcons.push(dummyFile);
            }
          }
        }
      });

      return {
        packageId: pkgId,
        categoryId: catId,
        dailyPrice: Number(prices[key]) || 0,
        supportedServicesId: serviceIds,
        customServices: customServices
      };
    });

    if (subscriptions.length === 0) {
      setErrorMessage("Ən azı bir abunəlik paketi seçilməlidir");
      setShowErrorModal(true);
      return;
    }

    try {
      const payload: GymCreateStep6RequestV2 = { subscriptions };
      await validateStep6.mutateAsync({ payload, serviceIcons });
      setStep6Data({ ...payload, serviceIcons });
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

  const activePriceKey = activeCategoryId !== null ? `${activeCategoryId}_${activePackage}` : "";

  return (
    <div className="w-full flex flex-col gap-9 font-sans text-black animate-in fade-in duration-500">
      
      {/* Category Selection Tabs */}
      {selectedCategoryIds.length > 1 && (
        <div className="bg-white rounded-[12px] border border-[#ececed] p-5 flex flex-col gap-3 shadow-sm">
          <label className="text-[14px] text-black/60 font-medium">Qiymət və xidmətləri hansı kateqoriya üçün tənzimləyirsiniz?</label>
          <div className="flex flex-wrap items-center gap-3 border-b border-[#ececed] pb-2">
            {selectedCategoryIds.map((catId: number) => {
              const catName = categoriesData?.items?.find(c => c.id === catId)?.name || `Kateqoriya ${catId}`;
              const isActive = activeCategoryId === catId;
              return (
                <button
                  key={catId}
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(catId);
                    if (PACKAGES.length > 0 && !activePackage) {
                      setActivePackage(PACKAGES[0]);
                    }
                  }}
                  className={cn(
                    "px-5 py-2 rounded-[32px] text-sm font-semibold transition-all border",
                    isActive
                      ? "bg-[#00B4CC] text-white border-[#00B4CC] shadow-sm"
                      : "bg-[#fafafa] text-slate-600 border-[#ececed] hover:bg-slate-50"
                  )}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Package Selector Section */}
      <div className="bg-white rounded-[12px] border border-[#ececed] p-5 flex flex-col gap-5 shadow-sm">
        <div className="border-b border-[#ececed] pb-2">
          <h2 className="text-[18px] font-semibold leading-[28px]">Zala aid olan abunəliklər</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PACKAGES.map((pkg) => {
            const key = activeCategoryId !== null ? `${activeCategoryId}_${pkg}` : "";
            const isSelected = selectedPackages.has(key);
            const isActive = activePackage === pkg;

            return (
              <div
                key={pkg}
                onClick={() => setActivePackage(pkg)}
                style={{ background: gradientsMap[pkg] || gradientsMap["Bronze"] }}
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
          <h2 className="text-[18px] font-semibold leading-[28px]">Giriş qiyməti</h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-black/60 font-medium">Giriş qiyməti (AZN)</label>
          <div className="h-[44px] w-full max-w-[320px] bg-[#fafafa] border border-[#ececed] rounded-lg flex items-center px-4">
            <input
              type="number"
              value={activePriceKey ? (prices[activePriceKey] || "") : ""}
              onChange={(e) => {
                if (activePriceKey) {
                  setPrices(prev => ({ ...prev, [activePriceKey]: e.target.value }));
                }
              }}
              className="bg-transparent w-full h-full outline-none text-[15px] font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
            />
            <span className="text-black/40 font-bold ml-2 text-sm">AZN</span>
          </div>
        </div>
      </div>

      {/* 3. Services Section */}
      <div className="bg-white rounded-[12px] border border-[#ececed] p-5 flex flex-col gap-6 shadow-sm">
        {/* Add Service Section Toggle / Form */}
        {!isCreatingService ? (
          <div className="flex items-center justify-between border-b border-[#ececed] pb-2 animate-in fade-in duration-300">
            <h3 className="text-[18px] font-semibold leading-[28px]">{activePackage} paketə daxil olan xidmətlər</h3>
            <button
              onClick={() => setIsCreatingService(true)}
              className="h-[40px] px-4 bg-[#00B4CC] rounded-lg flex items-center justify-center gap-2 text-white text-sm font-medium transition-all hover:opacity-90"
            >
              <span>Xidmət əlavə et</span>
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-5 rounded-xl bg-white border border-[#ececed] animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-[#ececed] pb-1">
              <h3 className="text-[18px] font-semibold leading-[28px]">Xidmət əlavə et</h3>
              <button 
                onClick={() => { setIsCreatingService(false); setPendingIcon(null); }}
                className="flex items-center justify-center text-[#1F2937] hover:opacity-70 transition-opacity"
                title="Bağla"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[20px]">Xidmət adı</label>
                <div className="h-[44px] bg-[#fafafa] border border-[#ececed] rounded-lg flex items-center px-3">
                  <input
                    type="text"
                    value={pendingService || ""}
                    onChange={(e) => setPendingService(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmService()}
                    placeholder="Məs: Pilates"
                    className="bg-transparent w-full h-full outline-none text-[15px] leading-[24px]"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[20px]">Xidmət ikonu</label>
                <div className="h-[44px] flex items-center gap-3">
                  <label className="h-full px-4 rounded-lg border border-[#ececed] bg-[#fafafa] flex items-center justify-center text-xs font-semibold text-black/60 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap">
                    Şəkil seçin
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPendingIcon(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {pendingIcon && (
                    <span className="text-[13px] text-[#00B4CC] font-medium truncate max-w-[150px]" title={pendingIcon.name}>
                      {pendingIcon.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleConfirmService}
                disabled={createServiceMutation.isPending}
                className="h-[40px] w-[160px] bg-[#00B4CC] rounded-lg flex items-center justify-center text-[#fafafa] text-sm font-medium transition-all hover:opacity-90 shadow-sm"
              >
                {createServiceMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Əlavə et"}
              </button>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-4">
            {servicesToRender.map((svc: any) => {
              const activeSvcKey = activePriceKey;
              const isSelected = activeSvcKey ? (packageServices[activeSvcKey]?.includes(svc.name)) : false;
              let iconUrl = svc.iconImageUrl || svc.iconUrl;
              if (!iconUrl && customIcons[svc.name]) {
                iconUrl = URL.createObjectURL(customIcons[svc.name]);
              }

              return (
                <div
                  key={svc.id}
                  onClick={() => toggleServiceSelection(svc.name)}
                  className={cn(
                    "h-[48px] rounded-lg px-3 flex items-center gap-3 cursor-pointer transition-all border flex-shrink-0",
                    isSelected
                      ? "bg-[#00b4cc0a] border-[#00b4cc]"
                      : "bg-[#fafafa] border-[#ececed]"
                  )}
                >
                  {iconUrl && (
                    <img
                      src={getImageUrl(iconUrl)}
                      alt={svc.name}
                      className="w-5 h-5 object-contain rounded shrink-0"
                    />
                  )}
                  <span className="text-[14px] font-medium text-black leading-[20px] whitespace-nowrap">
                    {svc.name}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteService(svc.id, svc.name, e)}
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
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => {
            const { resetStep6Data } = useGymStore.getState();
            resetStep6Data();
            setSelectedPackages(new Set());
            setPrices({});
            setPackageServices({});
            setCustomIcons({});
            setPendingIcon(null);
            if (selectedCategoryIds.length > 0) setActiveCategoryId(selectedCategoryIds[0]);
          }}
          className="h-[40px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition-colors"
        >
          Sıfırla
        </button>
        <button
          onClick={handleNext}
          disabled={savingStep6}
          className="h-[40px] w-[240px] rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
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
