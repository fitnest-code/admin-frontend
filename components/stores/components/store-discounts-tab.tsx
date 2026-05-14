"use client";

import * as Select from "@radix-ui/react-select";
import * as Separator from "@radix-ui/react-separator";
import type { IStoreStep3Payload } from "@/lib/types/stores";
import { useSubscriptionPackages } from "@/lib/query/use-subscription-packages";
import { Loader2 } from "lucide-react";

export interface PackageRow {
  id: string;
  packageId: string;
  discount: string;
}

/** UI sətirlərini Swagger step3 bədəninə çevirir. */
export function packageRowsToStep3Payload(rows: PackageRow[]): IStoreStep3Payload {
  const byPackageId = new Map<number, { packageId: number; discountPercent: number }>();

  for (const r of rows) {
    const packageId = Number(r.packageId);
    const discountPercent = Math.min(
      100,
      Math.max(0, Math.round(Number(r.discount))),
    );
    
    if (
      !Number.isFinite(packageId) ||
      packageId <= 0 ||
      !Number.isFinite(discountPercent)
    ) {
      continue;
    }
    byPackageId.set(packageId, { packageId, discountPercent });
  }

  return { discounts: [...byPackageId.values()] };
}

const inputCls =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#00B4CC] focus:ring-2 focus:ring-[#00B4CC]/15 transition placeholder:text-gray-400 bg-white";

interface Step3Props {
  rows: PackageRow[];
  onChange: (rows: PackageRow[]) => void;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
  isSaving?: boolean;
  showFooter?: boolean;
}

export default function StoreDiscountsTab({
  rows,
  onChange,
  onCancel,
  onSave,
  isSaving = false,
  showFooter = true,
}: Step3Props) {
  const { data: loadedPackages, isLoading } = useSubscriptionPackages();
  const packagesList = loadedPackages || [];

  function addRow() {
    onChange([
      ...rows,
      { id: crypto.randomUUID(), packageId: "", discount: "10" },
    ]);
  }

  function updateRow(id: string, patch: Partial<PackageRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    onChange(rows.filter((r) => r.id !== id));
  }

  const disabledAll = isSaving || isLoading;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Paketlər və endirimlər
        </h2>
        <button
          type="button"
          onClick={addRow}
          disabled={disabledAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] active:scale-95 text-white text-sm font-medium transition-all disabled:opacity-50"
        >
          <PlusIcon />
          Əlavə et
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_52px] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Paket adı
          </span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Endirim (%)
          </span>
          <span />
        </div>

        {rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Paket əlavə edin
          </div>
        ) : (
          rows.map((row, i) => (
            <div key={row.id}>
              {i > 0 && <Separator.Root className="h-px bg-gray-100" decorative />}
              <div className="grid grid-cols-[1fr_140px_52px] gap-3 items-center px-4 py-3">
                {/* Package select */}
                <Select.Root
                  value={row.packageId}
                  onValueChange={(v) => updateRow(row.id, { packageId: v })}
                  disabled={disabledAll}
                >
                  <Select.Trigger
                    className={`${inputCls} flex items-center justify-between cursor-pointer`}
                    aria-label="Paket seçin"
                  >
                    <Select.Value placeholder={isLoading ? "Paketlər yüklənir..." : "Paket seçin"} />
                    <Select.Icon className="text-gray-400">
                      {isLoading ? <Loader2 className="animate-spin text-[#00B4CC]" size={16} /> : <ChevronDownIcon />}
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      className="z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                      position="popper"
                      sideOffset={4}
                    >
                      <Select.Viewport className="p-1">
                        {packagesList.map((pkg) => (
                          <Select.Item
                            key={pkg.id}
                            value={String(pkg.id)}
                            className="flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer outline-none hover:bg-[#00B4CC]/10 data-highlighted:bg-[#00B4CC]/10 text-gray-800"
                          >
                            <Select.ItemText>{pkg.name}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                {/* Discount input */}
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={row.discount}
                    disabled={disabledAll}
                    onChange={(e) => updateRow(row.id, { discount: e.target.value })}
                    className={inputCls + " pr-8"}
                  />
                  <span className="absolute right-2.5 text-[#00B4CC]">
                    <EditIcon />
                  </span>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={disabledAll}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition disabled:opacity-40"
                  aria-label="Sil"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showFooter && (
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabledAll}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Ləğv et
          </button>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={disabledAll}
            className="flex items-center justify-center min-w-[120px] px-6 py-2.5 rounded-xl bg-[#00B4CC] hover:bg-[#009DB3] active:scale-95 text-white text-sm font-medium transition-all disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Tamamla"}
          </button>
        </div>
      )}
    </div>
  );
}

// Ikonlar
function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}