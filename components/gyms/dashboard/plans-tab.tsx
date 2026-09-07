"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Check, Loader2, Trash2, X, Pencil, ImagePlus } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useSupportedServices, useCreateGymStep6, useCreateSupportedService, useUpdateSupportedService, useDeleteSupportedService, useUpdateGymSubscriptions, useGymSubscriptionsAdmin } from "@/lib/query/gym-query";
import { toast } from "sonner";
import { ServiceSelectorModal } from "../modals/service-selector-modal";
import { ConfirmDeleteModal } from "../modals/confirm-delete-modal";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { useT, useI18nStore } from "@/lib/i18n";
import { emptyLanguageRecord, useLanguages } from "@/lib/query/use-languages";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";

type Package = "Bronze" | "Silver" | "Gold" | "Platinum";

const PACKAGES: Package[] = ["Bronze", "Silver", "Gold", "Platinum"];

const packageStyles: Record<Package, { bg: string; text: string }> = {
  Bronze: { bg: "bg-orange-100", text: "text-orange-700" },
  Silver: { bg: "bg-slate-100", text: "text-slate-700" },
  Gold: { bg: "bg-amber-100", text: "text-amber-700" },
  Platinum: { bg: "bg-zinc-900", text: "text-white" },
};

const getImageUrl = (urlOrFsId: string | undefined | null) => {
  if (!urlOrFsId) return "";
  if (urlOrFsId.startsWith("http") || urlOrFsId.startsWith("blob:") || urlOrFsId.startsWith("/")) return urlOrFsId;
  return `/api/v1/media/stream/${urlOrFsId}`;
};

const DEFAULT_SERVICES = [
  { id: 1, name: "Base dərslər" },
  { id: 2, name: "Hovuz" },
  { id: 3, name: "Sauna" },
  { id: 4, name: "Dəsmal" },
];

const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  AZ: {
    serviceIcon: "Xidmət ikonu",
    selectImage: "Şəkil seçin",
    changeIcon: "İkonu dəyiş",
  },
  EN: {
    serviceIcon: "Service icon",
    selectImage: "Select image",
    changeIcon: "Change icon",
  },
  RU: {
    serviceIcon: "Иконка услуги",
    selectImage: "Выберите изображение",
    changeIcon: "Изменить иконку",
  },
};

