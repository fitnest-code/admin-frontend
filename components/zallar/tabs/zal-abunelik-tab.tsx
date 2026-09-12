"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useSupportedServices, 
  useCreateSupportedService, 
  useDeleteSupportedService, 
  useGymDetailsAdmin,
  useGymSubscriptionsAdmin,
  useUpdateGymSubscriptions
} from "@/lib/query/gym-query";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import { GymCreateStep6RequestV2 } from "@/lib/types/gym";
import { toast } from "sonner";
import Image from "next/image";
import { ErrorToastModal } from "../../categories/modals/error-toast-modal";
import styles from "../../gyms/wizard/step-plans.module.css";

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return "";
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("blob:") || urlOrFsId.startsWith("/")) return urlOrFsId;
  return `/api/v1/media/stream/${urlOrFsId}`;
};

export function ZalAbunelikTab({ gymId }: { gymId: string | number }) {
  const parsedGymId = Number(gymId);
  const { data: gymDetails, isLoading: detailsLoading } = useGymDetailsAdmin(parsedGymId);
  const { data: subscriptionData, isLoading: subsLoading } = useGymSubscriptionsAdmin(parsedGymId);
  const { data: allPackageNames, isLoading: packagesLoading } = useSubscriptionPackages();

  const selectedCategoryIds = useMemo(() => {
    if (!gymDetails) return [];
    return gymDetails.categories?.map(c => c.id) || [];
  }, [gymDetails]);

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const PACKAGES = useMemo(() => allPackageNames?.map(p => p.name) || [], [allPackageNames]);

  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [activePackage, setActivePackage] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [packageServices, setPackageServices] = useState<Record<string, string[]>>({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [customServicesList, setCustomServicesList] = useState<string[]>([]);
  const [pendingIcon, setPendingIcon] = useState<File | null>(null);
  const [customIcons, setCustomIcons] = useState<Record<string, File>>({});
  const { data: allServices } = useSupportedServices(parsedGymId);

  const servicesToRender = useMemo(() => {
    const apiServices = allServices || [];
    const localServices = customServicesList.map((name, idx) => ({
      id: -(idx + 1),
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

  // Sync API subscriptions to edit state whenever the server payload changes.
  useEffect(() => {
    if (!allPackageNames || allPackageNames.length === 0) return;
    if (!subscriptionData) return;
    if (allServices === undefined) return;

    const pkgs = new Set<string>();
    const prcs: Record<string, string> = {};
    const svcs: Record<string, string[]> = {};
    const localCustoms = new Set<string>();

    subscriptionData.subscriptions.forEach(s => {
      const found = allPackageNames.find(p => p.id === s.packageId);
      if (found) {
        const key = `${s.categoryId}_${found.name}`;
        pkgs.add(key);
        prcs[key] = s.dailyPrice.toString();

        const names = s.benefits?.map(b => b.name) || [];
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
  }, [allPackageNames, allServices, subscriptionData, selectedCategoryIds]);

  const [pendingService, setPendingService] = useState<string | null>(null);
  const createServiceMutation = useCreateSupportedService();
  const updateSubscriptionsMutation = useUpdateGymSubscriptions();

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
    try {
      const res = await createServiceMutation.mutateAsync({
        payload: {
          name: trimmedName,
          gymId: parsedGymId
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
      toast.success("Xidmət uğurla yaradıldı");
    } catch (err: any) {
      setErrorMessage(err?.message || "Xidmət yaradıla bilmədi");
      setShowErrorModal(true);
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
    e.stopPropagation();
    try {
      await deleteServiceMutation.mutateAsync(id);
      toast.success("Xidmət silindi");
    } catch (err: any) {
      setErrorMessage("Xidməti silmək mümkün olmadı");
      setShowErrorModal(true);
    }
  };

  const handleSave = async () => {
    if (!allPackageNames) return;

    const subscriptions = Array.from(selectedPackages).map(key => {
      const index = key.indexOf('_');
      const catId = Number(key.substring(0, index));
      const pkgName = key.substring(index + 1);

      const pkgInfo = allPackageNames.find(p => p.name === pkgName);
      const serviceNames = packageServices[key] || [];
      const serviceIds: number[] = [];
      const customServices: string[] = [];

      serviceNames.forEach(name => {
        const found = allServices?.find(s => s.name === name);
        if (found && found.id > 0) {
          serviceIds.push(found.id);
        } else {
          customServices.push(name);
        }
      });

      return {
        packageId: pkgInfo?.id || 0,
        categoryId: catId,
        dailyPrice: Number(prices[key]) || 0,
        supportedServicesId: serviceIds,
        customServices: customServices
      };
    });

    try {
      const payload: GymCreateStep6RequestV2 = { subscriptions };
      await updateSubscriptionsMutation.mutateAsync({ id: parsedGymId, payload });
      toast.success("Abunəlik qiymətləri və paketləri uğurla yeniləndi");
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || "Məlumatları saxlamaq mümkün olmadı");
      setShowErrorModal(true);
    }
  };

  const isPageLoading = detailsLoading || subsLoading || packagesLoading;

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={24} />
        <span>Abunəliklər yüklənir...</span>
      </div>
    );
  }

  const activePriceKey = activeCategoryId !== null ? `${activeCategoryId}_${activePackage}` : "";

  return (
    <div className={styles.frameParent} style={{ padding: "0" }}>
      <div className={styles.frameGroup}>
        {/* Category & Package Selection Container */}
        <div className={styles.frameContainer}>
          {/* Category Tabs */}
          {selectedCategoryIds.length > 0 && (
            <div className={styles.kateqoriyaSeimiParent}>
              <div className={styles.kateqoriyaSeimi}>Kateqoriya seçimi</div>
              <div className={styles.component42Parent}>
                {selectedCategoryIds.map((catId: number) => {
                  const catName = gymDetails?.categories?.find(c => c.id === catId)?.name || `Kateqoriya ${catId}`;
                  const isActive = activeCategoryId === catId;
                  return (
                    <div
                      key={catId}
                      onClick={() => {
                        setActiveCategoryId(catId);
                        if (PACKAGES.length > 0 && !activePackage) {
                          setActivePackage(PACKAGES[0]);
                        }
                      }}
                      className={isActive ? styles.component42 : styles.component422}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.yoga} style={{ color: isActive ? "#fff" : "#00b4cc" }}>
                        {catName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subscription Package Label */}
          <div className={styles.zalaAidOlanAbunliklrWrapper}>
            <div className={styles.zalaAidOlan}>Zala aid olan abunəliklər</div>
          </div>

          {/* Subscription Package Selector Cards Grid */}
          <div className={styles.component20Parent}>
            {PACKAGES.map((pkg) => {
              const key = activeCategoryId !== null ? `${activeCategoryId}_${pkg}` : "";
              const isSelected = selectedPackages.has(key);
              const isActive = activePackage === pkg;

              let cardClass = styles.component20;
              if (pkg === "Silver") cardClass = styles.component202;
              else if (pkg === "Gold") cardClass = styles.component203;
              else if (pkg === "Platinum") cardClass = styles.component204;

              return (
                <div
                  key={pkg}
                  onClick={() => setActivePackage(pkg)}
                  className={cn(
                    cardClass,
                    isActive && "ring-4 ring-[#00B4CC] ring-offset-2 scale-[1.02]"
                  )}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePackage(pkg);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer",
                      isSelected ? "bg-white border-white" : "bg-transparent border-white/70"
                    )}
                  >
                    {isSelected && <Check className="text-black w-4 h-4 stroke-[4]" />}
                  </div>

                  <b className={cn(
                    styles.bronze,
                    "ml-3 text-[16px] tracking-tight",
                    pkg === "Platinum" ? "text-white" : "text-white drop-shadow-md"
                  )}>
                    {pkg}
                  </b>
                </div>
              );
            })}
          </div>
        </div>

        {/* Entrance Price Container */}
        <div className={styles.frameDiv}>
          <div className={styles.zalaAidOlanAbunliklrWrapper}>
            <div className={styles.zalaAidOlan}>Giriş qiyməti</div>
          </div>
          <div className={styles.giriQiymtiParent}>
            <div className={styles.giriQiymti2}>Giriş qiyməti</div>
            <div className={styles.frameWrapper}>
              <input
                type="number"
                value={activePriceKey ? (prices[activePriceKey] || "") : ""}
                onChange={(e) => {
                  if (activePriceKey) {
                    setPrices(prev => ({ ...prev, [activePriceKey]: e.target.value }));
                  }
                }}
                className="bg-transparent w-full h-full outline-none text-[18px] font-semibold text-center"
                placeholder="0.00"
              />
              <span className="text-black/40 font-bold ml-2 text-sm">AZN</span>
            </div>
          </div>
        </div>

        {/* Package Specific Services Container */}
        <div className={styles.frameParent2}>
          <div className={styles.platiniumPaketDaxilOlanXiParent}>
            <div className={styles.zalaAidOlan}>{activePackage} paketə daxil olan xidmətlər</div>
            {!isCreatingService && (
              <div
                onClick={() => setIsCreatingService(true)}
                className={styles.searchInput}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.xidmtLavEt}>Xidmət əlavə et</div>
                <div className={styles.square}>
                  <Plus className="text-white w-6 h-6 stroke-[3]" />
                </div>
              </div>
            )}
          </div>

          {isCreatingService && (
            <div className="flex flex-col gap-5 p-5 rounded-xl bg-white border border-[#ececed] w-full animate-in fade-in duration-300">
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

          <div className={styles.frameParent3}>
            <div className={styles.xidmetParent}>
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
                    className={isSelected ? styles.xidmet : styles.xidmet3}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.frameParent6}>
                      <div className={styles.textWrapper}>
                        {iconUrl && (
                          <img
                            src={getImageUrl(iconUrl)}
                            alt={svc.name}
                            className="w-5 h-5 object-contain rounded shrink-0 mr-2"
                          />
                        )}
                        <div className={styles.xidmtLavEt}>{svc.name}</div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => handleDeleteService(svc.id, svc.name, e)}
                        disabled={deleteServiceMutation.isPending}
                        className="w-6 h-6 flex items-center justify-center transition-opacity hover:opacity-80 flex-shrink-0"
                        title="Xidməti sil"
                      >
                        <Image src="/trash.png" width={20} height={20} alt="Sil" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Save Changes Button */}
      <div className="flex items-center justify-end gap-3 border-t border-[#ececed] pt-6 mt-8">
        <button
          onClick={handleSave}
          disabled={updateSubscriptionsMutation.isPending}
          className="h-[40px] px-8 rounded-lg bg-[#00B4CC] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
        >
          {updateSubscriptionsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Yadda saxla
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
