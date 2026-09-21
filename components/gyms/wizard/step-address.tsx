"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGymStore } from "@/lib/store/gym-store";
import { useValidateGymStep4 } from "@/lib/query/gym-query";
import { useGetAddressByCoords } from "@/lib/query/location-query";
import LocationPickerMap from "@/components/ui/location-picker-map";
import { AZ_CITIES, BAKI_RAYONS, isBakiCity } from "@/lib/constants/az-cities";

export function StepAddress({ onNext }: { onNext?: () => void }) {
  const { step4Data, setStep4Data } = useGymStore();
  const [mounted, setMounted] = useState(false);

  const [coords, setCoords] = useState<{ lat: number | ""; lng: number | "" }>({
    lat: step4Data?.lat ?? "",
    lng: step4Data?.lng ?? "",
  });

  const [isUpdatingFromCoords, setIsUpdatingFromCoords] = useState(false);
  const [city, setCity] = useState(step4Data?.city || "");
  const [rayon, setRayon] = useState(step4Data?.rayon || "");
  const [address, setAddress] = useState(step4Data?.address || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const shouldFetchAddress =
    mounted && typeof coords.lat === "number" && typeof coords.lng === "number" && isUpdatingFromCoords;
  const { data: addressData, isFetching: isAddressFetching } = useGetAddressByCoords(
    typeof coords.lat === "number" ? coords.lat : 0,
    typeof coords.lng === "number" ? coords.lng : 0,
    shouldFetchAddress
  );

  const validateStep4 = useValidateGymStep4();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isUpdatingFromCoords && !isAddressFetching && (addressData?.addressText || addressData?.city)) {
      const expectedLat = typeof coords.lat === "number" ? coords.lat : 0;
      const expectedLng = typeof coords.lng === "number" ? coords.lng : 0;
      const latDiff = Math.abs((addressData.latitude || 0) - expectedLat);
      const lngDiff = Math.abs((addressData.longitude || 0) - expectedLng);
      if (latDiff < 0.0001 && lngDiff < 0.0001) {
        if (addressData.city) setCity(addressData.city);
        setRayon(isBakiCity(addressData.city) ? addressData.rayon || "" : "");
        if (addressData.addressText) setAddress(addressData.addressText);
        setIsUpdatingFromCoords(false);
      }
    }
  }, [addressData, isAddressFetching, isUpdatingFromCoords, coords.lat, coords.lng]);

  const debouncedSearch = (query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
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

    let suggestedText = s.addressText || s.display_name || "";
    const matchNumber = address.match(/\b\d+(?:\/[a-zA-Z0-9]+|-[a-zA-Z0-9]+|[a-zA-Z])?\b/);
    if (matchNumber && !suggestedText.includes(matchNumber[0])) {
      const parts = suggestedText.split(",");
      parts[0] = `${parts[0].trim()} ${matchNumber[0]}`;
      suggestedText = parts.join(",");
    }

    if (s.city) setCity(s.city);
    setRayon(isBakiCity(s.city) ? s.rayon || "" : "");
    setAddress(suggestedText);
    setSuggestions([]);
  };

  const handleNext = async () => {
    if (coords.lat === "" || coords.lng === "") {
      toast.error("Zəhmət olmasa xəritədən mütləq bir nöqtə seçin və ya koordinatları daxil edin");
      return;
    }

    try {
      const payload = {
        latitude: Number(coords.lat),
        longitude: Number(coords.lng),
      };
      await validateStep4.mutateAsync(payload);
      setStep4Data({
        cityId: 1,
        city,
        rayon: isBakiCity(city) ? rayon : "",
        address,
        lat: Number(coords.lat),
        lng: Number(coords.lng),
      });
      onNext?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Xəta baş verdi");
    }
  };

  const isPending = validateStep4.isPending;
  if (!mounted) return null;

  const displayLat = coords.lat === "" ? 40.4093 : coords.lat;
  const displayLng = coords.lng === "" ? 49.8671 : coords.lng;
  const showRayon = isBakiCity(city);

  return (
    <div className="w-full bg-white rounded-[24px] border border-[#ECECED] p-6 flex flex-col gap-6 shadow-sm">
      <div className="flex items-center justify-between pb-1 border-b border-[#ECECED]">
        <h1 className="text-lg font-bold text-[#1F2937]">Ünvan məlumatları</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#6B7280]">Şəhər</label>
          <select
            value={city}
            onChange={(e) => {
              const next = e.target.value;
              setCity(next);
              if (!isBakiCity(next)) setRayon("");
            }}
            className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-lg px-4 py-3 text-sm font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8]"
          >
            <option value="">Şəhər seçin</option>
            {city && !(AZ_CITIES as readonly string[]).includes(city) ? (
              <option value={city}>{city}</option>
            ) : null}
            {AZ_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {showRayon ? (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#6B7280]">Rayon</label>
            <select
              value={rayon}
              onChange={(e) => setRayon(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-lg px-4 py-3 text-sm font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8]"
            >
              <option value="">Rayon seçin</option>
              {rayon && !(BAKI_RAYONS as readonly string[]).includes(rayon) ? (
                <option value={rayon}>{rayon}</option>
              ) : null}
              {BAKI_RAYONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 relative">
        <label className="text-sm font-medium text-[#6B7280]">Ünvan</label>
        <div className="relative">
          <input
            placeholder="Küçə / ünvan (Məs: Heydər Əliyev pr. 101)"
            value={isAddressFetching ? "Ünvan təyin edilir..." : address}
            onChange={(e) => {
              setAddress(e.target.value);
              debouncedSearch(e.target.value);
            }}
            className="w-full bg-[#F9FAFB] border border-[#ECECED] rounded-lg px-4 py-3 text-sm font-semibold text-[#1F2937] outline-none focus:border-[#00B4D8] transition-all"
          />
          {(isAddressFetching || isSearching) && (
            <Loader2 className="absolute right-4 top-4 animate-spin text-[#00B4D8]" size={20} />
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-[100%] left-0 right-0 z-[1000] mt-1 bg-white border border-[#ECECED] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {suggestions.map((s, i) => {
              const text = [s.addressText, s.rayon, s.city].filter(Boolean).join(", ") || s.display_name || "";
              const shortText = s.addressText || text.split(",")[0] || text;
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

      <div className="rounded-2xl overflow-hidden border border-[#ECECED] bg-gray-50">
        <LocationPickerMap
          lat={displayLat}
          lng={displayLng}
          height="450px"
          onLocationSelect={(lat, lng) => {
            setIsUpdatingFromCoords(true);
            setCoords({ lat, lng });
          }}
        />
      </div>

      <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            const { resetStep4Data } = useGymStore.getState();
            resetStep4Data();
            setCoords({ lat: "", lng: "" });
            setCity("");
            setRayon("");
            setAddress("");
            setSuggestions([]);
            setIsUpdatingFromCoords(false);
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
