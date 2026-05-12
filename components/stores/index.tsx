"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import StoreInfoTab, { StoreInfo } from "./components/store-info-tab";
import ContactInfoTab from "./components/store-contact-tab";
import StoreDiscountsTab, {
  PackageRow,
  packageRowsToStep3Payload,
} from "./components/store-discounts-tab";
import StepSidebar from "./step-sidebar";

import { ApiError } from "@/lib/api/client";
import { useCreateStoreStep1, useCreateStoreStep2, useCreateStoreStep3 } from "@/lib/query/store-query";
import { IStoreStep2Payload } from "@/lib/types/stores";

export default function StoreCreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [storeId, setStoreId] = useState<number | null>(null);

  const { mutateAsync: createStep1, isPending: isStep1Pending } = useCreateStoreStep1();
  const { mutateAsync: createStep2, isPending: isStep2Pending } = useCreateStoreStep2();
  const { mutateAsync: createStep3, isPending: isStep3Pending } = useCreateStoreStep3();

  const isPending = isStep1Pending || isStep2Pending || isStep3Pending;

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "",
    image: null,
    imagePreview: null,
  });

  const [contact, setContact] = useState<IStoreStep2Payload>({
    latitude: 0,
    longitude: 0,
    phone: "",
    email: "",
    socialUrl: "",
    workHours: {
      from: "09:00",
      to: "18:00",
    },
  });

  const [packages, setPackages] = useState<PackageRow[]>([
    { id: crypto.randomUUID(), packageId: "", discount: "10" },
  ]);

  async function handleNext() {
    if (step === 1) {
      if (!storeInfo.name.trim()) return toast.error("Mağaza adı mütləqdir");
      if (!storeInfo.image) return toast.error("Mağaza şəkli mütləqdir");

      try {
        const response = await createStep1({
          name: storeInfo.name.trim(),
          photo: storeInfo.image,
        });

        const newId = response?.id;
        if (newId != null && Number.isFinite(Number(newId))) {
          setStoreId(Number(newId));
          toast.success("Mağaza yaradıldı.");
          setStep(2);
        } else {
          toast.error("Serverdən mağaza ID-si gəlmədi.");
        }
      } catch (error: unknown) {
        const msg =
          error instanceof ApiError ? error.message : "Step 1-də xəta baş verdi";
        toast.error(msg);
      }
    } else if (step === 2) {
      if (!storeId) return toast.error("Mağaza ID-si tapılmadı");

      if (!contact.phone || !contact.email) {
        return toast.error("Telefon və Email mütləqdir");
      }

      try {
        await createStep2({
          id: storeId,
          data: contact,
        });

        toast.success("Əlaqə məlumatları yadda saxlanıldı.");
        setStep(3);
      } catch (error: unknown) {
        const msg =
          error instanceof ApiError ? error.message : "Step 2-də xəta baş verdi";
        toast.error(msg);
      }
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  }

  async function handleFinalSave() {
    if (!storeId) {
      toast.error("Mağaza ID-si tapılmadı");
      return;
    }

    const payload = packageRowsToStep3Payload(packages);
    if (payload.discounts.length === 0) {
      toast.error("Ən azı bir paket seçin və endirim faizi daxil edin");
      return;
    }

    try {
      await createStep3({ id: storeId, data: payload });
      setSaved(true);
      toast.success("Mağaza tamamilə hazırlandı!");
    } catch (error: unknown) {
      const msg =
        error instanceof ApiError ? error.message : "Endirimlər yadda saxlanmadı";
      toast.error(msg);
    }
  }

  function reset() {
    setStep(1);
    setStoreId(null);
    setSaved(false);
    setStoreInfo({ name: "", image: null, imagePreview: null });
    setContact({
      latitude: 0,
      longitude: 0,
      phone: "",
      email: "",
      socialUrl: "",
      workHours: { from: "09:00", to: "18:00" },
    });
    setPackages([{ id: crypto.randomUUID(), packageId: "", discount: "10" }]);
  }

  if (saved) {
    return (
      <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#00B4CC]/10 flex items-center justify-center text-[#00B4CC] text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-[#101828]">Mağaza uğurla yaradıldı!</h2>
        <p className="text-sm text-gray-500">“{storeInfo.name}” sistemi əlavə edildi.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-white text-sm font-medium transition-colors"
        >
          Yeni mağaza əlavə et
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] font-sans text-black">
      <div className="mb-6 flex flex-col gap-2 border-b border-[#ececed] pb-5">
        <button
          type="button"
          onClick={() => {
            if (step === 1) router.push("/stores");
            else setStep((s) => Math.max(s - 1, 1));
          }}
          disabled={isPending}
          className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#00B4CC] transition-colors flex items-center gap-2 disabled:opacity-40"
        >
          <ArrowLeft size={14} strokeWidth={3} />
          Geri qayıt
        </button>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[24px] font-semibold text-[#101828] leading-[28px]">
            {storeInfo.name?.trim() ? storeInfo.name : "Yeni Mağaza"}
          </h1>
          {isPending && (
            <div className="flex items-center gap-2 text-[#00B4CC] text-sm font-medium shrink-0">
              <Loader2 className="animate-spin" size={16} />
              Yadda saxlanılır...
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        <StepSidebar current={step} onGo={(s) => !isPending && setStep(s)} />

        <div className="flex-1 w-full min-w-0 bg-white rounded-[12px] border border-[#ececed] shadow-sm overflow-hidden p-6 md:p-8">
          {step === 1 && <StoreInfoTab data={storeInfo} onChange={setStoreInfo} />}

          {step === 2 && <ContactInfoTab data={contact} onChange={setContact} />}

          {step === 3 && (
            <StoreDiscountsTab
              rows={packages}
              onChange={setPackages}
              onCancel={reset}
              onSave={handleFinalSave}
              isSaving={isStep3Pending}
            />
          )}

          {step < 3 && (
            <div className="flex flex-wrap gap-3 justify-end mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={reset}
                disabled={isPending}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Sıfırla
              </button>
              <button
                type="button"
                onClick={() => void handleNext()}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-white text-sm font-medium transition-all disabled:opacity-70"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {step === 1 ? "Yarat və Növbəti" : "Yadda saxla və Növbəti"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
