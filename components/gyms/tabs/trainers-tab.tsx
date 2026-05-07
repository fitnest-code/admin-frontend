"use client";

import { Plus, Search, MoreVertical, Loader2 } from "lucide-react";
import { AddTrainerModal } from "../modals/add-trainer-modal";
import { useState } from "react";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymTrainersQuery } from "@/lib/query/trainers";

export function TrainersTab() {
  const [showAdd, setShowAdd] = useState(false);

  // Lokal state - Pagination və Filter üçün
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");
  const [searchQuery, setSearchQuery] = useState("");

  // Store-dan gymId-ni alırıq
  const gymId = useGymStore((s) => s.gymId);

  // Query: gymId yoxdursa (0 göndəririk), enabled: !!gymId sayəsində sorğu gözləyəcək
  const { data, isLoading } = useGymTrainersQuery(
    gymId || 0,
    page,
    pageSize,
    sortDir,
  );

  const source = data?.items ?? [];
  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 1;

  // Əgər Step 1 hələ arxa fonda yaradılırsa, komponenti kilidləmirik, sadəcə loading göstəririk
  if (!gymId && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <Loader2 className="h-10 w-10 animate-spin text-[#00B4CC] mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Zal məlumatları sinxronizasiya edilir, zəhmət olmasa gözləyin...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Header: Axtarış və Əlavə et */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Məşqçi axtar..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#00B4CC] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none cursor-pointer"
            value={sortDir}
            onChange={(e) => {
              setSortDir(e.target.value as "ASC" | "DESC");
              setPage(1);
            }}
          >
            <option value="DESC">Yenilər əvvəl</option>
            <option value="ASC">Köhnələr əvvəl</option>
          </select>

          <button
            onClick={() => setShowAdd(true)}
            disabled={!gymId}
            className="flex items-center gap-2 bg-[#00B4CC] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#009DB3] transition-all disabled:opacity-50"
          >
            {!gymId ? "Zal sinxronizasiya olunur..." : "Məşqçi əlavə et"}
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Cədvəl Hissəsi */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#00B4CC0A] border-b border-slate-50">
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">
                Ad / Soyad
              </th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">
                Telefon
              </th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase">
                E-poçt
              </th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right uppercase">
                Ətraflı
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <Loader2 className="inline animate-spin text-[#00B4CC]" />
                </td>
              </tr>
            ) : source.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-12 text-slate-400 italic font-medium"
                >
                  Məşqçi siyahısı boşdur
                </td>
              </tr>
            ) : (
              source.map((t: any) => (
                <tr
                  key={t.trainer_id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.picture || "/default-avatar.png"}
                        className="h-10 w-10 rounded-full object-cover bg-slate-100 border border-slate-200"
                        alt="trainer"
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {t.name} {t.surname}
                        </p>
                        <p className="text-xs text-[#00B4CC] font-bold">
                          {t.profession?.name || "Məşqçi"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {t.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {t.email}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={18} className="text-slate-300" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="px-6 py-4 flex items-center justify-between bg-white border-t border-slate-50">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Hər səhifədə:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="font-bold text-slate-700 outline-none cursor-pointer bg-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              Geri
            </button>
            <span className="text-sm font-bold text-slate-700">
              Səhifə {page} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-slate-50 transition-all"
            >
              İrəli
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showAdd && <AddTrainerModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
