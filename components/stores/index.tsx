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
import { SuccessAnimationModal } from "../ui/success-animation-modal";

import { ApiError } from "@/lib/api/client";
import { useCreateStoreStep1, useCreateStoreStep2, useCreateStoreStep3 } from "@/lib/query/store-query";
import { IStoreStep2Payload } from "@/lib/types/stores";

export default function StoreCreateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [storeId, setStoreId] = useState<number | null>(null);

  const { mutateAsync: createStep1, isPending: isStep1Pending } = useCreateStoreStep1();
  const { mutateAsync: createStep2, isPending: isStep2Pending } = useCreateStoreStep2();
  const { mutateAsync: createStep3, isPending: isStep3Pending } = useCreateStoreStep3();

  const isPending = isStep1Pending || isStep2Pending || isStep3Pending;

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error";
    navigateOnClose?: boolean;
  }>({
    isOpen: false,
    message: "",
    type: "success",
    navigateOnClose: false,
  });

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "",
    image: null,
    imagePreview: null,
  });

  const [contact, setContact] = useState<IStoreStep2Payload>({
    latitude: 0,
    longitude: 0,
    address: "",
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
          setStep(2);
        } else {
          setModalConfig({
            isOpen: true,
            message: "Serverdən mağaza ID-si gəlmədi.",
            type: "error",
          });
        }
      } catch (error: unknown) {
        const msg =
          error instanceof ApiError ? error.message : "Step 1-də xəta baş verdi";
        setModalConfig({ isOpen: true, message: msg, type: "error" });
      }
    } else if (step === 2) {
      if (!storeId) return toast.error("Mağaza ID-si tapılmadı");

      if (!contact.phone) {
        return toast.error("Telefon mütləqdir");
      }

      try {
        const contactPayload = {
          ...contact,
          email: contact.email.trim() === "" ? "" : contact.email.trim(), // Server DTO validates format if present
        };

        await createStep2({
          id: storeId,
          data: {
            ...contactPayload,
            email: contactPayload.email === "" ? undefined : contactPayload.email // undefined maps to missing/null in JSON DTO
          },
        });

        setStep(3);
      } catch (error: unknown) {
        const msg =
          error instanceof ApiError ? error.message : "Step 2-də xəta baş verdi";
        setModalConfig({ isOpen: true, message: msg, type: "error" });
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
      setModalConfig({
        isOpen: true,
        message: "Mağaza tamamilə hazırlandı!",
        type: "success",
        navigateOnClose: true,
      });
    } catch (error: unknown) {
      const msg =
        error instanceof ApiError ? error.message : "Endirimlər yadda saxlanmadı";
      setModalConfig({ isOpen: true, message: msg, type: "error" });
    }
  }

  function reset() {
    setStep(1);
    setStoreId(null);
    setStoreInfo({ name: "", image: null, imagePreview: null });
    setContact({
      latitude: 0,
      longitude: 0,
      address: "",
      phone: "",
      email: "",
      socialUrl: "",
      workHours: { from: "09:00", to: "18:00" },
    });
    setPackages([{ id: crypto.randomUUID(), packageId: "", discount: "10" }]);
  }

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] font-sans text-black">
      <div className="mb-5 flex flex-col gap-1 border-b border-[#ececed] pb-4">
        <button
          type="button"
          onClick={() => {
            if (step === 1) router.push("/stores");
            else setStep((s) => Math.max(s - 1, 1));
          }}
          disabled={isPending}
          className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#00B4CC] transition-colors flex items-center gap-1.5 disabled:opacity-40"
        >
          <ArrowLeft size={12} strokeWidth={3} />
          Geri qayıt
        </button>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[22px] font-semibold text-[#101828] leading-[26px]">
            {storeInfo.name?.trim() ? storeInfo.name : ""}
          </h1>
          {isPending && (
            <div className="flex items-center gap-2 text-[#00B4CC] text-xs font-medium shrink-0">
              <Loader2 className="animate-spin" size={14} />
              Yadda saxlanılır...
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        <StepSidebar current={step} onGo={(s) => !isPending && setStep(s)} />

        <div className="flex-1 w-full min-w-0 bg-white rounded-xl border border-[#ececed] shadow-sm overflow-hidden p-6 md:p-7">
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
                className="h-[40px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                Sıfırla
              </button>
              <button
                type="button"
                onClick={() => void handleNext()}
                disabled={isPending}
                className="flex items-center justify-center min-w-[120px] h-[40px] gap-2 px-8 rounded-lg bg-[#00B4CC] hover:bg-[#009DB3] text-white text-[14px] font-medium transition-all disabled:opacity-70 shadow-md shadow-cyan-50"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Növbəti"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => {
          const nav = modalConfig.navigateOnClose;
          setModalConfig((prev) => ({ ...prev, isOpen: false }));
          if (nav) {
            router.push("/stores");
          }
        }}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
