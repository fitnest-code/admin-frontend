"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Copy, Loader2 } from "lucide-react";
import * as Label from "@radix-ui/react-label";
import { toast } from "sonner";
import StoreInfoTab, { type StoreInfo } from "@/components/stores/components/store-info-tab";
import StoreDiscountsTab, {
  type PackageRow,
  packageRowsToStep3Payload,
} from "@/components/stores/components/store-discounts-tab";
import { ApiError } from "@/lib/api/client";
import { IStoreStep2Payload } from "@/lib/types/stores";
import {
  type AdminStorePatchData,
  useAdminStoreDetailQuery,
  useUpdateAdminStoreMutation,
} from "@/modules/stores";

const inputCls =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00B4CC] focus:ring-2 focus:ring-[#00B4CC]/15 transition placeholder:text-gray-400 bg-white";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={htmlFor} className="text-sm font-medium text-gray-600">
        {label}
      </Label.Root>
      {children}
    </div>
  );
}

function copyText(text: string) {
  if (!text) return;
  void navigator.clipboard.writeText(text).then(
    () => toast.success("Kopyalandı"),
    () => toast.error("Kopyalanmadı"),
  );
}

const defaultContact: IStoreStep2Payload = {
  latitude: 0,
  longitude: 0,
  phone: "",
  email: "",
  socialUrl: "",
  workHours: { from: "09:00", to: "18:00" },
};

