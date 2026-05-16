"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, Search, ChevronDown, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGymStore } from "@/lib/store/gym-store";
import { useGymReviews, useApproveReview, useRejectReview } from "@/lib/query/gym-query";
import { format } from "date-fns";
import { az } from "date-fns/locale";

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

export function ReviewsTab() {
  const { gymId } = useGymStore();
  const [status, setStatus] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [isOpenSort, setIsOpenSort] = useState(false);

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
      approve(reviewId, { onSuccess: () => setSelectedReview(null) });
    } else {
      reject(reviewId, { onSuccess: () => setSelectedReview(null) });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 py-20 flex flex-col justify-center items-center text-slate-400 gap-3">
        <Loader2 className="animate-spin" size={32} />
        <span className="font-medium font-sans">Rəylər yüklənir...</span>
      </div>
    );
  }

  const reviews = reviewsData?.items || [];

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

      {/* Table Content */}
      <div className="w-full bg-white rounded-xl border border-[#ececed] overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_180px_180px_180px_60px] items-center bg-[#00B4CC]/10 border-b border-[#ececed] px-6 py-3.5">
          <div className="text-[14px] font-bold text-black uppercase tracking-wider">Müştəri</div>
          <div className="text-[14px] font-bold text-black uppercase tracking-wider">Tarix</div>
          <div className="text-[14px] font-bold text-black uppercase tracking-wider">Zalın adı</div>
          <div className="text-[14px] font-bold text-black uppercase tracking-wider">Status</div>
          <div className="text-[14px] font-bold text-black uppercase tracking-wider text-center">Detallı</div>
        </div>

        <div className="flex flex-col">
          {reviews.length === 0 ? (
            <div className="py-20 text-center text-slate-400">Rəy tapılmadı</div>
          ) : (
            reviews.map((review: any) => (
              <div key={review.id} className="grid grid-cols-[1fr_180px_180px_180px_60px] items-center px-6 py-3 border-b border-[#ececed] last:border-0 hover:bg-slate-50 transition-colors">
                {/* Customer */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#d5f0f3] border border-[#ececed] flex items-center justify-center text-[15px] font-bold">
                    {review.author?.full_name?.[0] || "N"}
                  </div>
                  <span className="text-[13px] font-semibold">{review.author?.full_name}</span>
                </div>

                {/* Date */}
                <div className="text-[14px] font-medium">
                  {review.created_at ? format(new Date(review.created_at), "dd MMM, yyyy", { locale: az }) : "—"}
                </div>

                {/* Gym Name */}
                <div className="text-[14px] font-medium text-[#535353] truncate pr-4 uppercase">
                  {review.gym_name || "FIT CLUB"}
                </div>

                {/* Status */}
                <div>
                  <div 
                    className="w-fit rounded-[20px] px-3 py-1.5 flex items-center gap-2 text-[12px] font-bold"
                    style={{ backgroundColor: STATUS_BADGE_MAP[review.status]?.bgColor, color: STATUS_BADGE_MAP[review.status]?.color }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_BADGE_MAP[review.status]?.dotColor }} />
                    {STATUS_BADGE_MAP[review.status]?.label}
                  </div>
                </div>

                {/* Detail */}
                <div className="flex justify-center">
                  <button 
                    onClick={() => setSelectedReview(review)}
                    className="p-2 text-slate-400 hover:text-[#00B4CC] transition-colors"
                  >
                    <Image src="/more.png" width={28} height={18} alt="View" className="opacity-60 hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Detail Modal (Container UI) */}
      {selectedReview && (
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
                     <div className="w-11 h-11 rounded-full bg-[#d5f0f3] border border-[#ececed] flex items-center justify-center text-[18px] font-bold">
                        {selectedReview.author?.full_name?.[0] || "N"}
                     </div>
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
                       style={{ backgroundColor: STATUS_BADGE_MAP[selectedReview.status]?.bgColor, color: STATUS_BADGE_MAP[selectedReview.status]?.color }}
                     >
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_BADGE_MAP[selectedReview.status]?.dotColor }} />
                       {STATUS_BADGE_MAP[selectedReview.status]?.label}
                     </div>
                  </div>
               </div>

               {/* Gym Row */}
               <div className="flex flex-col items-start gap-1.5">
                  <span className="text-[14px] font-medium text-[#364153]">Zal</span>
                  <span className="text-[16px] leading-[24px] text-black font-medium">{selectedReview.gym_name || "FIT CLUB"}</span>
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
               {selectedReview.status === 'PENDING' && (
                 <>
                   <button 
                     onClick={() => handleAction(selectedReview.id, 'reject')}
                     disabled={isRejecting || isApproving}
                     className="flex-1 h-12 rounded-[10px] bg-[#ff004f] border border-[#ececed] text-white text-[16px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                   >
                     {isRejecting ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Rədd et"}
                   </button>
                   <button 
                     onClick={() => handleAction(selectedReview.id, 'approve')}
                     disabled={isRejecting || isApproving}
                     className="flex-1 h-12 rounded-[10px] bg-[#00B4CC] text-white text-[16px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                   >
                     {isApproving ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Təsdiq et"}
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
