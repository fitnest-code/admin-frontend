"use client";

import { useState, useEffect } from "react";
import { Copy, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep4 } from "@/lib/query/gym-query";
import { useGetAddressByCoords } from "@/lib/query/location-query";
import LocationPickerMap from "@/components/ui/location-picker-map";

export function StepAddress({ onNext }: { onNext?: () => void }) {
  const { step4Data, setStep4Data } = useGymStore();
  const [mounted, setMounted] = useState(false);

  // Koordinatlar (Başlanğıcda boş olmalıdır)
  const [coords, setCoords] = useState<{ lat: number | "", lng: number | "" }>({ 
    lat: step4Data?.lat ?? "", 
    lng: step4Data?.lng ?? "" 
  });
  const [copied, setCopied] = useState<"lat" | "lng" | null>(null);

  // Axtarış üçün state-lər
  const [searchQuery, setSearchQuery] = useState(step4Data?.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // 1. Koordinat dəyişdikcə ünvanı gətirən query (Yalnız koordinatlar olduqda)
  const shouldFetchAddress = mounted && typeof coords.lat === "number" && typeof coords.lng === "number";
  const { data: addressData, isFetching: isAddressFetching } = useGetAddressByCoords(
    typeof coords.lat === "number" ? coords.lat : 0,
    typeof coords.lng === "number" ? coords.lng : 0,
    shouldFetchAddress
  );

  // 2. Step 4 Validation
  const validateStep4 = useValidateGymStep4();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Backend-dən gələn ünvanı input-a sinxronizasiya et (yalnız ünvan tamamilə boşdursa)
  useEffect(() => {
    if (addressData?.addressText && !searchQuery && shouldFetchAddress && !step4Data) {
      setSearchQuery(addressData.addressText);
    }
  }, [addressData, searchQuery, shouldFetchAddress, step4Data]);

  // Forward Geocoding via dedicated backend proxy
  const debouncedSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Query the administrative backend forward geocoding proxy
        const res = await fetch(`/api/v1/admin/gyms/geocoding/forward?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Geocoding proxy error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);
    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (s: any) => {
    const lat = typeof s.latitude === "number" ? s.latitude : parseFloat(s.lat || 0);
    const lng = typeof s.longitude === "number" ? s.longitude : parseFloat(s.lon || 0);
    setCoords({ lat, lng });

    const suggestedText = s.addressText || s.display_name || "";
    
    // Extract custom typed numbers/house indicators missing from the map result
    const matchNumber = searchQuery.match(/\b\d+(?:\/[a-zA-Z0-9]+|-[a-zA-Z0-9]+|[a-zA-Z])?\b/);
    
    if (matchNumber && !suggestedText.includes(matchNumber[0])) {
      // Smartly insert the house number right after the street name
      const parts = suggestedText.split(',');
      parts[0] = `${parts[0].trim()} ${matchNumber[0]}`;
      setSearchQuery(parts.join(', '));
    } else {
      setSearchQuery(suggestedText);
    }
    
    setSuggestions([]);
  };

  // Kopyalama funksiyası
  const copyToClipboard = (val: number | "", which: "lat" | "lng") => {
    if (val === "") return;
    navigator.clipboard.writeText(val.toString());
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleNext = async () => {
    if (coords.lat === "" || coords.lng === "") {
      toast.error("Zəhmət olmasa xəritədən mütləq bir nöqtə seçin və ya koordinatları daxil edin");
      return;
    }

    try {
      const payload = {
        latitude: Number(coords.lat),
        longitude: Number(coords.lng)
      };
      await validateStep4.mutateAsync(payload);
      setStep4Data({
        cityId: 1,
        address: searchQuery,
        lat: Number(coords.lat),
        lng: Number(coords.lng)
      });
      onNext?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Xəta baş verdi");
    }
  };

  const isPending = validateStep4.isPending;

  if (!mounted) return null;

  // Xəritə linki: Əgər boşdursa Bakı mərkəzini göstərsin, amma datanı boş saxlasın
  const displayLat = coords.lat === "" ? 40.4093 : coords.lat;
  const displayLng = coords.lng === "" ? 49.8671 : coords.lng;


  return (
    <div className="w-full bg-white rounded-[24px] border border-[#ECECED] p-6 flex flex-col gap-6 shadow-sm">

        {/* Başlıq */}
        <div className="flex items-center justify-between pb-1 border-b border-[#ECECED]">
          <h1 className="text-lg font-bold text-[#1F2937]">Ünvan məlumatları</h1>
        </div>

        {/* Ünvan (Axtarış və Seçim) */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-[#6B7280]">Ünvan</label>
          <div className="relative">
            <input
              placeholder="Ünvanı daxil edin (Məs: Heydər Əliyev pr. 101)"
              value={isAddressFetching ? "Ünvan təyin edilir..." : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-lg px-4 py-3 text-sm font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8] transition-all"
            />
            {(isAddressFetching || isSearching) && (
              <Loader2 className="absolute right-4 top-4 animate-spin text-[#00B4D8]" size={20} />
            )}
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-[100%] left-0 right-0 z-[1000] mt-1 bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              {suggestions.map((s, i) => {
                const text = s.addressText || s.display_name || "";
                const shortText = text.split(',')[0] || text;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex flex-col gap-0.5"
                  >
                    <span className="text-slate-800">{shortText}</span>
                    <span className="text-xs text-slate-400 truncate">{text}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Koordinat Girişləri */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#6B7280]">En</label>
            <div className="flex items-center bg-[#F9FAFB] border border-[#ECECED] rounded-lg px-4 py-2.5 gap-2 focus-within:ring-1 focus-within:ring-[#00B4D8]">
              <input
                type="number"
                step="any"
                value={coords.lat}
                onChange={(e) => setCoords(p => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                className="flex-1 bg-transparent text-sm font-semibold text-[#1F2937] outline-none"
              />
              <button onClick={() => copyToClipboard(coords.lat, "lat")} type="button">
                {copied === "lat" ? <Check size={16} className="text-[#00B4D8]" /> : <Copy size={16} className="text-[#D1D5DB]" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#6B7280]">Uzunluq</label>
            <div className="flex items-center bg-[#F9FAFB] border border-[#ECECED] rounded-lg px-4 py-2.5 gap-2 focus-within:ring-1 focus-within:ring-[#00B4D8]">
              <input
                type="number"
                step="any"
                value={coords.lng}
                onChange={(e) => setCoords(p => ({ ...p, lng: parseFloat(e.target.value) || 0 }))}
                className="flex-1 bg-transparent text-sm font-semibold text-[#1F2937] outline-none"
              />
              <button onClick={() => copyToClipboard(coords.lng, "lng")} type="button">
                {copied === "lng" ? <Check size={16} className="text-[#00B4D8]" /> : <Copy size={16} className="text-[#D1D5DB]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Xəritə Sahəsi */}
        <div className="rounded-2xl overflow-hidden border border-[#ECECED] bg-gray-50">
          <LocationPickerMap
            lat={displayLat}
            lng={displayLng}
            height="450px"
            onLocationSelect={(lat, lng) => {
              setCoords({ lat, lng });
              setSearchQuery("");
            }}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              const { resetStep4Data } = useGymStore.getState();
              resetStep4Data();
              setCoords({ lat: "", lng: "" });
              setSearchQuery("");
              setSuggestions([]);
            }}
            className="h-[44px] px-8 rounded-lg border border-[#ececed] text-[#101828] text-[14px] font-medium hover:bg-slate-50 transition-colors"
          >
            Sıfırla
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleNext}
            className="w-[240px] h-[44px] rounded-lg bg-[#00B4CC] text-white text-[14px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md shadow-cyan-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "Növbəti"}
          </button>
        </div>

    </div>
  );
}