export function PlansTab({ gym }: { gym?: any }) {
  const t = useT();
  const { languages } = useLanguages();
  const primaryLang = languages.includes("AZ") ? "AZ" : languages[0] ?? "AZ";
  const locale = useI18nStore((s) => s.locale);
  const lt = LOCAL_TRANSLATIONS[locale] || LOCAL_TRANSLATIONS.AZ;
  const queryClient = useQueryClient();
  const { gymId } = useGymStore();
  const { data: adminSubs, isLoading: subsLoading } = useGymSubscriptionsAdmin(gymId);
  const { data: allPackageNames } = useSubscriptionPackages();
  const { data: allServices } = useSupportedServices(gymId ? Number(gymId) : undefined);
  const createServiceMutation = useCreateSupportedService();
  const updateServiceMutation = useUpdateSupportedService();
  const deleteServiceMutation = useDeleteSupportedService();
  const { mutate: updateSubscriptions, isPending: savingUpdate } = useUpdateGymSubscriptions();
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const [iconTargetServiceId, setIconTargetServiceId] = useState<number | null>(null);

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
            .map((b: any) => b.name || b.description)
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
  const [pendingIcon, setPendingIcon] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceNames, setServiceNames] = useState<Record<string, string>>(() => emptyLanguageRecord(languages));
  const [serviceActiveTab, setServiceActiveTab] = useState<string>(primaryLang);
  const [isSavingTranslation, setIsSavingTranslation] = useState(false);

  // Sync state when gym data arrives
  useEffect(() => {
    const sourceData = adminSubs?.subscriptions || gym?.supportedSubscriptions;
    const hasData = adminSubs ? true : (gym?.supportedSubscriptions && gym.supportedSubscriptions.length > 0);
    if (hasData && !hasSynced) {
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
        payload: {
          name: pendingService.trim(),
          gymId: gymId ? Number(gymId) : undefined
        },
        icon: pendingIcon || undefined
      });

      setPendingService(null);
      setPendingIcon(null);
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

  const handlePickServiceIcon = (serviceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setIconTargetServiceId(serviceId);
    iconFileInputRef.current?.click();
  };

  const handleServiceIconSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const serviceId = iconTargetServiceId;
    e.target.value = "";
    if (!file || !serviceId) {
      setIconTargetServiceId(null);
      return;
    }

    const service = allServices?.find((s) => s.id === serviceId);
    if (!service) {
      setIconTargetServiceId(null);
      return;
    }

    try {
      await updateServiceMutation.mutateAsync({
        id: serviceId,
        payload: {
          name: service.name,
          gymId: gymId ? Number(gymId) : service.gymId,
        },
        icon: file,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err?.message || t.plans.genericError);
    } finally {
      setIconTargetServiceId(null);
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
    if (allPackageNames) {
      allPackageNames.forEach((p) => {
        const name = p.name as Package;
        if (PACKAGES.includes(name)) {
          PACKAGE_IDS[name] = p.id;
        }
      });
    }

    const subscriptions = Array.from(selectedPackages).map(pkg => {
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

      // Resolve categoryId: use existing subscription's categoryId, or fall back to gym's first category
      const existingSub = adminSubs?.subscriptions?.find((s: any) => s.packageName === pkg);
      const categoryId: number =
        existingSub?.categoryId ??
        gym?.categories?.[0]?.id ??
        gym?.categoryId ??
        null;

      return {
        packageId: PACKAGE_IDS[pkg],
        categoryId,
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
        setHasSynced(false);
        setShowSuccessModal(true);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || err?.message || t.plans.genericError);
      }
    });
  };

  const handleEditServiceTranslation = async (svc: any) => {
    setEditingServiceId(svc.id);
    setServiceActiveTab(primaryLang);
    setServiceNames(emptyLanguageRecord(languages, { [primaryLang]: svc.name }));
    try {
      const res = await apiGet<any[]>('/admin/translations', {
        params: { entityType: 'SUPPORTED_SERVICE', entityId: String(svc.id), fieldName: 'name' }
      });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      const newNames = emptyLanguageRecord(languages, { [primaryLang]: svc.name });
      list.forEach((item: any) => {
        if (item.languageCode && item.fieldName === "name") {
          const lang = String(item.languageCode).toUpperCase();
          if (languages.includes(lang)) {
            newNames[lang] = item.fieldValue || "";
          }
        }
      });
      setServiceNames(newNames);
    } catch (e) { console.error("Failed to fetch service translations:", e); }
  };

  const handleSaveServiceTranslation = async () => {
    if (!editingServiceId) return;
    setIsSavingTranslation(true);
    try {
      const payload = Object.entries(serviceNames)
        .filter(([lang, val]) => lang !== primaryLang && val.trim() !== "")
        .map(([lang, val]) => ({
          entityType: "SUPPORTED_SERVICE",
          entityId: String(editingServiceId),
          fieldName: "name",
          languageCode: lang,
          fieldValue: val.trim(),
        }));
      if (payload.length > 0) {
        await apiPost("/admin/translations/bulk", payload);
      }
      setEditingServiceId(null);
      toast.success(locale === 'RU' ? 'Переводы сохранены' : locale === 'EN' ? 'Translations saved' : 'Tərcümələr yadda saxlanıldı');
    } catch (e: any) {
      toast.error(e?.message || "Error saving translations");
    } finally {
      setIsSavingTranslation(false);
    }
  };

  const gradients: Record<Package, string> = {
    Bronze: "linear-gradient(111.92deg, #d8a673, #b97a3c 99.99%)",
    Silver: "linear-gradient(106.25deg, #e5e8ec, #9baac7)",
    Gold: "linear-gradient(104.88deg, #e7b75f, #f8d57e)",
    Platinum: "linear-gradient(99.99deg, #313131, #515254 40.45%, #5b5b5d 55.32%, #565857)",
  };

  return (
    <div className="w-full flex flex-col gap-9 font-sans text-black animate-in fade-in duration-500">
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
                <b className={cn("ml-3 text-[16px] tracking-tight", pkg === "Platinum" ? "text-white" : "text-white drop-shadow-md")}>
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
      <div className="bg-white rounded-[12px] border border-[#ececed] p-5 flex flex-col gap-6 shadow-sm">
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
                onClick={() => { setIsCreatingService(false); setPendingIcon(null); }}
                className="flex items-center justify-center text-[#1F2937] hover:opacity-70 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex flex-col gap-2">
                <label className="text-[14px] leading-[20px]">{lt.serviceIcon}</label>
                <div className="h-[44px] flex items-center gap-3">
                  <label className="h-full px-4 rounded-lg border border-[#ececed] bg-[#fafafa] flex items-center justify-center text-xs font-semibold text-black/60 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap">
                    {lt.selectImage}
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
                className="h-[40px] w-[160px] bg-[#00B4CC] rounded-lg flex items-center justify-center text-[#fafafa] text-sm transition-all hover:opacity-90 shadow-sm"
              >
                {createServiceMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : t.plans.add}
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-5">
          <input
            ref={iconFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleServiceIconSelected}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {allServices?.map((svc) => {
              const stateSelected = packageServices[activePackage]?.includes(svc.name);
              const gymBenefits = gym?.supportedSubscriptions?.find(
                (s: any) => s.packageName === activePackage
              )?.benefits || [];
              const gymSelected = gymBenefits.some(
                (b: any) => b.description?.trim().toLowerCase() === svc.name?.trim().toLowerCase()
              );
              const isSelected = stateSelected || gymSelected;
              const iconUrl = svc.iconImageUrl || svc.iconUrl || gymBenefits.find(
                (b: any) => b.description?.trim().toLowerCase() === svc.name?.trim().toLowerCase()
              )?.iconImageUrl;
              const isUpdatingIcon =
                updateServiceMutation.isPending &&
                updateServiceMutation.variables?.id === svc.id;

              return (
                <div key={svc.id} className="contents">
                <div
                  onClick={() => toggleServiceSelection(svc.name)}
                  className={cn(
                    "h-[48px] rounded-lg px-3 flex items-center justify-between gap-3 cursor-pointer transition-all border",
                    isSelected
                      ? "bg-[#00b4cc0a] border-[#00b4cc]"
                      : "bg-[#fafafa] border-[#ececed]"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button
                      type="button"
                      title={lt.changeIcon}
                      onClick={(e) => handlePickServiceIcon(svc.id, e)}
                      className="w-7 h-7 rounded-md border border-[#ececed] bg-white flex items-center justify-center shrink-0 hover:border-[#00B4CC] transition-colors overflow-hidden"
                    >
                      {isUpdatingIcon ? (
                        <Loader2 className="animate-spin w-3.5 h-3.5 text-[#00B4CC]" />
                      ) : iconUrl ? (
                        <img
                          src={getImageUrl(iconUrl)}
                          alt={svc.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImagePlus size={14} className="text-black/40" />
                      )}
                    </button>
                    <span className="text-[14px] font-medium text-black truncate leading-[20px]">
                      {svc.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditServiceTranslation(svc);
                      }}
                      className="w-5 h-5 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                    >
                      <Pencil size={14} />
                    </button>
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
                </div>
                {editingServiceId === svc.id && (
                  <div className="col-span-full rounded-xl border border-[#ececed] bg-white p-4 flex flex-col gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{svc.name} — {locale === 'RU' ? 'Перевод' : locale === 'EN' ? 'Translation' : 'Tərcümə'}</span>
                      <button onClick={() => setEditingServiceId(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
                    </div>
                    <div className="flex items-center border-b border-[#ececed] gap-1">
                      {languages.map((lang) => (
                        <button key={lang} type="button" onClick={() => setServiceActiveTab(lang)}
                          className={`px-4 py-2 text-[13px] font-semibold transition-all border-b-2 ${
                            serviceActiveTab === lang ? "border-[#00b4cc] text-[#00b4cc]" : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}>{lang}</button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={serviceNames[serviceActiveTab] || ""}
                      onChange={(e) => setServiceNames(prev => ({ ...prev, [serviceActiveTab]: e.target.value }))}
                      readOnly={serviceActiveTab === primaryLang}
                      placeholder={serviceActiveTab === primaryLang ? "Əsas ad" : `Name (${serviceActiveTab})`}
                      className={`h-[40px] rounded-lg border border-[#ececed] px-3 text-[14px] outline-none focus:border-[#00b4cc] transition-colors ${serviceActiveTab === primaryLang ? 'bg-[#f5f5f5] text-gray-500' : 'bg-[#fafafa]'}`}
                    />
                    <div className="flex justify-end">
                      <button onClick={handleSaveServiceTranslation} disabled={isSavingTranslation}
                        className="h-[36px] px-5 rounded-lg bg-[#00B4CC] text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2">
                        {isSavingTranslation ? <Loader2 className="animate-spin" size={16} /> : (locale === 'RU' ? 'Сохранить' : locale === 'EN' ? 'Save' : 'Yadda saxla')}
                      </button>
                    </div>
                  </div>
                )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
