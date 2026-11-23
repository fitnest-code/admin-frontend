"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Loader2, Search, ChevronDown, Star, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymReviews, useApproveReview, useRejectReview } from "@/lib/query/gym-query";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { SuccessAnimationModal } from "@/components/ui/success-animation-modal";
import { AdminDataTable, type AdminDataTableColumn } from "@/components/ui/admin-data-table";

const STATUS_OPTIONS = [
  { key: "", label: "Bütün statuslar", color: "#4b5563" },
  { key: "ACCEPTED", label: "Təsdiq edilmiş", color: "#166728" },
  { key: "PENDING", label: "Gözləmədə", color: "#3b82f6" },
  { key: "REJECTED", label: "Rədd edilmiş", color: "#ff5255" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Tarixə\n(yeni → köhnə)" },
  { key: "oldest", label: "Tarix\n(Köhnə → yeni)" },
  { key: "highest", label: "Reytinq\n(yeni → köhnə)" },
  { key: "lowest", label: "Reytinq\n(Köhnə → yeni)" },
  { key: "gym_asc", label: "Zal : A-Z" },
  { key: "gym_desc", label: "Zal : Z-A" },
];

const STATUS_BADGE_MAP: Record<string, { label: string, color: string, bgColor: string, dotColor: string }> = {
  PENDING: { 
    label: "Gözləmədədir", 
    color: "#ffb543", 
    bgColor: "#fff6e7", 
    dotColor: "#ffb543" 
  },
  ACCEPTED: { 
    label: "Təsdiq edildi", 
    color: "#00a43d", 
    bgColor: "#e6ffef", 
    dotColor: "#00a43d" 
  },
  REJECTED: { 
    label: "Rədd edildi", 
    color: "#ff5255", 
    bgColor: "#ffe1e1", 
    dotColor: "#ff5255" 
  },
};

/** Backend used to return translated status labels; normalize to machine keys. */
function normalizeReviewStatus(status: unknown): "PENDING" | "ACCEPTED" | "REJECTED" | "" {
  const raw = String(status ?? "").trim();
  const upper = raw.toUpperCase();
  if (upper === "PENDING" || upper === "ACCEPTED" || upper === "REJECTED") return upper;
  const lower = raw.toLowerCase();
  if (lower.includes("gözlə") || lower.includes("pending") || lower.includes("ожид")) return "PENDING";
  if (lower.includes("təsdiq") || lower.includes("accept") || lower.includes("approv") || lower.includes("подтверж")) return "ACCEPTED";
  if (lower.includes("rədd") || lower.includes("reject") || lower.includes("отклон")) return "REJECTED";
  return "";
}

export function ReviewsTab({ gymName }: { gymName?: string }) {
  const { gymId } = useGymStore();
  const [status, setStatus] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [isOpenSort, setIsOpenSort] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; message: string; type: "success" | "error" }>({
    isOpen: false,
    message: "",
    type: "success",
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: reviewsData, isLoading } = useGymReviews(gymId, { 
    status, 
    search: debouncedSearch,
    page, 
    pageSize: 10,
    sort 
  });

  const { mutate: approve, isPending: isApproving } = useApproveReview();
  const { mutate: reject, isPending: isRejecting } = useRejectReview();

  const handleAction = (reviewId: number, type: 'approve' | 'reject') => {
    if (type === 'approve') {
      approve(reviewId, { 
        onSuccess: () => {
          setSelectedReview(null);
          setModalConfig({ isOpen: true, message: "Rəy təsdiq edildi", type: "success" });
        },
        onError: () => setModalConfig({ isOpen: true, message: "Xəta baş verdi", type: "error" })
      });
    } else {
      reject(reviewId, { 
        onSuccess: () => {
          setSelectedReview(null);
          setModalConfig({ isOpen: true, message: "Rəy rədd edildi", type: "success" });
        },
        onError: () => setModalConfig({ isOpen: true, message: "Xəta baş verdi", type: "error" })
      });
    }
  };

  const reviews = reviewsData?.items || [];

  const columns: AdminDataTableColumn<any>[] = useMemo(
    () => [
      {
        id: "customer",
        label: "Müştəri",
        defaultWidth: 200,
        minWidth: 140,
        maxWidth: 320,
        flex: true,
        render: (review) => (
          <div className="flex min-w-0 items-center gap-3">
            {review.author?.avatar_url ? (
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#ececed]">
                <Image
                  src={review.author.avatar_url}
                  alt={review.author.full_name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ececed] bg-[#d5f0f3] text-[15px] font-bold">
                {review.author?.full_name?.[0] || "N"}
              </div>
            )}
            <span className="truncate text-[13px] font-semibold">{review.author?.full_name}</span>
          </div>
        ),
      },
      {
        id: "date",
        label: "Tarix",
        defaultWidth: 130,
        minWidth: 110,
        maxWidth: 160,
        render: (review) => (
          <span className="block truncate text-sm">
            {review.created_at ? format(new Date(review.created_at), "dd MMM, yyyy", { locale: az }) : "—"}
          </span>
        ),
      },
      {
        id: "gym",
        label: "Zalın adı",
        defaultWidth: 150,
        minWidth: 100,
        maxWidth: 240,
        render: (review) => (
          <span className="block truncate uppercase text-[#535353]">{gymName || review.gym_name || "FIT CLUB"}</span>
        ),
      },
      {
        id: "status",
        label: "Status",
        defaultWidth: 140,
        minWidth: 120,
        maxWidth: 180,
        render: (review) => {
          const reviewStatus = normalizeReviewStatus(review.status);
          const badge = STATUS_BADGE_MAP[reviewStatus];
          return (
            <div
              className="flex w-fit items-center gap-2 rounded-[20px] px-3 py-1.5 text-[12px] font-bold"
              style={{ backgroundColor: badge?.bgColor, color: badge?.color }}
            >
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: badge?.dotColor }} />
              {badge?.label || review.status || "—"}
            </div>
          );
        },
      },
      {
        id: "actions",
        label: "Detallı",
        defaultWidth: 160,
        minWidth: 120,
        maxWidth: 220,
        reorderable: false,
        hideable: false,
        render: (review) => {
          const reviewStatus = normalizeReviewStatus(review.status);
          return (
            <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
              {reviewStatus === "PENDING" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleAction(review.id, "approve")}
                    disabled={isApproving || isRejecting}
                    className="h-8 rounded-lg bg-[#00B4CC] px-3 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Təsdiq et
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(review.id, "reject")}
                    disabled={isApproving || isRejecting}
                    className="h-8 rounded-lg bg-[#ff004f] px-3 text-[12px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Rədd et
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelectedReview(review)}
                className="p-2 text-slate-400 transition-colors hover:text-[#00B4CC]"
              >
                <Eye size={18} />
              </button>
            </div>
          );
        },
      },
    ],
    [gymName, isApproving, isRejecting],
  );

  return (
    <div className="flex flex-col gap-6 py-2 font-sans text-black">
      {/* Search & Filters */}
      <div className="flex items-center gap-6">
        <div className="flex-1 h-[40px] bg-white border border-[#ececed] rounded-lg flex items-center px-4 gap-3 shadow-sm focus-within:border-[#00B4CC] transition-colors">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Ad/Soyad , Zal adı , Status....." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13px] text-[#94979c]"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setIsOpenStatus(!isOpenStatus)}
            className="h-[40px] w-[180px] bg-white border border-[#ececed] rounded-lg flex items-center justify-between px-4 cursor-pointer hover:border-[#00B4CC] transition-all shadow-sm"
          >
            <span className="text-[13px] font-medium truncate">
              {status ? STATUS_OPTIONS.find(o => o.key === status)?.label : "Bütün statuslar"}
            </span>
            <ChevronDown size={16} className={cn("text-slate-400 transition-transform flex-shrink-0", isOpenStatus && "rotate-180")} />
          </div>
          {isOpenStatus && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpenStatus(false)} />
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#d9d9d9] rounded-xl shadow-xl flex flex-col p-4 gap-3 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {STATUS_OPTIONS.map((opt) => (
                  <button 
                    key={opt.key}
                    onClick={() => {
                      setStatus(opt.key);
                      setIsOpenStatus(false);
                    }}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                    <span className="text-[14px] font-medium text-[#001028] whitespace-nowrap">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setIsOpenSort(!isOpenSort)}
            className="h-[40px] w-[180px] bg-white border border-[#ececed] rounded-lg flex items-center justify-between px-4 cursor-pointer hover:border-[#00B4CC] transition-all shadow-sm"
          >
            <span className="text-[13px] font-medium truncate">
              {SORT_OPTIONS.find(o => o.key === sort)?.label || "Sırala"}
            </span>
            <ChevronDown size={16} className={cn("text-slate-400 transition-transform flex-shrink-0", isOpenSort && "rotate-180")} />
          </div>
          {isOpenSort && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpenSort(false)} />
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#ececed] rounded-xl shadow-xl flex flex-col p-3 gap-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {SORT_OPTIONS.map((opt) => (
                  <button 
                    key={opt.key}
                    onClick={() => {
                      setSort(opt.key);
                      setIsOpenSort(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors border-b border-[#ececed] last:border-0"
                  >
                    <span className="text-[14px] leading-[20px] font-medium whitespace-pre-wrap">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <AdminDataTable
        storageKey="gym-reviews"
        columns={columns}
        rows={reviews}
        getRowId={(review) => review.id}
        isLoading={isLoading}
        emptyTitle="Rəy tapılmadı"
        onRowClick={(review) => setSelectedReview(review)}
      />

      {/* Review Detail Modal (Container UI) */}
      {selectedReview && (() => {
        const selectedStatus = normalizeReviewStatus(selectedReview.status);
        const selectedBadge = STATUS_BADGE_MAP[selectedStatus];
        return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans text-black">
          <div className="w-full max-w-[744px] bg-white rounded-[14px] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-black/10 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#101828]">Reytinq detalları</h2>
              <button 
                onClick={() => setSelectedReview(null)}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md transition-colors"
              >
                 <X size={16} className="text-[#101828]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-6">
               {/* User Info & Status Row */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     {selectedReview.author?.avatar_url ? (
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-[#ececed] relative shrink-0">
                          <Image
                            src={selectedReview.author.avatar_url}
                            alt={selectedReview.author.full_name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                     ) : (
                        <div className="w-11 h-11 rounded-full bg-[#d5f0f3] border border-[#ececed] flex items-center justify-center text-[18px] font-bold shrink-0">
                           {selectedReview.author?.full_name?.[0] || "N"}
                        </div>
                     )}
                     <div className="flex flex-col text-left">
                        <span className="text-[16px] font-medium leading-[24px]">{selectedReview.author?.full_name}</span>
                        <span className="text-[14px] text-[#4a5565] leading-[20px]">
                           {selectedReview.created_at ? format(new Date(selectedReview.created_at), "dd MMM, yyyy", { locale: az }) : "—"}
                        </span>
                     </div>
                  </div>

                  <div className="flex flex-col items-start gap-1.5">
                     <span className="text-[14px] font-medium text-[#364153]">Status</span>
                     <div 
                       className="w-fit rounded-[20px] px-3 py-1.5 flex items-center gap-2 text-[12px] font-bold"
                       style={{ backgroundColor: selectedBadge?.bgColor, color: selectedBadge?.color }}
                     >
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedBadge?.dotColor }} />
                       {selectedBadge?.label || selectedReview.status}
                     </div>
                  </div>
               </div>

               {/* Gym Row */}
               <div className="flex flex-col items-start gap-1.5">
                  <span className="text-[14px] font-medium text-[#364153]">Zal</span>
                  <span className="text-[16px] leading-[24px] text-black font-medium">{gymName || selectedReview.gym_name || "FIT CLUB"}</span>
               </div>

               {/* Comment Row */}
               <div className="flex flex-col items-start gap-1.5 w-full">
                  <span className="text-[14px] font-medium text-[#364153]">Şərh</span>
                  <div className="w-full min-h-[48px] p-[10px] rounded-[12px] border border-[#dddcdc] text-[14px] font-medium text-[#535353] leading-[20px] text-left">
                     {selectedReview.comment || "Rəy mətni daxil edilməyib."}
                  </div>
               </div>

               {/* Rating Row */}
               <div className="flex flex-col items-start gap-1.5">
                  <span className="text-[14px] font-medium text-[#364153]">Reytinq</span>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                           <Star 
                             key={s} 
                             size={16} 
                             className={cn(s <= selectedReview.rating ? "fill-[#FFB543] text-[#FFB543]" : "text-slate-200")} 
                           />
                        ))}
                     </div>
                     <span className="text-[18px] font-semibold text-black leading-[28px]">
                        {selectedReview.rating}/5
                     </span>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-6 border-t border-black/10 flex items-center gap-3">
               <button 
                 onClick={() => setSelectedReview(null)}
                 className="flex-1 h-12 rounded-[10px] border border-[#00B4CC] text-black text-[16px] font-medium hover:bg-slate-50 transition-colors"
               >
                  Bağla
               </button>
               {(selectedStatus === 'PENDING' || selectedStatus === 'ACCEPTED') && (
                   <button 
                     onClick={() => handleAction(selectedReview.id, 'reject')}
                     disabled={isRejecting || isApproving}
                     className="flex-1 h-12 rounded-[10px] bg-[#ff004f] border border-[#ececed] text-white text-[16px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                   >
                     {isRejecting ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Rədd et"}
                   </button>
               )}
               {(selectedStatus === 'PENDING' || selectedStatus === 'REJECTED') && (
                   <button 
                     onClick={() => handleAction(selectedReview.id, 'approve')}
                     disabled={isRejecting || isApproving}
                     className="flex-1 h-12 rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                   >
                     {isApproving ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Təsdiq et"}
                   </button>
               )}
            </div>
          </div>
        </div>
      ); })()}
      <SuccessAnimationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