export function AdminStoreEditView({ storeId }: { storeId: number }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useAdminStoreDetailQuery(storeId);
  const { mutateAsync: saveStore, isPending } = useUpdateAdminStoreMutation();

  const seededForId = useRef<number | null>(null);
  useEffect(() => {
    seededForId.current = null;
  }, [storeId]);

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: "",
    image: null,
    imagePreview: null,
  });
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState<IStoreStep2Payload>(defaultContact);
  const [packages, setPackages] = useState<PackageRow[]>([
    { id: crypto.randomUUID(), packageId: "", discount: "10" },
  ]);

  useEffect(() => {
    if (!data) return;
    if (seededForId.current === data.id) return;
    seededForId.current = data.id;
    setStoreInfo({
      name: data.name,
      image: null,
      imagePreview: data.coverImageUrl,
    });
    setAddress(data.address);
    setContact({
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone,
      email: data.email,
      socialUrl: data.socialUrl,
      workHours: { ...data.workHours },
    });
    setPackages(
      data.discounts.length > 0
        ? data.discounts.map((d) => ({
            id: crypto.randomUUID(),
            packageId: String(d.packageId),
            discount: String(d.discountPercent),
          }))
        : [{ id: crypto.randomUUID(), packageId: "", discount: "10" }],
    );
  }, [data]);

  async function handleSave() {
    if (!storeInfo.name.trim()) {
      toast.error("Mağaza adı mütləqdir");
      return;
    }
    if (!address.trim()) {
      toast.error("Ünvan mütləqdir");
      return;
    }
    if (!contact.phone.trim() || !contact.email.trim()) {
      toast.error("Telefon və e-poçt mütləqdir");
      return;
    }

    const discounts = packageRowsToStep3Payload(packages).discounts;
    const patchData: AdminStorePatchData = {
      name: storeInfo.name.trim(),
      latitude: Number(contact.latitude),
      longitude: Number(contact.longitude),
      phone: contact.phone.trim(),
      email: contact.email.trim(),
      socialUrl: contact.socialUrl.trim(),
      socialUrlProvided: true,
      workHours: {
        from: contact.workHours.from,
        to: contact.workHours.to,
      },
      workHoursProvided: true,
      discounts,
      address: address.trim(),
    };

    try {
      await saveStore({
        id: storeId,
        data: patchData,
        photo: storeInfo.image,
      });
      toast.success("Mağaza yeniləndi");
      router.push(`/stores/${storeId}`);
    } catch (e: unknown) {
      const msg = e instanceof ApiError ? e.message : "Yeniləmə alınmadı";
      toast.error(msg);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
        <p className="text-sm text-gray-500">Məlumatlar yüklənir…</p>
      </div>
    );
  }

  if (isError || !data) {
    const msg = error instanceof Error ? error.message : "Mağaza tapılmadı";
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
        <p className="text-sm font-medium text-red-600">{msg}</p>
        <button
          type="button"
          onClick={() => router.push("/stores")}
          className="text-sm text-[#00B4CC] font-medium hover:underline"
        >
          Mağazalar siyahısına qayıt
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none flex flex-col gap-8 pb-10 min-h-[calc(100vh-6rem)]">
      <button
        type="button"
        onClick={() => router.push(`/stores/${storeId}`)}
        disabled={isPending}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#00B4CC] transition-colors disabled:opacity-40"
      >
        <ArrowLeft size={16} /> Geri qayıt
      </button>

      <h1 className="text-[24px] font-semibold text-[#101828] leading-[28px]">Mağazanın redaktəsi</h1>

      <section className="flex flex-col gap-5">
        <h2 className="text-base font-semibold text-gray-800">Mağaza məlumatları</h2>
        <StoreInfoTab data={storeInfo} onChange={setStoreInfo} />
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-base font-semibold text-gray-800">Əlaqə</h2>
        <Field label="Ünvan" htmlFor="addr">
          <input
            id="addr"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputCls}
            placeholder="Bakı, Nərimanov rayonu"
          />
        </Field>
        <div>
          <span className="text-sm font-medium text-gray-600 block mb-2">Koordinatlar</span>
          <div className="grid grid-cols-2 gap-3">
            <Field label="En (Latitude)" htmlFor="lat">
              <div className="relative">
                <input
                  id="lat"
                  type="number"
                  step="any"
                  value={contact.latitude}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      latitude: e.target.valueAsNumber || 0,
                    })
                  }
                  className={inputCls + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => copyText(String(contact.latitude))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-[#00B4CC]"
                  aria-label="Kopyala"
                >
                  <Copy size={16} />
                </button>
              </div>
            </Field>
            <Field label="Uzunluq (Longitude)" htmlFor="lng">
              <div className="relative">
                <input
                  id="lng"
                  type="number"
                  step="any"
                  value={contact.longitude}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      longitude: e.target.valueAsNumber || 0,
                    })
                  }
                  className={inputCls + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => copyText(String(contact.longitude))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-[#00B4CC]"
                  aria-label="Kopyala"
                >
                  <Copy size={16} />
                </button>
              </div>
            </Field>
          </div>
        </div>
        <Field label="Telefon nömrəsi" htmlFor="ph">
          <input
            id="ph"
            type="tel"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="E-Poçt" htmlFor="em">
          <input
            id="em"
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Keçid üçün link" htmlFor="soc">
          <input
            id="soc"
            type="url"
            value={contact.socialUrl}
            onChange={(e) => setContact({ ...contact, socialUrl: e.target.value })}
            className={inputCls}
            placeholder="https://"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-base font-semibold text-gray-800">İş saatları</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Başlama saatı" htmlFor="whf">
            <div className="relative">
              <input
                id="whf"
                type="time"
                value={contact.workHours.from}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    workHours: { ...contact.workHours, from: e.target.value },
                  })
                }
                className={inputCls + " pr-10"}
              />
              <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00B4CC] pointer-events-none" />
            </div>
          </Field>
          <Field label="Bitmə saatı" htmlFor="wht">
            <div className="relative">
              <input
                id="wht"
                type="time"
                value={contact.workHours.to}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    workHours: { ...contact.workHours, to: e.target.value },
                  })
                }
                className={inputCls + " pr-10"}
              />
              <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00B4CC] pointer-events-none" />
            </div>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-800">Paketlər və endirimlər</h2>
        <StoreDiscountsTab
          rows={packages}
          onChange={setPackages}
          onCancel={() => {}}
          onSave={() => {}}
          isSaving={isPending}
          showFooter={false}
        />
      </section>

      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push(`/stores/${storeId}`)}
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Ləğv et
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] text-white text-sm font-medium transition disabled:opacity-60"
        >
          {isPending ? "Yadda saxlanılır…" : "Yadda saxla"}
        </button>
      </div>
    </div>
  );
}
