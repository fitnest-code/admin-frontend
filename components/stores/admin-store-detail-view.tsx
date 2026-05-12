"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Copy,
  Loader2,
  Pencil,
  Link2,
} from "lucide-react";
import * as Label from "@radix-ui/react-label";
import { useAdminStoreDetailQuery } from "@/modules/stores";
import type { AdminStoreDetailViewModel } from "@/modules/stores/types/store.types";
import { STORE_PACKAGE_OPTIONS } from "@/components/stores/components/store-discounts-tab";
import { toast } from "sonner";

const readBox =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 bg-gray-50/90 min-h-[42px] flex items-center";

function packageLabel(packageId: number) {
  return STORE_PACKAGE_OPTIONS.find((p) => p.id === packageId)?.name ?? `Paket #${packageId}`;
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root className="text-sm font-medium text-gray-600">{label}</Label.Root>
      <div className={readBox}>{value.trim() ? value : "—"}</div>
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

function DetailBody({ data, storeId }: { data: AdminStoreDetailViewModel; storeId: number }) {
  const router = useRouter();

  return (
    <div className="w-full max-w-none flex flex-col gap-8 pb-10 min-h-[calc(100vh-6rem)]">
      <button
        type="button"
        onClick={() => router.push("/stores")}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#00B4CC] transition-colors"
      >
        <ArrowLeft size={16} /> Geri qayıt
      </button>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
        <button
          type="button"
          onClick={() => router.push(`/stores/${storeId}/edit`)}
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-[#00B4CC] hover:text-[#00B4CC] transition"
          aria-label="Redaktə et"
        >
          <Pencil size={18} />
        </button>
      </div>

      {/* Mağaza məlumatları */}
      <section className="flex flex-col gap-5">
        <h2 className="text-base font-semibold text-gray-800">Mağaza məlumatları</h2>
        <ReadField label="Mağaza adı" value={data.name} />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-600">Mağaza şəkilləri</span>
          <div className="flex flex-wrap items-start gap-6">
            {data.coverImageUrl ? (
              <img
                src={data.coverImageUrl}
                alt={data.name}
                className="h-36 w-44 rounded-xl border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-36 w-44 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                Şəkil yoxdur
              </div>
            )}
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <span className="text-gray-500">Şəkil yüklə</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gray-500">Şəkli dəyiş</span>
              </span>
              <span className="flex items-center gap-2 text-red-400">
                <span>Şəkli sil</span>
              </span>
              <p className="text-xs text-gray-400 max-w-[200px]">
                Şəkil dəyişikliyi üçün redaktə səhifəsinə keçin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Əlaqə */}
      <section className="flex flex-col gap-5">
        <h2 className="text-base font-semibold text-gray-800">Əlaqə</h2>
        <ReadField label="Ünvan" value={data.address} />
        <div>
          <span className="text-sm font-medium text-gray-600 block mb-2">Koordinatlar</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label.Root className="text-sm font-medium text-gray-600">En (Latitude)</Label.Root>
              <div className="relative">
                <div className={`${readBox} pr-10`}>{String(data.latitude)}</div>
                <button
                  type="button"
                  onClick={() => copyText(String(data.latitude))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-[#00B4CC]"
                  aria-label="Kopyala"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label.Root className="text-sm font-medium text-gray-600">Uzunluq (Longitude)</Label.Root>
              <div className="relative">
                <div className={`${readBox} pr-10`}>{String(data.longitude)}</div>
                <button
                  type="button"
                  onClick={() => copyText(String(data.longitude))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-[#00B4CC]"
                  aria-label="Kopyala"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <ReadField label="Telefon nömrəsi" value={data.phone} />
        <ReadField label="E-Poçt" value={data.email} />
        <div className="flex flex-col gap-1.5">
          <Label.Root className="text-sm font-medium text-gray-600">Keçid üçün link</Label.Root>
          <div className={`${readBox} gap-2`}>
            {data.socialUrl ? (
              <>
                <Link2 size={16} className="shrink-0 text-[#00B4CC]" />
                <span className="truncate">{data.socialUrl}</span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      </section>

      {/* İş saatları */}
      <section className="flex flex-col gap-5">
        <h2 className="text-base font-semibold text-gray-800">İş saatları</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label.Root className="text-sm font-medium text-gray-600">Başlama saatı</Label.Root>
            <div className="relative">
              <div className={`${readBox} pr-10`}>{data.workHours.from}</div>
              <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00B4CC] pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label.Root className="text-sm font-medium text-gray-600">Bitmə saatı</Label.Root>
            <div className="relative">
              <div className={`${readBox} pr-10`}>{data.workHours.to}</div>
              <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00B4CC] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Paketlər */}
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-800">Paketlər və endirimlər</h2>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_140px] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Paket adı</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Endirim (%)</span>
          </div>
          {data.discounts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Paket endirimi təyin edilməyib</div>
          ) : (
            data.discounts.map((row, i) => (
              <div
                key={`${row.packageId}-${i}`}
                className="grid grid-cols-[1fr_140px] gap-3 items-center px-4 py-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-800">{packageLabel(row.packageId)}</span>
                <span className="text-sm font-medium text-gray-800">{row.discountPercent} %</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export function AdminStoreDetailView({ storeId }: { storeId: number }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useAdminStoreDetailQuery(storeId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4CC]" />
        <p className="text-sm text-gray-500">Mağaza yüklənir…</p>
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

  return <DetailBody data={data} storeId={storeId} />;
}
